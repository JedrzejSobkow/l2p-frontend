import { useState, useEffect, useRef } from 'react'
import { useLobby } from '../components/lobby/LobbyContext'
import { useAuth } from '../components/AuthContext'
import { useNavigate, useParams } from 'react-router-dom'
import InLobbyUserTile from '../components/InLobbyUserTile'
import InviteToLobbyUserTile from '../components/InviteToLobbyUserTile'
import Setting from '../components/Setting'
import LobbyChat from '../components/LobbyChat'
import GameInfoModal from '../components/GameInfoModal'
import CatalogueModal from '../components/CatalogueModal'
import PassHostModal from '../components/PassHostModal'
import LeaveModal from '../components/LeaveModal'
import InviteFriendsModal from '../components/InviteFriendsModal'
import EditLobbyNameModal from '../components/EditLobbyNameModal'
import { usePopup } from '../components/PopupContext';
import { useGameSettings } from '../hooks/useGameSettings'
import { emitUpdateGameRules, onLobbyError, offLobbyError, onLobbyJoined, offLobbyJoined, emitToggleReady, getLobbySocket } from '../services/lobby'
import { FaSignOutAlt, FaRegEdit } from 'react-icons/fa'
import { AiOutlineInfoCircle } from 'react-icons/ai'
import { LuUsers } from 'react-icons/lu'
import { FiLock } from 'react-icons/fi'
import { sendMessage as sendPrivateMessage } from '../services/chat'
import { emitCreateGame, emitGetGameState } from '../services/game'
import { getImage } from '../utils/imageMap';
import { diceIcon } from '@assets/icons';
import { pfpImage, noGameImage } from '@assets/images';


export const LobbyScreen = () => {
  const { lobbyCode } = useParams<{ lobbyCode?: string }>()
  const { user } = useAuth()
  const { showPopup } = usePopup()
  const navigate = useNavigate()
  const {
    currentLobby,
    members,
    messages,
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
    startGame,
    clearError,
    availableGames,
    getAvailableGames,
    selectGame,
    clearGameSelection,
    sendInvite
  } = useLobby()

  // Redirect user to home if they are not in a lobby
  useEffect(() => {
    const lobbySocket = getLobbySocket();
    if (!lobbySocket || !lobbySocket.connected) {
        return;
    }

    const delayCheck = setTimeout(() => {
        if (!currentLobby) {
            navigate('/', { state: { message: 'You are not in a lobby.', type: 'error' } });
        }
    }, 100);

    return () => clearTimeout(delayCheck); // Cleanup timeout on unmount or dependency change
}, [currentLobby, navigate])

  const [messageInput, setMessageInput] = useState('')
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const typingTimeoutRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map())
  
  const [selectedPlayerCount, setSelectedPlayerCount] = useState(6)
  const [isPublic, setIsPublic] = useState(false)
  const [currentGameRules, setCurrentGameRules] = useState<Record<string, any>>({})
  const myUsername = user?.nickname || 'Unknown'

  // Modal states
  const [isShowingGameInfo, setIsShowingGameInfo] = useState(false)
  const [isShowingCatalogue, setIsShowingCatalogue] = useState(false)
  const [isPassHostModalOpen, setIsPassHostModalOpen] = useState(false)
  const [passHostUsername, setPassHostUsername] = useState('')
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false)
  const [isInviteFriendsModalOpen, setIsInviteFriendsModalOpen] = useState(false)
  const [isEditLobbyNameModalOpen, setIsEditLobbyNameModalOpen] = useState(false)

  // Get dynamic game settings
  const selectedGameFullInfo = availableGames.find(g => g.game_name === currentLobby?.selected_game)
  const dynamicGameSettings = useGameSettings({
    supported_rules: selectedGameFullInfo?.supported_rules,
    current_rules: currentGameRules,
  })

  useEffect(() => {
    emitGetGameState();

    if (currentLobby) {
      getMessages(50)
      setSelectedPlayerCount(currentLobby.max_players)
      setIsPublic(currentLobby.is_public)
      getAvailableGames()
    }
  }, [currentLobby, getMessages, getAvailableGames])

  // Update game rules when lobby state changes
  useEffect(() => {
    if (currentLobby?.game_rules) {
      setCurrentGameRules(currentLobby.game_rules)
    }
  }, [currentLobby?.game_rules])

  useEffect(() => {
    if (error?.error_code === 'KICKED') {
      clearError()
      navigate('/', { state: { message: 'You have been kicked from the lobby', type: 'error' } })
    } else if (error?.error_code === 'BAD_REQUEST' && error.message === 'Lobby is full') {
      clearError()
      showPopup({ type: 'error', message: error.message })
    } else if (error?.error_code === 'BAD_REQUEST' && error.message === 'You are already in another lobby') {
      clearError()
      showPopup({ type: 'error', message: error.message })
    } else if (error?.error_code === 'NOT_FOUND') {
      clearError()
      showPopup({ type: 'error', message: 'Lobby not found' })
    } else if (error) {
      showPopup({ type: 'error', message: error.message || 'An error occurred' })
      const timer = setTimeout(() => {
        clearError()
      }, 3500)
      return () => clearTimeout(timer)
    }
  }, [error, navigate, clearError, showPopup])

  // Auto-join or redirect based on lobby status
  useEffect(() => {
    if (!lobbyCode) return

    if (currentLobby) {
      if (currentLobby.lobby_code === lobbyCode) {
        // User is already in the requested lobby
        navigate('/lobby')
      } else {
        // User is in a different lobby
        navigate('/lobby', {
          state: { message: 'You are already a member of another lobby.', type: 'info' },
        })
      }
      return
    }

    // Normalize lobby code: remove dashes if present
    const normalizedCode = lobbyCode.replace(/-/g, '').toUpperCase()

    // Validate format: should be 6 alphanumeric characters
    if (!/^[A-Z0-9]{6}$/.test(normalizedCode)) {
      navigate('/', { state: { message: 'Invalid lobby code format.', type: 'error' } })
      return
    }

    // Attempt to join the lobby
    joinLobby(normalizedCode)

    // Listen for errors or success
    const handleLobbyError = (error: { error_code: string; message: string }) => {
      if (error.error_code === 'BAD_REQUEST' && error.message === 'You are already in another lobby') {
        navigate('/lobby', {
          state: { message: 'You are already a member of another lobby.', type: 'info' },
        })
      } 
      else {
        navigate('/', { state: { message: error.message || 'Failed to join the lobby.', type: 'error' } })
      }
    }

    const handleLobbyJoined = () => {
      navigate('/lobby')
    }

    onLobbyError(handleLobbyError)
    onLobbyJoined(handleLobbyJoined)

    return () => {
      offLobbyError(handleLobbyError)
      offLobbyJoined(handleLobbyJoined)
    }
  }, [lobbyCode, currentLobby, joinLobby, navigate])

  const handleSendMessage = (message: string) => {
    if (message.trim() && currentLobby) {
      sendMessage(message)
    }
  }

  const handleTyping = () => {
    // Placeholder for typing indicator integration
  }

  const handlePassHostClick = (username: string) => {
    setPassHostUsername(username)
    setIsPassHostModalOpen(true)
  }

  const handlePassHost = (username: string) => {
    const targetMember = members.find(m => m.nickname === username)
    if (targetMember) {
      transferHost(targetMember.identifier)
    }
  }

  const handleKickOut = (username: string) => {
    const targetMember = members.find(m => m.nickname === username)
    if (targetMember) {
      kickMember(targetMember.identifier)
    }
  }

  const handleUpdatePlayerCount = (newPlayerCount: number) => {
    if (currentLobby) {
      updateSettings(newPlayerCount, isPublic)
      setSelectedPlayerCount(newPlayerCount)
    }
  }

  const handleUpdateVisibility = (newVisibility: string) => {
    if (currentLobby) {
      const isPublicValue = newVisibility === 'Public'
      updateSettings(selectedPlayerCount, isPublicValue)
      setIsPublic(isPublicValue)
    }
  }

  const handleConfirmLeave = () => {
    leaveLobby()
    // navigate('/')
  }

  const handleSelectGame = (gameName: string) => {
    selectGame(gameName)
    showPopup({ type: 'confirmation', message: `Game "${gameName}" selected.` });
    setIsShowingCatalogue(false)
  }

  const handleClearGameSelection = () => {
    clearGameSelection()
    showPopup({ type: 'confirmation', message: 'Game selection cleared.' });
    setIsShowingCatalogue(false)
  }

  const handleGameRuleChange = (key: string, value: string) => {
    // Convert value to appropriate type based on the rule definition
    const setting = dynamicGameSettings.find(s => s.key === key)
    let convertedValue: any = value

    // Parse value to appropriate type
    if (setting?.type === 'integer') {
      convertedValue = parseInt(value, 10)
    } else if (setting?.type === 'string') {
      convertedValue = value
    }

    setCurrentGameRules(prev => ({
      ...prev,
      [key]: convertedValue,
    }))

    // Emit update to backend
    if (currentLobby && isUserHost) {
      emitUpdateGameRules(currentLobby.lobby_code, {
        ...currentGameRules,
        [key]: convertedValue
      })
    }
  }

  const handleUpdateLobbyName = (newName: string) => {
    if (currentLobby) {
      updateSettings(selectedPlayerCount, isPublic, newName)
      setIsEditLobbyNameModalOpen(false)
      showPopup({ type: 'confirmation', message: 'Lobby name updated successfully.' });
    }
  }

  const handleStartGame = () => {
    if (currentLobby?.selected_game) {
      emitCreateGame(currentLobby.selected_game, currentGameRules)
      showPopup({ type: 'confirmation', message: 'Game started successfully.' });
    }
  }

  const isUserHost = !!(currentLobby && members.some(u => u.nickname === myUsername && u.identifier === currentLobby.host_identifier))
  const userMember = members.find(m => m.identifier === user?.id)
  const isReady = userMember?.is_ready || false
  const allMembersReady = members.length > 0 && members.every(m => m.is_ready)
  const currentPlayerCount = members.length
  const canStartGame = isUserHost && allMembersReady && currentPlayerCount === selectedPlayerCount && !!currentLobby?.selected_game

  const disabledPlayerCounts = ['2', '4', '6'].filter(
    value => parseInt(value) < currentPlayerCount
  )

  const users = members.map((member, index) => ({
    avatar: getImage('avatars', 'avatar' + member.pfp_path?.split('/').pop()?.split('.')[0]) || pfpImage,
    username: member.nickname,
    place: index + 1,
    isReady: member.is_ready || false,
    isHost: currentLobby?.host_identifier === member.identifier,
  }))


  const gameInfo = currentLobby?.selected_game_info ? {
    display_name: currentLobby.selected_game_info.display_name,
    name: currentLobby.selected_game_info.game_name,
    img_path: getImage('games', currentLobby.selected_game || 'noGame') || noGameImage,
    rules: currentLobby.selected_game_info.description,
  } : {
    display_name: 'Game not selected',
    name: undefined,
    img_path: '',
    rules: 'Select a game to start playing',
  }

  // Find full game info from available games for the modal
  const gameModalInfo = selectedGameFullInfo ? {
    name: selectedGameFullInfo.display_name,
    rules: selectedGameFullInfo.description || selectedGameFullInfo.game_rules || 'No description available'
  } : {
    name: gameInfo.name,
    rules: gameInfo.rules
  }

  const mockGames = availableGames.length > 0 ? availableGames.map((game: any) => {
    // Generate supported players array from min_players to max_players
    const minPlayers = game.min_players || 1
    const maxPlayers = game.max_players || 6
    const supportedPlayers = Array.from(
      { length: maxPlayers - minPlayers + 1 },
      (_, i) => minPlayers + i
    )

    return {
      gameDisplayName: game.display_name,
      gameName: game.game_name,
      src: game.game_image_path,
      supportedPlayers,
    }
  }) : []

  const lobbySettings = [
    {
      label: 'Visibility',
      icon: <FiLock size={20} />,
      availableValues: ['Private', 'Public'],
      defaultValue: 'Private',
    },
  ]

  const gameSettings = [
    {
      label: 'Players',
      icon: <LuUsers size={20} />,
      availableValues: currentLobby?.selected_game 
        ? (() => {
            const selectedGameData = availableGames.find(g => g.game_name === currentLobby?.selected_game)
            if (selectedGameData) {
              const minPlayers = selectedGameData.min_players || 2
              const maxPlayers = selectedGameData.max_players || 6
              const values = []
              for (let i = minPlayers; i <= maxPlayers; i++) {
                values.push(String(i))
              }
              return values
            }
            return ['2', '4', '6']
          })()
        : ['2', '3', '4', '5', '6'],
      defaultValue: '6',
    },
  ]

  if (!currentLobby) {
    return (
        <main className="flex items-center justify-center min-h-screen bg-background-primary">
          <div className="text-red-500 text-xl">
            {lobbyCode ? 'Joining lobby...' : 'You are not in any lobby.'}
          </div>
        </main>
      )
  }

  return (
    <main className="flex flex-col bg-background-primary min-h-screen">
      {/* Top Bar with Leave Button */}
      <div className="flex justify-start px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <button
          onClick={() => setIsLeaveModalOpen(true)}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-600 text-white font-bold text-sm sm:text-base rounded-lg hover:bg-red-700 hover:scale-105 transition-transform focus:outline-none"
        >
          <FaSignOutAlt size={20} />
          <span className="hidden sm:inline">Leave</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8 flex-1 overflow-auto">
        {/* First Column: Players and Chat */}
        <div className="flex flex-col items-center gap-3 sm:gap-4">
          {/* Lobby Header */}
          <div className="w-full flex items-center justify-between p-3 sm:p-4 bg-background-secondary rounded-lg shadow-md">
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-bold text-white truncate">
                {currentLobby.name}
              </span>
              <button 
                disabled={!isUserHost}
                onClick={() => setIsEditLobbyNameModalOpen(true)}
                className="focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform flex-shrink-0"
              >
                <FaRegEdit className="text-highlight" size={20} />
              </button>
            </div>
            <span className="text-sm sm:text-base font-mono text-gray-600 bg-background-primary/40 px-2 sm:px-3 py-1 rounded flex-shrink-0">
              {currentLobby.lobby_code.substring(0, 3)}-{currentLobby.lobby_code.substring(3, 6)}
            </span>
          </div>

          {/* Players Grid */}
          <div className="w-full grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4 p-3 sm:p-4 bg-background-secondary rounded-lg shadow-md">
            {users.map((user, index) => (
              <InLobbyUserTile
                key={index}
                avatar={user.avatar}
                username={user.username}
                place={user.place}
                isReady={user.isReady}
                isHost={user.isHost}
                isYou={myUsername === user.username}
                displayPassHost={!!isUserHost && myUsername !== user.username}
                displayKickOut={!!isUserHost && myUsername !== user.username}
                onPassHost={() => handlePassHostClick(user.username)}
                onKickOut={() => handleKickOut(user.username)}
              />
            ))}
            {/* Empty Seats */}
            {Array.from({ length: 6 - currentPlayerCount }).map((_, index) => (
              <InviteToLobbyUserTile 
                key={`empty-${index}`} 
                enabled={index < selectedPlayerCount - currentPlayerCount}
                onInviteClick={() => setIsInviteFriendsModalOpen(true)} 
              />
            ))}
          </div>

          {/* Action Buttons - Mobile */}
          <div className="w-full lg:hidden p-3 sm:p-4 rounded-lg shadow-md flex flex-col items-center justify-center gap-3">
            <button
              onClick={toggleReady}
              className={`w-full px-4 py-3 text-white font-bold text-base rounded-lg focus:outline-none ${
                !isReady ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              {!isReady ? 'Ready' : 'Not Ready'}
            </button>

            {isUserHost && (
              <button 
                disabled={!canStartGame} 
                onClick={handleStartGame}
                className="w-full px-4 py-3 bg-blue-500 text-white font-bold text-base rounded-lg hover:bg-blue-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-500"
              >
                Start
              </button>
            )}
          </div>

          {/* Chat Section */}
          <div className="w-full bg-background-secondary rounded-lg shadow-md p-3 sm:p-4">
            <h3 className="text-base sm:text-lg font-bold text-white mb-2">Chat</h3>
            <LobbyChat 
              messages={messages.map(m => ({ username: m.nickname, text: m.content }))} 
              onSendMessage={handleSendMessage}
              onTyping={handleTyping}
              typingUsers={typingUsers}
            />
          </div>
        </div>

        {/* Second Column: Game Info */}
        <div className="flex flex-col gap-3 sm:gap-4">
          {/* Game Header */}
          <div className="w-full flex items-center justify-between gap-2 p-3 sm:p-4 bg-background-secondary rounded-lg shadow-md">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              {currentLobby?.selected_game && (
                <img
                  src={gameInfo.img_path}
                  alt={`${gameInfo.display_name} image`}
                  className="h-5 sm:h-7 w-auto flex-shrink-0"
                />
              )}
              <span className={`text-sm sm:text-lg font-bold truncate ${
                currentLobby?.selected_game 
                  ? 'text-white' 
                  : 'text-gray-400'
              }`}>
                {gameInfo.display_name}
              </span>
              <button 
                onClick={() => setIsShowingGameInfo(true)}
                className="focus:outline-none hover:scale-105 transition-transform cursor-pointer p-1"
                disabled={!currentLobby?.selected_game}
              >
                <AiOutlineInfoCircle 
                  className={currentLobby?.selected_game ? 'text-highlight' : 'text-gray-500'} 
                  size={24} 
                />
              </button>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <button 
                disabled={!isUserHost}
                onClick={() => setIsShowingCatalogue(true)}
                className="focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform cursor-pointer p-2 flex items-center gap-2 rounded-lg hover:bg-background-primary/20"
              >
                <span className="text-highlight font-bold text-m hidden sm:inline">CHANGE GAME</span>
                <img 
                  src={diceIcon}
                  alt="Change game" 
                  className="w-6 h-6"
                  style={{
                    filter: 'invert(64%) sepia(98%) saturate(565%) hue-rotate(325deg) brightness(101%) contrast(101%)'
                  }}
                />
              </button>
            </div>
          </div>

          {/* Settings Section */}
          <div className="w-full p-3 sm:p-4 bg-background-secondary rounded-lg shadow-md">
            {/* Lobby Settings */}
            <div className="mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-bold text-white mb-2">Lobby Settings</h3>
              <div className="flex flex-col gap-y-2">
                {lobbySettings.map((setting, index) => (
                  <Setting
                    key={`${index}-${isPublic ? 'public' : 'private'}`}
                    label={setting.label}
                    icon={setting.icon}
                    availableValues={setting.availableValues}
                    defaultValue={isPublic ? 'Public' : 'Private'}
                    disabled={!isUserHost}
                    onChange={handleUpdateVisibility}
                  />
                ))}
              </div>
            </div>

            {/* Player Count Settings */}
            <div className="mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-bold text-white mb-2">Game Settings</h3>
              <div className="flex flex-col gap-y-2">
                {gameSettings.map((setting, index) => (
                  <Setting
                    key={`${index}-${selectedPlayerCount}`}
                    label={setting.label}
                    icon={setting.icon}
                    availableValues={setting.availableValues}
                    defaultValue={String(selectedPlayerCount)}
                    disabled={!isUserHost}
                    disabledValues={disabledPlayerCounts}
                    onChange={(value) => handleUpdatePlayerCount(parseInt(value))}
                  />
                ))}
                {dynamicGameSettings.map((setting, index) => (
                    <Setting
                      key={`${setting.key}-${currentGameRules[setting.key] ?? setting.defaultValue}`}
                      label={setting.label}
                      icon={null}
                      availableValues={setting.availableValues}
                      defaultValue={String(currentGameRules[setting.key] ?? setting.defaultValue)}
                      disabled={!isUserHost}
                      onChange={(value) => handleGameRuleChange(setting.key, value)}
                    />
                  ))}
              </div>
            </div>

          </div>

          {/* Action Buttons - Desktop */}
          <div className="hidden lg:flex w-full p-3 sm:p-4 rounded-lg shadow-md flex-col items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={toggleReady}
              className={`w-full px-4 py-3 text-white font-bold text-base rounded-lg focus:outline-none ${
                !isReady ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              {!isReady ? 'Ready' : 'Not Ready'}
            </button>

            {isUserHost && (
              <button 
                disabled={!canStartGame} 
                onClick={handleStartGame}
                className="w-full px-4 py-3 bg-blue-500 text-white font-bold text-base rounded-lg hover:bg-blue-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-500"
              >
                Start
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <GameInfoModal
        isOpen={isShowingGameInfo}
        gameName={gameModalInfo.name}
        gameRules={gameModalInfo.rules}
        onClose={() => setIsShowingGameInfo(false)}
      />

      <CatalogueModal
        isOpen={isShowingCatalogue}
        games={mockGames}
        currentPlayerCount={currentPlayerCount}
        onClose={() => setIsShowingCatalogue(false)}
        onSelectGame={handleSelectGame}
        onClearGameSelection={handleClearGameSelection}
        isUserHost={isUserHost}
        selectedGameName={currentLobby?.selected_game}
      />

      <PassHostModal
        username={passHostUsername}
        isOpen={isPassHostModalOpen}
        onConfirm={() => {
          handlePassHost(passHostUsername)
          setIsPassHostModalOpen(false)
        }}
        onCancel={() => setIsPassHostModalOpen(false)}
      />

      <LeaveModal
        isOpen={isLeaveModalOpen}
        onConfirm={handleConfirmLeave}
        onCancel={() => setIsLeaveModalOpen(false)}
      />

      <InviteFriendsModal
        isOpen={isInviteFriendsModalOpen}
        onClose={() => setIsInviteFriendsModalOpen(false)}
        onInvite={sendInvite}
        lobbyCode={currentLobby.lobby_code || ''}
      />

      <EditLobbyNameModal
        isOpen={isEditLobbyNameModalOpen}
        currentName={currentLobby?.name || ''}
        onSave={handleUpdateLobbyName}
        onCancel={() => setIsEditLobbyNameModalOpen(false)}
      />
    </main>
  )
}
