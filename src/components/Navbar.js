import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, logout, playlists } = useAuth();

  return (
    <nav>
      <div className="container">
        <h1>🎵 YouTube Playlist Manager</h1>

        {isAuthenticated && (
          <div className="nav-right">
            <span>📋 {playlists.length} playlist</span>
            <button className="secondary small" onClick={logout}>
              🚪 Çıkış Yap
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
