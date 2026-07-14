import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Motion } from '@legendapp/motion';
import { User as UserIcon } from 'lucide-react-native';
import { API_BASE_URL } from '@/services/api';

interface ProfileFrameProps {
  photoUrl?: string;
  frameUrl?: string;
  size?: number;
}

export const ProfileFrame = ({ photoUrl, frameUrl, size = 120 }: ProfileFrameProps) => {
  const [imageUri, setImageUri] = React.useState(() => resolvePhotoUrl(photoUrl));
  const padding = 0;
  const localFrame = getLocalFrame(frameUrl);

  React.useEffect(() => {
    setImageUri(resolvePhotoUrl(photoUrl));
  }, [photoUrl]);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={[styles.photoWrapper, { borderRadius: size / 2, padding }]}>
        {imageUri ? (
          <Image
            key={imageUri}
            source={{ uri: imageUri }}
            style={[styles.photo, { borderRadius: size / 2 }]}
            resizeMode="cover"
            onError={() => setImageUri(null)}
          />
        ) : (
          <View style={[styles.placeholder, { borderRadius: size / 2 }]}>
            <UserIcon size={size * 0.42} color="#00A86B" />
          </View>
        )}
      </View>
      {localFrame ? (
        <Motion.View
          initial={{ rotate: '-10deg', scale: 0.9 }}
          animate={{ rotate: '0deg', scale: 1 }}
          style={[
            styles.localFrame,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderColor: localFrame.borderColor,
              shadowColor: localFrame.shadowColor,
            },
          ]}
        >
          <View
            style={[
              styles.localFrameInner,
              {
                borderRadius: size / 2,
                borderColor: localFrame.innerColor,
              },
            ]}
          />
          <View
            style={[
              styles.localFrameAccent,
              {
                width: size * 0.22,
                height: size * 0.22,
                borderRadius: size * 0.11,
                backgroundColor: localFrame.accentColor,
              },
            ]}
          />
        </Motion.View>
      ) : frameUrl ? (
        <Motion.Image 
          initial={{ rotate: '-10deg', scale: 0.9 }}
          animate={{ rotate: '0deg', scale: 1 }}
          source={{ uri: frameUrl }} 
          style={[styles.frame, { width: size, height: size }]} 
        />
      ) : (
        <View style={[styles.glow, { width: size, height: size, borderRadius: size / 2 }]} />
      )}
    </View>
  );
};

function resolvePhotoUrl(photoUrl?: string) {
  if (!photoUrl) return null;

  const trimmed = photoUrl.trim();
  if (!trimmed) return null;

  if (
    trimmed.startsWith('data:image/') ||
    trimmed.startsWith('file:') ||
    trimmed.startsWith('content:')
  ) {
    return trimmed;
  }

  const apiOrigin = API_BASE_URL.replace(/\/api$/, '').replace(/\/$/, '');

  if (trimmed.startsWith('/uploads/')) {
    return `${apiOrigin}${trimmed}`;
  }

  return trimmed.replace(
    /^https?:\/\/(?:localhost|127\.0\.0\.1|10\.0\.2\.2)(?::\d+)?/i,
    apiOrigin,
  );
}

function getLocalFrame(frameUrl?: string) {
  if (!frameUrl?.startsWith('frame://')) return null;

  const frames: Record<string, { borderColor: string; innerColor: string; accentColor: string; shadowColor: string }> = {
    'frame://sprout': {
      borderColor: '#00FF9C',
      innerColor: 'rgba(0,255,156,0.35)',
      accentColor: '#00FF9C',
      shadowColor: '#00FF9C',
    },
    'frame://canopy': {
      borderColor: '#20D070',
      innerColor: '#0E6B3F',
      accentColor: '#B8FF7A',
      shadowColor: '#20D070',
    },
    'frame://trail': {
      borderColor: '#8A6A3A',
      innerColor: '#00FF9C',
      accentColor: '#FFD166',
      shadowColor: '#FFD166',
    },
    'frame://solar-gold': {
      borderColor: '#FFD700',
      innerColor: '#00FF9C',
      accentColor: '#FFF3A3',
      shadowColor: '#FFD700',
    },
    'frame://aurora': {
      borderColor: '#8B5CF6',
      innerColor: '#00FF9C',
      accentColor: '#38BDF8',
      shadowColor: '#8B5CF6',
    },
  };

  return frames[frameUrl] ?? frames['frame://sprout'];
}

const styles = StyleSheet.create({
  container: { justifyContent: 'center', alignItems: 'center' },
  photoWrapper: { width: '100%', height: '100%', overflow: 'hidden', backgroundColor: '#E8F5EF' },
  photo: { width: '100%', height: '100%' },
  placeholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5EF',
  },
  frame: { position: 'absolute', zIndex: 2 },
  localFrame: {
    position: 'absolute',
    zIndex: 2,
    borderWidth: 5,
    shadowOpacity: 0.45,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  localFrameInner: {
    position: 'absolute',
    top: 7,
    right: 7,
    bottom: 7,
    left: 7,
    borderWidth: 2,
  },
  localFrameAccent: {
    position: 'absolute',
    right: 4,
    bottom: 8,
    borderWidth: 3,
    borderColor: '#0A0A0A',
  },
  glow: { position: 'absolute', borderWidth: 2, borderColor: '#00FF9C', opacity: 0.3, zIndex: 1 }
});
