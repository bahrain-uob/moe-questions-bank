export function getFormattedDateTime() {
  const now = new Date();

  // Extract date components
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const year = now.getFullYear();

  // Extract time components
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  // Combine into desired format
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}
