import { useState } from 'react';
import { FileText, Loader2, Sparkles } from 'lucide-react';

export default function Summarizer({ transcript, isDark }) {
  const [summaries, setSummaries] = useState({});
  const [loading, setLoading] = useState({});
  const [error, setError] = useState(null);

  const levels = [
    { key: 'short', label: 'Kısa', color: 'from-green-500 to-green-600' },
    { key: 'medium', label: 'Orta', color: 'from-blue-500 to-blue-600' },
    { key: 'long', label: 'Uzun', color: 'from-purple-500 to-purple-600' }
  ];

  const generateSummary = async (level) => {
    if (!transcript) {
      setError('Transkript bulunamadı');
      return;
    }

    setLoading(prev => ({ ...prev, [level]: true }));
    setError(null);

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript,
          level
        })
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setSummaries(prev => ({ ...prev, [level]: data.summary }));
      }
    } catch (err) {
      setError('Özet oluşturulurken hata oluştu: ' + err.message);
    } finally {
      setLoading(prev => ({ ...prev, [level]: false }));
    }
  };

  if (!transcript) {
    return null;
  }

  return (
    <div className={`mt-4 p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          AI Özetleme
        </h3>
      </div>

      {/* Butonlar */}
      <div className="flex flex-wrap gap-2 mb-4">
        {levels.map((level) => (
          <button
            key={level.key}
            onClick={() => generateSummary(level.key)}
            disabled={loading[level.key]}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 bg-gradient-to-r ${level.color} hover:opacity-90 text-white`}
          >
            {loading[level.key] ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Oluşturuluyor...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                {level.label} Özet
              </>
            )}
          </button>
        ))}
      </div>

      {/* Hata mesajı */}
      {error && (
        <div className={`p-3 rounded-lg mb-4 ${isDark ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'}`}>
          <div className="flex items-center gap-2">
            <span className="text-red-500">⚠️</span>
            <strong className={`text-sm ${isDark ? 'text-red-300' : 'text-red-800'}`}>
              Hata
            </strong>
          </div>
          <p className={`text-sm mt-1 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
            {error}
          </p>
        </div>
      )}

      {/* Özetler */}
      {Object.keys(summaries).length > 0 && (
        <div className="space-y-4">
          {levels.map((level) => {
            const summary = summaries[level.key];
            if (!summary) return null;

            return (
              <div
                key={level.key}
                className={`p-4 rounded-lg border ${isDark ? 'bg-gray-900/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${level.color}`}></div>
                  <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {level.label} Özet
                  </h4>
                </div>
                <div className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {summary}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bilgi notu */}
      <div className={`mt-4 p-3 rounded-lg ${isDark ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
        <p className={`text-xs ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
          💡 Özetler OpenAI GPT-4o-mini modeli ile oluşturulmaktadır. Farklı uzunluklarda özetler alarak içeriği daha iyi anlayabilirsiniz.
        </p>
      </div>
    </div>
  );
}
