// Main App component
import { useEffect } from 'react';
import { Box, Container, CircularProgress, Typography, Alert } from '@mui/material';
import useStore from './store/useStore';

// Components
import LoginPage from './components/auth/LoginPage';
import Header from './components/layout/Header';
import CalendarHeader from './components/calendar/CalendarHeader';
import CalendarGrid from './components/calendar/CalendarGrid';
import VisitFormModal from './components/forms/VisitFormModal';
import ClinicianFormModal from './components/forms/ClinicianFormModal';
import PatientFormModal from './components/forms/PatientFormModal';
import CheckInModal from './components/forms/CheckInModal';

function App() {
  const {
    isLoggedIn,
    fetchClinicians,
    fetchPatients,
    fetchVisits,
    loading,
    errors,
  } = useStore();

  // Fetch initial data on mount (only when logged in)
  useEffect(() => {
    if (isLoggedIn) {
      fetchClinicians();
      fetchPatients();
      fetchVisits();
    }
  }, [isLoggedIn, fetchClinicians, fetchPatients, fetchVisits]);

  // Show login page if not logged in
  if (!isLoggedIn) {
    return <LoginPage />;
  }

  // Show loading state while fetching initial data
  const isInitialLoading = loading.clinicians && loading.patients && loading.visits;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'grey.100' }}>
      {/* Header */}
      <Header />

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ py: 3, flex: 1 }}>
        {/* Error Messages */}
        {errors.clinicians && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Error loading clinicians: {errors.clinicians}
          </Alert>
        )}
        {errors.patients && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Error loading patients: {errors.patients}
          </Alert>
        )}
        {errors.visits && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Error loading visits: {errors.visits}
          </Alert>
        )}

        {/* Loading State */}
        {isInitialLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Calendar Header with filters */}
            <CalendarHeader />

            {/* Calendar Grid */}
            <CalendarGrid />
          </>
        )}
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 2,
          px: 3,
          backgroundColor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="body2" color="text.secondary" align="center">
          Patient Visit Tracker - Woundtech
        </Typography>
      </Box>

      {/* Modals */}
      <VisitFormModal />
      <ClinicianFormModal />
      <PatientFormModal />
      <CheckInModal />
    </Box>
  );
}

export default App;
