import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { Container, Typography, Paper } from '@mui/material';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ErrorBoundary from './components/ErrorBoundary';

// MVP.1F.12: Theme and styling system
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Professional blue
      contrastText: '#fff',
    },
    secondary: {
      main: '#dc004e', // Éducaloi brand accent
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
});

// MVP.1F.6: React.js with TypeScript configuration
function App(): React.ReactElement {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Layout>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

// 404 Page component
const NotFoundPage: React.FC = () => (
  <Container maxWidth="md" sx={{ py: 4 }}>
    <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h1" color="text.secondary" gutterBottom>
        404
      </Typography>
      <Typography variant="h5" gutterBottom>
        Page not found
      </Typography>
      <Typography variant="body1" color="text.secondary">
        The page you're looking for doesn't exist.
      </Typography>
    </Paper>
  </Container>
);

export default App; 