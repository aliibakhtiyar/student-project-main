const QuizAttempt = require('../models/QuizAttempt');

// First best completed quiz for each topic+difficulty+day earns XP.
// Repeated practice still improves skill charts, but cannot inflate XP indefinitely.
const WEIGHT = { Easy: 1, Medium: 1.5, Hard: 2 };
function xpForAttempt(attempt) {
  const pct = Math.min(100, Math.max(0, Number(attempt.percentage) || 0));
  return Math.round(pct * (WEIGHT[attempt.difficulty] || 1));
}
function summarizeAttempts(attempts) {
  const topicMap = new Map();
  const bestDaily = new Map();
  const activityMap = new Map();
  let correct = 0, questions = 0, completed = 0;
  for (const q of attempts) {
    if (!q.completed) continue;
    completed++;
    questions += q.totalQuestions || 0;
    correct += q.score || 0;
    const topic = (q.topic || 'General').trim();
    const key = topic.toLowerCase();
    const prev = topicMap.get(key) || { topic, attempts: 0, correct: 0, total: 0, difficulty: {} };
    prev.attempts++;
    prev.correct += q.score || 0;
    prev.total += q.totalQuestions || 0;
    prev.difficulty[q.difficulty] = (prev.difficulty[q.difficulty] || 0) + 1;
    topicMap.set(key, prev);
    const day = new Date(q.createdAt).toISOString().slice(0, 10);
    activityMap.set(day, (activityMap.get(day) || 0) + 1);
    const xpKey = `${day}|${key}|${q.difficulty}`;
    bestDaily.set(xpKey, Math.max(bestDaily.get(xpKey) || 0, xpForAttempt(q)));
  }
  const topics = [...topicMap.values()].map((t) => ({
    ...t, accuracy: t.total ? Math.round(t.correct / t.total * 100) : 0,
  })).sort((a, b) => b.attempts - a.attempts).slice(0, 15);
  let streak = 0;
  const day = new Date();
  day.setUTCHours(0, 0, 0, 0);
  const today = day.toISOString().slice(0, 10);
  if (!activityMap.has(today)) day.setUTCDate(day.getUTCDate() - 1);
  while (activityMap.has(day.toISOString().slice(0, 10))) {
    streak++;
    day.setUTCDate(day.getUTCDate() - 1);
  }
  const dailyXp = new Map();
  for (const [key, amount] of bestDaily) {
    const date = key.split('|')[0];
    dailyXp.set(date, (dailyXp.get(date) || 0) + amount);
  }
  const xp = [...dailyXp.values()].reduce((sum, amount) => sum + Math.min(500, amount), 0);
  return {
    completed, questions, correct, accuracy: questions ? Math.round(correct / questions * 100) : 0,
    xp, streak, topics,
    activity: [...activityMap.entries()].map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date)).slice(-30),
  };
}

async function loadUserStats(userId) {
  const attempts = await QuizAttempt.find({ user: userId, completed: true })
    .select('topic difficulty score totalQuestions percentage createdAt completed')
    .sort({ createdAt: -1 }).limit(2000).lean();
  return summarizeAttempts(attempts);
}

async function loadLeaderboard({ from, studentIds, college, limit = 30 }) {
  const match = { completed: true };
  if (from) match.createdAt = { $gte: from };
  if (studentIds) match.user = { $in: studentIds };
  const pipeline = [
    { $match: match },
    { $project: {
      user: 1, difficulty: 1, score: 1, totalQuestions: 1,
      percentage: 1, topic: { $toLower: { $trim: { input: '$topic' } } },
      day: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'UTC' } },
    } },
    { $group: {
      _id: { user: '$user', topic: '$topic', difficulty: '$difficulty', day: '$day' },
      bestPercentage: { $max: '$percentage' }, attempts: { $sum: 1 },
    } },
    { $addFields: { weightedXp: { $round: [{ $multiply: [
      '$bestPercentage', { $switch: { branches: [
        { case: { $eq: ['$_id.difficulty', 'Hard'] }, then: 2 },
        { case: { $eq: ['$_id.difficulty', 'Medium'] }, then: 1.5 },
      ], default: 1 } },
    ] }, 0] } } },
    { $group: {
      _id: { user: '$_id.user', day: '$_id.day' },
      dayXp: { $sum: '$weightedXp' }, scoringQuizzes: { $sum: 1 },
    } },
    { $group: {
      _id: '$_id.user',
      xp: { $sum: { $min: ['$dayXp', 500] } },
      scoringQuizzes: { $sum: '$scoringQuizzes' },
    } },
    { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'student' } },
    { $unwind: '$student' },
  ];
  if (college) pipeline.push({ $match: { 'student.institute': college } });
  pipeline.push(
    { $sort: { xp: -1, scoringQuizzes: -1, _id: 1 } },
    { $limit: limit },
    { $project: { _id: 0, userId: '$_id', xp: 1, scoringQuizzes: 1,
      name: '$student.name', institute: '$student.institute', profileImage: '$student.profileImage' } }
  );
  return QuizAttempt.aggregate(pipeline);
}
module.exports = { loadUserStats, loadLeaderboard, summarizeAttempts };
