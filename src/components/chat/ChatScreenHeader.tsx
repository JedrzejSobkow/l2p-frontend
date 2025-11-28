import { pfpImage } from '@assets/images'
import type { FC } from 'react'
import { FiMoreVertical } from 'react-icons/fi' // Example icon

type ChatScreenHeaderProps = {
    nickname: string
    avatarUrl: string
    statusInfo: {containerClass: string; label: string, dotClass: string}
}

const ChatScreenHeader: FC<ChatScreenHeaderProps> = ({ 
    nickname, 
    avatarUrl, 
    statusInfo: { containerClass, label: statusText, dotClass } 
}) => (
  <header className="flex h-20 items-center justify-between border-b border-white/10 bg-background-secondary px-6">
    <div className="flex items-center gap-4">
      <img 
        src={avatarUrl || pfpImage} 
        alt={nickname} 
        className="h-12 w-12 rounded-full border border-white/10 object-cover" 
      />
      <div>
        <h2 className="text-lg font-bold text-white">{nickname}</h2>
        {statusText && <p className={"text-sm " + containerClass + " bg-white/0"}>{statusText}</p>}
      </div>
    </div>
  </header>
)

export default ChatScreenHeader