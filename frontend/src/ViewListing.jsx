import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Alert, Snackbar, Rating } from '@mui/material';
import axios from 'axios';

function ViewListing(props) {
  const { listingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const token = props.token || null;
  const [listing, setListing] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [open, setOpen] = useState(false);
  
  const [userBookings, setUserBookings] = useState([]);
  const [searchDateRange, setSearchDateRange] = useState({ startDate: null, endDate: null });

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const storedRange = (() => {
      try {
        return JSON.parse(localStorage.getItem('lastSearchDateRange') || '{}');
      } catch (err) {
        console.log(err);
        return {};
      }
    })();

    const detectRange = {
      startDate:
        location.state?.startDate ||
        location.state?.start ||
        queryParams.get('startDate') ||
        storedRange?.startDate ||
        null,
      endDate:
        location.state?.endDate ||
        location.state?.end ||
        queryParams.get('endDate') ||
        storedRange?.endDate ||
        null,
    };

    setSearchDateRange(detectRange);
  }, [location]);

  useEffect(() => {
    async function viewSelectListing() {
      if (!listingId) {
        return;
      }

      try {
        const response = await axios.get(`http://localhost:5005/listings/${listingId}`);
        setListing(response.data.listing);
      } catch (error) {
        setErrorMessage(error.response?.data?.error || 'Unable to load listing');
        setOpen(true);
      }
    };

    viewSelectListing();
  }, [listingId]);

  useEffect(() => {
    async function fetchUserBookings() {
      if (!token) {
        setUserBookings([]);
        return;
      }

      try {
        const response = await axios.get('http://localhost:5005/bookings', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const email = localStorage.getItem('email');
        const bookingMatches =
          response.data.bookings?.filter(
            (booking) =>
              String(booking.listingId) === String(listingId) && booking.owner === email
          ) || [];
        setUserBookings(bookingMatches);
      } catch (error) {
        console.log(error);
      }
    };

    fetchUserBookings();
  }, [token, listingId]);

  const formattedAddress = listing?.address
    ? [
        listing.address.line1,
        listing.address.line2,
        listing.address.city,
        listing.address.state,
        listing.address.postcode,
        listing.address.country,
      ]
        .filter(Boolean)
        .join(', ')
    : 'Address unavailable';

  const amenityList = listing?.metadata?.amenities || [];
  const reviews = listing?.reviews || [];

  const totalBedrooms = listing?.metadata?.bedrooms?.length || 0;

  const totalBeds =
    listing?.metadata?.bedrooms?.reduce(
      (sum, b) => sum + Number(b?.beds || 0),
      0
    ) || 0;

  const totalBathrooms = listing?.metadata?.bathrooms ?? 'N/A';
  const propertyType = listing?.metadata?.propertyType || 'N/A';

  const propertyImages = listing
    ? [
        ...(listing.thumbnail ? [{ src: listing.thumbnail }] : []),
        ...(listing.metadata?.images?.map((img, i) => ({
          src: img,
          label: `Image ${i + 1}`,
        })) || []),
      ]
    : [];

  const reviewRatings = (listing?.reviews || [])
    .map((r) => Number(r?.score))
    .filter((r) => !Number.isNaN(r));

  const averageRating =
    reviewRatings.length > 0
      ? (
          reviewRatings.reduce((sum, rating) => sum + rating, 0) /
          reviewRatings.length
        ).toFixed(1)
      : null;

  let stayDetails = null;

  if (listing?.price) {
    const nightlyPrice = Number(listing.price);

    const { startDate, endDate } = searchDateRange || {};

    if (!startDate || !endDate) {
      stayDetails = {
        label: 'Price (per night)',
        amount: nightlyPrice,
        helper: null,
      };
    } else {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const msPerNight = 1000 * 60 * 60 * 24;

      let nights = Math.ceil((end - start) / msPerNight);
      if (nights <= 0 || Number.isNaN(nights)) nights = 1;

      const total = nightlyPrice * nights;

      stayDetails = {
        label: 'Total Price',
        amount: total,
      };
    }
  }

  if (!listing) {
    return null;
  }

  return (
    <div>
      <h2>{listing.title}</h2>
      <p>{formattedAddress}</p>

      <h3>Property details</h3>
      <ul>
        <li>Type: {propertyType}</li>
        <li>Bedrooms: {totalBedrooms}</li>
        <li>Total beds: {totalBeds}</li>
        <li>Bathrooms: {totalBathrooms}</li>
      </ul>

      {stayDetails && (
        <div>
          <p>
            {stayDetails.label}: ${stayDetails.amount.toFixed(2)}
          </p>
        </div>
      )}

      <h3>Amenities</h3>
      {amenityList.length > 0 ? (
        <ul>
          {amenityList.map((amenity) => (
            <li key={amenity}>{amenity}</li>
          ))}
        </ul>
      ) : (
        <p>No amenities listed.</p>
      )}

      <h3>Images</h3>
      {propertyImages.length === 0 && <p>No property images provided.</p>}
      {propertyImages.map((image) => (
        <div key={`${image.label}-${image.src}`}>
          {image.src.includes('youtube.com') || image.src.includes('youtu.be') ? (
            <iframe
              width="300"
              height="200"
              src={image.src.includes('watch?v=') ? image.src.replace('watch?v=', 'embed/') : image.src}
              title={listing.title}
              allowFullScreen
            />
          ) : (
            <img src={image.src} alt={listing.title} width="300" />
          )}
          {image.label && <small>{image.label}</small>}
        </div>
      ))}

      {/* <h3>Reviews</h3>
      <p>Total reviews: {reviews.length}</p>
      <p>{averageRating ? `Average rating: ${averageRating} / 5` : 'No ratings yet.'}</p>
      <hr/>

      {reviews.length === 0 && <p>This listing has no reviews yet.</p>}

      {reviews.map((review, index) => (
        <div key={`review-${index}`} style={{ marginBottom: '10px' }}>
          <p>{review.publisher}</p>
          <p>Rating: {review.score?.toFixed(1)} / 5</p>
          <p>{review.comment || 'No comment provided.'}</p>
          {review.owner && <small>— {review.owner}</small>}
          <hr />
        </div>
      ))} */}

<h3>Reviews</h3>
<p>Total reviews: {reviews.length}</p>

{reviews.length > 0 ? (
  <div>
    <p>{averageRating ? `Average rating: ${averageRating} / 5` : ''}</p>
    <Rating
      name="average-rating"
      value={averageRating ? Number(averageRating) : 0}
      precision={0.1}
      readOnly
    />
    <hr/>
  </div>
) : (
  <p>No ratings yet.</p>
)}

{reviews.map((review, index) => (
  <div key={`review-${index}`}>
    <p>{review.publisher}</p>
    <p>Rating: {review.score?.toFixed(1)} / 5</p>
    {review?.score && (
      <Rating
        name={`review-${index}-rating`}
        value={Number(review.score)}
        precision={0.1}
        readOnly
      />
    )}
    <p>Comment: {review?.comment || 'No comments provided.'}</p>
    {review?.owner && <small>— {review.owner}</small>}
    <hr />
  </div>
))}


      <h3>Your bookings</h3>
      {!token && <p>Please log in to make a booking.</p>}
      {token && userBookings.length === 0 && <p>You have not made any bookings for this listing yet.</p>}
      {userBookings.map((booking) => (
        <div key={booking.id}>
          <p>Booking #{booking.id}</p>
          <p>Status: {booking.status}</p>
          {booking.dateRange?.start && booking.dateRange?.end && (
            <p>
              Dates: {booking.dateRange.start} — {booking.dateRange.end}
            </p>
          )}
          {booking.totalPrice !== undefined && (
            <p>Total paid: ${Number(booking.totalPrice).toFixed(2)}</p>
          )}
          <hr />
        </div>
      ))}

      {token && (
        <div style={{ marginTop: '20px', marginBottom: '20px' }}>
          <button
            type="button"
            style={{ padding: '10px 20px', fontSize: '16px' }}
            onClick={() => {
              navigate(`/booking/${listingId}`, {
                state: {
                  startDate: searchDateRange.startDate,
                  endDate: searchDateRange.endDate,
                },
              });
            }}
          >
            Book this listing
          </button>
        </div>
      )}

      <Link to="/" style={{ display: 'inline-block' }}>
        <button type="button">← Back to listings</button>
      </Link>

      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={open}
        autoHideDuration={5000}
        onClose={() => setOpen(false)}
      >
        <Alert severity="error" onClose={() => setOpen(false)}>{errorMessage}</Alert>
      </Snackbar>
    </div>
  )
}

export default ViewListing