import { get } from './httpClient';

export const fetchBalanceTotals = ({ userId } = {}) => {
  const params = new URLSearchParams();
  if (userId) {
    params.append('userId', String(userId));
  }

  const query = params.toString();
  return get(`/balance${query ? `?${query}` : ''}`);
};

export const fetchMonthlyBalance = ({ year, month, userId } = {}) => {
  const params = new URLSearchParams();
  if (year) {
    params.append('year', String(year));
  }
  if (month) {
    params.append('month', String(month));
  }
  if (userId) {
    params.append('userId', String(userId));
  }

  return get(`/balance/mensual?${params.toString()}`);
};
