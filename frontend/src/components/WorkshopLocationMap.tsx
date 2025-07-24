import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  Alert
} from '@mui/material';
import {
  LocationOn,
  Directions,
  Map,
  OpenInNew,
  Phone,
  Email,
  CopyAll
} from '@mui/icons-material';
import type { WorkshopData } from '../services/workshopService';

interface WorkshopLocationMapProps {
  workshop: WorkshopData;
  showContactInfo?: boolean;
  showDirections?: boolean;
  compact?: boolean;
}

const WorkshopLocationMap: React.FC<WorkshopLocationMapProps> = ({
  workshop,
  showContactInfo = true,
  showDirections = true,
  compact = false
}) => {
  const [copySuccess, setCopySuccess] = useState(false);

  // Format address for display
  const formatAddress = (): string => {
    const { location } = workshop;
    let address = '';
    
    if (location.name) {
      address += location.name;
    }
    
    if (location.address) {
      address += (address ? '\n' : '') + location.address;
    }
    
    address += (address ? '\n' : '') + `${location.city}, ${location.region}`;
    
    return address;
  };

  // Get full address for map links
  const getFullAddress = (): string => {
    const { location } = workshop;
    let fullAddress = '';
    
    if (location.address) {
      fullAddress += location.address + ', ';
    }
    
    fullAddress += `${location.city}, ${location.region}, Quebec, Canada`;
    
    return fullAddress;
  };

  // Open Google Maps
  const openGoogleMaps = () => {
    const address = encodeURIComponent(getFullAddress());
    const url = `https://www.google.com/maps/search/?api=1&query=${address}`;
    window.open(url, '_blank');
  };

  // Get directions
  const getDirections = () => {
    const address = encodeURIComponent(getFullAddress());
    const url = `https://www.google.com/maps/dir/?api=1&destination=${address}`;
    window.open(url, '_blank');
  };

  // Copy address to clipboard
  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(getFullAddress());
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  if (compact) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <LocationOn color="action" />
        <Typography variant="body2" sx={{ flexGrow: 1 }}>
          {workshop.location.city}, {workshop.location.region}
        </Typography>
        {showDirections && (
          <Tooltip title="Get Directions">
            <IconButton size="small" onClick={getDirections}>
              <Directions />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 2 }} data-testid="workshop-location-map">
      {/* Location Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <LocationOn color="primary" />
        <Typography variant="h6" component="h3">
          Workshop Location
        </Typography>
      </Box>

      {/* Location Details */}
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          {workshop.location.name && (
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              {workshop.location.name}
            </Typography>
          )}
          
          <Typography variant="body2" color="text.secondary" paragraph>
            {formatAddress()}
          </Typography>

          {/* Region Chip */}
          <Chip 
            label={workshop.location.region}
            size="small"
            color="primary"
            variant="outlined"
          />
        </CardContent>

        <CardActions sx={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              size="small"
              startIcon={<Map />}
              onClick={openGoogleMaps}
              data-testid="open-map"
            >
              View on Map
            </Button>
            
            {showDirections && (
              <Button
                size="small"
                startIcon={<Directions />}
                onClick={getDirections}
                data-testid="get-directions"
              >
                Get Directions
              </Button>
            )}
          </Box>

          <Tooltip title={copySuccess ? "Copied!" : "Copy Address"}>
            <IconButton
              size="small"
              onClick={copyAddress}
              color={copySuccess ? "success" : "default"}
              data-testid="copy-address"
            >
              <CopyAll />
            </IconButton>
          </Tooltip>
        </CardActions>
      </Card>

      {/* Contact Information */}
      {showContactInfo && workshop.contactPerson && (
        <>
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Phone color="primary" />
            <Typography variant="h6" component="h3">
              Contact Information
            </Typography>
          </Box>

          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                {workshop.contactPerson.name}
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Email fontSize="small" color="action" />
                  <Typography variant="body2">
                    {workshop.contactPerson.email}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => window.open(`mailto:${workshop.contactPerson?.email}`, '_blank')}
                    data-testid="email-contact"
                  >
                    <OpenInNew fontSize="small" />
                  </IconButton>
                </Box>
                
                {workshop.contactPerson.phone && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Phone fontSize="small" color="action" />
                    <Typography variant="body2">
                      {workshop.contactPerson.phone}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => window.open(`tel:${workshop.contactPerson?.phone}`, '_blank')}
                      data-testid="phone-contact"
                    >
                      <OpenInNew fontSize="small" />
                    </IconButton>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </>
      )}

      {/* Map Integration Note */}
      <Alert 
        severity="info" 
        sx={{ mt: 2 }}
        action={
          <Button
            size="small"
            onClick={openGoogleMaps}
          >
            Open Map
          </Button>
        }
      >
        Click "View on Map" to see the location in Google Maps with full mapping features.
      </Alert>

      {/* Accessibility Information */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="caption" color="text.secondary">
          For accessibility information or special accommodations, please contact the venue directly.
        </Typography>
      </Box>
    </Paper>
  );
};

export default WorkshopLocationMap; 