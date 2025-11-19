import { useState, useEffect, useRef } from 'react';
import { IconButton, Badge, Menu, MenuItem, ListItemText, Typography } from '@mui/material';
import MailIcon from '@mui/icons-material/Mail';
import axios from 'axios';

function Notifications({ token }) {
  const user = localStorage.getItem('email');

  const prevBookings = useRef({});
  const notifiedBookings = useRef(new Set());

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const [notifications, setNotifications] = useState([]);

  // Helper to save unread notifications to localStorage
  const saveUnread = (notifs) => {
    const unread = notifs.filter((n) => !n.read);
    localStorage.setItem('unreadNotifications', JSON.stringify(unread));
  };

  // Add a new notification and immediately save
  const addNotification = (notif) => {
    setNotifications((prev) => {
      const next = [...prev, notif];
      saveUnread(next);
      return next;
    });
  };

  // Mark a notification as read and immediately save
  const markAsRead = (id) => {
    setNotifications((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      saveUnread(next);
      return next;
    });
  };

  // Load saved unread notifications from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('unreadNotifications');
    if (saved) {
      const parsed = JSON.parse(saved);
      setNotifications(parsed);
      parsed.forEach((n) => notifiedBookings.current.add(n.id));
    }
  }, []);

  // Fetch initial bookings to prevent duplicate notifications
  useEffect(() => {
    const fetchInitialBookings = async () => {
      const res = await axios.get('http://localhost:5005/bookings', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const bookingsData = res.data.bookings || [];
      bookingsData.forEach((booking) => {
        prevBookings.current[booking.id] = booking;
        notifiedBookings.current.add(booking.id);
      });
    };
    fetchInitialBookings();
  }, [token]);

  // Poll for booking changes every 5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await axios.get('http://localhost:5005/bookings', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updatedBookings = res.data.bookings || [];

      updatedBookings.forEach((booking) => {
        const id = booking.id;
        const old = prevBookings.current[id];

        // HOST: new booking
        if (!old && booking.owner !== user && !notifiedBookings.current.has(id)) {
          addNotification({ id, message: 'New booking request!', read: false });
          notifiedBookings.current.add(id);
        }

        // GUEST: status changed
        if (old && old.status !== booking.status && booking.owner === user) {
          const changeKey = `${id}-${booking.status}`;
          if (!notifiedBookings.current.has(changeKey)) {
            addNotification({
              id: changeKey,
              message: `Your booking was ${booking.status}!`,
              read: false,
            });
            notifiedBookings.current.add(changeKey);
          }
        }

        // Update snapshot
        prevBookings.current[id] = booking;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [token, user]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    // Remove read notifications
    setNotifications((prev) => {
      const next = prev.filter((n) => !n.read);
      saveUnread(next);
      return next;
    });
  };

  return (
    <>
      <IconButton onClick={handleClick}>
        <Badge badgeContent={notifications.filter((n) => !n.read).length} color="error">
          <MailIcon color="action" />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{ style: { maxHeight: 300, width: 300 } }}
      >
        {notifications.length === 0 ? (
          <MenuItem disabled>No notifications</MenuItem>
        ) : (
          notifications.map((notif) => (
            <MenuItem key={notif.id} onClick={() => markAsRead(notif.id)}>
              <ListItemText
                primary={
                  <Typography fontWeight={notif.read ? 'normal' : 'bold'}>
                    {notif.message}
                  </Typography>
                }
              />
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
}

export default Notifications;