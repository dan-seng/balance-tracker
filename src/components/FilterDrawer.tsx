import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View, ScrollView } from 'react-native';
import { AppText as Text } from './AppText';;

type FilterDrawerProps = {
  visible: boolean;
  onClose: () => void;
  banks: string[];
  selectedBanks: string[];
  onBankToggle: (bank: string) => void;
  dateRange: { start: Date | null; end: Date | null };
  onDateRangeChange: (range: { start: Date | null; end: Date | null }) => void;
};

export function FilterDrawer({
  visible,
  onClose,
  banks,
  selectedBanks,
  onBankToggle,
  dateRange,
  onDateRangeChange,
}: FilterDrawerProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.drawer} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.title}>Filter Transactions</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Text style={styles.close}>✕</Text>
            </Pressable>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Banks</Text>
            <ScrollView style={styles.bankList}>
              {banks.map((bank) => (
                <Pressable
                  key={bank}
                  style={[
                    styles.bankItem,
                    selectedBanks.includes(bank) && styles.bankItemSelected,
                  ]}
                  onPress={() => onBankToggle(bank)}
                >
                  <Text
                    style={[
                      styles.bankText,
                      selectedBanks.includes(bank) && styles.bankTextSelected,
                    ]}
                  >
                    {bank}
                  </Text>
                  {selectedBanks.includes(bank) && (
                    <Text style={styles.check}>✓</Text>
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Date Range</Text>
            <View style={styles.dateButtons}>
              <Pressable
                style={styles.dateButton}
                onPress={() => onDateRangeChange({ start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), end: new Date() })}
              >
                <Text style={styles.dateButtonText}>Last 7 days</Text>
              </Pressable>
              <Pressable
                style={styles.dateButton}
                onPress={() => onDateRangeChange({ start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), end: new Date() })}
              >
                <Text style={styles.dateButtonText}>Last 30 days</Text>
              </Pressable>
              <Pressable
                style={styles.dateButton}
                onPress={() => onDateRangeChange({ start: null, end: null })}
              >
                <Text style={styles.dateButtonText}>All time</Text>
              </Pressable>
            </View>
          </View>

          <Pressable style={styles.resetButton} onPress={() => {
            banks.forEach(bank => {
              if (selectedBanks.includes(bank)) {
                onBankToggle(bank);
              }
            });
            onDateRangeChange({ start: null, end: null });
          }}>
            <Text style={styles.resetButtonText}>Reset Filters</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  drawer: {
    backgroundColor: '#122019',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    color: '#F5F7F1',
    fontSize: 20,
    fontWeight: '800',
  },
  close: {
    color: '#8AA094',
    fontSize: 24,
    fontWeight: '800',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#8AA094',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  bankList: {
    maxHeight: 150,
  },
  bankItem: {
    backgroundColor: '#1A2A23',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
  },
  bankItemSelected: {
    backgroundColor: '#1d674266',
  },
  bankText: {
    color: '#F5F7F1',
    fontSize: 14,
    fontWeight: '600',
  },
  bankTextSelected: {
    color: '#6BDB93',
  },
  check: {
    color: '#6BDB93',
    fontSize: 16,
    fontWeight: '800',
  },
  dateButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  dateButton: {
    backgroundColor: '#1A2A23',
    borderRadius: 8,
    flex: 1,
    padding: 12,
    alignItems: 'center',
  },
  dateButtonText: {
    color: '#F5F7F1',
    fontSize: 12,
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: '#1A2A23',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#FFB38A',
    fontSize: 14,
    fontWeight: '700',
  },
});
