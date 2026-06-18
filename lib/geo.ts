/**
 * Returns the distance in meters between two latitude/longitude points
 * using the Haversine formula.
 */
export function distanceInMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Given a set of sites, returns the nearest site to the supplied
 * coordinates, along with the distance to it and whether the point falls
 * within that site's allowed radius.
 */
export function findNearestSite<
  T extends { latitude: number; longitude: number; radius_meters: number }
>(sites: T[], lat: number, lon: number): { site: T; distance: number; withinRadius: boolean } | null {
  if (sites.length === 0) return null;

  let nearest = sites[0];
  let nearestDistance = distanceInMeters(lat, lon, sites[0].latitude, sites[0].longitude);

  for (const site of sites.slice(1)) {
    const d = distanceInMeters(lat, lon, site.latitude, site.longitude);
    if (d < nearestDistance) {
      nearest = site;
      nearestDistance = d;
    }
  }

  return {
    site: nearest,
    distance: nearestDistance,
    withinRadius: nearestDistance <= nearest.radius_meters,
  };
}
