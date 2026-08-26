import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { colors, spacing, borderRadius, fonts, cardShadow } from '../constants/theme';

const CATEGORY_LABELS: Record<string, string> = {
  protein: 'Protein Kaynakları',
  sebze: 'Sebze & Meyve',
  tahil: 'Tahıllar',
  sut: 'Süt Ürünleri',
  diger: 'Diğer',
};

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  protein: 'barbell',
  sebze: 'leaf',
  tahil: 'nutrition',
  sut: 'water',
  diger: 'ellipsis-horizontal',
};

export function ShoppingListContent() {
  const { shoppingList, toggleShoppingItem, generateShoppingList, workoutDays } = useApp();

  const grouped = shoppingList.reduce<Record<string, typeof shoppingList>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const checkedCount = shoppingList.filter((i) => i.checked).length;
  const totalCount = shoppingList.length;
  const progress = totalCount > 0 ? checkedCount / totalCount : 0;

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Alışveriş listesi</Text>
          <Text style={styles.headerSubtitle}>
            {workoutDays.length} spor + {7 - workoutDays.length} dinlenme günü
          </Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={generateShoppingList}>
          <Ionicons name="refresh" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {checkedCount}/{totalCount} tamamlandı
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
        {Object.entries(grouped).map(([category, items]) => (
          <View key={category} style={styles.categorySection}>
            <View style={styles.categoryHeader}>
              <Ionicons name={CATEGORY_ICONS[category] || 'list'} size={18} color={colors.primary} />
              <Text style={styles.categoryTitle}>{CATEGORY_LABELS[category] || category}</Text>
            </View>
            {items.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.itemRow, item.checked && styles.itemRowChecked]}
                onPress={() => toggleShoppingItem(item.id)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={item.checked ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={item.checked ? colors.primary : colors.textLight}
                />
                <View style={styles.itemMain}>
                  <Text style={[styles.itemName, item.checked && styles.itemNameChecked]}>{item.name}</Text>
                  {item.purchaseHint ? (
                    <Text style={[styles.itemHint, item.checked && styles.itemHintChecked]}>
                      {item.purchaseHint}
                    </Text>
                  ) : null}
                </View>
                <Text style={styles.itemQuantity}>{item.quantity}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {shoppingList.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="cart-outline" size={48} color={colors.textLight} />
            <Text style={styles.emptyText}>Alışveriş listesi boş</Text>
            <TouchableOpacity style={styles.generateBtn} onPress={generateShoppingList}>
              <Text style={styles.generateBtnText}>Listeyi oluştur</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerText: { flex: 1 },
  headerTitle: { fontSize: 20, fontFamily: fonts.extrabold, color: colors.text },
  headerSubtitle: { fontSize: 13, fontFamily: fonts.medium, color: colors.textSecondary, marginTop: 2 },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: { marginBottom: spacing.md },
  progressBar: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  progressText: {
    fontSize: 12,
    fontFamily: fonts.semibold,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  listContent: { paddingBottom: spacing.xl },
  categorySection: { marginBottom: spacing.lg },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  categoryTitle: { fontSize: 16, fontFamily: fonts.bold, color: colors.text },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
    gap: spacing.sm,
    ...cardShadow,
  },
  itemRowChecked: { opacity: 0.6 },
  itemMain: { flex: 1 },
  itemName: { fontSize: 15, fontFamily: fonts.semibold, color: colors.text },
  itemNameChecked: { textDecorationLine: 'line-through', color: colors.textLight },
  itemHint: { fontSize: 11, fontFamily: fonts.regular, color: colors.textLight, marginTop: 2 },
  itemHintChecked: { textDecorationLine: 'line-through' },
  itemQuantity: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: colors.primary,
    minWidth: 72,
    textAlign: 'right',
  },
  emptyState: { alignItems: 'center', paddingTop: spacing.xl },
  emptyText: { fontSize: 16, fontFamily: fonts.medium, color: colors.textLight, marginTop: spacing.md },
  generateBtn: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
  },
  generateBtnText: { color: '#fff', fontFamily: fonts.bold, fontSize: 15 },
});
