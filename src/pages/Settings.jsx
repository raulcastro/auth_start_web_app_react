import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Button,
  Alert,
  CircularProgress,
  Grid,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { useAppConfig } from '../context/AppConfigContext';
import { updateUserPreferences } from '../services/api';

function Settings() {
  const { userPreferences, webAppConfig, getThemeMode } = useAppConfig();
  const [themeMode, setThemeMode] = useState('');
  const [fontSize, setFontSize] = useState('');
  const [denseLayout, setDenseLayout] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Initialize values from user preferences
  useEffect(() => {
    if (userPreferences) {
      setThemeMode(userPreferences['theme.mode']?.value || getThemeMode() || 'light');
      setFontSize(userPreferences['typography.base_font_size']?.value || '16');
      setDenseLayout(userPreferences['layout.dense']?.value === '1' || userPreferences['layout.dense']?.value === true);
    }
  }, [userPreferences, getThemeMode]);

  const handleSave = async () => {
    setLoading(true);
    setSuccess('');
    setError('');

    try {
      const preferences = {};
      
      if (canChangeTheme) {
        preferences['theme.mode'] = themeMode;
      }
      if (canChangeFontSize) {
        preferences['typography.base_font_size'] = fontSize;
      }
      if (canChangeDenseLayout) {
        preferences['layout.dense'] = denseLayout ? '1' : '0';
      }

      await updateUserPreferences(preferences);
      setSuccess('Preferences saved! Reloading...');
      
      // Reload after a short delay to apply changes
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      setError(err.message || 'Failed to save preferences');
      setLoading(false);
    }
  };

  // Helper to check if feature is enabled
  const isFeatureEnabled = (featureKey) => {
    const value = webAppConfig?.[featureKey]?.value;
    return value === true || value === '1' || value === 1 || value === 'true';
  };

  const canChangeTheme = isFeatureEnabled('features.user_theme_switch');
  const canChangeFontSize = isFeatureEnabled('features.user_font_size');
  const canChangeDenseLayout = isFeatureEnabled('features.user_dense_layout');

  // Check if any preference is editable
  const hasEditablePreferences = canChangeTheme || canChangeFontSize || canChangeDenseLayout;

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mx: 3, pb: 5, pt: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Settings
        </Typography>

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {!hasEditablePreferences && (
          <Alert severity="info" sx={{ mb: 3 }}>
            No preferences are available for customization. Contact your administrator.
          </Alert>
        )}

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Appearance
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Customize how the application looks and feels.
            </Typography>

            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              {/* Theme Mode */}
              {canChangeTheme && (
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel id="theme-mode-label">Theme Mode</InputLabel>
                    <Select
                      labelId="theme-mode-label"
                      id="theme-mode"
                      value={themeMode}
                      label="Theme Mode"
                      onChange={(e) => setThemeMode(e.target.value)}
                    >
                      <MenuItem value="light">Light</MenuItem>
                      <MenuItem value="dark">Dark</MenuItem>
                      <MenuItem value="auto">Auto (System)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}

              {/* Font Size */}
              {canChangeFontSize && (
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel id="font-size-label">Font Size</InputLabel>
                    <Select
                      labelId="font-size-label"
                      id="font-size"
                      value={fontSize}
                      label="Font Size"
                      onChange={(e) => setFontSize(e.target.value)}
                    >
                      <MenuItem value="12">Small (12px)</MenuItem>
                      <MenuItem value="14">Medium (14px)</MenuItem>
                      <MenuItem value="16">Default (16px)</MenuItem>
                      <MenuItem value="18">Large (18px)</MenuItem>
                      <MenuItem value="20">Extra Large (20px)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}

              {/* Dense Layout */}
              {canChangeDenseLayout && (
                <Grid size={{ xs: 12 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={denseLayout}
                        onChange={(e) => setDenseLayout(e.target.checked)}
                      />
                    }
                    label="Dense Layout (Compact spacing)"
                  />
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>

        {hasEditablePreferences && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
              onClick={handleSave}
              disabled={loading}
            >
              Save Changes
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default Settings;
