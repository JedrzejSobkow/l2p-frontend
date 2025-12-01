import React, { useState, useEffect } from 'react';
import { FaAngleRight, FaAngleLeft } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import LeaderboardCard from '../components/LeaderboardCard';
import GameRecommendationWithImages from '../components/GameRecommendationWithImages';
import SearchBar from '../components/SearchBar';
import GameLobbyCard from '../components/GameLobbyCard';
import {
  noGameImage,
  avatar1,
  avatar2,
  avatar3,
  avatar4,
  pfpImage,
} from '@assets/images';
import { usePopup } from '../components/PopupContext';
import { useLobby } from '../components/lobby/LobbyContext';
import JoinOrCreateGame from '../components/JoinOrCreateGame';
import { getImage } from '../utils/imageMap';
import { isLobbySocketConnected } from '../services/lobby';
import { isGameSocketConnected } from '../services/game';
import Leaderboard from '@/components/Leaderboard';
import LoadingSpinner from '@/components/LoadingSpinner';

const HomeScreen: React.FC = () => {
  const { availableGames, publicLobbies, getPublicLobbies,isLoading } = useLobby();
  const location = useLocation();
  const { showPopup } = usePopup();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  useEffect(() => {
    const fetchData = async () => {
      if (isLobbySocketConnected() && isGameSocketConnected()) {
         getPublicLobbies();
      }
    };
    fetchData();
  }, [getPublicLobbies]);

  useEffect(() => {
    if (location.state?.message) {
      showPopup({
        type: location.state.type || 'info',
        message: location.state.message,
      });
      window.history.replaceState({}, document.title);
    }
  }, [location, showPopup]);

  const topPicksImages = availableGames.length > 0
    ? availableGames.slice(0, 2).map((game: any) => ({
        src: getImage('games', game.game_name) || noGameImage,
        alt: game.display_name,
        gameName: game.game_name,
      }))
    : [];

  const featuredGamesImages = availableGames.length > 0
    ? [availableGames[2] || availableGames[0]].map((game: any) => ({
        src: getImage('games', game.game_name) || noGameImage,
        alt: game.display_name,
        gameName: game.game_name,
      }))
    : [];

  // Convert publicLobbies to GameLobbyCard format
  const formattedLobbies = publicLobbies
    .filter((lobby) => lobby.current_players < lobby.max_players)
    .map((lobby) => ({
      gameName: lobby.selected_game_info?.display_name || 'Game not selected',
      lobbyName: lobby.name,
      gameImage: getImage('games', lobby.selected_game || 'noGame') || noGameImage,
      players: lobby.members.slice(0, 2).map((member) => ({
        username: member.nickname,
        avatar: getImage('avatars', 'avatar' + member.pfp_path?.split('/').pop()?.split('.')[0]) || pfpImage,
      })),
      maxPlayers: lobby.max_players,
      duration: 'In progress',
      lobbyCode: lobby.lobby_code,
    }));

  // Calculate pagination
  const totalPages = Math.ceil(formattedLobbies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentLobbies = formattedLobbies.slice(startIndex, startIndex + itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Reset to page 1 when lobbies change
  useEffect(() => {
    setCurrentPage(1);
  }, [publicLobbies]);

  return (
    <main className="flex flex-col gap-8 px-10 lg:px-20 py-5 bg-background h-full">
      {/* Search Bar */}
      <div className="flex justify-center">
        <SearchBar
          size="normal"
          placeholder="Search for games..."
          suggestions={availableGames.map((game: any) => ({
            text: game.display_name,
            name: game.game_name,
            image: getImage('games', game.game_name || 'noGame') || noGameImage,
          }))}
          onEnterRoute="/find_games"
          onSuggestionClickRoute="/game"
        />
      </div>
      <JoinOrCreateGame />

      <div className="flex flex-col md:flex-row justify-between gap-8">
        {/* Left Column: Top Picks and Featured Games */}
        <div className="w-full md:w-[70%] flex flex-col gap-8">
          <GameRecommendationWithImages title="Top picks for you" images={topPicksImages} />
          <GameRecommendationWithImages title="Featured games" images={featuredGamesImages} />

        </div>

        {/* Right Column: Leaderboard */}
        <Leaderboard/>
      </div>

      {/* Game Lobbies Section */}
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-headline">Active lobbies</h2>
        </div>
        
        {isLoading ? (
          <LoadingSpinner size="h-12 w-12" />
        ) : currentLobbies.length > 0 ? (
          <>
            {currentLobbies.map((lobby, index) => (
              <GameLobbyCard
                key={index}
                gameName={lobby.gameName}
                lobbyName={lobby.lobbyName}
                gameImage={lobby.gameImage}
                players={lobby.players}
                maxPlayers={lobby.maxPlayers}
                duration={lobby.duration}
                lobbyCode={lobby.lobbyCode}
              />
            ))}
            <div className="flex justify-center items-center gap-6 mt-4">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="text-highlight disabled:opacity-50"
              >
                <FaAngleLeft size={30} />
              </button>
              <span className="text-lg font-bold text-headline">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="text-highlight disabled:opacity-50"
              >
                <FaAngleRight size={30} />
              </button>
            </div>
          </>
        ) : (
          <div className="text-center text-headline py-8">No active lobbies available</div>
        )}
      </div>
    </main>
  );
};

export default HomeScreen;
