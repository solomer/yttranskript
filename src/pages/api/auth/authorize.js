export default function handler(req, res) {
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');

  authUrl.searchParams.set('client_id', process.env.GOOGLE_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'https://www.googleapis.com/auth/youtube.readonly');
  authUrl.searchParams.set('access_type', 'offline');
  authUrl.searchParams.set('prompt', 'consent');

  res.redirect(authUrl.toString());
}
