import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { LoginScreen } from '../screens/LoginScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { MealPlanScreen } from '../screens/MealPlanScreen';
import { ProgressScreen } from '../screens/ProgressScreen';
import { WorkoutScreen } from '../screens/ShoppingAndWorkoutScreens';
import { ProfileScreen } from '../screens/ProfileScreen';
import { colors, fonts } from '../constants/theme';

const RootStack = createNativeStackNavigator();
const AppStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            AnaSayfa: focused ? 'home' : 'home-outline',
            Yemekler: focused ? 'restaurant' : 'restaurant-outline',
            Spor: focused ? 'barbell' : 'barbell-outline',
            Gelisim: focused ? 'trending-up' : 'trending-up-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: 4,
          height: 60,
        },
        tabBarLabelStyle: { fontSize: 11, fontFamily: fonts.semibold },
        headerShown: false,
      })}
    >
      <Tab.Screen name="AnaSayfa" component={HomeScreen} options={{ title: 'Ana Sayfa' }} />
      <Tab.Screen name="Yemekler" component={MealPlanScreen} options={{ title: 'Yemekler' }} />
      <Tab.Screen name="Spor" component={WorkoutScreen} options={{ title: 'Spor' }} />
      <Tab.Screen name="Gelisim" component={ProgressScreen} options={{ title: 'Gelişim' }} />
    </Tab.Navigator>
  );
}

function MainStack() {
  return (
    <AppStack.Navigator screenOptions={{ headerShown: false }}>
      <AppStack.Screen name="Tabs" component={MainTabs} />
      <AppStack.Screen
        name="Profil"
        component={ProfileScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </AppStack.Navigator>
  );
}

function LoadingScreen() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

export function RootNavigator() {
  const { user, isLoading: authLoading } = useAuth();
  const { isProfileComplete, isLoading: appLoading, isProfileReady } = useApp();

  if (authLoading || appLoading || (user && !isProfileReady)) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <RootStack.Screen name="Login" component={LoginScreen} />
        ) : !isProfileComplete ? (
          <RootStack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : (
          <RootStack.Screen name="Main" component={MainStack} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
