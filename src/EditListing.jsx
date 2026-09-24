import { useState, useEffect } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import 
{ Alert, Snackbar, TextField, MenuItem, 
  Button, Box, FormControl, 
  InputLabel, Select, FormGroup, 
  FormControlLabel, Checkbox, Switch, Typography 
} from '@mui/material';
import api from './helper.jsx';

function EditListing(props) {
    const navigate = useNavigate();
    const token = props.token;

    const { listingId } = useParams();
  
    useEffect(() => {
      if (!token) {
        navigate('/login');
      }
    }, [token, navigate]);
  
    const [listing, setListing] = useState(null);
    const [thumbnail, setThumbnail] = useState('');
    const [useYoutubeThumbnail, setUseYoutubeThumbnail] = useState(false);
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [numBedrooms, setNumBedrooms] = useState(0);
    const [bedrooms, setBedrooms] = useState([]);
    const [noneAmenity, setNoneAmenity] = useState(false);
    const [otherAmenityChecked, setOtherAmenityChecked] = useState(false);
    const [otherAmenityValue, setOtherAmenityValue] = useState('');
    const [propertyImages, setPropertyImages] = useState([]);
  
    const [errorMessage, setErrorMessage] = useState('');
    const [open, setOpen] = useState(false);
  
    const propertyTypes = ['Apartment', 'House', 'Villa', 'Condo', 'Cabin', 'Townhouse', 'Studio', 'Cottage', 'Other'];
    const bedTypes = ['Single', 'Double', 'Queen', 'King', 'Bunk'];
    const amenityOptions = ['Wi-Fi', 'Air Conditioning', 'Heating', 'Kitchen', 'Washer', 'Dryer', 'Parking', 'Pool', 'Gym', 'Fireplace', 'Outdoor Space'];

    async function getListings() {

        try {
            const response = await api.getListingDetails(token, listingId);
            setListing(response.listing);

        } catch (error) {
            console.error(error);
        }

    }

    async function updateListing(e) {
      e.preventDefault();

        try {
          await api.updateListingDetails(token, listingId, listing);
          navigate('/hosted-listings');
        } catch (error) {
          console.error(error);
        }
    }

    // everytime the listing id changes
    useEffect(() => {
        getListings();
    }, [listingId]);

    useEffect(() => {
      if (listing) {
        setNumBedrooms(listing.metadata.bedrooms.length);
        setBedrooms(listing.metadata.bedrooms);
      }
    }, [listing]);
  
    // creating a field for each bedroom
    useEffect(() => {
      const n = parseInt(numBedrooms);
      if (isNaN(n) || n < 0) return;
      if (bedrooms.length < n) {
        const toAdd = Array.from({ length: n - bedrooms.length }, () => ({ beds: '', bedType: '' }));
        setBedrooms(prev => [...prev, ...toAdd]);
      } else if (bedrooms.length > n) {
        setBedrooms(prev => prev.slice(0, n));
      }
    }, [numBedrooms]);

    if (!listing) {
        return <p>Loading...</p>;
    }

    const updateBedroom = (index, field, value) => {
      setBedrooms(prev => {
        const updatedBedrooms = [...prev];
        const room = {...updatedBedrooms[index]};
  
        if (field === "beds") {
          const count = parseInt(value);
          room.beds = value;
  
          if (!isNaN(count)) {
            const currentBedTypes = room.bedTypes || [];
            room.bedTypes = [
              ...(currentBedTypes || []).slice(0, count),
              ...Array(Math.max(0, count - currentBedTypes.length)).fill("")
            ];
          }
        } else if (field.startsWith("bedType-")) {
          const i = Number(field.split("-")[1]);
          const currentBedTypes = room.bedTypes || [];
          const types = [...currentBedTypes];
          types[i] = value;
          room.bedTypes = types;
        }
  
        updatedBedrooms[index] = room;
        return updatedBedrooms;
      });
    };
  
    const otherAmenity = (checked) => {
      setOtherAmenityChecked(checked);
      if (checked) {
        setNoneAmenity(false);
      } else {
        setOtherAmenityValue('');
      }
    };
  
    const addThumbnail = (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setListing(prev => ({
            ...prev,
            thumbnail: reader.result
          }));
        };
        reader.readAsDataURL(file);
      }
    };
  
    const handleYoutubeToggle = (checked) => {
      setUseYoutubeThumbnail(checked);
      if (checked) {
        setThumbnail('');
      } else {
        setYoutubeUrl('');
      }
    };

    const addPropertyImages = (event) => {
      const files = Array.from(event.target.files);
      const readers = [];
  
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setListing(prev => ({
            ...prev,
            metadata: {
              ...prev.metadata,
              images: reader.result
            } 
          }));
        };
        reader.readAsDataURL(file);
      });
    };

    return (
      <>
        <b>Edit Listing</b>
        <br/>
        <br/>
        <form onSubmit={updateListing}>
          <TextField 
          id="edit-title" 
          label="Title" 
          value={listing.title}
          onChange={(event) => setListing({ ...listing, title: event.target.value })}
          required
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
          required
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
          required
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
          required
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
          required
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
          required
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
          onChange={(event) => setListing({ ...listing, price: Number(event.target.value) })}
          required
          />
          <br/>
          <br/>
          <FormControl required sx={{ width: 195 }}>
            <InputLabel id="edit-property-type-label">Property Type</InputLabel>
            <Select
              labelId="edit-property-type-label"
              id="edit-property-type"
              value={listing.metadata.propertyType}
              label="Property Type"
              onChange={(event) => setListing({
                ...listing,
                metadata: {
                ...listing.metadata,
                propertyType: event.target.value
                }})}
            >
              <MenuItem value="">
                <em>Select Property Type</em>
              </MenuItem>
              {propertyTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <br/>
          <br/>
          <TextField 
            id="edit-bathrooms" 
            label="Bathrooms" 
            type="number" 
            min="0"
            step="1"
            value={listing.metadata.bathrooms}
            onChange={(event) => setListing({
              ...listing,
              metadata: {
              ...listing.metadata,
              bathrooms: event.target.value
              }})}
            required
          />
          <br/>
          <br/>
          <TextField 
            id="edit-num-bedrooms" 
            label="Number of Bedrooms" 
            type="number" 
            min="0"
            step="1"
            value={numBedrooms}
            onChange={(event) => setNumBedrooms(event.target.value)}
            onBlur={() => setListing(prev => ({
              ...prev,
              metadata: {
                ...prev.metadata,
                bedrooms: bedrooms
              }
          }))}
          required
          />
          <br/>
          <br/>
          <Box>
            {bedrooms.map((bedroom, index) => (
              <Box key={index}>
                <TextField
                  id={`bedroom-${index}-beds`}
                  label="Number of Beds"
                  type="number"
                  min="0"
                  step="1"
                  value={bedroom.beds}
                  onChange={(event) => {
                    updateBedroom(index, 'beds', event.target.value);
                  }}
                  onBlur={() => setListing(prev => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      bedrooms: bedrooms
                    }
                }))}
                required
                />
                <br/>
                {Array.from({ length: parseInt(bedroom.beds) || 0 }).map((_, bedIndex) => (
                <TextField
                  key={bedIndex}
                  id={`bedroom-${index}-bedtype-${bedIndex}`}
                  select
                  label={`Bed Type #${bedIndex + 1}`}
                  value={bedroom.bedTypes?.[bedIndex] || ''}
                  onChange={(event) => updateBedroom(index, `bedType-${bedIndex}`, event.target.value)}
                  onBlur={() => setListing(prev => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      bedrooms: bedrooms
                    }
                }))}
                  required
                  sx={{ width: 195, marginTop: 1 }}
                >
                  <MenuItem value="">
                    <em>Select Bed Type</em>
                  </MenuItem>
                  {bedTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </TextField>
              ))}
              </Box>
            ))}
          </Box>
          <br/>
          <Box>
            <b>Amenities</b>
            <FormGroup sx={{ marginTop: 1 }}>
              {amenityOptions.map((option) => (
                <FormControlLabel
                  key={option}
                  control={
                    <Checkbox
                      checked={listing.metadata?.amenities?.includes(option) || false}
                      onChange={(event) => {
                        const checked = event.target.checked;
                        setListing(prev => ({
                          ...prev,
                          metadata: {
                            ...prev.metadata,
                            amenities: checked
                              ? [...prev.metadata.amenities, option]   // add amenity if checked
                              : prev.metadata.amenities.filter(a => a !== option) // remove if unchecked
                          }
                        }));
                      }}
                      disabled={noneAmenity}
                    />
                  }
                  label={option}
                />
              ))}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={otherAmenityChecked}
                    onChange={(event) => otherAmenity(event.target.checked)}
                    disabled={noneAmenity}
                  />
                }
                label="Other"
              />
              {otherAmenityChecked && (
                <TextField
                  id="amenity-other"
                  label="Specify other amenity"
                  onBlur={(event) => {
                    setListing(prev => ({
                      ...prev,
                      metadata: {
                        ...prev.metadata,
                        amenities: [...prev.metadata.amenities, event.target.value] 
                      }
                    }));
                  }}
                  required={otherAmenityChecked}
                  sx={{ maxWidth: 280, marginBottom: 2 }}
                />
              )}
              <FormControlLabel
                control={
                  <Checkbox
                    onChange={(event) => {
                      const checked = event.target.checked;
                      setListing(prev => ({
                        ...prev,
                        metadata: {
                          ...prev.metadata,
                          amenities: checked ? [] : prev.metadata.amenities 
                        }
                      }));
                    }}
                  />
                }
                label="None of the above"
              />
            </FormGroup>
          </Box>
          <br/>
          <br/>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography sx={{ fontWeight: 'bold' }}>Thumbnail</Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={useYoutubeThumbnail}
                    onChange={(event) => handleYoutubeToggle(event.target.checked)}
                  />
                }
                label="Use YouTube URL"
              />
            </Box>
            {!useYoutubeThumbnail && (
              <TextField 
                id="edit-thumbnail-file" 
                label="Listing Thumbnail" 
                type="file" 
                accept="image/*"
                onChange={addThumbnail}
                InputLabelProps={{ shrink: true }}
                sx={{ marginTop: 2 }}
              />
            )}
            {useYoutubeThumbnail && (
              <TextField
                id="thumbnail-youtube"
                label="YouTube Embed URL"
                value={youtubeUrl}
                onChange={(event) => {
                  const url = event.target.value;
                  setYoutubeUrl(url); 
                  setListing({ ...listing, thumbnail: url }); 
                }}
                helperText="Example: https://www.youtube.com/embed/VIDEO_ID"
                fullWidth
                sx={{ marginTop: 2 }}
              />
            )}
          </Box>
          <br/>
          <Box>
          <Typography sx={{ fontWeight: 'bold' }}>Property Images</Typography>
          <TextField
            id="edit-property-images"
            type="file"
            accept="image/*"
            InputLabelProps={{ shrink: true }}
            inputProps={{ multiple: true }}
            onChange={addPropertyImages}
            sx={{ marginTop: 2 }}
          />

          {propertyImages.length > 0 && (
            <Typography sx={{ marginTop: 1 }}>
              {propertyImages.length} image(s) selected
            </Typography>
          )}
        </Box>
        <Button variant="contained" type="submit">Save Changes</Button>
        </form>

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
  
  export default EditListing;