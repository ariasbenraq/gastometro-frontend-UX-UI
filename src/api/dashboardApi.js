import { get } from './httpClient';

export const fetchDashboardSummary = ({
  year,
  month,
  topLimit,
  latestLimit,
  userId,
} = {}) => {
  const params = new URLSearchParams({
    ...(year ? { year: String(year) } : {}),
    ...(month ? { month: String(month) } : {}),
    ...(topLimit ? { topLimit: String(topLimit) } : {}),
    ...(latestLimit ? { latestLimit: String(latestLimit) } : {}),
  });

  if (userId) {
    params.append('userId', String(userId));
  }

  const query = params.toString();
  return get(`/dashboard/summary${query ? `?${query}` : ''}`);
};
