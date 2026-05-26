const API_URL = process.env.EXPO_PUBLIC_API_URL;

export function makeApi(getToken) {
  async function request(path, opts = {}) {
    const token = await getToken();
    const res = await fetch(`${API_URL}${path}`, {
      ...opts,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(opts.headers || {}),
      },
    });
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
    return data;
  }

  return {
    createLoad: (body) => request('/loads', { method: 'POST', body: JSON.stringify(body) }),
    checkIn: (loadId, coords) =>
      request(`/loads/${loadId}/checkin`, { method: 'POST', body: JSON.stringify(coords) }),
    getLoad: (loadId) => request(`/loads/${loadId}`),
    getDriverLoads: (clerkId) => request(`/loads/driver/${clerkId}`),
  };
}
