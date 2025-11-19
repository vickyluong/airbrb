import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FormControl, Rating, Select, MenuItem, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Box, Typography, Slider, Alert, Snackbar, FormControlLabel, Checkbox } from '@mui/material';

function MyBookings(props) {
    const token = props.token;
    const user = localStorage.getItem('email');
    const [detailedBookings, setDetailedBookings] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);

    const [bookings, setBookings] = useState([]);
    const [reviewComment, setReviewComment] = useState("");
    const [reviewRating, setReviewRating] = useState(0);
    const [currentBookingId, setCurrentBookingId] = useState(null);
    const [currentListingId, setCurrentListingId] = useState(null);

    const [errorMessage, setErrorMessage] = useState('');
    const [open, setOpen] = useState(false);

    // fetch all the bookings
    async function getAllBookings() {

        try {
            const response = await axios.get('http://localhost:5005/bookings', {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            setBookings(response.data.bookings);
        } catch (error) {
            console.log(error);
        }
    }

    async function uploadReview() {
        try {
            const response = await axios.put(
                `http://localhost:5005/listings/${currentListingId}/review/${currentBookingId}`,
                { 
                    review: {
                        comment: reviewComment,  
                        score: reviewRating,
                        publisher: user
                    }
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            );
    
            getAllBookings(); 
    
            setDialogOpen(false);
            setReviewComment("");
            setReviewRating(0);
            setCurrentBookingId(null);
    
        } catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
        getAllBookings();
    }, [])

    useEffect(() => {
        async function fetchDetails() {
          const userBookings = bookings.filter(booking => booking.owner === user);

        //   console.log(userBookings);
    
          const detailed = await Promise.all(
            userBookings.map(async booking => {
              const response = await axios.get(`http://localhost:5005/listings/${booking.listingId}`);
              return { ...booking, listing: response.data.listing }; 
            })
          );
    
          setDetailedBookings(detailed);
        }
    
        if (bookings.length > 0) {
          fetchDetails();
        }
    }, [bookings]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const pastBookings = detailedBookings.filter(
        b => new Date(b.dateRange.end) < today && b.status === 'accepted'
    );
    
    const upcomingBookings = detailedBookings.filter(
        b => new Date(b.dateRange.start) >= today && b.status !== 'declined'
    );

    return (
        <>
        <h2>My bookings !!</h2>
        <h3>Upcoming bookings</h3>
        <hr />
      {upcomingBookings.map(b => (
        <div key={b.id}>
          <h4>{b.listing.title}</h4>
        {b.listing.thumbnail && (
            <>
              {b.listing.thumbnail.includes('youtube.com') || b.listing.thumbnail.includes('youtu.be') ? (
                <iframe
                  width="300"
                  height="200"        
                  src={b.listing.thumbnail.replace('watch?v=', 'embed/')}
                  title={b.listing.title}
                  allowFullScreen
                ></iframe>
              ) : (
                <img src={b.listing.thumbnail} alt={b.listing.title} width="300" />
              )}
            </>
          )}
          <p>Status: {b.status}</p>
          <p>
            {b.dateRange.start} - {b.dateRange.end}
          </p>
          {/* show review button only if accepted */}
            {b.status === "accepted" && (
            <Button variant="contained" 
            onClick={() => {
                setCurrentBookingId(b.id);
                setCurrentListingId(b.listingId); 
                setDialogOpen(true);
              }}>
                Leave a review
            </Button>
            )}
          <hr />
        </div>
      ))}

      <h3>Past bookings</h3>
      <hr />
        {pastBookings.map(b => (
        <div key={b.id}>
          <h4>{b.listing.title}</h4>
          {b.listing.thumbnail && (
            <img src={b.listing.thumbnail} alt={b.listing.title} width="300" />
          )}
          <p>Status: {b.status}</p>
          <p>
            {b.dateRange.start} - {b.dateRange.end}
          </p>
          <Button variant="contained" 
            onClick={() => {
                setCurrentBookingId(b.id);
                setCurrentListingId(b.listingId); 
                setDialogOpen(true);
              }}>
                Leave a review
            </Button>
          <hr />
        </div>
        ))}

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth> 
                <DialogTitle>Review:</DialogTitle>
                <DialogContent>
                <Rating
                name="rating"
                value={reviewRating}
                onChange={(e, newValue) => setReviewRating(newValue)}
                size="large"
                />

                <TextField
                label="Comment"
                multiline
                rows={4}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                fullWidth
                sx={{ mt: 2 }}
                />
                </DialogContent>
                <DialogActions>
                <Button variant="contained" onClick={uploadReview}>
                Upload review
                </Button>
                <Button variant="outlined" onClick={() => setDialogOpen(false)}>
                Cancel
                </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default MyBookings;