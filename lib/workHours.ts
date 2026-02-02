/**
 * Work hours: 9 AM–5 PM, Monday–Friday (local time).
 * Used to compute activity overlap with work hours for analytics and badges.
 */

const WORK_START_HOUR = 9
const WORK_END_HOUR = 17
const WORK_DAYS = [1, 2, 3, 4, 5] // Mon=1 .. Fri=5 (getDay())

function getDayStart(d: Date, hour: number): Date {
  const out = new Date(d)
  out.setHours(hour, 0, 0, 0)
  return out
}

/**
 * Returns how many seconds of the interval [start, end] fall inside work hours (9–5 Mon–Fri, local).
 */
export function getWorkHoursSeconds(startedAt: string, endedAt: string): number {
  const start = new Date(startedAt)
  const end = new Date(endedAt)
  if (end.getTime() <= start.getTime()) return 0

  let totalMs = 0
  const dayCursor = new Date(start)
  dayCursor.setHours(0, 0, 0, 0)
  const endDay = new Date(end)
  endDay.setHours(0, 0, 0, 0)

  while (dayCursor.getTime() <= endDay.getTime()) {
    const day = dayCursor.getDay()
    if (!WORK_DAYS.includes(day)) {
      dayCursor.setDate(dayCursor.getDate() + 1)
      continue
    }

    const workStart = getDayStart(new Date(dayCursor), WORK_START_HOUR)
    const workEnd = getDayStart(new Date(dayCursor), WORK_END_HOUR)
    const segStartMs = Math.max(start.getTime(), workStart.getTime())
    const segEndMs = Math.min(end.getTime(), workEnd.getTime())
    if (segEndMs > segStartMs) {
      totalMs += segEndMs - segStartMs
    }

    dayCursor.setDate(dayCursor.getDate() + 1)
  }

  return Math.round(totalMs / 1000)
}

/**
 * Returns true if the given instant (ISO string) falls within work hours (9–5 Mon–Fri, local).
 */
export function isWorkHours(isoString: string): boolean {
  const d = new Date(isoString)
  const day = d.getDay()
  if (!WORK_DAYS.includes(day)) return false
  const h = d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600
  return h >= WORK_START_HOUR && h < WORK_END_HOUR
}

export const WORK_HOURS_LABEL = "9 AM–5 PM, Mon–Fri"
