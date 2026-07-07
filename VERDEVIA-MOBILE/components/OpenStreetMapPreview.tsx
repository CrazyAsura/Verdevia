import React from 'react';
import {
  Image,
  LayoutChangeEvent,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LocateFixed, MapPin, Minus, Plus } from 'lucide-react-native';

type Coordinates = {
  latitude: number;
  longitude: number;
};

type OpenStreetMapPreviewProps = {
  latitude?: number | null;
  longitude?: number | null;
  height?: number;
  label?: string;
  dark?: boolean;
  onInteractionStart?: () => void;
  onInteractionEnd?: () => void;
};

const TILE_SIZE = 256;
const MIN_ZOOM = 3;
const MAX_ZOOM = 18;
const INITIAL_ZOOM = 16;

const TILE_PROVIDERS = [
  {
    key: 'carto-voyager',
    url: (x: number, y: number, zoom: number) =>
      `https://a.basemaps.cartocdn.com/rastertiles/voyager/${zoom}/${x}/${y}.png`,
  },
  {
    key: 'carto-light',
    url: (x: number, y: number, zoom: number) =>
      `https://a.basemaps.cartocdn.com/light_all/${zoom}/${x}/${y}.png`,
  },
  {
    key: 'osm',
    url: (x: number, y: number, zoom: number) =>
      `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`,
  },
];

function isValidCoordinate(latitude?: number | null, longitude?: number | null) {
  return (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function lonToWorldX(longitude: number, zoom: number) {
  return ((longitude + 180) / 360) * TILE_SIZE * 2 ** zoom;
}

function latToWorldY(latitude: number, zoom: number) {
  const boundedLatitude = clamp(latitude, -85.05112878, 85.05112878);
  const radians = (boundedLatitude * Math.PI) / 180;
  return (
    ((1 - Math.log(Math.tan(radians) + 1 / Math.cos(radians)) / Math.PI) / 2) *
    TILE_SIZE *
    2 ** zoom
  );
}

function worldXToLon(x: number, zoom: number) {
  return (x / (TILE_SIZE * 2 ** zoom)) * 360 - 180;
}

function worldYToLat(y: number, zoom: number) {
  const n = Math.PI - (2 * Math.PI * y) / (TILE_SIZE * 2 ** zoom);
  return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
}

function formatCoordinate(value: number) {
  return value.toFixed(5);
}

function normalizeTileCoords(x: number, y: number, zoom: number) {
  const maxTile = 2 ** zoom;
  const wrappedX = ((x % maxTile) + maxTile) % maxTile;
  const clampedY = clamp(y, 0, maxTile - 1);

  return { x: wrappedX, y: clampedY };
}

function getTileUrl(x: number, y: number, zoom: number, providerIndex: number) {
  const tile = normalizeTileCoords(x, y, zoom);
  const provider = TILE_PROVIDERS[providerIndex] || TILE_PROVIDERS[0];

  return provider.url(tile.x, tile.y, zoom);
}

export function OpenStreetMapPreview({
  latitude,
  longitude,
  height = 220,
  label,
  dark = false,
  onInteractionStart,
  onInteractionEnd,
}: OpenStreetMapPreviewProps) {
  const hasCoords = isValidCoordinate(latitude, longitude);
  const initialCoords = React.useMemo<Coordinates | null>(() => {
    if (!hasCoords) return null;
    return { latitude: latitude as number, longitude: longitude as number };
  }, [hasCoords, latitude, longitude]);

  const [mapSize, setMapSize] = React.useState({ width: 0, height });
  const [zoom, setZoom] = React.useState(INITIAL_ZOOM);
  const [center, setCenter] = React.useState<Coordinates | null>(initialCoords);
  const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });
  const [tileProviderIndex, setTileProviderIndex] = React.useState(0);
  const [failedTiles, setFailedTiles] = React.useState<Record<string, number>>({});

  React.useEffect(() => {
    setCenter(initialCoords);
    setDragOffset({ x: 0, y: 0 });
    setTileProviderIndex(0);
    setFailedTiles({});
  }, [initialCoords]);

  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gesture) =>
          Boolean(center) && (Math.abs(gesture.dx) > 4 || Math.abs(gesture.dy) > 4),
        onMoveShouldSetPanResponderCapture: (_, gesture) =>
          Boolean(center) && (Math.abs(gesture.dx) > 4 || Math.abs(gesture.dy) > 4),
        onPanResponderGrant: () => {
          onInteractionStart?.();
        },
        onPanResponderMove: (_, gesture) => {
          setDragOffset({ x: gesture.dx, y: gesture.dy });
        },
        onPanResponderRelease: (_, gesture) => {
          onInteractionEnd?.();
          if (!center) return;

          const worldX = lonToWorldX(center.longitude, zoom) - gesture.dx;
          const worldY = latToWorldY(center.latitude, zoom) - gesture.dy;

          setCenter({
            latitude: clamp(worldYToLat(worldY, zoom), -85.05112878, 85.05112878),
            longitude: worldXToLon(worldX, zoom),
          });
          setDragOffset({ x: 0, y: 0 });
        },
        onPanResponderTerminate: () => {
          onInteractionEnd?.();
          setDragOffset({ x: 0, y: 0 });
        },
      }),
    [center, onInteractionEnd, onInteractionStart, zoom],
  );

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setMapSize({ width, height });
  };

  const resetToCapturedLocation = () => {
    if (!initialCoords) return;
    setCenter(initialCoords);
    setDragOffset({ x: 0, y: 0 });
  };

  const changeZoom = (nextZoom: number) => {
    setZoom(clamp(nextZoom, MIN_ZOOM, MAX_ZOOM));
    setDragOffset({ x: 0, y: 0 });
    setTileProviderIndex(0);
    setFailedTiles({});
  };

  const handleTileError = (tileKey: string) => {
    setFailedTiles((current) => {
      if (current[tileKey] === tileProviderIndex) return current;
      return { ...current, [tileKey]: tileProviderIndex };
    });

    setTileProviderIndex((current) => Math.min(current + 1, TILE_PROVIDERS.length - 1));
  };

  if (!hasCoords || !center) {
    return (
      <View
        style={[
          styles.empty,
          { height, backgroundColor: dark ? '#111' : '#F1F5F2' },
        ]}
      >
        <MapPin size={22} color="#00A86B" />
        <Text style={[styles.emptyText, { color: dark ? '#AAA' : '#66736B' }]}>
          Localizacao ainda nao capturada
        </Text>
      </View>
    );
  }

  const markerCoords = initialCoords || center;
  const centerWorldX = lonToWorldX(center.longitude, zoom);
  const centerWorldY = latToWorldY(center.latitude, zoom);
  const topLeftWorldX = centerWorldX - mapSize.width / 2 - dragOffset.x;
  const topLeftWorldY = centerWorldY - mapSize.height / 2 - dragOffset.y;
  const markerLeft = lonToWorldX(markerCoords.longitude, zoom) - topLeftWorldX;
  const markerTop = latToWorldY(markerCoords.latitude, zoom) - topLeftWorldY;
  const firstTileX = Math.floor(topLeftWorldX / TILE_SIZE) - 1;
  const firstTileY = Math.floor(topLeftWorldY / TILE_SIZE) - 1;
  const columns = Math.ceil(mapSize.width / TILE_SIZE) + 3;
  const rows = Math.ceil(mapSize.height / TILE_SIZE) + 3;

  const tiles = Array.from({ length: columns * rows }, (_, index) => {
    const col = index % columns;
    const row = Math.floor(index / columns);
    const x = firstTileX + col;
    const y = firstTileY + row;

    return {
      key: `${zoom}-${x}-${y}`,
      uri: getTileUrl(x, y, zoom, tileProviderIndex),
      left: x * TILE_SIZE - topLeftWorldX,
      top: y * TILE_SIZE - topLeftWorldY,
    };
  });

  const hasTileErrors = Object.keys(failedTiles).length > 0;

  return (
    <View
      style={[styles.container, { height, backgroundColor: '#DCE8DF' }]}
      onLayout={handleLayout}
    >
      <View style={styles.mapFallback}>
        <View style={[styles.fallbackRoad, styles.fallbackRoadHorizontal]} />
        <View style={[styles.fallbackRoad, styles.fallbackRoadVertical]} />
        <View style={[styles.fallbackRoad, styles.fallbackRoadDiagonal]} />
        <View style={styles.centerTarget}>
          <View style={styles.centerTargetDot} />
        </View>
      </View>

      <View style={StyleSheet.absoluteFill} {...panResponder.panHandlers}>
        {tiles.map((tile) => (
          <Image
            key={tile.key}
            source={{ uri: tile.uri }}
            style={[styles.tile, { left: tile.left, top: tile.top }]}
            onError={() => handleTileError(tile.key)}
          />
        ))}
      </View>

      <View
        style={[
          styles.markerWrap,
          {
            left: markerLeft - 23,
            top: markerTop - 46,
          },
        ]}
        pointerEvents="none"
      >
        <View style={styles.marker}>
          <MapPin size={26} color="#001B12" fill="#00FF9C" />
        </View>
      </View>

      {hasTileErrors && (
        <View style={[styles.tileErrorBadge, { backgroundColor: dark ? '#161616' : '#FFFFFF' }]} pointerEvents="none">
          <Text style={[styles.tileErrorText, { color: dark ? '#FFFFFF' : '#102018' }]}>
            Local capturado
          </Text>
        </View>
      )}

      <View style={styles.controls} pointerEvents="box-none">
        <TouchableOpacity style={styles.controlButton} onPress={() => changeZoom(zoom + 1)}>
          <Plus size={18} color="#001B12" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={() => changeZoom(zoom - 1)}>
          <Minus size={18} color="#001B12" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={resetToCapturedLocation}>
          <LocateFixed size={18} color="#001B12" />
        </TouchableOpacity>
      </View>

      <View style={[styles.caption, { backgroundColor: dark ? '#161616' : '#FFF' }]}>
        <Text style={[styles.captionTitle, { color: dark ? '#FFF' : '#102018' }]}>
          {label || 'Ponto capturado'}
        </Text>
        <Text style={styles.captionCoords}>
          {formatCoordinate(markerCoords.latitude)}, {formatCoordinate(markerCoords.longitude)}
        </Text>
        <Text style={styles.attribution}>© OpenStreetMap</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  tile: {
    position: 'absolute',
    width: TILE_SIZE,
    height: TILE_SIZE,
    backgroundColor: '#DCE8DF',
  },
  mapFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#DCE8DF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackRoad: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.76)',
    borderWidth: 1,
    borderColor: 'rgba(0, 168, 107, 0.12)',
  },
  fallbackRoadHorizontal: {
    left: -30,
    right: -30,
    top: '44%',
    height: 34,
  },
  fallbackRoadVertical: {
    top: -25,
    bottom: -25,
    left: '58%',
    width: 30,
  },
  fallbackRoadDiagonal: {
    width: '130%',
    height: 28,
    transform: [{ rotate: '-24deg' }],
  },
  centerTarget: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    borderColor: 'rgba(0, 168, 107, 0.34)',
    backgroundColor: 'rgba(0, 255, 156, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerTargetDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00A86B',
  },
  markerWrap: {
    position: 'absolute',
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 4,
    elevation: 8,
  },
  marker: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#00FF9C',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  controls: {
    position: 'absolute',
    top: 12,
    right: 12,
    gap: 8,
  },
  controlButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#00FF9C',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  tileErrorBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 156, 0.28)',
  },
  tileErrorText: {
    fontSize: 11,
    fontWeight: '800',
  },
  caption: {
    position: 'absolute',
    left: 12,
    right: 60,
    bottom: 12,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  captionTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  captionCoords: {
    fontSize: 11,
    fontWeight: '700',
    color: '#00A86B',
  },
  attribution: {
    marginTop: 2,
    fontSize: 9,
    fontWeight: '600',
    color: '#7A8A82',
  },
  empty: {
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,168,107,0.18)',
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
