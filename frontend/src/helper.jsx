import axios from 'axios';

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

export default fetchAllBookings

