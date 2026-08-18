const { loadEnvOnce } = require('../lib/load-env'); loadEnvOnce();

export default function handler(req, res) {
  res.status(200).json({
    SIGILOPAY_PUBLIC_KEY: !!process.env.SIGILOPAY_PUBLIC_KEY,
    SIGILOPAY_SECRET_KEY: !!process.env.SIGILOPAY_SECRET_KEY,
    RESEND_API_KEY: !!process.env.RESEND_API_KEY,
    ACCESS_TOKEN_SECRET: !!process.env.ACCESS_TOKEN_SECRET,
    SITE_URL: process.env.SITE_URL || null,
    totalEnvVars: Object.keys(process.env).length,
  });
}