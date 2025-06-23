import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Card, 
  CardContent, 
  Alert,
  Chip
} from '@mui/material';
import { 
  VolunteerActivism, 
  School, 
  Groups,
  Api
} from '@mui/icons-material';

// MVP.1F.10: API client configuration test
const HomePage: React.FC = () => {
  const [backendStatus, setBackendStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [backendMessage, setBackendMessage] = useState<string>('');

  useEffect(() => {
    // Test backend connectivity
    const testBackendConnection = async () => {
      try {
        const response = await fetch('/api/health');
        if (response.ok) {
          const data = await response.json();
          setBackendStatus('connected');
          setBackendMessage(data.message || 'Backend connected successfully');
        } else {
          setBackendStatus('error');
          setBackendMessage('Backend responded with error');
        }
      } catch (error) {
        setBackendStatus('error');
        setBackendMessage('Failed to connect to backend');
      }
    };

    testBackendConnection();
  }, []);

  return (
    <Box>
      {/* Header Section */}
      <Paper elevation={2} sx={{ p: 4, mb: 4, textAlign: 'center' }}>
        <VolunteerActivism sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
        <Typography variant="h2" gutterBottom>
          Welcome to the Volunteer Management Platform
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          Connecting legal professionals with educational opportunities across Quebec
        </Typography>
        
        {/* Backend Status Indicator */}
        <Box sx={{ mb: 2 }}>
          {backendStatus === 'loading' && (
            <Chip label="Connecting to backend..." color="default" />
          )}
          {backendStatus === 'connected' && (
            <Chip 
              label={`✓ Backend Connected: ${backendMessage}`} 
              color="success" 
              icon={<Api />}
            />
          )}
          {backendStatus === 'error' && (
            <Chip 
              label={`✗ Backend Error: ${backendMessage}`} 
              color="error" 
              icon={<Api />}
            />
          )}
        </Box>
      </Paper>

      {/* Feature Cards */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(33.333% - 16px)' } }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <VolunteerActivism sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Volunteer Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Coordinate 200+ legal volunteers providing educational workshops
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(33.333% - 16px)' } }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <School sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Educational Workshops
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Organize workshops in schools, libraries, and community organizations
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(33.333% - 16px)' } }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Groups sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Community Impact
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Build stronger communities through legal education and volunteer engagement
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Status Information */}
      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          System Status
        </Typography>
        
        <Alert severity="info" sx={{ mb: 2 }}>
          <strong>MVP Phase Complete:</strong> Backend authentication and profile management systems are operational.
        </Alert>

        <Alert severity="success" sx={{ mb: 2 }}>
          <strong>Frontend Foundation:</strong> React.js with TypeScript, Material-UI, and React Router configured.
        </Alert>

        {backendStatus === 'connected' && (
          <Alert severity="success">
            <strong>Backend Connectivity:</strong> Successfully connected to backend API at localhost:3000
          </Alert>
        )}

        {backendStatus === 'error' && (
          <Alert severity="warning">
            <strong>Backend Connectivity:</strong> Unable to connect to backend. Please ensure the backend server is running on port 3000.
          </Alert>
        )}
      </Paper>
    </Box>
  );
};

export default HomePage; 