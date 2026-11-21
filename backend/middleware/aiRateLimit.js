// Lightweight single-instance guard against unexpected Grok API charges.
// Replace with a distributed rate limiter when scaling beyond one instance.
const attempts = new Map();
module.exports = (req, res, next) => {
  const id = String(req.user?._id || req.ip);
  const now = Date.now();
  const previous = attempts.get(id) || [];
  const recent = previous.filter((time) => now - time < 60 * 60 * 1000);
  if (recent.length >= 30) {
    return res.status(429).json({ message: 'AI request limit reached (30/hour). Try again later.' });
  }
  recent.push(now);
  attempts.set(id, recent);
  if (attempts.size > 10000) {
    for (const [key, timestamps] of attempts) {
      if (timestamps.every((time) => now - time >= 60 * 60 * 1000)) attempts.delete(key);
    }
  }
  next();
};
