export default function formatTimestamp(
  isoTimestamp: string,
  monthFormat?: string
) {
  const timestamp = new Date(isoTimestamp);

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: monthFormat ? "long" : "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };

  const formattedTimestamp = timestamp.toLocaleString("en-US", options);

  return formattedTimestamp;
}
