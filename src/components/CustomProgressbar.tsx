import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { CircularProgress } from 'react-native-circular-progress';
import FastImage from 'react-native-fast-image';
import { useSelector } from 'react-redux';
import { RootState, store } from '../core/store';
import { colors } from '../utils/colors';
import { templateName } from '../utils/helpers';
import images from '../utils/images';
import { IOS, moderateScale, SCREEN_WIDTH } from '../utils/metrics';
import CustomAmerithonLogo from './CustomAmerithonLogo';

interface CustomProgressbarProps {
  isTeam?: boolean;
  teamAchievementsData?: any;
}

const CustomProgressbar = ({
  isTeam,
  teamAchievementsData,
}: CustomProgressbarProps) => {
 const {eventDetail} = useSelector((state: RootState) => state.loginReducer);

  const isHerosTemplate = Boolean(
    store.getState().loginReducer.eventDetail?.template ==
      templateName?.HEROS_JOURNEY,
  );

  const points = isTeam
    ? teamAchievementsData?.teamMilesData?.completed_miles
    : eventDetail?.statistics?.completed_miles;
  const totalMiles = isHerosTemplate
    ? eventDetail?.statistics?.total_miles
    : eventDetail?.statistics?.completed_miles;
  const quest_total = eventDetail?.quest_statistics?.total_quests;
  const quest_remaning = eventDetail?.quest_statistics?.pending_quests;
  const quest_completed = eventDetail?.quest_statistics?.completed_quests;
  const eventFuture = eventDetail?.event_status === 'future' ? true : false;
  const percentage = isTeam
    ? Math.round(teamAchievementsData?.teamMilesData?.progress_percentage)
    : eventDetail?.statistics?.completed_percentage > 100
    ? '100'
    : Math.round(eventDetail?.statistics?.completed_percentage);

  const remainingPoints = isTeam
    ? teamAchievementsData?.teamMilesData?.remaining_miles
    : eventDetail?.statistics?.remaining_miles;

  // Mapping of template numbers to render functions
  const renderTemplate = {
    1: () => renderTemplateTwo(percentage, eventDetail?.logo_url, eventFuture),
    2: () => renderTemplateOne(percentage, eventDetail?.logo_url, eventFuture),
    3: () => renderTemplateThree(eventDetail?.logo_url, eventFuture),
    4: () => renderTemplateOne(percentage, eventDetail?.logo_url, eventFuture),
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.sideContainer}>
          {isHerosTemplate ? (
            <Text style={styles.boldText}>{`${parseFloat(points).toFixed(
              2,
            )} \n ${'Miles'}`}</Text>
          ) : (
            <Text style={styles.boldText}>{`${parseFloat(points).toFixed(
              2,
            )} \n${'Miles'}`}</Text>
          )}

          <Text style={styles.whiteText}>Complete</Text>
        </View>
        <View style={[styles.circularWrapper]}>
          {eventDetail?.template == templateName?.HEROS_JOURNEY && (
            <Image
              source={require('../assets/HerosFrame.png')}
              style={styles.herosBgImage}
            />
          )}
          {renderTemplate[
            store.getState().loginReducer.eventDetail?.template
          ]?.()}
        </View>
        <View style={styles.sideContainer}>
          <Text style={styles.boldText}>
            {isHerosTemplate
              ? `${quest_completed}/${quest_total}\nQuests`
              : remainingPoints < 0
              ? `${isHerosTemplate ? `0\nQuests` : `0.00\nMiles`}`
              : `${parseFloat(remainingPoints).toFixed(2)}\nMiles`}
          </Text>
          <Text style={styles.whiteText}>
            {isHerosTemplate ? 'Completed' : 'Remaining'}
          </Text>
        </View>
      </View>
    </>
  );
};

const renderTemplateOne = (percentage: number, image, eventFuture: string) => (
  <>
    <CircularProgress
      size={130}
      width={20}
      fill={percentage}
      rotation={5}
      tintColor="lightgreen"
      backgroundColor="rgba(235, 235, 235, 1)"
      style={styles.circularProgress}
    />
    <View style={styles.innerContent}>
      <View style={styles.innerCircle}>
        <Image
          source={image ? {uri: image} : images.RunWalk}
          style={styles.image}
          resizeMode="contain"
        />
        {!eventFuture && (
          <View style={styles.percentageContainer}>
            <Text style={styles.percentageText}>{`${percentage}`}</Text>
            <Text style={styles.percentageSymbol}>{'%'}</Text>
          </View>
        )}
      </View>
    </View>
  </>
);

const renderTemplateThree = image => (
  <FastImage
    source={image ? {uri: image} : images.HeroTemplateLogo}
    defaultSource={images.HeroTemplateLogo}
    style={{
      width: moderateScale(130),
      height: moderateScale(140),
    }}
    resizeMode="contain"
    shouldRasterizeIOS={true}
  />
);

const renderTemplateTwo = (percentage: number, image, eventFuture: boolean) => (
  <View style={styles.amerithonContainer}>
    <CustomAmerithonLogo
      percentage={percentage}
      image={image}
      eventFuture={eventFuture}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderColor: colors.white,
    paddingHorizontal: moderateScale(12),
  },
  sideContainer: {
    marginTop: moderateScale(30),
    width: moderateScale(100),
    height: moderateScale(80),
    zIndex: 1,
  },

  boldText: {
    fontWeight: '700',
    fontSize: moderateScale(16),
    color: colors.white,
    textAlign: 'center',
  },
  whiteText: {
    color: colors.white,
    textAlign: 'center',
    zIndex: 1,
  },
  circularWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: 0,
    left: 0,
    top: moderateScale(55),
    bottom: 0,
    alignSelf: 'center',
  },
  circularProgress: {
    position: 'absolute',
    borderRadius: moderateScale(100),
    borderColor: colors.white,
    borderWidth: moderateScale(12),
    transform: [{rotate: '-365deg'}],
  },
  innerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    backgroundColor: colors.headerBlack,
    borderRadius: moderateScale(50),
    height: moderateScale(90),
    width: moderateScale(90),
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  image: {
    height: moderateScale(90),
    width: moderateScale(90),
  },
  percentageContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginLeft: IOS ? moderateScale(10) : 0,
  },
  percentageText: {
    fontWeight: '800',
    fontSize: moderateScale(12),
  },
  percentageSymbol: {
    fontWeight: '800',
    fontSize: moderateScale(8),
    top: moderateScale(3),
  },

  amerithonContainer: {position: 'absolute'},
  herosBgImage: {
    height: moderateScale(75),
    width: SCREEN_WIDTH,
    position: 'absolute',
    bottom: moderateScale(5.5),
  },
  amerithonImage: {
    height: moderateScale(150),
    width: moderateScale(150),
  },
});

export default CustomProgressbar;
