import React from 'react';
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
  Divider,
} from '@mui/material';
import {
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
  PersonAdd as PersonAddIcon,
  Login as LoginIcon,
} from '@mui/icons-material';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { LineChart } from '@mui/x-charts/LineChart';
import { useAppConfig } from '../context/AppConfigContext';

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
  const { user, getThemeMode } = useAppConfig();
  const isDark = getThemeMode() === 'dark';

  // Sample data for charts
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
    { id: 1, value: 25, label: 'Admins', color: '#dc004e' },
    { id: 2, value: 10, label: 'Super Admins', color: '#ff9800' },
  ];

  const activityData = [
    { time: '00:00', activity: 20 },
    { time: '04:00', activity: 15 },
    { time: '08:00', activity: 45 },
    { time: '12:00', activity: 80 },
    { time: '16:00', activity: 65 },
    { time: '20:00', activity: 40 },
  ];

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Welcome Section */}
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
          Welcome back, {user?.name || 'User'}! 👋
        </Typography>
        <Typography variant="body1">
          Here's what's happening with your application today.
        </Typography>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Users"
            value="1,234"
            icon={<PeopleIcon />}
            color="#1976d2"
            subtitle="+12% from last month"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Active Today"
            value="89"
            icon={<TrendingUpIcon />}
            color="#2e7d32"
            subtitle="+5% from yesterday"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="New Signups"
            value="24"
            icon={<PersonAddIcon />}
            color="#ed6c02"
            subtitle="This week"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Logins"
            value="8,542"
            icon={<LoginIcon />}
            color="#9c27b0"
            subtitle="All time"
          />
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Bar Chart */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ height: 400 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                User Growth & Logins
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

        {/* Pie Chart */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: 400 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                User Distribution
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

      {/* Bottom Row */}
      <Grid container spacing={3}>
        {/* Activity Chart */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Activity Timeline (Today)
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

        {/* Recent Activity */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Recent Activity
              </Typography>
              <List>
                <ActivityItem
                  icon={<PersonAddIcon />}
                  primary="New user registered"
                  secondary="john@example.com"
                  time="2 minutes ago"
                  color="#1976d2"
                />
                <Divider variant="inset" component="li" />
                <ActivityItem
                  icon={<LoginIcon />}
                  primary="User logged in"
                  secondary="sarah@example.com"
                  time="15 minutes ago"
                  color="#2e7d32"
                />
                <Divider variant="inset" component="li" />
                <ActivityItem
                  icon={<CheckCircleIcon />}
                  primary="Profile updated"
                  secondary="mike@example.com"
                  time="1 hour ago"
                  color="#ed6c02"
                />
                <Divider variant="inset" component="li" />
                <ActivityItem
                  icon={<PeopleIcon />}
                  primary="New admin created"
                  secondary="admin@authstart.com"
                  time="3 hours ago"
                  color="#9c27b0"
                />
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* System Status */}
      <Paper sx={{ mt: 3, p: 3 }} elevation={1}>
        <Typography variant="h6" gutterBottom fontWeight="bold">
          System Status
        </Typography>
        <Grid container spacing={3}>
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
                Database Connections
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="info.main">
                12/50
              </Typography>
              <LinearProgress variant="determinate" value={24} color="info" sx={{ mt: 1 }} />
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
  );
}

export default Dashboard;
