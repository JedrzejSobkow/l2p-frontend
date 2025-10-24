import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; 
import Popup from '../components/Popup'
import { useAuth } from '../components/AuthContext'
import type { User } from '../services/auth';

const ProfileScreen: React.FC = () => {
    const navigate = useNavigate()
    const { user, updateProfile, deleteAccount } = useAuth()
    const [userData,setUserData] = useState<Partial<User>|null>(null)

    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState(''); 

    const [selectedPictureId, setSelectedPictureId] = useState<number | null>(null);
    const [isEditingUsername, setIsEditingUsername] = useState(false);
    const [isPasswordValid, setIsPasswordValid] = useState(true); 
    const [showDeleteModal, setShowDeleteModal] = useState(false); 
    const [deleteConfirmation, setDeleteConfirmation] = useState('');  
    const [usernameError, setUsernameError] = useState(false); 
    const [popup, setPopup] = useState<{ type: 'error' | 'informative' | 'confirmation'; message: string } | null>(null); 
    const [descriptionOutline, setDescriptionOutline] = useState<string>('rgba(47, 46, 54, 0.5)'); 
    const descTimerRef = useRef<number | null>(null)
    const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false); 
    const [isConfirmNewPasswordVisible, setIsConfirmNewPasswordVisible] = useState(false); 
    const maxChars = 64;
    const maxUsernameLength = 20;

    const pictures = Array.from({ length: 16 }, (_, index) => `src/assets/images/avatar/${index + 1}.png`);

    const handlePasswordVisibility = (type: 'new' | 'confirm', isVisible: boolean) => {
        if (type === 'new') {
            setIsNewPasswordVisible(isVisible);
        } else {
            setIsConfirmNewPasswordVisible(isVisible);
        }
    };

    const handlePasswordIconStyle = {
        filter: 'invert(52%) sepia(96%) saturate(746%) hue-rotate(1deg) brightness(102%) contrast(101%)', 
    };

        // derive local editable data from auth user
    useEffect(() => {
        if (!user) return;
        setUserData({
            email: user.email,
            nickname: user.nickname,
            description: user.description,
            pfp_path: user.pfp_path,
        });

        // Set selectedPictureId based on user's current profile picture
        if (user.pfp_path) {
            const match = user.pfp_path.match(/^\/images\/avatar\/([1-9]|1[0-6])\.png$/);
            if (match) {
                const id = parseInt(match[1], 10) - 1;
                setSelectedPictureId(id);
            }
        }
    }, [user?.id]);

    // cleanup any pending debounce timer on unmount
    useEffect(() => {
        return () => {
            if (descTimerRef.current) {
                window.clearTimeout(descTimerRef.current)
                descTimerRef.current = null
            }
        }
    }, [])

    const norm = (v: unknown) => typeof v === 'string' ? v.trim() : v
    const changed = (prev: unknown, next: unknown) => norm(prev) !== norm(next)

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        let value = e.target.value;
        value = value.replace(/\n/g, ''); 
        if (value.length <= maxChars) {
            setUserData(prev => {
                const next: Partial<User> = {
                    ...prev,
                    description: value
                }
                return next
            })

                        if (descTimerRef.current) {
                window.clearTimeout(descTimerRef.current)
            }

            setDescriptionOutline('rgba(59, 130, 246, 0.4)');

            descTimerRef.current = window.setTimeout(async () => {
                setDescriptionOutline('rgba(47, 46, 54, 0.5)')
                if (!user || !changed(user.description, value)) return
                try {
                    await updateProfile({ description: value } as any)
                    setPopup({ type: 'confirmation', message: 'Description updated.' })
                } catch (err) {
                    setPopup({ type: 'error', message: (err as any)?.message || 'Failed to save description.' })
                }
            }, 2000) 
        }
    };

    const handleDescriptionBlur = async () => {
        setDescriptionOutline('rgba(47, 46, 54, 0.5)'); 
        try {
            if (!user || !changed(user.description, userData?.description)) return
            await updateProfile({ description: userData?.description ?? '' } as any)
            setPopup({ type: 'confirmation', message: 'Description updated.' })
        } catch (err: any) {
            setPopup({ type: 'error', message: err?.message || 'Failed to save description.' })
        }
    };


    const handlePictureSelection = async (id: number) => {
        const path = `/images/avatar/${id + 1}.png`
        try {
            await updateProfile({ pfp_path: path } as any)
            setSelectedPictureId(id)
            setUserData(prev => {
                const next: Partial<User> = {
                    ...prev,
                    pfp_path: path
                }
                return next
            })
            setPopup({ type: 'confirmation', message: 'Profile picture updated.' })
        } catch (e: any) {
            setPopup({ type: 'error', message: e?.message || 'Failed to update profile picture.' })
        }
    };

    const getDisplayedPicture = () => {
        if (selectedPictureId !== null) {
            return pictures[selectedPictureId];
        }
        if (userData?.pfp_path) {
            const match = userData?.pfp_path.match(/^\/images\/avatar\/([1-9]|1[0-6])\.png$/);
            if (match) {
                const id = parseInt(match[1], 10) - 1; 
                return pictures[id];
            }
        }
        return 'src/assets/images/profile-picture.png'; 
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'new' | 'confirm') => {
        const value = e.target.value;
        if (type === 'new') {
            setNewPassword(value);
            validatePassword(value);
        } else {
            setConfirmNewPassword(value);
        }
    };

    const validatePassword = (password: string) => {
        const passwordPolicy = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        setIsPasswordValid(passwordPolicy.test(password));
    };

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^[a-zA-Z0-9_]*$/.test(value) && value.length <= maxUsernameLength) {
            setUserData(prev=> {
                const next: Partial<User> = {
                    ...prev,
                    nickname: value
                }
                return next
            });
        }
    };

    const handleUsernameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleUsernameSave(); 
        }
    };

    const handleUsernameSave = async () => {
        // only persist if changed
        if (user && (user.nickname || '').trim() === (userData?.nickname ?? '').trim()) {
            setIsEditingUsername(false)
            setUsernameError(false)
            return
        }
        try {
            await updateProfile({ nickname: (userData?.nickname ?? '').trim() } as any)
            setIsEditingUsername(false)
            setUsernameError(false)
            setPopup({ type: 'confirmation', message: 'Username updated.' })
        } catch (e: any) {
            setUsernameError(true);
            const statusCode = e?.response?.status || e?.status || e?.code; // Check multiple possible locations for the status code
            if (statusCode === 422) {
                setPopup({ type: 'error', message: 'String should have at least 3 characters.' });
            } else if (statusCode === 400) {
                setPopup({ type: 'error', message: 'Username is already taken.' });
            } else {
                setPopup({ type: 'error', message: e?.message || 'Failed to update username.' });
            }
        }
    };

    const handleAccountDeletion = async () => {
        if (deleteConfirmation !== 'delete') {
            alert('Please type "delete" to confirm.')
            return
        }
        try {
            await deleteAccount()
            setPopup({ type: 'confirmation', message: 'Account deleted successfully!' })
            setShowDeleteModal(false)
            setDeleteConfirmation('')
        } catch (e: any) {
            setPopup({ type: 'error', message: e?.message || 'Failed to delete account. Please try again.' })
        }
    };

    const handlePasswordReset = async () => {
        if (!(newPassword && confirmNewPassword && isPasswordValid && newPassword === confirmNewPassword)) {
            setPopup({ type: 'error', message: 'Passwords do not match or are invalid.' })
            return
        }
        try {
            await updateProfile({ password: newPassword } as any)
            setPopup({ type: 'confirmation', message: 'Password updated successfully!' })
            setNewPassword('')
            setConfirmNewPassword('')
        } catch (e: any) {
            setPopup({ type: 'error', message: e?.message || 'Failed to update password. Please try again.' })
        }
    };

    const isResetEnabled = newPassword && confirmNewPassword && isPasswordValid && newPassword === confirmNewPassword;

    const isFirstPasswordInvalid = !isPasswordValid; 
    const isSecondPasswordInvalid = isFirstPasswordInvalid || (confirmNewPassword && confirmNewPassword !== newPassword); 

    return (
        <main className="content-section flex flex-col items-center justify-center px-0 md:px-16 py-16 gap-8 text-headline font-sans h-full">
            {/* Two Columns Layout */}
            <div className="flex flex-col lg:flex-row justify-between items-center w-full max-w-6xl gap-8 h-full mx-auto">
                <div className="flex flex-col items-center w-4/5 lg:w-1/2 gap-6">
                    {/* Big Profile Picture */}
                    <div className="w-64 h-64 rounded-full bg-gray-400 flex items-center justify-center relative">
                        <img
                            src={getDisplayedPicture()}
                            alt="Profile Picture"
                            className="w-60 h-60 rounded-full"
                        />
                    </div>

                    {/* Username */}
                    <div className="flex items-center gap-4 text-lg font-normal">
                        <img
                            src="src/assets/icons/user.png"
                            alt="User Icon"
                            className="w-6 h-6"
                        />
                        {isEditingUsername ? (
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={userData?.nickname}
                                    onChange={handleUsernameChange}
                                    onKeyDown={handleUsernameKeyDown} 
                                    className={`px-2 py-1 border rounded ${
                                        usernameError ? 'border-red-500' : 'border-gray-400'
                                    }`}
                                />
                                <button
                                    onClick={handleUsernameSave}
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
                                {userData?.nickname}
                            </span>
                        )}
                        {!isEditingUsername && (
                            <img
                                src="src/assets/icons/edit.png"
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
                            value={userData?.description}
                            rows={3}
                            onChange={handleDescriptionChange}
                            onBlur={handleDescriptionBlur} 
                            className="input px-[20px] py-[17px] text-s rounded-[20px] w-full focus:outline-none placeholder:text-headline/25 text-headline"
                            style={{
                                backgroundColor: 'rgba(47, 46, 54, 0.1)',
                                border: `3px solid ${descriptionOutline}`, 
                                resize: 'none', 
                                whiteSpace: 'pre-wrap', 
                                overflowWrap: 'break-word',
                            }}
                        ></textarea>
                        {/* Character Counter */}
                        <div className="flex justify-between w-full mt-2">
                            <div></div> 
                            <div className="text-xs text-paragraph">
                                {maxChars - (userData?.description?.length || 0)} characters left
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
                                onClick={() => handlePictureSelection(index)}
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
                            type={isNewPasswordVisible ? 'text' : 'password'} 
                            placeholder="Enter new password"
                            value={newPassword}
                            onChange={(e) => handlePasswordChange(e, 'new')}
                            className={`input px-[15px] py-[12px] text-s rounded-[40px] w-full focus:outline-none placeholder:text-headline/25 ${
                                isFirstPasswordInvalid ? 'border-red-500' : 'border-[#FF8906]'
                            }`}
                            style={{
                                backgroundColor: '#0F0E17',
                                borderWidth: '2px',
                                color: '#FFFFFE',
                            }}
                        />
                        <img
                            src={isNewPasswordVisible ? 'src/assets/icons/eye-off.png' : 'src/assets/icons/eye.png'} 
                            alt="Toggle Password Visibility"
                            className="absolute right-4 top-11 transform -translate-y-1/2 w-6 h-6 cursor-pointer"
                            style={handlePasswordIconStyle} 
                            onMouseDown={() => handlePasswordVisibility('new', true)} 
                            onMouseUp={() => handlePasswordVisibility('new', false)} 
                            onMouseLeave={() => handlePasswordVisibility('new', false)} 
                        />
                    </div>

                    {/* Confirm New Password */}
                    <div className="input flex flex-col w-full relative">
                        <label
                            htmlFor="confirm-new-password"
                            className="text-headline text-sm font-semibold relative top-3 ml-[20px] px-[3px] bg-background w-fit"
                        >
                            confirm new password
                        </label>
                        <input
                            id="confirm-new-password"
                            type={isConfirmNewPasswordVisible ? 'text' : 'password'} 
                            placeholder="Confirm new password"
                            value={confirmNewPassword}
                            onChange={(e) => handlePasswordChange(e, 'confirm')}
                            className={`input px-[15px] py-[12px] text-s rounded-[40px] w-full focus:outline-none placeholder:text-headline/25 ${
                                isSecondPasswordInvalid ? 'border-red-500' : 'border-[#FF8906]'
                            }`}
                            style={{
                                backgroundColor: '#0F0E17',
                                borderWidth: '2px',
                                color: '#FFFFFE',
                            }}
                        />
                        <img
                            src={isConfirmNewPasswordVisible ? 'src/assets/icons/eye-off.png' : 'src/assets/icons/eye.png'} 
                            alt="Toggle Password Visibility"
                            className="absolute right-4 top-11 transform -translate-y-1/2 w-6 h-6 cursor-pointer"
                            style={handlePasswordIconStyle} 
                            onMouseDown={() => handlePasswordVisibility('confirm', true)} 
                            onMouseUp={() => handlePasswordVisibility('confirm', false)} 
                            onMouseLeave={() => handlePasswordVisibility('confirm', false)} 
                        />
                    </div>

                    {/* Password Hint */}
                    <div className="text-xs mt-1 text-paragraph">
                        Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, and a number.
                    </div>
                </div>
                {/* Reset Button */}
                <button
                    className={`font-bold py-2 px-6 rounded-[10px] w-[150px] transition-all duration-300 ${
                        isResetEnabled
                            ? 'bg-highlight text-stroke hover:bg-highlight/90 hover:scale-105 cursor-pointer'
                            : 'bg-highlight/35 text-stroke cursor-not-allowed'
                    }`}
                    disabled={!isResetEnabled}
                    onClick={handlePasswordReset}
                >
                    RESET
                </button>

                {/* Email Address */}
                <div className="text-highlight text-lg font-bold pt-[25px]">
                    e-mail address <span className="text-headline/35 font-normal pl-[20px]">{userData?.email}</span>
                </div>

                {/* Delete Account Button */}
                <button
                    className="border-2 border-attention/70 text-attention/70 font-bold py-2 px-6 rounded-[20px] w-[200px] transition-all duration-300 hover:bg-attention/70 hover:text-white hover:scale-105"
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
                            outline: '2px solid var(--color-highlight)',
                        }}
                        onClick={(e) => e.stopPropagation()}
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
                                onClick={handleAccountDeletion}
                                disabled={deleteConfirmation !== 'delete'} 
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

            {/* Error Popup */}
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

export default ProfileScreen;







