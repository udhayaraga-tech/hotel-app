import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { clearCurrent, fetchHotel } from '../store/hotelsSlice.js';
import MapView from '../components/MapView.jsx';
import { distanceKm, formatPrice, PLACEHOLDER, truncate } from '../utils.js';

export default function HotelDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { current: hotel, currentStatus, currentError } = useSelector((s) => s.hotels);
  const [distance, setDistance] = useState(null);
  const [geoMsg, setGeoMsg] = useState('');

  useEffect(() => {
    dispatch(clearCurrent());
    dispatch(fetchHotel(id));
    setDistance(null);
    setGeoMsg('');
    return () => { dispatch(clearCurrent()); };
  }, [dispatch, id]);

  // Browser Geolocation API: how far is this hotel from the visitor?
  const showDistance = () => {
    if (!navigator.geolocation) return setGeoMsg('Geolocation is not supported by this browser');
    setGeoMsg('Finding your location…');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setDistance(distanceKm(coords.latitude, coords.longitude, hotel.latitude, hotel.longitude));
        setGeoMsg('');
      },
      () => setGeoMsg('Could not get your location. Allow location access and try again.')
    );
  };

  if (currentStatus === 'failed') {
    return (
      <div className="container state-box error">
        <Helmet><title>Hotel not found</title></Helmet>
        <p>{currentError}</p>
        <Link className="btn btn-primary" to="/">Back to hotels</Link>
      </div>
    );
  }
  if (!hotel || String(hotel.id) !== id) return <p className="container state-box">Loading hotel…</p>;

  const summary = truncate(hotel.description, 155);
  const imageUrl = hotel.image ? `${window.location.origin}${hotel.image}` : undefined;

  return (
    <>
      {/* Dynamic meta tags for SEO / social sharing */}
      <Helmet>
        <title>{hotel.title}</title>
        <meta name="description" content={summary} />
        <link rel="canonical" href={`${window.location.origin}/hotels/${hotel.id}`} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={hotel.title} />
        <meta property="og:description" content={summary} />
        {imageUrl && <meta property="og:image" content={imageUrl} />}
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <section className="banner">
        <div className="container banner-row">
          <h1>{hotel.title}</h1>
          <div className="actions">
            <Link className="btn btn-light" to="/">Back</Link>
            <Link className="btn btn-light" to={`/hotels/${hotel.id}/edit`}>Edit</Link>
          </div>
        </div>
      </section>

      <div className="container detail">
        <img className="detail-img" src={hotel.image || PLACEHOLDER} alt={`Photo of ${hotel.title}`} />

        <div className="panel detail-info">
          <p className="price price-lg">{formatPrice(hotel.price)} <small>per night</small></p>
          <h2>About this hotel</h2>
          <p className="detail-desc">{hotel.description}</p>
          <dl className="coords">
            <div><dt>Latitude</dt><dd>{hotel.latitude}</dd></div>
            <div><dt>Longitude</dt><dd>{hotel.longitude}</dd></div>
          </dl>
        </div>

        <div className="panel detail-map">
          <h2>Location</h2>
          <MapView latitude={hotel.latitude} longitude={hotel.longitude} title={hotel.title} />
          <button className="btn btn-outline btn-sm" onClick={showDistance}>Distance from my location</button>
          {distance !== null && <p className="geo-msg">About {distance.toFixed(1)} km from you</p>}
          {geoMsg && <p className="geo-msg" role="status">{geoMsg}</p>}
        </div>
      </div>
    </>
  );
}
