import React from 'react';
import LeaderboardCard from '../components/LeaderboardCard';
import GameRecommendationWithImages from '../components/GameRecommendationWithImages';
import SearchBar from '../components/SearchBar';

const HomeScreen: React.FC = () => {
  const leaderboardData = [
    { place: 1, pfp_path: '/src/assets/images/avatar/1.png', name: 'PlayerOne', rating: 1500 },
    { place: 2, pfp_path: '/src/assets/images/avatar/2.png', name: 'PlayerTwo', rating: 1400 },
    { place: 3, pfp_path: '/src/assets/images/avatar/3.png', name: 'cool_usersdfsfsdfsdf', rating: 1300 },
    { place: 4, pfp_path: '/src/assets/images/avatar/4.png', name: 'Cipicipi', rating: 1200 },
    { place: 5, pfp_path: '/src/assets/images/avatar/4.png', name: 'cidsof', rating: 1150 },
  ];

  const topPlayers = leaderboardData.slice(0, 5);

  const topPicksImages = [
    { src: '/src/assets/images/tic-tac-toe.png', alt: 'Tic Tac Toe' },
    { src: '/src/assets/images/clobber.png', alt: 'Clobber' },
    { src: '/src/assets/images/more-games.png', alt: 'More Games' },
  ];

  const featuredGamesImages = [
    { src: '/src/assets/images/clobber.png', alt: 'Clobber' },

  ];

  return (
    <main className="flex flex-col gap-8 p-5 bg-background h-full">
      {/* Search Bar */}
      <div className="flex justify-center">
        <SearchBar size="normal" placeholder="Search for games or players..." />
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-8">
        {/* Left Column: Top Picks and Featured Games */}
        <div className="w-full md:w-[70%] flex flex-col gap-8">
          <GameRecommendationWithImages title="Top picks for you" images={topPicksImages} />
          <GameRecommendationWithImages title="Featured games" images={featuredGamesImages} />
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
    </main>
  );
};

export default HomeScreen;
