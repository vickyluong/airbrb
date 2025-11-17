import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FormControl, InputLabel, Select, MenuItem, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Box, Typography, Slider, Alert, Snackbar, FormControlLabel, Checkbox } from '@mui/material';

function ListingsScreen(props) {
  const token = props.token;

  const [listings, setListings] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [minBedrooms, setMinBedrooms] = useState("");
  const [maxBedrooms, setMaxBedrooms] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [priceRange, setPriceRange] = useState([0, 0]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [reviewSort, setReviewSort] = useState("");
  const [sortBy, setSortBy] = useState("");

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

  useEffect(() => {
    setFilteredListings(listings); 
  }, [listings]);

  const displayedListings = filteredListings.filter(listing => {
    const query = search.toLowerCase().trim();
    return (
      listing.title.toLowerCase().includes(query) ||
      listing.address.city.toLowerCase().includes(query)
    );
  })
  .sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "bedrooms-asc":
        return a.metadata.bedrooms.length - b.metadata.bedrooms.length;
      case "bedrooms-desc":
        return b.metadata.bedrooms.length - a.metadata.bedrooms.length;
      case "rating-asc":
        return a.avgRating - b.avgRating;
      case "rating-desc":
        return b.avgRating - a.avgRating;
      default:
        return 0;
    }
  });

  const applyFilters = () => {
    let result = listings;

    // number of bedrooms filter is applied 
    if (minBedrooms !== "" && maxBedrooms !== "") {
      result = result.filter(l => {
        const numBeds = l.metadata.bedrooms.length;
        if (numBeds < Number(minBedrooms)) return false;
        if (numBeds > Number(maxBedrooms)) return false;
        return true;
      });
    }

    // filter by date range 
    if (startDate && endDate) {
      result = result.filter(l => {
        return l.availability.some(dateRange =>
          dateRange.start <= startDate && dateRange.end >= endDate
        );
      })
    }

    // filter by price 
    if (priceRange[0] !== 0 || priceRange[1] !== 0) {
      const [minPrice, maxPrice] = priceRange;
      result = result.filter(l => l.price >= minPrice && l.price <= maxPrice);
    }

    // filter by rating 
    if (reviewSort === "asc") { 
      result = result.sort((a, b) => a.avgRating - b.avgRating); 
    } else if (reviewSort === "desc") { 
      result = result.sort((a, b) => b.avgRating - a.avgRating); 
    } 

    setFilteredListings(result);
    setFilterDialogOpen(false);
  }


  return (
    <>
      <h2>All Listings</h2>
      <input 
        type="text"
        id="search-listings" 
        placeholder="Search..." 
        value={search}
        onChange={(event) => setSearch(event.target.value)}/>
      <Button onClick={() => setFilterDialogOpen(true)}>Filter</Button>
      <FormControl fullWidth sx={{ mt: 2 }}>
      <InputLabel>Sort by</InputLabel>
      <Select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        label="Sort by"
      >
        <MenuItem value="">
          <em>Sort by:</em>
        </MenuItem>
        <MenuItem value="price-asc">Price (low to high)</MenuItem>
        <MenuItem value="price-desc">Price (high to low)</MenuItem>
        <MenuItem value="bedrooms-asc">Bedrooms (few to many)</MenuItem>
        <MenuItem value="bedrooms-desc">Bedrooms (many to few)</MenuItem>
        <MenuItem value="rating-asc">Rating (low to high)</MenuItem>
        <MenuItem value="rating-desc">Rating (high to low)</MenuItem>
      </Select>
    </FormControl>
      <hr/>
      {displayedListings.map((listing) => (
        <div key={listing.id}>
          <h3><Link to={`/view-listing/${listing.id}`}>{listing.title}</Link></h3>
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

      <Dialog open={filterDialogOpen} onClose={() => setFilterDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Filter by:</DialogTitle>
        <DialogContent>
          {/* Bedrooms */}
          <Typography variant="subtitle1" sx={{ mt: 1 }}>Number of bedrooms:</Typography>
          <br/>
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Min"
              type="number"
              value={minBedrooms}
              onChange={(e) => setMinBedrooms(e.target.value)}
              fullWidth
            />
            <TextField
              label="Max"
              type="number"
              value={maxBedrooms}
              onChange={(e) => setMaxBedrooms(e.target.value)}
              fullWidth
            />
          </Box>

          
          {/* Date Range */}
          <Typography variant="subtitle1" sx={{ mt: 2 }}>Date range:</Typography>
          <TextField
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            fullWidth
            sx={{ mt: 1 }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            fullWidth
            sx={{ mt: 1 }}
            InputLabelProps={{ shrink: true }}
          />

          {/* Price */}
          <Box sx={{ mt: 3 }}>
          <Typography gutterBottom>
            Price range: (${priceRange[0]} – ${priceRange[1]})
          </Typography>

          <Slider
            value={priceRange}
            onChange={(event, newValue) => setPriceRange(newValue)}
            valueLabelDisplay="auto"
            min={0}
            max={1000}
            step={10}
          />
        </Box>

        {/* Review ratings: */}
        <Typography variant="subtitle1" sx={{ mt: 2 }}>Review ratings:</Typography>

        <FormControlLabel
          control={
            <Checkbox
              checked={reviewSort === "desc"}
              onChange={() =>
                setReviewSort(reviewSort === "desc" ? "" : "desc")
              }
            />
          }
          label="highest to lowest"
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={reviewSort === "asc"}
              onChange={() =>
                setReviewSort(reviewSort === "asc" ? "" : "asc")
              }
            />
          }
          label="lowest to highest"
        />

        </DialogContent>
        <DialogActions>
            <Button variant="contained" 
            onClick={applyFilters}>
            Apply filters
            </Button>
            <Button variant="outlined"
            onClick={() => {
              setMinBedrooms("");
              setMaxBedrooms("");
              setStartDate("");
              setEndDate("");
              setPriceRange([0, 0]);
              setReviewSort("");
              setFilteredListings(listings);
            }}>
              Clear filters
            </Button>
            <Button variant="outlined" onClick={() => setFilterDialogOpen(false)}>
              Cancel
            </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ListingsScreen