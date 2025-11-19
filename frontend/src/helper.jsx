import axios from 'axios';

// function which fetches and returns all listings
async function fetchAllListings(token) {

  if (!token) return;

  try {
    const response = await axios.get('http://localhost:5005/listings', {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data.listings || [];

  } catch (err) {
    console.error('Error fetching listings:', err);
    return [];
  }

}

// function which fetches and returns the details of a listing
async function getListingDetails(token, listingId) {

  if (!token) return;

  try {
    const response = await axios.get(`http://localhost:5005/listings/${listingId}`, 
    {
      headers: { Authorization: `Bearer ${token}` },
    });
    //console.log(response.data);
    return response.data;

  } catch (err) {
    console.error('Error fetching listing details:', err);
    return;
  }

}

// function which makes an api call to publish a listing
async function publishListing(token, listingId, availability) {

  if (!token) return;

  try {
    await axios.put(`http://localhost:5005/listings/publish/${listingId}`, 
    { availability },
    {
      headers: { Authorization: `Bearer ${token}` },
    });
    return true;

  } catch (err) {
    console.error('Error publishing listing:', err);
    return false;
  }

}

// function which makes an api call to unpublish a listing
async function unpublishListing(token, listingId) {

  if (!token) return;

  try {
    await axios.put(`http://localhost:5005/listings/unpublish/${listingId}`, 
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    });
    return true;

  } catch (err) {
    console.error('Error unpublishing listing:', err);
    return false;
  }

}

// function which makes an api call to delete a listing
async function deleteListing(token, listingId) {

  if (!token) return;

  try {
    await axios.delete(`http://localhost:5005/listings/${listingId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return;

  } catch (err) {
    console.error('Error deleting listing:', err);
    return;
  }

}

// function which fetches and returns all bookings 
async function fetchAllBookings(token) {
  
  if (!token) return;

  try {
    const response = await axios.get('http://localhost:5005/bookings', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.bookings || [];

  } catch (err) {
    console.error('Error fetching bookings:', err);
    return [];
  }

}

export default { 
  fetchAllListings, getListingDetails, deleteListing, publishListing, unpublishListing, fetchAllBookings 
}

