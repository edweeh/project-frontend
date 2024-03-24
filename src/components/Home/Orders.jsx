import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Card, Button, CardContent, Typography, InputLabel } from '@mui/material';
import NavBar from './Navbar';
import baseUrl from '../../Api';

const Orders = () => {
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');
  const [orders, setOrders] = useState([]);
  const [items, setItems] = useState([]);
  const [showAddressInput, setShowAddressInput] = useState({});
  const [address, setAddress] = useState({});
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      const response = await axios.get(baseUrl + `/order/fetchorders/${userId}`);
      console.log('Orders response:', response.data);
      setOrders(response.data.orders);
      setItems(response.data.petsInOrders);

      // Initialize address state for each order
      const initialAddressState = {};
      response.data.orders.forEach(order => {
        initialAddressState[order._id] = '';
      });
      setAddress(initialAddressState);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  useEffect(() => {
    const getToken = () => {
      return localStorage.getItem('token');
    };

    const token = getToken();
    if (!token) {
      navigate('/login');
    } else {
      const payload = token.split('.')[1];
      try {
        const decodedPayload = atob(payload);
        const { id: userId, username: decodedUsername } = JSON.parse(decodedPayload);

        setUsername(decodedUsername);
        setUserId(userId);

        // Fetch orders by userId
        fetchOrders();
      } catch (error) {
        console.error('Error decoding token payload:', error);
      }
    }
  }, [navigate, userId]);

  const handleConfirmOrder = (orderId) => {
    // Show address input for the specific order
    setShowAddressInput(prevState => ({
      ...prevState,
      [orderId]: true
    }));
  };

  const handleCancelOrder = async (orderId) => {
    try {
      const response = await axios.delete(baseUrl + `/order/deleteorder/${orderId}`);
      if (response.status === 200) {
        console.log('Order deleted successfully');
        fetchOrders(); // Fetch orders again after deletion
      } else {
        console.error('Failed to delete order:', response.data.message);
        // Optionally, display an error message to the user
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      // Optionally, display an error message to the user
    }
  };

  const handleplaceOrder = async (orderId) => {
    try {
      // Get the address for the specific order
      const addressValue = address[orderId];

      // Make a POST request to the backend API to save the address
      const response = await axios.post(baseUrl + `/order/placeorder/${orderId}`, { address: addressValue });

      // Check if the request was successful (status code 200)
      if (response.status === 200) {
        // Address saved successfully
        fetchOrders(); // Fetch orders again after saving address
        console.log('Address saved for order', orderId, ':', addressValue);
        // Optionally, you can perform additional actions here, such as updating state
        setShowAddressInput(prevState => ({
          ...prevState,
          [orderId]: false
        }));
      } else {
        // Handle other status codes if needed
        console.error('Failed to save address:', response.data.message);
        // Optionally, display an error message to the user
      }
    } catch (error) {
      // Handle network errors or other exceptions
      console.error('Error saving address:', error);
      // Optionally, display an error message to the user
    }
  };

  return (
    <div>
      <NavBar />
      <div style={{ width: '100%', marginTop: '20px', display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
        {items.map((pet) => (
          <Card key={pet._id} style={{ width: '400px', margin: '10px' }}>
            <CardContent>
              <Typography gutterBottom variant="h5" component="div">
                Pet Name: {pet.PetName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Breed: {pet.Breed}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Price: {pet.Price}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Order status : {pet.status}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Delivery Status : {pet.deliveryStatus}
              </Typography>
              <div>
                <img
                  src={`data:${pet.Image.contentType};base64,${pet.Image.data}`}
                  alt={pet.PetName}
                  style={{ height: '140px', width: 'auto', marginTop: '10px' }}
                />
              </div>
              {/* Show address input when confirm order button is clicked */}
              {showAddressInput[pet.orderId] && (
                <div>
                  <InputLabel>Enter Delivery Address</InputLabel>
                  <input
                    type="text"
                    value={address[pet.orderId]}
                    onChange={(e) => setAddress(prevState => ({
                      ...prevState,
                      [pet.orderId]: e.target.value
                    }))}
                    placeholder="Enter Address"
                    style={{ marginTop: '10px', width: '100%', padding: '5px' }}
                  />
                  <Button variant="contained" onClick={() => handleplaceOrder(pet.orderId)} style={{ marginTop: '10px' }}>
                    Save
                  </Button>
                </div>
              )}
              {!showAddressInput[pet.orderId] && (
                <div>
                  {pet.status === 'placed' && (
                    <Button variant="contained" onClick={() => handleCancelOrder(pet.orderId)} style={{ marginTop: '10px', marginRight: '10px' }}>
                      Cancel Order
                    </Button>
                  )}
                  {pet.status !== 'placed' && (
                    <Button variant="contained" onClick={() => handleConfirmOrder(pet.orderId)} style={{ marginTop: '10px' }}>
                      Confirm Order
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Orders;
