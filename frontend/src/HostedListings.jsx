import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Rating, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Box, Alert, Snackbar } from '@mui/material';
import axios from 'axios';

function HostedListings(props) {

  const navigate = useNavigate();

  // store the user's listings 
  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const userEmail = localStorage.getItem('email');
  const token = props.token;

  const [publish, setPublish] = useState(false);
  const [selectedListingId, setSelectedListingId] = useState(null);
  const [availabilityRanges, setAvailabilityRanges] = useState([{ start: '', end: '' }]);

  const [errorMessage, setErrorMessage] = useState('');
  const [open, setOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
//   const [averageRating, setAverageRating] = useState(0);

  async function getListings() {
    try {
      const response = await axios.get('http://localhost:5005/listings');

      const allListings = Object.entries(response.data.listings).map(([id, listing]) => ({
        id,
        ...listing
      }));
      const userListings = allListings.filter(l => l.owner === userEmail);

      // go through user's listings and get the details for each, into a new array
      const detailedListings = await Promise.all(
        userListings.map(async (listing) => {
          const response = await axios.get(`http://localhost:5005/listings/${listing.id}`);
          return { id: listing.id, ...response.data.listing };
        })
      )

      setListings(detailedListings);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getListings();
    fetchBookings();
  }, []);

  async function fetchBookings() {
    if (!token) {
      return;
    }

    try {
      const response = await axios.get('http://localhost:5005/bookings', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setBookings(response.data.bookings || []);
    } catch (error) {
      console.log(error);
    }
  }

  const getBookingsForListing = (listingId) => {
    return bookings.filter(booking => String(booking.listingId) === String(listingId));
  };

  const handleAcceptBooking = async (bookingId) => {
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
      fetchBookings();
    } catch (error) {
      setErrorMessage(error.response?.data?.error);
      setOpen(true);
    }
  };

  const handleDeclineBooking = async (bookingId) => {
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
      fetchBookings();
    } catch (error) {
      setErrorMessage(error.response?.data?.error);
      setOpen(true);
    }
  };

  async function unpublishListing(listingId) {
    try {
      await axios.put(
        `http://localhost:5005/listings/unpublish/${listingId}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );
      setSuccessMessage('Listing unpublished successfully!');
      setShowSuccess(true);
      getListings();
    } catch (error) {
      setErrorMessage(error.response?.data?.error);
      setOpen(true);
    }
  };

  async function deleteListing(listingId) {
    try {
      const listing = listings.find(l => l.id === listingId);
      if (listing && listing.published) {
        try {
          await axios.put(
            `http://localhost:5005/listings/unpublish/${listingId}`,
            {},
            {
              headers: {
                'Authorization': `Bearer ${token}`,
              }
            }
          );
        } catch (error) {
          console.log(error);
        }
      }

      await axios.delete(`http://localhost:5005/listings/${listingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      setSuccessMessage('Listing deleted successfully!');
      setShowSuccess(true);
      getListings();
    } catch (error) {
      setErrorMessage(error.response?.data?.error);
      setOpen(true);
    }
  }

  const handleOpenPublish = (listingId) => {
    setSelectedListingId(listingId);
    setAvailabilityRanges([{ start: '', end: ''}]);
    setPublish(true);
  }

  const handleClosePublish = () => {
    setPublish(false);
    setSelectedListingId(null);
    setAvailabilityRanges([{ start: '', end: ''}]);
    setErrorMessage('');
  }

  const addAvailabilityRange = () => {
    setAvailabilityRanges([...availabilityRanges, { start: '', end: '' }]);
  };

  const removeAvailabilityRange = (index) => {
    if (availabilityRanges.length > 1) {
      setAvailabilityRanges(availabilityRanges.filter((_, i) => i !== index));
    }
  };

  const updateAvailabilityRange = (index, field, value) => {
    const updated = [...availabilityRanges];
    updated[index][field] = value;
    setAvailabilityRanges(updated);
  };

  const handlePublish = async () => {
    const validRanges = availabilityRanges.filter(range => range.start && range.end);
    
    if (validRanges.length === 0) {
      setErrorMessage('At least one availability date range is required');
      setOpen(true);
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < validRanges.length; i++) {
      const start = new Date(validRanges[i].start);
      start.setHours(0, 0, 0, 0);
      const end = new Date(validRanges[i].end);
      end.setHours(0, 0, 0, 0);
      
      if (start < today) {
        setErrorMessage(`Start date must be from today onwards`);
        setOpen(true);
        return;
      }
      
      if (start >= end) {
        setErrorMessage(`The end date must be after start date`);
        setOpen(true);
        return;
      }
    }

    const availability = validRanges.map(range => ({
      start: range.start,
      end: range.end
    }));

    try {
      await axios.put(
        `http://localhost:5005/listings/publish/${selectedListingId}`,
        { availability },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );
      handleClosePublish();
      getListings();
    } catch (error) {
      setErrorMessage(error.response?.data?.error);
      setOpen(true);
    }
  };

return (
    <>
      <h2>Hosted Listings</h2>
      <hr />
      {listings.map(listing => {
        const reviewRatings = (listing.reviews || []).map(r => Number(r.score ?? 0));
        const averageRating = reviewRatings.length ? reviewRatings.reduce((sum, r) => sum + r, 0) / reviewRatings.length : 0;

        return (
          <div key={listing.id} style={{ marginBottom: '40px' }}>
            <h3>{listing.title}</h3>
            <p>Property type: {listing.metadata.propertyType}</p>
            <p>
              Beds: {listing.metadata.bedrooms.reduce((sum, bedroom) => sum + Number(bedroom.beds || 0), 0)}
            </p>
            <p>Bathrooms: {listing.metadata.bathrooms}</p>

            {listing.thumbnail && (
              listing.thumbnail.includes('youtube.com') || listing.thumbnail.includes('youtu.be') ? (
                <iframe
                  width="300"
                  height="200"
                  src={listing.thumbnail.replace('watch?v=', 'embed/')}
                  title={listing.title}
                  allowFullScreen
                ></iframe>
              ) : (
                <img src={listing.thumbnail} alt={listing.title} width="300" />
              )
            )}

            <p>Total reviews: {listing.reviews.length}</p>
            <Rating name={`rating-${listing.id}`} value={averageRating} precision={0.1} readOnly />
            <p>Price (per night): ${listing.price}</p>
            <p>Status: {listing.published ? 'Published' : 'Unpublished'}</p>

            {!listing.published && (
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => handleOpenPublish(listing.id)}
              >
                Publish
              </Button>
            )}
            {listing.published && (
              <Button 
                variant="contained" 
                color="warning"
                onClick={() => unpublishListing(listing.id)}
                style={{ marginRight: '10px' }}
              >
                Unpublish
              </Button>
            )}
            <Button variant="outlined" onClick={() => navigate(`/edit-listing/${listing.id}`)}>Edit</Button>
            <Button variant="outlined" onClick={() => deleteListing(listing.id)}>Delete</Button>

            {listing.published && (
              <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
                <h4>Bookings for this listing</h4>
                {getBookingsForListing(listing.id).length === 0 ? (
                  <p>No bookings yet.</p>
                ) : (
                  getBookingsForListing(listing.id).map(booking => (
                    <div key={booking.id} style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '3px' }}>
                      <p><strong>Booking #{booking.id}</strong></p>
                      <p>Guest: {booking.owner}</p>
                      <p>Status: <span style={{ fontWeight: 'bold', color: booking.status === 'accepted' ? 'green' : booking.status === 'declined' ? 'red' : 'orange', marginLeft: '5px' }}>{booking.status.toUpperCase()}</span></p>
                      {booking.dateRange?.start && booking.dateRange?.end && <p>Dates: {new Date(booking.dateRange.start).toLocaleDateString()} — {new Date(booking.dateRange.end).toLocaleDateString()}</p>}
                      {booking.totalPrice !== undefined && <p>Total price: ${Number(booking.totalPrice).toFixed(2)}</p>}
                      {booking.status === 'pending' && (
                        <div style={{ marginTop: '10px' }}>
                          <Button variant="contained" color="success" size="small" onClick={() => handleAcceptBooking(booking.id)} style={{ marginRight: '10px' }}>Accept</Button>
                          <Button variant="contained" color="error" size="small" onClick={() => handleDeclineBooking(booking.id)}>Decline</Button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
            <hr />
          </div>
        );
      })}

      <Dialog open={publish} onClose={handleClosePublish} maxWidth="sm" fullWidth>
        <DialogTitle>Publish Listing - Set Availability</DialogTitle>
        <DialogContent>
          <p>Add at least one availability date range. You can add multiple ranges.</p>
          <Box sx={{ marginTop: 2 }}>
            {availabilityRanges.map((range, index) => (
              <Box key={index} sx={{ marginBottom: 2, padding: 2, borderRadius: 1 }}>
                <h4>Availability Range {index + 1}</h4>
                <TextField
                  label="Start Date"
                  type="date"
                  value={range.start}
                  onChange={(event) => updateAvailabilityRange(index, 'start', event.target.value)}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: new Date().toISOString().split('T')[0] }}
                  fullWidth
                  required
                  sx={{ marginBottom: 2 }}
                />
                <TextField
                  label="End Date"
                  type="date"
                  value={range.end}
                  onChange={(event) => updateAvailabilityRange(index, 'end', event.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  required
                  sx={{ marginBottom: 2 }}
                />
                {availabilityRanges.length > 1 && (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => removeAvailabilityRange(index)}
                  >
                    Remove Range
                  </Button>
                )}
              </Box>
            ))}
            <Button variant="outlined" onClick={addAvailabilityRange}>
              Add Another Range
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePublish}>Cancel</Button>
          <Button onClick={handlePublish} variant="contained" color="primary">
            Publish Listing
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={open}
        autoHideDuration={5000}
        onClose={() => setOpen(false)}
      >
        <Alert severity="error" onClose={() => setOpen(false)}>{errorMessage}</Alert>
      </Snackbar>

      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={showSuccess}
        autoHideDuration={5000}
        onClose={() => setShowSuccess(false)}
      >
        <Alert severity="success" onClose={() => setShowSuccess(false)}>{successMessage}</Alert>
      </Snackbar>
    </>
  );
}

export default HostedListings