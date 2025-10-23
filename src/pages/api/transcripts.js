export default async function handler(req, res) {
  const { videoId } = req.query;

  console.log('Supadata API called with videoId:', videoId);

  if (!videoId) {
    return res.status(400).json({ error: 'Missing videoId' });
  }

  try {
    console.log('Attempting to fetch transcript via Supadata for:', videoId);
    
    // Supadata.ai ile transkript al
    console.log('API Key exists:', !!process.env.SUPADATA_API_KEY);
    console.log('Request URL:', `https://www.youtube.com/watch?v=${videoId}`);
    
    // Supadata.ai ile transkript al (GET request)
    const response = await fetch(`https://api.supadata.ai/v1/youtube/transcript?url=https://www.youtube.com/watch?v=${videoId}`, {
      method: 'GET',
      headers: {
        'x-api-key': process.env.SUPADATA_API_KEY
      }
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.log('Error response:', errorText);
      throw new Error(`Supadata API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Supadata response:', data);

    if (!data.content || data.content.length === 0) {
      return res.status(404).json({
        error: 'Bu videoda transkript bulunamadı',
        details: 'No transcript available',
        videoId: videoId,
        suggestion: 'Video sahibi transkripti kapatmış olabilir'
      });
    }

    // Transkript metnini birleştir
    const fullText = data.content.map(item => item.text).join(' ');
    console.log('Transcript text length:', fullText.length);

    res.status(200).json({
      videoId,
      transcript: fullText,
      items: data.content,
      success: true,
      message: 'Transkript başarıyla alındı!'
    });
  } catch (error) {
    console.error('Transcript error details:', {
      message: error.message,
      stack: error.stack,
      videoId: videoId
    });
    
    // Farklı hata türleri için özel mesajlar
    let errorMessage = 'Transcript alınamadı';
    let statusCode = 500;
    
    if (error.message.includes('Transcript is disabled')) {
      errorMessage = 'Bu videoda transkript özelliği kapalı';
      statusCode = 404; // Not Found - daha uygun
    } else if (error.message.includes('Video unavailable')) {
      errorMessage = 'Video bulunamadı veya gizli';
      statusCode = 404;
    } else if (error.message.includes('Private video')) {
      errorMessage = 'Bu video özel/gizli';
      statusCode = 403;
    }
    
    res.status(statusCode).json({
      error: errorMessage,
      details: error.message,
      videoId: videoId,
      suggestion: 'Başka bir video deneyin'
    });
  }
}