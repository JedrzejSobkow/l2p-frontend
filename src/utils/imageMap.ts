import * as images from '@assets/images';

const imageMap: Record<string, Record<string, string>> = {
    games: {
        tictactoe: images.ticTacToeImage,
        clobber: images.clobberImage,
        moreGames: images.moreGamesImage,
    },
    avatars: {
        avatar1: images.avatar1,
        avatar2: images.avatar2,
        avatar3: images.avatar3,
        avatar4: images.avatar4,
        avatar5: images.avatar5,
        avatar6: images.avatar6,
        avatar7: images.avatar7,
        avatar8: images.avatar8,
        avatar9: images.avatar9,
        avatar10: images.avatar10,
        avatar11: images.avatar11,
        avatar12: images.avatar12,
        avatar13: images.avatar13,
        avatar14: images.avatar14,
        avatar15: images.avatar15,
        avatar16: images.avatar16,
    },
};

export const getImage = (category: string, key: string): string | undefined => {
    return imageMap[category]?.[key];
};
