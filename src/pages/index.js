import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDarkMode } from '../hooks/useDarkMode';
import LoginButton from '../components/LoginButton';
import PlaylistCard from '../components/PlaylistCard';
import { Moon, Sun, Music } from 'lucide-react';

export default function Home() {
  const { isAuthenticated, playlists, loading, logout } = useAuth();
  const { isDark, toggleDarkMode } = useDarkMode();
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className={`max-w-md w-full mx-4 p-8 rounded-2xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Music className="w-8 h-8 text-white" />
            </div>
            <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              My Playlists
            </h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              YouTube playlist'lerinizi yönetin
            </p>
          </div>

          <LoginButton isDark={isDark} />

          <button
            onClick={toggleDarkMode}
            className={`mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-lg border transition-colors ${
              isDark ? 'border-gray-700 hover:bg-gray-700 text-gray-400' : 'border-gray-200 hover:bg-gray-50 text-gray-600'
            }`}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Left Sidebar */}
      <div className={`w-64 flex-shrink-0 ${isDark ? 'bg-gray-800' : 'bg-white'} border-r ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6 pb-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Music className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>My Playlists</h2>
              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{playlists.length} playlist</p>
            </div>
          </div>

          {/* Playlists */}
          <div className="space-y-1">
            {playlists.map((playlist) => (
              <button
                key={playlist.id}
                onClick={() => setSelectedPlaylist(playlist)}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-all text-sm ${
                  selectedPlaylist?.id === playlist.id
                    ? 'bg-blue-500 text-white font-medium'
                    : isDark
                    ? 'hover:bg-gray-700 text-gray-300'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <div className="truncate font-medium">{playlist.snippet?.title || 'Playlist'}</div>
                <div className={`text-xs mt-0.5 ${selectedPlaylist?.id === playlist.id ? 'text-blue-100' : isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  {playlist.contentDetails?.itemCount || 0} video
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} px-6 py-4`}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {selectedPlaylist ? selectedPlaylist.snippet?.title : 'Playlist seçiniz'}
              </h1>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {selectedPlaylist ? `${selectedPlaylist.contentDetails?.itemCount || 0} video` : 'Sol menüden bir playlist seçin'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <button
                onClick={logout}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-colors"
              >
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {selectedPlaylist ? (
            <PlaylistCard playlist={selectedPlaylist} isDark={isDark} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Music className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-700' : 'text-gray-300'}`} />
                <p className={`text-lg ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Bir playlist seçin</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
