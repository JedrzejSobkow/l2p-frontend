import React, { useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { verifyUser } from '../services/auth';
import { usePopup } from '../components/PopupContext';

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { showPopup } = usePopup();
  const navigate = useNavigate();
  const hasVerified = useRef(false);

  useEffect(() => {
    const token = searchParams.get('token');

    const verifyEmail = async () => {
      if (!token || hasVerified.current) return;
      hasVerified.current = true;

      try {
        await verifyUser({ token });
        showPopup({ type: 'confirmation', message: 'Your email has been successfully verified! You can now log in.' });
      } catch (error) {
        showPopup({ type: 'error', message: 'Email verification failed. The token may be invalid or expired.' });
      } finally {
        navigate('/login');
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div>
      Verifying your email...
    </div>
  );
};

export default VerifyEmailPage;
