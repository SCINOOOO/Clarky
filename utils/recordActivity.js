const recentActivity = {};

export function recordBotActivity(channelId) {
  const now = Date.now();
  recentActivity[channelId] = now;
}

export function getRecentActivity() {
  return recentActivity;
}