import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { Motion } from '@legendapp/motion';
import { ChevronLeft, Camera, ChevronDown, ShieldCheck, ShieldAlert, Save, LocateFixed, Image as ImageIcon } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { CameraView, useCameraPermissions } from 'expo-camera';
import api from '@/services/api';
import { useTranslation } from 'react-i18next';
import { PollutionType, ComplaintPrivacy } from '@/constants/enums';
import { useTheme } from '@/context/ThemeContext';
import { useAIAnalysis } from '@/hooks/useAIAnalysis';
import * as Location from 'expo-location';
import { OpenStreetMapPreview } from '@/components/OpenStreetMapPreview';
import { extractPhotoCoordinates, isValidCoordinates } from '@/utils/photoLocation';

// Gluestack Components
import { Box } from '@/components/ui/box';
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

export default function EditComplaint() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const complaintId = Array.isArray(id) ? id[0] : id;
  const [image, setImage] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState<PollutionType>(PollutionType.URBANO);
  const [privacy, setPrivacy] = useState<ComplaintPrivacy>(ComplaintPrivacy.PUBLICO);
  const [showActionsheet, setShowActionsheet] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [mapInteracting, setMapInteracting] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const cameraRef = React.useRef<CameraView>(null);
  const capturedCoordsRef = React.useRef<{ latitude: number; longitude: number } | null>(null);

  const { analyzeImage, analyzing, result: aiResult, config: deviceLimits } = useAIAnalysis();

  useEffect(() => {
    const fetchComplaint = async () => {
      if (!complaintId) return;
      try {
        const response = await api.get(`/complaints/${complaintId}`);
        const data = response.data;
        setDescription(data.description);
        setLocation(data.location);
        setType(data.type);
        setPrivacy(data.privacy);
        setImage(data.imageUrl);
        const loadedCoords = { latitude: Number(data.latitude), longitude: Number(data.longitude) };
        if (isValidCoordinates(loadedCoords)) {
          capturedCoordsRef.current = loadedCoords;
          setCoords(loadedCoords);
        }
      } catch (error) {
        console.error('Erro ao carregar queixa:', error);
        Alert.alert(t('error'), t('error_load'));
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchComplaint();
  }, [complaintId]);

  const formatLocationLabel = (nextCoords: { latitude: number; longitude: number }) =>
    `GPS ${nextCoords.latitude.toFixed(5)}, ${nextCoords.longitude.toFixed(5)}`;

  const captureLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Geolocalização Obrigatória", "Permita o acesso à localização para atualizar a prova da queixa.");
      return null;
    }

    const locationData = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    const nextCoords = {
      latitude: locationData.coords.latitude,
      longitude: locationData.coords.longitude,
    };
    if (!isValidCoordinates(nextCoords)) {
      Alert.alert("Erro de GPS", "A localizacao retornada pelo aparelho e invalida. Tente novamente em alguns segundos.");
      return null;
    }
    capturedCoordsRef.current = nextCoords;
    setCoords(nextCoords);
    setLocation(formatLocationLabel(nextCoords));
    return nextCoords;
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
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.5,
        exif: true,
      });
      if (photo) {
        const currentCoords = capturedCoordsRef.current;
        if (isValidCoordinates(currentCoords)) {
          setCoords(currentCoords);
          setLocation(formatLocationLabel(currentCoords));
        }
        setImage(photo.uri);
        analyzeImage(photo.uri, {
          complaintText: description,
          location: currentCoords,
        });
        setShowCamera(false);
      }
    }
  };

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
      exif: true,
    });

    if (result.canceled) {
      setShowActionsheet(false);
      return;
    }

    const asset = result.assets[0];
    const photoCoords = extractPhotoCoordinates(asset);
    if (!isValidCoordinates(photoCoords)) {
      Alert.alert(
        "Foto sem localização",
        "Escolha uma foto com metadados de GPS ou tire uma nova foto pela câmera."
      );
      setShowActionsheet(false);
      return;
    }

    capturedCoordsRef.current = photoCoords;
    setCoords(photoCoords);
    setLocation(formatLocationLabel(photoCoords));
    setImage(asset.uri);
    analyzeImage(asset.uri, {
      complaintText: description,
      location: photoCoords,
    });
    setShowActionsheet(false);
  };

  const handleUpdate = async () => {
    if (!description) {
      Alert.alert(t('error'), t('fill_all'));
      return;
    }

    if (!image) {
      Alert.alert("Foto obrigatória", "Tire uma foto pela câmera para registrar a queixa.");
      return;
    }

    const submissionCoords = isValidCoordinates(coords) ? coords : await captureLocation();
    if (!submissionCoords) return;

    if (aiResult?.isFake) {
      Alert.alert(
        "Aviso de Autenticidade",
        "Imagem possivelmente gerada por IA ou com sinais de edição. Atualização bloqueada: tire uma nova foto diretamente pela câmera."
      );
      return;
    }

    setSaving(true);
    try {
      const payload = {
        type,
        description,
        location: location || formatLocationLabel(submissionCoords),
        privacy,
        imageUrl: image || '',
        latitude: submissionCoords.latitude,
        longitude: submissionCoords.longitude,
      };

      await api.put(`/complaints/${complaintId}`, payload);
      Alert.alert(t('success'), t('update_success'));
      router.back();
    } catch (e: any) {
      console.error('Erro ao atualizar:', e?.response?.data || e.message);
      Alert.alert(t('error'), t('error_update'));
    } finally {
      setSaving(false);
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

  if (loading) {
    return (
      <Box className={`flex-1 ${isDark ? 'bg-[#0A0A0A]' : 'bg-[#F8F9FA]'} items-center justify-center`}>
        <ActivityIndicator color="#00FF9C" size="large" />
      </Box>
    );
  }

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
        <Text style={[styles.title, { color: theme.text }]}>{t('edit_complaint')}</Text>
      </View>

      <Motion.View initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.section}>
          <Text style={styles.label}>{t('pollution_type')}</Text>
          <Select onValueChange={(v) => setType(v as PollutionType)} selectedValue={type}>
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
          <View style={styles.mapHeader}>
            <Text style={[styles.label, styles.mapLabel]}>Mapa do local</Text>
            <TouchableOpacity style={styles.locationButton} onPress={captureLocation} disabled={saving}>
              <LocateFixed color="#001B12" size={15} />
              <Text style={styles.locationButtonText}>Atualizar GPS</Text>
            </TouchableOpacity>
          </View>
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

        <TouchableOpacity style={[styles.photoBox, { backgroundColor: theme.input, borderColor: theme.border }]} onPress={() => setShowActionsheet(true)}>
          {image ? (
            <Image source={{ uri: image }} style={styles.preview} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Camera color="#666" size={40} />
              <Text style={styles.photoTxt}>{t('photo_required')}</Text>
            </View>
          )}
        </TouchableOpacity>

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
                <Text style={styles.aiConfidence}>Confiança: {(aiResult.confidence * 100).toFixed(1)}%</Text>
              </View>
            ) : null}
          </View>
        )}
        <View style={styles.section}>
            <Text style={styles.label}>{t('visibility')}</Text>
            <Select onValueChange={(v) => setPrivacy(v as ComplaintPrivacy)} selectedValue={privacy}>
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
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate} disabled={saving || analyzing}>
          {saving ? <ActivityIndicator color="#000" /> : (
            <>
              <Save color="#000" size={20} />
              <Text style={styles.saveBtnTxt}>{t('save_changes')}</Text>
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

      {showCamera && (
        <View style={StyleSheet.absoluteFill}>
          <CameraView ref={cameraRef} style={styles.camera} facing="back">
            <View style={styles.cameraOverlay}>
              <TouchableOpacity onPress={() => setShowCamera(false)} style={styles.cameraClose}>
                <ChevronLeft color="#FFF" size={30} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.shutterBtn} onPress={capturePhoto}>
                <View style={styles.shutterInner} />
              </TouchableOpacity>
            </View>
          </CameraView>
        </View>
      )}
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
  section: { marginBottom: 25 },
  mapHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 10 },
  mapLabel: { marginBottom: 0 },
  locationButton: { minHeight: 34, borderRadius: 17, backgroundColor: '#00FF9C', paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 6 },
  locationButtonText: { color: '#001B12', fontSize: 11, fontWeight: '900' },
  label: { color: '#666', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 10, letterSpacing: 1 },
  gluestackSelect: { height: 60, borderRadius: 15, borderWidth: 1, paddingHorizontal: 15 },
  textareaBase: { borderRadius: 15, borderWidth: 1, padding: 15, minHeight: 120 },
  photoBox: { width: '100%', height: 200, borderRadius: 20, overflow: 'hidden', marginBottom: 25, borderStyle: 'dashed', borderWidth: 1 },
  photoPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  photoTxt: { color: '#666', fontSize: 12, marginTop: 10 },
  preview: { flex: 1 },
  saveBtn: { backgroundColor: '#00FF9C', height: 65, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 10 },
  saveBtnTxt: { color: '#000', fontSize: 18, fontWeight: 'bold' },
  camera: { flex: 1 },
  cameraOverlay: { flex: 1, backgroundColor: 'transparent', justifyContent: 'space-between', padding: 40 },
  cameraClose: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  shutterBtn: { width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: '#FFF', alignSelf: 'center', marginBottom: 20, justifyContent: 'center', alignItems: 'center' },
  shutterInner: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FFF' },
  aiFeedback: { padding: 15, borderRadius: 15, marginBottom: 25, borderLeftWidth: 4 },
  aiLoading: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  aiLoadingTxt: { color: '#666', fontSize: 12 },
  aiResult: { gap: 5 },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  aiStatus: { fontSize: 14, fontWeight: 'bold' },
  aiConfidence: { fontSize: 11, color: '#666', marginLeft: 28 },
});
