import { useState, useEffect, useRef } from 'react';
import { IconButton, Badge, Menu, MenuItem, ListItemText, Typography } from '@mui/material';
import MailIcon from '@mui/icons-material/Mail';
import fetchAllBookings from './helper';

function Notifications({ token }) {
  const user = localStorage.getItem('email');

  const prevBookings = useRef({});
  const notifiedBookings = useRef(new Set());

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const [notifications, setNotifications] = useState([]);

  const storageKey = `unreadNotifications-${user}`;
  // function to save unread notifications to localStorage
  const saveUnread = (notifs) => {
    const unread = notifs.filter((n) => !n.read);
    localStorage.setItem(storageKey, JSON.stringify(unread));
  };

  // function which adds a new notification and saves to localStorage
  const addNotification = (notif) => {
    setNotifications((prev) => {
      const next = [...prev, notif];
      saveUnread(next);
      return next;
    });
  };

  // function which marks a notification as read
  const markAsRead = (id) => {
    setNotifications((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      // calls function which will filter the notification out of unread in local storage 
      saveUnread(next);
      return next;
    });
  };

  // load saved unread notifications from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      setNotifications(parsed);
      parsed.forEach((n) => notifiedBookings.current.add(n.id));
    }
  }, [storageKey]);

  // fetch current bookings
  useEffect(() => {

    async function fetchCurrBookings() {
      const data = await fetchAllBookings(token);
      const bookingsData = data;

      bookingsData.forEach((booking) => {
        // stores the booking in a ref object as a comparison for tracking changes
        prevBookings.current[booking.id] = booking;
        // adds the booking to a set of notified bookings (in the past)
        notifiedBookings.current.add(booking.id);
      });
    }

    fetchCurrBookings();

  }, [token]);


  useEffect(() => {
    // polling set every 5 seconds
    const interval = setInterval(async () => {
      // which fetches bookings and compares to prevBookings for changes 
      const updatedBookings = await fetchAllBookings(token);

      updatedBookings.forEach((booking) => {
        const id = booking.id;
        const old = prevBookings.current[id];

        // the user is a host and receives a notification upon a new booking on their hosted listing
        if (!old && booking.owner !== user && !notifiedBookings.current.has(id)) {
          addNotification({ id, message: 'New booking request!', read: false });
          notifiedBookings.current.add(id);
        }

        // the user is a guest and receives a notification upon their booking status change
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
    // remove read notifications
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