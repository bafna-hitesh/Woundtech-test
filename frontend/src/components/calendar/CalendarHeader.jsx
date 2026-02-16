// Calendar header with month navigation and filters
import {
  Box,
  Typography,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Paper,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  FilterAltOff as ClearFilterIcon,
} from '@mui/icons-material';
import useStore from '../../store/useStore';

function CalendarHeader() {
  const {
    currentMonth,
    goToPreviousMonth,
    goToNextMonth,
    filters,
    setFilters,
    clearFilters,
    clinicians,
    patients,
  } = useStore();

  const hasActiveFilters = filters.clinician_id || filters.patient_id || filters.status;

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        {/* Month Navigation */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={goToPreviousMonth}>
            <ChevronLeft />
          </IconButton>
          
          <Typography variant="h5" sx={{ minWidth: 200, textAlign: 'center' }}>
            {currentMonth.format('MMMM YYYY')}
          </Typography>
          
          <IconButton onClick={goToNextMonth}>
            <ChevronRight />
          </IconButton>
        </Box>

        {/* Filters */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          {/* Clinician Filter */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Clinician</InputLabel>
            <Select
              value={filters.clinician_id || ''}
              label="Clinician"
              onChange={(e) => setFilters({ clinician_id: e.target.value || null })}
            >
              <MenuItem value="">All Clinicians</MenuItem>
              {clinicians.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Patient Filter */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Patient</InputLabel>
            <Select
              value={filters.patient_id || ''}
              label="Patient"
              onChange={(e) => setFilters({ patient_id: e.target.value || null })}
            >
              <MenuItem value="">All Patients</MenuItem>
              {patients.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Status Filter */}
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status || ''}
              label="Status"
              onChange={(e) => setFilters({ status: e.target.value || null })}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="scheduled">Scheduled</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              size="small"
              startIcon={<ClearFilterIcon />}
              onClick={clearFilters}
            >
              Clear
            </Button>
          )}
        </Box>
      </Box>
    </Paper>
  );
}

export default CalendarHeader;
