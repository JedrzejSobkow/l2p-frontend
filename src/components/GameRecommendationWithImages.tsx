import React from 'react';
import { Link } from 'react-router-dom';
import { moreGamesImage } from '@assets/images';
import LoadingSpinner from './LoadingSpinner';

interface GameRecommendationWithImages {
  title: string;
  images: { src: string; alt: string; gameName: string }[];
}

const GameRecommendationWithImages: React.FC<GameRecommendationWithImages> = ({ title, images }) => {
  return (
    <div className="flex flex-col gap-4 w-full md:w-[95%] mr:px-[5%]">
      <h2 className="text-2xl font-bold text-headline">{title}</h2>
      {images.length === 0 && (
          <LoadingSpinner size="h-12 w-12" />
        )}
      <div className="flex flex-wrap justify-left gap-6">
        {images.length > 0 && (
          <>
            {images.map((image, index) => (
              <Link to={`/game/${image.gameName}`} key={index}>
                <img
                  src={image.src}
                  alt={image.alt}
                className="w-24 h-24 md:w-32 md:h-32 rounded-lg shadow-md cursor-pointer hover:scale-105 transition-transform"
                />
              </Link>
            ))}
            <Link to="/find_games">
              <img
                src={moreGamesImage}
                alt="More Games"
                className="w-24 h-24 md:w-32 md:h-32 rounded-lg shadow-md cursor-pointer hover:scale-105 transition-transform"
              />
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default GameRecommendationWithImages;
