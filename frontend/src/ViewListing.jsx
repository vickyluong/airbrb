import { useState, useEffect } from 'react';
import axios from 'axios';

function ViewListing(props) {

  async function viewSelectListing(listingId) {
    try {
      const response = await axios.get(`http://localhost:5005/listings/${listingId}`);
    } catch(error) {
      console.log(error);
    }
  }

  return (
    <>
      <hr/>
      {listings.map((listing) => (
        <div key={listing.id}>
          <h3>{listing.title}</h3>
          <p>Property type: {listing.metadata.propertyType}</p>
          <p>Beds: {
                listing.metadata.bedrooms.reduce(
                (sum, bedroom) => sum + Number(bedroom.beds || 0),
                0
                )
            }</p>
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
          <hr />
        </div>
      ))}

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

export default ViewListing