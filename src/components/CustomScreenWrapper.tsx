import React from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import useAppState from 'react-native-appstate-hook';
import LinearGradient from 'react-native-linear-gradient';
import { useSelector } from 'react-redux';
import { RootState, store } from '../core/store';
import { colors } from '../utils';
import { getTemplateSpecs } from '../utils/helpers';
import { moderateScale, WINDOW_WIDTH } from '../utils/metrics';
import CustomLoader from './CustomLoader';
import CustomMainHeader from './CustomMainHeader';
import CustomProgressbar from './CustomProgressbar';
import CustomScreenLoader from './CustomScreenLoader';

interface CustomScreenWrapperProps {
  children?: React.ReactNode;
  removeScroll?: boolean;
  isLoading?: boolean;
  loadingIndicator?: boolean;
  onRefresh?: () => void;
  isTeam?: boolean;
  teamAchievementsData?: any;
}

const CustomScreenWrapper = React.forwardRef<any, CustomScreenWrapperProps>(
  (
    {
      children,
      isLoading,
      removeScroll,
      loadingIndicator,
      onRefresh,
      isTeam,
      teamAchievementsData,
    },
    ref,
  ) => {
    const RemoveScroll = removeScroll ? View : ScrollView;
    const {eventDetail} = useSelector((state: RootState) => state.loginReducer);
    const [eventloading, setEventLoading] = React.useState(false);
    const [refreshing, setRefreshing] = React.useState(false);

    const {appState} = useAppState({
      onChange: newAppState => {
        console.log('App state changed to ', newAppState);
      },
      onForeground: () => {
        handleRefreshControl();
      },
      onBackground: () => {
        console.log('App went to background');
      },
    });

    const handleRefreshControl = () => {
      onRefresh && onRefresh();
      setRefreshing(true);
      setTimeout(() => {
        setRefreshing(false);
      }, 1000);
    };

    if (isLoading || !eventDetail || eventloading) {
      return <CustomLoader />;
    }

    return (
      <View style={styles.flex}>
        <LinearGradient
          colors={
            getTemplateSpecs(
              store.getState().loginReducer.eventDetail?.template,
            )?.gradientColor
          }
          style={styles.flex}>
          <CustomMainHeader setEventLoading={setEventLoading} />
          <RemoveScroll
            ref={ref}
            contentContainerStyle={{flexGrow: 1}}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            refreshControl={
              <RefreshControl
                // enabled={false}
                enabled={!!onRefresh}
                refreshing={refreshing}
                onRefresh={handleRefreshControl}
                tintColor={colors.white}
              />
            }
            style={styles.flex}>
            <View style={styles.progressContainer}>
              {isLoading ? <ActivityIndicator /> : <CustomProgressbar isTeam={isTeam} teamAchievementsData={teamAchievementsData} />}
            </View>
            <View style={styles.whiteItem}>{children}</View>
          </RemoveScroll>
        </LinearGradient>
        {/* {loadingIndicator && <CustomScreenLoader />} */}
        {loadingIndicator && (
          <TouchableWithoutFeedback>
            <View style={styles.loaderOverlay}>
              <CustomScreenLoader />
            </View>
          </TouchableWithoutFeedback>
        )}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  flex: {flex: 1},
  progressContainer: {
    zIndex: 999,
    position: 'absolute',
    marginTop: moderateScale(10),
  },
  whiteItem: {
    width: WINDOW_WIDTH,
    marginTop: moderateScale(120),
    flex: 1,
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
export default CustomScreenWrapper;
