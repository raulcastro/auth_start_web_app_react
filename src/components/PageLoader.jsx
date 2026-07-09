import { Box, CircularProgress } from '@mui/material';

/**
 * Fallback component shown while a lazy-loaded page chunk is being fetched.
 */
function PageLoader() {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
      }}
    >
      <CircularProgress />
    </Box>
  );
}

export default PageLoader;
