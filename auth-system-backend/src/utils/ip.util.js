// ip address utility functions
export function getClientIP(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.headers["x-real-ip"] ||
    req.socket?.remoteAddress ||
    "Unknown"
  );
}

export function parseUserAgent(userAgent) {
  if (!userAgent) return "Unknown Device";

  const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);
  const browser = userAgent.includes("Chrome")
    ? "Chrome"
    : userAgent.includes("Firefox")
      ? "Firefox"
      : userAgent.includes("Safari")
        ? "Safari"
        : "Unknown";

  return `${isMobile ? "Mobile" : "Desktop"} - ${browser} `;
}

export async function getLocationFromIP(ip) {
  if (ip === "Unknown" || ip.startsWith("127.") || ip.startsWith("192.168.")) {
    return "Local Network";
  }

  // ip location api here!!
  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await response.json();
    return `${data.city || "Unknown"}, ${data.country_name || "Unknown"}`;
  } catch (error) {
    return "Unknown Location";
  }
}
