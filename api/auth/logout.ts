import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  try {
    const isProduction = process.env.NODE_ENV === 'production' || req.headers['x-forwarded-proto'] === 'https';
    const clearCookie = `__session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax${
      isProduction ? '; Secure' : ''
    }`;

    res.setHeader('Set-Cookie', clearCookie);
    return res.status(200).json({
      success: true,
      message: 'Session cleared successfully'
    });
  } catch (error: any) {
    return res.status(500).json({
      error: 'Logout failed',
      details: error?.message || 'Internal server error'
    });
  }
}
