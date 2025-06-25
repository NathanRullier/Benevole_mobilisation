// MVP.2F.10: Role-based UI rendering for coordinators
// Coordinators have hierarchical access (all volunteer features + coordinator features)

import React from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Divider,
} from '@mui/material';
import {
  AssignmentTurnedIn,
  EventAvailable,
  Person,
  School,
  ManageAccounts,
  EventNote,
  RateReview,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const CoordinatorDashboardPage: React.FC = () => {
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
            Coordinator Dashboard
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

      {/* Coordinator-specific Features */}
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Coordinator Tools
      </Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
              <EventNote sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" component="h2" gutterBottom>
                Manage Workshops
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create, edit, and manage workshop sessions
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center' }}>
              <Button size="small" variant="contained">
                Manage Workshops
              </Button>
            </CardActions>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
              <ManageAccounts sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
              <Typography variant="h6" component="h2" gutterBottom>
                View All Volunteers
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Browse and manage volunteer profiles
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center' }}>
              <Button size="small" variant="contained">
                View Volunteers
              </Button>
            </CardActions>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
              <RateReview sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" component="h2" gutterBottom>
                Applications Review
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Review and approve volunteer applications
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center' }}>
              <Button size="small" variant="contained">
                Review Applications
              </Button>
            </CardActions>
          </Card>
        </Box>
      </Box>

      {/* Volunteer Features (Hierarchical Access) */}
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Personal Features
      </Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
              <AssignmentTurnedIn sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" component="h2" gutterBottom>
                My Applications
              </Typography>
              <Typography variant="body2" color="text.secondary">
                View your own workshop applications
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center' }}>
              <Button size="small" variant="outlined">
                View My Applications
              </Button>
            </CardActions>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
              <EventAvailable sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
              <Typography variant="h6" component="h2" gutterBottom>
                Available Workshops
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Browse workshops as a participant
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center' }}>
              <Button size="small" variant="outlined">
                Browse Workshops
              </Button>
            </CardActions>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
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
        </Box>

        <Box sx={{ flex: '1 1 300px', minWidth: '250px' }}>
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
        </Box>
      </Box>

      {/* Statistics Overview */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Overview Statistics
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ flex: '1 1 200px', textAlign: 'center' }}>
            <Typography variant="h4" color="primary.main">
              0
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Workshops
            </Typography>
          </Box>
          <Box sx={{ flex: '1 1 200px', textAlign: 'center' }}>
            <Typography variant="h4" color="secondary.main">
              0
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pending Applications
            </Typography>
          </Box>
          <Box sx={{ flex: '1 1 200px', textAlign: 'center' }}>
            <Typography variant="h4" color="success.main">
              0
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active Volunteers
            </Typography>
          </Box>
          <Box sx={{ flex: '1 1 200px', textAlign: 'center' }}>
            <Typography variant="h4" color="warning.main">
              0
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Upcoming Workshops
            </Typography>
          </Box>
        </Box>
      </Paper>

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
            Create workshops or manage applications to see activity here.
          </Typography>
        </Box>
      </Paper>

      {/* Account Info */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Account Information
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ flex: '1 1 250px' }}>
            <Typography variant="body2" color="text.secondary">
              Name
            </Typography>
            <Typography variant="body1">
              {user.firstName} {user.lastName}
            </Typography>
          </Box>
          <Box sx={{ flex: '1 1 250px' }}>
            <Typography variant="body2" color="text.secondary">
              Email
            </Typography>
            <Typography variant="body1">
              {user.email}
            </Typography>
          </Box>
          <Box sx={{ flex: '1 1 250px' }}>
            <Typography variant="body2" color="text.secondary">
              Role
            </Typography>
            <Chip 
              label={user.role} 
              color="primary" 
              size="small"
              sx={{ textTransform: 'capitalize' }}
            />
          </Box>
          <Box sx={{ flex: '1 1 250px' }}>
            <Typography variant="body2" color="text.secondary">
              Member Since
            </Typography>
            <Typography variant="body1">
              {new Date(user.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default CoordinatorDashboardPage; 