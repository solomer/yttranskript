export default async function handler(req, res) {
  // Sadece POST isteklerini kabul et
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { transcript, level } = req.body;

  // Gerekli parametreleri kontrol et
  if (!transcript || !level) {
    return res.status(400).json({ 
      error: 'Missing required parameters',
      details: 'transcript and level are required'
    });
  }

  // Level değerini kontrol et
  if (!['short', 'medium', 'long'].includes(level)) {
    return res.status(400).json({ 
      error: 'Invalid level',
      details: 'level must be one of: short, medium, long'
    });
  }

  // API key kontrolü
  if (!process.env.OPENROUTER_API_KEY) {
    return res.status(500).json({ 
      error: 'OpenRouter API key not configured',
      details: 'OPENROUTER_API_KEY environment variable is missing'
    });
  }

  try {
    // Özet uzunluğuna göre prompt belirle
    const prompts = {
      short: 'Bu transkripti çok kısa ve öz bir şekilde özetle. Sadece ana noktaları 2-3 cümle halinde ver.',
      medium: 'Bu transkripti orta uzunlukta özetle. Ana konuları ve önemli detayları içeren dengeli bir özet hazırla.',
      long: 'Bu transkripti detaylı bir şekilde özetle. Tüm önemli noktaları, alt konuları ve detayları içeren kapsamlı bir özet hazırla.'
    };

    const prompt = prompts[level];

    console.log('OpenRouter API çağrısı yapılıyor...', {
      level,
      transcriptLength: transcript.length,
      promptLength: prompt.length
    });

    // OpenRouter API'ye istek gönder
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://kayaomerr.com',
        'X-Title': 'YT Transcript Summarizer'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Sen bir YouTube video transkript özetleme uzmanısın. Verilen transkripti Türkçe olarak özetle.'
          },
          {
            role: 'user',
            content: `${prompt}\n\nTranskript:\n${transcript}`
          }
        ],
        max_tokens: level === 'short' ? 200 : level === 'medium' ? 500 : 1000,
        temperature: 0.7
      })
    });

    console.log('OpenRouter response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', errorText);
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('OpenRouter response:', data);

    // API yanıtını kontrol et
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response from OpenRouter API');
    }

    const summary = data.choices[0].message.content.trim();

    // Başarılı yanıt döndür
    res.status(200).json({
      summary,
      level,
      success: true,
      message: 'Özet başarıyla oluşturuldu!'
    });

  } catch (error) {
    console.error('Summarize error details:', {
      message: error.message,
      stack: error.stack,
      level,
      transcriptLength: transcript.length
    });

    // Hata yanıtı döndür
    res.status(500).json({
      error: 'Özet oluşturulamadı',
      details: error.message,
      suggestion: 'Lütfen tekrar deneyin'
    });
  }
}
