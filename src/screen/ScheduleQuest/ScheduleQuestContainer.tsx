import { tz } from 'moment-timezone';
import React from 'react';
import { RefreshControl, StyleSheet, Text, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSelector } from 'react-redux';
import {
  CustomAlert,
  CustomBottonsContainer,
  CustomModal,
  CustomQuestDescription,
  CustomQuestHeader,
  CustomScreenWrapper,
} from '../../components';
import { RootState } from '../../core/store';
import { useAdjustKeyboard, useEventData } from '../../hooks';
import { goBack, navigate, pop } from '../../services/NavigationService';
import {
  useCreateScheduleQuestMutation,
  useLazyGetQuestActivitiesQuery,
} from '../../services/quest.api';
import { colors, images, Routes } from '../../utils';
import { rteDateFormatFullMonth } from '../../utils/dateFormats';
import { ANDROID, moderateScale } from '../../utils/metrics';
import ProfileDatePicker from '../Profile/ProfileDatePicker';
import ScheduleDropdown from './ScheduleDropdown';
import EmailInputField from './ScheduleEmails';

interface ScheduleQuestContainerProps {}
const ScheduleQuestContainer = ({}: ScheduleQuestContainerProps) => {
  useAdjustKeyboard();
  // hooks
  const {fetchEventData} = useEventData();
  //Ref
  const scrollRef = React.useRef<KeyboardAwareScrollView>(null);
  //Redux_State
  const {user, eventDetail} = useSelector(
    (state: RootState) => state.loginReducer,
  );
  //Component State
  const [input, setInput] = React.useState('');
  const [emails, setEmails] = React.useState([]);
  const [modal, setModal] = React.useState(false);
  const [questImage, setQuestImage] = React.useState(null);
  const [questActivity, setQuestActivity] = React.useState([]);
  const [selectedActivity, setSelectedActivity] = React.useState(null);
  const [selectedDate, setSelectedDate] = React.useState(
    tz(user?.time_zone_name || 'UTC').toDate(),
  );
  // RTK Quries
  const [getQuestActivity, {isFetching}] = useLazyGetQuestActivitiesQuery();
  const [createScheduleQuest, {isLoading: createIsLoading}] =
    useCreateScheduleQuestMutation();

  React.useEffect(() => {
    if (user?.preferred_event_id) {
      handleGetActivity();
    }
  }, [user?.preferred_event_id]);

  function formatDate(dateInput) {
    const date = tz(dateInput, user?.time_zone_name || 'UTC').toDate();
    const year = date?.getFullYear();
    const month = String(date?.getMonth() + 1)?.padStart(2, '0');
    const day = String(date?.getDate())?.padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  const handleCreateQuest = async () => {
    if (user?.preferred_event_id && selectedActivity?.id && selectedDate) {
      const createScheduleObj = {
        event_id: user?.preferred_event_id,
        activity_id: selectedActivity?.id,
        date: formatDate(selectedDate),
        invitees_email: emails,
      };

      await createScheduleQuest(createScheduleObj)
        ?.unwrap()
        .then(res => {
          setQuestImage(res?.data?.bib_image);
          setModal(true);
          fetchEventData();
          setInput('');
        })
        .catch(err => {
          CustomAlert({
            type: 'error',
            message: err?.data?.data?.error || err?.data?.message,
          });
        });
    }
  };

  const handleGetActivity = () => {
    getQuestActivity({event_id: user?.preferred_event_id})
      .unwrap()
      .then(res => {
        const resArray = res?.data;
        const groupBaseArray = resArray?.reduce((acc, item) => {
          if (!acc[item?.group]) {
            acc[item?.group] = [];
          }
          acc[item?.group]?.push(item);
          return acc;
        }, {});
        const dropdownList = Object.entries(groupBaseArray)
          .map(([group, items]) => ({
            group,
            items,
          }))
          .sort((a, b) => {
            const numA = parseInt(a?.group?.match(/\d+/)?.[0] || 0, 10);
            const numB = parseInt(b?.group?.match(/\d+/)?.[0] || 0, 10);
            return numA - numB;
          });
        setQuestActivity(dropdownList);
      })
      .catch(err => console.log('ERRORRR', err));
  };
  const handleScrollToEnd = () => {
    if (ANDROID) {
      scrollRef.current?.scrollToEnd({animated: true});
    }
  };

  return (
    <CustomScreenWrapper
      removeScroll
      loadingIndicator={isFetching || createIsLoading}>
      <View style={styles.firstContainer}>
        <CustomQuestHeader onPressBack={() => navigate(Routes.QUEST_OPTIONS)} />
        <KeyboardAwareScrollView
          innerRef={ref => {
            scrollRef.current = ref;
          }}
          refreshControl={
            <RefreshControl
              enabled={false}
              refreshing={isFetching}
              onRefresh={handleGetActivity}
              tintColor={colors.primaryBrown}
            />
          }
          extraHeight={150}
          style={{flex: 1}}
          enableOnAndroid={true}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{flexGrow: 1}}
          keyboardShouldPersistTaps={'handled'}>
          <Text style={styles.headerText}>{'Schedule a Quests'}</Text>
          <ScheduleDropdown
            required
            questActivity={questActivity}
            headingText={'Select your quest:'}
            selectedActivity={selectedActivity}
            setSelectedActivity={setSelectedActivity}
          />
          <View style={{zIndex: -1}}>
            <View style={styles.verticalMargin} />
            {selectedActivity?.id && (
              <>
                <CustomQuestDescription
                  description={selectedActivity?.description}
                />
                <View style={styles.verticalMargin} />
              </>
            )}
            <ProfileDatePicker
              required
              value={selectedDate}
              headingText={'Quest date:'}
              onChangeText={_date => setSelectedDate(_date)}
              maximumDate={tz(
                eventDetail?.end_date,
                user?.time_zone_name || 'UTC',
              ).toDate()}
              minimumDate={tz(
                eventDetail?.start_date,
                user?.time_zone_name || 'UTC',
              ).toDate()}
              calendarStyle={{
                fill: selectedDate ? colors.primaryBrown : colors.lightGrey,
              }}
              containerStyle={{
                borderColor: selectedDate
                  ? colors.primaryBrown
                  : colors.lightGrey,
              }}
            />
            <View style={styles.verticalMargin} />
            <EmailInputField
              setInput={setInput}
              input={input}
              setEmails={setEmails}
            />
            <CustomBottonsContainer
              secondBtnTxt={'Schedule Quest'}
              customStyleBtn={styles.btnStyle}
              customStyleBtnCancel={styles.cancel}
              containerStyle={styles.containerStyle}
              onPressSave={() => {
                handleCreateQuest();
              }}
              onPressBtn={() => goBack()}
              disabled={Boolean(!selectedActivity?.id)}
            />
          </View>
        </KeyboardAwareScrollView>
      </View>

      <CustomModal
        visible={modal}
        title={`Congratulations, ${user?.display_name || user?.name}`}
        description={
          'Excellent news, you are successfully registered for this quest!'
        }
        descriptionStyle={styles.modalDesc}
        confirmButtonTitle={'Cool, thanks!'}
        showDescription={true}
        hideCancelBtn
        onClose={() => {
          setSelectedActivity(null);
          setSelectedDate(tz(user?.time_zone_name || 'UTC').toDate());
          setEmails([]);
          setModal(false);
          pop(1);
        }}
        onConfirm={() => {
          setSelectedActivity(null);
          setSelectedDate(tz(user?.time_zone_name || 'UTC').toDate());
          setEmails([]);
          setModal(false);
          pop(1);
        }}
        onCloseIcon={() => setModal(false)}>
        <>
          <FastImage
            defaultSource={images.Loading}
            style={{height: 150, width: 150}}
            source={questImage ? {uri: questImage} : images.ShieldPng}
          />
          <Text style={styles.footerDesc}>
            {`${selectedActivity?.name}\n${rteDateFormatFullMonth(
              selectedDate,
              user?.time_zone_name,
            )}  |  ${selectedActivity?.total_points} Miles`}
          </Text>
        </>
      </CustomModal>
    </CustomScreenWrapper>
  );
};
export default ScheduleQuestContainer;

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
    marginVertical: moderateScale(15),
  },
  verticalMargin: {marginTop: moderateScale(20)},
  btnStyle: {paddingHorizontal: moderateScale(15)},
  cancel: {paddingHorizontal: moderateScale(30)},
  modalDesc: {
    fontWeight: '400',
    color: colors.primaryGrey,
    bottom: moderateScale(10),
    fontSize: moderateScale(14),
    paddingRight: moderateScale(5),
  },
  footerDesc: {
    fontSize: moderateScale(14),
    color: colors.headerBlack,
    fontWeight: '700',
    paddingTop: moderateScale(10),
    paddingBottom: moderateScale(33),
    textAlign: 'center',
  },
  containerStyle: {paddingBottom: moderateScale(70)},
});
