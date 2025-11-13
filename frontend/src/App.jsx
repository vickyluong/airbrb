import { useEffect, useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import { Routes, Route, Link } from "react-router-dom";
import axios from 'axios';

import Register from './Register.jsx';
import Login from './Login.jsx';
import Dashboard from './Dashboard.jsx';
import HostedListings from './HostedListings.jsx';
import CreateListing from './CreateListing.jsx';

function App() {

  const [token, setToken] = useState(undefined);

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
  }
  
  return (
    <>
      <nav>
        {token ? (
          <>
            <Link to="/dashboard">Dashboard</Link> | {""}
            <Link to="/hosted-listings">Hosted Listings</Link> | {""}
            <Link to="/all-listings">All Listings</Link> | {""}
            <Link to="/listings/create">Create Listings</Link> | {""}
            <a href="#" onClick={logout}>Logout</a>
          </>
        ) : (
          <>
            <Link to="/">Home</Link> | {""}
            <Link to="/login">Login</Link> | {""}
            <Link to="/register">Register</Link>
          </>
        )} 
      </nav>
      <br/>
      <Routes>
        <Route path="/" element={<b>Home</b>}/>
        <Route path="/login" element={<Login setToken={setToken}/>}/>
        <Route path="/register" element={<Register setToken={setToken}/>}/>
        <Route path="/dashboard" element={<Dashboard token={token}/>}/>
        <Route path="/hosted-listings" element={<HostedListings token={token}/>}/>
        <Route path="/listings/create" element={<CreateListing token={token}/>}/>
        <Route path="/all-listings" element={<b>All listings</b>}/>
      </Routes>
    </>
  )
}

export default App
