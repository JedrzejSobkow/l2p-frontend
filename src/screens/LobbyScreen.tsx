import React from 'react';
import InLobbyUserTile from '../components/InLobbyUserTile';
import { FaRegEdit } from 'react-icons/fa';


const LobbyScreen: React.FC = () => {
    // Mocked data
    const lobbyName = "Mocked Lobby Name";
    const users = [
        { avatar: "/src/assets/images/avatar/15.png", username: "JohnDoe", place: 1, isReady: false, isHost: false, isMe: false },
        { avatar: "/src/assets/images/avatar/11.png", username: "JohanesDoanes", place: 2, isReady: true, isHost: false, isMe: false },
        { avatar: "/src/assets/images/avatar/10.png", username: "JaneSmith", place: 3, isReady: true, isHost: true, isMe: true },
        { avatar: "/src/assets/images/avatar/9.png", username: "Alice", place: 4, isReady: false, isHost: false, isMe: false },
    ];

    return (
        <main className="grid grid-cols-2 gap-8 p-8 bg-background-primary">
            {/* First Column: Existing Content */}
            <div className="flex flex-col items-center gap-4">
                <div className="w-full flex items-center justify-between p-4 bg-background-secondary rounded-lg shadow-md">
                    <span className="text-lg font-bold text-white">{lobbyName}</span>
                    <button className="focus:outline-none">
                        <FaRegEdit className="text-highlight" size={30} />
                    </button>
                </div>

                {/* Users Section */}
                <div className="w-full grid grid-cols-2 gap-4 p-4 bg-background-secondary rounded-lg shadow-md">
                    {users.map((user, index) => (
                        <InLobbyUserTile
                            key={index}
                            avatar={user.avatar}
                            username={user.username}
                            place={user.place}
                            isReady={user.isReady}
                            isHost={user.isHost}
                            isMe={user.isMe}
                        />
                    ))}
                </div>
            </div>

            {/* Second Column: Placeholder for Future Content */}
            <div className="flex items-center justify-center">
                <span className="text-gray-500">Second column content goes here</span>
            </div>
        </main>
    );
}

export default LobbyScreen;
