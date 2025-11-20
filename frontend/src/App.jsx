import { useEffect, useState } from 'react';
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
            <Link to="/">All Listings</Link> | {""}
            <Link to="/my-bookings">My Bookings</Link> | {""}
            <Link to="/hosted-listings">Hosted Listings</Link> | {""}
            <Link to="/listings/create">Create Listings</Link> | {""}
            <a href="#" onClick={logout}>Logout</a>
            <Notifications token={token} />
          </>
        ) : (
          <>
            <Link to="/">All Listings</Link> | {""}
            <Link to="/login">Login</Link> | {""}
            <Link to="/register">Register</Link>
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
