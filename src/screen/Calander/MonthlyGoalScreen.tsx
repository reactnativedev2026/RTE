import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {useSelector} from 'react-redux';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomArrow from '../../components/CustomArrow';
import CustomScreenWrapper from '../../components/CustomScreenWrapper';
import {RootState} from '../../core/store';
import {goBack} from '../../services/NavigationService';
import {
  useLazyGetYearlyMonthlyGoalQuery,
  useSetMonthlyGoalMutation,
} from '../../services/monthlyGoal.api';
import {colors} from '../../utils/colors';
import {moderateScale} from '../../utils/metrics';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface MonthItem {
  month: number;
  name: string;
  goal: number | null;
  achieved: number | null;
  status: string | null;
  diff: number | null;
}

const now = new Date();
const CURRENT_YEAR = now.getFullYear();
const CURRENT_MONTH = now.getMonth() + 1; // 1-based

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const MonthlyGoalScreen = () => {
  const {user} = useSelector((state: RootState) => state.loginReducer);
  const eventId = user?.preferred_event_id;

  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<MonthItem | null>(null);
  const [goalInput, setGoalInput] = useState('');

  const [fetchYearlyGoal, {data, isFetching}] = useLazyGetYearlyMonthlyGoalQuery();
  const [setMonthlyGoal, {isLoading: isSaving}] = useSetMonthlyGoalMutation();

  useEffect(() => {
    if (eventId) {
      fetchYearlyGoal({event_id: eventId, year: String(selectedYear)});
    }
  }, [selectedYear, eventId]);

  const months: MonthItem[] = data?.data?.months ?? [];

  const onPrevYear = () => setSelectedYear(y => y - 1);
  const onNextYear = () => {
    if (selectedYear < CURRENT_YEAR) {
      setSelectedYear(y => y + 1);
    }
  };

  const openSetGoal = (item: MonthItem) => {
    setSelectedMonth(item);
    setGoalInput(item.goal != null ? String(item.goal) : '');
    setModalVisible(true);
  };

  const saveGoal = async () => {
    const parsed = parseFloat(goalInput);
    if (isNaN(parsed) || parsed < 0) {
      Alert.alert('Invalid goal', 'Please enter a valid number (0 or greater).');
      return;
    }
    if (!selectedMonth || !eventId) {
      return;
    }
    // Format month as Y-m (e.g. "2026-04")
    const monthParam = `${selectedYear}-${String(selectedMonth.month).padStart(2, '0')}`;
    try {
      await setMonthlyGoal({
        event_id: eventId,
        month: monthParam,
        goal: parsed,
      }).unwrap();
      setModalVisible(false);
      setGoalInput('');
    } catch (err: any) {
      Alert.alert('Error', err?.data?.message ?? 'Failed to save goal. Please try again.');
    }
  };

  const isCurrentMonth = (item: MonthItem) =>
    selectedYear === CURRENT_YEAR && item.month === CURRENT_MONTH;

  const isFutureMonth = (item: MonthItem) =>
    selectedYear > CURRENT_YEAR ||
    (selectedYear === CURRENT_YEAR && item.month > CURRENT_MONTH);

  return (
    <CustomScreenWrapper>
      <View style={styles.container}>
        {/* ── Header row ── */}
        <View style={styles.headerRow}>
          <Pressable onPress={goBack} style={styles.backBtn} hitSlop={styles.hitSlop}>
            <CustomArrow
              fill={colors.primaryGrey}
              props={{style: {transform: [{rotate: '180deg'}]}}}
            />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
          <Text style={styles.screenTitle}>Monthly Goals</Text>
          <View style={styles.spacer} />
        </View>

        {/* ── Year switcher ── */}
        <View style={styles.yearSwitcher}>
          <Pressable onPress={onPrevYear} hitSlop={styles.hitSlop}>
            <MaterialCommunityIcons
              name="chevron-left"
              size={moderateScale(24)}
              color={colors.primaryBlue}
            />
          </Pressable>
          <Text style={styles.yearText}>{selectedYear}</Text>
          <Pressable
            onPress={onNextYear}
            hitSlop={styles.hitSlop}
            disabled={selectedYear >= CURRENT_YEAR}>
            <MaterialCommunityIcons
              name="chevron-right"
              size={moderateScale(24)}
              color={selectedYear >= CURRENT_YEAR ? colors.lightGrey : colors.primaryBlue}
            />
          </Pressable>
        </View>

        {/* ── Table header ── */}
        <View style={styles.tableHeader}>
          <Text style={[styles.colMonth, styles.headerCell]}>Month</Text>
          <Text style={[styles.colGoal,  styles.headerCell]}>Goal</Text>
          <Text style={[styles.colDone,  styles.headerCell]}>Completed</Text>
          <Text style={[styles.colStatus,styles.headerCell]}>Status</Text>
          <View style={styles.colEdit} />
        </View>

        {/* ── Content ── */}
        {isFetching ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={colors.primaryBlue} />
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled">
            {months.map(item => {
              const hasGoal = item.goal != null;
              const future  = isFutureMonth(item);
              const current = isCurrentMonth(item);
              const showDone = hasGoal && !future && item.achieved != null;
              const achieved = item.achieved ?? 0;
              const goal     = item.goal ?? 0;
              const isAhead  = item.status === 'ahead';
              const diff     = item.diff != null ? item.diff.toFixed(2) : '0.00';

              return (
                <View
                  key={item.month}
                  style={[
                    styles.monthRow,
                    current && styles.currentRow,
                    future && !hasGoal && styles.futureRow,
                  ]}>
                  {/* Col 1 – Month name */}
                  <View style={[styles.colMonth, styles.monthCell]}>
                    {current && <View style={styles.activeDot} />}
                    <Text
                      style={[styles.monthName, current && styles.currentMonthText]}
                      numberOfLines={1}>
                      {item.name}
                    </Text>
                  </View>

                  {/* Col 2 – Goal */}
                  <View style={styles.colGoal}>
                    {hasGoal ? (
                      <Text style={styles.dataText}>
                        {goal}
                        <Text style={styles.unit}> mi</Text>
                      </Text>
                    ) : (
                      <Pressable
                        onPress={() => openSetGoal(item)}
                        hitSlop={styles.hitSlop}>
                        <Text style={styles.setLink}>+ Set</Text>
                      </Pressable>
                    )}
                  </View>

                  {/* Col 3 – Done */}
                  <View style={styles.colDone}>
                    {showDone ? (
                      <Text
                        style={[
                          styles.dataText,
                          isAhead ? styles.aheadText : styles.behindText,
                        ]}>
                        {achieved.toFixed(2)}
                        <Text style={styles.unit}> mi</Text>
                      </Text>
                    ) : (
                      <Text style={styles.dimText}>
                        {future && hasGoal ? 'pending' : '—'}
                      </Text>
                    )}
                  </View>

                  {/* Col 4 – Status */}
                  <View style={[styles.colStatus, styles.statusCell]}>
                    {showDone && item.status ? (
                      <>
                        <MaterialCommunityIcons
                          name={isAhead ? 'arrow-up' : 'arrow-down'}
                          size={moderateScale(11)}
                          color={isAhead ? colors.green : colors.primaryRed}
                        />
                        <Text
                          style={[
                            styles.diffText,
                            isAhead ? styles.aheadText : styles.behindText,
                          ]}>
                          {diff}
                        </Text>
                      </>
                    ) : (
                      <Text style={styles.dimText}>—</Text>
                    )}
                  </View>

                  {/* Col 5 – Edit icon */}
                  <Pressable
                    style={styles.colEdit}
                    onPress={() => openSetGoal(item)}
                    hitSlop={styles.hitSlop}>
                    <MaterialCommunityIcons
                      name={hasGoal ? 'pencil-outline' : 'plus-circle-outline'}
                      size={moderateScale(16)}
                      color={hasGoal ? colors.primaryBlue : colors.lightGrey}
                    />
                  </Pressable>
                </View>
              );
            })}
            <View style={styles.bottomPad} />
          </ScrollView>
        )}
      </View>

      {/* ── Set / Edit Goal Modal ── */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setModalVisible(false)}
          />
          <View style={styles.modalCard}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>
              {selectedMonth?.name} {selectedYear}
            </Text>
            <Text style={styles.modalSubtitle}>Enter your mileage goal</Text>

            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons
                name="flag-outline"
                size={moderateScale(20)}
                color={colors.primaryBlue}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={goalInput}
                onChangeText={setGoalInput}
                keyboardType="numeric"
                placeholder="e.g. 50"
                placeholderTextColor={colors.lightGrey}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={saveGoal}
              />
              <Text style={styles.inputUnit}>mi</Text>
            </View>

            <View style={styles.modalBtnRow}>
              <Pressable
                onPress={() => setModalVisible(false)}
                style={[styles.modalBtn, styles.cancelBtn]}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={saveGoal}
                disabled={isSaving}
                style={[styles.modalBtn, styles.saveBtn, isSaving && styles.saveBtnDisabled]}>
                {isSaving ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={styles.saveBtnText}>Save Goal</Text>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </CustomScreenWrapper>
  );
};

export default MonthlyGoalScreen;

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: moderateScale(25),
    borderTopRightRadius: moderateScale(25),
    marginHorizontal: moderateScale(10),
    paddingTop: moderateScale(50),
    paddingHorizontal: moderateScale(14),
  },
  hitSlop: {top: 8, bottom: 8, left: 8, right: 8},

  // ── Header ────────────────────────────────────────────────────────────────
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: moderateScale(12),
  },
  backBtn: {flexDirection: 'row', alignItems: 'center'},
  backText: {
    color: colors.lightGrey,
    fontSize: moderateScale(12),
    fontWeight: '700',
    marginLeft: moderateScale(4),
  },
  screenTitle: {
    fontSize: moderateScale(15),
    fontWeight: '800',
    color: colors.headerBlack,
  },
  spacer: {width: moderateScale(44)},

  // ── Year switcher ─────────────────────────────────────────────────────────
  yearSwitcher: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lightGray,
    borderRadius: moderateScale(20),
    alignSelf: 'center',
    paddingHorizontal: moderateScale(6),
    paddingVertical: moderateScale(3),
    marginBottom: moderateScale(14),
  },
  yearText: {
    fontSize: moderateScale(15),
    fontWeight: '700',
    color: colors.headerBlack,
    marginHorizontal: moderateScale(16),
    minWidth: moderateScale(46),
    textAlign: 'center',
  },

  // ── Table header ──────────────────────────────────────────────────────────
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScale(5),
    borderBottomWidth: 1,
    borderBottomColor: colors.gray,
    marginBottom: moderateScale(4),
  },
  headerCell: {
    fontSize: moderateScale(10),
    fontWeight: '600',
    color: colors.primaryGrey,
  },

  // ── Column widths (shared by header + rows) ───────────────────────────────
  colMonth:  {flex: 2.4},
  colGoal:   {flex: 1.6},
  colDone:   {flex: 2.4},
  colStatus: {flex: 1.6},
  colEdit:   {width: moderateScale(26), alignItems: 'center'},

  // ── Loader ────────────────────────────────────────────────────────────────
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Scroll ────────────────────────────────────────────────────────────────
  scrollContent: {paddingBottom: moderateScale(20)},

  // ── Month row ─────────────────────────────────────────────────────────────
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScale(8),
    marginBottom: moderateScale(3),
    borderRadius: moderateScale(10),
    borderWidth: 1,
    borderColor: colors.gray,
    backgroundColor: colors.white,
  },
  currentRow: {
    borderColor: colors.primaryBlue,
    borderLeftWidth: moderateScale(3),
    backgroundColor: 'rgba(0, 174, 239, 0.04)',
  },
  futureRow: {
    borderColor: colors.lightGray,
    backgroundColor: colors.lightGray,
  },

  // ── Month cell ────────────────────────────────────────────────────────────
  monthCell: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeDot: {
    width: moderateScale(6),
    height: moderateScale(6),
    borderRadius: moderateScale(3),
    backgroundColor: colors.primaryBlue,
    marginRight: moderateScale(5),
  },
  monthName: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    color: colors.headerBlack,
  },
  currentMonthText: {
    color: colors.primaryBlue,
    fontWeight: '700',
  },

  // ── Data cells ────────────────────────────────────────────────────────────
  dataText: {
    fontSize: moderateScale(13),
    fontWeight: '700',
    color: colors.headerBlack,
  },
  unit: {
    fontSize: moderateScale(10),
    fontWeight: '400',
    color: colors.primaryGrey,
  },
  dimText: {
    fontSize: moderateScale(12),
    color: colors.lightGrey,
  },
  aheadText:  {color: colors.green},
  behindText: {color: colors.primaryRed},
  setLink: {
    fontSize: moderateScale(12),
    fontWeight: '700',
    color: colors.primaryBlue,
  },

  // ── Status cell ───────────────────────────────────────────────────────────
  statusCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(2),
  },
  diffText: {
    fontSize: moderateScale(11),
    fontWeight: '700',
  },

  bottomPad: {height: moderateScale(20)},

  // ── Modal ─────────────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: moderateScale(24),
    borderTopRightRadius: moderateScale(24),
    paddingHorizontal: moderateScale(20),
    paddingTop: moderateScale(14),
    paddingBottom: Platform.OS === 'ios' ? moderateScale(36) : moderateScale(24),
  },
  modalHandle: {
    width: moderateScale(40),
    height: moderateScale(4),
    backgroundColor: colors.gray,
    borderRadius: moderateScale(10),
    alignSelf: 'center',
    marginBottom: moderateScale(16),
  },
  modalTitle: {
    fontSize: moderateScale(17),
    fontWeight: '800',
    color: colors.headerBlack,
    textAlign: 'center',
    marginBottom: moderateScale(4),
  },
  modalSubtitle: {
    fontSize: moderateScale(12),
    color: colors.primaryGrey,
    textAlign: 'center',
    marginBottom: moderateScale(18),
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.primaryBlue,
    borderRadius: moderateScale(12),
    paddingHorizontal: moderateScale(12),
    marginBottom: moderateScale(18),
    backgroundColor: colors.lightGray,
  },
  inputIcon: {marginRight: moderateScale(8)},
  input: {
    flex: 1,
    fontSize: moderateScale(22),
    fontWeight: '700',
    color: colors.headerBlack,
    paddingVertical: moderateScale(10),
  },
  inputUnit: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: colors.primaryGrey,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: moderateScale(10),
  },
  modalBtn: {
    flex: 1,
    borderRadius: moderateScale(12),
    paddingVertical: moderateScale(12),
    alignItems: 'center',
  },
  cancelBtn: {backgroundColor: colors.lightGray},
  cancelBtnText: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: colors.primaryGrey,
  },
  saveBtn: {backgroundColor: colors.primaryBlue},
  saveBtnDisabled: {opacity: 0.6},
  saveBtnText: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: colors.white,
  },
});
