export const HOST =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const DEFAULT_QUERY = {
  page: 1,
  limit: 10,
  search: '',
};