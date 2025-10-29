import React from 'react';
import InLobbyUserTile from '../components/InLobbyUserTile';
import { FaRegEdit } from 'react-icons/fa';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { FaRegFolderOpen } from 'react-icons/fa6';


const LobbyScreen: React.FC = () => {
    // Mocked data
    const lobbyName = "Tiririri-kantiri";
    const game = {
        name: "Tic-Tac-Toe",
        rules: "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Expedita, voluptatum eum impedit optio eos, ratione minima consequatur totam similique laborum, suscipit odio animi error rerum exercitationem facilis incidunt cumque obcaecati",
        img_path: "/src/assets/images/tic-tac-toe.png"
    }
    const users = [
        { avatar: "/src/assets/images/avatar/15.png", username: "JohnDoe", place: 1, isReady: false, isHost: false, isMe: false },
        { avatar: "/src/assets/images/avatar/11.png", username: "JohanesDoanes", place: 2, isReady: true, isHost: false, isMe: false },
        { avatar: "/src/assets/images/avatar/10.png", username: "JaneSmith", place: 3, isReady: true, isHost: true, isMe: true },
        { avatar: "/src/assets/images/avatar/9.png", username: "Alice", place: 4, isReady: false, isHost: false, isMe: false },
    ];

    return (
        <main className="grid grid-cols-2 gap-8 p-8 bg-background-primary">
            <div className="flex flex-col items-center gap-4">
                <div className="w-full flex items-center justify-between p-4 bg-background-secondary rounded-lg shadow-md">
                    <span className="text-lg font-bold text-white">{lobbyName}</span>
                    <button className="focus:outline-none">
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
                            isMe={user.isMe}
                        />
                    ))}
                </div>

                {/* Chat Section Placeholder */}
                <div className="w-full p-4 bg-background-secondary rounded-lg shadow-md">
                    <span className="text-gray-500">Chat section goes here</span>
                </div>
            </div>

            {/* Second Column: Game Info */}
            <div className="flex items-start">
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
                        <button className="focus:outline-none">
                            <FaRegFolderOpen className="text-highlight" size={30} />
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default LobbyScreen;
