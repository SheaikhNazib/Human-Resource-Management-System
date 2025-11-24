const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function fetchFromApi(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log(`Fetching from API: ${url}`);
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      // Add secret keys here that shouldn't be exposed to client
      // 'Authorization': `Bearer ${process.env.API_SECRET_KEY}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API call failed: ${res.status} ${res.statusText} - ${errorText}`);
  }

  return res.json();
}
