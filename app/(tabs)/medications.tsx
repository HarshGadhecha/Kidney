/**
 * Medications Screen
 * Manage medications and reminders
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
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/store/authStore';
import {
  createMedication,
  getMedications,
  deleteMedication,
  logMedicationIntake,
  getMedicationAdherence,
  requestNotificationPermissions,
} from '@/services/medication/medicationService';
import type { Medication } from '@/types';

const FREQUENCIES = [
  'Once daily',
  'Twice daily',
  'Three times daily',
  'Four times daily',
  'Every 12 hours',
  'Every 8 hours',
  'Every 6 hours',
  'As needed',
  'Weekly',
];

export default function MedicationsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme || 'light'];
  const { user } = useAuthStore();

  const [medications, setMedications] = useState<Medication[]>([]);
  const [adherence, setAdherence] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('Once daily');
  const [timeOfDay, setTimeOfDay] = useState('08:00');
  const [instructions, setInstructions] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    loadData();
    checkNotificationPermissions();
  }, []);

  const checkNotificationPermissions = async () => {
    await requestNotificationPermissions();
  };

  const loadData = async () => {
    if (!user?.id) return;

    try {
      const [meds, stats] = await Promise.all([
        getMedications(user.id),
        getMedicationAdherence(user.id, 7),
      ]);

      setMedications(meds);
      setAdherence(stats);
    } catch (error) {
      console.error('Load medications error:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const resetForm = () => {
    setName('');
    setDosage('');
    setFrequency('Once daily');
    setTimeOfDay('08:00');
    setInstructions('');
    setReminderEnabled(true);
  };

  const handleAddMedication = async () => {
    if (!user?.id) return;

    if (!name.trim() || !dosage.trim()) {
      Alert.alert('Error', 'Please enter medication name and dosage');
      return;
    }

    setLoading(true);
    try {
      await createMedication({
        userId: user.id,
        name: name.trim(),
        dosage: dosage.trim(),
        frequency,
        timeOfDay: reminderEnabled ? timeOfDay : undefined,
        instructions: instructions.trim() || undefined,
        reminderEnabled,
      });

      setModalVisible(false);
      resetForm();
      await loadData();
      Alert.alert('Success', 'Medication added successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to add medication');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMedication = (med: Medication) => {
    Alert.alert(
      'Delete Medication',
      `Are you sure you want to delete ${med.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMedication(med.id);
              await loadData();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete medication');
            }
          },
        },
      ]
    );
  };

  const handleTakeMedication = async (med: Medication) => {
    if (!user?.id) return;

    try {
      await logMedicationIntake(med.id, user.id, true);
      Alert.alert('Success', `Logged ${med.name} as taken`);
      await loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to log medication');
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const hours = selectedTime.getHours().toString().padStart(2, '0');
      const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
      setTimeOfDay(`${hours}:${minutes}`);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Medications</Text>
        <Button
          onPress={() => setModalVisible(true)}
          variant="primary"
          size="sm"
          leftIcon="add"
        >
          Add Med
        </Button>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Adherence Stats */}
        {adherence && adherence.totalDoses > 0 && (
          <Card style={styles.adherenceCard}>
            <View style={styles.adherenceHeader}>
              <Text style={[styles.adherenceTitle, { color: colors.text }]}>
                7-Day Adherence
              </Text>
              <Badge
                label={`${adherence.adherenceRate.toFixed(0)}%`}
                variant={adherence.adherenceRate >= 80 ? 'success' : 'warning'}
                size="md"
              />
            </View>
            <View style={styles.adherenceStats}>
              <View style={styles.adherenceStat}>
                <Text style={[styles.adherenceStatValue, { color: colors.success }]}>
                  {adherence.takenDoses}
                </Text>
                <Text style={[styles.adherenceStatLabel, { color: colors.textSecondary }]}>
                  Taken
                </Text>
              </View>
              <View style={styles.adherenceStat}>
                <Text style={[styles.adherenceStatValue, { color: colors.error }]}>
                  {adherence.missedDoses}
                </Text>
                <Text style={[styles.adherenceStatLabel, { color: colors.textSecondary }]}>
                  Missed
                </Text>
              </View>
              <View style={styles.adherenceStat}>
                <Text style={[styles.adherenceStatValue, { color: colors.primary }]}>
                  {adherence.totalDoses}
                </Text>
                <Text style={[styles.adherenceStatLabel, { color: colors.textSecondary }]}>
                  Total
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Medications List */}
        {medications.map((med) => (
          <Card
            key={med.id}
            style={styles.medicationCard}
            onLongPress={() => handleDeleteMedication(med)}
          >
            <View style={styles.medicationHeader}>
              <View style={styles.medicationInfo}>
                <Text style={[styles.medicationName, { color: colors.text }]}>
                  {med.name}
                </Text>
                <Text style={[styles.medicationDosage, { color: colors.textSecondary }]}>
                  {med.dosage} • {med.frequency}
                </Text>
                {med.time_of_day && (
                  <View style={styles.reminderInfo}>
                    <Ionicons name="alarm" size={14} color={colors.primary} />
                    <Text style={[styles.reminderTime, { color: colors.primary }]}>
                      {med.time_of_day}
                    </Text>
                  </View>
                )}
              </View>
              {med.reminder_enabled && (
                <Badge label="Reminder On" variant="info" size="sm" />
              )}
            </View>

            {med.instructions && (
              <Text style={[styles.instructions, { color: colors.textTertiary }]}>
                {med.instructions}
              </Text>
            )}

            <Button
              onPress={() => handleTakeMedication(med)}
              variant="outline"
              size="sm"
              leftIcon="checkmark-circle"
              style={styles.takeButton}
            >
              Mark as Taken
            </Button>
          </Card>
        ))}

        {medications.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="medical-outline" size={64} color={colors.textTertiary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No medications added
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>
              Add your medications and set reminders
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Add Medication Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Add Medication
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
              label="Medication Name *"
              placeholder="e.g. Lisinopril"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />

            <Input
              label="Dosage *"
              placeholder="e.g. 10mg"
              value={dosage}
              onChangeText={setDosage}
              style={styles.input}
            />

            <Text style={[styles.sectionLabel, { color: colors.text }]}>
              Frequency *
            </Text>
            <View style={styles.frequencyGrid}>
              {FREQUENCIES.map((freq) => (
                <Card
                  key={freq}
                  onPress={() => setFrequency(freq)}
                  style={[
                    styles.frequencyCard,
                    frequency === freq && {
                      backgroundColor: colors.primary + '20',
                      borderColor: colors.primary,
                      borderWidth: 2,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.frequencyLabel,
                      { color: frequency === freq ? colors.primary : colors.textSecondary },
                    ]}
                  >
                    {freq}
                  </Text>
                </Card>
              ))}
            </View>

            <View style={styles.reminderSection}>
              <View style={styles.reminderHeader}>
                <Text style={[styles.sectionLabel, { color: colors.text }]}>
                  Enable Reminders
                </Text>
                <Switch
                  value={reminderEnabled}
                  onValueChange={setReminderEnabled}
                  trackColor={{ false: colors.border, true: colors.primary + '50' }}
                  thumbColor={reminderEnabled ? colors.primary : colors.textTertiary}
                />
              </View>

              {reminderEnabled && (
                <>
                  <Text style={[styles.helperText, { color: colors.textSecondary }]}>
                    Set the time(s) you want to be reminded
                  </Text>
                  <Button
                    onPress={() => setShowTimePicker(true)}
                    variant="outline"
                    size="md"
                    leftIcon="time"
                    style={styles.timeButton}
                  >
                    {timeOfDay}
                  </Button>
                  {showTimePicker && (
                    <DateTimePicker
                      value={new Date(`2000-01-01T${timeOfDay}:00`)}
                      mode="time"
                      is24Hour={true}
                      display="default"
                      onChange={handleTimeChange}
                    />
                  )}
                </>
              )}
            </View>

            <Input
              label="Instructions"
              placeholder="e.g. Take with food"
              value={instructions}
              onChangeText={setInstructions}
              multiline
              numberOfLines={2}
              style={styles.input}
            />

            <Button
              onPress={handleAddMedication}
              variant="primary"
              size="lg"
              loading={loading}
              disabled={loading}
              style={styles.submitButton}
            >
              Add Medication
            </Button>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
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
  adherenceCard: {
    marginBottom: Spacing.lg,
  },
  adherenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  adherenceTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  adherenceStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  adherenceStat: {
    alignItems: 'center',
  },
  adherenceStatValue: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
  },
  adherenceStatLabel: {
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.xs,
  },
  medicationCard: {
    marginBottom: Spacing.md,
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.xs,
  },
  medicationDosage: {
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.xs,
  },
  reminderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  reminderTime: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  instructions: {
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.md,
    fontStyle: 'italic',
  },
  takeButton: {
    marginTop: Spacing.sm,
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
  frequencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  frequencyCard: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  frequencyLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  reminderSection: {
    marginBottom: Spacing.lg,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  helperText: {
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.md,
  },
  timeButton: {
    marginBottom: Spacing.md,
  },
  submitButton: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
});
