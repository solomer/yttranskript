import { YoutubeTranscript } from 'youtube-transcript';

export default async function handler(req, res) {
  const { videoId } = req.query;

  if (!videoId) {
    return res.status(400).json({ error: 'Missing videoId' });
  }

  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);

    // Transcript'i tek string'e çevir
    const fullText = transcript.map(item => item.text).join(' ');

    res.status(200).json({
      videoId,
      transcript: fullText,
      items: transcript
    });
  } catch (error) {
    console.error('Transcript error:', error);
    res.status(500).json({
      error: 'Transcript bulunamadı veya video gizli/kısıtlı olabilir',
      details: error.message
    });
  }
}
