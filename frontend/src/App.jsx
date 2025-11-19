import { useEffect, useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import axios from 'axios';

import Register from './Register.jsx';
import Login from './Login.jsx';
import HostedListings from './HostedListings.jsx';
import ListingsScreen from './ListingsScreen.jsx';
import CreateListing from './CreateListing.jsx';
import EditListing from './EditListing.jsx';
import ViewListing from './ViewListing.jsx';
import MyBookings from './MyBookings.jsx';
import BookingScreen from './BookingScreen.jsx';
import StarReviewScreen from './StarReviewScreen.jsx';
import BookingRequests from './BookingRequests.jsx';
import Notifications from './Notifications.jsx';

function App() {
  const [token, setToken] = useState(undefined);
  const navigate = useNavigate();

  useEffect(() => {
    const lsToken = localStorage.getItem('token');
    setToken(lsToken);
  }, []);

  if (token === undefined) return null;

  const logout = async () => {
    await axios.post('http://localhost:5005/user/auth/logout', {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    setToken(null);
    navigate('/');
  }
  
  return (
    <>

      <nav>
        {token ? (
          <>
            <button type="button" name="all-listings" onClick={() => navigate('/')}>
              All Listings
            </button> | {""}
            <button type="button" name="my-bookings" onClick={() => navigate('/my-bookings')}>
              My Bookings
            </button> | {""}
            <button type="button" name="hosted-listings" onClick={() => navigate('/hosted-listings')}>
              Hosted Listings
            </button> | {""}
            <button type="button" name="create-listing" onClick={() => navigate('/listings/create')}>
              Create Listings
            </button> | {""}
            <button type="button" name="logout" onClick={logout}>
              Logout
            </button>
            <Notifications token={token} />
          </>
        ) : (
          <>
            <button type="button" name="all-listings" onClick={() => navigate('/')}>
              All Listings
            </button> | {""}
            <button type="button" name="login" onClick={() => navigate('/login')}>
              Login
            </button> | {""}
            <button type="button" name="register" onClick={() => navigate('/register')}>
              Register
            </button>
          </>
        )} 
      </nav>
      <br/>
      <Routes>
        <Route path="/" element={<ListingsScreen token={token}/>}/>
        <Route path="/login" element={<Login setToken={setToken}/>}/>
        <Route path="/register" element={<Register setToken={setToken}/>}/>
        <Route path="/hosted-listings" element={<HostedListings token={token}/>}/>
        <Route path="/hosted-listings/:listingId/booking-requests" element={<BookingRequests token={token} />}/>
        <Route path="/listings/create" element={<CreateListing token={token}/>}/>
        <Route path="/all-listings" element={<b>All listings</b>}/>
        <Route path="/edit-listing/:listingId" element={<EditListing token={token}/>}/>
        <Route path="/view-listing/:listingId" element={<ViewListing token={token}/>}/>
        <Route path="/my-bookings" element={<MyBookings token={token}/>}/>
        <Route path="/booking/:listingId" element={<BookingScreen token={token}/>}/>
        <Route 
          path="/view-listing/:listingId/reviews/:star" 
          element={<StarReviewScreen token={token} />} 
        />
      </Routes>
    </>
  )
}

export default App
