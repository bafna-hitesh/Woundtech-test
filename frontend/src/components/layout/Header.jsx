// Header component with app title and action buttons
import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Tooltip,
  Chip,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Badge,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  PersonAdd as PersonAddIcon,
  MedicalServices as MedicalIcon,
  Today as TodayIcon,
  PlayArrow as StartIcon,
  Person as UserIcon,
  Logout as LogoutIcon,
  FactCheck as CheckInIcon,
} from '@mui/icons-material';
import useStore from '../../store/useStore';

function Header() {
  const { 
    openModal, 
    goToToday, 
    user, 
    logout,
    startCheckIn,
    checkInActive,
  } = useStore();

  const [anchorEl, setAnchorEl] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleUserMenuClose();
    logout();
  };

  const handleStartCheckIn = async () => {
    const result = await startCheckIn();
    
    if (result.success) {
      setSnackbar({
        open: true,
        message: `Starting check-in for ${result.count} patients`,
        severity: 'success',
      });
    } else {
      setSnackbar({
        open: true,
        message: result.error || 'Failed to start check-in',
        severity: 'warning',
      });
    }
  };

  return (
    <>
      <AppBar position="static" elevation={1}>
        <Toolbar>
          {/* App Title */}
          <MedicalIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Patient Visit Tracker
          </Typography>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {/* Start Check-in Button */}
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckInIcon />}
              onClick={handleStartCheckIn}
              disabled={checkInActive}
              sx={{ mr: 1 }}
            >
              Start Check-in
            </Button>

            <Divider orientation="vertical" flexItem sx={{ mx: 1, borderColor: 'rgba(255,255,255,0.3)' }} />

            <Tooltip title="Go to Today">
              <IconButton color="inherit" onClick={goToToday}>
                <TodayIcon />
              </IconButton>
            </Tooltip>
            
            <Button
              color="inherit"
              startIcon={<PersonAddIcon />}
              onClick={() => openModal('patientForm')}
              size="small"
            >
              Add Patient
            </Button>
            
            <Button
              color="inherit"
              startIcon={<MedicalIcon />}
              onClick={() => openModal('clinicianForm')}
              size="small"
            >
              Add Clinician
            </Button>
            
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AddIcon />}
              onClick={() => openModal('visitForm')}
            >
              New Visit
            </Button>

            <Divider orientation="vertical" flexItem sx={{ mx: 1, borderColor: 'rgba(255,255,255,0.3)' }} />

            {/* User Menu */}
            <Chip
              avatar={
                <Avatar sx={{ bgcolor: 'secondary.main' }}>
                  <UserIcon fontSize="small" />
                </Avatar>
              }
              label={user?.username || 'Admin'}
              onClick={handleUserMenuOpen}
              sx={{ 
                color: 'white', 
                bgcolor: 'rgba(255,255,255,0.1)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                cursor: 'pointer',
              }}
            />
            
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleUserMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="subtitle2">{user?.username}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.role || 'Administrator'}
                </Typography>
              </Box>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default Header;
