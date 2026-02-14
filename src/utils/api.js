// const getApiUrl = () => {
//   if (process.env.NODE_ENV === 'production') {
//     return 'https://registrar-rms-backend.onrender.com/api';
//   }
//   return process.env.REACT_APP_API_URL
//     ? `${process.env.REACT_APP_API_URL}/api`
//     : 'http://localhost:5000/api';
// };

// export const API_BASE_URL = getApiUrl();

export const API_BASE_URL = 'http://localhost:5000/api';

export const getSessionToken = () => localStorage.getItem('sessionToken');
export const getUserRole = () => localStorage.getItem('userRole');
