import { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { TextField, Button, Alert, Snackbar } from '@mui/material';
import axios from 'axios';

function HostedListings(props) {

    // store the user's listings 
    const [listings, setListings] = useState([]);

    const userEmail = localStorage.getItem('email');

    async function getListings() {

        try {
            const response = await axios.get('http://localhost:5005/listings');
            setListings(response.data.listings);
            console.log(response.data.listings);
        } catch (error) {
            console.log(error);
        }
    }

    async function getListingInfo(listingid) {

        try {
            const response = await axios.get(`http://localhost:5005/listings/${listingid}`);
            console.log(response.data);
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        getListings();
      }, []);

    // go through user's listings and call a fetch for each to get each info

    return (
        <>
            Hosted Listings!!
        </>
    )
}

export default HostedListings