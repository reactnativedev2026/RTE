import { useRoute } from '@react-navigation/native';
import { tz } from 'moment-timezone';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  CustomAlert,
  CustomMilesForm,
  CustomScreenWrapper,
} from '../../components';
import { RootState } from '../../core/store';
import {
  useCreateCalanderEventMutation,
  useLazyGetUserPointDetailQuery,
  useUpdateUserPointsMutation,
} from '../../services/Calander.api';
import { goBack, pop } from '../../services/NavigationService';
import { colors } from '../../utils/colors';
import { ANDROID, moderateScale } from '../../utils/metrics';
import { setRefetchYears } from '../AuthScreen/login/login.slice';

interface AddCalendarMilesProps { }

const AddCalendarMiles = ({ }: AddCalendarMilesProps) => {
  const route = useRoute();
  const dispatch = useDispatch();

  const [noteDetail, setNoteDetail] = React.useState(null);
  const [pointsDetail, setPointsDetail] = React.useState(null);
  const { user } = useSelector((state: RootState) => state.loginReducer);

  const [getPointDetail, { isFetching }] = useLazyGetUserPointDetailQuery();
  const [createUserPoints, { isLoading }] = useCreateCalanderEventMutation();
  const [updateUserPoints, { isLoading: updateIsLoading }] =
    useUpdateUserPointsMutation();

  const createUserpointsAction = async ({ values }) => {
    const pointsToCreate = {
      points: values?.points,
      date: route?.params?.date,
      event_id: user?.preferred_event_id,
      note: values?.notes,
    };
    await createUserPoints(pointsToCreate)
      .unwrap()
      .catch(err => {
        CustomAlert({ type: 'error', message: err?.data?.message });
      });
  };

  const updateUserpointsAction = async ({ values }) => {
    const points = await values?.points.map(i => {
      return { point_id: i?.id, amount: i?.amount };
    });
    const pointsToCreate = {
      points: points,
      action: 'update',
      note: values?.notes,
      event_id: user?.preferred_event_id,
    };
    await updateUserPoints(pointsToCreate)
      .unwrap()
      .catch(err => {
        CustomAlert({ type: 'error', message: err?.data?.message });
      });
  };

  const formatDate = dateString => {
    return tz(dateString, user?.time_zone_name).format('YYYY-MM-DD');
  };

  React.useEffect(() => {
    handlePointDetail();
  }, [route?.params?.date]);

  const handlePointDetail = () => {
    if (route?.params?.miles) {
      console.log(route?.params?.date, 'this is date')
      console.log(user?.preferred_event_id, 'this is event id')
      getPointDetail({
        event_id: user?.preferred_event_id,
        date: formatDate(route?.params?.date),
      })
        .unwrap()
        .then(res => {
          setPointsDetail(res?.data?.points);
          setNoteDetail(res?.data?.note);
        })
        .catch(err => console.log('ERR', err));
    }
  };

  const SaveAction = async values => {
    const result = { nullIds: [], validIds: [] };
    await values?.points?.forEach(item => {
      if (item.id === null) {
        result.nullIds.push(item);
      } else {
        result.validIds.push(item);
      }
    });
    try {
      if (result.nullIds.length > 0) {
        await createUserpointsAction({
          values: { ...values, points: result.nullIds },
        });
      }
      if (result.validIds.length > 0) {
        await updateUserpointsAction({
          values: { ...values, points: result.validIds },
        });
      }
      CustomAlert({ type: 'success', message: 'Updated Successfully!' });
      route?.params?.onPointsAddCallback?.();
      dispatch(setRefetchYears());
      pop(1);
    } catch (err) {
      CustomAlert({ type: 'error', message: 'Something went wrong!' });
    }
  };

  return (
    <CustomScreenWrapper removeScroll={ANDROID}>
      <View style={styles.firstContainer}>
        <CustomMilesForm
          onPressCancel={() => goBack()}
          onPressSave={SaveAction}
          fitBit={route?.params}
          pointsDetail={pointsDetail}
          noteDetail={noteDetail}
          setNoteDetail={setNoteDetail}
          isLoading={isFetching || isLoading || updateIsLoading}
          eventId={user?.preferred_event_id}
          footerObj={{ date: route?.params?.date, miles: route?.params?.miles }}
        />
      </View>
    </CustomScreenWrapper>
  );
};

const styles = StyleSheet.create({
  firstContainer: {
    flex: 1,
    backgroundColor: colors.white,
    marginHorizontal: moderateScale(10),
    borderRadius: moderateScale(25),
    paddingHorizontal: moderateScale(15),
    marginBottom: moderateScale(20),
  },
});

export default AddCalendarMiles;
