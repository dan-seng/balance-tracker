const { redis } = require('./_lib/redis');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  res.setHeader(
    'Cache-Control',
    'public, s-maxage=60, stale-while-revalidate=300',
  );

  try {
    const [downloads, users] = await Promise.all([
      redis('GET', 'hisab:downloads'),
      redis('GET', 'hisab:users'),
    ]);

    res.status(200).json({
      downloads: Number(downloads) || 0,
      users: Number(users) || 0,
    });
  } catch (err) {
    console.error('download count read failed:', err);
    res.status(200).json({ downloads: 0, users: 0 });
  }
};
