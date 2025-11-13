import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Alert, Snackbar, TextField, MenuItem, Button, Box } from '@mui/material';
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
  const [address, setAddress] = useState('');
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
      street: address,
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
}

export default CreateListing;