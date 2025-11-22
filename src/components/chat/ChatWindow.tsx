import {
  useEffect,
  useLayoutEffect,
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
  hasMore: boolean
  onSend: (payload: { text: string; attachment?: File }) => Promise<void> | void
  onTyping?: (friend_user_id: string) => void
  onLoadMore: () => Promise<void>
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
  hasMore,
  onSend,
  onTyping,
  onLoadMore
}) => {
  const { showPopup} = usePopup()
  const {user} = useAuth()
  const [draft, setDraft] = useState('')
  const [attachment, setAttachment] = useState<File>()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [sending, setSending] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const isLoadingMoreRef = useRef(false)
  const prevScrollHeightRef = useRef(0)
  const prevScrollTopRef = useRef(0)
  const prevMsgLenRef = useRef(0)
  const prevConversationIdRef = useRef<string | null>(null)
  const isAtBottomRef = useRef(true)
  const [showTopLoader, setShowTopLoader] = useState(false)

useEffect(() => {
  if (!isLoadingMore) {
    setShowTopLoader(false)
    return
  }

  const t = setTimeout(() => {
    if (isLoadingMoreRef.current) {
      setShowTopLoader(true)
    }
  }, 200)

  return () => clearTimeout(t)
}, [isLoadingMore])

  useEffect(() => {
  isLoadingMoreRef.current = isLoadingMore
}, [isLoadingMore])

  useLayoutEffect(() => {
  const el = scrollRef.current
  if (!el) return

  const prevConv = prevConversationIdRef.current
  const prevLen = prevMsgLenRef.current
  const newLen = messages.length

  const isNewConversation = prevConv !== friendData.id
  const firstLoadForThisConv = prevLen === 0 && newLen > 0
  const hasMoreMessages = newLen > prevLen

  if (isNewConversation || firstLoadForThisConv) {
    el.scrollTop = el.scrollHeight

    prevScrollHeightRef.current = 0
    prevScrollTopRef.current = 0
  } else if (prevScrollHeightRef.current && hasMoreMessages) {
    const newScrollHeight = el.scrollHeight
    const diff = newScrollHeight - prevScrollHeightRef.current
    el.scrollTop = prevScrollTopRef.current + diff

    prevScrollHeightRef.current = 0
    prevScrollTopRef.current = 0
  }
  else if (hasMoreMessages && isAtBottomRef.current){
    el.scrollTop = el.scrollHeight
  }

  prevConversationIdRef.current = friendData.id
  prevMsgLenRef.current = newLen
}, [friendData.id, messages.length])


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
    if (!onLoadMore || !hasMore) return
    const el = scrollRef.current
    if (!el || isLoadingMoreRef.current) return

    const distanceFromBottom = el.scrollHeight - (el.scrollTop + el.clientHeight)
    isAtBottomRef.current = distanceFromBottom < 500

    if (el.scrollTop <= 100) {
      prevScrollHeightRef.current = el.scrollHeight
      prevScrollTopRef.current = el.scrollTop
      setIsLoadingMore(true)
      isLoadingMoreRef.current = true

      const maybePromise = onLoadMore()
      if (maybePromise && typeof (maybePromise as any).then === 'function') {
        ;(maybePromise as Promise<void>).finally(() => {
          setIsLoadingMore(false)
          isLoadingMoreRef.current = false
        })
      } else {
        setIsLoadingMore(false)
        isLoadingMoreRef.current = false
      }
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
        {showTopLoader && hasMore && (
          <div className="flex justify-center mb-2 text-xs text-white/60">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1">
              <span className="h-2 w-2 animate-spin rounded-full border border-white/50 border-t-transparent" />
              Loading messages...
            </span>
          </div>
        )}
        {!hasMore && messages.length > 0 && (
          <div className="flex justify-center mb-2 text-[11px] uppercase tracking-wide text-white/40">
            No more messages
          </div>
        )}
        {messages.map((message,index) => {
          const isOwn = message.isMine
          const next = index > 0 ? messages[index + 1] : undefined
          const showTimestamp = !next || next.isMine !== message.isMine || !isSameMinute(message.createdAt, next.createdAt)
          // const showAvatar = !next || (next.isMine === false && message.isMine === false)
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
