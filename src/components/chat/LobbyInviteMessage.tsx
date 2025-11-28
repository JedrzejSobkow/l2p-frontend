import { type FC } from 'react'
import { FiPlay, FiUsers } from 'react-icons/fi'
import type { ChatMessage } from './ChatProvider'

type LobbyInviteMessageProps = {
  message: ChatMessage
  onJoin: (lobbyCode: string) => void
}

const LobbyInviteMessage: FC<LobbyInviteMessageProps> = ({ message, onJoin }) => {
  const { metadata } = message
  if (!metadata || !metadata.lobbyCode) return null

  const isFull = (metadata.currentPlayers ?? 0) >= (metadata.maxPlayers ?? 0)

  return (
    <div className="flex flex-col items-start gap-1">
      {/* Sender Name (Optional, depends on your layout) */}
      {!message.isMine && (
        <span className="ml-2 text-[10px] font-bold uppercase text-white/50">
          {message.senderNickname}
        </span>
      )}

      {/* The Invite Card */}
      <div className="w-64 overflow-hidden rounded-2xl border border-orange-500/30 bg-gradient-to-br from-[rgba(40,30,20,0.95)] to-[rgba(25,20,15,0.95)] shadow-lg">
        {/* Header Strip */}
        <div className="flex items-center justify-between border-b border-orange-500/20 bg-orange-500/10 px-4 py-2">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
            Game Invite
          </span>
          <FiPlay className="h-3 w-3 text-orange-400" />
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="mb-1 text-base font-bold text-white">
            {metadata.gameName || 'Unknown Game'}
          </h3>
          <p className="mb-3 text-xs text-white/60">
            {metadata.lobbyName || 'Custom Lobby'}
          </p>
          
          <div className="mb-4 flex items-center gap-2 text-xs text-white/50">
            <FiUsers className="h-3 w-3" />
            <span>
              {metadata.currentPlayers} / {metadata.maxPlayers} Players
            </span>
          </div>

          <button
            onClick={() => onJoin(metadata.lobbyCode!)}
            disabled={isFull}
            className={`
              flex w-full items-center justify-center gap-2 rounded-xl py-2 text-sm font-bold transition-all
              ${
                isFull
                  ? 'bg-white/5 text-white/30 cursor-not-allowed'
                  : 'bg-orange-500 text-white hover:bg-orange-400 hover:shadow-[0_0_15px_rgba(249,115,22,0.4)]'
              }
            `}
          >
            {isFull ? 'Lobby Full' : 'Join Lobby'}
          </button>
        </div>
      </div>
      
      {/* Time */}
      <span className="ml-2 text-[10px] text-white/30">
        {new Date(message.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
      </span>
    </div>
  )
}

export default LobbyInviteMessage