import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { TextField, Button, Alert, Snackbar, Typography, Box } from '@mui/material';
import axios from 'axios';

function BookingScreen(props) {
  const { listingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const token = props.token || null;

  const [listing, setListing] = useState(null);

  const getSearchedDates = () => {
    const queryParams = new URLSearchParams(location.search);
    const storedRange = (() => {
      try {
        return JSON.parse(localStorage.getItem('lastSearchDateRange') || '{}');
      } catch (error) {
        console.log(error);
        return {};
      }
    })();

    return {
      startDate:
        location.state?.startDate ||
        location.state?.start ||
        queryParams.get('startDate') ||
        storedRange?.startDate ||
        '',
      endDate:
        location.state?.endDate ||
        location.state?.end ||
        queryParams.get('endDate') ||
        storedRange?.endDate ||
        '',
    };
  };

  const searchedDates = getSearchedDates();
  const [startDate, setStartDate] = useState(searchedDates.startDate);
  const [endDate, setEndDate] = useState(searchedDates.endDate);
  const [nights, setNights] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  const [errorMessage, setErrorMessage] = useState('');
  const [open, setOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const newDates = getSearchedDates();
    if (location.state?.startDate || location.state?.endDate || 
        new URLSearchParams(location.search).get('startDate') || 
        new URLSearchParams(location.search).get('endDate')) {
      if (newDates.startDate) {
        setStartDate(newDates.startDate);
      }
      if (newDates.endDate) {
        setEndDate(newDates.endDate);
      }
    }
  }, [location.state, location.search]);

  useEffect(() => {
    async function viewSelectListing() {
      if (!listingId) {
        return;
      }

      try {
        const response = await axios.get(`http://localhost:5005/listings/${listingId}`);
        setListing(response.data.listing);
      } catch (error) {
        setErrorMessage(error.response?.data?.error || 'Unable to load listing');
        setOpen(true);
      }
    };

    viewSelectListing();
  }, [listingId]);

  useEffect(() => {
    if (!token) {
      setErrorMessage('You must be logged in to make a booking');
      setOpen(true);
      navigate('/login');
      return;
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      const timeDiff = end.getTime() - start.getTime();
      const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

      if (daysDiff <= 0) {
        setNights(0);
        setTotalPrice(0);
      } else {
        setNights(daysDiff);
        if (listing?.price) {
          const nightlyPrice = Number(listing.price);
          setTotalPrice(nightlyPrice * daysDiff);
        }
      }
    } else {
      setNights(0);
      setTotalPrice(0);
    }
  }, [startDate, endDate, listing, token, navigate]);

  const withinAvailabilityCheck = (startDate, endDate, availability) => {
    if (!availability || !Array.isArray(availability) || availability.length === 0) {
      return false;
    }

    const bookingStart = new Date(startDate);
    bookingStart.setHours(0, 0, 0, 0);
    const bookingEnd = new Date(endDate);
    bookingEnd.setHours(0, 0, 0, 0);

    return availability.some((range) => {
      const rangeStart = new Date(range.start);
      rangeStart.setHours(0, 0, 0, 0);
      const rangeEnd = new Date(range.end);
      rangeEnd.setHours(0, 0, 0, 0);

      return bookingStart >= rangeStart && bookingEnd <= rangeEnd;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!startDate || !endDate) {
      setErrorMessage('Please select both start and end dates');
      setOpen(true);
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      setErrorMessage('End date must be after start date');
      setOpen(true);
      return;
    }

    if (nights <= 0) {
      setErrorMessage('Booking must be at least 1 night');
      setOpen(true);
      return;
    }

    if (!withinAvailabilityCheck(startDate, endDate, listing?.availability)) {
      setErrorMessage('Selected dates are not available. Please check the listing availability ranges.');
      setOpen(true);
      return;
    }

    try {
      const dateRange = {
        start: startDate,
        end: endDate,
      };

      const response = await axios.post(
        `http://localhost:5005/bookings/new/${listingId}`,
        {
          dateRange,
          totalPrice,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccessMessage(`Booking confirmed! Booking ID: ${response.data.bookingId}`);
      setShowSuccess(true);
      
      setStartDate('');
      setEndDate('');
      setNights(0);
      setTotalPrice(0);

      setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
    } catch (error) {
      setErrorMessage(error.response?.data?.error);
      setOpen(true);
    }
  };

  if (!listing) {
    return null;
  }
}

export default BookingScreen