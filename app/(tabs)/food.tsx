/**
 * Food Logging Screen
 * Track daily nutrition and meals
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  Modal,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/authStore';
import {
  createFoodEntry,
  getFoodEntriesByDate,
  getDailyNutritionSummary,
  deleteFoodEntry,
} from '@/services/food/foodService';
import type { FoodEntry } from '@/types';

const MEAL_TYPES = [
  { value: 'breakfast', label: 'Breakfast', icon: 'sunny' },
  { value: 'lunch', label: 'Lunch', icon: 'partly-sunny' },
  { value: 'dinner', label: 'Dinner', icon: 'moon' },
  { value: 'snack', label: 'Snack', icon: 'fast-food' },
] as const;

export default function FoodScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme || 'light'];
  const { user } = useAuthStore();

  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [servingSize, setServingSize] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [sodium, setSodium] = useState('');
  const [potassium, setPotassium] = useState('');
  const [phosphorus, setPhosphorus] = useState('');
  const [fluid, setFluid] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!user?.id) return;

    try {
      const today = new Date();
      const [foodEntries, nutritionSummary] = await Promise.all([
        getFoodEntriesByDate(user.id, today),
        getDailyNutritionSummary(user.id, today),
      ]);

      setEntries(foodEntries);
      setSummary(nutritionSummary);
    } catch (error) {
      console.error('Load food data error:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const resetForm = () => {
    setName('');
    setMealType('breakfast');
    setServingSize('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
    setSodium('');
    setPotassium('');
    setPhosphorus('');
    setFluid('');
    setNotes('');
  };

  const handleAddFood = async () => {
    if (!user?.id) return;

    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a food name');
      return;
    }

    setLoading(true);
    try {
      await createFoodEntry({
        userId: user.id,
        name: name.trim(),
        mealType,
        servingSize: servingSize.trim() || undefined,
        calories: calories ? parseFloat(calories) : undefined,
        protein: protein ? parseFloat(protein) : undefined,
        carbs: carbs ? parseFloat(carbs) : undefined,
        fat: fat ? parseFloat(fat) : undefined,
        sodium: sodium ? parseFloat(sodium) : undefined,
        potassium: potassium ? parseFloat(potassium) : undefined,
        phosphorus: phosphorus ? parseFloat(phosphorus) : undefined,
        fluid: fluid ? parseFloat(fluid) : undefined,
        notes: notes.trim() || undefined,
      });

      setModalVisible(false);
      resetForm();
      await loadData();
      Alert.alert('Success', 'Food entry added successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to add food entry');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = (entry: FoodEntry) => {
    Alert.alert(
      'Delete Entry',
      `Are you sure you want to delete ${entry.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteFoodEntry(entry.id);
              await loadData();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete entry');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Food Log</Text>
        <Button
          onPress={() => setModalVisible(true)}
          variant="primary"
          size="sm"
          leftIcon="add"
        >
          Add Food
        </Button>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Daily Summary */}
        {summary && (
          <Card style={styles.summaryCard}>
            <Text style={[styles.summaryTitle, { color: colors.text }]}>
              Today's Nutrition
            </Text>
            <View style={styles.summaryGrid}>
              <SummaryItem
                label="Calories"
                value={summary.totalCalories.toFixed(0)}
                unit="kcal"
                color={colors.primary}
              />
              <SummaryItem
                label="Protein"
                value={summary.totalProtein.toFixed(1)}
                unit="g"
                color={colors.success}
              />
              <SummaryItem
                label="Sodium"
                value={summary.totalSodium.toFixed(0)}
                unit="mg"
                color={colors.warning}
              />
              <SummaryItem
                label="Potassium"
                value={summary.totalPotassium.toFixed(0)}
                unit="mg"
                color={colors.error}
              />
            </View>
          </Card>
        )}

        {/* Entries by Meal */}
        {MEAL_TYPES.map((meal) => {
          const mealEntries = entries.filter((e) => e.meal_type === meal.value);
          if (mealEntries.length === 0) return null;

          return (
            <View key={meal.value} style={styles.mealSection}>
              <View style={styles.mealHeader}>
                <Ionicons name={meal.icon as any} size={24} color={colors.primary} />
                <Text style={[styles.mealTitle, { color: colors.text }]}>
                  {meal.label}
                </Text>
              </View>

              {mealEntries.map((entry) => (
                <Card
                  key={entry.id}
                  style={styles.entryCard}
                  onLongPress={() => handleDeleteEntry(entry)}
                >
                  <View style={styles.entryHeader}>
                    <Text style={[styles.entryName, { color: colors.text }]}>
                      {entry.name}
                    </Text>
                    {entry.calories && (
                      <Text style={[styles.entryCalories, { color: colors.primary }]}>
                        {entry.calories} kcal
                      </Text>
                    )}
                  </View>
                  {entry.serving_size && (
                    <Text style={[styles.entryDetail, { color: colors.textSecondary }]}>
                      {entry.serving_size}
                    </Text>
                  )}
                  {(entry.protein || entry.carbs || entry.fat) && (
                    <View style={styles.macros}>
                      {entry.protein && (
                        <Text style={[styles.macro, { color: colors.textSecondary }]}>
                          P: {entry.protein}g
                        </Text>
                      )}
                      {entry.carbs && (
                        <Text style={[styles.macro, { color: colors.textSecondary }]}>
                          C: {entry.carbs}g
                        </Text>
                      )}
                      {entry.fat && (
                        <Text style={[styles.macro, { color: colors.textSecondary }]}>
                          F: {entry.fat}g
                        </Text>
                      )}
                    </View>
                  )}
                </Card>
              ))}
            </View>
          );
        })}

        {entries.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="restaurant-outline" size={64} color={colors.textTertiary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No food entries today
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>
              Tap "Add Food" to log your first meal
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Add Food Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Log Food
            </Text>
            <Button
              onPress={() => setModalVisible(false)}
              variant="ghost"
              size="sm"
              leftIcon="close"
            >
              Cancel
            </Button>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Input
              label="Food Name *"
              placeholder="e.g. Grilled Chicken Breast"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />

            {/* Meal Type Selector */}
            <Text style={[styles.sectionLabel, { color: colors.text }]}>
              Meal Type *
            </Text>
            <View style={styles.mealTypeGrid}>
              {MEAL_TYPES.map((meal) => (
                <Card
                  key={meal.value}
                  onPress={() => setMealType(meal.value)}
                  style={[
                    styles.mealTypeCard,
                    mealType === meal.value && {
                      backgroundColor: colors.primary + '20',
                      borderColor: colors.primary,
                      borderWidth: 2,
                    },
                  ]}
                >
                  <Ionicons
                    name={meal.icon as any}
                    size={28}
                    color={mealType === meal.value ? colors.primary : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.mealTypeLabel,
                      { color: mealType === meal.value ? colors.primary : colors.textSecondary },
                    ]}
                  >
                    {meal.label}
                  </Text>
                </Card>
              ))}
            </View>

            <Input
              label="Serving Size"
              placeholder="e.g. 100g, 1 cup"
              value={servingSize}
              onChangeText={setServingSize}
              style={styles.input}
            />

            <Text style={[styles.sectionLabel, { color: colors.text }]}>
              Nutrition (Optional)
            </Text>

            <View style={styles.row}>
              <Input
                label="Calories"
                placeholder="0"
                value={calories}
                onChangeText={setCalories}
                keyboardType="decimal-pad"
                style={[styles.input, styles.halfInput]}
              />
              <Input
                label="Protein (g)"
                placeholder="0"
                value={protein}
                onChangeText={setProtein}
                keyboardType="decimal-pad"
                style={[styles.input, styles.halfInput]}
              />
            </View>

            <View style={styles.row}>
              <Input
                label="Carbs (g)"
                placeholder="0"
                value={carbs}
                onChangeText={setCarbs}
                keyboardType="decimal-pad"
                style={[styles.input, styles.halfInput]}
              />
              <Input
                label="Fat (g)"
                placeholder="0"
                value={fat}
                onChangeText={setFat}
                keyboardType="decimal-pad"
                style={[styles.input, styles.halfInput]}
              />
            </View>

            <Text style={[styles.sectionLabel, { color: colors.text }]}>
              Kidney-Specific Nutrients (Optional)
            </Text>

            <View style={styles.row}>
              <Input
                label="Sodium (mg)"
                placeholder="0"
                value={sodium}
                onChangeText={setSodium}
                keyboardType="decimal-pad"
                style={[styles.input, styles.halfInput]}
              />
              <Input
                label="Potassium (mg)"
                placeholder="0"
                value={potassium}
                onChangeText={setPotassium}
                keyboardType="decimal-pad"
                style={[styles.input, styles.halfInput]}
              />
            </View>

            <View style={styles.row}>
              <Input
                label="Phosphorus (mg)"
                placeholder="0"
                value={phosphorus}
                onChangeText={setPhosphorus}
                keyboardType="decimal-pad"
                style={[styles.input, styles.halfInput]}
              />
              <Input
                label="Fluid (ml)"
                placeholder="0"
                value={fluid}
                onChangeText={setFluid}
                keyboardType="decimal-pad"
                style={[styles.input, styles.halfInput]}
              />
            </View>

            <Input
              label="Notes"
              placeholder="Any additional notes..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              style={styles.input}
            />

            <Button
              onPress={handleAddFood}
              variant="primary"
              size="lg"
              loading={loading}
              disabled={loading}
              style={styles.submitButton}
            >
              Add Food Entry
            </Button>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

interface SummaryItemProps {
  label: string;
  value: string;
  unit: string;
  color: string;
}

function SummaryItem({ label, value, unit, color }: SummaryItemProps) {
  return (
    <View style={styles.summaryItem}>
      <Text style={[styles.summaryValue, { color }]}>
        {value}
        <Text style={styles.summaryUnit}> {unit}</Text>
      </Text>
      <Text style={[styles.summaryLabel, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  summaryCard: {
    marginBottom: Spacing.lg,
  },
  summaryTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.md,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  summaryItem: {
    flex: 1,
    minWidth: '45%',
  },
  summaryValue: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
  },
  summaryUnit: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  summaryLabel: {
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.xs,
  },
  mealSection: {
    marginBottom: Spacing.lg,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  mealTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    marginLeft: Spacing.sm,
  },
  entryCard: {
    marginBottom: Spacing.sm,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  entryName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    flex: 1,
  },
  entryCalories: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
  },
  entryDetail: {
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.xs,
  },
  macros: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  macro: {
    fontSize: Typography.fontSize.xs,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl * 2,
  },
  emptyText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    marginTop: Spacing.lg,
  },
  emptySubtext: {
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
  },
  modalContent: {
    flex: 1,
    padding: Spacing.lg,
  },
  sectionLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  input: {
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  mealTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  mealTypeCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: Spacing.md,
  },
  mealTypeLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    marginTop: Spacing.xs,
  },
  submitButton: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
});
