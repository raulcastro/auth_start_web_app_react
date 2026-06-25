import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Link,
  Avatar,
  CssBaseline,
  FormControlLabel,
  Checkbox,
  Stack,
  CircularProgress,
  Alert,
} from '@mui/material';
import { LockOutlined as LockOutlinedIcon } from '@mui/icons-material';
import { useAppConfig } from '../context/AppConfigContext';
import { loginUser } from '../services/api';

function Login({ onSwitchToRegister, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { 
    getTitle, 
    getSubtitle, 
    getLogo, 
    configLoading, 
    webAppConfig,
    getThemeMode,
    isSignupEnabled,
    updateAuthState,
  } = useAppConfig();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await loginUser({ email, password });
      
      if (response.success && response.data) {
        updateAuthState(response.data.user, response.data.token);
        if (onLoginSuccess) {
          onLoginSuccess(response.data);
        }
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const logoUrl = getLogo('universal') || getLogo('light') || getLogo('dark');
  
  // Build gradient with 3 colors
  const start = webAppConfig?.['theme.login_gradient_start']?.value || '#4f46e5';
  const middle = webAppConfig?.['theme.login_gradient_middle']?.value || '#7c3aed';
  const end = webAppConfig?.['theme.login_gradient_end']?.value || '#c026d3';
  const angle = webAppConfig?.['theme.login_gradient_angle']?.value || '135';
  const gradient = `linear-gradient(${angle}deg, ${start} 0%, ${middle} 50%, ${end} 100%)`;
  
  const isDark = getThemeMode() === 'dark';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: isDark 
          ? 'linear-gradient(135deg, #1e1e1e 0%, #121212 100%)'
          : gradient,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'auto',
      }}
    >
      <CssBaseline />
      <Paper
        elevation={6}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 400,
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {configLoading ? (
            <CircularProgress sx={{ m: 2 }} />
          ) : logoUrl ? (
            <Avatar
              src={logoUrl}
              sx={{
                m: 2,
                width: 120,
                height: 120,
                bgcolor: 'transparent',
                '& img': {
                  objectFit: 'contain',
                },
              }}
            />
          ) : (
            <Avatar sx={{ m: 2, width: 120, height: 120, bgcolor: 'primary.main' }}>
              <LockOutlinedIcon sx={{ fontSize: 60 }} />
            </Avatar>
          )}
          
          <Typography component="h1" variant="h5" fontWeight={500}>
            {configLoading ? 'Loading...' : getTitle()}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {configLoading ? '' : getSubtitle()}
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  value="remember"
                  color="primary"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                />
              }
              label="Remember me"
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3, mb: 2, py: 1.2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
            
            <Stack 
              direction="row" 
              spacing={2} 
              justifyContent={isSignupEnabled() ? "space-between" : "center"}
              alignItems="center"
              sx={{ mt: 2 }}
            >
              <Link 
                href="#" 
                variant="body2"
                underline="hover"
                sx={{ 
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                }}
              >
                Forgot password?
              </Link>
              
              {isSignupEnabled() && (
                <Link
                  href="#"
                  variant="body2"
                  underline="hover"
                  onClick={(e) => {
                    e.preventDefault();
                    onSwitchToRegister();
                  }}
                  sx={{ 
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Sign Up
                </Link>
              )}
            </Stack>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

export default Login;
