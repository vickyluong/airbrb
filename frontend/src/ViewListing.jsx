import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Alert, Snackbar } from '@mui/material';
import axios from 'axios';

function ViewListing(props) {
  const { listingId } = useParams();
  const location = useLocation();
  const token = props.token || null;
  const [listing, setListing] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [open, setOpen] = useState(false);
  
  const [userBookings, setUserBookings] = useState([]);
  const [searchDateRange, setSearchDateRange] = useState({ startDate: null, endDate: null });

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const storedRange = (() => {
      try {
        return JSON.parse(localStorage.getItem('lastSearchDateRange') || '{}');
      } catch (err) {
        console.log(err);
        return {};
      }
    })();

    const detectRange = {
      startDate:
        location.state?.startDate ||
        location.state?.start ||
        queryParams.get('startDate') ||
        storedRange?.startDate ||
        null,
      endDate:
        location.state?.endDate ||
        location.state?.end ||
        queryParams.get('endDate') ||
        storedRange?.endDate ||
        null,
    };

    setSearchDateRange(detectRange);
  }, [location]);

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
    async function fetchUserBookings() {
      if (!token) {
        setUserBookings([]);
        return;
      }

      try {
        const response = await axios.get('http://localhost:5005/bookings', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const email = localStorage.getItem('email');
        const bookingMatches =
          response.data.bookings?.filter(
            (booking) =>
              String(booking.listingId) === String(listingId) && booking.owner === email
          ) || [];
        setUserBookings(bookingMatches);
      } catch (error) {
        console.log(error);
      }
    };

    fetchUserBookings();
  }, [token, listingId]);

  const formattedAddress = listing?.address
    ? [
        listing.address.line1,
        listing.address.line2,
        listing.address.city,
        listing.address.state,
        listing.address.postcode,
        listing.address.country,
      ]
        .filter(Boolean)
        .join(', ')
    : 'Address unavailable';

  const amenityList = listing?.metadata?.amenities || [];
  const reviews = listing?.reviews || [];

  const totalBedrooms = listing?.metadata?.bedrooms?.length || 0;

  const totalBeds =
    listing?.metadata?.bedrooms?.reduce(
      (sum, b) => sum + Number(b?.beds || 0),
      0
    ) || 0;

  const totalBathrooms = listing?.metadata?.bathrooms ?? 'N/A';
  const propertyType = listing?.metadata?.propertyType || 'N/A';

  const propertyImages = listing
    ? [
        ...(listing.thumbnail ? [{ src: listing.thumbnail }] : []),
        ...(listing.metadata?.images?.map((img, i) => ({
          src: img,
          label: `Image ${i + 1}`,
        })) || []),
      ]
    : [];

  const reviewRatings = (listing?.reviews || [])
    .map((r) => Number(r?.rating))
    .filter((r) => !Number.isNaN(r));

  const averageRating =
    reviewRatings.length > 0
      ? (
          reviewRatings.reduce((sum, rating) => sum + rating, 0) /
          reviewRatings.length
        ).toFixed(1)
      : null;

  let stayDetails = null;

  if (listing?.price) {
    const nightlyPrice = Number(listing.price);

    const { startDate, endDate } = searchDateRange || {};

    if (!startDate || !endDate) {
      stayDetails = {
        label: 'Price (per night)',
        amount: nightlyPrice,
        helper: null,
      };
    } else {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const msPerNight = 1000 * 60 * 60 * 24;

      let nights = Math.ceil((end - start) / msPerNight);
      if (nights <= 0 || Number.isNaN(nights)) nights = 1;

      const total = nightlyPrice * nights;

      stayDetails = {
        label: 'Total Price',
        amount: total,
      };
    }
  }

  if (!listing) {
    return null;
  }
}

export default ViewListing