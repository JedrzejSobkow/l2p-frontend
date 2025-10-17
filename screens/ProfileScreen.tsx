import React from 'react';

const ProfileScreen: React.FC = () => {
    return (
        <main className="content-section flex flex-col items-center justify-center p-8 gap-8 text-headline font-sans">
            {/* Profile Picture */}
            <div className="w-64 h-64 rounded-full bg-gray-400 flex items-center justify-center mb-5 relative">
                <img
                    src="/assets/images/profile-picture.png"
                    alt="Profile Picture"
                    className="w-60 h-60 rounded-full"
                />
            </div>

            {/* Rating */}
            <div className="text-2xl font-bold text-highlight mb-2">
                RATING <span className="text-headline pl-2">495.00</span> <span className="text-lp">LP</span>
            </div>

            {/* Username */}
            <div className="flex items-center gap-8 text-lg font-normal mb-5">
                <img
                    src="/assets/icons/user.png"
                    alt="User Icon"
                    className="w-6 h-6"
                />
                <span>le_frogger422786</span>
                <img
                    src="/assets/icons/edit.png"
                    alt="Edit Icon"
                    className="w-6 h-6 cursor-pointer"
                />
            </div>

            {/* About Me Section */}
            <div className="w-72 p-2 border border-paragraph rounded-lg bg-background text-headline text-sm font-normal text-left">
                <div className="font-bold text-lg text-highlight mb-2">
                    about me
                </div>
                <p className="m-0">
                    This is an example of a text<br />
                    Longer text looks like this<br />
                    sdasdssssssssdddddfsdfsdfadsfsdfsdfsdfsdfsdfsdfdd
                </p>
            </div>
        </main>
    );
};

export default ProfileScreen;
