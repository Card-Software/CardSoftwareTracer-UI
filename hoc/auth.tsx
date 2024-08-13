import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { userAuthenticationService } from '@/services/user-authentication.service';
import LoadingOverlay from '@/components/loading-overlay.component';

const withAuth = (WrappedComponent: React.FC) => {
  const Wrapper: React.FC = (props) => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const checkAuth = async () => {
        if (!userAuthenticationService.isTokenValid()) {
          userAuthenticationService.logout();
          router.replace('/login');
        } else {
          await userAuthenticationService.getUser(); // Ensures user data is loaded
          setLoading(false);
        }
      };

      checkAuth();
    }, []);

    if (loading) {
      return <LoadingOverlay show={true}></LoadingOverlay>; // You can replace this with a proper loading component
    }

    return <WrappedComponent {...props} />;
  };

  return Wrapper;
};

export default withAuth;
