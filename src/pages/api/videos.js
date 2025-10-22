export default async function handler(req, res) {
  const { playlistId, accessToken } = req.query;

  if (!playlistId || !accessToken) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const data = await response.json();
    res.status(200).json({ items: data.items || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
