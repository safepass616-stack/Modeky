// lib/geo.ts
// Geolocation utilities for site radius validation

interface Site {
  id: string;
  site_name: string;
  latitude: number | null;
  longitude: number | null;
  radius_meters: number | null;
}

interface NearestSiteResult {
  site: Site;
  distanceMeters: number;
  withinRadius: boolean;
}

// ── Haversine Distance ────────────────────────────────────────────────────

function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// ── Find Nearest Site ─────────────────────────────────────────────────────

export function findNearestSite(
  sites: Site[],
  latitude: number,
  longitude: number
): NearestSiteResult | null {
  if (!sites || sites.length === 0) return null;

  let nearest: NearestSiteResult | null = null;

  for (const site of sites) {
    if (site.latitude == null || site.longitude == null || site.radius_meters == null) {
      continue;
    }

    const distance = haversineDistance(
      latitude,
      longitude,
      site.latitude,
      site.longitude
    );

    if (!nearest || distance < nearest.distanceMeters) {
      nearest = {
        site,
        distanceMeters: Math.round(distance),
        withinRadius: distance <= site.radius_meters,
      };
    }
  }

  return nearest;
}

// ── Check if Coordinates are Valid ────────────────────────────────────────

export function isValidCoordinates(latitude: number, longitude: number): boolean {
  return (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    !isNaN(latitude) &&
    !isNaN(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}