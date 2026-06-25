import React, { useState } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { AppConfigProvider, useAppConfig } from './context/AppConfigContext';
import DocumentTitle from './components/DocumentTitle';
import Favicons from './components/Favicons';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';

// Inner component that uses the theme from context
function AppContent() {
  const [showRegister, setShowRegister] = useState(false);
  const { theme, isSignupEnabled, isLoggedIn, logout, updateAuthState } = useAppConfig();

  // Prevent showing register if signup is disabled
  const handleSwitchToRegister = () => {
    if (isSignupEnabled()) {
      setShowRegister(true);
    }
  };

  const handleLoginSuccess = (data) => {
    updateAuthState(data.user, data.token);
    setShowRegister(false);
  };

  const handleRegisterSuccess = (data) => {
    updateAuthState(data.user, data.token);
    setShowRegister(false);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Favicons />
      <DocumentTitle suffix={isLoggedIn ? 'Dashboard' : 'Login'} />
      {!isLoggedIn ? (
        showRegister && isSignupEnabled() ? (
          <Register 
            onSwitchToLogin={() => setShowRegister(false)} 
            onRegisterSuccess={handleRegisterSuccess}
          />
        ) : (
          <Login 
            onSwitchToRegister={handleSwitchToRegister} 
            onLoginSuccess={handleLoginSuccess}
          />
        )
      ) : (
        <Layout 
          onLogout={handleLogout}
        >
          <div>
            <h1>Welcome to AuthWebApp</h1>
            <p>You are now logged in!</p>
          </div>
        </Layout>
      )}
    </ThemeProvider>
  );
}

// Main App component
function App() {
  return (
    <AppConfigProvider>
      <AppContent />
    </AppConfigProvider>
  );
}

export default App;
