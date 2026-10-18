import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { clearCurrent, fetchHotel, saveHotel } from '../store/hotelsSlice.js';
import HotelForm from '../components/HotelForm.jsx';

// Same page + same <HotelForm> for "/hotels/new" and "/hotels/:id/edit"
export default function HotelFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current, currentStatus, currentError, saving, saveError, fieldErrors } = useSelector((s) => s.hotels);

  useEffect(() => {
    dispatch(clearCurrent());
    if (isEdit) dispatch(fetchHotel(id));
    return () => { dispatch(clearCurrent()); };
  }, [dispatch, id, isEdit]);

  const handleSubmit = (formData) =>
    dispatch(saveHotel({ id, formData }))
      .unwrap()
      .then(() => navigate('/', { state: { message: isEdit ? 'Hotel updated successfully.' : 'Hotel added successfully.' } }))
      .catch(() => {}); // errors are stored in Redux and shown by the form

  const title = isEdit ? 'Edit hotel' : 'Add hotel';
  const ready = !isEdit || (current && String(current.id) === id);

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <section className="banner">
        <div className="container"><h1>{title}</h1></div>
      </section>

      <div className="container narrow">
        {isEdit && currentStatus === 'loading' && <p className="state-box">Loading hotel…</p>}
        {isEdit && currentStatus === 'failed' && <p className="state-box error">{currentError}</p>}
        {saveError && !Object.keys(fieldErrors).length && <p className="banner-error" role="alert">{saveError}</p>}

        {ready && currentStatus !== 'failed' && (isEdit ? currentStatus === 'succeeded' : true) && (
          <HotelForm
            key={id || 'new'}
            initialValues={isEdit ? current : null}
            onSubmit={handleSubmit}
            submitting={saving}
            serverErrors={fieldErrors}
            submitLabel={isEdit ? 'Save changes' : 'Add hotel'}
          />
        )}
      </div>
    </>
  );
}
