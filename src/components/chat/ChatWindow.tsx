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
import Lightbox from '../Lightbox'
import { usePopup } from '../PopupContext'
import type { ChatMessage, ConversationTarget } from './ChatProvider'
import { useAuth } from '../AuthContext'

import { pfpImage } from '@assets/images'


export interface ChatWindowProps {
  friendData: ConversationTarget
  messages: ChatMessage[]
  isTyping: boolean
  isLoadingMessages?: boolean
  onSend: (payload: { text: string; attachment?: File }) => Promise<void> | void
  onTyping?: (friend_user_id: string) => void
  onLoadMore: () => void
  className?: string
}

const cn = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ')

const formatTime = (timestamp: ChatMessage['createdAt']) => {
  try {
    const date = new Date(timestamp)
    return new Intl.DateTimeFormat('en', {
      day: 'numeric',
      month: 'short',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  } catch {
    return ''
  }
}

const isSameMinute = (a: ChatMessage['createdAt'], b: ChatMessage['createdAt']) => {
  try {
    const first = new Date(a)
    const second = new Date(b)
    return (
      first.getFullYear() === second.getFullYear() &&
      first.getMonth() === second.getMonth() &&
      first.getDate() === second.getDate() &&
      first.getHours() === second.getHours() &&
      first.getMinutes() === second.getMinutes()
    )
  } catch {
    return false
  }
}

const ChatWindow: FC<ChatWindowProps> = ({
  friendData,
  messages,
  className,
  isTyping,
  isLoadingMessages = false,
  onSend,
  onTyping,
  onLoadMore
}) => {
  const { showPopup} = usePopup()
  const {user} = useAuth()
  const [draft, setDraft] = useState('')
  const [attachment, setAttachment] = useState<File>()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [sending, setSending] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const lastMessageIdRef = useRef<string | null>(null)
  const pendingFriendScrollRef = useRef<boolean>(true)
  const loadingMoreRef = useRef<boolean>(false)
  const prevScrollHeightRef = useRef<number>(0)
  const prevScrollTopRef = useRef<number>(0)
  const [loadingMore, setLoadingMore] = useState(false)
  const [initialLoaderVisible, setInitialLoaderVisible] = useState(false)
  const [loadMoreVisible, setLoadMoreVisible] = useState(false)
  const initialLoaderStartRef = useRef<number | null>(null)
  const loadMoreStartRef = useRef<number | null>(null)
  const initialLoaderTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const loadMoreTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const MIN_LOADER_MS = 500

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return
    if (pendingFriendScrollRef.current) {
      lastMessageIdRef.current = null
    }
    if (isLoadingMessages) {
      return
    }

    const lastMessageId = messages[messages.length - 1]?.id ?? null
    const hasNewTailMessage =
      lastMessageId !== null && lastMessageId !== lastMessageIdRef.current

    if (pendingFriendScrollRef.current) {
      pendingFriendScrollRef.current = false
      requestAnimationFrame(() => {
        container.scrollTo({ top: container.scrollHeight, behavior: 'auto' })
      })
    } else if (loadingMoreRef.current) {
      const delta = container.scrollHeight - prevScrollHeightRef.current
      container.scrollTop = prevScrollTopRef.current + delta
      loadingMoreRef.current = false
      setLoadingMore(false)
    } else if (hasNewTailMessage) {
      requestAnimationFrame(() => {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth',
        })
      })
    }

    lastMessageIdRef.current = lastMessageId
  }, [messages, isLoadingMessages])

  useEffect(() => {
    pendingFriendScrollRef.current = true
  }, [friendData.id])

  useEffect(() => {
    if (isLoadingMessages && messages.length === 0) {
      initialLoaderStartRef.current = performance.now()
      setInitialLoaderVisible(true)
      if (initialLoaderTimeoutRef.current) {
        clearTimeout(initialLoaderTimeoutRef.current)
        initialLoaderTimeoutRef.current = null
      }
      return
    }
    if (!initialLoaderVisible) return
    const started = initialLoaderStartRef.current ?? performance.now()
    const elapsed = performance.now() - started
    const delay = Math.max(0, MIN_LOADER_MS - elapsed)
    initialLoaderTimeoutRef.current = setTimeout(() => {
      setInitialLoaderVisible(false)
      initialLoaderTimeoutRef.current = null
      initialLoaderStartRef.current = null
    }, delay)
  }, [isLoadingMessages, messages.length, initialLoaderVisible])

  useEffect(() => {
    if (loadingMore) {
      loadMoreStartRef.current = performance.now()
      setLoadMoreVisible(true)
      if (loadMoreTimeoutRef.current) {
        clearTimeout(loadMoreTimeoutRef.current)
        loadMoreTimeoutRef.current = null
      }
      return
    }
    if (!loadMoreVisible) return
    const started = loadMoreStartRef.current ?? performance.now()
    const elapsed = performance.now() - started
    const delay = Math.max(0, MIN_LOADER_MS - elapsed)
    loadMoreTimeoutRef.current = setTimeout(() => {
      setLoadMoreVisible(false)
      loadMoreTimeoutRef.current = null
      loadMoreStartRef.current = null
    }, delay)
  }, [loadingMore, loadMoreVisible])

  useEffect(() => {
    return () => {
      if (initialLoaderTimeoutRef.current) clearTimeout(initialLoaderTimeoutRef.current)
      if (loadMoreTimeoutRef.current) clearTimeout(loadMoreTimeoutRef.current)
    }
  }, [])

  const isComposerDisabled = sending

  const displayedTyping = useMemo(() => {
    if (isTyping) {
      return `${friendData.nickname} is typing...`
    }
  }, [isTyping])

  const handleSend = async () => {
    if (!draft.trim() && !attachment) {
      return
    }
    try {
      setSending(true)
      await onSend({ text: draft.trim(), attachment })
      setDraft('')
      setAttachment(undefined)
      fileInputRef.current?.form?.reset()
    } 
    catch (error: any) {
      if(error.message === 'Invalid image type'){
        showPopup({type: 'error', message: 'Provide a valid image type'})
      }
      else {
        showPopup({type: 'error', message: 'Failed to send message'})
      }
    }
    finally {
      setSending(false)
    }
  }

  const handleScroll = () => {
    const el = scrollRef.current
    if(!el || !onLoadMore) return
    if (el.scrollTop <= 50) {
      loadingMoreRef.current = true
      setLoadingMore(true)
      prevScrollHeightRef.current = el.scrollHeight
      prevScrollTopRef.current = el.scrollTop
      onLoadMore()
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
      setAttachment(undefined)
    }
  }

  const removeAttachment = () => {
    setAttachment(undefined)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div
      className={cn(
        'flex flex-1 h-full min-h-0 w-full flex-col overflow-visible rounded-2xl border border-separator bg-background-secondary',
        className
      )}
    >
      {friendData.nickname && (
        <header className="border-b border-separator flex flex-row gap-5 px-3 py-2">
          <img
            className='w-12 h-12 rounded-full'
            src={friendData.avatarUrl || pfpImage}></img>
          <h2 className="text-s font-semibold text-headline">{friendData.nickname}</h2>
          
        </header>
      )}

      <div
        className="relative flex-1 min-h-0 space-y-4 overflow-y-auto px-6 py-6 scrollbar-default"
        ref={scrollRef}
        onScroll={handleScroll}
      >
        {initialLoaderVisible && messages.length === 0 && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background-secondary/60 backdrop-blur-sm">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white/80">
              <span className="h-2 w-2 animate-ping rounded-full bg-orange-300" />
              Loading messages...
            </div>
          </div>
        )}
        {loadMoreVisible && (
          <div className="flex justify-center text-xs text-white/60">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
              <span className="h-2 w-2 animate-bounce rounded-full bg-white/80" />
              Loading previous messages...
            </div>
          </div>
        )}
        {messages.map((message,index) => {
          const isOwn = message.isMine
          const next = index > 0 ? messages[index + 1] : undefined
          const showTimestamp = !next || next.isMine !== message.isMine || !isSameMinute(message.createdAt, next.createdAt)
          return (
            <div key={message.id} className={cn('flex items-end gap-3', isOwn ? 'justify-end' : 'justify-start')}>
              {!isOwn && (
                <img
                  src={friendData.avatarUrl || pfpImage}
                  alt={message.senderNickname}
                  className="h-10 w-10 flex-shrink-0 rounded-full border border-white/10 object-cover"
                />
              )}
              <div className={cn('flex max-w-[75%] flex-col gap-1', isOwn ? 'items-end text-right' : 'items-start text-left')}>
                <div
                  className={cn(
                    'inline-flex max-w-full flex-col gap-2 rounded-2xl px-4 py-3 text-sm text-white shadow-[0_10px_25px_rgba(0,0,0,0.25)]',
                    isOwn ? 'bg-gradient-to-r bg-button text-white' : 'bg-[rgba(35,34,49,0.95)]'
                  )}
                >
                  {/* {!isOwn && <span className="text-xs font-semibold text-white/70">{message.senderNickname}</span>} */}
                  {message.content && (
                    <span className="whitespace-pre-wrap break-words leading-relaxed text-sm text-white">{message.content}</span>
                  )}
                  {message.imageUrl && (
                    <img
                      src={message.imageUrl}
                      onClick={() => setSelectedImage(message.imageUrl || null)}
                      alt="Attachment"
                      className="max-h-56 w-full rounded-2xl object-cover"
                    />
                  )}
                </div>
                {showTimestamp && <span className="block text-xs font-medium text-white/40">{formatTime(message.createdAt)}</span>}
              </div>
              {/* {isOwn && (
                <img
                  src={user?.pfp_path || pfpImage}
                  alt="You"
                  className="h-10 w-10 flex-shrink-0 rounded-full border border-transparent object-cover ring-2 ring-orange-400/40"
                />
              )} */}
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

      <form onSubmit={handleSubmit} className="bg-background-secondary/70 px-2 py-1">
        <div className="flex items-end gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 shadow-[0_10px_30px_rgba(0,0,0,0.2)] focus-within:border-orange-400/60">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleAttachment}
            aria-hidden="true"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl text-white/70 transition hover:bg-white/10 disabled:opacity-50"
            aria-label="Add attachment"
            disabled={isComposerDisabled}
          >
            <FiPaperclip className="h-5 w-5" />
          </button>
          <textarea
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value)
              onTyping?.(friendData.id)
            }}
            onKeyDown={handleKeyDown}
            placeholder={`Write to ${friendData.nickname}...`}
            rows={1}
            className="w-full resize-none bg-transparent text-sm text-white outline-none placeholder:text-white/40 focus:outline-none"
            disabled={isComposerDisabled}
          />
          <button
            type="submit"
            className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl bg-gradient-to-r from-orange-500 to-orange-400 text-white transition hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300 disabled:scale-100 disabled:opacity-60"
            disabled={isComposerDisabled || (!draft.trim() && !attachment)}
            aria-label="Send message"
          >
            <FiSend className="h-5 w-5" />
          </button>
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
      <Lightbox
        isOpen={selectedImage !== null}
        onClose={() => setSelectedImage(null)}
        imageUrl={selectedImage || ''}
      >
      </Lightbox>
    </div>
  )
}

export default ChatWindow
