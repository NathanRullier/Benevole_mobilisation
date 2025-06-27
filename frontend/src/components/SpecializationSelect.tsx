// MVP.3F.9: Specialization Multi-Select Component
// Multi-select with search functionality for legal specializations

import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Chip,
  Paper,
  Typography,
  Checkbox,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  InputAdornment,
  FormHelperText,
} from '@mui/material';
import { Search, Clear } from '@mui/icons-material';
import { profileService } from '../services/profileService';

interface SpecializationSelectProps {
  value: string[];
  onChange: (selected: string[]) => void;
  error?: string;
  label?: string;
  placeholder?: string;
  maxSelections?: number;
}

const SpecializationSelect: React.FC<SpecializationSelectProps> = ({
  value = [],
  onChange,
  error,
  label = 'Legal Specializations',
  placeholder = 'Search and select your areas of expertise...',
  maxSelections = 5,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [availableOptions, setAvailableOptions] = useState<string[]>([]);
  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);

  useEffect(() => {
    const options = profileService.getSpecializationOptions();
    setAvailableOptions(options);
    setFilteredOptions(options);
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredOptions(availableOptions);
    } else {
      const filtered = availableOptions.filter(option =>
        option.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOptions(filtered);
    }
  }, [searchTerm, availableOptions]);

  const handleToggleSpecialization = (specialization: string) => {
    const isSelected = value.includes(specialization);
    
    if (isSelected) {
      // Remove specialization
      onChange(value.filter(item => item !== specialization));
    } else {
      // Add specialization (check max limit)
      if (value.length < maxSelections) {
        onChange([...value, specialization]);
      }
    }
  };

  const handleRemoveSpecialization = (specialization: string) => {
    onChange(value.filter(item => item !== specialization));
  };

  const handleClearAll = () => {
    onChange([]);
    setSearchTerm('');
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  return (
    <Box data-testid="specialization-select">
      <Typography variant="subtitle1" gutterBottom>
        {label}
      </Typography>
      
      {/* Selected Specializations */}
      {value.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Selected ({value.length}/{maxSelections}):
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {value.map((specialization) => (
              <Chip
                key={specialization}
                label={specialization}
                onDelete={() => handleRemoveSpecialization(specialization)}
                color="primary"
                size="small"
                data-testid={`selected-specialization-${specialization.toLowerCase().replace(/\s+/g, '-')}`}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Search Input */}
      <TextField
        fullWidth
        variant="outlined"
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleSearchChange}
        onFocus={() => setIsOpen(true)}
        error={!!error}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
          endAdornment: searchTerm && (
            <InputAdornment position="end">
              <Clear 
                sx={{ cursor: 'pointer' }}
                onClick={() => setSearchTerm('')}
              />
            </InputAdornment>
          ),
        }}
        data-testid="specialization-search"
      />

      {error && (
        <FormHelperText error sx={{ mt: 1 }}>
          {error}
        </FormHelperText>
      )}

      {/* Options List */}
      {isOpen && (
        <Paper
          sx={{
            mt: 1,
            maxHeight: 300,
            overflow: 'auto',
            border: 1,
            borderColor: 'divider',
          }}
          data-testid="specialization-options"
        >
          <List dense>
            {/* Clear All Option */}
            {value.length > 0 && (
              <ListItem sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <ListItemButton 
                  onClick={handleClearAll}
                  sx={{ bgcolor: 'action.hover' }}
                >
                  <ListItemIcon>
                    <Clear />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Clear All Selections"
                    primaryTypographyProps={{ fontWeight: 'bold' }}
                  />
                </ListItemButton>
              </ListItem>
            )}

            {/* Specialization Options */}
            {filteredOptions.length > 0 ? (
              filteredOptions.map((specialization) => {
                const isSelected = value.includes(specialization);
                const isDisabled = !isSelected && value.length >= maxSelections;

                return (
                  <ListItem
                    key={specialization}
                    data-testid={`specialization-option-${specialization.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <ListItemButton
                      onClick={() => !isDisabled && handleToggleSpecialization(specialization)}
                      disabled={isDisabled}
                      sx={{
                        ...(isSelected && { bgcolor: 'action.selected' }),
                        ...(isDisabled && { opacity: 0.5 }),
                      }}
                    >
                      <ListItemIcon>
                        <Checkbox
                          checked={isSelected}
                          disabled={isDisabled}
                          tabIndex={-1}
                          disableRipple
                        />
                      </ListItemIcon>
                      <ListItemText 
                        primary={specialization}
                        secondary={isDisabled && !isSelected ? 'Maximum selections reached' : ''}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })
            ) : (
              <ListItem>
                <ListItemText 
                  primary="No specializations found"
                  secondary={`Try searching for "${searchTerm}" or browse available options`}
                />
              </ListItem>
            )}
          </List>

          {/* Add custom specialization option */}
          {searchTerm && 
           !availableOptions.some(option => 
             option.toLowerCase() === searchTerm.toLowerCase()
           ) && 
           value.length < maxSelections && (
            <ListItem sx={{ borderTop: 1, borderColor: 'divider' }}>
              <ListItemButton
                onClick={() => {
                  if (!value.includes(searchTerm)) {
                    onChange([...value, searchTerm]);
                    setSearchTerm('');
                  }
                }}
                sx={{ bgcolor: 'primary.50' }}
              >
                <ListItemIcon>
                  <Checkbox checked={false} />
                </ListItemIcon>
                <ListItemText 
                  primary={`Add "${searchTerm}"`}
                  secondary="Add as custom specialization"
                  primaryTypographyProps={{ fontWeight: 'bold' }}
                />
              </ListItemButton>
            </ListItem>
          )}
        </Paper>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: -1,
          }}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Helper Text */}
      {value.length === maxSelections && (
        <Typography variant="caption" color="warning.main" sx={{ mt: 1, display: 'block' }}>
          Maximum of {maxSelections} specializations selected. Remove some to add others.
        </Typography>
      )}

      {value.length === 0 && !error && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Select your areas of legal expertise. You can choose up to {maxSelections} specializations.
        </Typography>
      )}
    </Box>
  );
};

export { SpecializationSelect }; 