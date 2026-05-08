// Calculates distance between two coordinates in km
// Haversine formula
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const toRadian = (angle) => (Math.PI / 180) * angle;
  const distance = (a, b) => (Math.PI / 180) * (a - b);
  const RADIUS_OF_EARTH_IN_KM = 6371;

  const dLat = distance(lat2, lat1);
  const dLon = distance(lon2, lon1);

  lat1 = toRadian(lat1);
  lat2 = toRadian(lat2);

  const a =
    Math.pow(Math.sin(dLat / 2), 2) +
    Math.pow(Math.sin(dLon / 2), 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.asin(Math.sqrt(a));
  
  return RADIUS_OF_EARTH_IN_KM * c;
};

// Calculates speed in km/h given distance in km and time in seconds
export const calculateSpeed = (distanceKm, timeSeconds) => {
  if (timeSeconds === 0) return 0;
  const timeHours = timeSeconds / 3600;
  return distanceKm / timeHours;
};
