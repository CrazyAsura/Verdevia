import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Calendar as CalendarIcon,
  Camera,
  ChevronLeft,
  Hash,
  Home,
  Mail,
  MapPin,
  Phone,
  Save,
  User as UserIcon,
  Users,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import api, { API_BASE_URL } from '../services/api';
import { ProfileFrame } from '@/components/profile/profile-frame';
import { useTheme } from '@/context/ThemeContext';

type FormData = {
  id: string;
  realName: string;
  email: string;
  identity: string;
  birthDate: string;
  phone: string;
  ddd: string;
  ddi: string;
  zipCode: string;
  street: string;
  city: string;
  state: string;
  district: string;
  number: string;
  gender: string;
  ethnicity: string;
};

type FieldProps = Omit<TextInputProps, 'style'> & {
  label: string;
  icon?: React.ElementType;
  locked?: boolean;
  theme: ReturnType<typeof createTheme>;
};

const emptyForm: FormData = {
  id: '',
  realName: '',
  email: '',
  identity: '',
  birthDate: '',
  phone: '',
  ddd: '',
  ddi: '+55',
  zipCode: '',
  street: '',
  city: '',
  state: '',
  district: '',
  number: '',
  gender: '',
  ethnicity: '',
};

const getLocalProfileKey = (userId: string) => `profile-draft-${userId}`;
const normalizeStoredUser = (userData: any) => ({
  ...userData,
  id: userData?.userId || userData?.id || userData?._id,
});
const validGenders = ['Masculino', 'Feminino', 'Outro', 'Prefiro não dizer'];
const validEthnicities = ['Branca', 'Preta', 'Parda', 'Amarela', 'Indígena'];

export default function EditProfileScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const theme = useMemo(() => createTheme(isDark), [isDark]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [profilePhotoBase64, setProfilePhotoBase64] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);

  useEffect(() => {
    fetchUserData();
  }, []);

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const resolveUserId = async (userData: any) => {
    if (!userData?.id) return null;

    try {
      await api.get(`/users/profile/${userData.id}`);
      return userData.id;
    } catch (error: any) {
      if (error?.response?.status !== 404 || !userData.email) {
        throw error;
      }
    }

    const resolveResponse = await api.get('/users/resolve-by-email', {
      params: { email: userData.email },
    });
    const matchedUser = resolveResponse.data;

    if (!matchedUser?.id) {
      return null;
    }

    const correctedUser = {
      ...userData,
      id: matchedUser.id,
    };

    const staleDraft = await AsyncStorage.getItem(getLocalProfileKey(userData.id));
    if (staleDraft) {
      await AsyncStorage.setItem(getLocalProfileKey(matchedUser.id), staleDraft);
    }

    await AsyncStorage.setItem('user', JSON.stringify(correctedUser));
    return matchedUser.id;
  };

  const fetchUserData = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (!storedUser) {
        router.replace('/auth/login');
        return;
      }

      const userData = normalizeStoredUser(JSON.parse(storedUser));
      const resolvedUserId = await resolveUserId(userData);
      if (!resolvedUserId) {
        Alert.alert(
          'Usuario nao encontrado',
          'O e-mail salvo neste aparelho nao existe no banco atual. Entre novamente com uma conta existente.'
        );
        return;
      }

      const response = await api.get(`/users/profile/${resolvedUserId}`);
      const data = response.data;
      const localProfileRaw = await AsyncStorage.getItem(getLocalProfileKey(resolvedUserId));
      const localProfile = localProfileRaw ? JSON.parse(localProfileRaw) : {};
      const mergedData = {
        ...data,
        ...localProfile,
        id: data.id || resolvedUserId,
        address: {
          ...(data.address ?? {}),
          ...(localProfile.address ?? {}),
        },
        phones: localProfile.phones ?? data.phones,
      };
      const firstPhone = mergedData.phones?.[0];
      const address = mergedData.address;

      setFormData({
        id: data.id || resolvedUserId,
        realName: mergedData.realName || mergedData.name || '',
        email: mergedData.email || '',
        identity: mergedData.identity || '',
        birthDate: mergedData.birthDate || '',
        phone: firstPhone?.number || '',
        ddd: firstPhone?.ddd || '',
        ddi: firstPhone?.ddi || '+55',
        zipCode: address?.zipCode || '',
        street: address?.street || '',
        city: address?.city || '',
        state: address?.state || '',
        district: address?.district || '',
        number: address?.number || '',
        gender: mergedData.gender || '',
        ethnicity: mergedData.ethnicity || '',
      });

      setProfilePhoto(mergedData.avatarUrl || mergedData.profilePhoto || null);
      setProfilePhotoBase64(null);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      Alert.alert('Erro', 'Nao foi possivel carregar seus dados.');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const currentPermission = await ImagePicker.getMediaLibraryPermissionsAsync();
      const permission = currentPermission.granted
        ? currentPermission
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted && permission.status !== ImagePicker.PermissionStatus.GRANTED) {
        Alert.alert(
          'Permissao necessaria',
          'Autorize o acesso a galeria para escolher uma foto de perfil.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        setProfilePhoto(asset.uri);
        setProfilePhotoBase64(
          asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : null
        );
      }
    } catch (error) {
      console.error('Erro ao abrir galeria:', error);
      Alert.alert('Erro', 'Nao foi possivel abrir a galeria.');
    }
  };

  const uploadProfilePhoto = async (userId: string) => {
    if (!profilePhotoBase64) {
      return profilePhoto;
    }

    const token = await AsyncStorage.getItem('token');
    const response = await axios.post(
      `${API_BASE_URL}/users/profile/${userId}/photo`,
      { imageBase64: profilePhotoBase64 },
      {
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        timeout: 30000,
      }
    );

    return response.data?.avatarUrl || profilePhoto;
  };

  const handleSave = async () => {
    if (!formData.realName.trim() || !formData.email.trim()) {
      Alert.alert('Campos obrigatorios', 'Informe nome completo e e-mail.');
      return;
    }

    setSaving(true);
    let savedLocally = false;
    try {
      const storedUserForSave = await AsyncStorage.getItem('user');
      const parsedUserForSave = storedUserForSave ? normalizeStoredUser(JSON.parse(storedUserForSave)) : null;
      const resolvedUserId = parsedUserForSave
        ? await resolveUserId(parsedUserForSave)
        : formData.id;

      if (!resolvedUserId) {
        Alert.alert(
          'Usuario nao encontrado',
          'O e-mail salvo neste aparelho nao existe no banco atual. Entre novamente com uma conta existente.'
        );
        return;
      }

      const cleanGender = formData.gender.trim();
      const cleanEthnicity = formData.ethnicity.trim();
      const cleanAddress = {
        zipCode: formData.zipCode.trim(),
        street: formData.street.trim(),
        city: formData.city.trim(),
        state: formData.state.trim().toUpperCase(),
        district: formData.district.trim(),
        country: 'Brasil',
        number: formData.number.trim(),
      };
      const cleanPhone = {
        ddi: formData.ddi.trim() || '+55',
        ddd: formData.ddd.trim(),
        number: formData.phone.trim(),
      };
      const uploadedPhotoUrl = await uploadProfilePhoto(resolvedUserId);
      const isRemotePhoto =
        !!uploadedPhotoUrl &&
        !uploadedPhotoUrl.startsWith('file:') &&
        !uploadedPhotoUrl.startsWith('content:') &&
        !uploadedPhotoUrl.startsWith('data:image/');

      const payload: Record<string, unknown> = {
        realName: formData.realName.trim(),
        email: formData.email.trim(),
      };

      if (validGenders.includes(cleanGender)) {
        payload.gender = cleanGender;
      }

      if (validEthnicities.includes(cleanEthnicity)) {
        payload.ethnicity = cleanEthnicity;
      }

      if (
        cleanAddress.zipCode ||
        cleanAddress.street ||
        cleanAddress.city ||
        cleanAddress.state ||
        cleanAddress.district ||
        cleanAddress.number
      ) {
        payload.address = cleanAddress;
      }

      if (cleanPhone.ddd || cleanPhone.number) {
        payload.phones = [cleanPhone];
      }

      if (isRemotePhoto) {
        payload.avatarUrl = uploadedPhotoUrl;
        payload.profilePhoto = uploadedPhotoUrl;
      }

      const localProfile = {
        ...payload,
        ...(uploadedPhotoUrl && {
          avatarUrl: uploadedPhotoUrl,
          profilePhoto: uploadedPhotoUrl,
        }),
        ...(profilePhoto && {
          localAvatarUrl: profilePhoto,
        }),
      };

      await AsyncStorage.setItem(
        getLocalProfileKey(resolvedUserId),
        JSON.stringify(localProfile)
      );
      savedLocally = true;

      await api.patch(`/users/profile/${resolvedUserId}`, payload);

      const refreshed = await api.get(`/users/profile/${resolvedUserId}`).catch(() => null);
      if (refreshed?.data) {
        await AsyncStorage.setItem(
          getLocalProfileKey(resolvedUserId),
          JSON.stringify({
            ...refreshed.data,
            ...localProfile,
            address: {
              ...(refreshed.data.address ?? {}),
              ...localProfile.address,
            },
            phones: localProfile.phones ?? refreshed.data.phones,
          })
        );
      }

      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const userData = normalizeStoredUser(JSON.parse(storedUser));
        await AsyncStorage.setItem(
          'user',
          JSON.stringify({
            ...userData,
            name: formData.realName.trim(),
            realName: formData.realName.trim(),
            email: formData.email.trim(),
            avatarUrl: uploadedPhotoUrl || userData.avatarUrl,
          })
        );
      }

      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
      router.back();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      const status = (error as any)?.response?.status;
      if (status === 404) {
        Alert.alert(
          'Perfil nao sincronizado',
          'Nao encontrei este usuario no servidor atual. Entre com uma conta cadastrada no backend para sincronizar o perfil.'
        );
        return;
      }

      if (savedLocally) {
        Alert.alert(
          'Salvo neste aparelho',
          'As alteracoes foram aplicadas localmente, mas ainda nao sincronizaram com o servidor.'
        );
        router.back();
      } else {
        Alert.alert('Erro', 'Nao foi possivel salvar as alteracoes.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.background }]}>
        <ActivityIndicator color="#00FF9C" size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: theme.surface }]}>
          <ChevronLeft color={theme.text} size={26} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Editar Perfil</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.photoSection}>
          <View>
            <ProfileFrame photoUrl={profilePhoto || undefined} size={142} />
            <TouchableOpacity
              activeOpacity={0.8}
              hitSlop={12}
              style={styles.cameraButton}
              onPress={pickImage}
            >
              <Camera size={18} color="#000" />
            </TouchableOpacity>
          </View>
          <Text style={[styles.photoHint, { color: theme.muted }]}>Toque para alterar foto</Text>
        </View>

        <Section title="Dados bloqueados" theme={theme}>
          <Field
            label="CPF / Identidade"
            icon={Hash}
            value={formData.identity}
            locked
            editable={false}
            theme={theme}
          />
          <Field
            label="Data de nascimento"
            icon={CalendarIcon}
            value={formData.birthDate}
            locked
            editable={false}
            theme={theme}
          />
        </Section>

        <Section title="Informacoes pessoais" theme={theme} highlighted>
          <Field
            label="Nome completo"
            icon={UserIcon}
            value={formData.realName}
            onChangeText={(value) => updateField('realName', value)}
            autoCapitalize="words"
            theme={theme}
          />
          <Field
            label="E-mail"
            icon={Mail}
            value={formData.email}
            onChangeText={(value) => updateField('email', value)}
            autoCapitalize="none"
            keyboardType="email-address"
            theme={theme}
          />
          <View style={styles.row}>
            <View style={styles.ddiField}>
              <Field
                label="DDI"
                value={formData.ddi}
                onChangeText={(value) => updateField('ddi', value)}
                keyboardType="phone-pad"
                textAlign="center"
                theme={theme}
              />
            </View>
            <View style={styles.dddField}>
              <Field
                label="DDD"
                value={formData.ddd}
                onChangeText={(value) => updateField('ddd', value)}
                keyboardType="number-pad"
                textAlign="center"
                theme={theme}
              />
            </View>
            <View style={styles.flexField}>
              <Field
                label="Telefone"
                icon={Phone}
                value={formData.phone}
                onChangeText={(value) => updateField('phone', value)}
                keyboardType="phone-pad"
                theme={theme}
              />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.flexField}>
              <Field
                label="Genero"
                icon={Users}
                value={formData.gender}
                onChangeText={(value) => updateField('gender', value)}
                theme={theme}
              />
            </View>
            <View style={styles.flexField}>
              <Field
                label="Etnia"
                value={formData.ethnicity}
                onChangeText={(value) => updateField('ethnicity', value)}
                theme={theme}
              />
            </View>
          </View>
        </Section>

        <Section title="Endereco" theme={theme} highlighted>
          <Field
            label="CEP"
            icon={MapPin}
            value={formData.zipCode}
            onChangeText={(value) => updateField('zipCode', value)}
            keyboardType="number-pad"
            theme={theme}
          />
          <View style={styles.row}>
            <View style={styles.flexField}>
              <Field
                label="Rua"
                icon={Home}
                value={formData.street}
                onChangeText={(value) => updateField('street', value)}
                theme={theme}
              />
            </View>
            <View style={styles.numberField}>
              <Field
                label="Numero"
                value={formData.number}
                onChangeText={(value) => updateField('number', value)}
                keyboardType="number-pad"
                textAlign="center"
                theme={theme}
              />
            </View>
          </View>
          <Field
            label="Bairro"
            value={formData.district}
            onChangeText={(value) => updateField('district', value)}
            theme={theme}
          />
          <View style={styles.row}>
            <View style={styles.flexField}>
              <Field
                label="Cidade"
                value={formData.city}
                onChangeText={(value) => updateField('city', value)}
                theme={theme}
              />
            </View>
            <View style={styles.ufField}>
              <Field
                label="UF"
                value={formData.state}
                onChangeText={(value) => updateField('state', value.toUpperCase().slice(0, 2))}
                autoCapitalize="characters"
                maxLength={2}
                textAlign="center"
                theme={theme}
              />
            </View>
          </View>
        </Section>

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#000" />
          ) : (
            <>
              <Save size={20} color="#000" />
              <Text style={styles.saveText}>Salvar Alteracoes</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Section({
  children,
  highlighted,
  theme,
  title,
}: {
  children: React.ReactNode;
  highlighted?: boolean;
  theme: ReturnType<typeof createTheme>;
  title: string;
}) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: highlighted ? '#00FF9C' : theme.muted }]}>
        {title}
      </Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function Field({ icon: Icon, label, locked, theme, ...props }: FieldProps) {
  return (
    <View
      style={[
        styles.field,
        {
          backgroundColor: locked ? theme.lockedSurface : theme.surface,
          borderColor: locked ? theme.lockedBorder : theme.border,
          opacity: locked ? 0.72 : 1,
        },
      ]}
    >
      {Icon ? (
        <View style={styles.fieldIcon}>
          <Icon size={18} color={locked ? theme.lockedText : theme.icon} />
        </View>
      ) : null}
      <View style={styles.fieldContent}>
        <Text style={[styles.fieldLabel, { color: locked ? theme.lockedText : theme.muted }]}>
          {label}
        </Text>
        <TextInput
          {...props}
          placeholderTextColor={theme.placeholder}
          style={[
            styles.input,
            {
              color: locked ? theme.lockedText : theme.text,
              textAlign: props.textAlign,
            },
          ]}
        />
      </View>
    </View>
  );
}

function createTheme(isDark: boolean) {
  return {
    background: isDark ? '#0A0A0A' : '#F8F9FA',
    surface: isDark ? '#161616' : '#FFFFFF',
    lockedSurface: isDark ? '#111111' : '#F0F2F4',
    border: isDark ? '#252525' : '#E4E7EB',
    lockedBorder: isDark ? '#1D1D1D' : '#E1E4E8',
    text: isDark ? '#FFFFFF' : '#111827',
    muted: isDark ? '#777777' : '#6B7280',
    placeholder: isDark ? '#555555' : '#9CA3AF',
    icon: isDark ? '#7A7A7A' : '#6B7280',
    lockedText: isDark ? '#5F5F5F' : '#7B818A',
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingTop: 58,
    paddingBottom: 10,
  },
  backButton: {
    alignItems: 'center',
    borderRadius: 16,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  headerTitle: {
    fontSize: 21,
    fontWeight: '900',
  },
  headerSpacer: {
    width: 44,
  },
  content: {
    paddingBottom: 120,
    paddingHorizontal: 22,
  },
  photoSection: {
    alignItems: 'center',
    paddingTop: 26,
    paddingBottom: 34,
  },
  cameraButton: {
    alignItems: 'center',
    backgroundColor: '#00FF9C',
    borderColor: '#0A0A0A',
    borderRadius: 22,
    borderWidth: 4,
    bottom: 4,
    height: 44,
    justifyContent: 'center',
    position: 'absolute',
    right: 4,
    width: 44,
    zIndex: 20,
    elevation: 20,
  },
  photoHint: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 14,
    textTransform: 'uppercase',
  },
  section: {
    marginBottom: 26,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginBottom: 10,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  sectionBody: {
    gap: 12,
  },
  field: {
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 62,
    paddingHorizontal: 14,
  },
  fieldIcon: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    marginRight: 10,
    width: 28,
  },
  fieldContent: {
    flex: 1,
    justifyContent: 'center',
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.7,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  input: {
    fontSize: 16,
    fontWeight: '700',
    minHeight: 30,
    padding: 0,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  flexField: {
    flex: 1,
  },
  ddiField: {
    width: 76,
  },
  dddField: {
    width: 72,
  },
  numberField: {
    width: 96,
  },
  ufField: {
    width: 82,
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: '#00FF9C',
    borderRadius: 22,
    flexDirection: 'row',
    gap: 10,
    height: 64,
    justifyContent: 'center',
    marginTop: 4,
  },
  saveButtonDisabled: {
    opacity: 0.65,
  },
  saveText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
