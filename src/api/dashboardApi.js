import { get } from './httpClient';

export const fetchDashboardSummary = ({
  year,
  month,
  topLimit,
  latestLimit,
  userScope,
  userId,
}) => {
  const params = new URLSearchParams({
    year: String(year),
    month: String(month),
    topLimit: String(topLimit),
    latestLimit: String(latestLimit),
  });

  if (userScope) {
    params.append('userScope', userScope);
  }

  if (userId) {
    params.append('userId', String(userId));
  }

  return get(`/dashboard/summary?${params.toString()}`);
};
