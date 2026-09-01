import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  try {
    const cookies = req.headers.cookie || '';
    const match = cookies.match(/__session=([^;]+)/);
    const sessionToken = match ? decodeURIComponent(match[1]) : null;

    if (!sessionToken) {
      return res.status(200).json({
        authenticated: false,
        user: null,
        message: 'No active session cookie found. User is guest.'
      });
    }

    try {
      const parsed = JSON.parse(sessionToken);
      return res.status(200).json({
        authenticated: true,
        user: parsed
      });
    } catch {
      return res.status(200).json({
        authenticated: true,
        tokenPresent: true
      });
    }
  } catch (error: any) {
    return res.status(500).json({
      error: 'Failed to verify session',
      details: error?.message || 'Internal server error'
    });
  }
}
