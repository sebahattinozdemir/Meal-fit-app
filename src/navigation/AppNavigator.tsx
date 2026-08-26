import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { HomeScreen } from '../screens/HomeScreen';
import { MealPlanScreen } from '../screens/MealPlanScreen';
import { ShoppingListScreen, WorkoutScreen } from '../screens/ShoppingAndWorkoutScreens';
import { colors } from '../constants/theme';

const Tab = createBottomTabNavigator();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
              AnaSayfa: focused ? 'home' : 'home-outline',
              Yemekler: focused ? 'restaurant' : 'restaurant-outline',
              Spor: focused ? 'barbell' : 'barbell-outline',
              Alisveris: focused ? 'cart' : 'cart-outline',
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
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
          headerShown: false,
        })}
      >
        <Tab.Screen name="AnaSayfa" component={HomeScreen} options={{ title: 'Ana Sayfa' }} />
        <Tab.Screen name="Yemekler" component={MealPlanScreen} options={{ title: 'Yemekler' }} />
        <Tab.Screen name="Spor" component={WorkoutScreen} options={{ title: 'Spor' }} />
        <Tab.Screen name="Alisveris" component={ShoppingListScreen} options={{ title: 'Alışveriş' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
