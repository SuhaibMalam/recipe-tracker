// A "day" is a "YYYY-MM-DD" string in the user's own calendar. It's stored in a
// Postgres DATE column, which Prisma hands back as a Date at UTC midnight, so all
// arithmetic here is done in UTC to avoid shifting a day across timezones.

export function todayIn(timeZone) {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export const dayToDate = (day) => new Date(`${day}T00:00:00Z`);

export const dateToDay = (date) => date.toISOString().slice(0, 10);

export function addDays(day, n) {
  const d = dayToDate(day);
  d.setUTCDate(d.getUTCDate() + n);
  return dateToDay(d);
}

const weekdayDate = new Intl.DateTimeFormat("en", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

const shortWeekday = new Intl.DateTimeFormat("en", { weekday: "short", timeZone: "UTC" });

export function formatDay(day, today) {
  if (day === today) return "Today";
  if (day === addDays(today, -1)) return "Yesterday";
  return weekdayDate.format(dayToDate(day));
}

export const formatWeekday = (day) => shortWeekday.format(dayToDate(day));
