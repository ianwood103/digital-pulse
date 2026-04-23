const PLACEHOLDER_SVG =
  '<svg width="68" height="50" viewBox="0 0 68 50" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 31 C13 20, 18 35, 26 25 S39 14, 47 24 S56 34, 62 19" stroke="#c4d6fc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

export function decodePolyline(encoded: string): [number, number][] {
  const points: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let result = 0;
    let shift = 0;
    let byte: number;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20 && index < encoded.length);

    lat += result & 1 ? ~(result >> 1) : result >> 1;

    result = 0;
    shift = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20 && index < encoded.length);

    lng += result & 1 ? ~(result >> 1) : result >> 1;
    points.push([lat / 1e5, lng / 1e5]);
  }

  return points;
}

export function polylineToSvg(
  encoded: string | undefined,
  opts: { width?: number; height?: number } = {}
): string {
  const width = opts.width ?? 68;
  const height = opts.height ?? 50;

  if (!encoded) {
    return PLACEHOLDER_SVG;
  }

  const points = decodePolyline(encoded);
  if (points.length < 2) {
    return PLACEHOLDER_SVG;
  }

  const lats = points.map(([lat]) => lat);
  const lngs = points.map(([, lng]) => lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const latRange = maxLat - minLat || 1;
  const lngRange = maxLng - minLng || 1;
  const padding = 4;
  const drawableWidth = width - padding * 2;
  const drawableHeight = height - padding * 2;

  const path = points
    .map(([lat, lng], i) => {
      const x = padding + ((lng - minLng) / lngRange) * drawableWidth;
      const y = padding + ((maxLat - lat) / latRange) * drawableHeight;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="${path}" stroke="#1a56db" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}
