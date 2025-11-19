import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Alert, Snackbar, TextField, MenuItem, Button, Box, FormControl, InputLabel, Select, FormGroup, FormControlLabel, Checkbox, Switch, Typography } from '@mui/material';
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
  const [useYoutubeThumbnail, setUseYoutubeThumbnail] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [numBedrooms, setNumBedrooms] = useState(0);
  const [bedrooms, setBedrooms] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [noneAmenity, setNoneAmenity] = useState(false);
  const [otherAmenityChecked, setOtherAmenityChecked] = useState(false);
  const [otherAmenityValue, setOtherAmenityValue] = useState('');
  const [propertyImages, setPropertyImages] = useState([]);

  const [errorMessage, setErrorMessage] = useState('');
  const [open, setOpen] = useState(false);

  const propertyTypes = ['Apartment', 'House', 'Villa', 'Condo', 'Cabin', 'Townhouse', 'Studio', 'Cottage', 'Other'];
  const bedTypes = ['Single', 'Double', 'Queen', 'King', 'Bunk'];
  const amenityOptions = ['Wi-Fi', 'Air Conditioning', 'Heating', 'Kitchen', 'Washer', 'Dryer', 'Parking', 'Pool', 'Gym', 'Fireplace', 'Outdoor Space'];

  useEffect(() => {
    const n = parseInt(numBedrooms);
    if (isNaN(n) || n < 0) return;
    if (bedrooms.length < n) {
      const toAdd = Array.from({ length: n - bedrooms.length }, () => ({ beds: '', bedTypes: [] }));
      setBedrooms(prev => [...prev, ...toAdd]);
    } else if (bedrooms.length > n) {
      setBedrooms(prev => prev.slice(0, n));
    }
  }, [numBedrooms]);

  const updateBedroom = (index, field, value) => {
    setBedrooms(prev => {
      const updatedBedrooms = [...prev];
      const room = {...updatedBedrooms[index]};

      if (field === "beds") {
        const count = parseInt(value);
        room.beds = value;

        if (!isNaN(count)) {
          room.bedTypes = [
            ...room.bedTypes.slice(0, count),
            ...Array(Math.max(0, count - room.bedTypes.length)).fill("")
          ];
        }
      } else if (field.startsWith("bedType-")) {
        const i = Number(field.split("-")[1]);
        const types = [...room.bedTypes];
        types[i] = value;
        room.bedTypes = types;
      }

      updatedBedrooms[index] = room;
      return updatedBedrooms;
    });
  };

  const updateAddress = (field, value) => {
    setAddress((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleAmenity = (amenity) => {
    const exists = amenities.includes(amenity);
    if (exists) {
      setAmenities(amenities.filter((item) => item !== amenity));
    } else {
      setAmenities((prev) => [...prev, amenity]);
      if (noneAmenity) {
        setNoneAmenity(false);
      }
    }
  };

  const noAmenity = (checked) => {
    setNoneAmenity(checked);
    if (checked) {
      setAmenities([]);
      setOtherAmenityChecked(false);
      setOtherAmenityValue('');
    }
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
        setThumbnail(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const addPropertyImages = (event) => {
    const files = Array.from(event.target.files);
    const readers = [];

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPropertyImages((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleYoutubeToggle = (checked) => {
    setUseYoutubeThumbnail(checked);
    if (checked) {
      setThumbnail('');
    } else {
      setYoutubeUrl('');
    }
  };

  const checkJsonFile = (data) => {
    if (!data.title || typeof data.title !== 'string') {
      setErrorMessage('The JSON file must contain a valid title field (string)');
      setOpen(true);
      return false;
    }
    if (!data.address || typeof data.address !== 'object') {
      setErrorMessage('The JSON file must contain an address object');
      setOpen(true);
      return false;
    }
    if (typeof data.price !== 'number' || data.price <= 0) {
      setErrorMessage('The JSON file must contain a valid price field (positive number)');
      setOpen(true);
      return false;
    }
    if (!data.thumbnail || typeof data.thumbnail !== 'string') {
      setErrorMessage('The JSON file must contain a valid thumbnail field (string)');
      setOpen(true);
      return false;
    }
    if (!data.metadata || typeof data.metadata !== 'object') {
      setErrorMessage('The JSON file must contain a metadata object');
      setOpen(true);
      return false;
    }

    const addressFields = ['line1', 'city', 'state', 'postcode', 'country'];
    for (const field of addressFields) {
      if (data.address[field] === undefined || typeof data.address[field] !== 'string') {
        setErrorMessage(`Address must contain "${field}" field (string)`);
        setOpen(true);
        return false;
      }
    }
    if (data.address.line2 !== undefined && typeof data.address.line2 !== 'string') {
      setErrorMessage('If address line2 is included, it must be a string');
      setOpen(true);
      return false;
    }

    if (!data.metadata.propertyType || typeof data.metadata.propertyType !== 'string') {
      setErrorMessage('Metadata must contain a propertyType field (string)');
      setOpen(true);
      return false;
    }
    if (typeof data.metadata.bathrooms !== 'number' || data.metadata.bathrooms < 0) {
      setErrorMessage('Metadata must contain a valid bathrooms field (positive number)');
      setOpen(true);
      return false;
    }
    if (!Array.isArray(data.metadata.bedrooms)) {
      setErrorMessage('Metadata must contain a bedrooms field (array)');
      setOpen(true);
      return false;
    }
    if (!Array.isArray(data.metadata.amenities)) {
      setErrorMessage('Metadata must contain an amenities field (array)');
      setOpen(true);
      return false;
    }
    if (data.metadata.images !== undefined && !Array.isArray(data.metadata.images)) {
      setErrorMessage('Metadata property "images" field must be an array if present');
      setOpen(true);
      return false;
    }

    for (let i = 0; i < data.metadata.bedrooms.length; i++) {
      const bedroom = data.metadata.bedrooms[i];
      if (!bedroom || typeof bedroom !== 'object') {
        setErrorMessage(`Bedroom ${i + 1} must be an object`);
        setOpen(true);
        return false;
      }
      if (typeof bedroom.beds !== 'number' || bedroom.beds < 0) {
        setErrorMessage(`Bedroom ${i + 1} must have valid a beds field (positive number)`);
        setOpen(true);
        return false;
      }
      if (!Array.isArray(bedroom.bedTypes)) {
        setErrorMessage(`Bedroom ${i + 1} must have a bedTypes field (array)`);
        setOpen(true);
        return false;
      }
      if (bedroom.bedTypes.length !== bedroom.beds) {
        setErrorMessage(`Bedroom ${i + 1}: number of bedTypes must match the number of beds`);
        setOpen(true);
        return false;
      }
      for (let j = 0; j < bedroom.bedTypes.length; j++) {
        if (typeof bedroom.bedTypes[j] !== 'string') {
          setErrorMessage(`Bedroom ${i + 1}, bed ${j + 1}: bedType must be a string`);
          setOpen(true);
          return false;
        }
      }
    }

    for (let i = 0; i < data.metadata.amenities.length; i++) {
      if (typeof data.metadata.amenities[i] !== 'string') {
        setErrorMessage(`Amenity ${i + 1} must be a string`);
        setOpen(true);
        return false;
      }
    }

    if (data.metadata.images) {
      for (let i = 0; i < data.metadata.images.length; i++) {
        if (typeof data.metadata.images[i] !== 'string') {
          setErrorMessage(`Image ${i + 1} must be a string (base64 data URL)`);
          setOpen(true);
          return false;
        }
      }
    }

    return true;
  };

  const handleJsonUpload = (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    if (!file.name.endsWith('.json')) {
      setErrorMessage('Please upload a .json file');
      setOpen(true);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target.result);
        
        if (!checkJsonFile(jsonData)) {
          return;
        }

        setTitle(jsonData.title);
        setAddress({
          line1: jsonData.address.line1 || '',
          line2: jsonData.address.line2 || '',
          city: jsonData.address.city || '',
          state: jsonData.address.state || '',
          postcode: jsonData.address.postcode || '',
          country: jsonData.address.country || '',
        });
        setPrice(jsonData.price.toString());
        setPropertyType(jsonData.metadata.propertyType);
        setBathrooms(jsonData.metadata.bathrooms.toString());
        setNumBedrooms(jsonData.metadata.bedrooms.length);

        if (jsonData.thumbnail.startsWith('https://www.youtube.com/embed/')) {
          setUseYoutubeThumbnail(true);
          setYoutubeUrl(jsonData.thumbnail);
          setThumbnail('');
        } else {
          setUseYoutubeThumbnail(false);
          setThumbnail(jsonData.thumbnail);
          setYoutubeUrl('');
        }

        const bedroomData = jsonData.metadata.bedrooms.map((bedroom) => ({
          beds: bedroom.beds.toString(),
          bedTypes: [...bedroom.bedTypes],
        }));
        setBedrooms(bedroomData);

        const amenityList = jsonData.metadata.amenities;
        const hasNone = amenityList.includes('None of the above');
        
        if (hasNone) {
          setNoneAmenity(true);
          setAmenities([]);
          setOtherAmenityChecked(false);
          setOtherAmenityValue('');
        } else {
          setNoneAmenity(false);
          const standardAmenities = amenityList.filter(a => amenityOptions.includes(a));
          const otherAmenities = amenityList.filter(a => !amenityOptions.includes(a) && a !== 'None of the above');
          
          setAmenities(standardAmenities);
          if (otherAmenities.length > 0) {
            setOtherAmenityChecked(true);
            setOtherAmenityValue(otherAmenities[0]);
          } else {
            setOtherAmenityChecked(false);
            setOtherAmenityValue('');
          }
        }

        if (jsonData.metadata.images && jsonData.metadata.images.length > 0) {
          setPropertyImages([...jsonData.metadata.images]);
        } else {
          setPropertyImages([]);
        }

        setJsonFileUploaded(true);
      } catch (error) {
        setErrorMessage('Invalid JSON file: ' + error.message);
        setOpen(true);
      }
    };

    reader.onerror = () => {
      setErrorMessage('Error reading JSON file');
      setOpen(true);
    };

    reader.readAsText(file);
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
      if (parseInt(bedrooms[i].beds) > 0 && !bedrooms[i].bedTypes) {
        setErrorMessage(`Bedroom ${i + 1}: Bed type is required when there are more than 0 beds`);
        setOpen(true);
        return false;
      }
    }
    if (!noneAmenity && amenities.length === 0 && !(otherAmenityChecked && otherAmenityValue)) {
      setErrorMessage('Select at least one amenity or choose None of the above');
      setOpen(true);
      return false;
    }
    if (otherAmenityChecked && !otherAmenityValue) {
      setErrorMessage('Specify the other amenity or uncheck Other');
      setOpen(true);
      return false;
    }
    if (useYoutubeThumbnail) {
      const embedPattern = /^https:\/\/www\.youtube\.com\/embed\/[A-Za-z0-9_-]+(\?.*)?$/;
      if (!embedPattern.test(youtubeUrl.trim())) {
        setErrorMessage('Please provide a valid YouTube embed URL (e.g. https://www.youtube.com/embed/...)');
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

    const amenitiesList = noneAmenity
      ? ['None of the above']
      : [
          ...amenities,
          ...(otherAmenityChecked && otherAmenityValue ? [otherAmenityValue] : []),
        ];

    const metadataObj = {
      propertyType,
      bathrooms: parseInt(bathrooms),
      bedrooms: bedrooms.map((bedroom) => ({
        beds: parseInt(bedroom.beds),
        bedTypes: bedroom.bedTypes,
      })),
      amenities: amenitiesList,
      images: propertyImages,
    };

    let thumbnailToSend;

    if (useYoutubeThumbnail) {
      thumbnailToSend = youtubeUrl.trim();
    } else {
      thumbnailToSend = thumbnail;
    }

    const bodyObj = {
      title: title,
      address: addressObj,
      price: parseFloat(price),
      thumbnail: thumbnailToSend,
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
              {Array.from({ length: parseInt(bedroom.beds) || 0 }).map((_, bedIndex) => (
                <TextField
                  key={bedIndex}
                  id={`bedroom-${index}-bedtype-${bedIndex}`}
                  select
                  label={`Bed Type #${bedIndex + 1}`}
                  value={bedroom.bedTypes[bedIndex] || ''}
                  onChange={(event) => updateBedroom(index, `bedType-${bedIndex}`, event.target.value)}
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
          <b>Amenities *</b>
          <FormGroup sx={{ marginTop: 1 }}>
            {amenityOptions.map((option) => (
              <FormControlLabel
                key={option}
                control={
                  <Checkbox
                    checked={amenities.includes(option)}
                    onChange={() => toggleAmenity(option)}
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
                value={otherAmenityValue}
                onChange={(event) => setOtherAmenityValue(event.target.value)}
                required={otherAmenityChecked}
                sx={{ maxWidth: 280, marginBottom: 2 }}
              />
            )}
            <FormControlLabel
              control={
                <Checkbox
                  checked={noneAmenity}
                  onChange={(event) => noAmenity(event.target.checked)}
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
              id="thumbnail-file" 
              label="Listing Thumbnail" 
              type="file" 
              accept="image/*"
              onChange={addThumbnail}
              InputLabelProps={{ shrink: true }}
              sx={{ marginTop: 2 }}
              required
            />
          )}
          {useYoutubeThumbnail && (
            <TextField
              id="thumbnail-youtube"
              label="YouTube Embed URL"
              value={youtubeUrl}
              onChange={(event) => setYoutubeUrl(event.target.value)}
              helperText="Example: https://www.youtube.com/embed/VIDEO_ID"
              fullWidth
              sx={{ marginTop: 2 }}
              required
            />
          )}
        </Box>
        <br/>
        <br/>
        <Box>
          <Typography sx={{ fontWeight: 'bold' }}>Property Images (Optional)</Typography>
          <TextField
            id="property-images"
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