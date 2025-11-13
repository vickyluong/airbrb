import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Alert, Snackbar } from '@mui/material';
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
  const [bedrooms, setBedrooms] = useState([{ beds: '', bedType: '' }]);
  const [amenities, setAmenities] = useState([]);
  const [currentAmenity, setCurrentAmenity] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [open, setOpen] = useState(false);

  const propertyTypes = ['Apartment', 'House', 'Villa', 'Condo', 'Cabin', 'Townhouse', 'Studio', 'Cottage', 'Other'];
  const bedTypes = ['Single', 'Double', 'Queen', 'King', 'Bunk'];

  const addBedroom = () => {
    setBedrooms([...bedrooms, { beds: '', bedType: '' }]);
  };

  const removeBedroom = (index) => {
    if (bedrooms.length > 1) {
      setBedrooms(bedrooms.filter((_, i) => i !== index));
    }
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
    if (!title) {
      setErrorMessage('Listing Title is required');
      setOpen(true);
      return false;
    }
    if (!title) {
      setErrorMessage('Listing Address is required');
      setOpen(true);
      return false;
    }
    if (!price || isNaN(price) || parseInt(price) <= 0) {
      setErrorMessage('Valid Listing Price is required');
      setOpen(true);
      return false;
    }
    if (!propertyType) {
      setErrorMessage('Property Type is required');
      setOpen(true);
      return false;
    }
    if (!bathrooms || isNaN(bathrooms) || parseInt(bathrooms) <= 0) {
      setErrorMessage('Valid number of bathrooms is required');
      setOpen(true);
      return false;
    }
    for (let i = 0; i < bedrooms.length; i++) {
      if (bedrooms[i].beds === '' || isNaN(bedrooms[i].beds) || parseInt(bedrooms[i].beds) < 0) {
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

    const bodyObj = {
      title: title,
      address: address,
      price: parseFloat(price),
      thumbnail: thumbnail,
      propertyType: propertyType,
      bathrooms: parseInt(bathrooms),
      bedrooms: bedrooms.map(bedroom => ({
        beds: parseInt(bedroom.beds),
        bedType: bedroom.bedType
      })),
      amenities: amenities
    };

    try {
      await axios.post('http://localhost:5005/user/auth/logout',
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