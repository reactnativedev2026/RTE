import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../core/store';
import useCustomHomeWrapper from '../hooks/useCustomHomeWrapper';
import { colors } from '../utils/colors';
import { templateName } from '../utils/helpers';
import { moderateScale } from '../utils/metrics';
import BroadcastModal from './BroadcastModal';
import CustomAccomplishment from './CustomAccomplishment';
import CustomFollowers from './CustomFollowers';
import CustomMilesGraph from './CustomMilesGraph';
import CustomOnTarget from './CustomOnTarget';
import CustomQuests from './CustomQuests';
import CustomScreenWrapper from './CustomScreenWrapper';
import CustomTeamStatistics from './CustomTeamStatistics';
import CustomToggle from './CustomToggle';
import LeafletMap from './Leafletmap';
import RequestFollow from './RequestFollow';
import WhoFollowing from './WhoFollowing';

interface CustomHomeWrapperProps {
  userHaveTeam?: boolean | undefined;
  completeProfile?: object;
  preferredTeamId?: string | number | null;
  preferredEventId?: string | number | null;
  onRefresh?: () => void;
  isLoading?: boolean;
  forceRefresh?: boolean;
}

const CustomHomeWrapper = ({
  userHaveTeam,
  completeProfile,
  preferredTeamId,
  preferredEventId,
  isLoading,
  onRefresh,
}: CustomHomeWrapperProps) => {
  const {
    isHerosTemplate,
    isTeam,
    setIsTeam,
    achievementsData,
    chartMiles,
    teamAchievementsData,
    questData,
    questIsFetching,
    achievementsFetching,
    teamFetching,
    completeProfileFetching,
    onRefreshAction,
    distance,
  } = useCustomHomeWrapper({
    preferredEventId,
    preferredTeamId,
    onRefresh,
  }); 
  
  const {eventDetail} = useSelector((state: RootState) => state.loginReducer);
  const remainingPoints = eventDetail?.statistics?.remaining_miles;
  const eventStatus = eventDetail?.event_status;

  return (
    <CustomScreenWrapper isLoading={isLoading} onRefresh={onRefreshAction} isTeam={isTeam} teamAchievementsData={teamAchievementsData}>
      <BroadcastModal /> 
      <View style={styles.firstContainer}>
        {eventStatus !== 'future' ? (
          <View>
            <View style={styles.textContainer}>
              <Text numberOfLines={2} style={styles.alignTextCenter}>
                <Text style={styles.headingBottom}>
                  {isHerosTemplate
                    ? null
                    : isTeam
                    ? null
                    : remainingPoints <= 0
                    ? 'Congratulations, '
                    : 'You are crushing it, '}
                </Text>
                <Text style={styles.HeadingBoldtxt}>
                  {isTeam
                    ? `${eventDetail?.preferred_team?.name}`
                    : isHerosTemplate
                    ? `${completeProfile?.name}'s Tale`
                    : `${completeProfile?.name}`}
                </Text>
              </Text>
            </View>
            <View style={styles.toggleButtonView({userHaveTeam})}>
              {userHaveTeam && !isHerosTemplate && (
                <CustomToggle setIsTeam={setIsTeam} isTeam={isTeam} />
              )}
            </View>
            <CustomAccomplishment
              achievementsData={achievementsData}
              isFetching={achievementsFetching || completeProfileFetching}
              isTeam={isTeam}
              teamAchievementsData={teamAchievementsData}
            />
          </View>
        ) : (
          <View
            style={{
              borderWidth: 0.2,
              margin: 20,
              borderRadius: 20,
              padding: 20,
              borderColor: 'grey',
            }}>
            <Text style={[styles.headingBottom, {fontWeight: 'bold'}]}>
              {eventDetail.name + '\n'}
            </Text>

            <Text style={[{textAlign: 'left'}]}>
              <Text style={styles.headingBottom}>
                {eventDetail?.future_start_message}
              </Text>
            </Text>
          </View>
        )}
      </View>

      {/* {isHerosTemplate && (
            <View>
              <Text style={styles.QuestText}>
                {isCheck
                  ? 'The current running quest is XYZ'
                  : 'No Quest scheduled today'}
              </Text>
            </View>
          )} */}

      {userHaveTeam && isTeam ? (
        <>
          {eventDetail?.template == templateName?.AMERITHON && (
            // <CustomAmerithonMap />
            <LeafletMap distance={distance} />
          )}
          <CustomTeamStatistics
            completeProfile={teamAchievementsData}
            isFetching={achievementsFetching || teamFetching}
          />
        </>
      ) : isHerosTemplate ? (
        <>
          <CustomQuests loading={questIsFetching} questData={questData} />
          <CustomMilesGraph
            achievementResponseData={achievementsData}
            loading={achievementsFetching}
            chartMiles={chartMiles}
          />
        </>
      ) : eventDetail?.template == templateName?.AMERITHON &&
        eventStatus !== 'future' ? (
        // <CustomAmerithonMap />
        <LeafletMap distance={distance} />
      ) : (
        eventStatus !== 'future' && (
          <>
            <CustomOnTarget />
            <CustomMilesGraph
              achievementResponseData={achievementsData}
              loading={achievementsFetching}
              chartMiles={chartMiles}
            />
          </>
        )
      )}
      {!isHerosTemplate && (
        <>
          <WhoFollowing
            loading={completeProfileFetching}
            containerStyle={styles.mileageByMonth}
          />
          <CustomFollowers
            loading={completeProfileFetching}
            containerStyle={styles.mileageByMonth}
          />
          <RequestFollow
            loading={completeProfileFetching}
            containerStyle={styles.mileageByMonth}
          />
        </>
      )}
    </CustomScreenWrapper>
  );
};

const styles = StyleSheet.create({
  firstContainer: {
    backgroundColor: colors.white,
    paddingTop: moderateScale(40),
    marginHorizontal: moderateScale(10),
    borderRadius: moderateScale(25),
    paddingBottom: moderateScale(20),
    marginBottom: moderateScale(20),
  },
  textContainer: {paddingTop: moderateScale(10), alignItems: 'center'},
  headingBottom: {
    color: '#888888',
    fontSize: moderateScale(16),
    fontWeight: '400',
  },
  HeadingBoldtxt: {
    fontWeight: 'bold',
    fontSize: moderateScale(16),
    color: '#888888',
  },
  alignTextCenter: {textAlign: 'center'},
  QuestText: {
    textAlign: 'center',
    marginVertical: moderateScale(5),
    color: colors.primaryGrey,
  },
  toggleButtonView: (props: any) => ({
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: moderateScale(10),
    marginTop: moderateScale(10),
    alignSelf: 'center',
  }),
  mileageByMonth: {paddingTop: moderateScale(20)},
});

export default CustomHomeWrapper;
