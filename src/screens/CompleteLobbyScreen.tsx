import { useState, useEffect } from 'react'
import { useLobby } from '../components/lobby/LobbyContext'
import { useAuth } from '../components/AuthContext'
import { useNavigate } from 'react-router-dom'

export const CompleteLobbyScreen = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const {
    isLoading,
    currentLobby,
    members,
    messages,
    publicLobbies,
    error,
    createLobby,
    joinLobby,
    leaveLobby,
    updateSettings,
    transferHost,
    kickMember,
    toggleReady,
    sendMessage,
    getMessages,
    getPublicLobbies,
    getLobbyState,
    clearError,
    startGame,
  } = useLobby()

  const [messageInput, setMessageInput] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [isStartingGame, setIsStartingGame] = useState(false)

  useEffect(() => {
    if (currentLobby) {
      getMessages(50)
    }
  }, [currentLobby])

  const handleCreateLobby = () => {
    createLobby(6, false)
  }

  const handleJoinLobby = () => {
    if (joinCode.trim()) {
      joinLobby(joinCode)
      setJoinCode('')
    }
  }

  const handleSendMessage = () => {
    if (messageInput.trim() && currentLobby) {
      sendMessage(messageInput)
      setMessageInput('')
    }
  }

  const handleStartGame = () => {
    startGame('tictactoe')
  }

  const isHost = currentLobby && user && currentLobby.host_id === user.id
  const userMember = currentLobby && members.find(m => m.user_id === user?.id)
  const allMembersReady = members.length > 0 && members.every(m => m.is_ready)
  const canStartGame = isHost && allMembersReady && members.length >= 2

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Lobby Test Screen</h1>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900 border border-red-700 rounded p-4 mb-4">
            <p className="font-semibold">{error.error_code}: {error.message}</p>
            {error.details && <p className="text-sm mt-2">{JSON.stringify(error.details)}</p>}
            <button
              onClick={clearError}
              className="mt-2 px-3 py-1 bg-red-700 hover:bg-red-600 rounded text-sm"
            >
              Dismiss
            </button>
          </div>
        )}

        {isLoading && <p className="text-yellow-400 mb-4">Loading...</p>}

        <div className="grid grid-cols-3 gap-4">
          {/* Left: Lobby Management */}
          <div className="bg-gray-800 rounded p-6">
            <h2 className="text-2xl font-bold mb-4">Lobby Management</h2>

            {!currentLobby ? (
              <div className="space-y-4">
                <button
                  onClick={handleCreateLobby}
                  disabled={isLoading}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 rounded"
                >
                  Create Lobby
                </button>

                <div>
                  <input
                    type="text"
                    value={joinCode}
                    onChange={e => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="Enter lobby code"
                    maxLength={6}
                    className="w-full px-3 py-2 bg-gray-700 rounded text-white mb-2"
                  />
                  <button
                    onClick={handleJoinLobby}
                    disabled={isLoading || !joinCode.trim()}
                    className="w-full px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 rounded"
                  >
                    Join Lobby
                  </button>
                </div>

                <button
                  onClick={getPublicLobbies}
                  disabled={isLoading}
                  className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 rounded"
                >
                  List Public Lobbies
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-gray-700 rounded p-4">
                  <p className="text-sm text-gray-300">Name</p>
                  <p className="text-lg font-semibold">{currentLobby.name}</p>
                </div>

                <div className="bg-gray-700 rounded p-4">
                  <p className="text-sm text-gray-300">Code</p>
                  <p className="text-xl font-mono font-bold">{currentLobby.lobby_code}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-gray-700 rounded p-2">
                    <p className="text-gray-300">Players</p>
                    <p className="font-bold">{currentLobby.current_players}/{currentLobby.max_players}</p>
                  </div>
                  <div className="bg-gray-700 rounded p-2">
                    <p className="text-gray-300">Public</p>
                    <p className="font-bold">{currentLobby.is_public ? 'Yes' : 'No'}</p>
                  </div>
                </div>

                {isHost && (
                  <div className="space-y-2">
                    <button
                      onClick={() => updateSettings(currentLobby.max_players, !currentLobby.is_public)}
                      className="w-full px-3 py-2 bg-orange-600 hover:bg-orange-500 rounded text-sm"
                    >
                      Toggle Public
                    </button>
                  </div>
                )}

                <button
                  onClick={toggleReady}
                  className={`w-full px-4 py-2 rounded ${
                    userMember?.is_ready
                      ? 'bg-green-600 hover:bg-green-500'
                      : 'bg-yellow-600 hover:bg-yellow-500'
                  }`}
                >
                  {userMember?.is_ready ? 'Ready' : 'Not Ready'}
                </button>

                {isHost && (
                  <button
                    onClick={handleStartGame}
                    disabled={!canStartGame || isStartingGame}
                    className={`w-full px-4 py-2 rounded font-bold transition-all ${
                      canStartGame && !isStartingGame
                        ? 'bg-purple-600 hover:bg-purple-500 cursor-pointer'
                        : 'bg-gray-600 cursor-not-allowed opacity-50'
                    }`}
                    title={
                      !isHost
                        ? 'Only host can start'
                        : !allMembersReady
                        ? 'All members must be ready'
                        : members.length < 2
                        ? 'Need at least 2 players'
                        : 'Start game'
                    }
                  >
                    {isStartingGame ? 'Starting...' : 'Start Game'}
                  </button>
                )}

                <button
                  onClick={leaveLobby}
                  disabled={isLoading}
                  className="w-full px-4 py-2 bg-red-600 hover:bg-red-500 disabled:bg-gray-600 rounded"
                >
                  Leave Lobby
                </button>
              </div>
            )}
          </div>

          {/* Middle: Members List */}
          <div className="bg-gray-800 rounded p-6">
            <h2 className="text-2xl font-bold mb-4">Members ({members.length})</h2>
            <div className="space-y-2">
              {members.map(member => (
                <div key={member.user_id} className="bg-gray-700 rounded p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{member.nickname}</p>
                      <p className="text-xs text-gray-400">ID: {member.user_id}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {member.is_ready && (
                        <span className="px-2 py-1 bg-green-600 rounded text-xs">Ready</span>
                      )}
                      {isHost && member.user_id !== user?.id && (
                        <button
                          onClick={() => kickMember(member.user_id)}
                          className="px-2 py-1 bg-red-600 hover:bg-red-500 rounded text-xs"
                        >
                          Kick
                        </button>
                      )}
                      {isHost &&
                        currentLobby &&
                        member.user_id !== currentLobby.host_id &&
                        member.user_id !== user?.id && (
                          <button
                            onClick={() => transferHost(member.user_id)}
                            className="px-2 py-1 bg-blue-600 hover:bg-blue-500 rounded text-xs"
                          >
                            Host
                          </button>
                        )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Chat */}
          <div className="bg-gray-800 rounded p-6 flex flex-col">
            <h2 className="text-2xl font-bold mb-4">Chat</h2>

            {currentLobby ? (
              <>
                <div className="flex-1 overflow-y-auto bg-gray-700 rounded p-4 mb-4 max-h-96">
                  {messages.length === 0 ? (
                    <p className="text-gray-400 text-sm">No messages yet</p>
                  ) : (
                    messages.map((msg, idx) => (
                      <div key={idx} className="mb-2 pb-2 border-b border-gray-600 last:border-b-0">
                        <p className="text-sm">
                          <span className="font-semibold text-blue-400">{msg.nickname}</span>
                          <span className="text-gray-400 text-xs ml-2">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </span>
                        </p>
                        <p className="text-sm text-gray-200">{msg.content}</p>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={e => setMessageInput(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type message..."
                    className="flex-1 px-3 py-2 bg-gray-700 rounded text-white"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 rounded"
                  >
                    Send
                  </button>
                </div>
              </>
            ) : (
              <p className="text-gray-400">Join or create a lobby to chat</p>
            )}
          </div>
        </div>

        {/* Public Lobbies List */}
        {publicLobbies.length > 0 && !currentLobby && (
          <div className="mt-6 bg-gray-800 rounded p-6">
            <h2 className="text-2xl font-bold mb-4">Available Public Lobbies</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {publicLobbies.map(lobby => (
                <div key={lobby.lobby_code} className="bg-gray-700 rounded p-4">
                  <p className="text-xl font-mono font-bold mb-2">{lobby.lobby_code}</p>
                  <p className="text-sm mb-2">
                    {lobby.current_players}/{lobby.max_players} Players
                  </p>
                  <button
                    onClick={() => {
                      setJoinCode(lobby.lobby_code)
                      joinLobby(lobby.lobby_code)
                    }}
                    className="w-full px-3 py-2 bg-green-600 hover:bg-green-500 rounded text-sm"
                  >
                    Join
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
