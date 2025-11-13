import { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { Rating, Button } from '@mui/material';
import axios from 'axios';

function HostedListings(props) {

    // store the user's listings 
    const [listings, setListings] = useState([]);
    const userEmail = localStorage.getItem('email');

    async function getListings() {

        try {
            const response = await axios.get('http://localhost:5005/listings');

            const allListings = Object.entries(response.data.listings).map(([id, listing]) => ({
                id,
                ...listing
            }));
            const userListings = allListings.filter(l => l.owner === userEmail);

            // go through user's listings and get the details for each, into a new array
            const detailedListings = await Promise.all(
                userListings.map(async (listing) => {
                    const response = await axios.get(`http://localhost:5005/listings/${listing.id}`);
                    return { id: listing.id, ...response.data.listing };
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
          <h2>Hosted Listings</h2>
          <hr/>
          {listings.map((listing) => (
                <div key={listing.id}>
                    <h3><Link to={`/edit-listing/${listing.id}`}>{listing.title}</Link></h3>
                    <p>Property type: {listing.metadata.propertyType}</p>
                    <p>Beds: {listing.metadata.bedrooms.reduce((sum, bedroom) => sum + bedroom.beds, 0)}</p>
                    <p>Bathrooms: {listing.metadata.bathrooms}</p>
                    
                    {listing.thumbnail && (
                    <>
                        {listing.thumbnail.includes('youtube.com') || listing.thumbnail.includes('youtu.be') ? (
                        <iframe
                            width="300"
                            height="200"        
                            src={listing.thumbnail.replace('watch?v=', 'embed/')}
                            title={listing.title}
                            allowFullScreen
                        ></iframe>
                        ) : (
                        <img src={listing.thumbnail} alt={listing.title} width="300" />
                        )}
                    </>
                    )}

                    <p>Total reviews: {listing.reviews.length}</p>
                    <p>Rating: </p><Rating name={`rating-${listing}`}  defaultValue={0} precision={0.5} readOnly />
                    <p>Price (per night): ${listing.price}</p>
                    <Button>Delete</Button>
                    <hr />
                </div>
            ))}

        </>
    )
}

export default HostedListings