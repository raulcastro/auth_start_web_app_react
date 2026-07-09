import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../services/api';

/**
 * Redirects authenticated users away from guest pages (login/register).
 */
function GuestRoute({ children }) {
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  if (isAuthenticated()) {
    return <Navigate to={from} replace />;
  }

  return children;
}

export default GuestRoute;
