import React from 'react';
import { Redirect } from 'expo-router';
import { useSelector } from 'react-redux';
import { View, Text, StyleSheet } from 'react-native';

export default function Index() {
  const { isAuthenticated } = useSelector((state: any) => state.auth);

  // Se não estiver autenticado, redireciona para o login
  if (!isAuthenticated) {
    return <Redirect href="/auth/login" />;
  }

  // Se estiver autenticado, redireciona para a tela de Queixas Locais (primeira aba do dock)
  if (isAuthenticated) {
    return <Redirect href="/history" />;
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00FF9C',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#EEE',
    textAlign: 'center',
  }
});