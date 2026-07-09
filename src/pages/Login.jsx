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
  FormControlLabel,
  Checkbox,
  Stack,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import { LockOutlined as LockOutlinedIcon } from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import useAppConfig from '../context/useAppConfig';
import { loginUser } from '../services/api';
import {
  initFirebase,
  firebaseLoginWithEmail,
  firebaseLoginWithGoogle,
  firebaseLoginWithApple,
  firebaseLoginWithFacebook,
  firebaseLoginWithGitHub,
} from '../services/firebase';

// Social login icons (using SVG for now, can be replaced with actual icons)
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const AppleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.06 1.87-2.54 5.98.22 7.13-.57 1.5-1.31 2.99-2.27 4.08zm-5.85-15.1c.07-2.04 1.76-3.79 3.75-3.87.29 2.32-1.93 4.48-3.75 3.87z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [firebaseInitialized, setFirebaseInitialized] = useState(false);

  const navigate = useNavigate();
  const {
    getTitle,
    getSubtitle,
    getLogo,
    loading: configLoading,
    webAppConfig,
    config,
    getThemeMode,
    isSignupEnabled,
    updateAuthState,
    isAuthMethodEnabled,
    isFirebaseAuth,
  } = useAppConfig();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setLoading(true);

    try {
      let response;

      if (isFirebaseAuth()) {
        response = await firebaseLoginWithEmail(email, password, config);
      } else {
        response = await loginUser({ email, password });
      }

      if (response.success && response.data) {
        updateAuthState(response.data.user, response.data.token);
        navigate('/dashboard');
      } else {
        setError(response.message || 'Login failed');
        if (response.errors) {
          setFieldErrors(response.errors);
        }
      }
    } catch (err) {
      setError(err.message || 'An error occurred during login');
      if (err.errors) {
        setFieldErrors(err.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    if (!isFirebaseAuth()) {
      setError('Social login is only available with Firebase authentication');
      return;
    }

    setError('');
    setFieldErrors({});
    setLoading(true);

    try {
      let response;

      switch (provider) {
        case 'Google':
          response = await firebaseLoginWithGoogle(config);
          break;
        case 'Apple':
          response = await firebaseLoginWithApple(config);
          break;
        case 'Facebook':
          response = await firebaseLoginWithFacebook(config);
          break;
        case 'GitHub':
          response = await firebaseLoginWithGitHub(config);
          break;
        default:
          throw new Error(`Unknown provider: ${provider}`);
      }

      if (response.success && response.data) {
        updateAuthState(response.data.user, response.data.token);
        navigate('/dashboard');
      } else {
        setError(response.message || `${provider} login failed`);
        if (response.errors) {
          setFieldErrors(response.errors);
        }
      }
    } catch (err) {
      setError(err.message || `Failed to login with ${provider}`);
      if (err.errors) {
        setFieldErrors(err.errors);
      }
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

  // Check which auth methods are enabled
  const emailEnabled = isAuthMethodEnabled('email');
  const googleEnabled = isAuthMethodEnabled('google');
  const appleEnabled = isAuthMethodEnabled('apple');
  const facebookEnabled = isAuthMethodEnabled('facebook');
  const githubEnabled = isAuthMethodEnabled('github');

  const socialEnabled = googleEnabled || appleEnabled || facebookEnabled || githubEnabled;
  const showDivider = emailEnabled && socialEnabled;

  // Show loading while Firebase initializes
  const showFirebaseLoading = isFirebaseAuth() && !firebaseInitialized && !configLoading;

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
          {configLoading || showFirebaseLoading ? (
            <CircularProgress sx={{ m: 2 }} />
          ) : logoUrl ? (
            <Avatar
              src={logoUrl}
              sx={{
                m: 2,
                width: 160,
                height: 160,
                bgcolor: 'transparent',
                '& img': {
                  objectFit: 'contain',
                },
              }}
            />
          ) : (
            <Avatar sx={{ m: 2, width: 160, height: 160, bgcolor: 'primary.main' }}>
              <LockOutlinedIcon sx={{ fontSize: 80 }} />
            </Avatar>
          )}

          <Typography component="h1" variant="h5" fontWeight={500}>
            {configLoading || showFirebaseLoading ? 'Loading...' : getTitle()}
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {configLoading || showFirebaseLoading ? '' : getSubtitle()}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
              {error}
            </Alert>
          )}

          {/* Social Login Buttons - Only for Firebase */}
          {isFirebaseAuth() && socialEnabled && (
            <Stack spacing={1.5} sx={{ mt: 3, width: '100%' }}>
              {googleEnabled && (
                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  startIcon={<GoogleIcon />}
                  onClick={() => handleSocialLogin('Google')}
                  disabled={loading || !firebaseInitialized}
                  sx={{
                    textTransform: 'none',
                    borderColor: 'divider',
                    '&:hover': {
                      borderColor: 'text.primary',
                    },
                  }}
                >
                  Continue with Google
                </Button>
              )}

              {appleEnabled && (
                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  startIcon={<AppleIcon />}
                  onClick={() => handleSocialLogin('Apple')}
                  disabled={loading || !firebaseInitialized}
                  sx={{
                    textTransform: 'none',
                    borderColor: 'divider',
                    '&:hover': {
                      borderColor: 'text.primary',
                    },
                  }}
                >
                  Continue with Apple
                </Button>
              )}

              {facebookEnabled && (
                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  startIcon={<FacebookIcon />}
                  onClick={() => handleSocialLogin('Facebook')}
                  disabled={loading || !firebaseInitialized}
                  sx={{
                    textTransform: 'none',
                    borderColor: 'divider',
                    '&:hover': {
                      borderColor: 'text.primary',
                    },
                  }}
                >
                  Continue with Facebook
                </Button>
              )}

              {githubEnabled && (
                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  startIcon={<GitHubIcon />}
                  onClick={() => handleSocialLogin('GitHub')}
                  disabled={loading || !firebaseInitialized}
                  sx={{
                    textTransform: 'none',
                    borderColor: 'divider',
                    '&:hover': {
                      borderColor: 'text.primary',
                    },
                  }}
                >
                  Continue with GitHub
                </Button>
              )}
            </Stack>
          )}

          {/* Divider */}
          {showDivider && (
            <Box sx={{ width: '100%', mt: 3, mb: 2 }}>
              <Divider>
                <Typography variant="body2" color="text.secondary">
                  or
                </Typography>
              </Divider>
            </Box>
          )}

          {/* Email/Password Form */}
          {emailEnabled && (
            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
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
                disabled={loading || (isFirebaseAuth() && !firebaseInitialized)}
                error={!!fieldErrors.email}
                helperText={fieldErrors.email?.[0] || ''}
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
                disabled={loading || (isFirebaseAuth() && !firebaseInitialized)}
                error={!!fieldErrors.password}
                helperText={fieldErrors.password?.[0] || ''}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    value="remember"
                    color="primary"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={loading || (isFirebaseAuth() && !firebaseInitialized)}
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
                disabled={loading || (isFirebaseAuth() && !firebaseInitialized)}
              >
                {loading ? <CircularProgress size={24} /> : 'Sign In'}
              </Button>

              <Stack
                direction="row"
                spacing={2}
                justifyContent={isSignupEnabled() ? 'space-between' : 'center'}
                alignItems="center"
                sx={{ mt: 2 }}
              >
                <Link
                  component={RouterLink}
                  to="/password-reset"
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
                    component={RouterLink}
                    to="/register"
                    variant="body2"
                    underline="hover"
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
          )}

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

export default Login;
