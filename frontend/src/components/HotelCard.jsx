import { Link, useNavigate } from 'react-router-dom';
import { formatPrice, truncate, PLACEHOLDER } from '../utils.js';

export default function HotelCard({ hotel, onDelete }) {
  const navigate = useNavigate();
  const stop = (e) => e.stopPropagation();

  return (
    <article className="hotel-card" onClick={() => navigate(`/hotels/${hotel.id}`)}>
      <img
        className="hotel-card__img"
        src={hotel.image || PLACEHOLDER}
        alt={`Photo of ${hotel.title}`}
        loading="lazy"
      />
      <div className="hotel-card__body">
        <h3><Link to={`/hotels/${hotel.id}`} onClick={stop}>{hotel.title}</Link></h3>
        <p>{truncate(hotel.description, 140)}</p>
      </div>
      <div className="hotel-card__side">
        <div className="price">{formatPrice(hotel.price)}</div>
        <div className="actions">
          <Link className="btn btn-primary btn-sm" to={`/hotels/${hotel.id}/edit`} onClick={stop}>
            Edit
          </Link>
          <button
            className="btn btn-danger btn-sm"
            onClick={(e) => { stop(e); onDelete(hotel); }}
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}
