import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState, store } from '../core/store';
import useCustomHomeWrapper from '../hooks/useCustomHomeWrapper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setResetLogin } from '../screen/AuthScreen/login/login.slice';
import { deviceTokenApi } from '../services/deviceToken.api';
import { appUrls } from '../screen/Setting/helper';
import { navigate } from '../services/NavigationService';
import { images } from '../utils';
import { colors } from '../utils/colors';
import {
  settingOptions,
  settingOptionsAmerithone,
  settingOptionsHerosJourney,
} from '../utils/dummyData';
import { getTemplateSpecs, openLink, templateName } from '../utils/helpers';
import { moderateScale } from '../utils/metrics';
import CustomModal from './CustomModal';

interface CustomSettingMainProps {}

const CustomSettingMain = ({}: CustomSettingMainProps) => {
  const {user, eventDetail} = useSelector(
    (state: RootState) => state.loginReducer,
  );

  const {chartMiles} = useCustomHomeWrapper({
    preferredEventId: user?.preferred_event_id,
    preferredTeamId: user?.preferred_team_id,
  });

  const [showLogout, setShowLogout] = React.useState(false);
  const isHerosTemplate = Boolean(
    eventDetail?.template == templateName?.HEROS_JOURNEY,
  );
  const isAmerithoneTemplate = Boolean(
    eventDetail?.template == templateName?.AMERITHON,
  );
  const Logout = async () => {
    try {
      const fcmToken = await AsyncStorage.getItem('fcmToken');
      if (fcmToken) {
        await store
          .dispatch(
            deviceTokenApi.endpoints.deactivateDeviceToken.initiate(fcmToken),
          )
          .unwrap();
        console.log('🗑️ Device token deactivated on backend');
      }
    } catch (err) {
      console.log('deactivateDeviceToken error:', err?.data?.message || err);
    }
    store.dispatch(setResetLogin());
    setShowLogout(false);
  };

  // Define this outside of any render
  const DisplayOption = React.memo(({item}) => {
    const templateColor = getTemplateSpecs(
      store.getState().loginReducer.eventDetail?.template,
    )?.settingsColor;

    const Icon = images[item?.iconName || 'Menu'];
    const isStrokeIcon =
      item?.iconName === 'AttitudeIcon' || item?.iconName === 'ImportIcon';

    return (
      <Pressable
        key={item?.value}
        style={styles.itemContainer}
        onPress={() => {
          if (item?.value === 'Logout') {
            setShowLogout(true);
          } else if (item?.routeName) {
            navigate(item.routeName);
          }
        }}>
        <Icon
          style={{top: 7}}
          width={moderateScale(24)}
          height={moderateScale(24)}
          fill={isStrokeIcon ? 'none' : templateColor}
          stroke={isStrokeIcon ? templateColor : 'none'}
        />
        <Text numberOfLines={2} style={styles.textStyle}>
          {item?.value}
        </Text>
      </Pressable>
    );
  });

  // Then, use it in renderItem
  // eventDetail?.event_group == 'rty'
  const renderItem = ({item}) => {
    if (
      item?.routeName === 'GoalsContainer' &&
      !chartMiles?.event_streak_count
      //   eventDetail?.event_group === 'rty'
    ) {
      return null;
    }
    return <DisplayOption item={item} />;
  };

  return (
    <View style={styles.firstContainer}>
      <Text
        numberOfLines={2}
        style={styles.headerText}>{`${user?.name}'s Account & Settings`}</Text>
      <FlatList
        data={
          isHerosTemplate
            ? settingOptionsHerosJourney
            : isAmerithoneTemplate
            ? settingOptionsAmerithone
             : settingOptions
        }
        renderItem={renderItem}
        numColumns={3}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.contentContainer}
        style={styles.flatList}
        keyExtractor={(item, index) => index.toString()}
      />
      <View style={styles.buttonContainer}>
        <Pressable onPress={() => openLink(appUrls.PRIVACY_POLICY)}>
          <Text style={styles.btnStyle}>Privacy Policy</Text>
        </Pressable>
        <View style={styles.verticalLine} />
        <Pressable onPress={() => openLink(appUrls.TERMS_OF_SERVICE)}>
          <Text style={styles.btnStyle}>Terms of Service</Text>
        </Pressable>
      </View>
      {showLogout && (
        <CustomModal
          visible={showLogout}
          onClose={() => setShowLogout(false)}
          onConfirm={Logout}
          title="Are you sure"
          description="Are you sure you want to logout?"
          cancelButtonTitle="Cancel"
          confirmButtonTitle="Logout"
          showDescription={true}
          onCloseIcon={() => setShowLogout(false)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  firstContainer: {
    backgroundColor: colors.white,
    paddingTop: moderateScale(50),
    marginHorizontal: moderateScale(10),
    borderRadius: moderateScale(25),
    paddingHorizontal: moderateScale(15),
    paddingBottom: moderateScale(20),
    marginBottom: moderateScale(20),
  },
  headerText: {
    fontSize: moderateScale(16),
    fontWeight: '800',
    color: colors.primaryGrey,
    textAlign: 'center',
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingVertical: moderateScale(5),
    alignSelf: 'center',
    gap: moderateScale(10),
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  flatList: {
    flex: 1,
  },
  itemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: moderateScale(12),
    width: moderateScale(100),
    borderWidth: 1,
    borderColor: 'rgba(247, 247, 247, 1)',
    borderRadius: 5,
    height: moderateScale(100),
  },
  textStyle: {
    color: colors.headerBlack,
    fontSize: moderateScale(14),
    fontWeight: '500',
    marginTop: moderateScale(20),
    textAlign: 'center',
  },
  textWrapper: {
    height: moderateScale(45),
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnStyle: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: colors.headerBlack,
    textDecorationLine: 'underline',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: moderateScale(20),
    justifyContent: 'center',
  },
  verticalLine: {
    width: 1,
    height: '80%',
    backgroundColor: colors.primaryGrey,
    marginHorizontal: moderateScale(10),
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: moderateScale(20),
    borderRadius: moderateScale(10),
    alignItems: 'center',
  },
  modalText: {
    marginBottom: moderateScale(20),
    fontSize: moderateScale(16),
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default CustomSettingMain;
