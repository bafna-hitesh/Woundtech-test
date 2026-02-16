// Visit form modal for creating/editing visits
import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import useStore from '../../store/useStore';

// Default form state
const getDefaultFormData = () => ({
  clinician_id: '',
  patient_id: '',
  visit_date: dayjs().hour(9).minute(0),
  duration_minutes: 30,
  status: 'scheduled',
  notes: '',
});

function VisitFormModal() {
  const {
    modals,
    closeModal,
    clinicians,
    patients,
    selectedVisit,
    selectedDate,
    createVisit,
    updateVisit,
    deleteVisit,
  } = useStore();

  const isOpen = modals.visitForm;
  const isEditing = !!selectedVisit;

  // Track modal open state to reset form
  const [wasOpen, setWasOpen] = useState(false);
  const [formData, setFormData] = useState(getDefaultFormData());
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Initialize form when modal opens (using conditional state update pattern)
  if (isOpen && !wasOpen) {
    setWasOpen(true);
    setError('');
    if (selectedVisit) {
      // Editing existing visit
      setFormData({
        clinician_id: selectedVisit.clinician_id,
        patient_id: selectedVisit.patient_id,
        visit_date: dayjs(selectedVisit.visit_date),
        duration_minutes: selectedVisit.duration_minutes,
        status: selectedVisit.status,
        notes: selectedVisit.notes || '',
      });
    } else if (selectedDate) {
      // Creating new visit with pre-selected date
      setFormData({
        ...getDefaultFormData(),
        visit_date: dayjs(selectedDate).hour(9).minute(0),
      });
    } else {
      // Creating new visit
      setFormData(getDefaultFormData());
    }
  } else if (!isOpen && wasOpen) {
    setWasOpen(false);
  }

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.clinician_id) {
      setError('Please select a clinician');
      return;
    }
    if (!formData.patient_id) {
      setError('Please select a patient');
      return;
    }

    setLoading(true);
    
    const data = {
      clinician_id: Number(formData.clinician_id),
      patient_id: Number(formData.patient_id),
      visit_date: formData.visit_date.format('YYYY-MM-DD HH:mm'),
      duration_minutes: formData.duration_minutes,
      status: formData.status,
      notes: formData.notes || null,
    };

    let result;
    if (isEditing) {
      result = await updateVisit(selectedVisit.id, data);
    } else {
      result = await createVisit(data);
    }

    setLoading(false);

    if (result.success) {
      handleClose();
    } else {
      setError(result.error || 'Failed to save visit');
    }
  };

  const handleDelete = async () => {
    if (!selectedVisit) return;
    
    if (window.confirm('Are you sure you want to delete this visit?')) {
      setLoading(true);
      const result = await deleteVisit(selectedVisit.id);
      setLoading(false);
      
      if (result.success) {
        handleClose();
      } else {
        setError(result.error || 'Failed to delete visit');
      }
    }
  };

  const handleClose = () => {
    closeModal('visitForm');
    setFormData({
      clinician_id: '',
      patient_id: '',
      visit_date: dayjs(),
      duration_minutes: 30,
      status: 'scheduled',
      notes: '',
    });
    setError('');
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog open={isOpen} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {isEditing ? 'Edit Visit' : 'New Visit'}
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}

            {/* Clinician Select */}
            <FormControl fullWidth required>
              <InputLabel>Clinician</InputLabel>
              <Select
                value={formData.clinician_id}
                label="Clinician"
                onChange={(e) => handleChange('clinician_id', e.target.value)}
              >
                {clinicians.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name} - {c.specialty}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Patient Select */}
            <FormControl fullWidth required>
              <InputLabel>Patient</InputLabel>
              <Select
                value={formData.patient_id}
                label="Patient"
                onChange={(e) => handleChange('patient_id', e.target.value)}
              >
                {patients.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Date Time Picker */}
            <DateTimePicker
              label="Visit Date & Time"
              value={formData.visit_date}
              onChange={(newValue) => handleChange('visit_date', newValue)}
              slotProps={{
                textField: { fullWidth: true, required: true },
              }}
            />

            {/* Duration */}
            <FormControl fullWidth>
              <InputLabel>Duration</InputLabel>
              <Select
                value={formData.duration_minutes}
                label="Duration"
                onChange={(e) => handleChange('duration_minutes', e.target.value)}
              >
                <MenuItem value={15}>15 minutes</MenuItem>
                <MenuItem value={30}>30 minutes</MenuItem>
                <MenuItem value={45}>45 minutes</MenuItem>
                <MenuItem value={60}>1 hour</MenuItem>
                <MenuItem value={90}>1.5 hours</MenuItem>
                <MenuItem value={120}>2 hours</MenuItem>
              </Select>
            </FormControl>

            {/* Status (only show when editing) */}
            {isEditing && (
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => handleChange('status', e.target.value)}
                >
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            )}

            {/* Notes */}
            <TextField
              label="Notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              multiline
              rows={3}
              fullWidth
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
          <Box>
            {isEditing && (
              <Button
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDelete}
                disabled={loading}
              >
                Delete
              </Button>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Saving...' : isEditing ? 'Update' : 'Create'}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}

export default VisitFormModal;
