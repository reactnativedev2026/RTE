import React from 'react';
import {colors} from '../../utils';
import {RootState} from '../../core/store';
import {moderateScale} from '../../utils/metrics';
import {StyleSheet, Text, View} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import PrivacySettingsToggle from './PrivacySettingsToggle';
import {useGetEventQuery} from '../../services/profile.api';
import {setEventDetail} from '../AuthScreen/login/login.slice';
import {useUpdatePrivacyMutation} from '../../services/setting.api';
import {CustomHeader, CustomScreenWrapper, CustomAlert} from '../../components';

interface PrivacyContainerProps {}

const PrivacyContainer = ({}: PrivacyContainerProps) => {
  const dispatch = useDispatch();
  const {eventDetail} = useSelector((state: RootState) => state.loginReducer);

  const [updatePrivacy, {isLoading}] = useUpdatePrivacyMutation();
  const {data, refetch, isFetching} = useGetEventQuery({
    eventId: eventDetail?.id,
  });

  const handleUpdatePrivacy = async (value: any) => {
    const obj = {eventId: value?.event_id, profile: value?.public_profile};
    await updatePrivacy({event_id: obj?.eventId, public_profile: !obj?.profile})
      .unwrap()
      .then(() => {
        const updatedParticipation =
          eventDetail?.user?.participation?.event_id === value?.event_id
            ? {
                ...eventDetail,
                user: {
                  ...eventDetail.user,
                  participation: {
                    ...eventDetail.user.participation,
                    public_profile: !value?.public_profile,
                  },
                },
              }
            : eventDetail;
        dispatch(setEventDetail(updatedParticipation));
      })
      .catch(err => {
        CustomAlert({type: 'error', message: err?.data?.message});
      });
  };
  const onRefresh = () => {
    refetch().then(() => {
      dispatch(setEventDetail(data?.data));
    });
  };

  return (
    <CustomScreenWrapper
      onRefresh={onRefresh}
      loadingIndicator={isFetching || isLoading}>
      <View style={styles.firstContainer}>
        <CustomHeader hideEditBtn={true} />
        <Text style={styles.headerText}>{'Privacy Settings'}</Text>
        <Text style={styles.heading}>
          {
            'This area allows you to change your privacy options. If you set your profile to public, other event participants will be able to follow your progress on your fitness journey. By default, all profiles are set to private.'
          }
        </Text>
        <PrivacySettingsToggle
          item={eventDetail}
          onToggle={handleUpdatePrivacy}
        />
      </View>
    </CustomScreenWrapper>
  );
};

const styles = StyleSheet.create({
  firstContainer: {
    flex: 1,
    backgroundColor: colors.white,
    paddingTop: moderateScale(20),
    borderRadius: moderateScale(25),
    marginBottom: moderateScale(20),
    paddingBottom: moderateScale(5),
    marginHorizontal: moderateScale(10),
    paddingHorizontal: moderateScale(15),
  },
  headerText: {
    fontWeight: '800',
    textAlign: 'center',
    color: colors.primaryGrey,
    fontSize: moderateScale(16),
    marginTop: moderateScale(10),
  },
  heading: {
    fontWeight: '400',
    color: colors.primaryGrey,
    fontSize: moderateScale(14),
    marginTop: moderateScale(20),
    lineHeight: moderateScale(20),
  },
  line: {marginTop: moderateScale(20)},
  label: {
    fontWeight: '600',
    color: colors.headerBlack,
    fontSize: moderateScale(14),
    lineHeight: moderateScale(20),
  },
});

export default PrivacyContainer;
