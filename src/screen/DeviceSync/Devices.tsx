import React, { memo } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { DisconnectDeviceModal } from '../../components';
import { store } from '../../core/store';
import { navigate } from '../../services/NavigationService';
import { colors, Routes } from '../../utils';
import { getTemplateSpecs, openLink } from '../../utils/helpers';
import { moderateScale } from '../../utils/metrics';

interface DevicesProps {
  data: any;
  isFetching: boolean;
}
interface DeviceItem {
  name: string;
  image_url: string;
  short_name: string;
  oauth_url?: string;
  source_profile?: any; // Adjust this type if you know its structure
}

const Devices = memo(({data, isFetching}: DevicesProps) => {
  const [modal, setModal] = React.useState(false);
  const [isLoading, setLoading] = React.useState(false);
  const [shortNameId, setShortNameId] = React.useState(0);
  const [preserved, setPreserved] = React.useState(false);
  // Samsung debug screen tap counter
  const [samsungTapCount, setSamsungTapCount] = React.useState(0);
  const samsungTapTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  //RTY-Query
  const PrimaryColor = getTemplateSpecs(
    store.getState().loginReducer.eventDetail?.template,
  ).btnPrimaryColor;

  const handlePress = React.useCallback(
    (item: DeviceItem, connect: boolean) => {
      // if (item?.short_name == 'apple') {
      //   navigate(Routes.CONNECT_DEVICE, {short_name: item?.short_name});
      //   return;
      // }
      // if (!item?.oauth_url) {
      //   return CustomToast({type: 'info', message: 'Link not available'});
      // }
      if (connect) {
        navigate(Routes.DISCONNECT_DEVICE, {short_name: item?.short_name});
        // setModal(true);
        // setShortNameId(deviceName[item?.short_name]);
      } else {
        if (item?.short_name == 'apple' || item?.short_name == 'samsung') {
          navigate(Routes.CONNECT_DEVICE, {short_name: item?.short_name});
          return;
        } else {
          if (!item?.oauth_url) {
            return;
          }
          openLink(item.oauth_url);
        }
      }
    },
    [],
  );

  const handleSettingsPress = (item: DeviceItem) => {
    if (item?.short_name === 'samsung') {
      navigate(Routes.SAMSUNG_HEALTH_SETTINGS);
    } else if (item?.short_name === 'ouraring') {
      navigate(Routes.OURA_RING_SETTINGS);
    }
  };

  // Handle Samsung image tap for hidden debug screen access
  const handleSamsungImageTap = React.useCallback(() => {
    // Clear existing timer
    if (samsungTapTimerRef.current) {
      clearTimeout(samsungTapTimerRef.current);
    }

    const newCount = samsungTapCount + 1;
    setSamsungTapCount(newCount);

    if (newCount >= 3) {
      // Reset counter and navigate to debug screen
      setSamsungTapCount(0);
      navigate(Routes.SAMSUNG_HEALTH_DEBUG);
    } else {
      // Reset counter after 1.5 seconds of no taps
      samsungTapTimerRef.current = setTimeout(() => {
        setSamsungTapCount(0);
      }, 1500);
    }
  }, [samsungTapCount]);

  const renderItem = ({item}: {item: DeviceItem}) => {
    const connect = !!item?.source_profile;
    const style = dynamicStyles(connect, PrimaryColor);
    const isApple = item?.name.toLowerCase() === 'apple' || false;
    const isSamsung = item?.short_name === 'samsung';
    if (isSamsung && Platform.OS !== 'android') {
      return null;
    }
    const isOuraRing = item?.short_name === 'ouraring';
    const hasSettings = (isOuraRing) && connect; // Only show settings if device is connected
    if (isApple) {
      return (
        <View style={styles.item} key={item?.toString()}>
          <FastImage
            resizeMode="contain"
            style={styles.imageContainer}
            source={{uri: item?.image_url}}
          />
          <View
            style={{
              flexDirection: 'column',
            }}>
            <Text style={styles.deviceName}>Apple Health</Text>
            <Text
              onPress={() => {
                Linking.openURL(
                  'https://apps.apple.com/ca/app/trackery/id1476441769',
                );
              }}
              style={[
                styles.deviceName,
                {
                  marginTop: 10,
                  color: PrimaryColor,
                  textDecorationLine: 'underline',
                },
              ]}>
              Download Trackery
            </Text>
          </View>
          <Pressable
            style={style.connectBtn}
            onPress={() => handlePress(item, connect)}>
            <Text style={style.connectText}>
              {connect ? 'Disconnect' : 'Connect'}
            </Text>
          </Pressable>
        </View>
      );
    } else {
      return (
        <View style={styles.item} key={item?.toString()}>
          {isSamsung ? (
            <Pressable onPress={handleSamsungImageTap}>
              <FastImage
                resizeMode="contain"
                style={styles.imageContainer}
                source={{uri: item?.image_url}}
              />
            </Pressable>
          ) : (
            <FastImage
              resizeMode="contain"
              style={styles.imageContainer}
              source={{uri: item?.image_url}}
            />
          )}
          <View style={styles.deviceInfoContainer}>
            <Text style={styles.deviceName}>{item?.name}</Text>
            {hasSettings && (
              <View style={styles.actionLinksContainer}>
                <Pressable
                  onPress={() => handleSettingsPress(item)}>
                  <Text style={[styles.settingsLink, {color: PrimaryColor}]}>
                    Settings
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
          <Pressable
            style={style.connectBtn}
            onPress={() => handlePress(item, connect)}>
            <Text style={style.connectText}>
              {connect ? 'Disconnect' : 'Connect'}
            </Text>
          </Pressable>
        </View>
      );
    }
  };

  const dynamicStyles = (connect: boolean, bg: string) => ({
    connectBtn: {
      ...styles.connectBtnBase,
      borderColor: connect ? bg : colors.white,
      backgroundColor: connect ? colors.white : bg,
    },
    connectText: {
      ...styles.connectTextBase,
      color: connect ? bg : colors.white,
    },
  });
  return (
    <React.Fragment>
      {(isFetching || isLoading) && (
        <ActivityIndicator
          size={'large'}
          style={styles.loader}
          color={colors.primaryMediumBlue}
        />
      )}
      <Text style={styles.subHeading}>
        You have configured data synchronization from 1 applications to your
        account.
      </Text>
      <View style={styles.container}>
        <Text style={styles.runTheEdgeText}>
          Run The Edge uses your device's API (Apple, Fitbit, Garmin, Samsung, or Strava)
          to synchronize data with RTE's Tracker.
        </Text>
        <View style={styles.horizontalLine} />
        {data?.data?.length > 0 ? (
          data.data.slice(1).map((item: any) => renderItem({item}))
        ) : (
          <Text style={styles.textDescription}>No Records!</Text>
        )}
        <View style={styles.horizontalLine} />
        <Text style={styles.runTheEdgeText}>
          You can always use manual entry to update your miles in the RTE
          tracker, you can also sync miles from Garmin, Fitbit, Samsung, and Strava.
        </Text>
        <View style={styles.tContainer}>
          <Text style={styles.text}>
            To learn more about manual entry and synching please visit the{' '}
            <Text
              style={[
                styles.link,
                {
                  color: getTemplateSpecs(
                    store.getState().loginReducer.eventDetail?.template,
                  ).btnPrimaryColor,
                },
              ]}
              onPress={() => navigate(Routes.TUTORIAL)}>
              Tutorials
            </Text>{' '}
            page where we have videos that demonstrate each way to enter or sync
            miles.
          </Text>
        </View>
        <Text style={styles.runTheEdgeText}>
          You can always view your original data on your device or the
          provider’s page:
        </Text>
      </View>
      <DisconnectDeviceModal
        modal={modal}
        setModal={setModal}
        preserved={preserved}
        setLoading={setLoading}
        shortNameId={shortNameId}
        setPreserved={setPreserved}
      />
    </React.Fragment>
  );
});

const styles = StyleSheet.create({
  runTheEdgeText: {
    fontWeight: '400',
    color: colors.primaryGrey,
    fontSize: moderateScale(14),
    marginTop: moderateScale(10),
    lineHeight: moderateScale(19),
  },
  subHeading: {
    fontWeight: 'bold',
    color: colors.secondaryGrey,
    fontSize: moderateScale(14),
    marginTop: moderateScale(20),
    lineHeight: moderateScale(19),
  },
  container: {marginTop: moderateScale(20)},
  horizontalLine: {
    marginTop: moderateScale(20),
    borderBottomWidth: moderateScale(2),
    borderColor: 'rgba(247, 247, 247, 1)',
  },
  tContainer: {
    justifyContent: 'center',
    borderRadius: moderateScale(10),
    marginVertical: moderateScale(10),
  },
  text: {
    color: colors.primaryGrey,
    fontSize: moderateScale(14),
    lineHeight: moderateScale(19),
  },
  link: {
    fontWeight: 'bold',
    top: moderateScale(2),
    textDecorationLine: 'underline',
  },
  deviceInfoContainer: {
    flex: 1,
    marginLeft: moderateScale(10),
  },
  deviceName: {
    fontWeight: '700',
    color: colors.headerBlack,
    fontSize: moderateScale(14),
    marginBottom: moderateScale(4),
  },
  settingsLink: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    textDecorationLine: 'underline',
    marginTop: moderateScale(2),
  },
  actionLinksContainer: {
    flexDirection: 'row',
    gap: moderateScale(15),
    marginTop: moderateScale(2),
  },
  connectBtnBase: {
    borderWidth: 1,
    width: moderateScale(105),
    borderRadius: moderateScale(30),
    paddingVertical: moderateScale(9),
  },
  connectTextBase: {
    fontWeight: '700',
    textAlign: 'center',
    fontSize: moderateScale(14),
  },
  imageContainer: {width: moderateScale(100), height: moderateScale(40)},
  item: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: moderateScale(20),
    justifyContent: 'space-between',
  },
  roundedContainer: {
    alignSelf: 'flex-start',
    borderWidth: moderateScale(2),
    borderColor: colors.lightGrey,
    borderRadius: moderateScale(30),
    paddingVertical: moderateScale(10),
    paddingHorizontal: moderateScale(25),
    marginHorizontal: 5,
  },
  roundedText: {color: colors.lightGrey},
  textDescription: {
    fontWeight: '400',
    textAlign: 'center',
    color: colors.primaryGrey,
    fontSize: moderateScale(14),
    paddingTop: moderateScale(10),
    paddingBottom: moderateScale(20),
  },
  loader: {
    position: 'absolute',
    alignSelf: 'center',
    height: Dimensions.get('screen').height / 2,
  },
});

export default Devices;
