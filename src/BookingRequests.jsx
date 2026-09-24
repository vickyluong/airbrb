import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, Snackbar } from '@mui/material';
import axios from 'axios';
import api from './helper.jsx';

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
        const [listingResponse, allBookings] = await Promise.all([
          api.getListingDetails(token, listingId),
          api.fetchAllBookings(token),
        ]);

        setListing({ id: listingId, ...listingResponse });
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
      const allBookings = await api.fetchAllBookings(token);
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
      await api.acceptBooking(token, bookingId);

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
      await api.deleteBooking(token, bookingId);

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

  return (
    <>
      <h2>Booking Requests</h2>
      {listing && (
        <>
          <h3>{listing.title}</h3>
          <p>Status: {listing.published ? 'Published' : 'Unpublished'}</p>
          <div
            style={{
              marginTop: '20px',
              padding: '15px',
              border: '1px solid #ccc',
              borderRadius: '8px',
              backgroundColor: '#fafafa'
            }}
          >
            <h4>Listing overview</h4>
            <p>
              Online for:{' '}
              {listedDaysOnline !== null && postedOnDate
                ? `${listedDaysOnline} day${listedDaysOnline === 1 ? '' : 's'} (since ${postedOnDate.toLocaleDateString()})`
                : 'Unknown'}
            </p>
            <p>Accepted booking days in {currentYear}: {totalDaysBooked}</p>
            <p>Total profit in {currentYear}: ${totalProfit.toFixed(2)}</p>
          </div>
        </>
      )}
      <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
        <h4>Booking request history</h4>
        <p>All requests for this listing with their latest status.</p>
        {bookings.length === 0 ? (
          <p>No bookings yet.</p>
        ) : (
          bookings.map((booking) => (
            <div
              key={booking.id}
              style={{
                marginBottom: '15px',
                padding: '10px',
                backgroundColor: '#f9f9f9',
                borderRadius: '3px'
              }}
            >
              <p><strong>Booking #{booking.id}</strong></p>
              <p>Guest: {booking.owner}</p>
              <p>
                Status:
                <span
                  style={{
                    fontWeight: 'bold',
                    color: booking.status === 'accepted'
                      ? 'green'
                      : booking.status === 'declined'
                        ? 'red'
                        : 'orange',
                    marginLeft: '5px'
                  }}
                >
                  {booking.status.toUpperCase()}
                </span>
              </p>
              {booking.dateRange?.start && booking.dateRange?.end && (
                <p>
                  Dates: {new Date(booking.dateRange.start).toLocaleDateString()} — {new Date(booking.dateRange.end).toLocaleDateString()}
                </p>
              )}
              {booking.totalPrice !== undefined && (
                <p>Total price: ${Number(booking.totalPrice).toFixed(2)}</p>
              )}
              {booking.status === 'pending' && (
                <div style={{ marginTop: '10px' }}>
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    name="accept-booking-button"
                    onClick={() => acceptBooking(booking.id)}
                    style={{ marginRight: '10px' }}
                  >
                    Accept
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    name="decline-booking-button"
                    onClick={() => declineBooking(booking.id)}
                  >
                    Decline
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
      <Button variant="text" onClick={() => navigate('/hosted-listings')} style={{ marginBottom: '20px' }}>
        ← Back to Hosted Listings
      </Button>

      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={showError}
        autoHideDuration={5000}
        onClose={() => setShowError(false)}
      >
        <Alert severity="error" onClose={() => setShowError(false)}>
          {errorMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={showSuccess}
        autoHideDuration={5000}
        onClose={() => setShowSuccess(false)}
      >
        <Alert severity="success" onClose={() => setShowSuccess(false)}>
          {successMessage}
        </Alert>
      </Snackbar>
    </>
  )
}

export default BookingRequests;

