export const saveDescription = async (description: string, setPopup: (popup: any) => void) => {
    try {
        const response = await fetch('http://127.0.0.1:8000/v1/users/me', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ description }),
        });

        if (response.ok) {
            console.log('Description saved successfully');
        } else {
            console.error('Failed to save description:', response.statusText);
            setPopup({ type: 'error', message: 'Failed to save description. Please try again.' });
        }
    } catch (error) {
        console.error('Error saving description:', error);
        setPopup({ type: 'error', message: 'Failed to save description. Please try again.' });
    }
};

export const saveUsername = async (
    username: string,
    setPopup: (popup: any) => void,
    setIsEditingUsername: (isEditing: boolean) => void,
    setUsernameError: (error: boolean) => void
) => {
    try {
        const response = await fetch('http://127.0.0.1:8000/v1/users/me', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ nickname: username }),
        });

        if (response.ok) {
            console.log('Username updated successfully');
            setIsEditingUsername(false);
            setUsernameError(false);
        } else {
            setUsernameError(true);
            if (response.status === 400) {
                setPopup({ type: 'error', message: 'This username is already occupied. Please choose another one.' });
            } else if (response.status === 422) {
                setPopup({ type: 'error', message: 'Username is too short. Minimum 3 characters required.' });
            } else {
                setPopup({ type: 'error', message: 'Failed to update username. Please try again.' });
            }
            setTimeout(() => setUsernameError(false), 1000);
        }
    } catch (error) {
        console.error('Error updating username:', error);
        setUsernameError(true);
        setPopup({ type: 'error', message: 'Failed to update username. Please try again.' });
        setTimeout(() => setUsernameError(false), 1000);
    }
};

export const handlePictureSelect = async (
    id: number,
    setSelectedPictureId: (id: number) => void,
    setProfilePicturePath: (path: string) => void,
    setPopup: (popup: any) => void
) => {
    setSelectedPictureId(id);

    const newProfilePicturePath = `/images/avatar/${id + 1}.png`;

    try {
        const response = await fetch('http://127.0.0.1:8000/v1/users/me', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ pfp_path: newProfilePicturePath }),
        });

        if (response.ok) {
            console.log('Profile picture updated successfully');
            setProfilePicturePath(newProfilePicturePath);
        } else {
            console.error('Failed to update profile picture:', response.statusText);
            setPopup({ type: 'error', message: 'Failed to update profile picture. Please try again.' });
        }
    } catch (error) {
        console.error('Error updating profile picture:', error);
        setPopup({ type: 'error', message: 'Failed to update profile picture. Please try again.' });
    }
};

export const fetchUserData = async (
    setUsername: (username: string) => void,
    setEmail: (email: string) => void,
    setDescription: (description: string) => void,
    setProfilePicturePath: (path: string | null) => void,
    setSelectedPictureId: (id: number | null) => void,
    setPopup: (popup: any) => void
) => {
    try {
        const response = await fetch('http://127.0.0.1:8000/v1/users/me', {
            method: 'GET',
            headers: {
                'accept': 'application/json',
            },
            credentials: 'include',
        });

        if (response.ok) {
            const data = await response.json();
            console.log('User data fetched:', data);
            setUsername(data.nickname);
            setEmail(data.email);
            setDescription(data.description || '');
            setProfilePicturePath(data.pfp_path || null);

            if (data.pfp_path) {
                const match = data.pfp_path.match(/^\/images\/avatar\/([1-9]|1[0-6])\.png$/);
                if (match) {
                    setSelectedPictureId(parseInt(match[1], 10) - 1);
                }
            }
        } else {
            console.error('Failed to fetch user data:', response.statusText);
            setPopup({ type: 'error', message: 'Failed to fetch user data. Please try again.' });
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        setPopup({ type: 'error', message: 'Error fetching user data. Please try again.' });
    }
};

export const handleDeleteAccount = async (
    deleteConfirmation: string,
    setPopup: (popup: any) => void,
    setShowDeleteModal: (show: boolean) => void,
    setDeleteConfirmation: (confirmation: string) => void,
    navigate: (path: string) => void
) => {
    if (deleteConfirmation === 'delete') {
        try {
            const response = await fetch('http://127.0.0.1:8000/v1/users/me', {
                method: 'DELETE',
                headers: {
                    'accept': 'application/json',
                },
                credentials: 'include',
            });

            if (response.ok) {
                console.log('Account deleted successfully');
                setPopup({ type: 'confirmation', message: 'Account deleted successfully!' });
                setShowDeleteModal(false);
                setDeleteConfirmation('');
                setTimeout(() => navigate('/'), 2000); // Redirect to home screen after 2 seconds
            } else {
                console.error('Failed to delete account:', response.statusText);
                setPopup({ type: 'error', message: 'Failed to delete account. Please try again.' });
            }
        } catch (error) {
            console.error('Error deleting account:', error);
            setPopup({ type: 'error', message: 'Failed to delete account. Please try again.' });
        }
    } else {
        alert('Please type "delete" to confirm.');
    }
};

export const handleResetPassword = async (
    newPassword: string,
    confirmNewPassword: string,
    isPasswordValid: boolean,
    setPopup: (popup: any) => void,
    setNewPassword: (password: string) => void,
    setConfirmNewPassword: (password: string) => void
) => {
    if (newPassword && confirmNewPassword && isPasswordValid && newPassword === confirmNewPassword) {
        try {
            const response = await fetch('http://127.0.0.1:8000/v1/users/me', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'accept': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ password: newPassword }),
            });

            if (response.ok) {
                console.log('Password updated successfully');
                setPopup({ type: 'confirmation', message: 'Password updated successfully!' });
                setNewPassword('');
                setConfirmNewPassword('');
            } else {
                console.error('Failed to update password:', response.statusText);
                setPopup({ type: 'error', message: 'Failed to update password. Please try again.' });
            }
        } catch (error) {
            console.error('Error updating password:', error);
            setPopup({ type: 'error', message: 'Failed to update password. Please try again.' });
        }
    } else {
        setPopup({ type: 'error', message: 'Passwords do not match or are invalid.' });
    }
};
