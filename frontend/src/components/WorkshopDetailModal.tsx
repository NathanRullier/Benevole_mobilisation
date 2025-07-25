import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
  Stack,
  IconButton,
  Paper,
  Tabs,
  Tab
} from "@mui/material";
import {
  LocationOn,
  AccessTime,
  People,
  Email,
  Phone,
  School,
  Close,
  Edit,
  Delete,
  Info,
  Map
} from "@mui/icons-material";
import { workshopService } from "../services/workshopService";
import WorkshopLocationMap from "./WorkshopLocationMap";
import type { WorkshopData } from "../services/workshopService";

interface WorkshopDetailModalProps {
  workshop: WorkshopData | null;
  open: boolean;
  onClose: () => void;
  onApply?: (workshop: WorkshopData) => void;
  onEdit?: (workshop: WorkshopData) => void;
  onDelete?: (workshop: WorkshopData) => void;
  viewMode?: 'volunteer' | 'coordinator';
}

const WorkshopDetailModal: React.FC<WorkshopDetailModalProps> = ({
  workshop,
  open,
  onClose,
  onApply,
  onEdit,
  onDelete,
  viewMode = 'volunteer'
}) => {
  const [tabValue, setTabValue] = useState(0);

  if (!workshop) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-CA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isWorkshopPast = workshopService.isWorkshopPast(workshop);
  const statusColor = workshopService.getStatusColor(workshop.status);
  const canApply = viewMode === 'volunteer' && 
                   workshop.status === 'published' && 
                   !isWorkshopPast && 
                   (workshop.applicationsCount || 0) < (workshop.maxVolunteers || 0);

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      data-testid="workshop-detail-modal" 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { maxHeight: '90vh' }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1, pr: 2 }}>
            <Typography variant="h5" data-testid="modal-workshop-title" sx={{ mb: 1 }}>
              {workshop.title}
            </Typography>
            <Chip
              label={workshop.status.toUpperCase()}
              color={statusColor}
              size="small"
            />
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Workshop Description */}
        <Box data-testid="modal-workshop-description" sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Description
          </Typography>
          <Typography variant="body1" paragraph>
            {workshop.description}
          </Typography>
        </Box>

        {/* Workshop Details */}
        <Box sx={{ mb: 3 }}>
          <Paper elevation={1} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Workshop Details
            </Typography>
            
            {/* Date and Time */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AccessTime sx={{ mr: 1, color: 'text.secondary' }} />
              <Box>
                <Typography variant="body1">
                  {formatDate(workshop.date)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {workshopService.formatWorkshopTime(workshop)}
                </Typography>
              </Box>
            </Box>

            {/* Location */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
              <LocationOn sx={{ mr: 1, color: 'text.secondary', mt: 0.5 }} />
              <Box>
                {workshop.location.name && (
                  <Typography variant="body1">
                    {workshop.location.name}
                  </Typography>
                )}
                {workshop.location.address && (
                  <Typography variant="body2" color="text.secondary">
                    {workshop.location.address}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  {workshop.location.city}, {workshop.location.region}
                </Typography>
              </Box>
            </Box>

            {/* Volunteers */}
            {workshop.maxVolunteers && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <People sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body1">
                  {workshop.applicationsCount || 0} / {workshop.maxVolunteers} volunteers
                </Typography>
              </Box>
            )}

            {/* Target Audience */}
            {workshop.targetAudience && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <School sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body1">
                  {workshop.targetAudience}
                </Typography>
              </Box>
            )}

            {/* Workshop Type */}
            {workshop.workshopType && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Type: {workshop.workshopType}
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>

        {/* Contact Information */}
        {workshop.contactPerson && (
          <Box sx={{ mb: 3 }}>
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom data-testid="modal-contact-info">
                Contact Information
              </Typography>
              
              <Typography variant="body1" sx={{ mb: 1 }}>
                {workshop.contactPerson.name}
              </Typography>
              
              {workshop.contactPerson.email && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Email sx={{ mr: 1, color: 'text.secondary', fontSize: '1rem' }} />
                  <Typography variant="body2">
                    {workshop.contactPerson.email}
                  </Typography>
                </Box>
              )}
              
              {workshop.contactPerson.phone && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Phone sx={{ mr: 1, color: 'text.secondary', fontSize: '1rem' }} />
                  <Typography variant="body2">
                    {workshop.contactPerson.phone}
                  </Typography>
                </Box>
              )}
            </Paper>
          </Box>
        )}

        {/* Required Specializations */}
        {workshop.requiredSpecializations && workshop.requiredSpecializations.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Required Specializations
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {workshop.requiredSpecializations.map((spec, index) => (
                  <Chip
                    key={index}
                    label={spec}
                    variant="outlined"
                    sx={{ mb: 1 }}
                  />
                ))}
              </Stack>
            </Paper>
          </Box>
        )}

        {/* Cancellation Reason */}
        {workshop.status === 'cancelled' && workshop.cancellationReason && (
          <Box sx={{ mb: 3 }}>
            <Paper elevation={1} sx={{ p: 2, bgcolor: 'error.light' }}>
              <Typography variant="h6" color="error.contrastText" gutterBottom>
                Workshop Cancelled
              </Typography>
              <Typography variant="body1" color="error.contrastText">
                {workshop.cancellationReason}
              </Typography>
            </Paper>
          </Box>
        )}

        {/* Workshop Metadata */}
        {viewMode === 'coordinator' && (
          <Box sx={{ mb: 3 }}>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Workshop Metadata
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                Created: {workshop.createdAt ? new Date(workshop.createdAt).toLocaleDateString() : 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Updated: {workshop.updatedAt ? new Date(workshop.updatedAt).toLocaleDateString() : 'N/A'}
              </Typography>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button data-testid="modal-close-button" onClick={onClose}>
          Close
        </Button>
        
        {viewMode === 'coordinator' && (
          <>
            <Button
              startIcon={<Edit />}
              onClick={() => onEdit?.(workshop)}
              variant="outlined"
            >
              Edit
            </Button>
            <Button
              startIcon={<Delete />}
              onClick={() => onDelete?.(workshop)}
              color="error"
              variant="outlined"
            >
              Delete
            </Button>
          </>
        )}
        
        {canApply && (
          <Button
            data-testid="modal-apply-button"
            variant="contained"
            onClick={() => onApply?.(workshop)}
          >
            Apply to Workshop
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default WorkshopDetailModal;
