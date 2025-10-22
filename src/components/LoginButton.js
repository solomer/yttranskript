import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn } from 'lucide-react';

export default function LoginButton({ isDark }) {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const handleLogin = () => {
    if (loading) return;

    setLoading(true);
    setStatus('Google OAuth penceresi açılıyor...');

    const popup = window.open(
      '/api/auth/authorize',
      'google_oauth',
      'width=500,height=600,scrollbars=yes,resizable=yes'
    );

    if (!popup) {
      setStatus('❌ Popup engellendi!');
      setLoading(false);
      return;
    }

    const handleMessage = (event) => {
      const { type, playlists, accessToken, error } = event.data;

      if (type === 'youtube-playlists') {
        setStatus('✅ Giriş başarılı!');
        login(accessToken, playlists);
        setLoading(false);
        window.removeEventListener('message', handleMessage);
      } else if (type === 'oauth-error') {
        setStatus(`❌ Hata: ${error}`);
        setLoading(false);
        window.removeEventListener('message', handleMessage);
      }
    };

    window.addEventListener('message', handleMessage);

    const checkPopup = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkPopup);
        if (loading) {
          setStatus('❌ Giriş iptal edildi');
          setLoading(false);
          window.removeEventListener('message', handleMessage);
        }
      }
    }, 1000);
  };

  return (
    <div>
      <button
        onClick={handleLogin}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        <LogIn className="w-5 h-5" />
        {loading ? 'Yükleniyor...' : 'Google ile Giriş Yap'}
      </button>

      {status && (
        <div className={`mt-4 p-3 rounded-lg text-sm ${
          status.includes('✅')
            ? 'bg-green-100 text-green-800 border border-green-300'
            : status.includes('❌')
            ? 'bg-red-100 text-red-800 border border-red-300'
            : 'bg-blue-100 text-blue-800 border border-blue-300'
        }`}>
          {status}
        </div>
      )}
    </div>
  );
}
