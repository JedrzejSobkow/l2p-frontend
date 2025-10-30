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
        { avatar: "/src/assets/images/avatar/15.png", username: "cool_user", place: 1, isReady: false, isHost: false },
        { avatar: "/src/assets/images/avatar/11.png", username: "JohanesDoanes", place: 2, isReady: true, isHost: false },
        { avatar: "/src/assets/images/avatar/10.png", username: "JaneSmith", place: 3, isReady: true, isHost: false },
        { avatar: "/src/assets/images/avatar/9.png", username: "Alice", place: 4, isReady: false, isHost: false },
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

    return (
        <main className="grid grid-cols-2 gap-8 p-8 bg-background-primary">
            {/* First Column: Players and chat */}

            <div className="flex flex-col items-center gap-4">
                <div className="w-full flex items-center justify-between p-4 bg-background-secondary rounded-lg shadow-md">
                    <span className="text-lg font-bold text-white">{lobbyName}</span>
                    <button 
                        disabled={!isUserHost}
                        className="focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
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
                            isReady={user.isReady}
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
                        <button className="focus:outline-none">
                            <AiOutlineInfoCircle className="text-highlight" size={30} />
                        </button>
                        <button 
                            disabled={!isUserHost}
                            className="focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
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
                    <button disabled={!isUserHost} className="px-6 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-500">
                        Start
                    </button>
                </div>
            </div>
        </main>
    );
}

export default LobbyScreen;
