/**
 * Vitals Tracking Screen
 * Log and view vital signs
 */

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { format } from 'date-fns';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { createVitalRecord } from '@/services/vitals/vitalsService';
import { VitalRecord } from '@/types';

export default function VitalsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme || 'light'];
  const { user } = useAuthStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [weight, setWeight] = useState('');
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [oxygen, setOxygen] = useState('');
  const [fluidIntake, setFluidIntake] = useState('');
  const [urineOutput, setUrineOutput] = useState('');
  const [temperature, setTemperature] = useState('');
  const [notes, setNotes] = useState('');

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const vitalData: Partial<VitalRecord> = {
        date: format(new Date(), 'yyyy-MM-dd'),
        weight: weight ? parseFloat(weight) : undefined,
        systolic: systolic ? parseInt(systolic) : undefined,
        diastolic: diastolic ? parseInt(diastolic) : undefined,
        heartRate: heartRate ? parseInt(heartRate) : undefined,
        oxygenSaturation: oxygen ? parseFloat(oxygen) : undefined,
        fluidIntake: fluidIntake ? parseFloat(fluidIntake) : undefined,
        urineOutput: urineOutput ? parseFloat(urineOutput) : undefined,
        temperature: temperature ? parseFloat(temperature) : undefined,
        notes,
      };

      await createVitalRecord(user.id, vitalData);

      // Reset form
      setWeight('');
      setSystolic('');
      setDiastolic('');
      setHeartRate('');
      setOxygen('');
      setFluidIntake('');
      setUrineOutput('');
      setTemperature('');
      setNotes('');

      setModalVisible(false);
    } catch (error) {
      console.error('Error saving vitals:', error);
    } finally {
      setLoading(false);
    }
  };

  const vitalCards = [
    {
      title: 'Weight',
      value: '--',
      unit: 'kg',
      icon: '–',
      color: colors.vitals.weight,
    },
    {
      title: 'Blood Pressure',
      value: '--/--',
      unit: 'mmHg',
      icon: '=—',
      color: colors.vitals.bp,
    },
    {
      title: 'Oxygen',
      value: '--',
      unit: '%',
      icon: '>Á',
      color: colors.vitals.oxygen,
    },
    {
      title: 'Fluid Balance',
      value: '--',
      unit: 'ml',
      icon: '=§',
      color: colors.vitals.fluid,
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Vitals</Text>
        <Button title="+ Log Vitals" onPress={() => setModalVisible(true)} size="sm" gradient />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Quick Stats */}
        <Animated.View entering={FadeInDown.delay(100)}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Today</Text>
          <View style={styles.statsGrid}>
            {vitalCards.map((card, index) => (
              <Animated.View key={card.title} entering={FadeInDown.delay(200 + index * 50)}>
                <Card style={styles.statCard} padding="md">
                  <Text style={styles.statIcon}>{card.icon}</Text>
                  <Text style={[styles.statValue, { color: colors.text }]}>{card.value}</Text>
                  <Text style={[styles.statUnit, { color: colors.textSecondary }]}>{card.unit}</Text>
                  <Text style={[styles.statTitle, { color: colors.textTertiary }]}>{card.title}</Text>
                </Card>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* History */}
        <Animated.View entering={FadeInDown.delay(500)}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>History</Text>
          <Card>
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>=Ê</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No vitals recorded yet
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>
                Start tracking your daily vitals
              </Text>
            </View>
          </Card>
        </Animated.View>
      </ScrollView>

      {/* Add Vitals Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Log Vitals</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={[styles.closeButton, { color: colors.primary }]}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Input
              label="Weight (kg)"
              value={weight}
              onChangeText={setWeight}
              keyboardType="decimal-pad"
              placeholder="70.5"
            />

            <View style={styles.row}>
              <Input
                label="Systolic (mmHg)"
                value={systolic}
                onChangeText={setSystolic}
                keyboardType="number-pad"
                placeholder="120"
                containerStyle={styles.halfInput}
              />
              <Input
                label="Diastolic (mmHg)"
                value={diastolic}
                onChangeText={setDiastolic}
                keyboardType="number-pad"
                placeholder="80"
                containerStyle={styles.halfInput}
              />
            </View>

            <View style={styles.row}>
              <Input
                label="Heart Rate (bpm)"
                value={heartRate}
                onChangeText={setHeartRate}
                keyboardType="number-pad"
                placeholder="72"
                containerStyle={styles.halfInput}
              />
              <Input
                label="Oxygen Sat (%)"
                value={oxygen}
                onChangeText={setOxygen}
                keyboardType="decimal-pad"
                placeholder="98"
                containerStyle={styles.halfInput}
              />
            </View>

            <View style={styles.row}>
              <Input
                label="Fluid Intake (ml)"
                value={fluidIntake}
                onChangeText={setFluidIntake}
                keyboardType="number-pad"
                placeholder="1500"
                containerStyle={styles.halfInput}
              />
              <Input
                label="Urine Output (ml)"
                value={urineOutput}
                onChangeText={setUrineOutput}
                keyboardType="number-pad"
                placeholder="1200"
                containerStyle={styles.halfInput}
              />
            </View>

            <Input
              label="Temperature (°C)"
              value={temperature}
              onChangeText={setTemperature}
              keyboardType="decimal-pad"
              placeholder="36.8"
            />

            <Input
              label="Notes (Optional)"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              placeholder="Add any additional notes..."
            />

            <Button
              title="Save Vitals"
              onPress={handleSave}
              loading={loading}
              fullWidth
              gradient
              style={styles.saveButton}
            />
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
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statCard: {
    width: 160,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  statValue: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
  },
  statUnit: {
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.xs,
  },
  statTitle: {
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.xs,
  },
  emptySubtext: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
  },
  modal: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  modalTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
  },
  closeButton: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  modalContent: {
    flex: 1,
    padding: Spacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  saveButton: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
});
