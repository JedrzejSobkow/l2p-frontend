import React, { useState, useEffect } from 'react';
import { FaAngleRight, FaAngleLeft } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import LeaderboardCard from '../components/LeaderboardCard';
import GameRecommendationWithImages from '../components/GameRecommendationWithImages';
import SearchBar from '../components/SearchBar';
import GameLobbyCard from '../components/GameLobbyCard';
import Popup from '../components/Popup';
import { useLobby } from '../components/lobby/LobbyContext';

const HomeScreen: React.FC = () => {
  const { availableGames, getAvailableGames, publicLobbies, getPublicLobbies } = useLobby();
  const location = useLocation();

  const [popup, setPopup] = useState<{ type: 'confirmation' | 'error'; message: string } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  useEffect(() => {
    getAvailableGames();
    getPublicLobbies();
  }, [getAvailableGames, getPublicLobbies]);

  useEffect(() => {
    if (location.state?.message) {
      setPopup({
        type: location.state.type || 'info',
        message: location.state.message,
      });
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const leaderboardData = [
    { place: 1, pfp_path: '/src/assets/images/avatar/1.png', name: 'PlayerOne', rating: 1500 },
    { place: 2, pfp_path: '/src/assets/images/avatar/2.png', name: 'PlayerTwo', rating: 1400 },
    { place: 3, pfp_path: '/src/assets/images/avatar/3.png', name: 'cool_usersdfsfsdfsdf', rating: 1300 },
    { place: 4, pfp_path: '/src/assets/images/avatar/4.png', name: 'Cipicipi', rating: 1200 },
    { place: 5, pfp_path: '/src/assets/images/avatar/4.png', name: 'cidsof', rating: 1150 },
  ];

  const topPlayers = leaderboardData.slice(0, 5);

  // Generate top picks and featured games from available games
  const topPicksImages = availableGames.length > 0
    ? availableGames.slice(0, 2).map((game: any) => ({
        src: `/src/assets/images/games/${game.game_name || 'default'}.png`,
        alt: game.display_name,
        gameName: game.game_name,
      }))
    : [];

  const featuredGamesImages = availableGames.length > 0
    ? [availableGames[2] || availableGames[0]].map((game: any) => ({
        src: `/src/assets/images/games/${game.game_name || 'default'}.png`,
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
      gameImage: `/src/assets/images/games/${lobby.selected_game || 'default'}.png`,
      players: lobby.members.slice(0, 2).map((member) => ({
        username: member.nickname,
        avatar: `/src/assets${member.pfp_path}`,
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
            image: `/src/assets/images/games/${game.game_name || 'default'}.png`,
          }))}
          onEnterRoute="/find_games"
          onSuggestionClickRoute="/game"
        />
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-8">
        {/* Left Column: Top Picks and Featured Games */}
        <div className="w-full md:w-[70%] flex flex-col gap-8">
          {topPicksImages.length > 0 && (
            <GameRecommendationWithImages title="Top picks for you" images={topPicksImages} />
          )}
          {featuredGamesImages.length > 0 && (
            <GameRecommendationWithImages title="Featured games" images={featuredGamesImages} />
          )}
        </div>

        {/* Right Column: Leaderboard */}
        <div className="flex flex-col gap-4 w-full md:w-[30%] min-w-[300px]">
          <h2 className="text-2xl font-bold text-headline mb-4">Top rated players</h2>
          {topPlayers.map((player) => (
            <LeaderboardCard
              key={player.place}
              place={player.place}
              pfp_path={player.pfp_path}
              name={player.name}
              rating={player.rating}
            />
          ))}
        </div>
      </div>

      {/* Game Lobbies Section */}
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-headline">Active lobbies</h2>
        </div>
        {currentLobbies.length > 0 ? (
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
      {popup && (
        <Popup
          type={popup.type}
          message={popup.message}
          onClose={() => setPopup(null)}
        />
      )}
    </main>
  );
};

export default HomeScreen;
