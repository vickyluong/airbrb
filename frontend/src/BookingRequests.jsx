import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, Snackbar } from '@mui/material';
import axios from 'axios';

function BookingRequests(props) {
  const navigate = useNavigate();
  const { listingId } = useParams();
  const token = props.token;

  const [listing, setListing] = useState(null);
  const [bookings, setBookings] = useState([]);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [listingResponse, bookingsResponse] = await Promise.all([
          axios.get(`http://localhost:5005/listings/${listingId}`),
          axios.get('http://localhost:5005/bookings', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        setListing({ id: listingId, ...listingResponse.data.listing });
        const allBookings = bookingsResponse.data.bookings || [];
        setBookings(allBookings.filter(
          (booking) => String(booking.listingId) === String(listingId)
        ));
      } catch (error) {
        setErrorMessage(error.response?.data?.error);
        setShowError(true);
      }
    }

    if (token && listingId) {
      loadData();
    }
  }, [token, listingId]);

  const refreshBookings = async () => {
    try {
      const bookingsResponse = await axios.get('http://localhost:5005/bookings', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const allBookings = bookingsResponse.data.bookings || [];
      setBookings(allBookings.filter(
        (booking) => String(booking.listingId) === String(listingId)
      ));
    } catch (error) {
      setErrorMessage(error.response?.data?.error);
      setShowError(true);
    }
  };

  const acceptBooking = async (bookingId) => {
    try {
      await axios.put(
        `http://localhost:5005/bookings/accept/${bookingId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSuccessMessage('Booking accepted successfully!');
      setShowSuccess(true);
      refreshBookings();
    } catch (error) {
      setErrorMessage(error.response?.data?.error);
      setShowError(true);
    }
  };

  const declineBooking = async (bookingId) => {
    try {
      await axios.put(
        `http://localhost:5005/bookings/decline/${bookingId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSuccessMessage('Booking declined successfully!');
      setShowSuccess(true);
      refreshBookings();
    } catch (error) {
      setErrorMessage(error.response?.data?.error);
      setShowError(true);
    }
  };

  const today = new Date();
  const currentYear = today.getFullYear();
  const yearStart = new Date(currentYear, 0, 1);
  const nextYearStart = new Date(currentYear + 1, 0, 1);
  const msPerDay = 1000 * 60 * 60 * 24;

  const getDaysWithinYear = (startString, endString) => {
    if (!startString || !endString) {
      return 0;
    }
    const start = new Date(startString);
    const end = new Date(endString);

    if (
      Number.isNaN(start.valueOf()) ||
      Number.isNaN(end.valueOf()) ||
      end <= start ||
      end <= yearStart ||
      start >= nextYearStart
    ) {
      return 0;
    }

    const clampedStart = start < yearStart ? new Date(yearStart) : start;
    const clampedEnd = end > nextYearStart ? new Date(nextYearStart) : end;
    return Math.max(0, Math.round((clampedEnd - clampedStart) / msPerDay));
  };

  const acceptedBookings = bookings.filter((booking) => (
    booking.status === 'accepted' &&
    getDaysWithinYear(booking.dateRange?.start, booking.dateRange?.end) > 0
  ));

  const totalDaysBooked = acceptedBookings.reduce(
    (sum, booking) => sum + getDaysWithinYear(booking.dateRange?.start, booking.dateRange?.end),
    0
  );

  const totalProfit = acceptedBookings.reduce((sum, booking) => {
    const daysWithinYear = getDaysWithinYear(booking.dateRange?.start, booking.dateRange?.end);
    if (daysWithinYear === 0) {
      return sum;
    }
    if (booking.totalPrice !== undefined && booking.totalPrice !== null) {
      return sum + Number(booking.totalPrice);
    }
    const nightlyRate = Number(listing?.price ?? 0);
    return sum + nightlyRate * daysWithinYear;
  }, 0);

  const postedOnDateString = listing?.postedOn || listing?.publishedOn || listing?.createdAt;
  const postedOnDate = postedOnDateString ? new Date(postedOnDateString) : null;
  const listedDaysOnline = postedOnDate && !Number.isNaN(postedOnDate.valueOf())
    ? Math.max(0, Math.floor((today - postedOnDate) / msPerDay))
    : null;

  if (!token) {
    return (
      <div>
        <p>You must be logged in to view booking requests.</p>
        <Button variant="contained" onClick={() => navigate('/login')}>
          Go to Login
        </Button>
      </div>
    );
  }
}

export default BookingRequests;

