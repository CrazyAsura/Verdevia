import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeInDown } from 'react-native-reanimated';

import UsersService from '../../services/users.service';
import { setCredentials } from '@/store/slices/authSlice';
import { useTheme } from '@/context/ThemeContext';

import AuthContainer from '../../components/auth/AuthContainer';
import AuthHeader from '../../components/auth/AuthHeader';
import PremiumInput from '../../components/auth/PremiumInput';
import ActionButton from '../../components/auth/ActionButton';

export default function LoginScreen() {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const router = useRouter();
  const dispatch = useDispatch();

  const handleLogin = async () => {
    // Basic Validation
    const newErrors: { email?: string; password?: string } = {};
    if (!email) newErrors.email = t('email_required') || 'E-mail é obrigatório';
    if (!password) newErrors.password = t('password_required') || 'Senha é obrigatória';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const { user, token } = await UsersService.login(email, password);

      if (!user) {
        Alert.alert('Erro', 'Credenciais inválidas.');
      } else {
        await AsyncStorage.setItem('user', JSON.stringify(user));
        await AsyncStorage.setItem('token', token);
        dispatch(setCredentials({ user, token }));
        router.replace('/history');
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Falha na conexão.';
      Alert.alert('Erro', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContainer>
      <AuthHeader 
        title={t('welcome') || 'Bem-vindo'} 
        subtitle="Entre na sua conta VERDEVIA para continuar sua jornada sustentável." 
      />

      <Animated.View entering={FadeInDown.delay(600).springify()}>
        <PremiumInput
          label={t('email') || 'E-mail'}
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (errors.email) setErrors({ ...errors, email: undefined });
          }}
          icon={Mail}
          keyboardType="email-address"
          error={errors.email}
          placeholder="exemplo@verdevia.com"
        />

        <PremiumInput
          label={t('password') || 'Senha'}
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (errors.password) setErrors({ ...errors, password: undefined });
          }}
          icon={Lock}
          secureTextEntry={!showPassword}
          error={errors.password}
          rightElement={
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
              {showPassword ? (
                <EyeOff size={22} color="#666" />
              ) : (
                <Eye size={22} color="#666" />
              )}
            </TouchableOpacity>
          }
        />

        <TouchableOpacity 
          onPress={() => router.push('/auth/reset-password')}
          style={styles.forgotBtn}
        >
          <Text style={styles.forgotText}>{t('forgot_password') || 'Esqueceu a senha?'}</Text>
        </TouchableOpacity>

        <View style={styles.actionSection}>
          <ActionButton 
            title={t('enter') || 'Entrar'} 
            onPress={handleLogin} 
            loading={loading}
            icon={<ArrowRight size={20} color="#000" />}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('new_here') || 'Não tem uma conta?'} </Text>
          <TouchableOpacity onPress={() => router.push('/auth/register')}>
            <Text style={styles.signupText}>{t('create_account') || 'Cadastre-se'}</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </AuthContainer>
  );
}

const styles = StyleSheet.create({
  eyeBtn: {
    padding: 10,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 40,
    marginTop: -5,
  },
  forgotText: {
    color: '#00FF9C',
    fontSize: 14,
    fontWeight: '600',
  },
  actionSection: {
    marginTop: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    paddingBottom: 40,
  },
  footerText: {
    color: '#888',
    fontSize: 15,
  },
  signupText: {
    color: '#00FF9C',
    fontSize: 15,
    fontWeight: '700',
  },
});
