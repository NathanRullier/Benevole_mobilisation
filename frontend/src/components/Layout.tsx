import React from 'react';
import { Box, Container, AppBar, Toolbar, Typography, useTheme } from '@mui/material';

interface LayoutProps {
  children: React.ReactNode;
}

// MVP.1F.11: Basic responsive layout components
const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontWeight: 600,
              letterSpacing: 0.5 
            }}
          >
            Volunteer Management Platform
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Éducaloi
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box 
        component="main" 
        role="main"
        sx={{ 
          flexGrow: 1,
          bgcolor: theme.palette.background.default,
          py: 3 
        }}
      >
        <Container maxWidth="lg">
          {children}
        </Container>
      </Box>

      {/* Footer */}
      <Box 
        component="footer"
        sx={{ 
          bgcolor: theme.palette.grey[100],
          py: 2,
          mt: 'auto'
        }}
      >
        <Container maxWidth="lg">
          <Typography 
            variant="body2" 
            color="text.secondary" 
            align="center"
          >
            © 2024 Éducaloi - Volunteer Management Platform
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout; 