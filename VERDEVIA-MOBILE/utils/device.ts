import { Platform } from 'react-native';

export const isLowCapacityDevice = () => {
  // Simulação de detecção de hardware
  // Em produção usaríamos expo-device ou react-native-device-info
  // Dispositivos Android mais antigos ou modelos específicos costumam ser o alvo
  if (Platform.OS === 'android' && Platform.Version < 28) return true;
  return false;
};

export const getOptimalModelConfig = () => {
  if (isLowCapacityDevice()) {
    return {
      modelSize: 'small',
      useQuantization: true,
      maxImageRes: 800
    };
  }
  return {
    modelSize: 'large',
    useQuantization: false,
    maxImageRes: 1920
  };
};
