// https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames

function lon2tile(lon, zoom) {
  return Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
}
function lat2tile(lat, zoom) {
  return Math.floor(
    ((1 -
      Math.log(
        Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)
      ) /
        Math.PI) /
      2) *
      Math.pow(2, zoom)
  );
}

function tile2long(x, z) {
  return (x / Math.pow(2, z)) * 360 - 180;
}
function tile2lat(y, z) {
  var n = Math.PI - (2 * Math.PI * y) / Math.pow(2, z);
  return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
}

function getTileCount({ n, w, s, e }, zoom = 9) {
  const top = lat2tile(n, zoom);
  const left = lon2tile(w, zoom);
  const bottom = lat2tile(s, zoom);
  const right = lon2tile(e, zoom);

  var width = Math.abs(left - right) + 1;
  var height = Math.abs(top - bottom) + 1;

  // total tiles
  return width * height; // -> eg. 377
}

function getTileBox({ n, w, s, e, z = 9, t }) {
  const x1 = lon2tile(+w, +z);
  const y1 = lat2tile(+n, +z);
  const x2 = lon2tile(+e, +z);
  const y2 = lat2tile(+s, +z);

  const xCount = Math.abs(x1 - x2) + 1;
  const yCount = Math.abs(y1 - y2) + 1;

  const total = xCount * yCount; // -> eg. 377
  return { x1, y1, x2, y2, total, zoom: +z, xCount, yCount, type: t };
}
module.exports = {
  lon2tile,
  lat2tile,
  getTileCount,
  getTileBox,
  tile2long,
  tile2lat,
};
