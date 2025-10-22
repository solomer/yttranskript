export default async function handler(req, res) {
  const { code, error } = req.query;

  if (error) {
    return res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'oauth-error', error: '${error}' }, '*');
              window.close();
            }
          </script>
        </body>
      </html>
    `);
  }

  if (!code) {
    return res.status(400).json({ error: 'Missing authorization code' });
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Fetch playlists
    const playlistsResponse = await fetch(
      'https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&mine=true&maxResults=50',
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const playlistsData = await playlistsResponse.json();

    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <body>
          <script>
            const playlists = ${JSON.stringify(playlistsData.items || [])};
            const accessToken = '${accessToken}';

            if (window.opener) {
              window.opener.postMessage({
                type: 'youtube-playlists',
                playlists,
                accessToken
              }, '*');
              setTimeout(() => window.close(), 500);
            }
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({
                type: 'oauth-error',
                error: '${error.message}'
              }, '*');
              window.close();
            }
          </script>
        </body>
      </html>
    `);
  }
}
