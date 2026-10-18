const BASE = '/api/hotels';

async function request(url, options) {
  let res;
  try {
    res = await fetch(url, options);
  } catch {
    throw new Error('Cannot reach the server. Check that the backend is running.');
  }
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error(body?.message || `Request failed (${res.status})`);
    err.errors = body?.errors || {};
    throw err;
  }
  return body;
}

export function getHotels({ search, minPrice, maxPrice, page = 1, limit = 6 }) {
  const qs = new URLSearchParams();
  if (search) qs.set('search', search);
  if (minPrice !== undefined && minPrice !== null && minPrice !== '') qs.set('minPrice', minPrice);
  if (maxPrice !== undefined && maxPrice !== null && maxPrice !== '') qs.set('maxPrice', maxPrice);
  qs.set('limit', limit);
  qs.set('offset', (page - 1) * limit);
  return request(`${BASE}?${qs}`);
}

export const getHotel = (id) => request(`${BASE}/${id}`);
export const createHotel = (formData) => request(BASE, { method: 'POST', body: formData });
export const updateHotel = (id, formData) => request(`${BASE}/${id}`, { method: 'PUT', body: formData });
export const deleteHotel = (id) => request(`${BASE}/${id}`, { method: 'DELETE' });
