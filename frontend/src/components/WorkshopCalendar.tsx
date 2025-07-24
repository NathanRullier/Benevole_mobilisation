import React, { useState, useMemo } from 'react';
import {
  Paper,
  Typography,
  Box,
  IconButton,
  Card,
  CardContent,
  Chip,
  Tooltip,
  Button
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Today
} from '@mui/icons-material';
import { workshopService } from '../services/workshopService';
import type { WorkshopData } from '../services/workshopService';

interface WorkshopCalendarProps {
  workshops: WorkshopData[];
  onWorkshopSelect?: (workshop: WorkshopData) => void;
  viewMode?: 'volunteer' | 'coordinator';
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  workshops: WorkshopData[];
}

const WorkshopCalendar: React.FC<WorkshopCalendarProps> = ({
  workshops,
  onWorkshopSelect,
  viewMode = 'volunteer'
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Generate calendar days for the current month
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Start of the calendar (might include previous month)
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    // End of the calendar (might include next month)
    const endDate = new Date(lastDay);
    const daysToAdd = 6 - lastDay.getDay();
    endDate.setDate(endDate.getDate() + daysToAdd);
    
    const days: CalendarDay[] = [];
    const currentDateLoop = new Date(startDate);
    
    while (currentDateLoop <= endDate) {
      const dateString = currentDateLoop.toISOString().split('T')[0];
      const dayWorkshops = workshops.filter(workshop => workshop.date === dateString);
      
      days.push({
        date: new Date(currentDateLoop),
        isCurrentMonth: currentDateLoop.getMonth() === month,
        workshops: dayWorkshops
      });
      
      currentDateLoop.setDate(currentDateLoop.getDate() + 1);
    }
    
    return days;
  }, [currentDate, workshops]);

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Format month/year display
  const formatMonthYear = (date: Date): string => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Check if date is today
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Get workshop status color
  const getWorkshopColor = (workshop: WorkshopData) => {
    return workshopService.getStatusColor(workshop.status);
  };

  // Week days
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Paper sx={{ p: 3 }} data-testid="workshop-calendar">
      {/* Calendar Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          {formatMonthYear(currentDate)}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Today />}
            onClick={goToToday}
            data-testid="calendar-today"
          >
            Today
          </Button>
          
          <IconButton 
            onClick={goToPreviousMonth}
            data-testid="calendar-prev-month"
          >
            <ChevronLeft />
          </IconButton>
          
          <IconButton 
            onClick={goToNextMonth}
            data-testid="calendar-next-month"
          >
            <ChevronRight />
          </IconButton>
        </Box>
      </Box>

      {/* Week Days Header */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, mb: 1 }}>
        {weekDays.map((day) => (
          <Typography 
            key={day}
            variant="subtitle2" 
            align="center" 
            sx={{ fontWeight: 'bold', color: 'text.secondary' }}
          >
            {day}
          </Typography>
        ))}
      </Box>

      {/* Calendar Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
        {calendarDays.map((day, index) => (
          <Box key={index}>
            <Card
              sx={{
                minHeight: 120,
                backgroundColor: day.isCurrentMonth ? 'background.paper' : 'background.default',
                border: isToday(day.date) ? 2 : 1,
                borderColor: isToday(day.date) ? 'primary.main' : 'divider',
                cursor: day.workshops.length > 0 ? 'pointer' : 'default',
                '&:hover': day.workshops.length > 0 ? {
                  elevation: 2,
                  backgroundColor: 'action.hover'
                } : {}
              }}
              data-testid={`calendar-day-${day.date.getDate()}`}
            >
              <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                {/* Day Number */}
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: isToday(day.date) ? 'bold' : 'normal',
                    color: day.isCurrentMonth ? 'text.primary' : 'text.disabled',
                    mb: 1
                  }}
                >
                  {day.date.getDate()}
                </Typography>

                {/* Workshops for this day */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {day.workshops.slice(0, 2).map((workshop) => (
                    <Tooltip 
                      key={workshop.id}
                      title={`${workshop.title} (${workshop.startTime}-${workshop.endTime})`}
                      arrow
                    >
                      <Chip
                        label={workshop.title}
                        size="small"
                        color={getWorkshopColor(workshop)}
                        variant="filled"
                        sx={{
                          fontSize: '0.65rem',
                          height: 20,
                          cursor: 'pointer',
                          '& .MuiChip-label': {
                            px: 0.5,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }
                        }}
                        onClick={() => onWorkshopSelect?.(workshop)}
                        data-testid={`workshop-${workshop.id}`}
                      />
                    </Tooltip>
                  ))}
                  
                  {/* Show more indicator */}
                  {day.workshops.length > 2 && (
                    <Typography
                      variant="caption"
                      sx={{ 
                        color: 'text.secondary',
                        textAlign: 'center',
                        cursor: 'pointer',
                        '&:hover': { color: 'primary.main' }
                      }}
                      onClick={() => {
                        // Show first workshop for now, could open a day detail modal
                        if (day.workshops[0]) {
                          onWorkshopSelect?.(day.workshops[0]);
                        }
                      }}
                    >
                      +{day.workshops.length - 2} more
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Legend */}
      <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Chip size="small" color="success" label="Published" />
          <Typography variant="caption">Published</Typography>
        </Box>
        {viewMode === 'coordinator' && (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Chip size="small" color="default" label="Draft" />
              <Typography variant="caption">Draft</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Chip size="small" color="error" label="Cancelled" />
              <Typography variant="caption">Cancelled</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Chip size="small" color="info" label="Completed" />
              <Typography variant="caption">Completed</Typography>
            </Box>
          </>
        )}
      </Box>

      {/* Summary */}
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {workshops.length} workshops this month
        </Typography>
      </Box>
    </Paper>
  );
};

export default WorkshopCalendar; 