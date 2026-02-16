// Patient form modal for creating new patients
import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import useStore from '../../store/useStore';

function PatientFormModal() {
  const { modals, closeModal, createPatient } = useStore();
  const isOpen = modals.patientForm;

  const [formData, setFormData] = useState({
    name: '',
    date_of_birth: null,
    email: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    setLoading(true);
    const result = await createPatient({
      name: formData.name.trim(),
      date_of_birth: formData.date_of_birth
        ? formData.date_of_birth.format('YYYY-MM-DD')
        : null,
      email: formData.email.trim() || null,
      phone: formData.phone.trim() || null,
    });
    setLoading(false);

    if (result.success) {
      handleClose();
    } else {
      setError(result.error || 'Failed to create patient');
    }
  };

  const handleClose = () => {
    closeModal('patientForm');
    setFormData({ name: '', date_of_birth: null, email: '', phone: '' });
    setError('');
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog open={isOpen} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Add New Patient
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              label="Name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
              fullWidth
              placeholder="John Doe"
            />

            <DatePicker
              label="Date of Birth"
              value={formData.date_of_birth}
              onChange={(newValue) => handleChange('date_of_birth', newValue)}
              slotProps={{
                textField: { fullWidth: true },
              }}
              maxDate={dayjs()}
            />

            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              fullWidth
              placeholder="john.doe@email.com"
            />

            <TextField
              label="Phone"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              fullWidth
              placeholder="555-0100"
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}

export default PatientFormModal;
