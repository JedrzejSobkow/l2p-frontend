import React, { useState } from 'react';

const ProfileScreen: React.FC = () => {
    const [description, setDescription] = useState('');
    const [selectedPictureId, setSelectedPictureId] = useState<number | null>(null);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isEditingUsername, setIsEditingUsername] = useState(false);
    const [username, setUsername] = useState('le_frogger422786');
    const [isPasswordValid, setIsPasswordValid] = useState(true); // Track password validity
    const [showDeleteModal, setShowDeleteModal] = useState(false); // Track delete modal visibility
    const [deleteConfirmation, setDeleteConfirmation] = useState(''); // Track delete confirmation input
    const maxChars = 64;
    const maxUsernameLength = 20;

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
        const value = e.target.value;
        if (type === 'current') {
            setCurrentPassword(value);
        } else {
            setNewPassword(value);
            validatePassword(value); // Validate the new password
        }
    };

    const validatePassword = (password: string) => {
        // Example password policy: at least 8 characters, one uppercase, one lowercase, one number
        const passwordPolicy = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        setIsPasswordValid(passwordPolicy.test(password));
    };

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Allow only alphanumeric characters and underscores, and limit to 14 characters
        if (/^[a-zA-Z0-9_]*$/.test(value) && value.length <= maxUsernameLength) {
            setUsername(value);
        }
    };

    const saveUsername = () => {
        setIsEditingUsername(false);
        // Add any additional save logic here (e.g., API call)
    };

    const handleDeleteAccount = () => {
        if (deleteConfirmation === 'delete') {
            // Perform delete account logic here (e.g., API call)
            alert('Account deleted successfully!');
            setShowDeleteModal(false);
            setDeleteConfirmation('');
        } else {
            alert('Please type "delete" to confirm.');
        }
    };

    const pictures = Array.from({ length: 16 }, (_, index) => `/assets/images/profile-pictures/pfp${index + 1}.png`);

    const isResetEnabled = currentPassword && isPasswordValid && newPassword; 

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
                        {isEditingUsername ? (
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={username}
                                    onChange={handleUsernameChange}
                                    className="px-2 py-1 border border-gray-400 rounded"
                                />
                                <button
                                    onClick={saveUsername}
                                    className="px-3 py-1 bg-highlight text-stroke rounded"
                                >
                                    Save
                                </button>
                            </div>
                        ) : (
                            <span
                                onClick={() => setIsEditingUsername(true)}
                                className="cursor-pointer hover:underline"
                            >
                                {username}
                            </span>
                        )}
                        {!isEditingUsername && (
                            <img
                                src="/assets/icons/edit.png"
                                alt="Edit Icon"
                                className="w-6 h-6 cursor-pointer"
                                onClick={() => setIsEditingUsername(true)}
                            />
                        )}
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
                                        : 'border-2 border-gray-400'
                                } flex items-center justify-center cursor-pointer`}
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
            <div className="flex flex-col items-start w-4/5 max-w-4xl mt-12 gap-6 lg:w-full md:w-3/5 mx-auto">
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
                            className={`input px-[15px] py-[12px] text-s rounded-[40px] w-full focus:outline-none placeholder:text-headline/25 ${
                                isPasswordValid ? 'border-[#FF8906]' : 'border-red-500'
                            }`}
                            style={{
                                backgroundColor: '#0F0E17',
                                borderWidth: '2px',
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
                <button
                    className={`font-bold py-2 px-6 rounded-[10px] w-[150px] ${
                        isResetEnabled ? 'bg-highlight text-stroke' : 'bg-highlight/35 text-stroke'
                    }`}
                    disabled={!isResetEnabled}
                >
                    RESET
                </button>

                {/* Email Address */}
                <div className="text-highlight text-lg font-bold pt-[25px]">
                    e-mail address <span className="text-headline/35 font-normal pl-[20px]">frogshoplsmydops@onet.pl</span>
                </div>

                {/* Delete Account Button */}
                <button
                    className="border-2 border-attention/70 text-attention/70 font-bold py-2 px-6 rounded-[20px] w-[200px]"
                    onClick={() => setShowDeleteModal(true)}
                >
                    Delete account
                </button>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div
                    className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50"
                    style={{ backdropFilter: 'blur(8px)' }}
                    onClick={() => {
                        setShowDeleteModal(false);
                        setDeleteConfirmation('');
                    }}
                >
                    <div
                        className="bg-background p-6 rounded-lg shadow-lg text-center"
                        style={{
                            outline: '2px solid var(--color-highlight)', // Add highlight color outline
                        }}
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
                    >
                        <h2 className="text-highlight text-xl font-bold mb-4">Confirm Account Deletion</h2>
                        <p className="text-paragraph mb-4">
                            Type <strong>"delete"</strong> below to confirm account deletion.
                        </p>
                        <input
                            type="text"
                            value={deleteConfirmation}
                            onChange={(e) => setDeleteConfirmation(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-400 rounded mb-4"
                            placeholder="Type 'delete' here"
                        />
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={handleDeleteAccount}
                                disabled={deleteConfirmation !== 'delete'} // Disable if the phrase is incorrect
                                className={`px-4 py-2 rounded ${
                                    deleteConfirmation === 'delete'
                                        ? 'bg-red-500 text-white cursor-pointer'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                            >
                                Confirm
                            </button>
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeleteConfirmation('');
                                }}
                                className="bg-gray-300 text-black px-4 py-2 rounded"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};

export default ProfileScreen;
