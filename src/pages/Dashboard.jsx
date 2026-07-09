import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Avatar,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  People as PeopleIcon,
  AccessTime as AccessTimeIcon,
  PersonAdd as PersonAddIcon,
  Login as LoginIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { LineChart } from '@mui/x-charts/LineChart';
import useAppConfig from '../context/useAppConfig';
import { fetchProfile } from '../services/api';

// Stat Card Component
const StatCard = ({ title, value, icon, color, subtitle }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Avatar sx={{ bgcolor: color, mr: 2 }}>
          {icon}
        </Avatar>
        <Box>
          <Typography color="textSecondary" variant="body2">
            {title}
          </Typography>
          <Typography variant="h4" fontWeight="bold">
            {value}
          </Typography>
        </Box>
      </Box>
      {subtitle && (
        <Typography variant="body2" color="textSecondary">
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

// Activity Item Component
const ActivityItem = ({ icon, primary, secondary, time, color }) => (
  <ListItem>
    <ListItemAvatar>
      <Avatar sx={{ bgcolor: color }}>
        {icon}
      </Avatar>
    </ListItemAvatar>
    <ListItemText
      primary={primary}
      secondary={
        <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccessTimeIcon sx={{ fontSize: 14 }} />
          {time}
        </Box>
      }
    />
    <Chip
      label={secondary}
      size="small"
      color="primary"
      variant="outlined"
    />
  </ListItem>
);

function Dashboard() {
  const { user: cachedUser, getThemeMode } = useAppConfig();
  const isDark = getThemeMode() === 'dark';

  const [user, setUser] = useState(cachedUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await fetchProfile();
        setUser(profile);
        localStorage.setItem('user', JSON.stringify(profile));
      } catch (err) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  // Sample data for charts until backend provides user analytics
  const monthlyData = [
    { month: 'Jan', users: 120, logins: 80 },
    { month: 'Feb', users: 150, logins: 95 },
    { month: 'Mar', users: 180, logins: 120 },
    { month: 'Apr', users: 220, logins: 150 },
    { month: 'May', users: 280, logins: 190 },
    { month: 'Jun', users: 350, logins: 240 },
  ];

  const userTypeData = [
    { id: 0, value: 65, label: 'API Users', color: '#1976d2' },
    { id: 1, value: 25, label: 'Firebase Users', color: '#dc004e' },
    { id: 2, value: 10, label: 'Admins', color: '#ff9800' },
  ];

  const activityData = [
    { time: '00:00', activity: 20 },
    { time: '04:00', activity: 15 },
    { time: '08:00', activity: 45 },
    { time: '12:00', activity: 80 },
    { time: '16:00', activity: 65 },
    { time: '20:00', activity: 40 },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mx: 3, pb: 5, pt: 3 }}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            background: isDark
              ? 'linear-gradient(135deg, #1e3a5f 0%, #0d2137 100%)'
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: 2,
          }}
        >
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Welcome back, {user?.name || 'User'}!
          </Typography>
          <Typography variant="body1">
            Here's what's happening with your application today.
          </Typography>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2} columns={12} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              title="Account Status"
              value={user?.is_active ? 'Active' : 'Inactive'}
              icon={<PeopleIcon />}
              color="#1976d2"
              subtitle={user?.email}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              title="Auth Provider"
              value={user?.user_type === 'firebase_user' ? 'Firebase' : 'Sanctum'}
              icon={<LoginIcon />}
              color="#2e7d32"
              subtitle={user?.roles?.join(', ') || 'user'}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              title="Email Verified"
              value={user?.email_verified_at ? 'Yes' : 'No'}
              icon={<CheckCircleIcon />}
              color={user?.email_verified_at ? '#2e7d32' : '#ed6c02'}
              subtitle={user?.email_verified_at ? new Date(user.email_verified_at).toLocaleDateString() : 'Please verify your email'}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              title="Member Since"
              value={user?.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
              icon={<PersonAddIcon />}
              color="#9c27b0"
              subtitle="Welcome to AuthStart"
            />
          </Grid>
        </Grid>

        <Grid container spacing={2} columns={12} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Card sx={{ height: 400 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Platform Growth & Logins (Sample)
                </Typography>
                <Box sx={{ height: 320 }}>
                  <BarChart
                    xAxis={[{
                      scaleType: 'band',
                      data: monthlyData.map(d => d.month),
                      label: 'Month',
                    }]}
                    series={[
                      {
                        data: monthlyData.map(d => d.users),
                        label: 'New Users',
                        color: '#1976d2',
                      },
                      {
                        data: monthlyData.map(d => d.logins),
                        label: 'Logins',
                        color: '#dc004e',
                      },
                    ]}
                    height={300}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: 400 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  User Distribution (Sample)
                </Typography>
                <Box sx={{ height: 320, display: 'flex', justifyContent: 'center' }}>
                  <PieChart
                    series={[
                      {
                        data: userTypeData,
                        highlightScope: { faded: 'global', highlighted: 'item' },
                        faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                      },
                    ]}
                    height={300}
                    width={300}
                    slotProps={{
                      legend: { hidden: false },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={2} columns={12}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Activity Timeline (Sample)
                </Typography>
                <Box sx={{ height: 250 }}>
                  <LineChart
                    xAxis={[{
                      data: activityData.map(d => d.time),
                      scaleType: 'point',
                      label: 'Time',
                    }]}
                    series={[
                      {
                        data: activityData.map(d => d.activity),
                        label: 'Active Users',
                        color: '#2e7d32',
                        area: true,
                      },
                    ]}
                    height={220}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Recent Activity
                </Typography>
                <List>
                  <ActivityItem
                    icon={<PersonAddIcon />}
                    primary="Profile updated"
                    secondary={user?.email}
                    time="Just now"
                    color="#1976d2"
                  />
                  <ActivityItem
                    icon={<LoginIcon />}
                    primary="User logged in"
                    secondary={user?.email}
                    time="Today"
                    color="#2e7d32"
                  />
                  <ActivityItem
                    icon={<CheckCircleIcon />}
                    primary="Email verification"
                    secondary={user?.email_verified_at ? 'Verified' : 'Pending'}
                    time="Today"
                    color={user?.email_verified_at ? '#2e7d32' : '#ed6c02'}
                  />
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Paper sx={{ mt: 3, p: 3 }} elevation={1}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            System Status
          </Typography>
          <Grid container spacing={3} columns={12}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box>
                <Typography variant="body2" color="textSecondary">
                  API Response Time
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="success.main">
                  45ms
                </Typography>
                <LinearProgress variant="determinate" value={85} color="success" sx={{ mt: 1 }} />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box>
                <Typography variant="body2" color="textSecondary">
                  Service Health
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="info.main">
                  Healthy
                </Typography>
                <LinearProgress variant="determinate" value={100} color="info" sx={{ mt: 1 }} />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box>
                <Typography variant="body2" color="textSecondary">
                  Storage Usage
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="warning.main">
                  2.4 GB / 10 GB
                </Typography>
                <LinearProgress variant="determinate" value={24} color="warning" sx={{ mt: 1 }} />
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Box>
  );
}

export default Dashboard;
