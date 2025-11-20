import axios from 'axios';

// function which logs a user in and returns an access token
async function login(email, password) {

  try {
    const response = await axios.post('http://localhost:5005/user/auth/login', 
    {
      email: email,
      password: password
    });

    return response.data;

  } catch (err) {
    console.error('Error logging user in:', err);
    return;
  }

}

// function which registers a user in and returns an access token
async function registerUser(email, password, name) {

  try {
    const response = await axios.post('http://localhost:5005/user/auth/register', 
    {
      email: email,
      password: password,
      name: name
    });

    return response.data;

  } catch (err) {
    console.error('Error registering user:', err);
    return;
  }

}

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

// function which makes an api call, which takes listing info to create a new listing to host 
async function createListing(token, bodyObj) {

  if (!token) return;

  try {
    const response = await axios.post('http://localhost:5005/listings/new', 
    bodyObj,
    {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;

  } catch (err) {
    console.error('Error creating listing:', err);

    return;
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

// function which makes an api call to post a new listing review 
async function postListingReview(token, listingId, bookingId, review) {

  console.log(review);
  console.log(token);
  console.log(listingId);
  console.log(bookingId);


  if (!token) return;

  try {
    const response = await axios.put(`http://localhost:5005/listings/${listingId}/review/${bookingId}`, 
    {review: review},
    {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;

  } catch (err) {
    console.error('Error posting review:', err);

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

// function which takes in a date range and total price to create a booking for a listing
async function createBooking(token, listingId, dateRange, totalPrice) {

  if (!token) return;

  console.log(dateRange, totalPrice);

  try {
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

    return response.data;

  } catch (err) {
    console.error('Error creating booking:', err);
    return;
  }

} 


export default { 
  login, registerUser,
  fetchAllListings, createListing, getListingDetails, deleteListing, publishListing, unpublishListing, postListingReview,
  fetchAllBookings, createBooking 
}

