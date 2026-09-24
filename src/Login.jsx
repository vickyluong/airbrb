import { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { TextField, Button, Alert, Snackbar } from '@mui/material';
import api from './helper.jsx';

function Login(props) {

  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [open, setOpen] = useState(false);

  async function submit(event) {

    if (event) event.preventDefault();

      try {
          const response = await api.login(email, password);

          localStorage.setItem('token', response.token);
          localStorage.setItem('email', email);

          props.setToken(response.token);

          navigate('/');

      } catch (error) {
          setErrorMessage(error.response?.data?.error);
          setOpen(true);
      }
    }
  

  return (
    <>
      <b>Login!!</b>
      <br/>
      <br/>
      <form onSubmit={submit}>
        <TextField 
          id="login-email" 
          label="Email" 
          variant="outlined" 
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <br/>
        <br/>
        <TextField 
          id="login-password" 
          label="Password" 
          type="password" 
          variant="outlined" 
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <br/>
        <br/>
        <Button variant="contained" type="submit">Submit</Button>
      </form>
      <br/>
      <Link to="/register">Not registered? Register now!</Link>

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

export default Login
