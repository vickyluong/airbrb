import { useEffect, useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import { Routes, Route, Link } from "react-router-dom";

import Register from './Register.jsx';
import Login from './Login.jsx';
import Dashboard from './Dashboard.jsx';

function App() {

  const [token, setToken] = useState(undefined);

  useEffect(() => {
    const lsToken = localStorage.getItem('token');
    setToken(lsToken);
  }, []);

  if (token === undefined) return null;
  
  return (
    <>
      <nav>
        {token ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
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
      </Routes>
    </>
  )
}

export default App
