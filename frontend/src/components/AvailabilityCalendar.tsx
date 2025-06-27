// MVP.3F.10: Availability Calendar Component
// Interactive calendar for selecting available days and time slots

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  FormControlLabel,
  Checkbox,
  Card,
  CardContent,
  FormHelperText,
} from '@mui/material';
import { CalendarMonth, AccessTime } from '@mui/icons-material';

interface AvailabilityCalendarProps {
  availableDays: string[];
  preferredTimeSlots: string[];
  onDaysChange: (days: string[]) => void;
  onTimeSlotsChange: (slots: string[]) => void;
  error?: string;
}

const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  availableDays,
  preferredTimeSlots,
  onDaysChange,
  onTimeSlotsChange,
  error,
}) => {
  const daysOfWeek = [
    'Monday',
    'Tuesday', 
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
  ];

  const timeSlots = [
    { value: 'morning', label: 'Morning (9:00 AM - 12:00 PM)', testId: 'morning' },
    { value: 'afternoon', label: 'Afternoon (12:00 PM - 5:00 PM)', testId: 'afternoon' },
    { value: 'evening', label: 'Evening (5:00 PM - 8:00 PM)', testId: 'evening' },
    { value: 'weekend-morning', label: 'Weekend Morning (9:00 AM - 12:00 PM)', testId: 'weekend-morning' },
    { value: 'weekend-afternoon', label: 'Weekend Afternoon (12:00 PM - 5:00 PM)', testId: 'weekend-afternoon' },
  ];

  const handleDayChange = (day: string, checked: boolean) => {
    if (checked) {
      onDaysChange([...availableDays, day]);
    } else {
      onDaysChange(availableDays.filter(d => d !== day));
    }
  };

  const handleTimeSlotChange = (slot: string, checked: boolean) => {
    if (checked) {
      onTimeSlotsChange([...preferredTimeSlots, slot]);
    } else {
      onTimeSlotsChange(preferredTimeSlots.filter(s => s !== slot));
    }
  };

  return (
    <Box data-testid="availability-calendar">
      <Typography variant="h6" gutterBottom data-testid="calendar-header">
        <CalendarMonth sx={{ mr: 1, verticalAlign: 'middle' }} />
        Availability Schedule
      </Typography>

      {/* Available Days Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 2 }}>
            Available Days
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {daysOfWeek.map((day) => (
              <Box key={day} sx={{ minWidth: 150, flex: '1 1 150px' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={availableDays.includes(day)}
                      onChange={(e) => handleDayChange(day, e.target.checked)}
                      data-testid={`day-checkbox-${day.toLowerCase()}`}
                    />
                  }
                  label={day}
                  sx={{ 
                    width: '100%',
                    m: 0,
                    p: 1,
                    borderRadius: 1,
                    bgcolor: availableDays.includes(day) ? 'action.selected' : 'transparent',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                />
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Time Slots Section */}
      <Card>
        <CardContent>
          <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 2 }}>
            <AccessTime sx={{ mr: 1, verticalAlign: 'middle' }} />
            Preferred Time Slots
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {timeSlots.map((slot) => {
              const isSelected = preferredTimeSlots.includes(slot.value);
              return (
                <Box key={slot.value} sx={{ flex: '1 1 300px', minWidth: 300 }}>
                  <Paper
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      border: 1,
                      borderColor: isSelected ? 'primary.main' : 'divider',
                      bgcolor: isSelected ? 'primary.50' : 'background.paper',
                      '&:hover': { 
                        borderColor: 'primary.main',
                        bgcolor: isSelected ? 'primary.100' : 'action.hover'
                      },
                      transition: 'all 0.2s ease-in-out'
                    }}
                    onClick={() => handleTimeSlotChange(slot.value, !isSelected)}
                    data-testid={`time-slot-${slot.testId}`}
                    className={isSelected ? 'selected' : ''}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={isSelected}
                          onChange={(e) => handleTimeSlotChange(slot.value, e.target.checked)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      }
                      label={slot.label}
                      sx={{ m: 0, width: '100%' }}
                    />
                  </Paper>
                </Box>
              );
            })}
          </Box>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <FormHelperText error sx={{ mt: 1, fontSize: '0.875rem' }}>
          {error}
        </FormHelperText>
      )}
    </Box>
  );
};

export default AvailabilityCalendar; 