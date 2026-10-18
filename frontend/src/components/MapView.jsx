// Shows the hotel location on an OpenStreetMap embed (no API key needed)
export default function MapView({ latitude, longitude, title }) {
  const d = 0.01;
  const bbox = [longitude - d, latitude - d, longitude + d, latitude + d].join(',');
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latitude},${longitude}`;
  const big = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=15/${latitude}/${longitude}`;

  return (
    <div className="map-wrap">
      <iframe title={`Map showing the location of ${title}`} src={src} loading="lazy" />
      <a href={big} target="_blank" rel="noreferrer">Open larger map</a>
    </div>
  );
}
