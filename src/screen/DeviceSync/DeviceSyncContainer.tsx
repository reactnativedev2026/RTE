import React, {useMemo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {CustomHeader, CustomScreenWrapper} from '../../components';
import {colors} from '../../utils/colors';
import {moderateScale} from '../../utils/metrics';
import {useSelector} from 'react-redux';
import {RootState} from '../../core/store';
import Devices from './Devices';
import {
  useGetDeviceSyncQuery,
  useCheckUatAuthorizationQuery,
} from '../../services/deviceConnect.api';

interface DeviceSyncContainerProps {}

const DeviceSyncContainer = ({}: DeviceSyncContainerProps) => {
  const {user} = useSelector((state: RootState) => state.loginReducer);
  const {isFetching, data, refetch} = useGetDeviceSyncQuery({});
  const {
    data: uatAuthData,
    isLoading: isUatLoading,
    isError: isUatError,
    error: uatError,
    refetch: refetchUatAuth,
  } = useCheckUatAuthorizationQuery({}, {refetchOnMountOrArgChange: true});

  const onRefresh = () => {
    refetch();
    refetchUatAuth();
  };

  // Filter devices based on UAT authorization
  const filteredData = useMemo(() => {
    if (!data || !data.data) return data;

    // If UAT query is still loading, show all devices (don't filter yet)
    if (isUatLoading) {
      console.log('UAT query is loading - showing all devices temporarily');
      return data;
    }

    // If there's an error with UAT query, default to showing all devices
    // (safer default - if API fails, don't hide devices)
    if (isUatError) {
      console.log('UAT query error - defaulting to show all devices', uatError);
      return data;
    }

    // Check if user is authorized (success: true means authorized)
    const isAuthorized = uatAuthData?.success === true;

    // If not authorized, filter out Oura and Samsung devices
    if (!isAuthorized) {
      const filteredDevices = data.data.filter((device: any) => {
        const shortName = device?.short_name?.toLowerCase();
        return shortName !== 'ouraring' && shortName !== 'samsung';
      });

      return {
        ...data,
        data: filteredDevices,
      };
    }

    // If authorized, return all devices
    return data;
  }, [data, uatAuthData, isUatLoading, isUatError, uatError]);

  return (
    <CustomScreenWrapper onRefresh={onRefresh}>
      <View style={styles.firstContainer}>
        <CustomHeader hideEditBtn={true} />
        <Text style={styles.headerText}>{`${
          user?.display_name || user?.name
        }'s Devices`}</Text>
        <Devices data={filteredData} isFetching={isFetching} />
      </View>
    </CustomScreenWrapper>
  );
};

const styles = StyleSheet.create({
  firstContainer: {
    backgroundColor: colors.white,
    paddingTop: moderateScale(20),
    marginHorizontal: moderateScale(10),
    borderRadius: moderateScale(25),
    paddingHorizontal: moderateScale(15),
    paddingBottom: moderateScale(30),
    marginBottom: moderateScale(20),
  },
  headerText: {
    fontSize: moderateScale(16),
    fontWeight: '800',
    color: colors.primaryGrey,
    textAlign: 'center',
    marginTop: moderateScale(10),
  },
});

export default DeviceSyncContainer;
