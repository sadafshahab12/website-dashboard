export const formatOrderTime = (dateString: string) => {
  const date = new Date(dateString);

  // Convert to PKT timezone
  const optionsTime: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Karachi",
  };

  const now = new Date();

  // Calculate days difference in PKT
  const nowPKT = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Karachi" })
  );
  const datePKT = new Date(
    date.toLocaleString("en-US", { timeZone: "Asia/Karachi" })
  );

  const diffDays = Math.floor(
    (nowPKT.setHours(0, 0, 0, 0) - datePKT.setHours(0, 0, 0, 0)) /
      (1000 * 60 * 60 * 24)
  );

  const timeString = date.toLocaleTimeString("en-US", optionsTime);

  if (diffDays === 0) return `Today, ${timeString}`;
  if (diffDays === 1) return `Yesterday, ${timeString}`;
  if (diffDays < 7) return `${diffDays} days ago, ${timeString}`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks > 1 ? "s" : ""} ago, ${timeString}`;
  }

  return date.toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...optionsTime,
  });
};
