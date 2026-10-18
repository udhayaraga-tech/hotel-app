const express = require('express');
const fs = require('fs');
const path = require('path');
const pool = require('../db');
const { upload, UPLOAD_DIR } = require('../middleware/upload');
const { validateHotel } = require('../middleware/validate');

const router = express.Router();
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// ---------- helpers ----------
const toHotel = (r) => ({
  id: r.id,
  title: r.title,
  description: r.description,
  image: r.image_path,
  latitude: Number(r.latitude), // NUMERIC comes back from pg as a string
  longitude: Number(r.longitude),
  price: Number(r.price),
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

// Delete a stored image (given as "/uploads/<file>"); ignore errors if already gone.
function removeImage(imagePath) {
  if (!imagePath) return;
  fs.unlink(path.join(UPLOAD_DIR, path.basename(imagePath)), () => {});
}

const escapeLike = (s) => s.replace(/[\\%_]/g, '\\$&');

router.param('id', (req, res, next, id) => {
  if (!/^\d+$/.test(id)) return res.status(400).json({ message: 'Invalid hotel id' });
  next();
});

// ---------- GET /api/hotels?search=&minPrice=&maxPrice=&limit=&offset= ----------
router.get(
  '/',
  wrap(async (req, res) => {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 6, 1), 50);
    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);

    const where = [];
    const params = [];

    const search = String(req.query.search ?? '').trim();
    if (search) {
      params.push(`%${escapeLike(search)}%`);
      where.push(`title ILIKE $${params.length}`);
    }
    const min = parseFloat(req.query.minPrice);
    if (!Number.isNaN(min)) {
      params.push(min);
      where.push(`price >= $${params.length}`);
    }
    const max = parseFloat(req.query.maxPrice);
    if (!Number.isNaN(max)) {
      params.push(max);
      where.push(`price <= $${params.length}`);
    }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const countRes = await pool.query(`SELECT COUNT(*)::int AS total FROM hotels ${whereSql}`, params);

    const dataRes = await pool.query(
      `SELECT * FROM hotels ${whereSql}
       ORDER BY created_at DESC, id DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    res.json({ data: dataRes.rows.map(toHotel), total: countRes.rows[0].total, limit, offset });
  })
);

// ---------- GET /api/hotels/:id ----------
router.get(
  '/:id',
  wrap(async (req, res) => {
    const { rows } = await pool.query('SELECT * FROM hotels WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Hotel not found' });
    res.json(toHotel(rows[0]));
  })
);

// ---------- POST /api/hotels ----------
router.post(
  '/',
  upload.single('image'),
  wrap(async (req, res) => {
    const { errors, values } = validateHotel(req.body, { imageProvided: Boolean(req.file) });
    if (Object.keys(errors).length) {
      if (req.file) removeImage(req.file.filename);
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    const { rows } = await pool.query(
      `INSERT INTO hotels (title, description, image_path, latitude, longitude, price)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [values.title, values.description, `/uploads/${req.file.filename}`,
       values.latitude, values.longitude, values.price]
    );
    res.status(201).json(toHotel(rows[0]));
  })
);

// ---------- PUT /api/hotels/:id ----------
router.put(
  '/:id',
  upload.single('image'),
  wrap(async (req, res) => {
    const existing = await pool.query('SELECT * FROM hotels WHERE id = $1', [req.params.id]);
    if (!existing.rows.length) {
      if (req.file) removeImage(req.file.filename);
      return res.status(404).json({ message: 'Hotel not found' });
    }

    const { errors, values } = validateHotel(req.body, { imageProvided: true });
    if (Object.keys(errors).length) {
      if (req.file) removeImage(req.file.filename);
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    const oldImage = existing.rows[0].image_path;
    const newImage = req.file ? `/uploads/${req.file.filename}` : oldImage;

    const { rows } = await pool.query(
      `UPDATE hotels
         SET title = $1, description = $2, image_path = $3,
             latitude = $4, longitude = $5, price = $6, updated_at = NOW()
       WHERE id = $7 RETURNING *`,
      [values.title, values.description, newImage, values.latitude, values.longitude,
       values.price, req.params.id]
    );

    if (req.file) removeImage(oldImage); // replaced image no longer needed
    res.json(toHotel(rows[0]));
  })
);

// ---------- DELETE /api/hotels/:id ----------
router.delete(
  '/:id',
  wrap(async (req, res) => {
    const { rows } = await pool.query('DELETE FROM hotels WHERE id = $1 RETURNING image_path', [
      req.params.id,
    ]);
    if (!rows.length) return res.status(404).json({ message: 'Hotel not found' });
    removeImage(rows[0].image_path);
    res.json({ message: 'Hotel deleted successfully' });
  })
);

module.exports = router;
