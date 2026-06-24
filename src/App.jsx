import React, { useState, useMemo } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { AppConfigProvider } from './context/AppConfigContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import { lightTheme, darkTheme } from './theme/theme';

function App() {
  const [currentTheme, setCurrentTheme] = useState('light');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const theme = useMemo(() => {
    return currentTheme === 'dark' ? darkTheme : lightTheme;
  }, [currentTheme]);

  const toggleTheme = () => {
    setCurrentTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <AppConfigProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {!isAuthenticated ? (
          showRegister ? (
            <Register onSwitchToLogin={() => setShowRegister(false)} />
          ) : (
            <Login onSwitchToRegister={() => setShowRegister(true)} />
          )
        ) : (
          <Layout toggleTheme={toggleTheme} currentTheme={currentTheme}>
            <div>
              <h1>Welcome to AuthWebApp</h1>
              <p>You are now logged in!</p>
              <button onClick={() => setIsAuthenticated(false)}>Logout</button>
            </div>
          </Layout>
        )}
      </ThemeProvider>
    </AppConfigProvider>
  );
}

export default App;
