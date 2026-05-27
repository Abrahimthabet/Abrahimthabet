const FREE_HOURS = Number(process.env.FREE_TIME_HOURS || process.env.DETENTION_FREE_HOURS || 2);
const HOURLY_RATE = Number(process.env.DETENTION_RATE || process.env.DETENTION_HOURLY_RATE || 75);

function computeDetention(arrivedAt, endedAt = new Date()) {
  const arrived = new Date(arrivedAt);
  const end = new Date(endedAt);
  const elapsedHours = (end - arrived) / 36e5;

  const detentionStart = new Date(arrived.getTime() + FREE_HOURS * 36e5);
  const inDetention = elapsedHours > FREE_HOURS;
  const hoursDetained = inDetention ? +(elapsedHours - FREE_HOURS).toFixed(2) : 0;
  const totalOwed = +(hoursDetained * HOURLY_RATE).toFixed(2);

  return {
    free_hours: FREE_HOURS,
    hourly_rate: HOURLY_RATE,
    detention_started_at: detentionStart.toISOString(),
    in_detention: inDetention,
    hours_detained: hoursDetained,
    total_owed: totalOwed,
  };
}

module.exports = { computeDetention, FREE_HOURS, HOURLY_RATE };
