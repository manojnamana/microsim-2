import * as React from 'react';
import Box from '@mui/material/Box';
import { Button, Paper, Typography, Snackbar, Alert, Stack } from '@mui/material';
import { useRouter } from 'next/router';
// import Cookies from 'js-cookie';

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
    <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
      <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
      <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
      <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
      <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
    </g>
  </svg>
);

const Login = () => {
  const [openSnackbar, setOpenSnackbar] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');
  const [waiting, setWaiting] = React.useState(false);
  
  const router = useRouter();

  const handleGoogleLogin = () => {
    setWaiting(true);
    setSnackbarMessage('Redirecting to Google login...');
    setOpenSnackbar(true);
    window.location.href = 'https://micro-sim-backend.vercel.app/accounts/google/login/';
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        p: { xs: 2, sm: 3 },
      }}
    >
      {/* Logo and Title */}
      <Stack 
        direction="row" 
        justifyContent="center" 
        alignItems="center"
        spacing={2}
        sx={{ 
          mt: { xs: 4, md: 6 },
          mb: { xs: 4, md: 6 }
        }}
      >
        <img 
          src='/static/images/MicroSim Learning Logo-Black.png' 
          alt="logo" 
          style={{ width: '40px', height: 'auto' }}
        />
        <Typography 
          variant="h4" 
          fontWeight="bold"
          sx={{ 
            fontSize: { xs: '20px', md: '30px' }
          }}
        >
          MicroSim Learning
        </Typography>
      </Stack>

      {/* Login Card */}
      <Paper
        elevation={3}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: { xs: 2, sm: 3, md: 4 },
          width: '100%',
          maxWidth: '450px',
          borderRadius: 2,
          boxShadow: 3,
          mb: 4
        }}
      >
        <Typography 
          variant="h5" 
          fontWeight="bold" 
          sx={{ 
            mb: 3,
            fontSize: { xs: '1.5rem', md: '1.75rem' }
          }}
        >
          Login
        </Typography>

        <Typography 
          variant="body1" 
          sx={{ 
            mb: 4,
            color: 'text.secondary',
            textAlign: 'center',
            fontSize: { xs: '1rem', md: '1.1rem' }
          }}
        >
          Welcome user, please login to continue
        </Typography>
        
        {/* Google Login Button */}
        <Box sx={{ width: '100%', maxWidth: '350px', mb: 3 }}>
          <Button 
            onClick={handleGoogleLogin}
            variant="outlined"
            fullWidth
            startIcon={<GoogleIcon />}
            disabled={waiting}
            sx={{
              backgroundColor: 'white',
              border: '1px solid',
              borderColor: 'divider',
              color: 'text.primary',
              textTransform: 'none',
              fontSize: '1rem',
              py: 1.5,
              '&:hover': {
                backgroundColor: 'action.hover',
                borderColor: 'text.primary'
              },
              '& .MuiButton-startIcon': {
                mr: 1.5
              }
            }}
          >
            {waiting ? 'Logging in with Google...' : 'Login with Google'}
          </Button>
        </Box>

       
      </Paper>

      {/* Snackbar Notification */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarMessage === 'Redirecting to Google login...' ? 'success' : 'error'}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Login;