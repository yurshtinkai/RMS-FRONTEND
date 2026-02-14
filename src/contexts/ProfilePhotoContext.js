import React, { createContext, useContext, useState, useEffect } from 'react';

const ProfilePhotoContext = createContext();

export const useProfilePhoto = () => {
    const context = useContext(ProfilePhotoContext);
    if (!context) {
        throw new Error('useProfilePhoto must be used within a ProfilePhotoProvider');
    }
    return context;
};

export const ProfilePhotoProvider = ({ children }) => {
    const [profilePic, setProfilePic] = useState(() => {
        // Initialize from localStorage on mount
        const cachedProfilePic = localStorage.getItem('registrarProfilePic');
        return cachedProfilePic || null;
    });

    const [profilePicUpdated, setProfilePicUpdated] = useState(false);

    // Load profile photo from server on mount
    useEffect(() => {
        const loadProfilePhotoFromServer = async () => {
            try {
                const { API_BASE_URL, getSessionToken } = await import('../utils/api');
                const sessionToken = getSessionToken();
                
                if (!sessionToken) return;

                const response = await fetch(`${API_BASE_URL}/registrar-photos/profile`, {
                    headers: { 'X-Session-Token': sessionToken }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.profilePhoto) {
                        const fullPhotoUrl = data.profilePhoto.startsWith('http') 
                            ? data.profilePhoto 
                            : `${API_BASE_URL}${data.profilePhoto}`;
                        updateProfilePhoto(fullPhotoUrl);
                    }
                }
            } catch (error) {
                console.error('Error loading profile photo from server:', error);
            }
        };

        loadProfilePhotoFromServer();
    }, []);

    // Function to update profile photo
    const updateProfilePhoto = (newPhotoUrl) => {
        setProfilePic(newPhotoUrl);
        setProfilePicUpdated(true);
        
        // Cache in localStorage
        if (newPhotoUrl) {
            localStorage.setItem('registrarProfilePic', newPhotoUrl);
        } else {
            localStorage.removeItem('registrarProfilePic');
        }
    };

    // Function to clear the update flag (used by components that have processed the update)
    const clearProfilePicUpdateFlag = () => {
        setProfilePicUpdated(false);
    };

    // Function to refresh profile photo from server
    const refreshProfilePhoto = async () => {
        try {
            const { API_BASE_URL, getSessionToken } = await import('../utils/api');
            const sessionToken = getSessionToken();
            
            if (!sessionToken) return;

            const response = await fetch(`${API_BASE_URL}/registrar-photos/get`, {
                headers: { 'X-Session-Token': sessionToken }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.photoUrl) {
                    updateProfilePhoto(data.photoUrl);
                }
            }
        } catch (error) {
            console.error('Error refreshing profile photo:', error);
        }
    };

    return (
        <ProfilePhotoContext.Provider value={{ 
            profilePic, 
            updateProfilePhoto, 
            profilePicUpdated, 
            clearProfilePicUpdateFlag,
            refreshProfilePhoto 
        }}>
            {children}
        </ProfilePhotoContext.Provider>
    );
};
