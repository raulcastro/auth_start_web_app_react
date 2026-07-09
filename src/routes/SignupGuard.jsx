import { Navigate } from 'react-router-dom';
import useAppConfig from '../context/useAppConfig';

/**
 * Allows access to the registration page only when sign-up is enabled.
 * Redirects to /login otherwise.
 */
function SignupGuard({ children }) {
  const { isSignupEnabled } = useAppConfig();

  if (!isSignupEnabled()) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default SignupGuard;
