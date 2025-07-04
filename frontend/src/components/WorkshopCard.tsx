import React from "react";
import { 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Box, 
  Chip, 
  IconButton,
  Tooltip,
  Stack
} from "@mui/material";
import { 
  LocationOn, 
  AccessTime, 
  People, 
  Edit, 
  Delete, 
  Visibility 
} from "@mui/icons-material";
import { workshopService } from "../services/workshopService";
import type { WorkshopData } from "../services/workshopService";

interface WorkshopCardProps {
  workshop: WorkshopData;
  onSelect?: (workshop: WorkshopData) => void;
  onApply?: (workshop: WorkshopData) => void;
  onEdit?: (workshop: WorkshopData) => void;
  onDelete?: (workshop: WorkshopData) => void;
  viewMode?: 'volunteer' | 'coordinator';
  showActions?: boolean;
}

const WorkshopCard: React.FC<WorkshopCardProps> = ({ 
  workshop, 
  onSelect, 
  onApply, 
  onEdit,
  onDelete,
  viewMode = 'volunteer',
  showActions = true
}) => {
  const handleCardClick = () => {
    onSelect?.(workshop);
  };

  const handleApply = (e: React.MouseEvent) => {
    e.stopPropagation();
    onApply?.(workshop);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(workshop);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(workshop);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isWorkshopPast = workshopService.isWorkshopPast(workshop);
  const statusColor = workshopService.getStatusColor(workshop.status);

  return (
    <Card 
      data-testid="workshop-card" 
      onClick={handleCardClick} 
      sx={{ 
        cursor: "pointer",
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3
        },
        opacity: isWorkshopPast ? 0.7 : 1
      }}
    >
      <CardContent>
        {/* Header with title and status */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography 
            variant="h6" 
            data-testid="workshop-title"
            sx={{ 
              fontWeight: 'bold',
              flex: 1,
              pr: 1
            }}
          >
            {workshop.title}
          </Typography>
          <Chip
            data-testid="workshop-status"
            label={workshop.status.toUpperCase()}
            color={statusColor}
            size="small"
            sx={{ ml: 1 }}
          />
        </Box>

        {/* Date and Time */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <AccessTime fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography data-testid="workshop-date" variant="body2" color="text.secondary">
            {formatDate(workshop.date)}
          </Typography>
          <Typography data-testid="workshop-time" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            {workshopService.formatWorkshopTime(workshop)}
          </Typography>
        </Box>

        {/* Location */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <LocationOn fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography data-testid="workshop-location" variant="body2" color="text.secondary">
            {workshop.location.name ? `${workshop.location.name}, ` : ''}{workshop.location.city}, {workshop.location.region}
          </Typography>
        </Box>

        {/* Volunteers count */}
        {workshop.maxVolunteers && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <People fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {workshop.applicationsCount || 0} / {workshop.maxVolunteers} volunteers
            </Typography>
          </Box>
        )}

        {/* Specializations */}
        {workshop.requiredSpecializations && workshop.requiredSpecializations.length > 0 && (
          <Box sx={{ mb: 1 }}>
            <Stack direction="row" spacing={0.5} flexWrap="wrap">
              {workshop.requiredSpecializations.map((spec, index) => (
                <Chip
                  key={index}
                  data-testid="workshop-specializations"
                  label={spec}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.75rem' }}
                />
              ))}
            </Stack>
          </Box>
        )}

        {/* Description preview */}
        {workshop.description && (
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ 
              mb: 2,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {workshop.description}
          </Typography>
        )}

        {/* Actions */}
        {showActions && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {viewMode === 'volunteer' && workshop.status === 'published' && !isWorkshopPast && (
                                 <Button
                   data-testid="apply-button"
                   variant="contained"
                   size="small"
                   onClick={handleApply}
                   disabled={(workshop.applicationsCount || 0) >= (workshop.maxVolunteers || 0)}
                 >
                   {(workshop.applicationsCount || 0) >= (workshop.maxVolunteers || 0) ? 'Full' : 'Apply'}
                 </Button>
              )}
              
              <Button
                data-testid="view-details-button"
                variant="outlined"
                size="small"
                onClick={handleCardClick}
                startIcon={<Visibility />}
              >
                Details
              </Button>
            </Box>

            {viewMode === 'coordinator' && (
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Tooltip title="Edit Workshop">
                  <IconButton
                    data-testid="edit-button"
                    size="small"
                    onClick={handleEdit}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete Workshop">
                  <IconButton
                    data-testid="delete-button"
                    size="small"
                    onClick={handleDelete}
                    color="error"
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </Box>
        )}

        {/* Cancellation reason */}
        {workshop.status === 'cancelled' && workshop.cancellationReason && (
          <Box sx={{ mt: 1, p: 1, bgcolor: 'error.light', borderRadius: 1 }}>
            <Typography variant="caption" color="error.contrastText">
              <strong>Cancelled:</strong> {workshop.cancellationReason}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkshopCard;
