const { redis } = require('./_lib/redis');

const BOT_PATTERN =
  /bot|crawl|spider|slurp|preview|curl|wget|python|axios|headless|lighthouse/i;

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  res.setHeader('Cache-Control', 'no-store');

  const userAgent = req.headers['user-agent'] || '';
  if (BOT_PATTERN.test(userAgent)) {
    res.status(200).json({ ok: true, counted: false });
    return;
  }

  const visitorId = String(req.query.id || '').slice(0, 64);

  try {
    await redis('INCR', 'hisab:downloads');

    if (visitorId) {
      const isNewVisitor = await redis(
        'SET',
        `hisab:visitor:${visitorId}`,
        '1',
        'NX',
      );
      if (isNewVisitor !== null) await redis('INCR', 'hisab:users');
    }

    res.status(200).json({ ok: true, counted: true });
  } catch (err) {
    console.error('download tracking failed:', err);
    res.status(200).json({ ok: false, counted: false });
  }
};
