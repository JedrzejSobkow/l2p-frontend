import React from 'react';

interface GameRecommendationWithImages {
  title: string;
  images: { src: string; alt: string }[];
}

const GameRecommendationWithImages: React.FC<GameRecommendationWithImages> = ({ title, images }) => {
  return (
    <div className="flex flex-col gap-4 w-full md:w-[90%] md:px-[5%]">
      <h2 className="text-2xl font-bold text-headline">{title}</h2>
      <div className="flex flex-wrap justify-left gap-6">
        {images.map((image, index) => (
          <img
            key={index}
            src={image.src}
            alt={image.alt}
            className="w-24 h-24 md:w-32 md:h-32 rounded-lg shadow-md cursor-pointer"
          />
        ))}
      </div>
    </div>
  );
};

export default GameRecommendationWithImages;
