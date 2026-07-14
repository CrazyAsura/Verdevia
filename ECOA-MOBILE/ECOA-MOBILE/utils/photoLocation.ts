import type { ImagePickerAsset } from 'expo-image-picker';

type Coordinates = {
  latitude: number;
  longitude: number;
};

export function isValidCoordinates(coords: Coordinates | null | undefined): coords is Coordinates {
  if (!coords) return false;

  return (
    Number.isFinite(coords.latitude) &&
    Number.isFinite(coords.longitude) &&
    coords.latitude >= -90 &&
    coords.latitude <= 90 &&
    coords.longitude >= -180 &&
    coords.longitude <= 180
  );
}

function dmsToDecimal(value: unknown) {
  if (typeof value === 'number') return value;

  const rationalToNumber = (item: unknown) => {
    if (typeof item === 'number') return item;

    if (typeof item === 'string') {
      const [numerator, denominator] = item.split('/').map(Number);
      if (Number.isFinite(numerator) && Number.isFinite(denominator) && denominator !== 0) {
        return numerator / denominator;
      }

      const parsed = Number(item);
      return Number.isFinite(parsed) ? parsed : null;
    }

    if (item && typeof item === 'object') {
      const rational = item as Record<string, unknown>;
      const numerator = Number(rational.numerator ?? rational.num);
      const denominator = Number(rational.denominator ?? rational.den);
      if (Number.isFinite(numerator) && Number.isFinite(denominator) && denominator !== 0) {
        return numerator / denominator;
      }
    }

    return null;
  };

  if (Array.isArray(value) && value.length >= 3) {
    const [degrees, minutes, seconds] = value.map(rationalToNumber);
    if ([degrees, minutes, seconds].every((item) => item !== null)) {
      return (degrees as number) + (minutes as number) / 60 + (seconds as number) / 3600;
    }
  }

  if (typeof value === 'object' && value !== null) {
    const gps = value as Record<string, unknown>;
    const degrees = rationalToNumber(gps.degrees ?? gps.d);
    const minutes = rationalToNumber(gps.minutes ?? gps.m);
    const seconds = rationalToNumber(gps.seconds ?? gps.s);
    if (degrees !== null && minutes !== null && seconds !== null) {
      return degrees + minutes / 60 + seconds / 3600;
    }
  }

  if (typeof value === 'string') {
    const parts = value.split(',').map((part) => rationalToNumber(part.trim()));
    if (parts.length >= 3 && parts.every((part) => part !== null)) {
      const [degrees, minutes, seconds] = parts as number[];
      return degrees + minutes / 60 + seconds / 3600;
    }

    const decimal = Number(value);
    if (Number.isFinite(decimal)) return decimal;
  }

  return null;
}

function withHemisphere(value: number, ref?: unknown) {
  const hemisphere = String(ref || '').toUpperCase();
  return hemisphere === 'S' || hemisphere === 'W' ? -Math.abs(value) : value;
}

export function extractPhotoCoordinates(asset: ImagePickerAsset): Coordinates | null {
  const exif = asset.exif as Record<string, any> | undefined;
  if (!exif) return null;

  const gps = exif.GPS || exif.gps || exif;
  const rawLatitude = gps.GPSLatitude ?? gps.Latitude ?? gps.latitude;
  const rawLongitude = gps.GPSLongitude ?? gps.Longitude ?? gps.longitude;
  const latitudeRef = gps.GPSLatitudeRef ?? gps.LatitudeRef ?? gps.latitudeRef;
  const longitudeRef = gps.GPSLongitudeRef ?? gps.LongitudeRef ?? gps.longitudeRef;

  const latitude = dmsToDecimal(rawLatitude);
  const longitude = dmsToDecimal(rawLongitude);

  if (latitude === null || longitude === null) return null;

  const coords = {
    latitude: withHemisphere(latitude, latitudeRef),
    longitude: withHemisphere(longitude, longitudeRef),
  };

  return isValidCoordinates(coords) ? coords : null;
}
