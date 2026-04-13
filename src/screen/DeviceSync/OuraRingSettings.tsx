import React, {useState, useEffect, useCallback} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import Svg, {G, Path, Defs, ClipPath, Rect} from 'react-native-svg';
import {useFocusEffect} from '@react-navigation/native';
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
  useLazyGetOuraRingSettingsQuery,
  useUpdateOuraRingSettingsMutation,
} from '../../services/setting.api';

// Default value: 2000 steps = 1 mile
export const DEFAULT_STEPS_PER_MILE = 2000;

interface OuraRingSettingsProps {}

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

const OuraRingSettings = ({}: OuraRingSettingsProps) => {
  const [stepsPerMile, setStepsPerMile] = useState<string>(DEFAULT_STEPS_PER_MILE.toString());
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // API hooks - using lazy query to avoid caching
  const [getOuraRingSettings, {data: settingsData, isLoading: isLoadingSettings, isFetching}] = useLazyGetOuraRingSettingsQuery();
  const [updateOuraRingSettings, {isLoading: isUpdating}] = useUpdateOuraRingSettingsMutation();

  const PrimaryColor = getTemplateSpecs(
    store.getState().loginReducer.eventDetail?.template,
  ).btnPrimaryColor;

  // Fetch settings function
  const fetchSettings = useCallback(async () => {
    try {
      const result = await getOuraRingSettings({}).unwrap();
      if (result?.data?.device_settings?.steps_to_miles) {
        setStepsPerMile(result.data.device_settings.steps_to_miles.toString());
      }
    } catch (error) {
      // Silent error - use default value
    }
  }, [getOuraRingSettings]);

  // Refresh on screen focus
  useFocusEffect(
    useCallback(() => {
      fetchSettings();
    }, [fetchSettings])
  );

  // Load settings from API response
  useEffect(() => {
    if (settingsData?.data?.device_settings?.steps_to_miles) {
      setStepsPerMile(settingsData.data.device_settings.steps_to_miles.toString());
    }
  }, [settingsData]);

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchSettings();
    setIsRefreshing(false);
  }, [fetchSettings]);

  const handleSave = async () => {
    const steps = parseInt(stepsPerMile, 10);

    // Validation
    if (isNaN(steps) || steps < 500 || steps > 5000) {
      CustomAlert({
        type: 'error',
        message: 'Please enter a valid number between 500 and 5000 steps',
      });
      return;
    }

    try {
      await updateOuraRingSettings({
        device_settings: {
          steps_to_miles: steps,
        },
      }).unwrap();

      // Refetch to get updated data
      fetchSettings();

      CustomAlert({
        type: 'success',
        message: `Steps per mile set to ${steps}`,
      });
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || 'Failed to save settings. Please try again.';
      CustomAlert({
        type: 'error',
        message: errorMessage,
      });
    }
  };

  const handleResetToDefault = async () => {
    try {
      await updateOuraRingSettings({
        device_settings: {
          steps_to_miles: DEFAULT_STEPS_PER_MILE,
        },
      }).unwrap();

      setStepsPerMile(DEFAULT_STEPS_PER_MILE.toString());

      // Refetch to get updated data
      fetchSettings();

      CustomAlert({
        type: 'success',
        message: `Reset to default: ${DEFAULT_STEPS_PER_MILE} steps per mile`,
      });
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || 'Failed to reset settings. Please try again.';
      CustomAlert({
        type: 'error',
        message: errorMessage,
      });
    }
  };

  const isLoading = isLoadingSettings || isUpdating || isFetching;

  return (
    <CustomScreenWrapper removeScroll={true}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[PrimaryColor]}
            tintColor={PrimaryColor}
          />
        }
        showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <CustomHeader hideEditBtn={true} />
          <Text style={styles.headerText}>Oura Ring Settings</Text>

          {isLoadingSettings && !isRefreshing ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={PrimaryColor} />
              <Text style={styles.loadingText}>Loading settings...</Text>
            </View>
          ) : (
            <View style={styles.content}>
              <View style={styles.fieldContainer}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Steps Per Mile</Text>
                  <TouchableOpacity
                    style={styles.infoButton}
                    onPress={() => setShowInfoModal(true)}>
                    <AboutIcon size={moderateScale(14)} color={colors.primaryGrey} />
                  </TouchableOpacity>
                </View>

                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.input}
                    value={stepsPerMile}
                    onChangeText={setStepsPerMile}
                    keyboardType="number-pad"
                    placeholder={DEFAULT_STEPS_PER_MILE.toString()}
                    placeholderTextColor={colors.grey}
                    editable={!isLoading}
                  />
                  <Text style={styles.unitText}>steps</Text>
                </View>

                <Text style={styles.helperText}>
                  Range: 500 - 5000 steps (Default: {DEFAULT_STEPS_PER_MILE})
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.saveButton,
                  {backgroundColor: PrimaryColor},
                  isLoading && styles.disabledButton,
                ]}
                onPress={handleSave}
                disabled={isLoading}>
                {isUpdating ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={styles.saveButtonText}>Save Settings</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.resetButton, isLoading && styles.disabledButton]}
                onPress={handleResetToDefault}
                disabled={isLoading}>
                <Text style={[styles.resetButtonText, {color: PrimaryColor}]}>
                  Reset to Default
                </Text>
              </TouchableOpacity>

              {/* Info Section */}
              <View style={styles.infoSection}>
                <Text style={styles.infoSectionTitle}>How It Works</Text>
                <Text style={styles.infoSectionText}>
                  This setting controls how your Oura Ring step count is converted to miles.
                  {'\n\n'}
                  For example, with the default setting of {DEFAULT_STEPS_PER_MILE} steps per mile:
                  {'\n'}
                  {'\u2022'} 4,000 steps = 2 miles
                  {'\n'}
                  {'\u2022'} 10,000 steps = 5 miles
                  {'\n\n'}
                  Adjust this value based on your stride length:
                  {'\n'}
                  {'\u2022'} Shorter stride = more steps per mile
                  {'\n'}
                  {'\u2022'} Longer stride = fewer steps per mile
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Info Modal */}
      <Modal
        visible={showInfoModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowInfoModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Steps Per Mile</Text>
            <Text style={styles.modalText}>
              This setting determines how many steps are counted as one mile when syncing data from your Oura Ring.
              {'\n\n'}
              {'\u2022'} Average person: ~2,000 steps/mile{'\n'}
              {'\u2022'} Taller individuals: ~1,500-1,800 steps/mile{'\n'}
              {'\u2022'} Shorter individuals: ~2,200-2,500 steps/mile{'\n'}
              {'\u2022'} Running: ~1,400-1,700 steps/mile{'\n\n'}
              Adjust based on your height and stride length for more accurate mile tracking.
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
    </CustomScreenWrapper>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
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
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: moderateScale(10),
    fontSize: moderateScale(14),
    color: colors.primaryGrey,
  },
  fieldContainer: {
    marginBottom: moderateScale(20),
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
    marginTop: moderateScale(10),
  },
  saveButtonText: {
    color: colors.white,
    fontSize: moderateScale(15),
    fontWeight: '700',
  },
  resetButton: {
    paddingVertical: moderateScale(14),
    borderRadius: moderateScale(25),
    alignItems: 'center',
    marginTop: moderateScale(10),
    borderWidth: 1,
    borderColor: colors.lightGrey,
  },
  resetButtonText: {
    fontSize: moderateScale(15),
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.6,
  },
  infoSection: {
    marginTop: moderateScale(30),
    borderTopWidth: 1,
    borderTopColor: colors.lightGrey,
    paddingTop: moderateScale(20),
  },
  infoSectionTitle: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: colors.primaryGrey,
    marginBottom: moderateScale(12),
  },
  infoSectionText: {
    fontSize: moderateScale(13),
    color: colors.primaryGrey,
    lineHeight: moderateScale(20),
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
});

export default OuraRingSettings;
