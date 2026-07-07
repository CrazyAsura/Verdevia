import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, ActivityIndicator } from 'react-native';
import { 
  User as UserIcon, 
  MapPin, 
  Phone, 
  Lock, 
  ChevronLeft, 
  Calendar as CalendarIcon, 
  Users, 
  Info, 
  Hash, 
  ChevronDown, 
  Mail, 
  Search, 
  Globe,
  ArrowRight,
  ShieldCheck
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeInRight, FadeInLeft, Layout, FadeInUp } from 'react-native-reanimated';

import { UserGender, UserEthnicity } from '../../constants/enums';
import { setCredentials } from '@/store/slices/authSlice';
import UsersService from '../../services/users.service';

import AuthContainer from '../../components/auth/AuthContainer';
import AuthHeader from '../../components/auth/AuthHeader';
import PremiumInput from '../../components/auth/PremiumInput';
import ActionButton from '../../components/auth/ActionButton';
import StepIndicator from '../../components/auth/StepIndicator';

// Gluestack Components for Select
import { 
  Select, 
  SelectTrigger, 
  SelectInput, 
  SelectIcon, 
  SelectPortal, 
  SelectBackdrop, 
  SelectContent, 
  SelectDragIndicatorWrapper, 
  SelectDragIndicator, 
  SelectItem,
  SelectItemText 
} from '@/components/ui/select';

const LOCAL_FALLBACK_COUNTRIES = [
  { name: 'Brasil', code: 'BR', ddi: '+55', flag: '' },
  { name: 'Portugal', code: 'PT', ddi: '+351', flag: '' },
  { name: 'Estados Unidos', code: 'US', ddi: '+1', flag: '' },
  { name: 'Argentina', code: 'AR', ddi: '+54', flag: '' },
  { name: 'Paraguai', code: 'PY', ddi: '+595', flag: '' },
  { name: 'Uruguai', code: 'UY', ddi: '+598', flag: '' },
  { name: 'Chile', code: 'CL', ddi: '+56', flag: '' },
  { name: 'Colômbia', code: 'CO', ddi: '+57', flag: '' },
  { name: 'Peru', code: 'PE', ddi: '+51', flag: '' },
  { name: 'Bolívia', code: 'BO', ddi: '+591', flag: '' },
];

type RegStep = 1 | 2 | 3 | 4;

export default function RegisterScreen() {
  const [step, setStep] = useState<RegStep>(1);
  const [countries, setCountries] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    realName: '', identity: '', gender: '' as UserGender, ethnicity: '' as UserEthnicity, birthDate: '',
    zipCode: '', street: '', city: '', state: '', district: '', number: '', country: 'Brasil',
    ddi: '+55', ddd: '', phone: '',
    email: '', password: ''
  });

  const fetchCountries = async () => {
    try {
      const response = await fetch('https://www.apicountries.com/countries');
      const data = await response.json();
      if (Array.isArray(data)) {
        const formatted = data
          .filter((c: any) => c && c.callingCodes && c.callingCodes.length > 0 && c.callingCodes[0])
          .map((c: any) => {
            const ptName = c.translations?.pt || c.name || 'Desconhecido';
            const code = c.alpha2Code || '';
            const ddi = `+${c.callingCodes[0].replace(/\s/g, '')}`;
            const flag = c.flags?.png || '';
            return { name: ptName, code, ddi, flag };
          })
          .filter((c: any) => c.name && c.ddi !== '+')
          .sort((a: any, b: any) => a.name.localeCompare(b.name, 'pt-BR'));
        setCountries(formatted);
      } else {
        console.warn("apicountries.com retornou dados inesperados:", data);
        setCountries(LOCAL_FALLBACK_COUNTRIES);
      }
    } catch (e) {
      console.error("Erro ao buscar países:", e);
      setCountries(LOCAL_FALLBACK_COUNTRIES);
    }
  };

  useEffect(() => {
    fetchCountries();
  }, []);
  
  const [loading, setLoading] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  // Masks
  const maskCPF = (v: string) => {
    v = v.replace(/\D/g, "");
    if (v.length > 11) v = v.slice(0, 11);
    return v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/g, "$1.$2.$3-$4");
  };

  const maskDate = (v: string) => {
    v = v.replace(/\D/g, "");
    if (v.length > 8) v = v.slice(0, 8);
    if (v.length <= 2) return v;
    if (v.length <= 4) return `${v.slice(0, 2)}/${v.slice(2)}`;
    return `${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4)}`;
  };

  const maskCEP = (v: string) => {
    v = v.replace(/\D/g, "");
    if (v.length > 8) v = v.slice(0, 8);
    return v.replace(/(\d{5})(\d{3})/g, "$1-$2");
  };

  const maskPhone = (v: string) => {
    v = v.replace(/\D/g, "");
    if (v.length > 11) v = v.slice(0, 11);
    return v.replace(/(\d{2})(\d{4,5})(\d{4})/g, "($1) $2-$3");
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      let formattedBirthDate = formData.birthDate;
      if (formData.birthDate.includes('/')) {
        const parts = formData.birthDate.split('/');
        if (parts.length === 3) {
          const [day, month, year] = parts;
          formattedBirthDate = `${year}-${month}-${day}`;
        }
      }

      const toEnumKey = <T extends Record<string, string>>(enumObject: T, value: string) => {
        const found = Object.entries(enumObject).find(([, enumValue]) => enumValue === value);
        return found?.[0] ?? value;
      };

      const payload = {
        email: formData.email,
        password: formData.password,
        realName: formData.realName,
        identity: formData.identity.replace(/\D/g, ""),
        gender: toEnumKey(UserGender, formData.gender),
        ethnicity: toEnumKey(UserEthnicity, formData.ethnicity),
        birthDate: formattedBirthDate,
        address: {
          zipCode: formData.zipCode.replace(/\D/g, ""),
          street: formData.street,
          city: formData.city,
          state: formData.state,
          district: formData.district,
          country: formData.country,
          number: formData.number || 'SN'
        },
        phones: [
          { ddi: formData.ddi, ddd: formData.ddd.replace(/\D/g, ""), number: formData.phone.replace(/\D/g, "") }
        ]
      };
      await UsersService.register(payload);
      const { user, token } = await UsersService.login(formData.email, formData.password);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      await AsyncStorage.setItem('token', token);
      dispatch(setCredentials({ user, token }));
      setShowPrivacy(false);
      Alert.alert("Sucesso", "Bem-vindo à VERDEVIA!");
      router.replace('/history');
    } catch (error: any) { 
      const msg = error.response?.data?.message || "Falha no cadastro.";
      Alert.alert("Erro", msg);
    } finally { setLoading(false); }
  };

  const handleCEPBlur = async () => {
    const cep = formData.zipCode.replace(/\D/g, "");
    if (cep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setFormData({
            ...formData,
            street: data.logradouro,
            district: data.bairro,
            city: data.localidade,
            state: data.uf
          });
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
      }
    }
  };

  const validateStep = () => {
    if (step === 1) {
      if (!formData.realName || !formData.identity || !formData.gender || !formData.ethnicity || !formData.birthDate) {
        Alert.alert("Campos Obrigatórios", "Por favor, preencha todos os dados pessoais.");
        return false;
      }
    }
    if (step === 2) {
      if (!formData.zipCode || !formData.street || !formData.city || !formData.state || !formData.district || !formData.country) {
        Alert.alert("Campos Obrigatórios", "Por favor, preencha todos os dados de endereço.");
        return false;
      }
    }
    if (step === 3) {
      if (!formData.ddi || !formData.ddd || !formData.phone) {
        Alert.alert("Campos Obrigatórios", "Por favor, insira seu telefone completo (DDI, DDD e Número).");
        return false;
      }
    }
    if (step === 4) {
      if (!formData.email || !formData.password) {
        Alert.alert("Acesso", "E-mail e senha são necessários.");
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep()) setStep((step + 1) as RegStep);
  };

  const prevStep = () => {
    if (step > 1) setStep((step - 1) as RegStep);
    else router.back();
  };

  const getHeaderInfo = () => {
    switch(step) {
      case 1: return { title: "Crie sua conta", subtitle: "Primeiro, conte-nos um pouco sobre você." };
      case 2: return { title: "Onde você mora?", subtitle: "Essas informações nos ajudam a localizar iniciativas perto de você." };
      case 3: return { title: "Como falamos com você?", subtitle: "Seu telefone é usado para segurança e notificações importantes." };
      case 4: return { title: "Finalize seu acesso", subtitle: "Escolha suas credenciais para entrar no VERDEVIA." };
    }
  };

  const headerInfo = getHeaderInfo();

  return (
    <AuthContainer>
      <View style={styles.topRow}>
        <TouchableOpacity onPress={prevStep} style={styles.backBtn}>
          <ChevronLeft color="#00FF9C" size={28} />
        </TouchableOpacity>
        <StepIndicator currentStep={step} totalSteps={4} />
        <View style={{ width: 40 }} />
      </View>

      <AuthHeader title={headerInfo.title} subtitle={headerInfo.subtitle} />

      <View style={styles.formContainer}>
        {step === 1 && (
          <Animated.View entering={FadeInRight} layout={Layout.springify()}>
            <PremiumInput
              label="Nome Completo"
              value={formData.realName}
              onChangeText={t => setFormData({...formData, realName: t})}
              icon={UserIcon}
            />

            <PremiumInput
              label="CPF"
              value={maskCPF(formData.identity)}
              onChangeText={t => setFormData({...formData, identity: t})}
              icon={Hash}
              keyboardType="numeric"
            />

            <PremiumInput
              label="Nascimento (DD/MM/AAAA)"
              value={maskDate(formData.birthDate)}
              onChangeText={t => setFormData({...formData, birthDate: t})}
              icon={CalendarIcon}
              keyboardType="numeric"
            />

            <View style={styles.selectWrapper}>
                <Select onValueChange={(val) => setFormData({...formData, gender: val as UserGender})}>
                    <SelectTrigger variant="outline" size="xl" style={styles.customSelect}>
                        <Users size={20} color="#666" style={{ marginRight: 15 }} />
                        <SelectInput placeholder="Selecione o Gênero" style={{ color: '#FFF' }} />
                        <SelectIcon style={{ marginLeft: 'auto' }} as={ChevronDown} />
                    </SelectTrigger>
                    <SelectPortal>
                        <SelectBackdrop />
                        <SelectContent style={styles.selectContent}>
                            <SelectDragIndicatorWrapper><SelectDragIndicator /></SelectDragIndicatorWrapper>
                            {Object.values(UserGender).map(g => (
                                <SelectItem key={g} label={g} value={g} className="px-4 py-4">
                                    <SelectItemText className="text-white text-lg">{g}</SelectItemText>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </SelectPortal>
                </Select>
            </View>

            <View style={styles.selectWrapper}>
                <Select onValueChange={(val) => setFormData({...formData, ethnicity: val as UserEthnicity})}>
                    <SelectTrigger variant="outline" size="xl" style={styles.customSelect}>
                        <Info size={20} color="#666" style={{ marginRight: 15 }} />
                        <SelectInput placeholder="Selecione a Etnia" style={{ color: '#FFF' }} />
                        <SelectIcon style={{ marginLeft: 'auto' }} as={ChevronDown} />
                    </SelectTrigger>
                    <SelectPortal>
                        <SelectBackdrop />
                        <SelectContent style={styles.selectContent}>
                            <SelectDragIndicatorWrapper><SelectDragIndicator /></SelectDragIndicatorWrapper>
                            {Object.values(UserEthnicity).map(e => (
                                <SelectItem key={e} label={e} value={e} className="px-4 py-4">
                                    <SelectItemText className="text-white text-lg">{e}</SelectItemText>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </SelectPortal>
                </Select>
            </View>
          </Animated.View>
        )}

        {step === 2 && (
          <Animated.View entering={FadeInRight} layout={Layout.springify()}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <PremiumInput
                  label="CEP"
                  value={maskCEP(formData.zipCode)}
                  onChangeText={t => setFormData({...formData, zipCode: t})}
                  icon={MapPin}
                  keyboardType="numeric"
                />
              </View>
              <TouchableOpacity 
                onPress={handleCEPBlur}
                style={styles.searchBtn}
              >
                <Search color="#000" size={24} />
              </TouchableOpacity>
            </View>

            <PremiumInput
              label="País"
              value={formData.country}
              onChangeText={t => setFormData({...formData, country: t})}
              icon={Globe}
            />

            <PremiumInput
              label="Rua"
              value={formData.street}
              onChangeText={t => setFormData({...formData, street: t})}
            />

            <View style={styles.row}>
              <View style={{ flex: 2 }}>
                <PremiumInput
                  label="Bairro"
                  value={formData.district}
                  onChangeText={t => setFormData({...formData, district: t})}
                />
              </View>
              <View style={{ flex: 1 }}>
                <PremiumInput
                  label="UF"
                  value={formData.state}
                  onChangeText={t => setFormData({...formData, state: t})}
                />
              </View>
            </View>

            <PremiumInput
              label="Cidade"
              value={formData.city}
              onChangeText={t => setFormData({...formData, city: t})}
            />

            <PremiumInput
              label="Número (Opcional)"
              value={formData.number}
              onChangeText={t => setFormData({...formData, number: t})}
            />
          </Animated.View>
        )}

        {step === 3 && (
          <Animated.View entering={FadeInRight} layout={Layout.springify()}>
            <View style={styles.selectWrapper}>
                <Select onValueChange={(val) => setFormData({...formData, ddi: val})}>
                    <SelectTrigger variant="outline" size="xl" style={styles.customSelect}>
                        <Globe size={20} color="#666" style={{ marginRight: 15 }} />
                        <SelectInput placeholder="DDI (País)" style={{ color: '#FFF' }} value={formData.ddi} />
                        <SelectIcon style={{ marginLeft: 'auto' }} as={ChevronDown} />
                    </SelectTrigger>
                    <SelectPortal>
                        <SelectBackdrop />
                        <SelectContent style={styles.selectContent}>
                            <SelectDragIndicatorWrapper><SelectDragIndicator /></SelectDragIndicatorWrapper>
                            {countries.map(c => (
                                <SelectItem key={c.code + c.ddi} label={`${c.name} (${c.ddi})`} value={c.ddi} className="px-4 py-4">
                                    <SelectItemText className="text-white text-lg">{c.name} ({c.ddi})</SelectItemText>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </SelectPortal>
                </Select>
            </View>

            <View style={styles.row}>
              <View style={{ width: 100 }}>
                <PremiumInput
                  label="DDD"
                  value={formData.ddd}
                  onChangeText={t => setFormData({...formData, ddd: t})}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <PremiumInput
                  label="Número"
                  value={formData.phone}
                  onChangeText={t => setFormData({...formData, phone: t})}
                  icon={Phone}
                  keyboardType="phone-pad"
                />
              </View>
            </View>
          </Animated.View>
        )}

        {step === 4 && (
          <Animated.View entering={FadeInRight} layout={Layout.springify()}>
            <PremiumInput
              label="E-mail"
              value={formData.email}
              onChangeText={t => setFormData({...formData, email: t})}
              icon={Mail}
              keyboardType="email-address"
            />
            <PremiumInput
              label="Senha (Mín. 6 caracteres)"
              value={formData.password}
              onChangeText={t => setFormData({...formData, password: t})}
              icon={Lock}
              secureTextEntry
            />
          </Animated.View>
        )}

        <View style={styles.footerActions}>
          <ActionButton 
            title={step === 4 ? "Finalizar Cadastro" : "Próximo Passo"} 
            onPress={step === 4 ? () => setShowPrivacy(true) : nextStep}
            icon={step === 4 ? <ShieldCheck size={20} color="#000" /> : <ArrowRight size={20} color="#000" />}
          />
          
          <TouchableOpacity 
            onPress={() => router.push('/auth/login')}
            style={styles.loginLink}
          >
            <Text style={styles.loginLinkText}>Já tem uma conta? <Text style={{ color: '#00FF9C', fontWeight: '700' }}>Entrar</Text></Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={showPrivacy} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Animated.View entering={FadeInUp} style={styles.modalContent}>
            <View style={styles.modalIcon}>
              <ShieldCheck size={50} color="#00FF9C" strokeWidth={1.5} />
            </View>
            <Text style={styles.modalTitle}>Privacidade e Dados</Text>
            <Text style={styles.modalText}>
              Na VERDEVIA, levamos sua privacidade a sério. Seus dados pessoais são coletados apenas para garantir sua identidade e segurança na plataforma, em conformidade com a LGPD.
            </Text>
            
            <View style={styles.modalFooter}>
               <TouchableOpacity style={styles.btnDecline} onPress={() => setShowPrivacy(false)}>
                 <Text style={styles.btnDeclineText}>Revisar</Text>
               </TouchableOpacity>
               <TouchableOpacity 
                 style={styles.btnAccept} 
                 onPress={handleRegister}
                 disabled={loading}
               >
                 {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.btnAcceptText}>Aceitar e Criar Conta</Text>}
               </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </AuthContainer>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 10,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#161616',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 15,
  },
  searchBtn: {
    backgroundColor: '#00FF9C',
    width: 65,
    height: 65,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectWrapper: {
    marginBottom: 20,
  },
  customSelect: {
    height: 65,
    backgroundColor: '#121212',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#262626',
    paddingHorizontal: 20,
  },
  selectContent: {
    backgroundColor: '#0A0A0A',
    borderTopWidth: 1,
    borderColor: '#262626',
    paddingBottom: 40,
  },
  footerActions: {
    marginTop: 30,
    paddingBottom: 40,
  },
  loginLink: {
    alignItems: 'center',
    marginTop: 25,
  },
  loginLinkText: {
    color: '#888',
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    padding: 25,
  },
  modalContent: {
    backgroundColor: '#121212',
    borderRadius: 35,
    padding: 35,
    borderWidth: 1,
    borderColor: '#262626',
    alignItems: 'center',
  },
  modalIcon: {
    marginBottom: 20,
  },
  modalTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalText: {
    color: '#888',
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 22,
    fontSize: 15,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 15,
    width: '100%',
  },
  btnDecline: {
    flex: 1,
    height: 60,
    borderRadius: 18,
    backgroundColor: '#262626',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnDeclineText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
  btnAccept: {
    flex: 2,
    height: 60,
    borderRadius: 18,
    backgroundColor: '#00FF9C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnAcceptText: {
    color: '#000',
    fontWeight: '800',
    fontSize: 16,
  }
});
