import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import { Routes, Route, Link } from "react-router-dom";

import Register from './Register.jsx';

function App() {
  
  return (
    <>
      <nav>
      <Link to="/">Home</Link> | {""}
      <Link to="/login">Login</Link> | {""}
        <Link to="/register">Register</Link>
      </nav>
      <br/>
      <Routes>
        <Route path="/" element={<b>Home</b>}/>
        <Route path="/login" element={<b>Login</b>}/>
        <Route path="/register" element={<Register />}/>
      </Routes>
    </>
  )
}

export default App
