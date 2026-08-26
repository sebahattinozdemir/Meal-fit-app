import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { MealCard, DayChip } from '../components/Cards';
import { ProfileAvatar } from '../components/ProfileAvatar';
import { TodaySummaryCard } from '../components/TodaySummaryCard';
import { workoutDayPlan, restDayPlan } from '../data/meals';
import { DAY_NAMES, MEAL_LABELS, MealType } from '../types';
import { FITNESS_GOAL_LABELS } from '../types/profile';
import { getWorkoutStreak } from '../utils/progressStats';
import { getPersonalizedInsights } from '../utils/personalization';
import { navigateToMainTab, navigateToProfile, MainTabRoute } from '../navigation/navigationHelpers';
import { colors, spacing, borderRadius, fonts } from '../constants/theme';

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const {
    workoutDays,
    isWorkoutDay,
    getDayType,
    hasWorkoutLoggedToday,
    getWorkoutsThisWeek,
    getDailyNutritionTargets,
    userProfile,
    progressEntries,
    workoutLogs,
    getActiveProgram,
  } = useApp();

  const today = new Date().getDay();
  const todayType = getDayType(today);
  const todayPlan = todayType === 'spor' ? workoutDayPlan : restDayPlan;
  const mealTypes: MealType[] = ['kahvalti', 'ogle', 'aksam', 'araOgun'];
  const weekCount = getWorkoutsThisWeek().length;
  const loggedToday = hasWorkoutLoggedToday();
  const workoutStreak = getWorkoutStreak(workoutLogs, workoutDays);
  const activeProgram = getActiveProgram();
  const nutrition = getDailyNutritionTargets(todayType === 'spor');

  const totalCalories =
    nutrition?.calories ?? mealTypes.reduce((sum, type) => sum + todayPlan.meals[type].calories, 0);
  const totalProtein =
    nutrition?.protein ?? mealTypes.reduce((sum, type) => sum + todayPlan.meals[type].protein, 0);

  const topInsight =
    userProfile &&
    getPersonalizedInsights({
      profile: userProfile,
      dayType: todayType,
      isWorkoutDay: todayType === 'spor',
      loggedWorkoutToday: loggedToday,
      workoutsThisWeek: weekCount,
      progressEntries,
      activeProgramName: activeProgram?.name ?? null,
    })[0];

  const openProfile = () => navigateToProfile(navigation);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.headerUser} onPress={openProfile} activeOpacity={0.85}>
            <ProfileAvatar size={44} light />
            <View style={styles.headerUserText}>
              <Text style={styles.greeting}>Merhaba, {user?.name?.split(' ')[0] || 'Sporcu'}</Text>
              <Text style={styles.headerUserSub}>
                {userProfile ? FITNESS_GOAL_LABELS[userProfile.goal] : 'Ayarlar'}
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileBtn} onPress={openProfile}>
            <Ionicons name="settings-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        <TodaySummaryCard
          dayType={todayType}
          dayName={DAY_NAMES[today]}
          calories={totalCalories}
          protein={totalProtein}
          nutritionNote={nutrition?.note}
          loggedWorkoutToday={loggedToday}
          workoutsThisWeek={weekCount}
          workoutStreak={workoutStreak}
          onWorkoutPress={() => navigateToMainTab(navigation, 'Spor')}
          onProgressPress={() => navigateToMainTab(navigation, 'Gelisim')}
        />

        {topInsight ? (
          <TouchableOpacity
            style={styles.tipCard}
            onPress={() => topInsight.actionRoute && navigateToMainTab(navigation, topInsight.actionRoute as MainTabRoute)}
            activeOpacity={topInsight.actionRoute ? 0.85 : 1}
          >
            <Ionicons name="bulb-outline" size={18} color={colors.secondary} />
            <View style={styles.tipBody}>
              <Text style={styles.tipTitle}>{topInsight.title}</Text>
              <Text style={styles.tipText} numberOfLines={2}>
                {topInsight.body}
              </Text>
            </View>
          </TouchableOpacity>
        ) : null}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Haftalık program</Text>
          <TouchableOpacity onPress={() => navigateToMainTab(navigation, 'Spor')} hitSlop={8}>
            <Text style={styles.sectionLink}>Düzenle</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.daysRow}>
          {DAY_NAMES.map((name, index) => (
            <DayChip
              key={index}
              dayName={name}
              dayIndex={index}
              isWorkout={isWorkoutDay(index)}
              isToday={index === today}
            />
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Bugünün yemekleri</Text>
          <TouchableOpacity onPress={() => navigateToMainTab(navigation, 'Yemekler')} hitSlop={8}>
            <Text style={styles.sectionLink}>Tüm plan</Text>
          </TouchableOpacity>
        </View>

        {mealTypes.map((type) => {
          const meal = todayPlan.meals[type];
          return (
            <MealCard
              key={type}
              mealType={MEAL_LABELS[type]}
              name={meal.name}
              calories={meal.calories}
              protein={meal.protein}
              prepTime={meal.prepTime}
              ingredients={meal.ingredients}
              isWorkout={todayType === 'spor'}
              onPress={() => navigateToMainTab(navigation, 'Yemekler')}
            />
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primary,
    paddingTop: spacing.xl + 20,
    paddingBottom: spacing.xl + spacing.sm,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerUser: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  headerUserText: { flex: 1 },
  greeting: { fontSize: 18, fontFamily: fonts.extrabold, color: '#fff' },
  headerUserSub: { fontSize: 12, fontFamily: fonts.medium, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  profileBtn: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl * 2 },
  tipCard: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: '#EEF2FF',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  tipBody: { flex: 1 },
  tipTitle: { fontSize: 13, fontFamily: fonts.bold, color: colors.text },
  tipText: { fontSize: 12, fontFamily: fonts.regular, color: colors.textSecondary, marginTop: 2, lineHeight: 17 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionTitle: { fontSize: 17, fontFamily: fonts.extrabold, color: colors.text },
  sectionLink: { fontSize: 13, fontFamily: fonts.bold, color: colors.primary },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
});
