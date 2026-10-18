CREATE TABLE IF NOT EXISTS hotels (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(100)  NOT NULL,
  description TEXT          NOT NULL,
  image_path  TEXT          NOT NULL,
  latitude    NUMERIC(9,6)  NOT NULL CHECK (latitude  BETWEEN -90  AND 90),
  longitude   NUMERIC(9,6)  NOT NULL CHECK (longitude BETWEEN -180 AND 180),
  price       NUMERIC(10,2) NOT NULL CHECK (price > 0),
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hotels_price ON hotels (price);
