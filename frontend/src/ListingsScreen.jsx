import { useState, useEffect } from 'react';
import axios from 'axios';

function ListingsScreen(props) {
  const [listings, setListings] = useState([]);
  const token = props.token;

  async function getAllListings() {
    try {
      const response = await axios.get('http://localhost:5005/listings');

      const allListings = Object.entries(response.data.listings).map(([id, listing]) => ({
        id,
        ...listing
      }));

      const detailedListings = await Promise.all(
        allListings.map(async (listing) => {
          const response = await axios.get(`http://localhost:5005/listings/${listing.id}`);
          return { id: listing.id, ...response.data.listing };
        })
      )

      const publishedListings = detailedListings.filter(listing => listing.published === true);

      let userBookings = [];
      if (token) {
        try {
          const bookingsResponse = await axios.get('http://localhost:5005/bookings', {
            headers: {
              'Authorization': `Bearer ${token}`,
            }
          });
          userBookings = bookingsResponse.data.bookings || [];
        } catch (error) {
          console.log(error);
        }
      }

      const relevantBookingListingIds = new Set();
      if (token && userBookings.length > 0) {
        userBookings.forEach(booking => {
          if (booking.status === 'accepted' || booking.status === 'pending') {
            relevantBookingListingIds.add(String(booking.listingId));
          }
        });
      }

      const sortedListings = publishedListings.sort((a, b) => {
        const aId = String(a.id);
        const bId = String(b.id);
        const aHasBooking = relevantBookingListingIds.has(aId);
        const bHasBooking = relevantBookingListingIds.has(bId);

        if (aHasBooking && !bHasBooking) {
          return -1;
        }
        if (!aHasBooking && bHasBooking) {
          return 1;
        }

        return a.title.localeCompare(b.title);
      });

      setListings(sortedListings);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getAllListings();
  }, []);

  return (
    <>
      <h2>All Listings</h2>
      <hr/>
      {listings.map((listing) => (
        <div key={listing.id}>
          <h3>{listing.title}</h3>
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
          <hr />
        </div>
      ))}
    </>
  )
}

export default ListingsScreen