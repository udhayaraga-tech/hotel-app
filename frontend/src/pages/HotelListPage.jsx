import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { fetchHotels, removeHotel } from '../store/hotelsSlice.js';
import HotelCard from '../components/HotelCard.jsx';
import Pagination from '../components/Pagination.jsx';
import Filters from '../components/Filters.jsx';
import Popup from '../components/Popup.jsx';

const PAGE_SIZE = 6;

export default function HotelListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { list, total, listStatus, listError } = useSelector((s) => s.hotels);

  // Filters + page live in the URL, so back/forward and refresh keep the same view
  const [params, setParams] = useSearchParams();
  const search = params.get('search') || '';
  const minPrice = params.get('minPrice') || '';
  const maxPrice = params.get('maxPrice') || '';
  const page = Math.max(1, parseInt(params.get('page'), 10) || 1);
  const filterValues = useMemo(() => ({ search, minPrice, maxPrice }), [search, minPrice, maxPrice]);

  const [popup, setPopup] = useState(location.state?.message ? { message: location.state.message } : null);

  // Clear the one-time "Hotel added/updated" message from history so refresh doesn't show it again
  useEffect(() => {
    if (location.state?.message) navigate(`${location.pathname}${location.search}`, { replace: true, state: null });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const load = useCallback(
    () => dispatch(fetchHotels({ search, minPrice, maxPrice, page, limit: PAGE_SIZE })),
    [dispatch, search, minPrice, maxPrice, page]
  );
  useEffect(() => { load(); }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const updateParams = (next) => {
    const p = {};
    Object.entries(next).forEach(([k, v]) => { if (v !== '' && v !== null && v !== undefined) p[k] = v; });
    setParams(p);
  };
  const applyFilters = (f) => updateParams({ search: f.search.trim(), minPrice: f.minPrice, maxPrice: f.maxPrice });
  const goToPage = (p) => {
    updateParams({ search, minPrice, maxPrice, page: p > 1 ? p : '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If the page no longer exists (e.g. last item on the last page deleted), step back
  useEffect(() => {
    if (listStatus === 'succeeded' && page > totalPages) goToPage(totalPages);
  }, [listStatus, page, totalPages]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async (hotel) => {
    if (!window.confirm(`Delete "${hotel.title}"? This cannot be undone.`)) return;
    try {
      await dispatch(removeHotel(hotel.id)).unwrap();
      setPopup({ message: `"${hotel.title}" was deleted successfully.` });
      if (list.length === 1 && page > 1) goToPage(page - 1);
      else load();
    } catch (e) {
      setPopup({ message: e?.message || 'Could not delete the hotel', type: 'error' });
    }
  };

  const hasFilters = Boolean(search || minPrice || maxPrice);

  return (
    <>
      <Helmet>
        <title>{page > 1 ? `Hotels – page ${page}` : 'Hotels'}</title>
        <meta name="description" content="Browse hotels, search by name and filter by price." />
        <link rel="canonical" href={`${window.location.origin}/`} />
      </Helmet>

      <section className="banner">
        <div className="container banner-row">
          <h1>Hotels</h1>
          <Link className="btn btn-light" to="/hotels/new">Add hotel</Link>
        </div>
      </section>

      <div className="container layout">
        <aside>
          <Filters values={filterValues} onApply={applyFilters} onReset={() => setParams({})} />
        </aside>

        <section aria-live="polite">
          <p className="result-count">
            {listStatus === 'loading' && list.length === 0
              ? 'Loading hotels…'
              : `${total} ${total === 1 ? 'hotel' : 'hotels'} found`}
          </p>

          {listStatus === 'failed' && (
            <div className="state-box error">
              <p>{listError}</p>
              <button className="btn btn-primary" onClick={load}>Try again</button>
            </div>
          )}

          {listStatus !== 'failed' && list.length === 0 && listStatus === 'succeeded' && (
            <div className="state-box">
              <h2>{hasFilters ? 'No hotels match your search' : 'No hotels yet'}</h2>
              <p>{hasFilters ? 'Try a different title or price range.' : 'Add your first hotel to get started.'}</p>
              {!hasFilters && <Link className="btn btn-primary" to="/hotels/new">Add hotel</Link>}
            </div>
          )}

          <div className={`hotel-list ${listStatus === 'loading' ? 'is-loading' : ''}`}>
            {list.map((h) => (
              <HotelCard key={h.id} hotel={h} onDelete={handleDelete} />
            ))}
          </div>

          <Pagination page={page} totalPages={totalPages} onChange={goToPage} />
        </section>
      </div>

      {popup && <Popup {...popup} onClose={() => setPopup(null)} />}
    </>
  );
}
