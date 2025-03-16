/**
 * Get the UTC offset for a timezone in the format "UTC+X" or "UTC-X"
 */
export function getTimezoneOffset(timezone: string): string {
  // Create a date object for the current time
  const date = new Date()

  // Get the timezone offset in minutes
  const tzString = date.toLocaleString("en-US", {
    timeZone: timezone,
    timeZoneName: "longOffset",
  })

  // Extract the GMT part from the string
  const gmtMatch = tzString.match(/GMT([+-]\d{1,2}(?::\d{2})?)/)

  if (gmtMatch && gmtMatch[1]) {
    // Format the offset string
    let offset = gmtMatch[1]

    // Replace colon with period for minutes
    offset = offset.replace(":", ".")

    // If it's just a number (e.g., "+5"), keep it as is
    if (!offset.includes(".")) {
      return `UTC${offset}`
    }

    // If it ends with ".00", remove the decimal part
    if (offset.endsWith(".00")) {
      return `UTC${offset.slice(0, -3)}`
    }

    return `UTC${offset}`
  }

  // Fallback method if the above doesn't work
  try {
    // Get the offset in minutes
    const offsetInMinutes = new Date().toLocaleString("en-US", {
      timeZone: timezone,
    })

    // Create date objects for the timezone and UTC
    const tzDate = new Date(offsetInMinutes)
    const utcDate = new Date(new Date().toLocaleString("en-US", { timeZone: "UTC" }))

    // Calculate the difference in minutes
    const diffMinutes = (tzDate.getTime() - utcDate.getTime()) / 60000

    // Convert to hours and format
    const hours = Math.floor(Math.abs(diffMinutes) / 60)
    const minutes = Math.round(Math.abs(diffMinutes) % 60)

    const sign = diffMinutes >= 0 ? "+" : "-"

    if (minutes === 0) {
      return `UTC${sign}${hours}`
    } else {
      // Format with period instead of colon (e.g., UTC+5.30)
      return `UTC${sign}${hours}.${minutes.toString().padStart(2, "0")}`
    }
  } catch (error) {
    // If all else fails, return UTC+0
    return "UTC+0"
  }
}

