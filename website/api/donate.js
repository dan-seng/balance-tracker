// Support donation endpoint. The app posts an amount and receives a Chapa
// hosted-checkout URL that the supporter opens in their phone browser.
//
// Requires the CHAPA_SECRET_KEY environment variable (the "private key" from
// the Chapa dashboard). The key never leaves this serverless function.
//
// Talks to the Chapa v2 hosted-payment API:
//   POST https://api.chapa.global/v2/payments/hosted  (Bearer <secret key>)
// Returns  { status:'success', data:{ checkout_url } }

const CHAPA_API = 'https://api.chapa.global/v2/payments/hosted';

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  res.setHeader('Cache-Control', 'no-store');

  const secretKey = process.env.CHAPA_SECRET_KEY;
  if (!secretKey) {
    res.status(503).json({ error: 'Payments are not configured yet.' });
    return;
  }

  let amount = Number(req.body && req.body.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    res.status(400).json({ error: 'A valid amount is required.' });
    return;
  }
  amount = Math.round(amount * 100) / 100;

  const txRef = String(
    (req.body && req.body.txRef) ||
      `hisab-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
  ).slice(0, 100);

  const origin = `https://${req.headers.host || 'hisab'}`;

  try {
    const response = await fetch(CHAPA_API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': txRef,
      },
      body: JSON.stringify({
        amount,
        currency: 'ETB',
        customer: {
          first_name: 'Hisab',
          last_name: 'Supporter',
          email: 'donate@hisab.app',
        },
        return_url: `${origin}/?donated=1`,
        meta: {
          merchant_reference: txRef,
          notes: 'Hisab supporter donation',
        },
      }),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload.status !== 'success' || !payload.data) {
      console.error('Chapa initialize failed:', response.status, payload);
      res.status(502).json({ error: 'Could not start the payment.' });
      return;
    }

    res.status(200).json({ checkoutUrl: payload.data.checkout_url });
  } catch (err) {
    console.error('Chapa initialize threw:', err);
    res.status(502).json({ error: 'Could not reach the payment provider.' });
  }
};