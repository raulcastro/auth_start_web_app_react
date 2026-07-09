import React, { useRef, useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Button,
  Menu,
  MenuItem,
  useTheme,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  Logout as LogoutIcon,
  AccountCircle as AccountCircleIcon,
} from '@mui/icons-material';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import useAppConfig from '../context/useAppConfig';
import { logoutUser, uploadAvatar } from '../services/api';

const drawerWidth = 240;

function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isTogglingTheme, setIsTogglingTheme] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const {
    getTitle,
    getLogo,
    getThemeMode,
    setUserTheme,
    user,
    setUser,
    webAppConfig,
    loading,
  } = useAppConfig();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleThemeToggle = async () => {
    if (isTogglingTheme) return;

    setIsTogglingTheme(true);
    try {
      const currentMode = getThemeMode();
      const newMode = currentMode === 'dark' ? 'light' : 'dark';
      await setUserTheme(newMode);

      // Reload so the MUI theme is rebuilt from the persisted preference.
      window.location.reload();
    } catch (error) {
      console.error('Failed to toggle theme:', error);
    } finally {
      setIsTogglingTheme(false);
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await logoutUser();
    navigate('/login');
  };

  const handleAvatarClick = () => {
    handleMenuClose();
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      const response = await uploadAvatar(file);
      const avatarUrl = response.data?.avatar;
      if (avatarUrl) {
        setUser((prev) => (prev ? { ...prev, avatar: avatarUrl } : prev));
        localStorage.setItem(
          'user',
          JSON.stringify({ ...user, avatar: avatarUrl }),
        );
      }
    } catch (error) {
      console.error('Avatar upload failed:', error);
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Use actual MUI theme mode (resolved from 'auto' if needed)
  const isDarkMode = theme.palette.mode === 'dark';

  // Get appropriate logo based on actual theme
  const getThemeLogo = () => {
    if (isDarkMode) {
      return getLogo('dark') || getLogo('universal');
    }
    return getLogo('light') || getLogo('universal');
  };

  const logoUrl = getThemeLogo();
  const currentMode = getThemeMode();
  const canToggle = webAppConfig?.['features.user_theme_switch']?.value !== false;

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  const drawer = (
    <div>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 2 }}>
        {loading ? (
          <Typography variant="h6" noWrap component="div">
            Loading...
          </Typography>
        ) : logoUrl ? (
          <Avatar
            src={logoUrl}
            sx={{
              width: 220,
              height: 90,
              bgcolor: 'transparent',
              '& img': {
                objectFit: 'contain',
                width: '100%',
                height: '100%',
              },
            }}
            variant="square"
          />
        ) : (
          <Typography variant="h6" noWrap component="div">
            {getTitle()}
          </Typography>
        )}
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
              onClick={() => setMobileOpen(false)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleAvatarChange}
      />
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            AuthStart
          </Typography>
          {canToggle && (
            <Tooltip title={currentMode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
              <IconButton
                color="inherit"
                onClick={handleThemeToggle}
                sx={{ mr: 1 }}
                disabled={isTogglingTheme}
              >
                {currentMode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Tooltip>
          )}

          {/* User Menu */}
          {user && (
            <>
              <Button
                color="inherit"
                onClick={handleMenuOpen}
                startIcon={
                  isUploadingAvatar ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : user.avatar ? (
                    <Avatar src={user.avatar} sx={{ width: 32, height: 32 }} />
                  ) : (
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </Avatar>
                  )
                }
              >
                {user.name || user.email}
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem onClick={handleAvatarClick}>
                  <AccountCircleIcon sx={{ mr: 1 }} />
                  Upload avatar
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <LogoutIcon sx={{ mr: 1 }} />
                  Logout
                </MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          overflow: 'auto',
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}

export default Layout;
