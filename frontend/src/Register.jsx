import { useState } from 'react';
import { Link } from "react-router-dom";
import { TextField, Button } from '@mui/material';
import axios from 'axios';

function Register() {

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    async function submit() {
        const bodyObj = {email, password, name};
        // axios.post('http://localhost:5005/user/auth/register', bodyObj)
        // .then(function (response) {
        //     console.log(response);
        // })
        // .catch(function (error) {
        //     console.log(error);
        // });

        try {
            const response = await axios.post('http://localhost:5005/user/auth/register', bodyObj);
            console.log(response);
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <>
        <b>Register!!</b>
        <br/>
        <br/>
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
        <Button variant="contained" onClick={submit}>Submit</Button>
        <br/>
        <Link to="/login">Already registered? Login now!</Link>
        </>
    )
}

export default Register