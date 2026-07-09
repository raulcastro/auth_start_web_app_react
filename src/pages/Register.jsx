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
  useTheme,
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
    getTitle,
    getSubtitle,
    getLogo,
    webAppConfig,
    config,
    updateAuthState,
    isFirebaseAuth,
    isSignupEnabled,
  } = useAppConfig();

  const theme = useTheme();
  const baseFontSize = theme.typography.fontSize;
  const spacing = theme.spacing;
  const scale = baseFontSize / 16;

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
  const logoUrl = getLogo('universal') || getLogo('light') || getLogo('dark');

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
        p: spacing(2),
      }}
    >
      <CssBaseline />

      {/* Unified Card Container */}
      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          width: '100%',
          maxWidth: { xs: 420 * scale, md: 1000 * scale },
          minHeight: { xs: 'auto', md: 580 * scale },
          borderRadius: 4 * scale,
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          bgcolor: 'transparent',
        }}
      >
        {/* Left Side - Branding with Enhanced Glow */}
        <Box
          sx={{
            flex: { xs: 'none', md: 1 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: spacing(3),
            background: isDark
              ? 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)'
              : gradient,
            color: 'white',
            textAlign: 'center',
            minHeight: { xs: 240 * scale, md: 'auto' },
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 280 * scale,
              height: 280 * scale,
              background: 'radial-gradient(circle, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0) 70%)',
              borderRadius: '50%',
              pointerEvents: 'none',
            },
          }}
        >
          {/* Logo con glow */}
          <Box
            sx={{
              position: 'relative',
              mb: spacing(3),
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 180 * scale,
                height: 180 * scale,
                background: 'radial-gradient(circle, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 65%)',
                borderRadius: '50%',
                filter: 'blur(20px)',
                pointerEvents: 'none',
              },
            }}
          >
            {logoUrl ? (
              <Avatar
                src={logoUrl}
                alt={getTitle()}
                sx={{
                  width: 125 * scale,
                  height: 125 * scale,
                  bgcolor: 'transparent',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.4), 0 0 40px rgba(255,255,255,0.3)',
                  border: `${3 * scale}px solid rgba(255,255,255,0.3)`,
                  position: 'relative',
                  zIndex: 1,
                }}
              />
            ) : (
              <Avatar
                sx={{
                  width: 125 * scale,
                  height: 125 * scale,
                  bgcolor: 'rgba(255,255,255,0.15)',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.4), 0 0 40px rgba(255,255,255,0.3)',
                  border: `${3 * scale}px solid rgba(255,255,255,0.3)`,
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                <PersonAddIcon sx={{ fontSize: 65 * scale }} />
              </Avatar>
            )}
          </Box>

          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              fontSize: `${2.5 * scale}rem`,
              mb: spacing(2),
              textShadow: '0 4px 20px rgba(0,0,0,0.4)',
              letterSpacing: '-0.02em',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {getTitle()}
          </Typography>

          <Typography
            variant="h6"
            sx={{
              fontSize: `${1.1 * scale}rem`,
              opacity: 0.95,
              maxWidth: 340 * scale,
              lineHeight: 1.5,
              fontWeight: 400,
              position: 'relative',
              zIndex: 1,
            }}
          >
            {getSubtitle() || 'Secure authentication for your applications'}
          </Typography>
        </Box>

        {/* Right Side - Registration Form */}
        <Box
          sx={{
            flex: { xs: 'none', md: 1.2 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            p: spacing(3),
            bgcolor: 'background.paper',
          }}
        >
          {/* Sign Up Title */}
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              fontSize: `${2.2 * scale}rem`,
              mb: spacing(0.5),
              textAlign: 'center',
              background: isDark
                ? 'linear-gradient(135deg, #fff 0%, #ccc 100%)'
                : 'linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
            }}
          >
            Sign Up
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: spacing(3),
              textAlign: 'center',
              fontSize: `${0.9 * scale}rem`,
            }}
          >
            Create your account to get started.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: spacing(2), borderRadius: 2 * scale }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: spacing(2), borderRadius: 2 * scale }}>
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2 * scale}>
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
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2 * scale,
                      fontSize: `${scale}rem`,
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: `${scale}rem`,
                    },
                  }}
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
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2 * scale,
                      fontSize: `${scale}rem`,
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: `${scale}rem`,
                    },
                  }}
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
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2 * scale,
                      fontSize: `${scale}rem`,
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: `${scale}rem`,
                    },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
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
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2 * scale,
                      fontSize: `${scale}rem`,
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: `${scale}rem`,
                    },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
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
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2 * scale,
                      fontSize: `${scale}rem`,
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: `${scale}rem`,
                    },
                  }}
                />
              </Grid>
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading || (isFirebaseAuth() && !firebaseInitialized)}
              sx={{
                mt: spacing(3),
                mb: spacing(2),
                py: 1.6 * scale,
                fontSize: `${1.1 * scale}rem`,
                fontWeight: 700,
                borderRadius: 2.5 * scale,
                textTransform: 'none',
                boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
              }}
            >
              {loading ? <CircularProgress size={26 * scale} /> : 'Create Account'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: `${scale}rem` }}>
                Already have an account?{' '}
                <Link
                  component={RouterLink}
                  to="/login"
                  underline="hover"
                  sx={{ fontWeight: 600, fontSize: `${scale}rem` }}
                >
                  Log in
                </Link>
              </Typography>
            </Box>
          </Box>

          {/* Provider Badge */}
          <Alert
            severity="info"
            sx={{
              mt: spacing(3),
              borderRadius: 2 * scale,
              fontSize: `${scale}rem`,
              '& .MuiAlert-message': {
                width: '100%',
                textAlign: 'center',
              },
            }}
          >
            {isFirebaseAuth()
              ? 'Secured by Firebase Authentication'
              : 'Secured by Laravel Sanctum'}
          </Alert>
        </Box>
      </Paper>
    </Box>
  );
}

export default Register;
