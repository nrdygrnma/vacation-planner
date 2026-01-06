export const useDateUtils = () => {
  // Use a deterministic locale/timezone to avoid SSR/CSR hydration mismatches.
  // en-GB => dd/MM/yyyy, rendered in UTC to avoid off-by-one issues.
  const dtf = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });

  const formatDate = (value?: string | Date | null) => {
    if (!value) return "—";
    const d = value instanceof Date ? value : new Date(value);
    return isNaN(d.getTime()) ? "—" : dtf.format(d);
  };

  return { formatDate };
}
