import React, { useState } from 'react';
import InLobbyUserTile from '../components/InLobbyUserTile';
import InviteToLobbyUserTile from '../components/InviteToLobbyUserTile';
import Setting from '../components/Setting';
import LobbyChat from '../components/LobbyChat';
import EditLobbyNameModal from '../components/EditLobbyNameModal';
import GameInfoModal from '../components/GameInfoModal';
import CatalogueModal from '../components/CatalogueModal';
import PassHostModal from '../components/PassHostModal';
import LeaveModal from '../components/LeaveModal';
import { FaRegEdit, FaSignOutAlt } from 'react-icons/fa';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { FaRegFolderOpen } from 'react-icons/fa6';
import { LuTimer, LuUsers } from 'react-icons/lu';
import { FiLock } from 'react-icons/fi';

const LobbyScreen: React.FC = () => {
    // Mocked myUsername
    const myUsername = "cool_user";

    const lobbyName = "Tiririri-kantiri";
    const game = {
        name: "Tic-Tac-Toe",
        rules: "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Expedita, voluptatum eum impedit optio eos, ratione minima consequatur totam similique laborum, suscipit odio animi error rerum exercitationem facilis incidunt cumque obcaecati",
        img_path: "/src/assets/images/tic-tac-toe.png"
    };

    const [users, setUsers] = useState([
        { avatar: "/src/assets/images/avatar/15.png", username: "cool_user", place: 1, isReady: false, isHost: true },
        { avatar: "/src/assets/images/avatar/11.png", username: "JohanesDoanes", place: 2, isReady: true, isHost: false },
        { avatar: "/src/assets/images/avatar/10.png", username: "JaneSmith", place: 3, isReady: true, isHost: false },
        { avatar: "/src/assets/images/avatar/9.png", username: "Alice1", place: 4, isReady: true, isHost: false },
        { avatar: "/src/assets/images/avatar/9.png", username: "Alice2", place: 5, isReady: true, isHost: false },
        { avatar: "/src/assets/images/avatar/9.png", username: "Alice3", place: 6, isReady: true, isHost: false },
    ]);

    // Mocked friends
    const friends = ["JohnDoe", "Friend2", "Friend3", "Friend4", "Friend5"];

    const [messages, setMessages] = useState<{ username: string; text: string }[]>([]);

    const handleSendMessage = (message: string) => {
        setMessages((prev) => [...prev, { username: "You", text: message }]);
    };

    // Check if current user is host
    const isUserHost = users.some(u => u.username === myUsername && u.isHost);

    // State for the Ready button
    const [isReady, setIsReady] = useState(false);

    const toggleReady = () => {
        setIsReady((prev) => !prev);
    };

    // Mocked Lobby Settings
    const lobbySettings = [
        {
            label: "Visibility",
            icon: <FiLock size={20} />,
            availableValues: ["Private", "Public"],
            defaultValue: "Private",
        },
    ];

    // Mocked Game Settings
    const gameSettings = [
        {
            label: "Players",
            icon: <LuUsers size={20} />,
            availableValues: ["2", "4", "6", "8"],
            defaultValue: "6",
        },
        {
            label: "Game time [min]",
            icon: <LuTimer size={20} />,
            availableValues: ["2", "4", "6", "8"],
            defaultValue: "6",
        },
    ];

    const [isEditingLobbyName, setIsEditingLobbyName] = useState(false);
    const [editedLobbyName, setEditedLobbyName] = useState(lobbyName);
    const [isShowingGameInfo, setIsShowingGameInfo] = useState(false);
    const [isShowingCatalogue, setIsShowingCatalogue] = useState(false);
    const [selectedPlayerCount, setSelectedPlayerCount] = useState(6);

    const mockGames = [
        { gameName: 'Tic Tac Toe', src: '/src/assets/images/tic-tac-toe.png', supportedPlayers: [2, 3, 4] },
        { gameName: 'Clobber', src: '/src/assets/images/clobber.png', supportedPlayers: [2, 3, 4, 5, 6] },
        { gameName: 'Chess', src: '/src/assets/images/clobber.png', supportedPlayers: [2] },
        { gameName: 'Checkers', src: '/src/assets/images/clobber.png', supportedPlayers: [2, 3, 4, 5] },
        { gameName: 'Sudoku', src: '/src/assets/images/clobber.png', supportedPlayers: [1, 2, 3, 4, 5, 6, 7, 8] },
        { gameName: 'Minesweeper', src: '/src/assets/images/clobber.png', supportedPlayers: [1, 2, 3, 4] },
    ];

    const currentPlayerCount = users.length;

    const isGameAvailable = (supportedPlayers: number[]) => {
        return supportedPlayers.includes(currentPlayerCount);
    };

    // Calculate disabled player count values (less than current player count)
    const disabledPlayerCounts = gameSettings[0].availableValues.filter(
        value => parseInt(value) < currentPlayerCount
    );

    const allUsersReady = users.every(user => 
        user.username === myUsername ? isReady : user.isReady
    );

    const canStartGame = isUserHost && allUsersReady && currentPlayerCount === selectedPlayerCount;

    const handleSaveLobbyName = (newName: string) => {
        // TODO: Implement lobby name update logic
        setEditedLobbyName(newName);
        setIsEditingLobbyName(false);
    };

    const handlePassHost = (newHostUsername: string) => {
        setUsers(prevUsers =>
            prevUsers.map(user => ({
                ...user,
                isHost: user.username === newHostUsername
            }))
        );
    };

    const handleKickOut = (usernameToRemove: string) => {
        setUsers(prevUsers => prevUsers.filter(user => user.username !== usernameToRemove));
    };

    const [passHostUsername, setPassHostUsername] = useState<string>("");
    const [isPassHostModalOpen, setIsPassHostModalOpen] = useState(false);

    const handlePassHostClick = (username: string) => {
        setPassHostUsername(username);
        setIsPassHostModalOpen(true);
    };

    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

    const handleLeaveClick = () => {
        setIsLeaveModalOpen(true);
    };

    const handleConfirmLeave = () => {
        // TODO: Implement actual leave logic (navigate away, API call, etc.)
        console.log('User left the lobby');
        setIsLeaveModalOpen(false);
    };

    return (
        <main className="flex flex-col bg-background-primary min-h-screen">
            {/* Top Bar with Leave Button */}
            <div className="flex justify-start px-4 sm:px-6 lg:px-8 pt-4 pb-2">
                <button
                    onClick={handleLeaveClick}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-600 text-white font-bold text-sm sm:text-base rounded-lg hover:bg-red-700 hover:scale-105 transition-transform focus:outline-none"
                >
                    <FaSignOutAlt size={20} />
                    <span className="hidden sm:inline">Leave</span>
                </button>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8 flex-1 overflow-auto">
                {/* First Column: Players and chat */}
                <div className="flex flex-col items-center gap-3 sm:gap-4">
                    <div className="w-full flex items-center justify-between p-3 sm:p-4 bg-background-secondary rounded-lg shadow-md">
                        <span className="text-base sm:text-lg font-bold text-white truncate">{editedLobbyName}</span>
                        <button 
                            disabled={!isUserHost}
                            onClick={() => setIsEditingLobbyName(true)}
                            className="focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform cursor-pointer ml-2 flex-shrink-0"
                        >
                            <FaRegEdit className="text-highlight" size={24} />
                        </button>
                    </div>

                    <div className="w-full grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4 p-3 sm:p-4 bg-background-secondary rounded-lg shadow-md">
                        {users.map((user, index) => (
                            <InLobbyUserTile
                                key={index}
                                avatar={user.avatar}
                                username={user.username}
                                place={user.place}
                                isReady={user.username === myUsername ? isReady : user.isReady}
                                isHost={user.isHost}
                                isYou={myUsername === user.username}
                                displayPassHost={myUsername !== user.username && users.some(u => u.username === myUsername && u.isHost)}
                                displayKickOut={myUsername !== user.username && users.some(u => u.username === myUsername && u.isHost)}
                                onPassHost={() => handlePassHostClick(user.username)}
                                onKickOut={() => handleKickOut(user.username)}
                            />
                        ))}
                        {/* Add empty seats */}
                        {Array.from({ length: selectedPlayerCount - currentPlayerCount }).map((_, index) => (
                            <InviteToLobbyUserTile key={`empty-${index}`} onInviteClick={() => console.log('Invite clicked')} />
                        ))}
                    </div>

                    {/* Action Buttons Section - visible on mobile */}
                    <div className="w-full lg:hidden p-3 sm:p-4 rounded-lg shadow-md flex flex-col items-center justify-center gap-3">
                        {/* Ready Button */}
                        <button
                            onClick={toggleReady}
                            className={`w-full px-4 py-2 text-white font-bold text-sm rounded-lg focus:outline-none ${isReady ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                                }`}
                        >
                            {isReady ? 'Ready' : 'Not Ready'}
                        </button>

                        {/* Start Button */}
                        <button disabled={!canStartGame} className="w-full px-4 py-2 bg-blue-500 text-white font-bold text-sm rounded-lg hover:bg-blue-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-500">
                            Start
                        </button>
                    </div>

                    {/* Chat Section */}
                    <div className="w-full bg-background-secondary rounded-lg shadow-md p-3 sm:p-4">
                        <h3 className="text-base sm:text-lg font-bold text-white mb-2">Chat</h3>
                        <LobbyChat messages={messages} onSendMessage={handleSendMessage} />
                    </div>
                </div>

                {/* Second Column: Game Info */}
                <div className="flex flex-col gap-3 sm:gap-4">
                    <div className="w-full flex items-center justify-between gap-2 p-3 sm:p-4 bg-background-secondary rounded-lg shadow-md">
                        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                            <img
                                src={game.img_path}
                                alt={`${game.name} image`}
                                className="h-5 sm:h-7 w-auto flex-shrink-0"
                            />
                            <span className="text-sm sm:text-lg font-bold text-white truncate">{game.name}</span>
                        </div>

                        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                            <button 
                                onClick={() => setIsShowingGameInfo(true)}
                                className="focus:outline-none hover:scale-105 transition-transform cursor-pointer p-1"
                            >
                                <AiOutlineInfoCircle className="text-highlight" size={24} />
                            </button>
                            <button 
                                disabled={!isUserHost}
                                onClick={() => setIsShowingCatalogue(true)}
                                className="focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform cursor-pointer p-1"
                            >
                                <FaRegFolderOpen className="text-highlight" size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Settings Section */}
                    <div className="w-full p-3 sm:p-4 bg-background-secondary rounded-lg shadow-md overflow-y-auto max-h-96 lg:max-h-none">
                        {/* Lobby Settings */}
                        <div className="mb-3 sm:mb-4">
                            <h3 className="text-base sm:text-lg font-bold text-white mb-2">Lobby Settings</h3>
                            <div className="flex flex-col gap-y-2">
                                {lobbySettings.map((setting, index) => (
                                    <Setting
                                        key={index}
                                        label={setting.label}
                                        icon={setting.icon}
                                        availableValues={setting.availableValues}
                                        defaultValue={setting.defaultValue}
                                        disabled={!isUserHost}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Game Settings */}
                        <div>
                            <h3 className="text-base sm:text-lg font-bold text-white mb-2">Game Settings</h3>
                            <div className="flex flex-col gap-y-2">
                                {gameSettings.map((setting, index) => (
                                    <Setting
                                        key={index}
                                        label={setting.label}
                                        icon={setting.icon}
                                        availableValues={setting.availableValues}
                                        defaultValue={setting.defaultValue}
                                        disabled={!isUserHost}
                                        disabledValues={index === 0 ? disabledPlayerCounts : []}
                                        onChange={index === 0 ? (value) => setSelectedPlayerCount(parseInt(value)) : undefined}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons Section - visible on desktop */}
                    <div className="hidden lg:flex w-full p-3 sm:p-4 rounded-lg shadow-md flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                        {/* Ready Button */}
                        <button
                            onClick={toggleReady}
                            className={`w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 text-white font-bold text-sm sm:text-base rounded-lg focus:outline-none ${isReady ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                                }`}
                        >
                            {isReady ? 'Ready' : 'Not Ready'}
                        </button>

                        {/* Start Button */}
                        <button disabled={!canStartGame} className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-blue-500 text-white font-bold text-sm sm:text-base rounded-lg hover:bg-blue-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-500">
                            Start
                        </button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <EditLobbyNameModal
                isOpen={isEditingLobbyName}
                currentName={editedLobbyName}
                onSave={handleSaveLobbyName}
                onCancel={() => setIsEditingLobbyName(false)}
            />

            <GameInfoModal
                isOpen={isShowingGameInfo}
                gameName={game.name}
                gameRules={game.rules}
                onClose={() => setIsShowingGameInfo(false)}
            />

            <CatalogueModal
                isOpen={isShowingCatalogue}
                games={mockGames}
                currentPlayerCount={currentPlayerCount}
                onClose={() => setIsShowingCatalogue(false)}
            />

            <PassHostModal
                username={passHostUsername}
                isOpen={isPassHostModalOpen}
                onConfirm={() => {
                    handlePassHost(passHostUsername);
                    setIsPassHostModalOpen(false);
                }}
                onCancel={() => setIsPassHostModalOpen(false)}
            />

            <LeaveModal
                isOpen={isLeaveModalOpen}
                onConfirm={handleConfirmLeave}
                onCancel={() => setIsLeaveModalOpen(false)}
            />
        </main>
    );
}

export default LobbyScreen;
