// MVP.3F.2: Profile Management Page
// Main interface for profile creation and editing

import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  PhotoCamera,
  Save,
  ArrowBack,
  ArrowForward,
  CheckCircle,
  Warning,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { profileService } from '../services/profileService';
import AvailabilityCalendar from '../components/AvailabilityCalendar';
import { SpecializationSelect } from '../components/SpecializationSelect';
import ProfileCompletenessIndicator from '../components/ProfileCompletenessIndicator';

interface ProfileFormData {
  // Personal Information
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  languages: string[];
  
  // Professional Information
  barAssociation: string;
  licenseNumber: string;
  yearsOfExperience: number;
  specializations: string[];
  currentPosition: string;
  firmName: string;
  
  // Availability
  availableDays: string[];
  preferredTimeSlots: string[];
  maxWorkshopsPerMonth: number;
  travelRadius: number;
  
  // Additional
  bio: string;
  profilePhoto: string;
}

interface ProfilePageProps {}

const ProfilePage: React.FC<ProfilePageProps> = () => {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<ProfileFormData>({
    phone: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    languages: [],
    barAssociation: '',
    licenseNumber: '',
    yearsOfExperience: 0,
    specializations: [],
    currentPosition: '',
    firmName: '',
    availableDays: [],
    preferredTimeSlots: [],
    maxWorkshopsPerMonth: 1,
    travelRadius: 50,
    bio: '',
    profilePhoto: '',
  });

  const steps = [
    'Personal Information',
    'Professional Information',
    'Availability',
    'Review & Complete'
  ];

  const provinces = [
    'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick',
    'Newfoundland and Labrador', 'Northwest Territories', 'Nova Scotia',
    'Nunavut', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan', 'Yukon'
  ];

  const languageOptions = [
    'English', 'French', 'Spanish', 'Arabic', 'Mandarin', 'Italian', 
    'Portuguese', 'German', 'Russian', 'Other'
  ];

  useEffect(() => {
    loadProfileData();
  }, [user]);

  const loadProfileData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const profile = await profileService.getProfile(user.id);
      if (profile) {
        setFormData(profile);
        setIsEditing(true);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof ProfileFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateStep = (stepIndex: number): boolean => {
    const errors: Record<string, string> = {};
    
    switch (stepIndex) {
      case 0: // Personal Information
        if (!formData.phone) errors.phone = 'Phone number is required';
        else if (!/^\d{3}-\d{3}-\d{4}$/.test(formData.phone)) {
          errors.phone = 'Phone number must be in format: 514-555-0123';
        }
        if (!formData.address) errors.address = 'Address is required';
        if (!formData.city) errors.city = 'City is required';
        if (!formData.province) errors.province = 'Province is required';
        if (!formData.postalCode) errors.postalCode = 'Postal code is required';
        if (formData.languages.length === 0) errors.languages = 'At least one language is required';
        break;
        
      case 1: // Professional Information
        if (!formData.barAssociation) errors.barAssociation = 'Bar association is required';
        if (!formData.licenseNumber) errors.licenseNumber = 'License number is required';
        if (!formData.yearsOfExperience) errors.yearsOfExperience = 'Years of experience is required';
        if (formData.specializations.length === 0) errors.specializations = 'At least one specialization is required';
        break;
        
      case 2: // Availability
        if (formData.availableDays.length === 0) errors.availableDays = 'Select at least one available day';
        if (!formData.maxWorkshopsPerMonth) errors.maxWorkshopsPerMonth = 'Maximum workshops per month is required';
        break;
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSave = async () => {
    if (!validateStep(activeStep)) return;
    
    setIsLoading(true);
    setSaveError(null);
    
    try {
      if (isEditing) {
        await profileService.updateProfile(user!.id, formData);
      } else {
        await profileService.createProfile({ ...formData, userId: user!.id });
        setIsEditing(true);
      }
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error: any) {
      setSaveError(error.message || 'Failed to save profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        handleInputChange('profilePhoto', e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box data-testid="wizard-step-1">
            <Typography variant="h6" gutterBottom>
              Personal Information
            </Typography>
            
            {/* Profile Photo */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }} data-testid="photo-upload-section">
              <Avatar
                src={formData.profilePhoto}
                sx={{ width: 80, height: 80, mr: 2 }}
                data-testid="photo-preview"
              >
                {user?.firstName?.charAt(0)}
              </Avatar>
              <Box>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="photo-upload"
                  type="file"
                  onChange={handlePhotoUpload}
                  data-testid="photo-file-input"
                />
                <label htmlFor="photo-upload">
                  <IconButton
                    color="primary"
                    aria-label="upload picture"
                    component="span"
                    data-testid="photo-upload-button"
                  >
                    <PhotoCamera />
                  </IconButton>
                </label>
                <Typography variant="body2" color="text.secondary">
                  Upload profile photo
                </Typography>
              </Box>
            </Box>

            {/* Validation Feedback */}
            {validationErrors.phone && (
              <Alert severity="error" sx={{ mb: 2 }} data-testid="phone-error">
                {validationErrors.phone}
              </Alert>
            )}

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <TextField
                label="Phone Number"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                error={!!validationErrors.phone}
                helperText={validationErrors.phone || 'Format: 514-555-0123'}
                placeholder="514-555-0123"
                sx={{ flex: '1 1 250px' }}
                data-testid="phone-input"
                InputProps={{
                  endAdornment: !validationErrors.phone && formData.phone ? (
                    <CheckCircle color="success" data-testid="phone-validation-success" />
                  ) : validationErrors.phone ? (
                    <Warning color="error" data-testid="phone-validation-error" />
                  ) : null
                }}
              />
              
              <TextField
                label="Address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                error={!!validationErrors.address}
                helperText={validationErrors.address}
                sx={{ flex: '1 1 250px' }}
                data-testid="address-input"
              />
              
              <TextField
                label="City"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                error={!!validationErrors.city}
                helperText={validationErrors.city}
                sx={{ flex: '1 1 200px' }}
                data-testid="city-input"
              />
              
              <FormControl sx={{ flex: '1 1 200px' }} error={!!validationErrors.province}>
                <InputLabel>Province</InputLabel>
                <Select
                  value={formData.province}
                  onChange={(e) => handleInputChange('province', e.target.value)}
                  data-testid="province-select"
                >
                  {provinces.map((province) => (
                    <MenuItem key={province} value={province}>{province}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <TextField
                label="Postal Code"
                value={formData.postalCode}
                onChange={(e) => handleInputChange('postalCode', e.target.value)}
                error={!!validationErrors.postalCode}
                helperText={validationErrors.postalCode}
                sx={{ flex: '1 1 150px' }}
                data-testid="postal-code-input"
              />
              
              <FormControl sx={{ flex: '1 1 250px' }} error={!!validationErrors.languages}>
                <InputLabel>Languages</InputLabel>
                <Select
                  multiple
                  value={formData.languages}
                  onChange={(e) => handleInputChange('languages', e.target.value)}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                  data-testid="languages-select"
                >
                  {languageOptions.map((language) => (
                    <MenuItem key={language} value={language}>{language}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
        );

      case 1:
        return (
          <Box data-testid="wizard-step-2">
            <Typography variant="h6" gutterBottom>
              Professional Information
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
              <TextField
                label="Bar Association"
                value={formData.barAssociation}
                onChange={(e) => handleInputChange('barAssociation', e.target.value)}
                error={!!validationErrors.barAssociation}
                helperText={validationErrors.barAssociation}
                sx={{ flex: '1 1 250px' }}
                data-testid="bar-association-input"
              />
              
              <TextField
                label="License Number"
                value={formData.licenseNumber}
                onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                error={!!validationErrors.licenseNumber}
                helperText={validationErrors.licenseNumber}
                sx={{ flex: '1 1 200px' }}
                data-testid="license-number-input"
              />
              
              <TextField
                label="Years of Experience"
                type="number"
                value={formData.yearsOfExperience}
                onChange={(e) => handleInputChange('yearsOfExperience', parseInt(e.target.value))}
                error={!!validationErrors.yearsOfExperience}
                helperText={validationErrors.yearsOfExperience}
                sx={{ flex: '1 1 150px' }}
                data-testid="experience-input"
              />
              
              <TextField
                label="Current Position"
                value={formData.currentPosition}
                onChange={(e) => handleInputChange('currentPosition', e.target.value)}
                sx={{ flex: '1 1 250px' }}
                data-testid="position-input"
              />
              
              <TextField
                label="Firm/Organization Name"
                value={formData.firmName}
                onChange={(e) => handleInputChange('firmName', e.target.value)}
                sx={{ flex: '1 1 250px' }}
                data-testid="firm-name-input"
              />
            </Box>
            
            <SpecializationSelect
              value={formData.specializations}
              onChange={(specializations) => handleInputChange('specializations', specializations)}
              error={validationErrors.specializations}
            />
            
            <TextField
              label="Professional Bio"
              multiline
              rows={4}
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell us about your legal background and expertise..."
              sx={{ width: '100%', mt: 2 }}
              data-testid="bio-input"
            />
          </Box>
        );

      case 2:
        return (
          <Box data-testid="wizard-step-3">
            <Typography variant="h6" gutterBottom>
              Availability
            </Typography>
            
            <AvailabilityCalendar
              availableDays={formData.availableDays}
              preferredTimeSlots={formData.preferredTimeSlots}
              onDaysChange={(days: string[]) => handleInputChange('availableDays', days)}
              onTimeSlotsChange={(slots: string[]) => handleInputChange('preferredTimeSlots', slots)}
              error={validationErrors.availableDays}
            />
            
            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <TextField
                label="Max Workshops per Month"
                type="number"
                value={formData.maxWorkshopsPerMonth}
                onChange={(e) => handleInputChange('maxWorkshopsPerMonth', parseInt(e.target.value))}
                error={!!validationErrors.maxWorkshopsPerMonth}
                helperText={validationErrors.maxWorkshopsPerMonth}
                inputProps={{ min: 1, max: 10 }}
                sx={{ flex: '1 1 200px' }}
                data-testid="max-workshops-input"
              />
              
              <TextField
                label="Travel Radius (km)"
                type="number"
                value={formData.travelRadius}
                onChange={(e) => handleInputChange('travelRadius', parseInt(e.target.value))}
                helperText="Maximum distance you're willing to travel"
                inputProps={{ min: 1, max: 500 }}
                sx={{ flex: '1 1 200px' }}
                data-testid="travel-radius-input"
              />
            </Box>
          </Box>
        );

      case 3:
        return (
          <Box data-testid="wizard-step-4">
            <Typography variant="h6" gutterBottom>
              Review & Complete
            </Typography>
            
            <ProfileCompletenessIndicator
              profileData={formData}
              showDetails={true}
            />
            
            <Typography variant="body1" sx={{ mt: 2, mb: 2 }}>
              Please review your profile information and click save to complete your profile.
            </Typography>
            
            {saveSuccess && (
              <Alert severity="success" sx={{ mb: 2 }} data-testid="profile-save-success">
                Profile updated successfully!
              </Alert>
            )}
            
            {saveError && (
              <Alert severity="error" sx={{ mb: 2 }} data-testid="profile-save-error">
                {saveError}
              </Alert>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  if (isLoading && !formData.phone) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }} data-testid="profile-form">
      <Paper sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1">
            {isEditing ? 'Edit Profile' : 'Create Profile'}
          </Typography>
          
          <Button
            variant="outlined"
            onClick={() => setIsEditing(!isEditing)}
            data-testid="edit-mode-toggle"
          >
            {isEditing ? 'View Mode' : 'Edit Mode'}
          </Button>
        </Box>

        <Box data-testid="profile-wizard">
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {renderStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              startIcon={<ArrowBack />}
              data-testid="back-step-button"
            >
              Back
            </Button>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              {activeStep < steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  endIcon={<ArrowForward />}
                  data-testid="next-step-button"
                >
                  Next
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={isLoading}
                  startIcon={isLoading ? <CircularProgress size={20} /> : <Save />}
                  data-testid="save-profile-button"
                >
                  {isLoading ? 'Saving...' : 'Save Profile'}
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default ProfilePage; 