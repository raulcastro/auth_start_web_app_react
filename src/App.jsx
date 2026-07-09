import { ThemeProvider, CssBaseline } from '@mui/material';
import { AppConfigProvider } from './context/AppConfigContext';
import useAppConfig from './context/useAppConfig';
import DocumentTitle from './components/DocumentTitle';
import Favicons from './components/Favicons';
import AppRoutes from './routes/AppRoutes';

function AppContent() {
  const { theme, loading } = useAppConfig();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Favicons />
      <DocumentTitle suffix={loading ? 'Loading...' : 'AuthStart'} />
      <AppRoutes />
    </ThemeProvider>
  );
}

function App() {
  return (
    <AppConfigProvider>
      <AppContent />
    </AppConfigProvider>
  );
}

export default App;
