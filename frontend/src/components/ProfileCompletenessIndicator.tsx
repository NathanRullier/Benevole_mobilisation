// MVP.3F.11: Profile Completeness Indicator Component
// Shows profile completion percentage and missing required fields

import React from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Alert,
  Collapse,
  Button,
} from '@mui/material';
import {
  RadioButtonUnchecked,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';

interface ProfileCompletenessIndicatorProps {
  profileData: any;
  showDetails?: boolean;
  compact?: boolean;
  onFieldFocus?: (fieldName: string) => void;
}

const ProfileCompletenessIndicator: React.FC<ProfileCompletenessIndicatorProps> = ({
  profileData,
  showDetails = false,
  compact = false,
  onFieldFocus,
}) => {
  const [showMissingFields, setShowMissingFields] = React.useState(false);

  // Calculate completion percentage
  const calculateCompleteness = (data: any): number => {
    const requiredFields = [
      'phone', 'address', 'city', 'province', 'postalCode', 'languages',
      'barAssociation', 'licenseNumber', 'yearsOfExperience', 'specializations',
      'availableDays', 'maxWorkshopsPerMonth'
    ];
    
    let completedCount = 0;
    requiredFields.forEach(field => {
      if (data[field]) {
        if (Array.isArray(data[field])) {
          if (data[field].length > 0) completedCount++;
        } else if (data[field] !== '' && data[field] !== null && data[field] !== undefined) {
          completedCount++;
        }
      }
    });
    
    return Math.round((completedCount / requiredFields.length) * 100);
  };

  const getMissingFields = (data: any): string[] => {
    const requiredFields = [
      { key: 'phone', label: 'Phone Number' },
      { key: 'address', label: 'Address' },
      { key: 'city', label: 'City' },
      { key: 'province', label: 'Province' },
      { key: 'postalCode', label: 'Postal Code' },
      { key: 'languages', label: 'Languages' },
      { key: 'barAssociation', label: 'Bar Association' },
      { key: 'licenseNumber', label: 'License Number' },
      { key: 'yearsOfExperience', label: 'Years of Experience' },
      { key: 'specializations', label: 'Specializations' },
      { key: 'availableDays', label: 'Available Days' },
      { key: 'maxWorkshopsPerMonth', label: 'Max Workshops per Month' }
    ];
    
    const missing: string[] = [];
    requiredFields.forEach(field => {
      if (!data[field.key] || 
          (Array.isArray(data[field.key]) && data[field.key].length === 0) ||
          data[field.key] === '' || 
          data[field.key] === null || 
          data[field.key] === undefined) {
        missing.push(field.label);
      }
    });
    
    return missing;
  };

  const completenessPercentage = calculateCompleteness(profileData);
  const missingFields = getMissingFields(profileData);

  // Get color based on completion percentage
  const getProgressColor = (percentage: number): string => {
    if (percentage >= 80) return '#4caf50'; // Green
    if (percentage >= 60) return '#ff9800'; // Orange
    if (percentage >= 40) return '#ffeb3b'; // Yellow
    return '#f44336'; // Red
  };

  // Get completion status
  const getCompletionStatus = (percentage: number) => {
    if (percentage === 100) return { label: 'Complete', color: 'success' as const };
    if (percentage >= 80) return { label: 'Almost Complete', color: 'success' as const };
    if (percentage >= 60) return { label: 'Good Progress', color: 'warning' as const };
    if (percentage >= 40) return { label: 'Needs Work', color: 'warning' as const };
    return { label: 'Just Started', color: 'error' as const };
  };

  const status = getCompletionStatus(completenessPercentage);
  const progressColor = getProgressColor(completenessPercentage);

  if (compact) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }} data-testid="profile-completeness">
        <Box sx={{ flex: 1 }}>
          <LinearProgress
            variant="determinate"
            value={completenessPercentage}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: '#e0e0e0',
              '& .MuiLinearProgress-bar': {
                backgroundColor: progressColor,
                borderRadius: 4,
              },
            }}
            data-testid="completeness-bar"
          />
        </Box>
        <Typography
          variant="body2"
          fontWeight="medium"
          data-testid="completeness-percentage"
        >
          {completenessPercentage}%
        </Typography>
        <Chip
          label={status.label}
          color={status.color}
          size="small"
          variant="outlined"
        />
      </Box>
    );
  }

  return (
    <Card data-testid="profile-completeness">
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h3">
            Profile Completeness
          </Typography>
          <Chip
            label={status.label}
            color={status.color}
            variant="filled"
          />
        </Box>

        {/* Progress Bar */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Profile Progress
            </Typography>
            <Typography
              variant="h6"
              fontWeight="bold"
              color={progressColor}
              data-testid="completeness-percentage"
            >
              {completenessPercentage}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={completenessPercentage}
            sx={{
              height: 12,
              borderRadius: 6,
              backgroundColor: '#e0e0e0',
              '& .MuiLinearProgress-bar': {
                backgroundColor: progressColor,
                borderRadius: 6,
              },
            }}
            data-testid="completeness-bar"
          />
        </Box>

        {/* Status Alert */}
        {completenessPercentage === 100 ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="body2">
              🎉 Your profile is complete! You're ready to participate in workshops.
            </Typography>
          </Alert>
        ) : (
          <Alert severity={status.color} sx={{ mb: 2 }}>
            <Typography variant="body2">
              {missingFields.length} field{missingFields.length !== 1 ? 's' : ''} remaining to complete your profile.
              {completenessPercentage >= 80 && ' You\'re almost done!'}
            </Typography>
          </Alert>
        )}

        {/* Missing Fields Section */}
        {missingFields.length > 0 && showDetails && (
          <Box>
            <Button
              variant="text"
              onClick={() => setShowMissingFields(!showMissingFields)}
              endIcon={showMissingFields ? <ExpandLess /> : <ExpandMore />}
              sx={{ mb: 1 }}
            >
              {showMissingFields ? 'Hide' : 'Show'} Missing Fields ({missingFields.length})
            </Button>
            
            <Collapse in={showMissingFields}>
              <List dense>
                {missingFields.map((field, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemIcon>
                      <RadioButtonUnchecked color="error" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={field} 
                      onClick={() => onFieldFocus?.(field)}
                      sx={{ 
                        cursor: onFieldFocus ? 'pointer' : 'default',
                        '&:hover': onFieldFocus ? { color: 'primary.main' } : {}
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileCompletenessIndicator; 