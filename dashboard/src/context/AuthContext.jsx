import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookie from 'js-cookie';
import axiosInstance from '../axiosConfig';
import { jwtDecode } from 'jwt-decode';
import { io } from 'socket.io-client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    id: null,
    name: null,
    email: null,
    image: null,
  });
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [userInteracted, setUserInteracted] = useState(false);

  // Detect user interaction once
  useEffect(() => {
    const handleInteraction = () => {
      setUserInteracted(true);
      window.removeEventListener('click', handleInteraction);
    };
    window.addEventListener('click', handleInteraction);
    return () => window.removeEventListener('click', handleInteraction);
  }, []);

  const fetchUserData = async (userId) => {
    try {
      const token = Cookie.get('token');
      if (!token) return;

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const endpoint = `/admin/${userId}`;
      const response = await axiosInstance.get(endpoint, config);
      if (!response.data) return;

      setUser({
        id: response.data._id || userId,
        name: response.data.name || '',
        email: response.data.email || '',
        image: response.data.image || '',
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleIncomingNotification = (notification) => {
    if (notification.notifID && notification.title && notification.message) {
      setNotifications((prevNotifications) => {
        const exists = prevNotifications.some(
          (notif) => notif.notifID === notification.notifID
        );
        if (!exists) {
          const updatedNotifications = [...prevNotifications, notification];
          localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
          return updatedNotifications;
        }
        return prevNotifications;
      });

      if (userInteracted) {
        const notificationSound = new Audio('/notification.mp3');
        notificationSound.play().catch((err) =>
          console.warn('Unable to play sound:', err)
        );
      } else {
        console.log('User has not interacted with the page yet. Sound skipped.');
      }
    } else {
      console.log('Received invalid notification, ignoring...', notification);
    }
  };

  useEffect(() => {
    // Check if there are any notifications in localStorage
    const savedNotifications = JSON.parse(localStorage.getItem('notifications')) || [];
    setNotifications(savedNotifications);

    const initializeUser = async () => {
      const token = Cookie.get('token');

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const decoded = jwtDecode(token);
        const { id } = decoded;

        await fetchUserData(id); // to make sure user is fetched

        const socketInstance = io('http://localhost:5001');
        setSocket(socketInstance);

        socketInstance.on('connect', () => {
          socketInstance.emit('register', { userId: id, role: 'admin' });
        });

        socketInstance.on('new-notification', handleIncomingNotification);
      } catch (error) {
        console.error('Error initializing user:', error);
        Cookie.remove('token');
      } finally {
        setLoading(false);
      }
    };

    initializeUser();
  }, [userInteracted]);

  const login = async (email, password) => {
    try {
      const response = await axiosInstance.post('/admin/login', { email, password });
      Cookie.set('token', response.data.token, { expires: 1 });

      const decoded = jwtDecode(response.data.token);
      const { id } = decoded;

      await fetchUserData(id);

      const socketInstance = io('http://localhost:5001');
      setSocket(socketInstance);

      socketInstance.on('connect', () => {
        socketInstance.emit('register', { userId: id, role: 'admin' });
      });

      socketInstance.on('new-notification', handleIncomingNotification);

      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    Cookie.remove('token');
    setUser({ id: null, name: null, email: null, image: null });
    if (socket) {
      socket.disconnect();
      console.log('Socket disconnected on logout');
    }
  };

  const removeNotification = (notifID) => {
    // Remove the notification with the given notifID
    const updatedNotifications = notifications.filter((notif) => notif.notifID !== notifID);
    setNotifications(updatedNotifications);
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications)); // Update localStorage
  };

  const value = {
    user,
    loading,
    socket,
    notifications,
    login,
    logout,
    removeNotification,
    isAuthenticated: !!user?.id,
    updateUser: (newUserData) => {
      setUser((prev) => ({
        ...prev,
        ...newUserData,
      }));
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};