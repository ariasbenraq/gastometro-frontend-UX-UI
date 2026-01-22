import { get } from './httpClient';

export const fetchDashboardSummary = ({ year, month, topLimit, latestLimit }) => {
  const params = new URLSearchParams({
    year: String(year),
    month: String(month),
    topLimit: String(topLimit),
    latestLimit: String(latestLimit),
  });

  return get(`/dashboard/summary?${params.toString()}`);
};
