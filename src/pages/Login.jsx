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
  Grid,
  CircularProgress,
} from '@mui/material';
import { LockOutlined as LockOutlinedIcon } from '@mui/icons-material';
import { useAppConfig } from '../context/AppConfigContext';

function Login({ onSwitchToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  const { 
    getTitle, 
    getSubtitle, 
    getLogo, 
    loading, 
    getLoginGradient,
    getThemeMode,
  } = useAppConfig();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login attempt:', { email, password, rememberMe });
    // TODO: Connect to API
  };

  const logoUrl = getLogo('universal') || getLogo('light') || getLogo('dark');
  const gradient = getLoginGradient();
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
          {loading ? (
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
          
          <Typography component="h1" variant="h5">
            {loading ? 'Loading...' : getTitle()}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {loading ? '' : getSubtitle()}
          </Typography>
          
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
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  value="remember"
                  color="primary"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
              }
              label="Remember me"
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign In
            </Button>
            
            <Grid container>
              <Grid item xs>
                <Link href="#" variant="body2">
                  Forgot password?
                </Link>
              </Grid>
              <Grid item>
                <Link
                  href="#"
                  variant="body2"
                  onClick={(e) => {
                    e.preventDefault();
                    onSwitchToRegister();
                  }}
                >
                  {"Don't have an account? Sign Up"}
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

export default Login;
