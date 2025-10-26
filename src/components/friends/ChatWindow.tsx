import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FC,
  type FormEvent,
  type KeyboardEvent
} from 'react'
import { FiPaperclip, FiSend, FiX } from 'react-icons/fi'

export type ChatMessage = {
  id: string
  senderId: string
  senderName: string
  avatarUrl?: string
  content: string
  createdAt: string | number | Date
  isSystem?: boolean
}

export interface ChatWindowProps {
  title?: string
  messages: ChatMessage[]
  currentUserId: string
  allowAttachments?: boolean
  placeholder?: string
  className?: string
  isSending?: boolean
  typingUsers?: string[]
  onSend: (payload: { text: string; attachment?: File | null }) => Promise<void> | void
}

const cn = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ')

const formatTime = (timestamp: ChatMessage['createdAt']) => {
  try {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp)
    return new Intl.DateTimeFormat('en', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  } catch {
    return ''
  }
}

const ChatWindow: FC<ChatWindowProps> = ({
  title,
  messages,
  currentUserId,
  allowAttachments = false,
  placeholder = 'Write a message...',
  className,
  isSending,
  typingUsers,
  onSend
}) => {
  const [draft, setDraft] = useState('')
  const [attachment, setAttachment] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    const container = scrollRef.current
    if (!container) {
      return
    }
    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth'
    })
  }, [messages])

  const isComposerDisabled = sending || isSending

  const displayedTyping = useMemo(() => {
    if (!typingUsers || typingUsers.length === 0) {
      return ''
    }
    if (typingUsers.length === 1) {
      return `${typingUsers[0]} is typing...`
    }
    if (typingUsers.length === 2) {
      return `${typingUsers[0]} and ${typingUsers[1]} are typing...`
    }
    return 'Several users are typing...'
  }, [typingUsers])

  const handleSend = async () => {
    if (!draft.trim() && !attachment) {
      return
    }
    try {
      setSending(true)
      await onSend({ text: draft.trim(), attachment })
      setDraft('')
      setAttachment(null)
      fileInputRef.current?.form?.reset()
    } finally {
      setSending(false)
    }
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    void handleSend()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void handleSend()
    }
  }

  const handleAttachment = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setAttachment(file)
    } else {
      setAttachment(null)
    }
  }

  const removeAttachment = () => {
    setAttachment(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div
      className={cn(
        'flex h-full min-h-[480px] w-full flex-col overflow-hidden rounded-[32px] border border-white/10 bg-[rgba(20,19,32,0.95)] shadow-[0_15px_45px_rgba(0,0,0,0.45)]',
        className
      )}
    >
      {title && (
        <header className="border-b border-white/10 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
        </header>
      )}

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
        {messages.map((message) => {
          const isOwn = message.senderId === currentUserId
          if (message.isSystem) {
            return (
              <div
                key={message.id}
                className="flex justify-center text-xs font-medium uppercase tracking-wide text-white/50"
              >
                <span className="rounded-full bg-white/5 px-3 py-1">{message.content}</span>
              </div>
            )
          }

          return (
            <div key={message.id} className={cn('flex items-end gap-3', isOwn ? 'justify-end' : 'justify-start')}>
              {!isOwn && (
                <img
                  src={message.avatarUrl || 'src/assets/images/pfp.png'}
                  alt={message.senderName}
                  className="h-10 w-10 flex-shrink-0 rounded-full border border-white/10 object-cover"
                />
              )}
              <div className={cn('max-w-[75%] space-y-1', isOwn ? 'text-right' : 'text-left')}>
                <div
                  className={cn(
                    'inline-flex min-h-[48px] w-full flex-col rounded-3xl px-4 py-3 text-sm text-white shadow-[0_10px_25px_rgba(0,0,0,0.25)]',
                    isOwn ? 'bg-gradient-to-r from-orange-500 to-orange-400 text-white' : 'bg-[rgba(35,34,49,0.95)]'
                  )}
                >
                  {!isOwn && <span className="mb-1 text-xs font-semibold text-white/70">{message.senderName}</span>}
                  <span className="whitespace-pre-wrap break-words leading-relaxed text-sm">{message.content}</span>
                </div>
                <span className="block text-xs font-medium text-white/40">{formatTime(message.createdAt)}</span>
              </div>
              {isOwn && (
                <img
                  src={message.avatarUrl || 'src/assets/images/pfp.png'}
                  alt="You"
                  className="h-10 w-10 flex-shrink-0 rounded-full border border-transparent object-cover ring-2 ring-orange-400/40"
                />
              )}
            </div>
          )
        })}
        {displayedTyping && (
          <div className="flex justify-start text-xs text-white/60">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
              <span className="h-2 w-2 animate-bounce rounded-full bg-white/70" />
              <span>{displayedTyping}</span>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-white/10 px-6 py-5">
        <div className="relative flex items-end gap-4">
          {allowAttachments && (
            <>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-full border border-white/15 text-white/80 transition hover:border-orange-400/40 hover:text-white"
                aria-label="Add attachment"
                disabled={isComposerDisabled}
              >
                <FiPaperclip className="h-5 w-5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleAttachment}
                aria-hidden="true"
              />
            </>
          )}

          <div className="relative flex-1">
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              rows={2}
              className="w-full resize-none rounded-3xl border border-transparent bg-white text-sm text-black/90 outline-none transition focus:border-orange-400/60 focus:shadow-[0_0_0_4px_rgba(255,149,0,0.25)] px-5 py-4 pr-16"
              disabled={isComposerDisabled}
            />
            <button
              type="submit"
              className="absolute bottom-2 right-2 grid h-10 w-10 place-items-center rounded-full bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-[0_8px_18px_rgba(255,149,0,0.45)] transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300 disabled:opacity-60 disabled:hover:scale-100"
              disabled={isComposerDisabled}
              aria-label="Send message"
            >
              <FiSend className="h-5 w-5" />
            </button>
          </div>
        </div>
        {attachment && (
          <div className="mt-3 flex items-center justify-between rounded-2xl border border-orange-400/20 bg-orange-400/10 px-4 py-2 text-xs text-white/80">
            <span className="truncate font-medium">{attachment.name}</span>
            <button
              type="button"
              onClick={removeAttachment}
              className="ml-4 flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-white/70 transition hover:border-white/30 hover:text-white"
            >
              <FiX className="h-3 w-3" />
              Remove
            </button>
          </div>
        )}
      </form>
    </div>
  )
}

export default ChatWindow
