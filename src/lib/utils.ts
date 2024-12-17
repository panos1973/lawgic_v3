import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const units: { unit: Intl.RelativeTimeFormatUnit; ms: number }[] = [
  { unit: 'year', ms: 31536000000 },
  { unit: 'month', ms: 2628000000 },
  { unit: 'day', ms: 86400000 },
  { unit: 'hour', ms: 3600000 },
  { unit: 'minute', ms: 60000 },
  { unit: 'second', ms: 1000 },
]
const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

/**
 * Get language-sensitive relative time message from Dates.
 * @param relative  - the relative dateTime, generally is in the past or future
 * @param pivot     - the dateTime of reference, generally is the current time
 */
export function relativeTimeFromDates(
  relative: Date | null,
  pivot: Date = new Date()
): string {
  if (!relative) return ''
  const elapsed = relative.getTime() - pivot.getTime()
  return relativeTimeFromElapsed(elapsed)
}

/**
 * Get language-sensitive relative time message from elapsed time.
 * @param elapsed   - the elapsed time in milliseconds
 */
export function relativeTimeFromElapsed(elapsed: number): string {
  for (const { unit, ms } of units) {
    if (Math.abs(elapsed) >= ms || unit === 'second') {
      return rtf.format(Math.round(elapsed / ms), unit)
    }
  }
  return ''
}

/**
 * Format a given date to a string in the format DD/MM/YY T:HH:MM.
 * @param date - The date to format. If null, it returns an empty string.
 */
export function formatDateToCustomFormat(date: Date | null): string {
  if (!date) return ''

  const padZero = (num: number) => num.toString().padStart(2, '0')

  const day = padZero(date.getDate())
  const month = padZero(date.getMonth() + 1) // Months are zero-based, so add 1
  const year = date.getFullYear().toString().slice(-2) // Get last two digits
  const hours = padZero(date.getHours())
  const minutes = padZero(date.getMinutes())

  return `${day}/${month}/${year} ${hours}:${minutes}`
}
