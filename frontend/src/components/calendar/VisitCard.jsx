// Individual visit card displayed on calendar
import { Box, Typography, Tooltip } from '@mui/material';
import { AccessTime as TimeIcon } from '@mui/icons-material';
import dayjs from 'dayjs';
import useStore from '../../store/useStore';

function VisitCard({ visit }) {
  const { openModal, setSelectedVisit } = useStore();
  
  const visitTime = dayjs(visit.visit_date).format('h:mm A');
  
  const handleClick = () => {
    setSelectedVisit(visit);
    openModal('visitForm');
  };

  return (
    <Tooltip
      title={
        <Box>
          <Typography variant="body2"><strong>Patient:</strong> {visit.patient_name}</Typography>
          <Typography variant="body2"><strong>Clinician:</strong> {visit.clinician_name}</Typography>
          <Typography variant="body2"><strong>Duration:</strong> {visit.duration_minutes} min</Typography>
          {visit.notes && <Typography variant="body2"><strong>Notes:</strong> {visit.notes}</Typography>}
        </Box>
      }
      arrow
    >
      <Box
        onClick={handleClick}
        sx={{
          p: 0.5,
          mb: 0.5,
          borderRadius: 1,
          cursor: 'pointer',
          backgroundColor: visit.status === 'cancelled' 
            ? 'error.light' 
            : visit.status === 'completed' 
              ? 'success.light' 
              : 'primary.light',
          '&:hover': {
            opacity: 0.8,
            transform: 'scale(1.02)',
          },
          transition: 'all 0.2s',
        }}
      >
        {/* Time */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <TimeIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
          <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
            {visitTime}
          </Typography>
        </Box>
        
        {/* Patient Name */}
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            textDecoration: visit.status === 'cancelled' ? 'line-through' : 'none',
          }}
        >
          {visit.patient_name}
        </Typography>
        
        {/* Clinician (shortened) */}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: 'block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontSize: '0.65rem',
          }}
        >
          {visit.clinician_name}
        </Typography>
      </Box>
    </Tooltip>
  );
}

export default VisitCard;
