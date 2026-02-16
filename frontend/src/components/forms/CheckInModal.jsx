// Check-in modal for processing patient queue
import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Chip,
  LinearProgress,
  Alert,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Person as PatientIcon,
  MedicalServices as ClinicianIcon,
  AccessTime as TimeIcon,
  Timer as DurationIcon,
  SkipNext as SkipIcon,
  CheckCircle as CompleteIcon,
  Close as CloseIcon,
  Notes as NotesIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import useStore from '../../store/useStore';

function CheckInModal() {
  const {
    modals,
    checkInQueue,
    currentCheckInIndex,
    getCurrentCheckInVisit,
    completeCheckIn,
    skipCheckIn,
    cancelCheckIn,
  } = useStore();

  const isOpen = modals.checkIn;
  const currentVisit = getCurrentCheckInVisit();
  
  // Track which visit we're editing to reset notes when it changes
  const [visitId, setVisitId] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [showComplete, setShowComplete] = useState(false);

  // Reset notes when visit changes (using conditional state update pattern)
  if (currentVisit && currentVisit.id !== visitId) {
    setVisitId(currentVisit.id);
    setNotes(currentVisit.notes || '');
  }

  // Calculate progress
  const totalPatients = checkInQueue.length;
  const progress = totalPatients > 0 
    ? ((currentCheckInIndex) / totalPatients) * 100 
    : 0;

  const handleComplete = async () => {
    setLoading(true);
    const result = await completeCheckIn(notes);
    setLoading(false);

    if (result.done) {
      setShowComplete(true);
      setTimeout(() => {
        setShowComplete(false);
      }, 2000);
    }
  };

  const handleSkip = () => {
    const result = skipCheckIn();
    if (result.done) {
      setShowComplete(true);
      setTimeout(() => {
        setShowComplete(false);
      }, 2000);
    }
  };

  const handleClose = () => {
    cancelCheckIn();
  };

  // All done view
  if (showComplete || (!currentVisit && isOpen)) {
    return (
      <Dialog open={isOpen} maxWidth="sm" fullWidth>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CompleteIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              All Done!
            </Typography>
            <Typography color="text.secondary">
              All patients have been processed.
            </Typography>
            <Button
              variant="contained"
              onClick={handleClose}
              sx={{ mt: 3 }}
            >
              Close
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  if (!currentVisit) return null;

  const visitTime = dayjs(currentVisit.visit_date).format('h:mm A');

  return (
    <Dialog open={isOpen} maxWidth="sm" fullWidth>
      {/* Progress Header */}
      <Box sx={{ px: 3, pt: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Patient {currentCheckInIndex + 1} of {totalPatients}
          </Typography>
          <Chip 
            label={`${Math.round(progress)}% Complete`} 
            size="small" 
            color="primary"
            variant="outlined"
          />
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={progress} 
          sx={{ borderRadius: 1 }}
        />
      </Box>

      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 50, height: 50 }}>
            <PatientIcon />
          </Avatar>
          <Box>
            <Typography variant="h6">
              {currentVisit.patient_name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Check-in for appointment
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Visit Details */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {/* Clinician */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <ClinicianIcon color="action" />
            <Box>
              <Typography variant="body2" color="text.secondary">
                Clinician
              </Typography>
              <Typography>
                {currentVisit.clinician_name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {currentVisit.clinician_specialty}
              </Typography>
            </Box>
          </Box>

          {/* Time */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TimeIcon color="action" />
            <Box>
              <Typography variant="body2" color="text.secondary">
                Scheduled Time
              </Typography>
              <Typography>
                {visitTime}
              </Typography>
            </Box>
          </Box>

          {/* Duration */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <DurationIcon color="action" />
            <Box>
              <Typography variant="body2" color="text.secondary">
                Duration
              </Typography>
              <Typography>
                {currentVisit.duration_minutes} minutes
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 1 }} />

          {/* Notes Field */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <NotesIcon color="action" fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                Visit Notes
              </Typography>
            </Box>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes for this visit..."
              variant="outlined"
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'space-between' }}>
        <Button
          onClick={handleClose}
          startIcon={<CloseIcon />}
          color="inherit"
        >
          Cancel Queue
        </Button>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            onClick={handleSkip}
            startIcon={<SkipIcon />}
            disabled={loading}
          >
            Skip
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleComplete}
            startIcon={<CompleteIcon />}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Complete & Next'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default CheckInModal;
