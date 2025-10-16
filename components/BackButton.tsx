import type { AnchorHTMLAttributes, FC } from 'react'
import { FaArrowLeft } from 'react-icons/fa'
import { Link, type To } from 'react-router-dom'

type BackButtonProps = {
  label?: string
  navigateTo?: To
} & AnchorHTMLAttributes<HTMLAnchorElement>

const BackButton: FC<BackButtonProps> = ({ label = 'Back', navigateTo = '/', className = '', ...props }) => {
  return (
    <Link
      to={navigateTo}
      className={`inline-flex items-center gap-2 text-xs font-semibold rounded-md p-2 border border-background-secondary text-button-text transition hover:border hover:border-button bg-background-secondary ${className}`}
      {...props}
    >
      <FaArrowLeft />
      {label}
    </Link>
  )
}

export default BackButton
