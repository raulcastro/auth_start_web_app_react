import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Grid,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  Fab,
  Tooltip,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  CalendarToday as CalendarTodayIcon,
  VerifiedUser as VerifiedUserIcon,
  AccountCircle as AccountCircleIcon,
  Shield as ShieldIcon,
  Close as CloseIcon,
  PhotoCamera as PhotoCameraIcon,
} from '@mui/icons-material';
import useAppConfig from '../context/useAppConfig';
import { fetchProfile, uploadAvatar } from '../services/api';

// Detail row component
const DetailRow = ({ icon, label, value, chip }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5 }}>
    <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
      {icon}
    </Avatar>
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="body2" color="textSecondary">
        {label}
      </Typography>
      <Typography variant="body1" fontWeight="medium">
        {value || '-'}
      </Typography>
    </Box>
    {chip}
  </Box>
);

function Profile() {
  const { user: cachedUser, setUser } = useAppConfig();
  const fileInputRef = useRef(null);

  const [user, setLocalUser] = useState(cachedUser);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await fetchProfile();
        setLocalUser(profile);
        setUser(profile);
        localStorage.setItem('user', JSON.stringify(profile));
      } catch (err) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [setUser]);

  const handleAvatarClick = () => {
    if (user?.avatar) {
      setLightboxOpen(true);
    }
  };

  const handleAvatarUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const response = await uploadAvatar(file);
      const avatarUrl = response.data?.avatar;

      if (avatarUrl) {
        const updatedUser = { ...user, avatar: avatarUrl };
        setLocalUser(updatedUser);
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setSuccess('Avatar updated successfully.');
      }
    } catch (err) {
      setError(err.message || 'Failed to upload avatar');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const formatDate = (dateString, includeTime = false) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };

    if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }

    return date.toLocaleDateString(undefined, options);
  };

  const formattedCreatedAt = formatDate(user?.created_at);
  const isVerified = Boolean(user?.email_verified_at);
  const providerLabel = user?.user_type === 'firebase_user' ? 'Firebase' : 'Database';

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mx: 3, pb: 5, pt: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Profile
        </Typography>
        <Typography variant="body1" color="textSecondary" gutterBottom>
          Your account details and status.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleAvatarChange}
        />

        <Grid container spacing={3}>
          {/* Profile overview card */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    py: 2,
                  }}
                >
                  <Box sx={{ position: 'relative', mb: 2 }}>
                    <Tooltip title={user?.avatar ? 'View avatar' : 'No avatar'}>
                      <Avatar
                        src={user?.avatar}
                        onClick={handleAvatarClick}
                        sx={{
                          width: 100,
                          height: 100,
                          bgcolor: 'secondary.main',
                          fontSize: 40,
                          cursor: user?.avatar ? 'pointer' : 'default',
                        }}
                      >
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </Avatar>
                    </Tooltip>

                    <Fab
                      color="primary"
                      size="small"
                      aria-label="change avatar"
                      onClick={handleAvatarUploadClick}
                      disabled={uploading}
                      sx={{
                        position: 'absolute',
                        bottom: -8,
                        right: -8,
                        width: 36,
                        height: 36,
                      }}
                    >
                      {uploading ? (
                        <CircularProgress size={18} color="inherit" />
                      ) : (
                        <PhotoCameraIcon sx={{ fontSize: 18 }} />
                      )}
                    </Fab>
                  </Box>

                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    {user?.name || 'User'}
                  </Typography>

                  <Typography variant="body1" color="textSecondary" gutterBottom>
                    {user?.email}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                    <Chip
                      label={user?.is_active ? 'Active' : 'Inactive'}
                      color={user?.is_active ? 'success' : 'default'}
                      size="small"
                    />
                    <Chip
                      label={isVerified ? 'Verified' : 'Pending Verification'}
                      color={isVerified ? 'success' : 'warning'}
                      size="small"
                    />
                  </Box>

                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<PhotoCameraIcon />}
                    onClick={handleAvatarUploadClick}
                    disabled={uploading}
                    sx={{ mt: 2 }}
                  >
                    {uploading ? 'Uploading...' : 'Change Avatar'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Account details card */}
          <Grid size={{ xs: 12, md: 9 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Account Details
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Information about your account and authentication.
                </Typography>

                <Divider sx={{ mb: 2 }} />

                <DetailRow
                  icon={<PersonIcon />}
                  label="Full Name"
                  value={user?.name}
                />
                <Divider component="div" variant="inset" />

                <DetailRow
                  icon={<EmailIcon />}
                  label="Email Address"
                  value={user?.email}
                />
                <Divider component="div" variant="inset" />

                <DetailRow
                  icon={<AccountCircleIcon />}
                  label="User Type"
                  value={providerLabel}
                  chip={
                    <Chip
                      label={providerLabel}
                      color={user?.user_type === 'firebase_user' ? 'info' : 'primary'}
                      size="small"
                    />
                  }
                />
                <Divider component="div" variant="inset" />

                <DetailRow
                  icon={<ShieldIcon />}
                  label="Roles"
                  value={user?.roles?.join(', ') || 'user'}
                />
                <Divider component="div" variant="inset" />

                <DetailRow
                  icon={<VerifiedUserIcon />}
                  label="Email Verification"
                  value={
                    isVerified
                      ? formatDate(user.email_verified_at, true)
                      : 'Not verified yet'
                  }
                  chip={
                    <Chip
                      label={isVerified ? 'Verified' : 'Pending'}
                      color={isVerified ? 'success' : 'warning'}
                      size="small"
                    />
                  }
                />
                <Divider component="div" variant="inset" />

                <DetailRow
                  icon={<CalendarTodayIcon />}
                  label="Member Since"
                  value={formattedCreatedAt}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Avatar Lightbox */}
      <Dialog
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        maxWidth="lg"
        PaperProps={{
          sx: {
            bgcolor: 'transparent',
            boxShadow: 'none',
            overflow: 'hidden',
          },
        }}
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          <IconButton
            onClick={() => setLightboxOpen(false)}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: 'white',
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.7)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
          {user?.avatar && (
            <Box
              component="img"
              src={user.avatar}
              alt="Avatar"
              sx={{
                display: 'block',
                maxWidth: '90vw',
                maxHeight: '90vh',
                width: 'auto',
                height: 'auto',
                borderRadius: 1,
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default Profile;
