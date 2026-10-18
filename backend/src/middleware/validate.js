const toNumber = (v) =>
  v === undefined || v === null || String(v).trim() === '' ? NaN : Number(v);

/**
 * Validates the hotel body. Returns { errors, values }.
 * `errors` is an object keyed by field name (empty when valid).
 */
function validateHotel(body, { imageProvided }) {
  const errors = {};

  const title = String(body.title ?? '').trim();
  if (!title) errors.title = 'Title is required';
  else if (title.length < 3 || title.length > 100)
    errors.title = 'Title must be between 3 and 100 characters';

  const description = String(body.description ?? '').trim();
  if (!description) errors.description = 'Description is required';
  else if (description.length < 10 || description.length > 2000)
    errors.description = 'Description must be between 10 and 2000 characters';

  const latitude = toNumber(body.latitude);
  if (Number.isNaN(latitude)) errors.latitude = 'Latitude is required and must be a number';
  else if (latitude < -90 || latitude > 90) errors.latitude = 'Latitude must be between -90 and 90';

  const longitude = toNumber(body.longitude);
  if (Number.isNaN(longitude)) errors.longitude = 'Longitude is required and must be a number';
  else if (longitude < -180 || longitude > 180)
    errors.longitude = 'Longitude must be between -180 and 180';

  const price = toNumber(body.price);
  if (Number.isNaN(price)) errors.price = 'Price is required and must be a number';
  else if (price <= 0) errors.price = 'Price must be greater than 0';
  else if (price > 99999999) errors.price = 'Price is too large';

  if (!imageProvided) errors.image = 'Image is required';

  return { errors, values: { title, description, latitude, longitude, price } };
}

module.exports = { validateHotel };
