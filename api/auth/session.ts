import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Prevent any CDN/browser edge caching of session endpoints
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { idToken, profile } = req.body || {};

    if (!idToken && !profile) {
      return res.status(400).json({ error: 'Missing token or profile payload' });
    }

    // Set secure HTTP-only cookie for session isolation
    // Cookie flags: HttpOnly; Secure (in prod); SameSite=Lax; Path=/; Max-Age=14 days (1209600s)
    const tokenValue = encodeURIComponent(idToken || JSON.stringify(profile));
    const isProduction = process.env.NODE_ENV === 'production' || req.headers['x-forwarded-proto'] === 'https';
    const cookieString = `__session=${tokenValue}; Path=/; Max-Age=1209600; HttpOnly; SameSite=Lax${
      isProduction ? '; Secure' : ''
    }`;

    res.setHeader('Set-Cookie', cookieString);
    return res.status(200).json({
      success: true,
      message: 'Session established with HTTP-only cookie isolation'
    });
  } catch (error: any) {
    return res.status(500).json({
      error: 'Session creation failed',
      details: error?.message || 'Internal server error'
    });
  }
}
