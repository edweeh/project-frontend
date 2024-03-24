import React, { useState, useEffect } from 'react';
import { useCart } from './CartContext';
import { Card, CardContent, CardMedia, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavBar from './Navbar';
import baseUrl from '../../Api';
import { Buffer } from 'buffer';

const Cart = () => {
  const { state, addToCart, removeFromCart } = useCart();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');
  const [cartItemsWithPets, setCartItemsWithPets] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  

  useEffect(() => {
    const getToken = () => {
        return localStorage.getItem('token');
    };

    const token = getToken();
    if (!token) {
        navigate('/login');
    } else {
        console.log('Token fetched:', token);
        const payload = token.split('.')[1];
        console.log('Token Payload:', payload); // Log the token payload for debugging
        try {
            const decodedPayload = atob(payload);
            console.log('Decoded Payload:', decodedPayload); // Log the decoded payload for debugging
            
            // Extract 'id' as 'userId' and 'username' from decoded payload
            const { id: userId, username: decodedUsername } = JSON.parse(decodedPayload);
            console.log('User Id:', userId); // Log the extracted user ID for debugging
            console.log('Username:', decodedUsername); // Log the extracted username for debugging
            
            // Set the extracted username to the state variable
            setUsername(decodedUsername);
            setUserId(userId);
            // Optionally, you can also set the email state variable if it's available in the payload
            // setEmail(decodedEmail);

            
           
        } catch (error) {
            console.error('Error decoding token payload:', error);
        }
    }
}, []);


useEffect(() => {
  const fetchCartItemsWithPets = async () => {
    try {
      const token = localStorage.getItem('token');
      const payload = token.split('.')[1];
      const { id: userId } = JSON.parse(atob(payload));

      const response = await axios.get(baseUrl + `/cart/fetchcart/${userId}`); // Updated URL
      const cartItems = response.data;
      console.log(cartItems.petsInCart)
      setCartItemsWithPets(cartItems.petsInCart);
      // Fetch corresponding pets for each cart item
      const petResponse = await axios.post('http://localhost:4000/pets/fetch', {
        petcodes: cartItems.map((item) => item.Petcode),
      });
      const petsInCart = petResponse.data;

      // Combine cart items with pet information
      const cartItemsWithPets = cartItems.map((cartItem) => {
        const correspondingPet = petsInCart.find((pet) => pet.Petcode === cartItem.Petcode);
        return { ...cartItem, pet: correspondingPet };
      });

      setCartItemsWithPets(cartItemsWithPets);
    } catch (error) {
      console.error('Error fetching cart items:', error);
    }
  };

  fetchCartItemsWithPets();
}, [deleteDialogOpen]); // Empty dependency array means this effect runs once after the first render

  


const handleBuy = async (item) => {
  try {
    // Log the pet ID
    console.log('Pet code:', item.Petcode);

    // Make an Axios request to create an order
    const response = await axios.post('http://localhost:4000/order/createorder', {
      userId: userId, // Assuming userId is available in the component state
      petcode: item.Petcode,
    });

    // Perform additional actions based on the server response
    console.log('Order response:', response.data);

    // Example: Add the item to the local cart state
    // addToCart(item);

  } catch (error) {
    console.error('Error placing the order:', error);
  }
};

  const handleDelete = (item) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      // Send a request to the server to delete the item
      console.log(itemToDelete);
      await axios.delete(`http://localhost:4000/cart/removecart/${itemToDelete.Petcode}`);
      console.log('Item deleted from the cart on the server');

      // Remove the item from the local cart state
      // removeFromCart(itemToDelete._id);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting item from the cart:', error);
    }
  };

  const cancelDelete = () => {
    setItemToDelete(null);
    setDeleteDialogOpen(false);
  };

  return (
    <div>
      <NavBar trigger={deleteDialogOpen}/>
      <div style={{ width: '400px', marginTop: '20px' }}>
        <h2>{username}'s Cart</h2>
        <div className="cart-items">
          {cartItemsWithPets.map((item) => (
            <Card key={item.id} className="cart-item" style={{ marginBottom: '20px' }}>
              <CardMedia
                component="img"
                height="140"
                image={`data:${item.Image.contentType};base64,${Buffer.from(item.Image.data).toString('base64')}`}
                alt="petImage"
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  {item.PetName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.Breed}
                </Typography>
              </CardContent>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={() => handleBuy(item)}
              >
                Order Now
              </Button>
              <br></br>
              <br></br>
              <Button
                variant="contained"
                color="error" // Use a different color for delete button (e.g., secondary)
                fullWidth
                onClick={() => handleDelete(item)}
              >
                Delete
              </Button>
            </Card>
          ))}
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onClose={cancelDelete}>
        <DialogTitle>Delete Item</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this item from the cart?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Cart;
