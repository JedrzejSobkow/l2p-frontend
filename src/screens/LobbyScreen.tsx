import React, { useState } from 'react';
import InLobbyUserTile from '../components/InLobbyUserTile';
import InviteToLobbyUserTile from '../components/InviteToLobbyUserTile';
import Setting from '../components/Setting';
import LobbyChat from '../components/LobbyChat';
import { FaRegEdit } from 'react-icons/fa';
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
    const users = [
        { avatar: "/src/assets/images/avatar/15.png", username: "cool_user", place: 1, isReady: false, isHost: true },
        { avatar: "/src/assets/images/avatar/11.png", username: "JohanesDoanes", place: 2, isReady: true, isHost: false },
        { avatar: "/src/assets/images/avatar/10.png", username: "JaneSmith", place: 3, isReady: true, isHost: false },
        { avatar: "/src/assets/images/avatar/9.png", username: "Alice", place: 4, isReady: true, isHost: false },
    ];

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

    const allUsersReady = users.every(user => 
        user.username === myUsername ? isReady : user.isReady
    );

    return (
        <main className="grid grid-cols-2 gap-8 p-8 bg-background-primary">
            {/* First Column: Players and chat */}

            <div className="flex flex-col items-center gap-4">
                <div className="w-full flex items-center justify-between p-4 bg-background-secondary rounded-lg shadow-md">
                    <span className="text-lg font-bold text-white">{lobbyName}</span>
                    <button 
                        disabled={!isUserHost}
                        onClick={() => setIsEditingLobbyName(true)}
                        className="focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform cursor-pointer"
                    >
                        <FaRegEdit className="text-highlight" size={30} />
                    </button>
                </div>

                <div className="w-full grid grid-cols-2 gap-4 p-4 bg-background-secondary rounded-lg shadow-md">
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
                        />
                    ))}
                    {/* Add empty seats */}
                    <InviteToLobbyUserTile onInviteClick={() => console.log('Invite clicked')} />
                    <InviteToLobbyUserTile onInviteClick={() => console.log('Invite clicked')} />
                </div>

                {/* Chat Section */}
                <LobbyChat messages={messages} onSendMessage={handleSendMessage} />
            </div>

            {/* Second Column: Game Info */}
            <div className="flex flex-col gap-4">
                <div className="w-full flex items-center justify-between p-4 bg-background-secondary rounded-lg shadow-md">
                    <div className="flex items-center gap-4">
                        <img
                            src={game.img_path}
                            alt={`${game.name} image`}
                            className="h-7 w-auto"
                        />
                        <span className="text-lg font-bold text-white">{game.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setIsShowingGameInfo(true)}
                            className="focus:outline-none hover:scale-105 transition-transform cursor-pointer"
                        >
                            <AiOutlineInfoCircle className="text-highlight" size={30} />
                        </button>
                        <button 
                            disabled={!isUserHost}
                            onClick={() => setIsShowingCatalogue(true)}
                            className="focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform cursor-pointer"
                        >
                            <FaRegFolderOpen className="text-highlight" size={30} />
                        </button>
                    </div>
                </div>

                {/* Settings Section */}
                <div className="w-full p-4 bg-background-secondary rounded-lg shadow-md">
                    {/* Lobby Settings */}
                    <div className="mb-4">
                        <h3 className="text-lg font-bold text-white mb-2">Lobby Settings</h3>
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
                        <h3 className="text-lg font-bold text-white mb-2">Game Settings</h3>
                        <div className="flex flex-col gap-y-2">
                            {gameSettings.map((setting, index) => (
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
                </div>

                {/* New Section */}
                <div className="w-full p-4 rounded-lg shadow-md flex items-center justify-center gap-4">
                    {/* Ready Button */}
                    <button
                        onClick={toggleReady}
                        className={`px-6 py-3 text-white font-bold rounded-lg focus:outline-none ${isReady ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                            }`}
                    >
                        {isReady ? 'Ready' : 'Not Ready'}
                    </button>

                    {/* Start Button */}
                    <button disabled={!isUserHost || !allUsersReady} className="px-6 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-500">
                        Start
                    </button>
                </div>
            </div>

            {/* Edit Lobby Name Modal */}
            {isEditingLobbyName && (
                <div
                    className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50"
                    style={{ backdropFilter: 'blur(8px)' }}
                    onClick={() => setIsEditingLobbyName(false)}
                >
                    <div
                        className="bg-background p-6 rounded-lg shadow-lg text-center"
                        style={{
                            outline: '2px solid var(--color-highlight)',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-highlight text-xl font-bold mb-4">Edit Lobby Name</h2>
                        <p className="text-paragraph mb-4">
                            Enter a new name for your lobby.
                        </p>
                        <input
                            type="text"
                            value={editedLobbyName}
                            onChange={(e) => setEditedLobbyName(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-400 rounded mb-4 text-headline"
                            placeholder="Lobby Name"
                        />
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => {
                                    // TODO: Implement lobby name update logic
                                    setIsEditingLobbyName(false);
                                }}
                                disabled={!editedLobbyName.trim()}
                                className={`px-4 py-2 rounded ${
                                    editedLobbyName.trim()
                                        ? 'bg-highlight text-white cursor-pointer hover:scale-105'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                } transition-transform`}
                            >
                                Save
                            </button>
                            <button
                                onClick={() => {
                                    setIsEditingLobbyName(false);
                                    setEditedLobbyName(lobbyName);
                                }}
                                className="bg-gray-300 text-black px-4 py-2 rounded hover:scale-105 transition-transform"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Game Info Modal */}
            {isShowingGameInfo && (
                <div
                    className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50"
                    style={{ backdropFilter: 'blur(8px)' }}
                    onClick={() => setIsShowingGameInfo(false)}
                >
                    <div
                        className="bg-background p-6 rounded-lg shadow-lg text-center max-w-md max-h-96 overflow-y-auto"
                        style={{
                            outline: '2px solid var(--color-highlight)',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-highlight text-xl font-bold mb-4">{game.name}</h2>
                        <p className="text-paragraph mb-4">
                            {game.rules}
                        </p>
                        <button
                            onClick={() => setIsShowingGameInfo(false)}
                            className="bg-highlight text-white px-4 py-2 rounded hover:scale-105 transition-transform"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Catalogue Modal */}
            {isShowingCatalogue && (
                <div
                    className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50"
                    style={{ backdropFilter: 'blur(8px)' }}
                    onClick={() => setIsShowingCatalogue(false)}
                >
                    <div
                        className="bg-background p-6 rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto flex flex-col"
                        style={{
                            outline: '2px solid var(--color-highlight)',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-highlight text-xl font-bold mb-4">Game Catalogue</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 flex-grow overflow-y-auto">
                            {mockGames.map((gameItem, index) => {
                                const isAvailable = isGameAvailable(gameItem.supportedPlayers);
                                return (
                                    <div
                                        key={index}
                                        className={`flex flex-col items-center gap-2 p-4 rounded-lg cursor-pointer transition-transform ${
                                            isAvailable
                                                ? 'bg-background-secondary hover:bg-background-primary hover:scale-105'
                                                : 'bg-gray-600 opacity-50 cursor-not-allowed'
                                        }`}
                                    >
                                        <img
                                            src={gameItem.src}
                                            alt={gameItem.gameName}
                                            className="w-20 h-20 rounded-lg object-cover"
                                        />
                                        <span className="text-sm font-medium text-headline text-center">
                                            {gameItem.gameName}
                                        </span>
                                        <span className="text-xs text-paragraph">
                                            {gameItem.supportedPlayers.join(', ')} player{gameItem.supportedPlayers.length > 1 ? 's' : ''}
                                        </span>
                                        {!isAvailable && (
                                            <span className="text-xs text-red-400 font-semibold">
                                                Not available
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex justify-center mt-4 pt-4">
                            <button
                                onClick={() => setIsShowingCatalogue(false)}
                                className="bg-highlight text-white px-4 py-2 rounded hover:scale-105 transition-transform"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

export default LobbyScreen;
