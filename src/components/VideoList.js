import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Play, Copy, FileText, ExternalLink, Loader2 } from 'lucide-react';

export default function VideoList({ playlistId, isDark }) {
  const { accessToken } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transcripts, setTranscripts] = useState({});
  const [loadingTranscripts, setLoadingTranscripts] = useState({});

  useEffect(() => {
    if (!playlistId || !accessToken) return;

    const fetchVideos = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/videos?playlistId=${playlistId}&accessToken=${accessToken}`);
        const data = await response.json();
        setVideos(data.items || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [playlistId, accessToken]);

  const fetchTranscript = async (videoId) => {
    setLoadingTranscripts(prev => ({ ...prev, [videoId]: true }));

    try {
      const response = await fetch(`/api/transcripts?videoId=${videoId}`);
      const data = await response.json();

      if (data.error) {
        setTranscripts(prev => ({ ...prev, [videoId]: { error: data.error } }));
      } else {
        setTranscripts(prev => ({ ...prev, [videoId]: data.transcript }));
      }
    } catch (err) {
      setTranscripts(prev => ({ ...prev, [videoId]: { error: err.message } }));
    } finally {
      setLoadingTranscripts(prev => ({ ...prev, [videoId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className={`w-12 h-12 animate-spin mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Videolar yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 rounded-lg text-center ${isDark ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-600'}`}>
        ❌ Hata: {error}
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className={`p-12 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <Play className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
        <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Bu playlist'te video yok.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {videos.map((video, index) => {
        const videoId = video.snippet?.resourceId?.videoId;
        const title = video.snippet?.title || 'Başlıksız Video';
        const thumbnail = video.snippet?.thumbnails?.medium?.url || video.snippet?.thumbnails?.default?.url;
        const videoUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : '#';

        return (
          <div
            key={videoId || index}
            className={`rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 ${
              isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'
            }`}
          >
            <div className="flex gap-4 p-4">
              {thumbnail && (
                <div className="flex-shrink-0">
                  <img src={thumbnail} alt={title} className="w-40 h-24 object-cover rounded-lg" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold mb-3 line-clamp-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {title}
                </h3>

                <div className="flex flex-wrap gap-2">
                  <a
                    href={videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    YouTube
                  </a>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(videoUrl);
                      alert('Link kopyalandı!');
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    <Copy className="w-4 h-4" />
                    Kopyala
                  </button>

                  <button
                    onClick={() => fetchTranscript(videoId)}
                    disabled={loadingTranscripts[videoId]}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                  >
                    {loadingTranscripts[videoId] ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Alınıyor...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4" />
                        Transcript Al
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {transcripts[videoId] && (
              <div className={`border-t p-4 ${isDark ? 'bg-blue-900/20 border-gray-700' : 'bg-blue-50 border-blue-200'}`}>
                {transcripts[videoId].error ? (
                  <p className={`text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                    ❌ {transcripts[videoId].error}
                  </p>
                ) : (
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <FileText className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                        <strong className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-900'}`}>Transcript:</strong>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(transcripts[videoId]);
                          alert('Transcript kopyalandı!');
                        }}
                        className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors ${
                          isDark ? 'bg-blue-800 hover:bg-blue-700 text-blue-200' : 'bg-blue-200 hover:bg-blue-300 text-blue-800'
                        }`}
                      >
                        <Copy className="w-3 h-3" />
                        Kopyala
                      </button>
                    </div>
                    <div className={`text-sm leading-relaxed max-h-60 overflow-y-auto p-3 rounded-lg ${
                      isDark ? 'bg-gray-900/50 text-gray-300' : 'bg-white text-gray-700'
                    }`}>
                      {transcripts[videoId]}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
