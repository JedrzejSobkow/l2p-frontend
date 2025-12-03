import { useRouteError, isRouteErrorResponse, useNavigate } from "react-router-dom";
import { FaExclamationTriangle, FaHome, FaRedo } from "react-icons/fa";

interface ErrorPageProps {
  customTitle?: string;
  customMessage?: string;
  customCode?: number;
}

const ErrorPage = ({ customTitle, customMessage, customCode }: ErrorPageProps) => {
  const error: any = useRouteError();
  const navigate = useNavigate();
  
  let title = customTitle || "An unexpected error occurred";
  let message = customMessage || "Something went wrong.";
  let code = customCode;

  if (!customTitle && !customMessage) {
    if (isRouteErrorResponse(error)) {
      code = error.status;
      if (error.status === 404) {
        title = "Page Not Found";
        message = "The page you are looking for does not exist.";
      } else {
        title = `Error ${error.status}`;
        message = error.statusText;
      }
    } else if (error instanceof Error) {
      message = error.message;
    }
  }

  const isFatalError = code === 503 || title === "Session Initialization Failed";

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-white p-4">
      <div className="flex flex-col items-center max-w-md text-center p-8 rounded-3xl border border-white/10 bg-background-secondary shadow-2xl">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 text-red-500">
          <FaExclamationTriangle className="h-10 w-10" />
        </div>
        
        <h1 className="text-2xl font-bold text-headline mb-2">{title}</h1>
        <p className="text-white/60 mb-8 whitespace-pre-wrap">{message}</p>

        <div className="flex gap-4">
          {isFatalError ? (
            <button
              onClick={handleReload}
              className="flex items-center gap-2 rounded-xl bg-orange-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-400 hover:scale-105"
            >
              <FaRedo className="animate-spin-slow" /> Try Again
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate(-1)}
                className="rounded-xl border border-white/10 px-6 py-2.5 text-sm font-semibold transition hover:bg-white/5"
              >
                Go Back
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-400"
              >
                <FaHome /> Home
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;