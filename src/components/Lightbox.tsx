import { useCallback, useEffect } from "react"

export type LightboxProps = {
  isOpen: boolean
  imageUrl: string
  alt?: string
  onClose: () => void
}

const Lightbox = ({ isOpen, imageUrl, alt, onClose }: LightboxProps) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    },
    [onClose],
  )

  useEffect(() => {
    if (!isOpen) return
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [handleKeyDown, isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Full screen media viewer"
      onClick={onClose}
    >
      <button
        type="button"
        className="absolute right-8 top-8 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white/80 transition hover:border-white/40 hover:text-white"
        onClick={onClose}
        aria-label="Close image preview"
      >
        <span className="text-xl">×</span>
      </button>
      <div className="max-h-[90vh] max-w-[90vw] p-4" onClick={(event) => event.stopPropagation()}>
        <img
          src={imageUrl}
          alt={alt ?? "Full screen attachment"}
          className="max-h-[86vh] max-w-[86vw] rounded-3xl object-contain shadow-[0_25px_60px_rgba(0,0,0,0.55)]"
        />
      </div>
    </div>
  )
}

export default Lightbox
