// Central configuration for the app.
//
// DONATE_API_URL is the /api/donate endpoint served by the Vercel website
// (the same host that serves Hisab.apk). It creates the Chapa checkout for
// the Support screen. Point it at your real deployed domain before shipping,
// then rebuild the APK.
export const DONATE_API_URL = 'https://hisabd.vercel.app/api/donate';