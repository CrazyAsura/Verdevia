import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, Platform, Share, Modal, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, MapPin, Calendar, Shield, Share2, ShieldCheck, ShieldAlert } from 'lucide-react-native';
import { Motion } from '@legendapp/motion';
import { useTheme } from '@/context/ThemeContext';
import { useComplaintDetail } from '../../hooks/useComplaintDetail';
import { useTranslation } from 'react-i18next';
import { OpenStreetMapPreview } from '@/components/OpenStreetMapPreview';

export default function ComplaintDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [imageOpen, setImageOpen] = React.useState(false);
  
  const { complaint, loading } = useComplaintDetail(id as string);

  if (loading) return (
    <View style={[styles.centered, { backgroundColor: isDark ? '#0A0A0A' : '#F8F9FA' }]}>
      <ActivityIndicator color="#00FF9C" size="large" />
    </View>
  );

  const theme = {
    bg: isDark ? '#0A0A0A' : '#F8F9FA',
    card: isDark ? '#161616' : '#FFF',
    border: isDark ? '#222' : '#EEE',
    text: isDark ? '#FFF' : '#000',
    subtext: isDark ? '#888' : '#666',
    accent: '#00FF9C',
    danger: '#FF4B4B'
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'resolved': return theme.accent;
      case 'analyzing': return '#FFD700';
      default: return theme.danger;
    }
  };

  const readCoordinate = (value: unknown) => {
    if (typeof value === 'number') return Number.isFinite(value) ? value : null;
    if (typeof value !== 'string') return null;

    const parsed = Number(value.replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : null;
  };

  const parseLocationCoordinates = (location?: string | null) => {
    if (!location) return null;

    const matches = location.match(/-?\d+(?:[.,]\d+)?/g);
    if (!matches || matches.length < 2) return null;

    const latitude = readCoordinate(matches[0]);
    const longitude = readCoordinate(matches[1]);

    if (latitude === null || longitude === null) return null;
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return null;

    return { latitude, longitude };
  };

  const explicitLatitude = readCoordinate(complaint?.latitude);
  const explicitLongitude = readCoordinate(complaint?.longitude);
  const locationCoordinates = parseLocationCoordinates(complaint?.location);
  const complaintCoordinates =
    explicitLatitude !== null &&
    explicitLongitude !== null &&
    explicitLatitude >= -90 &&
    explicitLatitude <= 90 &&
    explicitLongitude >= -180 &&
    explicitLongitude <= 180
      ? { latitude: explicitLatitude, longitude: explicitLongitude }
      : locationCoordinates;

  const handleExportReport = async () => {
    if (!complaint) return;

    const coordinates = complaintCoordinates
      ? `\nCoordenadas: ${complaintCoordinates.latitude.toFixed(5)}, ${complaintCoordinates.longitude.toFixed(5)}`
      : '';

    await Share.share({
      title: 'Relatório da Queixa VERDEVIA',
      message:
        `Relatório VERDEVIA\n` +
        `ID: ${complaint.id}\n` +
        `Tipo: ${complaint.type}\n` +
        `Status: ${complaint.status}\n` +
        `Local: ${complaint.location || 'Não informado'}${coordinates}\n` +
        `Data: ${complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString() : '--/--/----'}\n\n` +
        `${complaint.description || 'Nenhuma descrição fornecida.'}`,
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section with Image */}
        <View style={styles.heroContainer}>
          {complaint?.imageUrl ? (
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.heroImageButton}
              onPress={() => setImageOpen(true)}
            >
              <Image source={{ uri: complaint.imageUrl }} style={styles.heroImage} resizeMode="cover" />
            </TouchableOpacity>
          ) : (
            <View style={[styles.heroPlaceholder, { backgroundColor: isDark ? '#111' : '#EEE' }]}>
               <Shield size={60} color={theme.border} />
            </View>
          )}
          
          <View style={styles.heroOverlay}>
             <TouchableOpacity 
              onPress={() => router.back()} 
              style={[styles.backBtn, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
            >
              <ChevronLeft color="#FFF" size={28} />
            </TouchableOpacity>

            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(complaint?.status || '') }]}>
              <Text style={styles.statusText}>{complaint?.status?.toUpperCase() || 'PENDENTE'}</Text>
            </View>
          </View>
        </View>

        <Motion.View 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 20 }}
          style={styles.detailsBody}
        >
          <View style={styles.headerRow}>
            <Text style={[styles.typeText, { color: theme.accent }]}>{complaint?.type?.toUpperCase() || 'DENÚNCIA'}</Text>
            <View style={styles.metaItem}>
              <Calendar size={14} color={theme.subtext} />
              <Text style={[styles.metaText, { color: theme.subtext }]}>
                {complaint?.createdAt ? new Date(complaint.createdAt).toLocaleDateString() : '--/--/----'}
              </Text>
            </View>
          </View>

          <Text style={[styles.title, { color: theme.text }]}>Detalhamento do Incidente</Text>

          <View style={[styles.locationBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
             <View style={[styles.iconCircle, { backgroundColor: 'rgba(0, 255, 156, 0.1)' }]}>
                <MapPin size={18} color={theme.accent} />
             </View>
             <Text style={[styles.locationText, { color: theme.text }]}>{complaint?.location || 'Localização não informada'}</Text>
          </View>

          {complaintCoordinates && (
            <View style={styles.mapSection}>
              <OpenStreetMapPreview
                latitude={complaintCoordinates.latitude}
                longitude={complaintCoordinates.longitude}
                label={complaint.location || 'Local da queixa'}
                dark={isDark}
                height={220}
              />
            </View>
          )}

          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: theme.subtext }]}>{t('description')}</Text>
            <Text style={[styles.description, { color: isDark ? '#BBB' : '#444' }]}>
              {complaint?.description || 'Nenhuma descrição fornecida.'}
            </Text>
          </View>

          {/* AI Analysis Integration */}
          {complaint?.aiAnalysis && (
            <View style={[styles.aiSection, { backgroundColor: complaint.aiAnalysis.isFake ? 'rgba(255, 75, 75, 0.05)' : 'rgba(0, 255, 156, 0.05)', borderColor: complaint.aiAnalysis.isFake ? 'rgba(255, 75, 75, 0.2)' : 'rgba(0, 255, 156, 0.2)' }]}>
               <View style={styles.aiHeader}>
                  {complaint.aiAnalysis.isFake ? <ShieldAlert color={theme.danger} size={24} /> : <ShieldCheck color={theme.accent} size={24} />}
                  <Text style={[styles.aiTitle, { color: complaint.aiAnalysis.isFake ? theme.danger : theme.accent }]}>
                    Relatório de Integridade VERDEVIA
                  </Text>
               </View>
               <Text style={[styles.aiMessage, { color: theme.text }]}>{complaint.aiAnalysis.message}</Text>
               <View style={styles.confidenceBarContainer}>
                  <View style={[styles.confidenceBar, { width: `${complaint.aiAnalysis.confidence * 100}%`, backgroundColor: complaint.aiAnalysis.isFake ? theme.danger : theme.accent }]} />
               </View>
               <Text style={[styles.confidenceText, { color: theme.subtext }]}>Confiança da Análise: {(complaint.aiAnalysis.confidence * 100).toFixed(1)}%</Text>
            </View>
          )}

          <View style={[styles.securityCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Shield size={24} color={theme.accent} />
            <View style={styles.securityBody}>
               <Text style={[styles.securityTitle, { color: theme.text }]}>Protocolo de Segurança Ativo</Text>
               <Text style={[styles.securitySub, { color: theme.subtext }]}>
                 ID da Denúncia: {complaint?.id.substring(0, 12).toUpperCase()}...
                 Verificado via Blockchain Ambiental VERDEVIA.
               </Text>
            </View>
          </View>

          <TouchableOpacity style={[styles.shareBtn, { shadowColor: theme.accent }]} onPress={handleExportReport}>
            <Share2 color="#000" size={22} />
            <Text style={styles.shareBtnText}>Exportar Relatório</Text>
          </TouchableOpacity>
        </Motion.View>
      </ScrollView>

      {complaint?.imageUrl && (
        <Modal visible={imageOpen} transparent animationType="fade" onRequestClose={() => setImageOpen(false)}>
          <View style={styles.imageModal}>
            <TouchableOpacity style={styles.imageModalClose} onPress={() => setImageOpen(false)}>
              <ChevronLeft color="#FFF" size={30} />
            </TouchableOpacity>
            <Image
              source={{ uri: complaint.imageUrl }}
              style={[styles.fullImage, { width: windowWidth, height: windowHeight }]}
              resizeMode="contain"
            />
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { paddingBottom: 100 },
  heroContainer: { width: '100%', height: 350, position: 'relative' },
  heroImageButton: { width: '100%', height: '100%' },
  heroImage: { width: '100%', height: '100%' },
  heroPlaceholder: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  heroOverlay: { 
    ...StyleSheet.absoluteFillObject, 
    padding: 24, 
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  backBtn: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  statusBadge: { maxWidth: '58%', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  statusText: { color: '#000', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  detailsBody: { 
    marginTop: -30, 
    backgroundColor: 'transparent', // Will inherit from container
    borderTopLeftRadius: 35, 
    borderTopRightRadius: 35, 
    padding: 24,
    paddingTop: 40
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  typeText: { fontSize: 12, fontWeight: '900', letterSpacing: 2 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 25, letterSpacing: -0.5 },
  metaRow: { flexDirection: 'row', gap: 20 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 14, fontWeight: '600' },
  locationBox: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 20, 
    borderRadius: 24, 
    borderWidth: 1, 
    gap: 15, 
    marginBottom: 35 
  },
  iconCircle: { width: 44, height: 44, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  locationText: { fontSize: 16, fontWeight: '700', flex: 1 },
  mapSection: { marginTop: -15, marginBottom: 35 },
  section: { marginBottom: 35 },
  sectionLabel: { fontSize: 11, fontWeight: '900', letterSpacing: 2, marginBottom: 15 },
  description: { fontSize: 17, lineHeight: 28, fontWeight: '400' },
  aiSection: { padding: 20, borderRadius: 24, borderWidth: 1, marginBottom: 35, gap: 12 },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  aiTitle: { fontSize: 16, fontWeight: '800' },
  aiMessage: { fontSize: 14, lineHeight: 22, fontWeight: '500' },
  confidenceBarContainer: { height: 6, width: '100%', backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 3, overflow: 'hidden' },
  confidenceBar: { height: '100%', borderRadius: 3 },
  confidenceText: { fontSize: 11, fontWeight: '700' },
  securityCard: { padding: 20, borderRadius: 24, flexDirection: 'row', alignItems: 'center', gap: 20, borderWidth: 1, marginBottom: 40 },
  securityBody: { flex: 1 },
  securityTitle: { fontSize: 15, fontWeight: '800', marginBottom: 4 },
  securitySub: { fontSize: 12, lineHeight: 18, fontWeight: '500' },
  shareBtn: { backgroundColor: '#00FF9C', height: 65, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6 },
  shareBtnText: { color: '#000', fontSize: 18, fontWeight: 'bold' },
  imageModal: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  imageModalClose: { position: 'absolute', top: Platform.OS === 'ios' ? 56 : 28, left: 18, zIndex: 2, width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center' },
  fullImage: { backgroundColor: '#000' }
});
