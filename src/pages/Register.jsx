import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Link,
  Avatar,
  CssBaseline,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import { PersonAdd as PersonAddIcon } from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import useAppConfig from '../context/useAppConfig';
import { registerUser } from '../services/api';
import { initFirebase, firebaseRegisterWithEmail } from '../services/firebase';

function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [firebaseInitialized, setFirebaseInitialized] = useState(false);

  const navigate = useNavigate();
  const {
    getThemeMode,
    webAppConfig,
    config,
    updateAuthState,
    isFirebaseAuth,
    isSignupEnabled,
  } = useAppConfig();

  // Redirect back to login if signup becomes disabled while on this page.
  useEffect(() => {
    if (config && !isSignupEnabled()) {
      navigate('/login', { replace: true });
    }
  }, [config, isSignupEnabled, navigate]);

  // Initialize Firebase when config is loaded and Firebase is the provider
  useEffect(() => {
    const init = async () => {
      if (isFirebaseAuth() && config && !firebaseInitialized) {
        try {
          await initFirebase(config);
          setFirebaseInitialized(true);
        } catch (err) {
          console.error('Failed to initialize Firebase:', err);
          setError('Failed to initialize authentication. Please try again.');
        }
      }
    };
    init();
  }, [config, isFirebaseAuth, firebaseInitialized]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setFieldErrors({ confirmPassword: ['Passwords do not match'] });
      setError('Passwords do not match!');
      return;
    }

    setLoading(true);

    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      let response;

      if (isFirebaseAuth()) {
        response = await firebaseRegisterWithEmail(
          formData.email,
          formData.password,
          fullName,
          config,
        );
      } else {
        const userData = {
          name: fullName,
          email: formData.email,
          password: formData.password,
          password_confirmation: formData.confirmPassword,
        };
        response = await registerUser(userData);
      }

      if (response.success && response.data) {
        setSuccess('Registration successful! Redirecting...');
        updateAuthState(response.data.user, response.data.token);
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        setError(response.message || 'Registration failed');
        if (response.errors) {
          setFieldErrors(response.errors);
        }
      }
    } catch (err) {
      setError(err.message || 'An error occurred during registration');
      if (err.errors) {
        setFieldErrors(err.errors);
      }
    } finally {
      setLoading(false);
    }
  };

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
          maxWidth: 450,
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
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <PersonAddIcon />
          </Avatar>

          <Typography component="h1" variant="h5">
            Sign up
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mt: 2, width: '100%' }}>
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  autoComplete="given-name"
                  name="firstName"
                  required
                  fullWidth
                  id="firstName"
                  label="First Name"
                  autoFocus
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={loading || (isFirebaseAuth() && !firebaseInitialized)}
                  error={!!fieldErrors.name}
                  helperText={fieldErrors.name?.[0] || ''}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  required
                  fullWidth
                  id="lastName"
                  label="Last Name"
                  name="lastName"
                  autoComplete="family-name"
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={loading || (isFirebaseAuth() && !firebaseInitialized)}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading || (isFirebaseAuth() && !firebaseInitialized)}
                  error={!!fieldErrors.email}
                  helperText={fieldErrors.email?.[0] || ''}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading || (isFirebaseAuth() && !firebaseInitialized)}
                  error={!!fieldErrors.password}
                  helperText={fieldErrors.password?.[0] || ''}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={loading || (isFirebaseAuth() && !firebaseInitialized)}
                  error={!!fieldErrors.confirmPassword}
                  helperText={fieldErrors.confirmPassword?.[0] || ''}
                />
              </Grid>
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading || (isFirebaseAuth() && !firebaseInitialized)}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign Up'}
            </Button>

            <Grid container sx={{ justifyContent: 'flex-end' }}>
              <Grid>
                <Link
                  component={RouterLink}
                  to="/login"
                  variant="body2"
                >
                  Already have an account? Sign in
                </Link>
              </Grid>
            </Grid>
          </Box>

          {/* Provider Badge */}
          {isFirebaseAuth() ? (
            <Alert severity="info" sx={{ mt: 2, width: '100%' }}>
              Secured by Firebase Authentication
            </Alert>
          ) : (
            <Alert severity="info" sx={{ mt: 2, width: '100%' }}>
              Secured by Laravel Sanctum
            </Alert>
          )}
        </Box>
      </Paper>
    </Box>
  );
}

export default Register;
