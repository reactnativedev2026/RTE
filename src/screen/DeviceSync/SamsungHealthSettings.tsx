import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, {G, Path, Defs, ClipPath, Rect} from 'react-native-svg';
import {
  CustomAlert,
  CustomHeader,
  CustomScreenWrapper,
} from '../../components';
import {colors} from '../../utils/colors';
import {moderateScale} from '../../utils/metrics';
import {store} from '../../core/store';
import {getTemplateSpecs} from '../../utils/helpers';
import {
  SYNC_FREQUENCY_KEY,
  SYNC_START_DATE_KEY,
  LAST_SYNC_DATE_KEY,
  SYNCED_TRANSACTION_IDS_KEY,
  SamsungHealthBackgroundSync,
} from '../../services/SamsungHealthBackgroundSync';
interface SamsungHealthSettingsProps {}

interface SyncDebugInfo {
  syncFrequency: string;
  syncStartDate: string;
  lastSyncDate: string;
  syncedCount: number;
}

// AboutIcon SVG Component
const AboutIcon = ({size = 16, color = '#CCCCCC'}: {size?: number; color?: string}) => (
  <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <G clipPath="url(#clip0_959_10403)">
      <Path
        d="M16 8C16 10.1217 15.1571 12.1566 13.6569 13.6569C12.1566 15.1571 10.1217 16 8 16C5.87827 16 3.84344 15.1571 2.34315 13.6569C0.842855 12.1566 0 10.1217 0 8C0 5.87827 0.842855 3.84344 2.34315 2.34315C3.84344 0.842855 5.87827 0 8 0C10.1217 0 12.1566 0.842855 13.6569 2.34315C15.1571 3.84344 16 5.87827 16 8ZM5.496 6.033H6.321C6.459 6.033 6.569 5.92 6.587 5.783C6.677 5.127 7.127 4.649 7.929 4.649C8.615 4.649 9.243 4.992 9.243 5.817C9.243 6.452 8.869 6.744 8.278 7.188C7.605 7.677 7.072 8.248 7.11 9.175L7.113 9.392C7.11405 9.45761 7.14085 9.52017 7.18762 9.5662C7.23439 9.61222 7.29738 9.63801 7.363 9.638H8.174C8.2403 9.638 8.30389 9.61166 8.35078 9.56478C8.39766 9.51789 8.424 9.4543 8.424 9.388V9.283C8.424 8.565 8.697 8.356 9.434 7.797C10.043 7.334 10.678 6.82 10.678 5.741C10.678 4.23 9.402 3.5 8.005 3.5C6.738 3.5 5.35 4.09 5.255 5.786C5.25363 5.81829 5.25888 5.85053 5.27043 5.88072C5.28198 5.91091 5.29958 5.93841 5.32216 5.96155C5.34473 5.98468 5.3718 6.00296 5.40169 6.01524C5.43159 6.02753 5.46368 6.03357 5.496 6.033ZM7.821 12.476C8.431 12.476 8.85 12.082 8.85 11.549C8.85 10.997 8.43 10.609 7.821 10.609C7.237 10.609 6.812 10.997 6.812 11.549C6.812 12.082 7.236 12.476 7.821 12.476Z"
        fill={color}
      />
    </G>
    <Defs>
      <ClipPath id="clip0_959_10403">
        <Rect width="16" height="16" fill="white" />
      </ClipPath>
    </Defs>
  </Svg>
);

const SamsungHealthSettings = ({}: SamsungHealthSettingsProps) => {
  const [syncMinutes, setSyncMinutes] = useState<string>('10');
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [debugInfo, setDebugInfo] = useState<SyncDebugInfo>({
    syncFrequency: 'Not set',
    syncStartDate: 'Not set',
    lastSyncDate: 'Never',
    syncedCount: 0,
  });
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  const PrimaryColor = getTemplateSpecs(
    store.getState().loginReducer.eventDetail?.template,
  ).btnPrimaryColor;

  useEffect(() => {
    loadSyncFrequency();
    loadDebugInfo();
  }, []);

  const loadSyncFrequency = async () => {
    try {
      const savedFrequency = await AsyncStorage.getItem(SYNC_FREQUENCY_KEY);
      if (savedFrequency !== null) {
        const frequencyInSeconds = parseInt(savedFrequency, 10);
        const frequencyInMinutes = Math.max(1, Math.floor(frequencyInSeconds / 60));
        setSyncMinutes(frequencyInMinutes.toString());
      }
    } catch (error) {
      // Silent error
    }
  };

  const loadDebugInfo = async () => {
    try {
      // Load from AsyncStorage
      const [frequency, startDate, lastSync, syncedIds] = await Promise.all([
        AsyncStorage.getItem(SYNC_FREQUENCY_KEY),
        AsyncStorage.getItem(SYNC_START_DATE_KEY),
        AsyncStorage.getItem(LAST_SYNC_DATE_KEY),
        AsyncStorage.getItem(SYNCED_TRANSACTION_IDS_KEY),
      ]);

      // Parse synced transaction IDs count
      let syncedCount = 0;
      if (syncedIds) {
        try {
          const ids = JSON.parse(syncedIds);
          syncedCount = Array.isArray(ids) ? ids.length : 0;
        } catch (e) {
          // Silent error
        }
      }

      // Format dates for display
      const formatDate = (dateStr: string | null) => {
        if (!dateStr) return 'Not set';
        try {
          return new Date(dateStr).toLocaleString();
        } catch {
          return dateStr;
        }
      };

      setDebugInfo({
        syncFrequency: frequency
          ? `${parseInt(frequency, 10)} seconds (${Math.floor(parseInt(frequency, 10) / 60)} min)`
          : 'Not set',
        syncStartDate: formatDate(startDate),
        lastSyncDate: lastSync ? formatDate(lastSync) : 'Never',
        syncedCount,
      });
    } catch (error) {
      // Silent error
    }
  };

  const handleSave = async () => {
    const minutes = parseInt(syncMinutes, 10);

    // Validation
    if (isNaN(minutes) || minutes < 1) {
      CustomAlert({
        type: 'error',
        message: 'Please enter a valid number (minimum 1 minute)',
      });
      return;
    }

    try {
      // Convert minutes to seconds for storage
      const frequencyInSeconds = minutes * 60;
      await AsyncStorage.setItem(
        SYNC_FREQUENCY_KEY,
        frequencyInSeconds.toString(),
      );

      // Update background sync service with new frequency
      await SamsungHealthBackgroundSync.updateSyncFrequency(frequencyInSeconds);

      // Reload debug info
      await loadDebugInfo();

      CustomAlert({
        type: 'success',
        message: `Sync frequency set to ${minutes} minute(s)`,
      });
    } catch (error) {
      CustomAlert({
        type: 'error',
        message: 'Failed to save settings. Please try again.',
      });
    }
  };

  return (
    <CustomScreenWrapper removeScroll={false}>
      <View style={styles.container}>
        <CustomHeader hideEditBtn={true} />
        <Text style={styles.headerText}>Samsung Health Settings</Text>

        <View style={styles.content}>
          <View style={styles.fieldContainer}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Sync Frequency</Text>
              <TouchableOpacity
                style={styles.infoButton}
                onPress={() => setShowInfoModal(true)}>
                <AboutIcon size={moderateScale(14)} color={colors.primaryGrey} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={syncMinutes}
                onChangeText={setSyncMinutes}
                keyboardType="number-pad"
                placeholder="10"
                placeholderTextColor={colors.grey}
              />
              <Text style={styles.unitText}>minute(s)</Text>
            </View>

            <Text style={styles.helperText}>Minimum: 1 minute</Text>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, {backgroundColor: PrimaryColor}]}
            onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Settings</Text>
          </TouchableOpacity>

          {/* Debug Info Section */}
          <View style={styles.debugSection}>
            <TouchableOpacity
              style={styles.debugHeader}
              onPress={() => setShowDebugInfo(!showDebugInfo)}>
              <Text style={styles.debugHeaderText}>
                Sync Status & Debug Info
              </Text>
              <Text style={styles.debugToggle}>
                {showDebugInfo ? '▼' : '▶'}
              </Text>
            </TouchableOpacity>

            {showDebugInfo && (
              <View style={styles.debugContent}>
                <View style={styles.debugItem}>
                  <Text style={styles.debugLabel}>Sync Frequency:</Text>
                  <Text style={styles.debugValue}>{debugInfo.syncFrequency}</Text>
                </View>

                <View style={styles.debugItem}>
                  <Text style={styles.debugLabel}>Sync Start Date:</Text>
                  <Text style={styles.debugValue}>{debugInfo.syncStartDate}</Text>
                </View>

                <View style={styles.debugItem}>
                  <Text style={styles.debugLabel}>Last Sync:</Text>
                  <Text style={styles.debugValue}>{debugInfo.lastSyncDate}</Text>
                </View>

                <View style={styles.debugItem}>
                  <Text style={styles.debugLabel}>Synced Exercises:</Text>
                  <Text style={styles.debugValue}>{debugInfo.syncedCount}</Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.refreshButton,
                    {backgroundColor: PrimaryColor},
                  ]}
                  onPress={loadDebugInfo}>
                  <Text style={styles.refreshButtonText}>Refresh Info</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Info Modal */}
        <Modal
          visible={showInfoModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowInfoModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Sync Frequency Info</Text>
              <Text style={styles.modalText}>
                This setting controls how often the app automatically refreshes
                your Samsung Health exercise data in the background.
                {'\n\n'}
                • Lower values = More frequent updates{'\n'}
                • Higher values = Less battery consumption{'\n'}
                • Minimum allowed: 1 minute{'\n'}
                • Default: 10 minutes{'\n\n'}
                The auto-refresh will continue even when the app is minimized.
              </Text>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  {backgroundColor: PrimaryColor},
                ]}
                onPress={() => setShowInfoModal(false)}>
                <Text style={styles.modalButtonText}>Got it</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </CustomScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    paddingTop: moderateScale(20),
    marginHorizontal: moderateScale(10),
    borderRadius: moderateScale(25),
    paddingHorizontal: moderateScale(15),
    paddingBottom: moderateScale(30),
    marginBottom: moderateScale(20),
    flex: 1,
  },
  headerText: {
    fontSize: moderateScale(16),
    fontWeight: '800',
    color: colors.primaryGrey,
    textAlign: 'center',
    marginTop: moderateScale(10),
    marginBottom: moderateScale(30),
  },
  content: {
    flex: 1,
  },
  fieldContainer: {
    marginBottom: moderateScale(30),
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: moderateScale(12),
  },
  label: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: colors.primaryGrey,
  },
  infoButton: {
    marginLeft: moderateScale(7),
    width: moderateScale(14),
    height: moderateScale(14),
    marginTop: moderateScale(4),
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.lightGrey,
    borderRadius: moderateScale(12),
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(12),
    backgroundColor: colors.white,
  },
  input: {
    flex: 1,
    fontSize: moderateScale(16),
    color: colors.primaryGrey,
    fontWeight: '600',
    padding: 0,
  },
  unitText: {
    fontSize: moderateScale(14),
    color: colors.primaryGrey,
    marginLeft: moderateScale(10),
  },
  helperText: {
    fontSize: moderateScale(11),
    color: colors.primaryGrey,
    marginTop: moderateScale(8),
    marginLeft: moderateScale(4),
  },
  saveButton: {
    paddingVertical: moderateScale(14),
    borderRadius: moderateScale(25),
    alignItems: 'center',
    marginTop: moderateScale(20),
  },
  saveButtonText: {
    color: colors.white,
    fontSize: moderateScale(15),
    fontWeight: '700',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: moderateScale(20),
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: moderateScale(20),
    padding: moderateScale(24),
    width: '100%',
    maxWidth: moderateScale(400),
  },
  modalTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: colors.primaryGrey,
    marginBottom: moderateScale(16),
    textAlign: 'center',
  },
  modalText: {
    fontSize: moderateScale(13),
    color: colors.primaryGrey,
    lineHeight: moderateScale(20),
    marginBottom: moderateScale(20),
  },
  modalButton: {
    paddingVertical: moderateScale(12),
    borderRadius: moderateScale(25),
    alignItems: 'center',
  },
  modalButtonText: {
    color: colors.white,
    fontSize: moderateScale(14),
    fontWeight: '700',
  },
  // Debug section styles
  debugSection: {
    marginTop: moderateScale(30),
    borderTopWidth: 1,
    borderTopColor: colors.lightGrey,
    paddingTop: moderateScale(20),
  },
  debugHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: moderateScale(10),
    backgroundColor: colors.lightGrey + '30',
    paddingHorizontal: moderateScale(15),
    borderRadius: moderateScale(8),
  },
  debugHeaderText: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: colors.primaryGrey,
  },
  debugToggle: {
    fontSize: moderateScale(12),
    color: colors.primaryGrey,
  },
  debugContent: {
    marginTop: moderateScale(15),
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGrey,
    borderRadius: moderateScale(8),
    padding: moderateScale(15),
  },
  debugItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: moderateScale(8),
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGrey + '50',
  },
  debugLabel: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: colors.primaryGrey,
    flex: 1,
  },
  debugValue: {
    fontSize: moderateScale(12),
    color: colors.primaryGrey,
    flex: 1,
    textAlign: 'right',
  },
  debugDivider: {
    height: 1,
    backgroundColor: colors.lightGrey,
    marginVertical: moderateScale(12),
  },
  debugSectionTitle: {
    fontSize: moderateScale(13),
    fontWeight: '700',
    color: colors.primaryGrey,
    marginBottom: moderateScale(8),
  },
  refreshButton: {
    paddingVertical: moderateScale(10),
    borderRadius: moderateScale(20),
    alignItems: 'center',
    marginTop: moderateScale(15),
  },
  refreshButtonText: {
    color: colors.white,
    fontSize: moderateScale(13),
    fontWeight: '700',
  },
});

export default SamsungHealthSettings;
