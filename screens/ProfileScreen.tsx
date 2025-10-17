import React, { useState } from 'react';

const ProfileScreen: React.FC = () => {
    const [description, setDescription] = useState('');
    const maxChars = 64;
    const maxRows = 3;

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        let value = e.target.value;
        value = value.replace(/\n/g, ''); // Remove new line characters
        if (value.length <= maxChars) {
            setDescription(value);
        }
    };

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
            <div className="input flex flex-col w-fit static -mt-6">
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
                    className="input px-[20px] py-[17px] text-s rounded-[20px] w-[350px] focus:outline-none placeholder:text-headline/25 text-headline"
                    style={{
                        backgroundColor: 'rgba(47, 46, 54, 0.1)',
                        border: '3px solid rgba(47, 46, 54, 0.5)',
                        resize: 'none', 
                        whiteSpace: 'pre-wrap', 
                        overflowWrap: 'break-word',
                    }}
                ></textarea>
                {/* Character Counter */}
                <div className="flex justify-between w-[350px] mt-2">
                    <div></div> {/* Empty div to push the counter to the right */}
                    <div className="text-xs text-paragraph">
                        {maxChars - description.length} characters left
                    </div>
                </div>
            </div>
        </main>
    );
};

export default ProfileScreen;
