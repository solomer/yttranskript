import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('youtube_access_token');
    const storedPlaylists = localStorage.getItem('youtube_playlists');

    if (storedToken) setAccessToken(storedToken);
    if (storedPlaylists) {
      try {
        setPlaylists(JSON.parse(storedPlaylists));
      } catch (e) {}
    }

    setLoading(false);
  }, []);

  const login = (token, playlistsData) => {
    setAccessToken(token);
    setPlaylists(playlistsData);
    localStorage.setItem('youtube_access_token', token);
    localStorage.setItem('youtube_playlists', JSON.stringify(playlistsData));
  };

  const logout = () => {
    setAccessToken(null);
    setPlaylists([]);
    localStorage.removeItem('youtube_access_token');
    localStorage.removeItem('youtube_playlists');
  };

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        playlists,
        loading,
        login,
        logout,
        isAuthenticated: !!accessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
