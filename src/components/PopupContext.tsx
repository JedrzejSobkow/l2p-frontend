import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import Popup, { type PopupProps } from './Popup'

type PopupRequest = {
  id: string
  type: PopupProps['type']
  message: string
}

type ShowPopupPayload = Omit<PopupRequest, 'id'>

type PopupContextValue = {
  showPopup: (payload: ShowPopupPayload) => string
  closePopup: (id: string) => void
  clearPopups: () => void
}

const PopupContext = createContext<PopupContextValue | undefined>(undefined)

const generateId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2, 10)
}

export const PopupProvider = ({ children }: { children: ReactNode }) => {
  const [popups, setPopups] = useState<PopupRequest[]>([])

  const closePopup = useCallback((id: string) => {
    setPopups((prev) => prev.filter((popup) => popup.id !== id))
  }, [])

  const clearPopups = useCallback(() => {
    setPopups([])
  }, [])

  const showPopup = useCallback((payload: ShowPopupPayload) => {
    const id = generateId()
    setPopups((prev) => [...prev, { ...payload, id }])
    return id
  }, [])

  const value = useMemo(
    () => ({
      showPopup,
      closePopup,
      clearPopups,
    }),
    [showPopup, closePopup, clearPopups],
  )

  return (
    <PopupContext.Provider value={value}>
      {children}
      {typeof document !== 'undefined'
        ? createPortal(
            <div>
              {popups.map((popup) => (
                <Popup
                  key={popup.id}
                  type={popup.type}
                  message={popup.message}
                  onClose={() => closePopup(popup.id)}
                />
              ))}
            </div>,
            document.body,
          )
        : null}
    </PopupContext.Provider>
  )
}

export const usePopup = () => {
  const ctx = useContext(PopupContext)
  if (!ctx) throw new Error('usePopup must be used within PopupProvider')
  return ctx
}
