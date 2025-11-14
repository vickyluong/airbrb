import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from "react-router-dom";
import { FormControl, InputLabel, TextField, Select, Button } from '@mui/material';
import axios from 'axios';

function EditListing(props) {
    const { listingId } = useParams();
    const token = props.token;
    const navigate = useNavigate();

    const [listing, setListing] = useState(null);

    async function getListingDetails() {
        try {
            const response = await axios.get(`http://localhost:5005/listings/${listingId}`);
            setListing(response.data.listing);
        } catch (error) {
            console.log(error);
        }
    }

    async function updateListing() {

        try {
            const response = await axios.put(`http://localhost:5005/listings/${listingId}`,
                listing,
                {
                    headers: {
                      'Authorization': `Bearer ${token}`,
                    }
                  }
            );
            navigate('/hosted-listings');
        } catch (error) {
            console.log(error);
        }
    }



    // everytime the listing id changes
    useEffect(() => {
        getListingDetails();
    }, [listingId]);

    if (!listing) {
        return <p>Loading</p>;
    }

    return (
        <>
            <h2>Edit Listing Details</h2>
            <TextField 
            id="edit-title" 
            label="Title" 
            value={listing.title}
            onChange={(event) => setListing({ ...listing, title: event.target.value })}
            />
            <br/>
            <br/>
            <TextField 
            id="edit-line1" 
            label="Address Line 1" 
            value={listing.address.line1}
            onChange={(event) => setListing({
                ...listing,
                address: {
                  ...listing.address,
                  line1: event.target.value
                }})}
            />
            <br/>
            <br/>
            <TextField 
            id="edit-line2" 
            label="Address Line 2" 
            value={listing.address.line2}
            onChange={(event) => setListing({
                ...listing,
                address: {
                  ...listing.address,
                  line2: event.target.value
                }})}
            />
            <br/>
            <br/>
            <TextField 
            id="edit-city" 
            label="City" 
            value={listing.address.city}
            onChange={(event) => setListing({
                ...listing,
                address: {
                  ...listing.address,
                  city: event.target.value
                }})}
            />
            <br/>
            <br/>
            <TextField 
            id="edit-state" 
            label="State" 
            value={listing.address.state}
            onChange={(event) => setListing({
                ...listing,
                address: {
                  ...listing.address,
                  state: event.target.value
                }})}
            />
            <br/>
            <br/>
            <TextField 
            id="edit-postcode" 
            label="Postcode" 
            value={listing.address.postcode}
            onChange={(event) => setListing({
                ...listing,
                address: {
                  ...listing.address,
                  postcode: event.target.value
                }})}
            />
            <br/>
            <br/>
            <TextField 
            id="edit-country" 
            label="Country" 
            value={listing.address.country}
            onChange={(event) => setListing({
                ...listing,
                address: {
                  ...listing.address,
                  country: event.target.value
                }})}
            />
            <br/>
            <br/>
            <TextField 
            id="edit-price" 
            label="Price (Per Night)" 
            type="number" 
            min="0"
            step="0.01"
            value={listing.price}
            onChange={(event) => setListing({ ...listing, price: event.target.value })}
            />
            <br/>
            <br/>
            {/* <FormControl sx={{ width: 195 }}>
            <InputLabel id="property-type-label">Property Type</InputLabel>
            <Select
                labelId="property-type-label"
                id="property-type"
                value={listing.propertyType}
                label="Property Type"
                onChange={(event) => setListing({ 
                    ...listing, 
                    metadata: {
                        ...listing.metadata,
                        propertyType: event.target.value
                    }})}
            > */}
                {/* <MenuItem value="">
                <em>Select Property Type</em>
                </MenuItem>
                {propertyTypes.map((type) => (
                <MenuItem key={type} value={type}>
                    {type}
                </MenuItem>
                ))} */}
            {/* </Select>
            </FormControl>
            <br/>
            <br/> */}

            <Button variant="contained" onClick={updateListing}>Save Changes</Button>
        </>
    )
}

export default EditListing