import { Routes, Route, Link, NavLink } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import HotelListPage from './pages/HotelListPage.jsx';
import HotelFormPage from './pages/HotelFormPage.jsx';
import HotelDetailPage from './pages/HotelDetailPage.jsx';

function NotFound() {
  return (
    <div className="container state-box">
      <Helmet><title>Page not found | Hotel Manager</title></Helmet>
      <h1>Page not found</h1>
      <p>The page you are looking for does not exist.</p>
      <Link className="btn btn-primary" to="/">Back to hotels</Link>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Helmet defaultTitle="Hotel Manager" titleTemplate="%s | Hotel Manager">
        <meta name="description" content="Browse, add and manage hotels with prices and map locations." />
      </Helmet>

      <header className="site-header">
        <div className="container header-row">
          <Link to="/" className="logo">Hotel<span>Manager</span></Link>
          <nav aria-label="Main">
            <NavLink to="/" end>Hotels</NavLink>
            <NavLink to="/hotels/new" className="btn btn-primary">Add hotel</NavLink>
          </nav>
        </div>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<HotelListPage />} />
          <Route path="/hotels/new" element={<HotelFormPage />} />
          <Route path="/hotels/:id" element={<HotelDetailPage />} />
          <Route path="/hotels/:id/edit" element={<HotelFormPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <footer className="site-footer">
        <div className="container">Hotel Manager · React, Redux, Express and PostgreSQL</div>
      </footer>
    </>
  );
}
