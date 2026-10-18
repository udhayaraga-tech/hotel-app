import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PLACEHOLDER } from '../utils.js';

const MAX_IMAGE = 5 * 1024 * 1024;

const validateImage = (file) => {
  if (!/^image\/(jpeg|png|webp|gif)$/.test(file.type)) return 'Choose a JPG, PNG, WEBP or GIF image';
  if (file.size > MAX_IMAGE) return 'Image must be 5 MB or smaller';
  return null;
};

function validate(v, file, hasExistingImage) {
  const e = {};
  if (!file && !hasExistingImage) e.image = 'Please upload a hotel image';

  const title = v.title.trim();
  if (!title) e.title = 'Title is required';
  else if (title.length < 3 || title.length > 100) e.title = 'Title must be 3–100 characters';

  const desc = v.description.trim();
  if (!desc) e.description = 'Description is required';
  else if (desc.length < 10) e.description = 'Description must be at least 10 characters';
  else if (desc.length > 2000) e.description = 'Description must be 2000 characters or fewer';

  const lat = Number(v.latitude);
  if (v.latitude.trim() === '' || Number.isNaN(lat)) e.latitude = 'Enter a valid latitude';
  else if (lat < -90 || lat > 90) e.latitude = 'Latitude must be between -90 and 90';

  const lng = Number(v.longitude);
  if (v.longitude.trim() === '' || Number.isNaN(lng)) e.longitude = 'Enter a valid longitude';
  else if (lng < -180 || lng > 180) e.longitude = 'Longitude must be between -180 and 180';

  const price = Number(v.price);
  if (v.price.trim() === '' || Number.isNaN(price)) e.price = 'Enter a valid price';
  else if (price <= 0) e.price = 'Price must be greater than 0';
  else if (price > 99999999) e.price = 'Price is too large';

  return e;
}

function Field({ id, label, error, children }) {
  return (
    <div className={`field ${error ? 'has-error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      {error && <p className="field-error" id={`${id}-err`} role="alert">{error}</p>}
    </div>
  );
}

/**
 * One form used for BOTH adding and editing.
 *  - Add:  <HotelForm onSubmit={...} />
 *  - Edit: <HotelForm initialValues={hotel} onSubmit={...} />
 */
export default function HotelForm({ initialValues, onSubmit, submitting, serverErrors = {}, submitLabel }) {
  const [values, setValues] = useState(() => ({
    title: initialValues?.title ?? '',
    description: initialValues?.description ?? '',
    latitude: initialValues ? String(initialValues.latitude) : '',
    longitude: initialValues ? String(initialValues.longitude) : '',
    price: initialValues ? String(initialValues.price) : '',
  }));
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(initialValues?.image || null);
  const [errors, setErrors] = useState({});
  const [geoMsg, setGeoMsg] = useState('');
  const hasExistingImage = Boolean(initialValues?.image);

  // Show errors returned by the API (e.g. server-side validation)
  useEffect(() => {
    if (Object.keys(serverErrors).length) setErrors(serverErrors);
  }, [serverErrors]);

  // Free the temporary preview URL when it is replaced / on unmount
  useEffect(() => () => { if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview); }, [preview]);

  const clearError = (name) => setErrors((p) => ({ ...p, [name]: undefined }));

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
    clearError(e.target.name);
  };

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const err = validateImage(f);
    if (err) {
      setErrors((p) => ({ ...p, image: err }));
      e.target.value = '';
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    clearError('image');
  };

  // Browser Geolocation API: fill the coordinates with the user's current position
  const useMyLocation = () => {
    if (!navigator.geolocation) return setGeoMsg('Geolocation is not supported by this browser');
    setGeoMsg('Finding your location…');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setValues((v) => ({
          ...v,
          latitude: coords.latitude.toFixed(6),
          longitude: coords.longitude.toFixed(6),
        }));
        setErrors((p) => ({ ...p, latitude: undefined, longitude: undefined }));
        setGeoMsg('Coordinates filled from your current location');
      },
      () => setGeoMsg('Could not get your location. Enter the coordinates manually.')
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate(values, file, hasExistingImage);
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const fd = new FormData();
    if (file) fd.append('image', file);
    fd.append('title', values.title.trim());
    fd.append('description', values.description.trim());
    fd.append('latitude', values.latitude);
    fd.append('longitude', values.longitude);
    fd.append('price', values.price);
    onSubmit(fd);
  };

  return (
    <form className="panel hotel-form" onSubmit={handleSubmit} noValidate>
      <div className="form-grid">
        <div className="image-col">
          <Field id="image" label="Hotel image" error={errors.image}>
            <img className="image-preview" src={preview || PLACEHOLDER}
                 alt={preview ? 'Selected hotel preview' : 'No image selected yet'} />
            <input id="image" name="image" type="file" accept="image/jpeg,image/png,image/webp,image/gif"
                   onChange={handleFile} aria-describedby="image-err" />
            <small>{hasExistingImage ? 'Choose a file only if you want to replace the image. ' : ''}Max 5 MB.</small>
          </Field>
        </div>

        <div className="fields-col">
          <Field id="title" label="Title" error={errors.title}>
            <input id="title" name="title" value={values.title} onChange={handleChange}
                   maxLength={100} placeholder="Hotel name" />
          </Field>

          <Field id="description" label="Description" error={errors.description}>
            <textarea id="description" name="description" rows={5} value={values.description}
                      onChange={handleChange} placeholder="Describe the hotel" />
          </Field>

          <div className="two-col">
            <Field id="latitude" label="Latitude" error={errors.latitude}>
              <input id="latitude" name="latitude" type="number" step="any" value={values.latitude}
                     onChange={handleChange} placeholder="e.g. 13.0827" />
            </Field>
            <Field id="longitude" label="Longitude" error={errors.longitude}>
              <input id="longitude" name="longitude" type="number" step="any" value={values.longitude}
                     onChange={handleChange} placeholder="e.g. 80.2707" />
            </Field>
          </div>
          <button type="button" className="btn btn-outline btn-sm" onClick={useMyLocation}>
            Use my current location
          </button>
          {geoMsg && <small className="geo-msg" role="status">{geoMsg}</small>}

          <Field id="price" label="Price" error={errors.price}>
            <input id="price" name="price" type="number" step="0.01" min="0" value={values.price}
                   onChange={handleChange} placeholder="Price per night" />
          </Field>
        </div>
      </div>

      <div className="form-actions">
        <Link to="/" className="btn btn-outline">Cancel</Link>
        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
