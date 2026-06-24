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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const { theme, isSignupEnabled } = useAppConfig();

  // Prevent showing register if signup is disabled
  const handleSwitchToRegister = () => {
    if (isSignupEnabled()) {
      setShowRegister(true);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Favicons />
      <DocumentTitle suffix={isAuthenticated ? 'Dashboard' : 'Login'} />
      {!isAuthenticated ? (
        showRegister && isSignupEnabled() ? (
          <Register onSwitchToLogin={() => setShowRegister(false)} />
        ) : (
          <Login onSwitchToRegister={handleSwitchToRegister} />
        )
      ) : (
        <Layout 
          onLogout={() => setIsAuthenticated(false)} 
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
