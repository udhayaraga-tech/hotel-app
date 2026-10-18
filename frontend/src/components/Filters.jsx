import { useEffect, useState } from 'react';

export default function Filters({ values, onApply, onReset }) {
  const [form, setForm] = useState(values);
  const [error, setError] = useState('');

  // Keep inputs in sync when the URL changes (back button, reset)
  useEffect(() => { setForm(values); }, [values]);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    const min = form.minPrice === '' ? null : Number(form.minPrice);
    const max = form.maxPrice === '' ? null : Number(form.maxPrice);
    if ((min !== null && min < 0) || (max !== null && max < 0)) return setError('Prices cannot be negative');
    if (min !== null && max !== null && min > max) return setError('Min price cannot be more than max price');
    setError('');
    onApply(form);
  };

  return (
    <form className="panel filters" onSubmit={submit} aria-label="Search and filters">
      <h2>Search</h2>
      <label htmlFor="f-search">Hotel title</label>
      <input id="f-search" name="search" type="search" placeholder="e.g. Sea View"
             value={form.search} onChange={change} />

      <h2>Price range</h2>
      <div className="price-inputs">
        <div>
          <label htmlFor="f-min">Min</label>
          <input id="f-min" name="minPrice" type="number" min="0" step="any" placeholder="0"
                 value={form.minPrice} onChange={change} />
        </div>
        <div>
          <label htmlFor="f-max">Max</label>
          <input id="f-max" name="maxPrice" type="number" min="0" step="any" placeholder="Any"
                 value={form.maxPrice} onChange={change} />
        </div>
      </div>
      {error && <p className="field-error" role="alert">{error}</p>}

      <button className="btn btn-primary btn-block" type="submit">Apply</button>
      <button className="btn btn-outline btn-block" type="button" onClick={onReset}>Reset</button>
    </form>
  );
}
