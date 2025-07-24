import React, { useState } from "react";
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
  Typography,
  Grid,
  Alert,
  CircularProgress,
  Chip,
  OutlinedInput
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { workshopService } from "../services/workshopService";
import type { WorkshopData } from "../services/workshopService";

interface WorkshopCreateModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface WorkshopFormData {
  title: string;
  description: string;
  date: Date | null;
  startTime: Date | null;
  endTime: Date | null;
  location: {
    name: string;
    address: string;
    city: string;
    region: string;
  };
  maxVolunteers: number;
  requiredSpecializations: string[];
  targetAudience: string;
  workshopType: string;
  contactPerson: {
    name: string;
    email: string;
    phone: string;
  };
  status: 'draft' | 'published';
}

const WorkshopCreateModal: React.FC<WorkshopCreateModalProps> = ({
  open,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState<WorkshopFormData>({
    title: '',
    description: '',
    date: null,
    startTime: null,
    endTime: null,
    location: {
      name: '',
      address: '',
      city: '',
      region: ''
    },
    maxVolunteers: 1,
    requiredSpecializations: [],
    targetAudience: '',
    workshopType: '',
    contactPerson: {
      name: '',
      email: '',
      phone: ''
    },
    status: 'draft'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Available options
  const regions = [
    'Montreal', 'Quebec City', 'Laval', 'Gatineau', 'Longueuil',
    'Sherbrooke', 'Saguenay', 'Trois-Rivières', 'Terrebonne', 'Saint-Jean-sur-Richelieu'
  ];

  const specializations = [
    'Employment Law', 'Corporate Law', 'Criminal Law', 'Family Law',
    'Immigration Law', 'Real Estate Law', 'Environmental Law', 'Tax Law',
    'Intellectual Property', 'Human Rights'
  ];

  const audiences = [
    'Elementary School Students',
    'Secondary School Students', 
    'CÉGEP Students',
    'University Students',
    'General Public',
    'Senior Citizens',
    'Community Groups'
  ];

  const workshopTypes = [
    'Educational Presentation',
    'Interactive Workshop',
    'Q&A Session',
    'Mock Trial',
    'Case Study Analysis',
    'Legal Clinic'
  ];

  const handleInputChange = (field: keyof WorkshopFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (error) setError(null);
  };

  const handleLocationChange = (field: keyof WorkshopFormData['location'], value: string) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value
      }
    }));
    if (error) setError(null);
  };

  const handleContactChange = (field: keyof WorkshopFormData['contactPerson'], value: string) => {
    setFormData(prev => ({
      ...prev,
      contactPerson: {
        ...prev.contactPerson,
        [field]: value
      }
    }));
    if (error) setError(null);
  };

  const handleSpecializationChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      requiredSpecializations: typeof value === 'string' ? value.split(',') : value
    }));
    if (error) setError(null);
  };

  const formatDateTime = (date: Date | null, time: Date | null): string => {
    if (!time) return '';
    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  const validateForm = (): string | null => {
    if (!formData.title.trim()) return 'Title is required';
    if (!formData.description.trim()) return 'Description is required';
    if (!formData.date) return 'Date is required';
    if (!formData.startTime) return 'Start time is required';
    if (!formData.endTime) return 'End time is required';
    if (!formData.location.city.trim()) return 'City is required';
    if (!formData.location.region) return 'Region is required';
    if (!formData.contactPerson.name.trim()) return 'Contact person name is required';
    if (!formData.contactPerson.email.trim()) return 'Contact person email is required';
    if (!formData.targetAudience) return 'Target audience is required';
    if (!formData.workshopType) return 'Workshop type is required';

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.contactPerson.email)) {
      return 'Invalid email format';
    }

    // Validate time logic
    if (formData.startTime && formData.endTime) {
      if (formData.endTime <= formData.startTime) {
        return 'End time must be after start time';
      }
    }

    // Validate date (not in past)
    if (formData.date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (formData.date < today) {
        return 'Workshop date cannot be in the past';
      }
    }

    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const workshopData: Partial<WorkshopData> = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        date: formatDate(formData.date),
        startTime: formatDateTime(formData.date, formData.startTime),
        endTime: formatDateTime(formData.date, formData.endTime),
        location: {
          name: formData.location.name.trim(),
          address: formData.location.address.trim(),
          city: formData.location.city.trim(),
          region: formData.location.region
        },
        maxVolunteers: formData.maxVolunteers,
        requiredSpecializations: formData.requiredSpecializations,
        targetAudience: formData.targetAudience,
        workshopType: formData.workshopType,
        contactPerson: {
          name: formData.contactPerson.name.trim(),
          email: formData.contactPerson.email.trim(),
          phone: formData.contactPerson.phone.trim()
        },
        status: formData.status
      };

      await workshopService.createWorkshop(workshopData);
      onSuccess();
      handleClose();
    } catch (err: any) {
      console.error('Error creating workshop:', err);
      setError(err.response?.data?.message || 'Failed to create workshop. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      // Reset form
      setFormData({
        title: '',
        description: '',
        date: null,
        startTime: null,
        endTime: null,
        location: {
          name: '',
          address: '',
          city: '',
          region: ''
        },
        maxVolunteers: 1,
        requiredSpecializations: [],
        targetAudience: '',
        workshopType: '',
        contactPerson: {
          name: '',
          email: '',
          phone: ''
        },
        status: 'draft'
      });
      setError(null);
      onClose();
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="md" 
        fullWidth
        data-testid="workshop-create-modal"
      >
        <DialogTitle>
          <Typography variant="h6">Create New Workshop</Typography>
        </DialogTitle>
        
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ mt: 1 }}>
            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom color="primary">
                  Basic Information
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Workshop Title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  data-testid="workshop-title"
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  data-testid="workshop-description"
                  required
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <DatePicker
                  label="Workshop Date"
                  value={formData.date}
                  onChange={(newValue) => handleInputChange('date', newValue)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      'data-testid': 'workshop-date'
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TimePicker
                  label="Start Time"
                  value={formData.startTime}
                  onChange={(newValue) => handleInputChange('startTime', newValue)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      'data-testid': 'workshop-start-time'
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TimePicker
                  label="End Time"
                  value={formData.endTime}
                  onChange={(newValue) => handleInputChange('endTime', newValue)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      'data-testid': 'workshop-end-time'
                    }
                  }}
                />
              </Grid>

              {/* Location Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 2 }}>
                  Location Information
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Location Name"
                  value={formData.location.name}
                  onChange={(e) => handleLocationChange('name', e.target.value)}
                  placeholder="e.g., École Secondaire Jean-Baptiste-Meilleur"
                  data-testid="workshop-location-name"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Address"
                  value={formData.location.address}
                  onChange={(e) => handleLocationChange('address', e.target.value)}
                  placeholder="e.g., 777 Av. Sainte-Croix"
                  data-testid="workshop-location-address"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="City"
                  value={formData.location.city}
                  onChange={(e) => handleLocationChange('city', e.target.value)}
                  data-testid="workshop-location-city"
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Region</InputLabel>
                  <Select
                    value={formData.location.region}
                    onChange={(e) => handleLocationChange('region', e.target.value)}
                    data-testid="workshop-location-region"
                  >
                    {regions.map((region) => (
                      <MenuItem key={region} value={region}>
                        {region}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Workshop Details */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 2 }}>
                  Workshop Details
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Max Volunteers"
                  value={formData.maxVolunteers}
                  onChange={(e) => handleInputChange('maxVolunteers', parseInt(e.target.value) || 1)}
                  inputProps={{ min: 1, max: 10 }}
                  data-testid="workshop-max-volunteers"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth required>
                  <InputLabel>Target Audience</InputLabel>
                  <Select
                    value={formData.targetAudience}
                    onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                    data-testid="workshop-target-audience"
                  >
                    {audiences.map((audience) => (
                      <MenuItem key={audience} value={audience}>
                        {audience}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth required>
                  <InputLabel>Workshop Type</InputLabel>
                  <Select
                    value={formData.workshopType}
                    onChange={(e) => handleInputChange('workshopType', e.target.value)}
                    data-testid="workshop-type"
                  >
                    {workshopTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Required Specializations</InputLabel>
                  <Select
                    multiple
                    value={formData.requiredSpecializations}
                    onChange={handleSpecializationChange}
                    input={<OutlinedInput label="Required Specializations" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                    data-testid="workshop-specializations"
                  >
                    {specializations.map((spec) => (
                      <MenuItem key={spec} value={spec}>
                        {spec}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Contact Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 2 }}>
                  Contact Person
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Contact Name"
                  value={formData.contactPerson.name}
                  onChange={(e) => handleContactChange('name', e.target.value)}
                  data-testid="workshop-contact-name"
                  required
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="email"
                  label="Contact Email"
                  value={formData.contactPerson.email}
                  onChange={(e) => handleContactChange('email', e.target.value)}
                  data-testid="workshop-contact-email"
                  required
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Contact Phone"
                  value={formData.contactPerson.phone}
                  onChange={(e) => handleContactChange('phone', e.target.value)}
                  data-testid="workshop-contact-phone"
                />
              </Grid>

              {/* Status */}
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value as 'draft' | 'published')}
                    data-testid="workshop-status"
                  >
                    <MenuItem value="draft">Draft (Not visible to volunteers)</MenuItem>
                    <MenuItem value="published">Published (Visible to volunteers)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            data-testid="workshop-create-submit"
          >
            {loading ? <CircularProgress size={20} /> : 'Create Workshop'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default WorkshopCreateModal; 