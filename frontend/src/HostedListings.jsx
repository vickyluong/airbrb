import { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { Rating, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Box, Alert, Snackbar } from '@mui/material';
import axios from 'axios';

function HostedListings(props) {

  // store the user's listings 
  const [listings, setListings] = useState([]);
  const userEmail = localStorage.getItem('email');
  const token = props.token;

  const [publish, setPublish] = useState(false);
  const [selectedListingId, setSelectedListingId] = useState(null);
  const [availabilityRanges, setAvailabilityRanges] = useState([{ start: '', end: '' }]);

  const [errorMessage, setErrorMessage] = useState('');
  const [open, setOpen] = useState(false);

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
  }, []);

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
      <hr/>
      {listings.map((listing) => (
        <div key={listing.id}>
          <h3><Link to={`/edit-listing/${listing.id}`}>{listing.title}</Link></h3>
          <p>Property type: {listing.metadata.propertyType}</p>
          <p>Beds: {listing.metadata.bedrooms.reduce((sum, bedroom) => sum + bedroom.beds, 0)}</p>
          <p>Bathrooms: {listing.metadata.bathrooms}</p>
          
          {listing.thumbnail && (
            <>
              {listing.thumbnail.includes('youtube.com') || listing.thumbnail.includes('youtu.be') ? (
                <iframe
                  width="300"
                  height="200"        
                  src={listing.thumbnail.replace('watch?v=', 'embed/')}
                  title={listing.title}
                  allowFullScreen
                ></iframe>
              ) : (
                <img src={listing.thumbnail} alt={listing.title} width="300" />
              )}
            </>
          )}

          <p>Total reviews: {listing.reviews.length}</p>
          <p>Rating: </p><Rating name={`rating-${listing}`}  defaultValue={0} precision={0.5} readOnly />
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
          <Button>Delete</Button>
          <hr />
        </div>
      ))}

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
    </>
  )
}

export default HostedListings