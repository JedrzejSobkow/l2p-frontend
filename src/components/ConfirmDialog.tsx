import { type FC, type ReactNode } from 'react'

type ConfirmDialogProps = {
  open: boolean
  title?: string
  description?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void | Promise<void>
  onCancel: () => void
  loading?: boolean
}

const ConfirmDialog: FC<ConfirmDialogProps> = ({
  open,
  title = 'Are you sure?',
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
}) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[rgba(21,20,34,0.96)] p-6 shadow-xl">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {description ? (
            <div className="text-sm leading-relaxed text-white/70">{description}</div>
          ) : (
            <p className="text-sm text-white/70">This action cannot be undone.</p>
          )}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-white/20 px-5 py-2 text-sm font-medium text-white transition hover:border-white/40 hover:text-white/90"
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-full bg-gradient-to-r from-orange-500 to-orange-400 px-5 py-2 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(255,149,0,0.35)] transition hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
            disabled={loading}
          >
            {loading ? 'Working...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
