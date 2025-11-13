import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Alert, Snackbar, TextField, MenuItem, Button, Box, FormControl, InputLabel, Select } from '@mui/material';
import axios from 'axios';

function CreateListing(props) {
  const navigate = useNavigate();
  const token = props.token;

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  const [title, setTitle] = useState('');
  const [address, setAddress] = useState({
    line1: '',
    line2: '',
    city: '',
    state: '',
    postcode: '',
    country: '',
  });
  const [price, setPrice] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [numBedrooms, setNumBedrooms] = useState(0);
  const [bedrooms, setBedrooms] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [currentAmenity, setCurrentAmenity] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [open, setOpen] = useState(false);

  const propertyTypes = ['Apartment', 'House', 'Villa', 'Condo', 'Cabin', 'Townhouse', 'Studio', 'Cottage', 'Other'];
  const bedTypes = ['Single', 'Double', 'Queen', 'King', 'Bunk'];

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

  const updateBedroom = (index, field, value) => {
    setBedrooms(bedrooms.map((bedroom, i) => {
      if (i === index) {
        return { ...bedroom, [field]: value };
      }
      return bedroom;
    }));
  };

  const updateAddress = (field, value) => {
    setAddress((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addAmenity = () => {
    if (currentAmenity && !amenities.includes(currentAmenity)) {
      setAmenities([...amenities, currentAmenity]);
      setCurrentAmenity('');
    }
  };

  const removeAmenity = (amenity) => {
    setAmenities(amenities.filter(a => a !== amenity));
  }

  const addThumbnail = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnail(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (isNaN(price) || parseFloat(price) <= 0) {
      setErrorMessage('Valid Listing Price is required');
      setOpen(true);
      return false;
    }
    if (isNaN(bathrooms) || parseInt(bathrooms) < 0) {
      setErrorMessage('Valid number of bathrooms is required');
      setOpen(true);
      return false;
    }
    if (isNaN(numBedrooms) || parseInt(numBedrooms) < 0) {
      setErrorMessage('Valid number of bedrooms is required');
      setOpen(true);
      return false;
    }
    for (let i = 0; i < bedrooms.length; i++) {
      if (isNaN(bedrooms[i].beds) || parseInt(bedrooms[i].beds) < 0) {
        setErrorMessage(`Bedroom ${i + 1}: Valid number of beds is required`);
        setOpen(true);
        return false;
      }
      if (parseInt(bedrooms[i].beds) > 0 && !bedrooms[i].bedType) {
        setErrorMessage(`Bedroom ${i + 1}: Bed type is required when beds > 0`);
        setOpen(true);
        return false;
      }
    }
    return true;
  };

  async function submit(event) {
    if (event) event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const addressObj = {
      line1: address.line1,
      line2: address.line2,
      city: address.city,
      state: address.state,
      postcode: address.postcode,
      country: address.country,
    };

    const metadataObj = {
      propertyType,
      bathrooms: parseInt(bathrooms),
      bedrooms: bedrooms.map((bedroom) => ({
        beds: parseInt(bedroom.beds),
        bedType: bedroom.bedType,
      })),
      amenities,
    };

    const bodyObj = {
      title: title,
      address: addressObj,
      price: parseFloat(price),
      thumbnail: thumbnail,
      metadata: metadataObj,
    };

    try {
      await axios.post('http://localhost:5005/listings/new',
        bodyObj,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );
      navigate('/hosted-listings');
    } catch(error) {
      setErrorMessage(error.response?.data?.error);
      setOpen(true);
    }
  };

  return (
    <>
      <b>Create a New Listing!!</b>
      <br/>
      <br/>
      <form onSubmit={submit}>
        <TextField 
          id="listing-title" 
          label="Listing Title" 
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />
        <br/>
        <br/>
        <TextField 
          id="address-line1" 
          label="Address Line 1" 
          value={address.line1}
          onChange={(event) => updateAddress('line1', event.target.value)}
          required
        />
        <br/>
        <br/>
        <TextField 
          id="address-line2" 
          label="Address Line 2" 
          value={address.line2}
          onChange={(event) => updateAddress('line2', event.target.value)}
        />
        <br/>
        <br/>
        <TextField 
          id="address-city" 
          label="City" 
          value={address.city}
          onChange={(event) => updateAddress('city', event.target.value)}
          required
        />
        <br/>
        <br/>
        <TextField 
          id="address-state" 
          label="State" 
          value={address.state}
          onChange={(event) => updateAddress('state', event.target.value)}
          required
        />
        <br/>
        <br/>
        <TextField 
          id="address-postcode" 
          label="Postcode" 
          value={address.postcode}
          onChange={(event) => updateAddress('postcode', event.target.value)}
          required
        />
        <br/>
        <br/>
        <TextField 
          id="address-country" 
          label="Country" 
          value={address.country}
          onChange={(event) => updateAddress('country', event.target.value)}
          required
        />
        <br/>
        <br/>
        <TextField 
          id="listing-price" 
          label="Price (Per Night)" 
          type="number" 
          min="0"
          step="0.01"
          value={price}
          onChange={(event) => setPrice(event.target.value)}
          required
        />
        <br/>
        <br/>
        <FormControl required sx={{ width: 195 }}>
          <InputLabel id="property-type-label">Property Type</InputLabel>
          <Select
            labelId="property-type-label"
            id="property-type"
            value={propertyType}
            label="Property Type"
            onChange={(event) => setPropertyType(event.target.value)}
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
          id="bathrooms" 
          label="Bathrooms" 
          type="number" 
          min="0"
          step="1"
          value={bathrooms}
          onChange={(event) => setBathrooms(event.target.value)}
          required
        />
        <br/>
        <br/>
        <TextField 
          id="num-bedrooms" 
          label="Number of Bedrooms" 
          type="number" 
          min="0"
          step="1"
          value={numBedrooms}
          onChange={(event) => setNumBedrooms(event.target.value)}
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
                onChange={(event) => updateBedroom(index, 'beds', event.target.value)}
                required
              />
              <br/>
              <TextField
                id={`bedroom-${index}-type`}
                select
                label="Bed Type"
                value={bedroom.bedType}
                onChange={(event) => updateBedroom(index, 'bedType', event.target.value)}
                required={parseInt(bedroom.beds) > 0}
                sx={{ width: 195 }}
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
            </Box>
          ))}
        </Box>
        <br/>
        <Box>
          <TextField
            id="amenity-input"
            label="Add Amenity"
            type="text"
            value={currentAmenity}
            onChange={(event) => setCurrentAmenity(event.target.value)}
            onKeyUp={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                addAmenity();
              }
            }}
          />
          <br/>
          <br/>
          <Button type="button" onClick={addAmenity} variant="contained">
            Add
          </Button>
          <Box>
            {amenities.map((amenity) => (
              <Box key={amenity}>
                {amenity}
                <Button
                  type="button"
                  onClick={() => removeAmenity(amenity)}
                  variant="outlined"
                  color="error"
                >
                  Remove
                </Button>
              </Box>
            ))}
          </Box>
        </Box>
        <br/>
        <br/>
        <TextField 
          id="thumbnail-file" 
          label="Listing Thumbnail" 
          type="file" 
          accept="image/*"
          onChange={addThumbnail}
          InputLabelProps={{ shrink: true }}
          required
        />
        <br/>
        <br/>
        <Button variant="contained" type="submit">Submit</Button>
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

export default CreateListing;