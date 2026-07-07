import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator, Modal, useWindowDimensions } from 'react-native';
import { Motion } from '@legendapp/motion';
import { ChevronLeft, Camera, ChevronDown, CheckCircle2, ShieldCheck, ShieldAlert, Zap, LocateFixed, Image as ImageIcon } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { CameraView, useCameraPermissions } from 'expo-camera';
import api from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { PollutionType, ComplaintPrivacy } from '@/constants/enums';
import { useTheme } from '@/context/ThemeContext';
import { useAIAnalysis } from '@/hooks/useAIAnalysis';
import * as Location from 'expo-location';
import { OpenStreetMapPreview } from '@/components/OpenStreetMapPreview';
import { extractPhotoCoordinates, isValidCoordinates } from '@/utils/photoLocation';

// Gluestack Components
import { Textarea, TextareaInput } from '@/components/ui/textarea';
import {
  Select, SelectTrigger, SelectInput, SelectIcon,
  SelectPortal, SelectBackdrop, SelectContent,
  SelectItem
} from '@/components/ui/select';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetItem,
  ActionsheetItemText,
  ActionsheetIcon,
} from '@/components/ui/actionsheet';

export default function MakeComplaint() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isDark } = useTheme();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState<PollutionType>(PollutionType.URBANO);
  const [privacy, setPrivacy] = useState<ComplaintPrivacy>(ComplaintPrivacy.PUBLICO);
  const [showActionsheet, setShowActionsheet] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [mapInteracting, setMapInteracting] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [coords, setCoords] = useState<{ latitude: number, longitude: number } | null>(null);
  const cameraRef = React.useRef<CameraView>(null);
  const capturedCoordsRef = React.useRef<{ latitude: number; longitude: number } | null>(null);

  const { analyzeImage, analyzing, result: aiResult, config: deviceLimits } = useAIAnalysis();

  const formatLocationLabel = (nextCoords: { latitude: number; longitude: number }) =>
    `GPS ${nextCoords.latitude.toFixed(5)}, ${nextCoords.longitude.toFixed(5)}`;

  const captureLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        "Geolocalização Obrigatória",
        "Para garantir a validade da denúncia, é obrigatório permitir o acesso à sua localização ao anexar provas."
      );
      return null;
    }

    setLoading(true);
    try {
      const locationData = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const nextCoords = {
        latitude: locationData.coords.latitude,
        longitude: locationData.coords.longitude
      };
      if (!isValidCoordinates(nextCoords)) {
        Alert.alert("Erro de GPS", "A localizacao retornada pelo aparelho e invalida. Tente novamente em alguns segundos.");
        return null;
      }
      capturedCoordsRef.current = nextCoords;
      setCoords(nextCoords);
      setLocation(formatLocationLabel(nextCoords));
      return nextCoords;
    } catch (e) {
      Alert.alert("Erro de GPS", "Não foi possível obter sua localização atual. Verifique se o seu GPS está ligado.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const ensureComplaintCoordinates = async () => {
    if (isValidCoordinates(coords)) {
      return coords;
    }

    if (isValidCoordinates(capturedCoordsRef.current)) {
      const savedCoords = capturedCoordsRef.current;

      setCoords(savedCoords);
      setLocation(formatLocationLabel(savedCoords));

      return savedCoords;
    }

    const currentCoords = await captureLocation();

    if (isValidCoordinates(currentCoords)) {
      capturedCoordsRef.current = currentCoords;
      setCoords(currentCoords);
      setLocation(formatLocationLabel(currentCoords));

      return currentCoords;
    }

    return null;
  };

  const takePhoto = async () => {
    const currentCoords = await captureLocation();
    if (!currentCoords) return;

    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert("Permissão Necessária", "Precisamos de acesso à câmera para tirar fotos.");
        return;
      }
    }
    setShowActionsheet(false);
    setShowCamera(true);
  };

  const capturePhoto = async () => {
    if (!cameraRef.current) return;

    let finalCoords = capturedCoordsRef.current;

    if (!isValidCoordinates(finalCoords)) {
      finalCoords = await captureLocation();
    }

    if (!isValidCoordinates(finalCoords)) {
      Alert.alert(
        "Localização obrigatória",
        "Não foi possível obter sua localização atual. Ative o GPS e tente novamente."
      );
      return;
    }

    const photo = await cameraRef.current.takePictureAsync({
      quality: 0.5,
      base64: false,
      exif: true,
    });

    if (!photo) return;

    capturedCoordsRef.current = finalCoords;
    setCoords(finalCoords);
    setLocation(formatLocationLabel(finalCoords));

    setImage(photo.uri);
    analyzeImage(photo.uri, {
      complaintText: description,
      location: finalCoords,
    });
    setShowCamera(false);
  };

  const pickImage = () => {
    setShowActionsheet(true);
  };

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.5,
      exif: true,
    });

    if (result.canceled) {
      setShowActionsheet(false);
      return;
    }

    const asset = result.assets[0];

    let finalCoords = extractPhotoCoordinates(asset);

    if (!isValidCoordinates(finalCoords)) {
      finalCoords = await captureLocation();
    }

    if (!isValidCoordinates(finalCoords)) {
      Alert.alert(
        "Localização obrigatória",
        "Não foi possível obter a localização. Ative o GPS e tente novamente."
      );
      setShowActionsheet(false);
      return;
    }

    capturedCoordsRef.current = finalCoords;
    setCoords(finalCoords);
    setLocation(formatLocationLabel(finalCoords));

    setImage(asset.uri);
    analyzeImage(asset.uri, {
      complaintText: description,
      location: finalCoords,
    });

    setShowActionsheet(false);
  };

  const handleSubmit = async () => {
    if (!description) {
      Alert.alert(t('error'), t('fill_all'));
      return;
    }

    if (!image) {
      Alert.alert("Foto obrigatória", "Tire uma foto pela câmera para registrar a queixa.");
      return;
    }

    const submissionCoords = await ensureComplaintCoordinates();
    if (!submissionCoords) return;

    if (aiResult?.isFake) {
      Alert.alert(
        "Aviso de Autenticidade",
        "Imagem possivelmente gerada por IA ou com sinais de edição. Envio bloqueado: tire uma nova foto diretamente pela câmera."
      );
      return;
    }

    if (!aiResult) {
      Alert.alert(
        "Análise pendente",
        "Aguarde a verificação da imagem antes de enviar a denúncia."
      );
      return;
    }

    submitComplaint(submissionCoords);
  };

  const submitComplaint = async (submissionCoords: { latitude: number; longitude: number } | null) => {
    setLoading(true);
    try {
      const storedUser = await AsyncStorage.getItem('user');
      const user = JSON.parse(storedUser || '{}');
      const userId = user.id || user._id;

      if (!userId) {
        Alert.alert("Erro", "Usuario nao identificado. Entre novamente para enviar a queixa.");
        return;
      }

      const payload = {
        type,
        description,
        location: location || (submissionCoords ? formatLocationLabel(submissionCoords) : ''),
        privacy,
        imageUrl: image || '',
        userId,
        latitude: submissionCoords?.latitude,
        longitude: submissionCoords?.longitude,
        ip: 'capture_on_server', // Metadata for audit
      };

      await api.post('/complaints', payload);
      Alert.alert("Sucesso", "Queixa enviada com sucesso!");
      router.replace('/history');
    } catch (e: any) {
      const message = Array.isArray(e?.response?.data?.message)
        ? e.response.data.message.join('\n')
        : e?.response?.data?.message || e?.message || "Falha ao enviar queixa.";
      console.error('Erro ao enviar queixa:', e?.response?.data || e?.message || e);
      Alert.alert("Erro", message);
    } finally {
      setLoading(false);
    }
  };

  const theme = {
    bg: isDark ? '#0A0A0A' : '#F8F9FA',
    card: isDark ? '#161616' : '#FFF',
    input: isDark ? '#222' : '#EEE',
    border: isDark ? '#222' : '#DDD',
    text: isDark ? '#FFF' : '#333',
    subtext: isDark ? '#666' : '#888'
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.bg }]}
      contentContainerStyle={styles.content}
      scrollEnabled={!mapInteracting}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: theme.card }]}>
          <ChevronLeft color="#00FF9C" size={30} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>{t('complaint')}</Text>
      </View>

      <Motion.View initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>

        {/* Device Optimization Indicator */}
        <View style={styles.optimizerBadge}>
          <Zap size={12} color="#00FF9C" />
          <Text style={styles.optimizerTxt}>
            {deviceLimits.modelSize === 'small' ? 'Modo Otimizado (Lite AI)' : 'Modo Alta Performance (Full AI)'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>{t('pollution_type')}</Text>
          <Select onValueChange={(v) => setType(v as PollutionType)} defaultValue={PollutionType.URBANO}>
            <SelectTrigger style={[styles.gluestackSelect, { backgroundColor: theme.input, borderColor: theme.border }]}>
              <SelectInput placeholder={t('pollution_type')} style={{ color: theme.text }} />
              <SelectIcon style={{ marginLeft: 'auto' }} as={ChevronDown} />
            </SelectTrigger>
            <SelectPortal>
              <SelectBackdrop />
              <SelectContent style={{ backgroundColor: theme.card }}>
                {Object.values(PollutionType).map(v => (
                  <SelectItem key={v} label={v} value={v} />
                ))}
              </SelectContent>
            </SelectPortal>
          </Select>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>{t('photo_required')}</Text>
          <TouchableOpacity
            style={[styles.photoBox, { backgroundColor: theme.input, borderColor: theme.border }]}
            onPress={pickImage}
          >
            {image ? (
              <Image source={{ uri: image }} style={styles.preview} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Camera color="#666" size={40} />
                <Text style={styles.photoTxt}>{t('photo_required')}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.mapHeader}>
            <Text style={[styles.label, styles.mapLabel]}>Mapa do local</Text>
            <TouchableOpacity style={styles.locationButton} onPress={captureLocation} disabled={loading}>
              <LocateFixed color="#001B12" size={15} />
              <Text style={styles.locationButtonText}>Atualizar GPS</Text>
            </TouchableOpacity>
          </View>
          {coords && (
            <View style={[styles.coordsBadge, { backgroundColor: theme.input, borderColor: theme.border }]}>
              <LocateFixed color="#00FF9C" size={16} />
              <View style={styles.coordsBody}>
                <Text style={[styles.coordsTitle, { color: theme.text }]}>
                  Coordenadas capturadas
                </Text>
                <Text style={styles.coordsText}>
                  Lat: {coords.latitude.toFixed(5)} | Long: {coords.longitude.toFixed(5)}
                </Text>
              </View>
            </View>
          )}
          <OpenStreetMapPreview
            latitude={coords?.latitude}
            longitude={coords?.longitude}
            label={location || 'Local da queixa'}
            dark={isDark}
            onInteractionStart={() => setMapInteracting(true)}
            onInteractionEnd={() => setMapInteracting(false)}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>{t('description')}</Text>
          <Textarea style={[styles.textareaBase, { backgroundColor: theme.input, borderColor: theme.border }]}>
            <TextareaInput
              placeholder={t('description')}
              style={{ color: theme.text }}
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
            />
          </Textarea>
        </View>

        {/* AI Analysis Feedback (NEW) */}
        {image && (
          <View style={[styles.aiFeedback, { backgroundColor: aiResult?.isFake ? 'rgba(255, 75, 75, 0.1)' : 'rgba(0, 255, 156, 0.1)' }]}>
            {analyzing ? (
              <View style={styles.aiLoading}>
                <ActivityIndicator color="#00FF9C" />
                <Text style={styles.aiLoadingTxt}>Verificando autenticidade e denúncia ambiental...</Text>
              </View>
            ) : aiResult ? (
              <View style={styles.aiResult}>
                <View style={styles.aiHeader}>
                  {aiResult.isFake ? <ShieldAlert color="#FF4B4B" size={20} /> : <ShieldCheck color="#00FF9C" size={20} />}
                  <Text style={[styles.aiStatus, { color: aiResult.isFake ? '#FF4B4B' : '#00FF9C' }]}>
                    {aiResult.message}
                  </Text>
                </View>
                <Text style={styles.aiConfidence}>Nível de Confiança: {(aiResult.confidence * 100).toFixed(1)}%</Text>
              </View>
            ) : null}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.label}>{t('visibility')}</Text>
          <Select onValueChange={(v) => setPrivacy(v as ComplaintPrivacy)} defaultValue={ComplaintPrivacy.PUBLICO}>
            <SelectTrigger style={[styles.gluestackSelect, { backgroundColor: theme.input, borderColor: theme.border }]}>
              <SelectInput placeholder={t('visibility')} style={{ color: theme.text }} />
              <SelectIcon style={{ marginLeft: 'auto' }} as={ChevronDown} />
            </SelectTrigger>
            <SelectPortal>
              <SelectBackdrop />
              <SelectContent style={{ backgroundColor: theme.card }}>
                <SelectItem label={t('public')} value={ComplaintPrivacy.PUBLICO} />
                <SelectItem label={t('private')} value={ComplaintPrivacy.PRIVADO} />
                <SelectItem label={t('mixed')} value={ComplaintPrivacy.MISTO} />
              </SelectContent>
            </SelectPortal>
          </Select>
          <Text style={styles.infoTxt}>{privacy === ComplaintPrivacy.MISTO ? t('anonymous_desc') : ''}</Text>
        </View>

        <TouchableOpacity style={styles.publishBtn} onPress={handleSubmit} disabled={loading || analyzing}>
          {loading ? <ActivityIndicator color="#000" /> : (
            <>
              <CheckCircle2 color="#000" size={20} />
              <Text style={styles.publishBtnTxt}>{t('publish')}</Text>
            </>
          )}
        </TouchableOpacity>
      </Motion.View>

      <Actionsheet isOpen={showActionsheet} onClose={() => setShowActionsheet(false)}>
        <ActionsheetBackdrop />
        <ActionsheetContent style={{ backgroundColor: theme.card, borderTopLeftRadius: 30, borderTopRightRadius: 30 }}>
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator style={{ backgroundColor: theme.border }} />
          </ActionsheetDragIndicatorWrapper>

          <View style={{ width: '100%', padding: 20, gap: 10 }}>
            <Text style={{ color: theme.subtext, fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 10, letterSpacing: 1 }}>
              {t('select_photo_source')}
            </Text>

            <ActionsheetItem onPress={takePhoto} style={{ borderRadius: 15, height: 60 }}>
              <ActionsheetIcon as={Camera} color="#00FF9C" />
              <ActionsheetItemText style={{ color: theme.text, fontWeight: '600' }}>{t('take_photo')}</ActionsheetItemText>
            </ActionsheetItem>

            <ActionsheetItem onPress={pickFromGallery} style={{ borderRadius: 15, height: 60 }}>
              <ActionsheetIcon as={ImageIcon} color="#00FF9C" />
              <ActionsheetItemText style={{ color: theme.text, fontWeight: '600' }}>{t('pick_from_gallery')}</ActionsheetItemText>
            </ActionsheetItem>
          </View>
        </ActionsheetContent>
      </Actionsheet>

      <Modal
        visible={showCamera}
        animationType="fade"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowCamera(false)}
      >
        <View style={[styles.cameraModal, { width: windowWidth, height: windowHeight }]}>
          <CameraView ref={cameraRef} style={[styles.camera, { width: windowWidth, height: windowHeight }]} facing="back">
            <View style={[styles.cameraOverlay, { width: windowWidth, height: windowHeight }]}>
              <TouchableOpacity
                style={styles.cameraClose}
                onPress={() => setShowCamera(false)}
              >
                <ChevronLeft color="#FFF" size={30} />
              </TouchableOpacity>

              <View style={styles.cameraControls}>
                <TouchableOpacity style={styles.shutterBtn} onPress={capturePhoto}>
                  <View style={styles.shutterInner} />
                </TouchableOpacity>
              </View>

              <View style={styles.cameraHint}>
                <Text style={styles.cameraHintTxt}>Posicione o crime ambiental no centro do quadro</Text>
              </View>
            </View>
          </CameraView>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingBottom: 120 },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, gap: 15, marginBottom: 30 },
  backBtn: { width: 45, height: 45, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold' },
  card: { borderRadius: 30, padding: 25, borderWidth: 1 },
  optimizerBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(0, 255, 156, 0.05)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, alignSelf: 'flex-end', marginBottom: 15 },
  optimizerTxt: { color: '#00FF9C', fontSize: 9, fontWeight: 'bold' },
  section: { marginBottom: 25 },
  mapHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 10 },
  mapLabel: { marginBottom: 0 },
  locationButton: { minHeight: 34, borderRadius: 17, backgroundColor: '#00FF9C', paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 6 },
  locationButtonText: { color: '#001B12', fontSize: 11, fontWeight: '900' },
  label: { color: '#666', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 10, letterSpacing: 1 },
  gluestackSelect: { height: 60, borderRadius: 15, borderWidth: 1, paddingHorizontal: 15 },
  textareaBase: { borderRadius: 15, borderWidth: 1, padding: 15, minHeight: 120 },
  photoBox: { width: '100%', height: 200, borderRadius: 20, overflow: 'hidden', borderStyle: 'dashed', borderWidth: 1 },
  photoPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  photoTxt: { color: '#666', fontSize: 12, marginTop: 10, textAlign: 'center' },
  preview: { flex: 1, width: '100%', height: '100%' },
  aiFeedback: { padding: 15, borderRadius: 15, marginBottom: 25, borderLeftWidth: 4 },
  aiLoading: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  aiLoadingTxt: { color: '#666', fontSize: 12 },
  aiResult: { gap: 5 },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  aiStatus: { fontSize: 14, fontWeight: 'bold' },
  aiConfidence: { fontSize: 11, color: '#666', marginLeft: 28 },
  infoTxt: { color: '#00FF9C', fontSize: 11, marginTop: 8 },
  publishBtn: { backgroundColor: '#00FF9C', height: 65, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 10 },
  publishBtnTxt: { color: '#000', fontSize: 18, fontWeight: 'bold' },
  cameraModal: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1, backgroundColor: '#000' },
  cameraOverlay: { flex: 1, backgroundColor: 'transparent', justifyContent: 'space-between', padding: 40 },
  cameraClose: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  cameraControls: { alignItems: 'center', marginBottom: 20 },
  shutterBtn: { width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: '#FFF', justifyContent: 'center', alignItems: 'center' },
  shutterInner: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FFF' },
  cameraHint: { alignItems: 'center' },
  cameraHintTxt: { color: '#FFF', fontSize: 14, textAlign: 'center', textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
  coordsBadge: {
    minHeight: 58,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  coordsBody: {
    flex: 1,
  },

  coordsTitle: {
    fontSize: 12,
    fontWeight: '800',
  },

  coordsText: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: '700',
    color: '#00A86B',
  },
});
