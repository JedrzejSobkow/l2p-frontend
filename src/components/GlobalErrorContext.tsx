import { createContext, useContext, useState, type ReactNode, useCallback } from 'react';
import ErrorPage from '@/components/ErrorPage';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

type AppError = {
  title: string;
  message: string;
  code?: number;
} | null;

type GlobalErrorContextType = {
  triggerError: (title: string, message: string, code?: number) => void;
  clearError: () => void;
};

const GlobalErrorContext = createContext<GlobalErrorContextType | undefined>(undefined);

export const GlobalErrorProvider = ({ children }: { children: ReactNode }) => {
  const [error, setError] = useState<AppError>(null);
  const location = useLocation();

  useEffect(() => {
    if (error) setError(null);
  }, [location.pathname, location.search]);

  const triggerError = useCallback((title: string, message: string, code?: number) => {
    setError({ title, message, code });
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  if (error) {
    return (
        <ErrorPage 
            customTitle={error.title} 
            customMessage={error.message} 
        />
    );
  }

  return (
    <GlobalErrorContext.Provider value={{ triggerError, clearError }}>
      {children}
    </GlobalErrorContext.Provider>
  );
};

export const useGlobalError = () => {
  const context = useContext(GlobalErrorContext);
  if (!context) throw new Error('useGlobalError must be used within GlobalErrorProvider');
  return context;
};