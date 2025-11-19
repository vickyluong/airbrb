import { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { TextField, Button, Alert, Snackbar } from '@mui/material';
import axios from 'axios';

function Register(props) {

    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [open, setOpen] = useState(false);

    async function submit(event) {
        event.preventDefault();

        if (password !== confirmPassword) {
            setErrorMessage('Passwords do not match!');
            setOpen(true);
            return;
        }

        const bodyObj = {email, password, name};
        try {
            const response = await axios.post('http://localhost:5005/user/auth/register', bodyObj);
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('email', email);
            props.setToken(response.data.token);
            navigate('/');
        } catch (error) {
            setErrorMessage(error.response?.data?.error);
            setOpen(true);
        }
    }

    return (
        <>
            <b>Register!!</b>
            <br/>
            <br/>
            <form onSubmit={submit}>
                <TextField 
                    id="register-name" 
                    label="Name" 
                    variant="outlined" 
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                />
                <br/>
                <br/>
                <TextField 
                    id="register-email" 
                    label="Email" 
                    variant="outlined" 
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                />
                <br/>
                <br/>
                <TextField 
                    id="register-password" 
                    label="Password" 
                    type="password" 
                    variant="outlined" 
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                />
                <br/>
                <br/>
                <TextField 
                    id="register-confirm-password" 
                    label="Confirm Password" 
                    type="password" 
                    variant="outlined" 
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                />
                <br/>
                <br/>
                <Button variant="contained" type="submit">Submit</Button>
            </form>
            <br/>
            <Link to="/login">Already registered? Login now!</Link>

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

export default Register