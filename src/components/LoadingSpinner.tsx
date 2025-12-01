import { type FC } from 'react';

type LoadingSpinnerProps = {
  fullScreen?: boolean;
  className?: string;
  size?: string;
};

const LoadingSpinner: FC<LoadingSpinnerProps> = ({ 
  fullScreen = false, 
  className = '',
  size = 'h-10 w-10'
}) => {
  const containerClasses = fullScreen
    ? 'fixed inset-0 z-50 flex items-center justify-center bg-background'
    : `flex items-center justify-center p-4 ${className}`;

  return (
    <div className={containerClasses}>
      <div 
        className={`
          ${size} 
          animate-spin 
          rounded-full 
          border-4 
          border-white/10 
          border-t-orange-500
        `} 
      />
    </div>
  );
};

export default LoadingSpinner;