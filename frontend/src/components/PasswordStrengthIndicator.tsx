// MVP.2F.12: Password strength indicator and validation

import React from 'react';
import { Box, Typography, LinearProgress, Stack } from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';

interface PasswordRequirement {
  label: string;
  met: boolean;
  testId: string;
}

interface PasswordStrengthIndicatorProps {
  password: string;
  showRequirements?: boolean;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  showRequirements = true,
}) => {
  // Password strength calculation
  const calculateStrength = (pwd: string): { score: number; level: string; color: string; testId: string } => {
    if (!pwd) return { score: 0, level: 'Very Weak', color: '#f44336', testId: 'strength-very-weak' };

    let score = 0;
    
    // Length check
    if (pwd.length >= 8) score += 20;
    if (pwd.length >= 12) score += 10;
    
    // Character type checks
    if (/[a-z]/.test(pwd)) score += 15; // lowercase
    if (/[A-Z]/.test(pwd)) score += 15; // uppercase
    if (/[0-9]/.test(pwd)) score += 15; // numbers
    if (/[^A-Za-z0-9]/.test(pwd)) score += 20; // special characters
    
    // Bonus for variety
    if (pwd.length >= 10 && /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) {
      score += 5;
    }

    // Determine strength level
    if (score < 30) return { score, level: 'Very Weak', color: '#f44336', testId: 'strength-very-weak' };
    if (score < 50) return { score, level: 'Weak', color: '#ff9800', testId: 'strength-weak' };
    if (score < 70) return { score, level: 'Fair', color: '#ffeb3b', testId: 'strength-fair' };
    if (score < 85) return { score, level: 'Good', color: '#4caf50', testId: 'strength-good' };
    return { score, level: 'Strong', color: '#2e7d32', testId: 'strength-strong' };
  };

  // Password requirements
  const getRequirements = (pwd: string): PasswordRequirement[] => [
    {
      label: 'At least 8 characters',
      met: pwd.length >= 8,
      testId: 'req-length-met',
    },
    {
      label: 'One uppercase letter',
      met: /[A-Z]/.test(pwd),
      testId: 'req-uppercase-met',
    },
    {
      label: 'One lowercase letter',
      met: /[a-z]/.test(pwd),
      testId: 'req-lowercase-met',
    },
    {
      label: 'One number',
      met: /[0-9]/.test(pwd),
      testId: 'req-number-met',
    },
    {
      label: 'One special character',
      met: /[^A-Za-z0-9]/.test(pwd),
      testId: 'req-special-met',
    },
  ];

  const strength = calculateStrength(password);
  const requirements = getRequirements(password);

  return (
    <Box sx={{ mt: 1 }}>
      {/* Strength indicator */}
      {password && (
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              Password Strength
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ color: strength.color, fontWeight: 'medium' }}
              data-testid={strength.testId}
            >
              {strength.level}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={Math.min(strength.score, 100)}
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: '#e0e0e0',
              '& .MuiLinearProgress-bar': {
                backgroundColor: strength.color,
                borderRadius: 3,
              },
            }}
          />
        </Box>
      )}

      {/* Requirements checklist */}
      {showRequirements && (
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Password Requirements:
          </Typography>
          <Stack spacing={0.5}>
            {requirements.map((req, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                {req.met ? (
                  <CheckCircle 
                    sx={{ fontSize: 16, color: '#4caf50' }} 
                    data-testid={req.testId}
                  />
                ) : (
                  <Cancel 
                    sx={{ fontSize: 16, color: '#f44336' }} 
                  />
                )}
                <Typography
                  variant="body2"
                  sx={{
                    color: req.met ? '#4caf50' : '#666',
                    textDecoration: req.met ? 'none' : 'none',
                  }}
                >
                  {req.label}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
};

// Utility function to validate password strength
export const validatePasswordStrength = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}; 