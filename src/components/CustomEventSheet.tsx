import React, { useCallback } from 'react';
import {
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { RootState, store } from '../core/store';
import {
  setCompleteProfile,
  setEventDetail,
  setEventList,
  setUser,
} from '../screen/AuthScreen/login/login.slice';
import { navigateAndReset } from '../services/NavigationService';
import {
  useLazyGetCompleteProfileQuery,
  useLazyGetEventListingQuery,
  useLazyGetEventQuery,
} from '../services/profile.api';
import { colors, images } from '../utils';
import { dateFormat } from '../utils/dateFormats';
import { moderateScale } from '../utils/metrics';
import CustomAlert from './CustomAlert';

interface EventItem {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  show_event_dates: boolean;
}

interface CustomEventSheetProps {
  RBRef?: any;
  eventList?: EventItem[] | undefined;
  setEventLoading?: any;
}

const CustomEventSheet: React.FC<CustomEventSheetProps> = ({
  RBRef,
  eventList,
  setEventLoading,
}) => {
  const {user, eventDetail} = useSelector(
    (state: RootState) => state.loginReducer,
  );
  const {activeTab} = useSelector((state: RootState) => state.homeReducer);
  const [selectedId, setSelectedId] = React.useState('');
  const [refreshing, setRefreshing] = React.useState(false);
  const [getEventDetails] = useLazyGetEventQuery();
  const [getCompleteProfile] = useLazyGetCompleteProfileQuery();
  const [getEventList] = useLazyGetEventListingQuery();

  React.useEffect(() => {
    setSelectedId(user?.preferred_event_id);
  }, [user?.preferred_event_id, refreshing]);

  const getCompleteProfileAction = useCallback(
    ({eventId}: {eventId: number}) => {
      getCompleteProfile({event_id: eventId})
        .unwrap()
        .then(profileResponse => {
          const profileObj = {
            ...profileResponse?.data,
            preferred_event_id: eventId,
          };
          store.dispatch(setCompleteProfile(profileObj));
        })
        .catch(err => console.log('Error:', err))
        .finally(() => {
          setEventLoading && setEventLoading(false);
        });
    },
    [getCompleteProfile],
  );

  const getNewEventData = useCallback(
    (id: number) => {
      setSelectedId(id);
      RBRef.current.close();
      setEventLoading && setEventLoading(true);
      getEventDetails({eventId: id})
        .unwrap()
        .then(eventResponse => {
          const eventId = eventResponse?.data?.id;
          store.dispatch(setEventDetail(eventResponse?.data));
          store.dispatch(
            setUser({
              ...user,
              preferred_event_id: eventId,
              has_team: Boolean(eventResponse?.data?.preferred_team_id),
              preferred_team_id: eventResponse?.data?.preferred_team_id,
            }),
          );
          getCompleteProfileAction({eventId});
          navigateAndReset(activeTab);
        })
        .catch(err => {
          setEventLoading && setEventLoading(false);
          console.log('Event API error:', err?.data?.message);
          CustomAlert({
            type: 'error',
            message: err?.data?.message,
          });
        });
    },
    [getEventDetails, getCompleteProfileAction, RBRef],
  );

  const renderItem = useCallback(
    ({item}: {item: EventItem}) => (
      <Pressable
        onPress={() => {
          if (item?.id !== eventDetail?.id) {
            getNewEventData(item?.id);
          }
        }}
        style={styles.btn}>
        <images.Calander height={20} width={20} fill={colors.primaryBlue} />
        <View style={styles.credentials}>
          <Text style={styles.name}>{item?.name}</Text>
          {item?.show_event_dates && (
            <View>
              <Text style={styles.date}>{`Start Date: ${dateFormat(
                item?.start_date,
                user?.time_zone_name,
              )}`}</Text>
              <Text style={styles.date}>{`End Date: ${dateFormat(
                item?.end_date,
                user?.time_zone_name,
              )}`}</Text>
            </View>
          )}
        </View>
        <Ionicons
          name={
            selectedId === item?.id
              ? 'checkmark-circle-outline'
              : 'ellipse-outline'
          }
          size={25}
        />
      </Pressable>
    ),
    [selectedId, eventDetail, getNewEventData],
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(!refreshing);
    getEventList({list_type: 'all'})
      .unwrap()
      .then(res => {
        console.log('new', res?.data);
        const preferredEventId = user?.preferred_event_id;
        const dataArray = [...(res?.data?.data || [])];

        if (preferredEventId) {
          const index = dataArray.findIndex(
            item => item.id == preferredEventId,
          );
          if (index > 0) {
            dataArray.unshift(dataArray.splice(index, 1)[0]);
          }
        }
        store.dispatch(setEventList(dataArray));
      })
      .catch(err => console.log('error', err))
      .finally(() => setRefreshing(false));
  }, []);

  return (
    <RBSheet
      ref={RBRef}
      draggable
      closeOnPressBack
      closeOnDragDown
      customStyles={{
        draggableIcon: {backgroundColor: colors.primaryGrey, width: 60},
        wrapper: {backgroundColor: 'rgba(0, 0, 0, 0.5)'},
        container: {
          backgroundColor: colors.white,
          borderTopRightRadius: 10,
          borderTopLeftRadius: 10,
        },
      }}
      customModalProps={{animationType: 'fade', statusBarTranslucent: true}}
      height={500}
      openDuration={20}>
      <SafeAreaView style={styles.flex}>
        <FlatList
          data={eventList}
          keyExtractor={(item, index) => (item.id + index).toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.content}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={() => {
            return (
              <View style={styles.centerContainer}>
                <Text style={styles.notFoundText}> No record found!</Text>
              </View>
            );
          }}
        />
      </SafeAreaView>
    </RBSheet>
  );
};

const styles = StyleSheet.create({
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: moderateScale(10),
  },
  flex: {flex: 1},
  credentials: {marginLeft: moderateScale(15), width: '80%'},
  name: {fontSize: moderateScale(16), fontWeight: '600'},
  date: {fontSize: moderateScale(14), fontWeight: '400'},
  content: {paddingBottom: moderateScale(20)},
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: moderateScale(390),
  },

  notFoundText: {
    textAlign: 'center',
    color: colors.primaryGrey,
    fontSize: moderateScale(16),
  },
});

export default CustomEventSheet;
