import React, { useEffect, useState } from 'react';
import { FormControl, MenuItem, Select, InputLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import ModeEditOutlineIcon from '@mui/icons-material/ModeEditOutline';
import baseUrl from '../../Api';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const Orderview = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(baseUrl + '/order/allorders');
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        const data = await response.json();
        console.log(data);
        setOrders(data.ordersWithPetsAndUsers);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, []);

  const handleDeliveryStatusChange = async (orderId, newDeliveryStatus) => {
    try {
      const response = await fetch(`${baseUrl}/order/updatedeliverystatus/${orderId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ deliveryStatus: newDeliveryStatus })
      });
  
      if (!response.ok) {
        throw new Error('Failed to update delivery status');
      }
  
      // Fetch orders again to update the state with the latest data
      const updatedResponse = await fetch(baseUrl + '/order/allorders');
      if (!updatedResponse.ok) {
        throw new Error('Failed to fetch updated orders');
      }
      const updatedData = await updatedResponse.json();
      setOrders(updatedData.ordersWithPetsAndUsers);
    } catch (error) {
      console.error('Error updating delivery status:', error);
    }
  };

  return (
    <div>
      <Topbar />
      <Sidebar />
      <div className='aa'>
        <Typography>ORDERS VIEW</Typography>
        <br />
        <br />
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>

                <TableCell>User Name</TableCell>
                <TableCell>Address</TableCell>

                <TableCell>Pet Name</TableCell>
                <TableCell>Image</TableCell>
                <TableCell>Order Status</TableCell>
                <TableCell>Delivery Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order, index) => (
                <TableRow key={index}>

                  <TableCell>{order.user ? order.user.username : '-'}</TableCell>
                  <TableCell>{order.address || '-'}</TableCell>
                  <TableCell>{order.pet ? order.pet.PetName : '-'}</TableCell>
                  <TableCell>
                    {order.pet && order.pet.Image ? (
                      <img
                        src={`data:${order.pet.Image.contentType};base64,${order.pet.Image.data}`}
                        alt={order.pet.PetName}
                        style={{ height: '140px', width: 'auto', marginTop: '10px' }}
                      />
                    ) : (
                      <span>No Image Available</span>
                    )}
                  </TableCell>
                  <TableCell>{order.pet ? order.pet.status : '-'}</TableCell>
                  <TableCell>
                    <FormControl fullWidth>
                      <InputLabel>Delivery Status</InputLabel>
                      <Select
  value={order.pet ? order.pet.deliveryStatus : ''}
  onChange={(e) => handleDeliveryStatusChange(order.orderId, e.target.value)}
>
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="onDelivery">On Delivery</MenuItem>
                        <MenuItem value="outOfStock">Out of Stock</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
};

export default Orderview;
