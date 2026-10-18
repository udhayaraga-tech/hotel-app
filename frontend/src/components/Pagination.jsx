export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  // Show first, last and the pages around the current one; collapse the rest to "…"
  const items = [];
  for (let i = 1; i <= totalPages; i += 1) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) items.push(i);
    else if (items[items.length - 1] !== '…') items.push('…');
  }

  return (
    <nav className="pagination" aria-label="Pagination">
      <button className="page-btn" disabled={page === 1} onClick={() => onChange(page - 1)}>
        Previous
      </button>
      {items.map((it, idx) =>
        it === '…' ? (
          <span key={`gap-${idx}`} className="page-gap">…</span>
        ) : (
          <button
            key={it}
            className={`page-btn ${it === page ? 'active' : ''}`}
            aria-current={it === page ? 'page' : undefined}
            onClick={() => onChange(it)}
          >
            {it}
          </button>
        )
      )}
      <button className="page-btn" disabled={page === totalPages} onClick={() => onChange(page + 1)}>
        Next
      </button>
    </nav>
  );
}
