// Clinician form modal for creating new clinicians
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
import useStore from '../../store/useStore';

function ClinicianFormModal() {
  const { modals, closeModal, createClinician } = useStore();
  const isOpen = modals.clinicianForm;

  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    email: '',
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
    const result = await createClinician({
      name: formData.name.trim(),
      specialty: formData.specialty.trim() || null,
      email: formData.email.trim() || null,
    });
    setLoading(false);

    if (result.success) {
      handleClose();
    } else {
      setError(result.error || 'Failed to create clinician');
    }
  };

  const handleClose = () => {
    closeModal('clinicianForm');
    setFormData({ name: '', specialty: '', email: '' });
    setError('');
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Add New Clinician
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
            placeholder="Dr. John Smith"
          />

          <TextField
            label="Specialty"
            value={formData.specialty}
            onChange={(e) => handleChange('specialty', e.target.value)}
            fullWidth
            placeholder="Cardiology"
          />

          <TextField
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            fullWidth
            placeholder="john.smith@clinic.com"
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
  );
}

export default ClinicianFormModal;
