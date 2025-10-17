import React, { useState } from 'react';

const ProfileScreen: React.FC = () => {
    const [description, setDescription] = useState('');
    const [selectedPictureId, setSelectedPictureId] = useState<number | null>(null);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const maxChars = 64;

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        let value = e.target.value;
        value = value.replace(/\n/g, ''); // Remove new line characters
        if (value.length <= maxChars) {
            setDescription(value);
        }
    };

    const handlePictureSelect = (id: number) => {
        setSelectedPictureId(id);
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'current' | 'new') => {
        if (type === 'current') {
            setCurrentPassword(e.target.value);
        } else {
            setNewPassword(e.target.value);
        }
    };

    const pictures = [
        '/assets/images/profile-picture.png',
        '/assets/images/profile-picture.png',
        '/assets/images/profile-picture.png',
        '/assets/images/profile-picture.png',
        '/assets/images/profile-picture.png',
        '/assets/images/profile-picture.png',
        '/assets/images/profile-picture.png',
        '/assets/images/profile-picture.png',
        '/assets/images/profile-picture.png',
        '/assets/images/profile-picture.png',
        '/assets/images/profile-picture.png',
        '/assets/images/profile-picture.png',
        '/assets/images/profile-picture.png',
        '/assets/images/profile-picture.png',
        '/assets/images/profile-picture.png',
        '/assets/images/profile-picture.png',
    ];

    return (
        <main className="content-section flex flex-col items-center justify-center px-0 md:px-16 py-16 gap-8 text-headline font-sans h-full">
            {/* Two Columns Layout */}
            <div className="flex flex-col lg:flex-row justify-between items-center w-full max-w-6xl gap-8 h-full mx-auto">
                {/* Left Column: Big Profile Picture, Username, About Me */}
                <div className="flex flex-col items-center w-4/5 lg:w-1/2 gap-6">
                    {/* Big Profile Picture */}
                    <div className="w-64 h-64 rounded-full bg-gray-400 flex items-center justify-center relative">
                        <img
                            src={selectedPictureId !== null ? pictures[selectedPictureId] : '/assets/images/profile-picture.png'}
                            alt="Profile Picture"
                            className="w-60 h-60 rounded-full"
                        />
                    </div>

                    {/* Username */}
                    <div className="flex items-center gap-4 text-lg font-normal">
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
                    <div className="input flex flex-col w-[60%] min-w-[270px]">
                        <label
                            htmlFor="about-me"
                            className="text-highlight text-xl font-semibold relative top-3 ml-[20px] px-[3px] bg-input-bg w-fit"
                        >
                            about me:
                        </label>
                        <textarea
                            id="about-me"
                            placeholder="Tell us something about you..."
                            name="about-me"
                            spellCheck="false"
                            value={description}
                            rows={3}
                            onChange={handleDescriptionChange}
                            className="input px-[20px] py-[17px] text-s rounded-[20px] w-full focus:outline-none placeholder:text-headline/25 text-headline"
                            style={{
                                backgroundColor: 'rgba(47, 46, 54, 0.1)',
                                border: '3px solid rgba(47, 46, 54, 0.5)',
                                resize: 'none', 
                                whiteSpace: 'pre-wrap', 
                                overflowWrap: 'break-word',
                            }}
                        ></textarea>
                        {/* Character Counter */}
                        <div className="flex justify-between w-full mt-2">
                            <div></div> {/* Empty div to push the counter to the right */}
                            <div className="text-xs text-paragraph">
                                {maxChars - description.length} characters left
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Profile Picture Selection */}
                <div className="flex flex-col items-center justify-center w-full lg:w-1/2">
                    <h2 className="text-headline text-2xl font-bold mb-4 pb-4">Select your profile picture:</h2>
                    <div className="grid grid-cols-4 gap-6">
                        {pictures.map((picture, index) => (
                            <div
                                key={index}
                                className={`w-16 h-16 rounded-full border-2 ${
                                    selectedPictureId === index
                                    ? 'border-4 border-highlight'
                                    : 'border-2 border-gray-400'                                } flex items-center justify-center cursor-pointer`}
                                onClick={() => handlePictureSelect(index)}
                            >
                                <img
                                    src={picture}
                                    alt={`Profile Picture ${index + 1}`}
                                    className="w-full h-full rounded-full"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Change Password and Delete Account Section */}
            <div className="flex flex-col items-start w-full max-w-4xl mt-12 gap-6 lg:w-full md:w-3/5 mx-auto">
                <h2 className="text-highlight text-2xl font-bold">Change password</h2>
                <div className="flex flex-col gap-4 w-full max-w-[500px]">
                    {/* Current Password */}
                    <div className="input flex flex-col w-full relative">
                        <label
                            htmlFor="current-password"
                            className="text-headline text-sm font-semibold relative top-3 ml-[20px] px-[3px] bg-background w-fit"
                        >
                            current password
                        </label>
                        <input
                            id="current-password"
                            type="password"
                            placeholder="Enter actual password"
                            value={currentPassword}
                            onChange={(e) => handlePasswordChange(e, 'current')}
                            className="input px-[15px] py-[12px] text-s rounded-[40px] w-full focus:outline-none placeholder:text-headline/25 text-headline"
                            style={{
                                backgroundColor: '#0F0E17',
                                border: '2px solid #FF8906',
                                color: '#FFFFFE',
                            }}
                        />
                        <img
                            src="/assets/icons/password.png"
                            alt="Password Icon"
                            className="absolute right-4 top-11 transform -translate-y-1/2 w-6 h-6"
                        />
                    </div>

                    {/* New Password */}
                    <div className="input flex flex-col w-full relative">
                        <label
                            htmlFor="new-password"
                            className="text-headline text-sm font-semibold relative top-3 ml-[20px] px-[3px] bg-background w-fit"
                        >
                            new password
                        </label>
                        <input
                            id="new-password"
                            type="password"
                            placeholder="Enter new password"
                            value={newPassword}
                            onChange={(e) => handlePasswordChange(e, 'new')}
                            className="input px-[15px] py-[12px] text-s rounded-[40px] w-full focus:outline-none placeholder:text-headline/25 text-headline"
                            style={{
                                backgroundColor: '#0F0E17',
                                border: '2px solid #FF8906',
                                color: '#FFFFFE',
                            }}
                        />
                        <img
                            src="/assets/icons/password.png"
                            alt="Password Icon"
                            className="absolute right-4 top-11 transform -translate-y-1/2 w-6 h-6"
                        />
                    </div>
                </div>

                {/* Reset Button */}
                <button className="bg-highlight text-headline font-bold py-2 px-6 rounded-[20px] w-[150px]">
                    RESET
                </button>

                {/* Email Address */}
                <div className="text-highlight text-lg font-bold">
                    e-mail address <span className="text-headline font-normal">frogshoplsmydops@onet.pl</span>
                </div>

                {/* Delete Account Button */}
                <button className="border-2 border-highlight text-highlight font-bold py-2 px-6 rounded-[20px] w-[200px]">
                    Delete account
                </button>
            </div>
        </main>
    );
};

export default ProfileScreen;
