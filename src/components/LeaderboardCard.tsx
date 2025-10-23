import React from 'react';

interface LeaderboardCardProps {
  place: number;
  pfp_path: string;
  name: string;
  rating: number;
}

const LeaderboardCard: React.FC<LeaderboardCardProps> = ({ place, pfp_path, name, rating }) => {
  const getAccentColor = () => {
    switch (place) {
      case 1:
        return 'bg-first-place'; 
      case 2:
        return 'bg-second-place'; 
      case 3:
        return 'bg-third-place'; 
      default:
        return 'bg-transparent'; 
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 rounded-lg bg-background-secondary shadow-md relative max-h-[60px]">
      <div className={`absolute left-0 top-0 bottom-0 w-2 ${getAccentColor()} rounded-l-lg`}></div>
      <span className="text-sm font-bold text-paragraph">#{place}</span>
      <img
        src={pfp_path}
        alt={`${name}'s avatar`}
        className="w-11 h-11 rounded-full"
      />
      <span className="text-sm font-medium text-headline flex-1 truncate">{name}</span>
      <span className="text-sm font-medium text-headline">
        {rating} <span className="font-medium text-lp">LP</span>
      </span>
    </div>
  );
};

export default LeaderboardCard;
