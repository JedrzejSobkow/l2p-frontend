import { useState, type FC } from 'react'
import { FiRefreshCw } from 'react-icons/fi'

interface RefreshButtonProps {
  onClick: () => void
  isLoading?: boolean
  title?: string
  className?: string
}

const RefreshButton: FC<RefreshButtonProps> = ({
  onClick,
  isLoading = false,
  title = 'Refresh',
  className = '',
}) => {

    const [onCooldown, setOnCooldown] = useState(false);

    const handleClick = () => {
        if (onCooldown || isLoading) return;

        setTimeout(() => {
            setOnCooldown(false)
        }, 1000);
        onClick();
        setOnCooldown(true);
    }

    const isBusy = isLoading || onCooldown;

    return (
        <button
        type="button"
        onClick={handleClick}
        disabled={isBusy}
        title={isBusy ? `${title} Please wait...` : title}
        // Łączymy domyślne style ze stylami przekazanymi w propsie className
        className={`group flex items-center justify-center rounded-full p-2 text-white/50 transition-all hover:bg-white/10 hover:text-orange-400 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        >
        <FiRefreshCw
            className={`h-5 w-5 transition-transform ${
            isBusy ? 'animate-spin text-orange-400' : 'group-hover:rotate-180'
            }`}
        />
        </button>
    )
    }

export default RefreshButton