import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Dimensions,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { 
  ChevronLeft, 
  CheckCircle, 
  Play, 
  FileText, 
  HelpCircle,
  ChevronRight,
  Zap
} from 'lucide-react-native';
import { Motion } from '@legendapp/motion';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/services/api';
import { useTheme } from '@/context/ThemeContext';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Heading } from '@/components/ui/heading';
import { getLessonXp } from '@/utils/gamification';

const { width } = Dimensions.get('window');

export default function LessonPlayer() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { isDark } = useTheme();
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [mediaStarted, setMediaStarted] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizAnswered, setQuizAnswered] = useState(false);

  useEffect(() => {
    fetchLesson();
  }, [id]);

  const fetchLesson = async () => {
    try {
      const response = await api.get(`/courses/lessons/${id}`);
      setLesson(response.data);
    } catch (error) {
      console.error('Erro ao buscar lição:', error);
      Alert.alert('Erro', 'Não foi possível carregar a lição.');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    const earnedXp = getLessonXp(lesson?.type, quizAnswered);
    setCompleted(true);

    try {
      const storedUser = await AsyncStorage.getItem('user');
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;

      await api.post(`/courses/lessons/${id}/complete`, {
        xp: earnedXp,
        quizAnswered,
      }).catch(async () => {
        if (parsedUser?.id) {
          await api.post(`/users/${parsedUser.id}/xp`, {
            amount: earnedXp,
            source: 'lesson_complete',
            referenceId: id,
          });
        }
      });

      if (parsedUser) {
        await AsyncStorage.setItem(
          'user',
          JSON.stringify({
            ...parsedUser,
            xp: (parsedUser.xp || parsedUser.points || 0) + earnedXp,
            lessonsCompleted: (parsedUser.lessonsCompleted || 0) + 1,
          })
        );
      }
    } catch (error) {
      console.error('Erro ao registrar XP:', error);
    }

    Alert.alert(
      "Licao Concluida!",
      `Voce ganhou +${earnedXp} XP por finalizar este conteudo.`,
      [{ text: "Continuar", onPress: () => router.back() }]
    );
  };

  const handleStartQuiz = () => {
    setQuizStarted(true);
    setQuizAnswered(false);
  };

  const handleQuizAnswer = () => {
    setQuizAnswered(true);
  };

  if (loading) {
    return (
      <Box className={`flex-1 ${isDark ? 'bg-[#0A0A0A]' : 'bg-[#F8F9FA]'} items-center justify-center`}>
        <ActivityIndicator color="#00FF9C" size="large" />
      </Box>
    );
  }

  const theme = {
    bg: isDark ? '#0A0A0A' : '#F8F9FA',
    card: isDark ? '#161616' : '#FFF',
    text: isDark ? '#FFF' : '#000',
    subtext: isDark ? '#666' : '#888',
    border: isDark ? '#222' : '#EEE'
  };

  return (
    <Box className="flex-1" style={{ backgroundColor: theme.bg }}>
      {/* Header Cinematográfico */}
      <HStack className="pt-16 px-6 items-center justify-between pb-4">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 bg-emerald-500/10 rounded-xl">
          <ChevronLeft color="#00FF9C" size={24} />
        </TouchableOpacity>
        <VStack className="items-center">
          <Text className="text-[#00FF9C] text-[10px] font-black uppercase tracking-widest">
            {lesson?.type === 'video' ? 'Vídeo Aula' : lesson?.type === 'quiz' ? 'Desafio' : 'Material'}
          </Text>
          <Heading size="sm" className={isDark ? 'text-white' : 'text-black'}>Módulo 01</Heading>
        </VStack>
        <Box className="w-10" />
      </HStack>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Player Placeholder / Banner */}
        <Motion.View 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={[styles.mediaContainer, { backgroundColor: isDark ? '#111' : '#EEE' }]}
        >
          {lesson?.type === 'video' ? (
            <View className="items-center justify-center flex-1">
              <TouchableOpacity
                className="w-20 h-20 bg-[#00FF9C] rounded-full items-center justify-center shadow-lg shadow-emerald-500/40"
                onPress={() => setMediaStarted((current) => !current)}
              >
                {mediaStarted ? <CheckCircle size={32} color="#000" /> : <Play size={32} color="#000" fill="#000" />}
              </TouchableOpacity>
              <Text className="text-[#666] mt-4 font-bold text-xs uppercase tracking-widest">Vídeo carregando...</Text>
            </View>
          ) : (
            <View className="items-center justify-center flex-1">
              <FileText size={64} color="#00FF9C" opacity={0.3} />
            </View>
          )}
        </Motion.View>

        <VStack className="px-6 mt-8 gap-6">
          <VStack className="gap-2">
            <Heading size="xl" className={isDark ? 'text-white' : 'text-black'}>{lesson?.title}</Heading>
            <HStack className="items-center gap-2">
               <Zap size={14} color="#00FF9C" />
               <Text className="text-[#00FF9C] text-xs font-bold">+{getLessonXp(lesson?.type, quizAnswered)} XP ao concluir</Text>
            </HStack>
          </VStack>

          <Box className={`p-6 rounded-[24px] border ${isDark ? 'bg-[#161616] border-[#222]' : 'bg-white border-[#EEE]'}`}>
            <Text className={`${isDark ? 'text-[#AAA]' : 'text-[#444]'} text-base leading-7`}>
              {lesson?.contentBody || "Nesta aula exploramos os fundamentos da ecologia aplicada e como pequenas mudanças no cotidiano geram grandes impactos na biodiversidade local."}
            </Text>
          </Box>

          {lesson?.type === 'quiz' && (
            <TouchableOpacity 
              className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-[22px] flex-row items-center justify-between"
              onPress={handleStartQuiz}
            >
              <HStack className="items-center gap-4">
                <Box className="w-12 h-12 bg-[#00FF9C] rounded-xl items-center justify-center">
                  <HelpCircle size={24} color="#000" />
                </Box>
                <VStack>
                  <Text className={isDark ? 'text-white font-bold' : 'text-black font-bold'}>Iniciar Quiz</Text>
                  <Text className="text-[#666] text-xs">5 questões • 100 XP bônus</Text>
                </VStack>
              </HStack>
              <ChevronRight size={20} color="#00FF9C" />
            </TouchableOpacity>
          )}

          {lesson?.type === 'quiz' && quizStarted && (
            <Box className={`p-5 rounded-[22px] border ${isDark ? 'bg-[#101010] border-[#222]' : 'bg-white border-[#EEE]'}`}>
              <Text className={isDark ? 'text-white font-bold mb-3' : 'text-black font-bold mb-3'}>
                Qual atitude reduz melhor o impacto ambiental no cotidiano?
              </Text>
              <TouchableOpacity
                className={`p-4 rounded-2xl border ${quizAnswered ? 'bg-[#00FF9C] border-[#00FF9C]' : 'border-emerald-500/30 bg-emerald-500/10'}`}
                onPress={handleQuizAnswer}
              >
                <Text className={`${quizAnswered ? 'text-black' : 'text-[#00FF9C]'} font-bold`}>
                  Separar residuos, economizar agua e reduzir descartaveis
                </Text>
              </TouchableOpacity>
              {quizAnswered && (
                <Text className="text-[#00FF9C] text-xs font-bold mt-3">
                  Resposta registrada. Finalize a aula para receber o XP.
                </Text>
              )}
            </Box>
          )}
        </VStack>
      </ScrollView>

      {/* Botão de Conclusão Flutuante */}
      <Box className="absolute bottom-10 left-6 right-6">
        <TouchableOpacity 
          className={`h-[70px] rounded-[24px] flex-row items-center justify-center gap-3 shadow-xl ${completed ? 'bg-emerald-900/50' : 'bg-[#00FF9C] shadow-emerald-500/20'}`}
          onPress={handleComplete}
          disabled={completed}
        >
          {completed ? (
            <CheckCircle size={24} color="#00FF9C" />
          ) : (
            <Play size={20} color="#000" fill="#000" />
          )}
          <Text className={`${completed ? 'text-[#00FF9C]' : 'text-black'} font-black uppercase tracking-widest text-lg`}>
            {completed ? 'Concluída' : 'Finalizar Aula'}
          </Text>
        </TouchableOpacity>
      </Box>
    </Box>
  );
}

const styles = StyleSheet.create({
  mediaContainer: {
    width: width,
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
