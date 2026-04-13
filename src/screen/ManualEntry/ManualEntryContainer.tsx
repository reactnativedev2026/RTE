import React, {useEffect} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {
  CustomHeader,
  CustomHorizontalLine,
  CustomScreenWrapper,
  CustomToggleSwitch,
} from '../../components';
import {store} from '../../core/store';
import {colors} from '../../utils/colors';
import {getTemplateSpecs} from '../../utils/helpers';
import {moderateScale, RFValue} from '../../utils/metrics';
import {useUserSetting} from '../../hooks';
import {settingTypes} from '../Setting/helper';
import {useUpdateSyncDevicesMutation} from '../../services/setting.api';

interface ManualEntryContainerProps {}
const ManualEntryContainer = ({}: ManualEntryContainerProps) => {
  const [toggle, setToggle] = React.useState(false);
  const updateEntryCallback = (val: any) => {
    setToggle(val);
  };
  const {
    isFetching,
    settingData,
    handleUpdateManualEntry,
    isLoading,
    getUserSettingsCall,
  } = useUserSetting({
    type: settingTypes.MANUAL_ENTRY,
    updateCallback: updateEntryCallback,
  });

  const [updateSyncDevices, {isLoading: isSyncDevicesLoading}] =
    useUpdateSyncDevicesMutation();

  useEffect(() => {
    setToggle(settingData?.data?.manual_entry);
  }, [settingData?.data?.manual_entry]);

  return (
    <CustomScreenWrapper onRefresh={getUserSettingsCall}>
      <View style={styles.firstContainer}>
        <CustomHeader hideEditBtn={true} />
        <Text style={styles.headerText}>{'Manual Entry'}</Text>
        <Text style={styles.labelText}>
          {
            'Would you like to have manually entered miles be added/updated to every challenge you are currently in? For example, if you are in both Amerithon and RTY you can manually enter miles in one challenge and they will be automatically added to the other. Any edits you make to one will be reflected in all challenges. Select “Yes” if you want manual entries and changes to apply to all challenges you are in. Select "No" if you would rather enter your miles manually in each challenge separately.'
          }
        </Text>
        <CustomHorizontalLine />
        <CustomToggleSwitch
          isOn={toggle}
          onToggle={() => {
            if (toggle) {
              handleUpdateManualEntry(false);
            } else {
              handleUpdateManualEntry(true);
              updateSyncDevices({
                sync_start_date: '2025-01-10',
                data_source: 'fitbit',
              })
                .unwrap()
                .then(res => {
                  console.log('response', res.data);
                })
                .catch(err => {
                  console.log('Error', err);
                });
            }
          }}
          label="Make Manual Entry Global?"
          onColor={
            getTemplateSpecs(
              store.getState().loginReducer.eventDetail?.template,
            )?.settingsColor || colors.lightBlue
          }
          offColor="grey"
          labelStyle={styles.label}
          containerStyle={styles.toggleContainer}
          loading={isFetching || isLoading}
        />
      </View>
    </CustomScreenWrapper>
  );
};
export default ManualEntryContainer;

const styles = StyleSheet.create({
  firstContainer: {
    flex: 1,
    backgroundColor: colors.white,
    paddingTop: moderateScale(20),
    marginHorizontal: moderateScale(10),
    borderRadius: moderateScale(25),
    paddingHorizontal: moderateScale(25),
    marginBottom: moderateScale(10),
  },
  headerText: {
    fontSize: moderateScale(16),
    fontWeight: '800',
    color: colors.primaryGrey,
    textAlign: 'center',
    marginTop: moderateScale(10),
    marginBottom: 10,
  },
  labelText: {
    fontSize: RFValue(10),
    fontWeight: '400',
    color: colors.primaryGrey,
    marginTop: moderateScale(2),
    marginBottom: 5,
    lineHeight: 18,
  },
  label: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: colors.headerBlack,
  },
  toggleContainer: {marginTop: moderateScale(20)},
});
