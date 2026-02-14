/**
 * Utility to clean up shared profile images and migrate to student-specific keys
 */

export const cleanupSharedProfileImages = () => {
    try {
        // Check if there's a shared profileImage
        const sharedProfileImage = localStorage.getItem('profileImage');
        
        if (sharedProfileImage) {
            // Get current student ID
            const currentStudentId = localStorage.getItem('idNumber');
            
            if (currentStudentId) {
                // Migrate the shared image to student-specific key
                localStorage.setItem(`profileImage_${currentStudentId}`, sharedProfileImage);
                console.log(`✅ Migrated shared profile image to student-specific key: profileImage_${currentStudentId}`);
                
                // Remove the shared key
                localStorage.removeItem('profileImage');
                console.log('✅ Removed shared profileImage key');
            }
        }
        
        // Clean up any old role-based keys
        const keysToClean = ['studentProfilePic', 'registrarProfilePic', 'accountingProfilePic'];
        keysToClean.forEach(key => {
            if (localStorage.getItem(key)) {
                localStorage.removeItem(key);
                console.log(`✅ Cleaned up old key: ${key}`);
            }
        });
        
        // Clean up invalid profile images
        const currentStudentId = localStorage.getItem('idNumber');
        if (currentStudentId) {
            const profileImage = localStorage.getItem(`profileImage_${currentStudentId}`);
            if (profileImage && !(profileImage.startsWith('http') || profileImage.startsWith('data:image') || profileImage.startsWith('/api/'))) {
                localStorage.removeItem(`profileImage_${currentStudentId}`);
                console.log(`✅ Removed invalid profile image for student: ${currentStudentId}`);
            }
        }
        
        console.log('🎉 Profile image cleanup completed successfully!');
        
    } catch (error) {
        console.error('❌ Error during profile image cleanup:', error);
    }
};

export const getStudentProfileImage = (studentId) => {
    if (!studentId) return null;
    
    const profileImage = localStorage.getItem(`profileImage_${studentId}`);
    
    // Only return the image if it's a valid URL or data URL
    if (profileImage && (profileImage.startsWith('http') || profileImage.startsWith('data:image') || profileImage.startsWith('/api/') || profileImage.startsWith('/uploads/'))) {
        return profileImage;
    }
    
    // Return null for invalid or empty images
    return null;
};

export const clearAllProfileImages = () => {
    try {
        // Get all localStorage keys
        const keys = Object.keys(localStorage);
        
        // Find and remove all profile image keys
        keys.forEach(key => {
            if (key.startsWith('profileImage_') || key === 'profileImage' || key === 'studentProfilePic' || key === 'registrarProfilePic' || key === 'accountingProfilePic') {
                localStorage.removeItem(key);
            }
        });
        
        return true;
    } catch (error) {
        console.error('❌ Error clearing profile images:', error);
        return false;
    }
};

export const setStudentProfileImage = (studentId, imageData) => {
    if (!studentId) return false;
    try {
        localStorage.setItem(`profileImage_${studentId}`, imageData);
        return true;
    } catch (error) {
        console.error('Error setting student profile image:', error);
        return false;
    }
};
