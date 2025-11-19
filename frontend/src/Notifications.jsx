import { useState, useEffect } from 'react';
import { IconButton, Badge, Menu, MenuItem, ListItemText, Typography } from '@mui/material';
import MailIcon from '@mui/icons-material/Mail';
import axios from 'axios';

function Notifications(props) {
  const token = props.token;
  const user = localStorage.getItem('email');

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const [bookings, setBookings] = useState({});
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchInitialBookings = async () => {
      const res = await axios.get('http://localhost:5005/bookings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(res.data.bookings);
      setBookings(res.data.bookings); 
    };
  
    fetchInitialBookings();

  }, []);

  // rerenders notifcations everytime bookings changes 
  useEffect(() => {
    // const fetchInitialBookings = async () => {
    //   const res = await axios.get('http://localhost:5005/bookings', {
    //     headers: { Authorization: `Bearer ${token}` },
    //   });
    //   console.log(res.data.bookings);
    //   setBookings(res.data.bookings); 
    // };
  
    // fetchInitialBookings();
    // fetch bookings constantly
    const interval = setInterval(async () => {
      // fetch all bookings 
      const res = await axios.get('http://localhost:5005/bookings', 
      { headers: { 
        Authorization: `Bearer ${token}`,
        }
      });

      console.log(res.data.bookings);

      setBookings(prevBookings => {
        const updatedBookings = res.data.bookings;
      
        Object.keys(updatedBookings).forEach(id => {
          const old = prevBookings[id]; // use the latest state
      
          // Host notification
          if (!old && updatedBookings[id].owner !== user) {
            setNotifications(n => [
              ...n,
              { message: `New booking request!`, read: false },
            ]);
          }
      
          // Guest notification
          if (old && old.status !== updatedBookings[id].status && updatedBookings[id].owner === user) {
            setNotifications(n => [
              ...n,
              { message: `Your booking was ${updatedBookings[id].status}! :)`, read: false },
            ]);
          }
        });
      
        return updatedBookings;
      });
    }, 5000);
  
    return () => clearInterval(interval);
  }, [token, user]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    // mark all notifications as read when opened
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    // setNotifications([]); 
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
      <>
      <IconButton onClick={handleClick}>
        <Badge badgeContent={notifications.filter(n => !n.read).length} color="error">
          <MailIcon color="action" />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: { maxHeight: 300, width: 300 },
        }}
      >
        {notifications.length === 0 ? (
          <MenuItem disabled>No notifications</MenuItem>
        ) : (
          notifications.map((notif, index) => (
            <MenuItem key={index} onClick={handleClose}>
              <ListItemText 
              primary={
              <Typography fontWeight="bold">
                    {notif}
                  </Typography>} />
            </MenuItem>
          ))
        )}
      </Menu>
      </> 
  )

}

export default Notifications