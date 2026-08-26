import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { AuthProvider } from './src/context/AuthContext';
import { AppProvider, useApp } from './src/context/AppContext';
import { SubscriptionProvider, useSubscription } from './src/context/SubscriptionContext';
import { PaywallModal } from './src/components/PaywallModal';
import { RootNavigator } from './src/navigation/RootNavigator';
import { isFreeProgram } from './src/data/subscription';
import { colors } from './src/constants/theme';

function SubscriptionGuard() {
  const { isPro } = useSubscription();
  const { activeProgramId, selectProgram } = useApp();

  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  useEffect(() => {
    if (!isPro && activeProgramId && !isFreeProgram(activeProgramId)) {
      selectProgram('kvk-yeni-baslayan');
    }
  }, [isPro, activeProgramId, selectProgram]);

  if (!fontsLoaded) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return null;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <SubscriptionProvider>
          <AppProvider>
            <SubscriptionGuard />
            <RootNavigator />
            <PaywallModal />
            <StatusBar style="light" />
          </AppProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
