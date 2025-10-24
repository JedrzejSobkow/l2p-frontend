import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { verifyUser } from '../services/auth';
import Popup from '../components/Popup';

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const hasVerified = useRef(false);
  const [popup, setPopup] = useState<{ type: 'informative' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');

    const verifyEmail = async () => {
      if (!token || hasVerified.current) return;
      hasVerified.current = true;

      try {
        await verifyUser({ token });
        localStorage.setItem(
          'popupData',
          JSON.stringify({ type: 'confirmation', message: 'Account activated. Please log in.' })
        );
      } catch (error) {
        localStorage.setItem(
            'popupData',
            JSON.stringify({ type: 'error', message: 'Error verifying account. Please try again.' })
          );
      } finally {
        navigate('/login');
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div>
      Verifying your email...
      {popup && (
        <Popup
          type={popup.type}
          message={popup.message}
          onClose={() => setPopup(null)}
        />
      )}
    </div>
  );
};

export default VerifyEmailPage;
