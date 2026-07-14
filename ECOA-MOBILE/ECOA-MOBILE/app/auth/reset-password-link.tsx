import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown, ScaleInCenter } from 'react-native-reanimated';

// Premium Components
import AuthContainer from '../../components/auth/AuthContainer';
import AuthHeader from '../../components/auth/AuthHeader';
import PremiumInput from '../../components/auth/PremiumInput';
import ActionButton from '../../components/auth/ActionButton';
import UsersService from '../../services/users.service';

export default function ResetPasswordLinkScreen() {
  const params = useLocalSearchParams<{ token?: string; email?: string }>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const router = useRouter();

  const token = Array.isArray(params.token) ? params.token[0] : params.token;
  const email = Array.isArray(params.email) ? params.email[0] : params.email;

  const handleFinish = async () => {
    if (!password || password !== confirmPassword || !token || !email) return;
    
    setSubmitError('');
    setLoading(true);
    try {
      await UsersService.resetPassword(email, token, password);
      setLoading(false);
      setCompleted(true);
    } catch (error: any) {
      setSubmitError(
        error?.response?.data?.message ||
        'Link inválido, expirado ou indisponível. Solicite uma nova recuperação.',
      );
      setLoading(false);
    }
  };

  return (
    <AuthContainer>
      {!completed && (
        <TouchableOpacity 
          style={styles.backBtn} 
          onPress={() => router.replace('/auth/login')}
          activeOpacity={0.7}
        >
          <Lock color="#00FF9C" size={20} style={{ opacity: 0.5 }} />
        </TouchableOpacity>
      )}

      {completed ? (
        <View style={styles.successContainer}>
          <Animated.View 
            entering={ScaleInCenter.springify()} 
            style={styles.iconWrapper}
          >
            <View style={styles.iconCircle}>
              <CheckCircle size={60} color="#00FF9C" strokeWidth={1.5} />
            </View>
          </Animated.View>

          <AuthHeader 
            title="Senha Alterada!" 
            subtitle="Sua nova senha foi definida com sucesso. Você já pode acessar sua conta ECOA."
          />

          <Animated.View entering={FadeIn.delay(600)} style={styles.successActions}>
            <ActionButton 
              title="Ir para o Login" 
              onPress={() => router.replace('/auth/login')}
              variant="primary"
            />
          </Animated.View>
        </View>
      ) : (
        <Animated.View entering={FadeInDown.duration(600)}>
          <AuthHeader 
            title="Nova Senha" 
            subtitle={
              token && email
                ? "Crie uma nova senha forte para proteger sua conta. Use pelo menos 8 caracteres."
                : "Link de recuperação incompleto. Solicite um novo e-mail de recuperação."
            }
          />

          <View style={styles.form}>
            <PremiumInput
              label="Nova Senha"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              icon={Lock}
              rightElement={
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeOff size={22} color="#666" />
                  ) : (
                    <Eye size={22} color="#666" />
                  )}
                </TouchableOpacity>
              }
            />

            <PremiumInput
              label="Confirmar Senha"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              icon={Lock}
              error={
                (confirmPassword && password !== confirmPassword
                  ? "As senhas não coincidem"
                  : undefined) || submitError
              }
            />

            <View style={styles.buttonWrapper}>
              <ActionButton 
                title="Redefinir Senha" 
                onPress={handleFinish} 
                loading={loading}
                disabled={!password || password !== confirmPassword || !token || !email}
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
    gap: 15,
  },
  buttonWrapper: {
    marginTop: 25,
  },
  successContainer: {
    alignItems: 'center',
    paddingTop: 40,
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
