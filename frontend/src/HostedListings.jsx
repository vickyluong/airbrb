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

            const allListings = response.data.listings;
            const userListings = allListings.filter(l => l.owner === userEmail);

            // go through user's listings and get the details for each, into a new array
            const detailedListings = await Promise.all(
                userListings.map(async (listing) => {
                    const response = await axios.get(`http://localhost:5005/listings/${listing.id}`);
                    return response.data.listing;
                })
            )

            setListings(detailedListings);

        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        getListings();
      }, []);

    return (
        <>
            Hosted Listings!!
        </>
    )
}

export default HostedListings