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
  imageUrl?: string
  isSystem?: boolean
}

export interface ChatWindowProps {
  title?: string
  messages: ChatMessage[]
  currentUserId: string
  friendId: string
  allowAttachments?: boolean
  placeholder?: string
  className?: string
  isSending?: boolean
  typingUsers?: string[]
  onSend: (payload: { text: string; attachment?: File | null }) => Promise<void> | void
  onTyping?: (friend_user_id: string) => void
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
  friendId,
  allowAttachments = false,
  placeholder = 'Write a message...',
  className,
  isSending,
  typingUsers,
  onSend,
  onTyping,
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
        'flex flex-1 h-full min-h-0 w-full flex-col overflow-visible rounded-2xl rounded-b-none border border-separator bg-background-secondary max-h-[77vh]',
        className
      )}
    >
      {title && (
        <header className="border-b border-separator flex flex-row gap-5 px-3 py-2">
          <img
            className='w-12 h-12 rounded-full'
            src='src/assets/images/pfp.png'></img>
          <h2 className="text-s font-semibold text-headline">{title}</h2>
          
        </header>
      )}

      <div ref={scrollRef} className="flex-1 min-h-0 space-y-4 overflow-y-auto px-6 py-6">
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
                  {message.content && (
                    <span className="whitespace-pre-wrap break-words leading-relaxed text-sm">{message.content}</span>
                  )}
                  {message.imageUrl && (
                    <img
                      src={message.imageUrl}
                      alt="Attachment"
                      className="mt-2 max-h-56 w-full rounded-2xl object-cover"
                    />
                  )}
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

      <form onSubmit={handleSubmit} className="border-t-1 border-separator">
        <div className="relative items-center flex gap-2">
          {allowAttachments && (
            <>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="grid h-11 w-11 absolute flex-shrink-0 z-30 place-items-center rounded-2xl text-button"
                aria-label="Add attachment"
                disabled={isComposerDisabled}
              >
                <FiPaperclip className="h-6 w-6" />
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

          <div className="flex flex-1 flex-row place-items-center">
            <textarea
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value)
                onTyping?.(friendId)
              }}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              rows={1}
              className={"w-full rounded-2xl resize-none border border-transparent bg-white/10 text-sm text-white outline-none transition focus:border-orange-400/60" + (allowAttachments && " px-10 py-4 pr-16" || " px-4 py-4")}
              disabled={isComposerDisabled}
            />
            <button
              type="submit"
              className=" grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-r from-orange-500 to-orange-400 text-white  transition hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300 disabled:opacity-60 disabled:hover:scale-100"
              disabled={isComposerDisabled || (!draft.trim() && !attachment)}
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
