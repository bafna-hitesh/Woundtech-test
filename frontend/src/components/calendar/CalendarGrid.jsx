// Calendar grid showing days and visits
import { Box, Typography, Paper, IconButton, Tooltip } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import dayjs from 'dayjs';
import useStore from '../../store/useStore';
import VisitCard from './VisitCard';

// Day names for header
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function CalendarGrid() {
  const { currentMonth, visits, openModal, setSelectedDate } = useStore();
  
  // Generate calendar days for the current month view
  const generateCalendarDays = () => {
    const startOfMonth = currentMonth.startOf('month');
    const endOfMonth = currentMonth.endOf('month');
    
    // Start from the Sunday of the week containing the 1st
    const startDate = startOfMonth.startOf('week');
    // End on the Saturday of the week containing the last day
    const endDate = endOfMonth.endOf('week');
    
    const days = [];
    let current = startDate;
    
    while (current.isBefore(endDate) || current.isSame(endDate, 'day')) {
      days.push(current);
      current = current.add(1, 'day');
    }
    
    return days;
  };

  // Get visits for a specific day
  const getVisitsForDay = (day) => {
    return visits.filter((visit) => {
      const visitDate = dayjs(visit.visit_date);
      return visitDate.isSame(day, 'day');
    }).sort((a, b) => {
      // Sort by time
      return dayjs(a.visit_date).valueOf() - dayjs(b.visit_date).valueOf();
    });
  };

  const handleAddVisit = (day) => {
    setSelectedDate(day.format('YYYY-MM-DD'));
    openModal('visitForm');
  };

  const calendarDays = generateCalendarDays();
  const today = dayjs();

  return (
    <Paper sx={{ overflow: 'hidden' }}>
      {/* Day Headers */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          backgroundColor: 'primary.main',
          color: 'primary.contrastText',
        }}
      >
        {DAYS.map((day) => (
          <Box
            key={day}
            sx={{
              p: 1,
              textAlign: 'center',
              fontWeight: 'bold',
            }}
          >
            {day}
          </Box>
        ))}
      </Box>

      {/* Calendar Days Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          minHeight: 600,
        }}
      >
        {calendarDays.map((day, index) => {
          const isCurrentMonth = day.month() === currentMonth.month();
          const isToday = day.isSame(today, 'day');
          const dayVisits = getVisitsForDay(day);

          return (
            <Box
              key={index}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                minHeight: 120,
                backgroundColor: isCurrentMonth ? 'background.paper' : 'action.hover',
                position: 'relative',
                '&:hover .add-button': {
                  opacity: 1,
                },
              }}
            >
              {/* Day Number Header */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 0.5,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  backgroundColor: isToday ? 'primary.main' : 'transparent',
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: isToday ? 'bold' : 'normal',
                    color: isToday
                      ? 'primary.contrastText'
                      : isCurrentMonth
                        ? 'text.primary'
                        : 'text.disabled',
                    width: 24,
                    height: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                  }}
                >
                  {day.date()}
                </Typography>
                
                {/* Add Visit Button (shows on hover) */}
                <Tooltip title="Add visit">
                  <IconButton
                    className="add-button"
                    size="small"
                    onClick={() => handleAddVisit(day)}
                    sx={{
                      opacity: 0,
                      transition: 'opacity 0.2s',
                      padding: 0.25,
                      color: isToday ? 'primary.contrastText' : 'primary.main',
                    }}
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>

              {/* Visits List */}
              <Box sx={{ p: 0.5, overflowY: 'auto', maxHeight: 100 }}>
                {dayVisits.map((visit) => (
                  <VisitCard key={visit.id} visit={visit} />
                ))}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
}

export default CalendarGrid;
