import React, { useState, useMemo } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import Layout from './components/Layout';
import { lightTheme, darkTheme } from './theme/theme';

function App() {
  const [currentTheme, setCurrentTheme] = useState('light');

  const theme = useMemo(() => {
    return currentTheme === 'dark' ? darkTheme : lightTheme;
  }, [currentTheme]);

  const toggleTheme = () => {
    setCurrentTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Layout toggleTheme={toggleTheme} currentTheme={currentTheme}>
        <div>
          <h1>Welcome to AuthWebApp</h1>
          <p>This is the React frontend for AuthStart.</p>
          <p>Current theme: {currentTheme}</p>
        </div>
      </Layout>
    </ThemeProvider>
  );
}

export default App;
