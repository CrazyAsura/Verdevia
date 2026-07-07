import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Mail, ChevronLeft, Send, CheckCircle2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';

// Premium Components
import AuthContainer from '../../components/auth/AuthContainer';
import AuthHeader from '../../components/auth/AuthHeader';
import PremiumInput from '../../components/auth/PremiumInput';
import ActionButton from '../../components/auth/ActionButton';
import UsersService from '../../services/users.service';

export default function ResetPasswordScreen() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const router = useRouter();

  const handleReset = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setEmailError('Informe seu e-mail para continuar.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setEmailError('Digite um e-mail válido.');
      return;
    }

    setEmailError('');
    setLoading(true);
    try {
      await UsersService.requestPasswordReset(normalizedEmail);
      setEmail(normalizedEmail);
      setSent(true);
    } catch {
      setEmailError('Não foi possível enviar agora. Verifique sua conexão e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContainer>
      <TouchableOpacity 
        style={styles.backBtn} 
        onPress={() => router.back()}
        activeOpacity={0.7}
      >
        <ChevronLeft color="#00FF9C" size={28} />
      </TouchableOpacity>

      {sent ? (
        <View style={styles.successContainer}>
          <Animated.View 
            entering={ZoomIn.springify()} 
            style={styles.iconWrapper}
          >
            <View style={styles.iconCircle}>
              <CheckCircle2 size={60} color="#00FF9C" strokeWidth={1.5} />
            </View>
          </Animated.View>

          <AuthHeader 
            title="E-mail Enviado!" 
            subtitle={`Enviamos as instruções de recuperação para:\n${email}`}
          />

          <Animated.View entering={FadeIn.delay(600)} style={styles.successActions}>
            <ActionButton 
              title="Voltar para o Login" 
              onPress={() => router.replace('/auth/login')}
              variant="primary"
            />
          </Animated.View>
        </View>
      ) : (
        <Animated.View entering={FadeInDown.duration(600)}>
          <AuthHeader 
            title="Esqueceu a senha?" 
            subtitle="Não se preocupe! Insira seu e-mail abaixo para receber as instruções de recuperação."
          />
          
          <View style={styles.form}>
            <PremiumInput
              label="E-mail"
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                if (emailError) setEmailError('');
              }}
              placeholder="seu@email.com"
              icon={Mail}
              keyboardType="email-address"
              autoCapitalize="none"
              error={emailError}
            />

            <View style={styles.buttonWrapper}>
              <ActionButton 
                title="Enviar Instruções" 
                onPress={handleReset} 
                loading={loading}
                disabled={!email}
                icon={<Send color="#000" size={18} />}
              />
            </View>
          </View>
        </Animated.View>
      )}
    </AuthContainer>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#333',
  },
  form: {
    marginTop: 10,
    gap: 25,
  },
  buttonWrapper: {
    marginTop: 15,
  },
  successContainer: {
    alignItems: 'center',
    paddingTop: 20,
  },
  iconWrapper: {
    marginBottom: 30,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0, 255, 156, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 156, 0.1)',
  },
  successActions: {
    width: '100%',
    marginTop: 20,
  },
});
