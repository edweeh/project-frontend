import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  Button
} from '@mui/material';
import './Sidebar.css';

const Sidebar = () => {
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const handleLogoutOpen = () => {
    setLogoutDialogOpen(true);
  };

  const handleLogoutClose = () => {
    setLogoutDialogOpen(false);
  };

  return (
    <div className="sidebar">
      <ul>
        <Link to='/Adminhome'><li>HOME</li></Link>
      </ul>
      Registrations
      <ul>
        <Link to='/Category'><li>Category</li></Link>
        <Link to='/Pet'><li>Pet</li></Link>
      </ul>
      View
      <ul>
        <Link to="/Categoryview"><li>Category View</li></Link>
        <Link to="/Petview"><li>Pet View</li></Link>
      </ul>
      Orders
      <ul>
        <Link to="/orderview"><li>Order View</li></Link>
      </ul>
      <ul>
        <li onClick={handleLogoutOpen}>Log Out</li>
      </ul>

      {/* Logout confirmation dialog */}
      <Dialog open={logoutDialogOpen} onClose={handleLogoutClose}>
        <DialogTitle>Log Out</DialogTitle>
        <DialogContent>
          Are you sure you want to log out?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLogoutClose} color="primary">
            Cancel
          </Button>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Button color="error">
              Log Out
            </Button>
          </Link>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Sidebar;
