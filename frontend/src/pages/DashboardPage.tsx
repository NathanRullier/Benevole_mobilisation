// MVP.2F.10: Role-based UI rendering for volunteers
// MVP.2F.11: Session persistence and user welcome

import React from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Divider,
} from '@mui/material';
import { AssignmentTurnedIn, EventAvailable, Person, School } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!user) {
    return null; // Should not happen due to ProtectedRoute
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome, {user.firstName}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Your volunteer dashboard
          </Typography>
        </Box>
        <Button 
          variant="outlined" 
          onClick={handleLogout}
          data-testid="logout-button"
        >
          Logout
        </Button>
      </Box>

      {/* Navigation Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
              <AssignmentTurnedIn sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" component="h2" gutterBottom>
                My Applications
              </Typography>
              <Typography variant="body2" color="text.secondary">
                View and manage your workshop applications
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center' }}>
              <Button size="small" variant="contained">
                View Applications
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
              <EventAvailable sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
              <Typography variant="h6" component="h2" gutterBottom>
                Available Workshops
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Browse and apply for upcoming workshops
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center' }}>
              <Button size="small" variant="contained">
                Browse Workshops
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
              <Person sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" component="h2" gutterBottom>
                My Profile
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Update your professional information
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center' }}>
              <Button size="small" variant="contained">
                Edit Profile
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
              <School sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
              <Typography variant="h6" component="h2" gutterBottom>
                Training
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Access training materials and resources
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center' }}>
              <Button size="small" variant="outlined">
                Coming Soon
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Recent Activity
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            No recent activity to display.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Apply for workshops to see your activity here.
          </Typography>
        </Box>
      </Paper>

      {/* Account Info */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Account Information
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Name
            </Typography>
            <Typography variant="body1">
              {user.firstName} {user.lastName}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Email
            </Typography>
            <Typography variant="body1">
              {user.email}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Role
            </Typography>
            <Chip 
              label={user.role} 
              color="primary" 
              size="small"
              sx={{ textTransform: 'capitalize' }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              Member Since
            </Typography>
            <Typography variant="body1">
              {new Date(user.createdAt).toLocaleDateString()}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default DashboardPage; 