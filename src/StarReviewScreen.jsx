import { useParams, Link } from 'react-router-dom';
import { Rating } from '@mui/material';
import { useEffect, useState } from 'react';
import axios from 'axios';

function StarReviewScreen({ token }) {
  const { listingId, star } = useParams();
  const [listing, setListing] = useState(null);

  useEffect(() => {
    async function fetchListing() {
      try {
        const res = await axios.get(`http://localhost:5005/listings/${listingId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setListing(res.data.listing);
      } catch (err) {
        console.error(err);
      }
    }
    fetchListing();
  }, [listingId, token]);

  if (!listing) return <p>Loading...</p>;

  const filteredReviews = listing.reviews.filter(r => Number(r.score) === Number(star));

  return (
    <div>
      <h2>{listing.title} – {star} star reviews</h2>
      <Link to={`/view-listing/${listingId}`}>← Back to listing</Link>
      <hr/>
      {filteredReviews.length === 0 ? (
        <p>No reviews with {star} stars.</p>
      ) : (
        filteredReviews.map((r, i) => (
          <div key={i} style={{ marginBottom: '1rem' }}>
            <p><strong>{r.publisher}</strong></p>
            <Rating value={Number(r.score)} precision={0.1} readOnly />
            <p>{r.comment || 'No comment provided'}</p>
            {r.owner && <small>— {r.owner}</small>}
            <hr/>
          </div>
        ))
      )}
    </div>
  );
}

export default StarReviewScreen;