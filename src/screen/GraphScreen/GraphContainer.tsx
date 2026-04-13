import { tz } from 'moment';
import React from 'react';
import { StyleSheet, Text, TextStyle, View } from 'react-native';
import { useSelector } from 'react-redux';
import {
  CustomScreenWrapper,
  MileageByActivityType,
  MileageByMonth,
} from '../../components';
import DaysMilesChart from '../../components/DaysMilesChart';
import Journey from '../../components/Journey';
import YearlyMilesChart from '../../components/YearlyMilesChart';
import { RootState, store } from '../../core/store';
import { useEventData } from '../../hooks';
import useCustomHomeWrapper from '../../hooks/useCustomHomeWrapper';
import { useLazyGetAmerithonDistanceQuery } from '../../services/Calander.api';
import {
  useLazyGetLastThirtyDaysQuery,
  useLazyGetMileageByActivityTypeQuery,
  useLazyGetMileageByMonthQuery,
} from '../../services/stats.api';
import { colors } from '../../utils';
import {
  getFloatNumber,
  getTemplateSpecs,
  templateName,
  yearlyTransformData,
} from '../../utils/helpers';
import { moderateScale } from '../../utils/metrics';

const bgColors = [
  'rgba(67, 67, 72, 1)',
  'rgba(128, 182, 234, 1)',
  'rgba(237, 105, 41, 1)',
  'rgba(175, 218, 46, 1)',
  'rgba(33, 42, 68, 1)',
  'rgba(61, 226, 184, 1)',
  'rgba(183, 59, 250, 1)',
  'rgba(126, 2, 28, 1)',
  'rgb(102, 24, 220)',
];
const modalityColors = {
  daily_steps: 'rgba(125,152,188,1)',
  bike: 'rgba(236,166,105,1)',
  walk: 'rgba(166,234,139,1)',
  run: 'rgba(184,236,237,1)',
  other: 'rgba(136,181,231,1)',
  swim: 'rgba(235,55,105,1)',
};

const GraphContainer = () => {
  const [yearly, setYearly] = React.useState({});
  const [reload, setReload] = React.useState(false);
  const [distance, setDistance] = React.useState({});
  const [thirtyDays, setThirtyDays] = React.useState([]);
  const [activityType, setActivityType] = React.useState([]);
  const [monthMileage, setMonthMileage] = React.useState([]);

  const {user, eventDetail, refetchYears} = useSelector(
    (state: RootState) => state.loginReducer,
  );
  const {chartMiles, achievementsFetching, achievementsData} =
    useCustomHomeWrapper({
      preferredEventId: user?.preferred_event_id,
      preferredTeamId: user?.preferred_team_id,
    });
  //RTK_Query
  const {fetchEventData} = useEventData();

  const [getMileage] = useLazyGetMileageByMonthQuery();
  const [getCoordinates] = useLazyGetAmerithonDistanceQuery();
  const [getLastThirtyDays] = useLazyGetLastThirtyDaysQuery();
  const [getActivityType] = useLazyGetMileageByActivityTypeQuery();

  React.useEffect(() => {
    fetchEventData();
    GetYearlyMiles_action();
    getCoordinates_action();
    GetLastThirtyDays_action();
    getMileageByActivityType_action();
  }, [reload, user?.preferred_event_id, refetchYears]);
  // Journey
  const getCoordinates_action = async () => {
    await getCoordinates({
      distance:
        eventDetail?.statistics?.completed_miles > 3521
          ? 3521
          : eventDetail?.statistics?.completed_miles,
    })
      .unwrap()
      .then(res => {
        setDistance(JSON.parse(res?.data?.nearest?.coordinates));
      })
      .catch(err => {
        console.log('Error', err);
      });
  };
  // Mileage By Month || Yearly Miles By Month
  const GetYearlyMiles_action = async () => {
    try {
      const res = await getMileage({
        event_id: user?.preferred_event_id,
      }).unwrap();
      // Monthly Miles Response setup
      const currentYear = tz(user?.time_zone_name || 'UTC').year();
      const filteredStats = res?.data?.monthly_stats.filter(item =>
        item.date.startsWith(currentYear),
      );
      setMonthMileage(filteredStats || []);
      // Yearly Miles Response setup
      const yearlyMilesChart = (
        await yearlyTransformData(res?.data?.yearly_stats)
      )?.map((yearStat, index) => ({
        year: yearStat?.year,
        bgClr: bgColors[index % bgColors.length],
        month: yearStat?.month || [],
      }));
      setYearly(yearlyMilesChart);
    } catch (err) {
      console.log('Error', err);
    }
  };
  // Last 30 Days
  const GetLastThirtyDays_action = () => {
    getLastThirtyDays({event_id: user?.preferred_event_id})
      .unwrap()
      .then(res => {
        setThirtyDays(res?.data?.stats);
      })
      .catch(err => {
        console.log('Error', err);
      });
  };
  // Mileage By Activity Type
  const getMileageByActivityType_action = async () => {
    await getActivityType({event_id: user?.preferred_event_id})
      .unwrap()
      .then(res => {
        const modalities = res?.data?.modality_totals?.[0]?.modalities;
        if (!modalities || Object.keys(modalities).length === 0) {
          setActivityType([]); // Prevents invalid chart
          return;
        }
        // Convert JSON to `series` format
        const series = Object.entries(modalities)
          .map(([key, value]) => ({
            value: parseFloat(value?.total_amount) || 0, // Ensure numeric values
            color: modalityColors[key] || 'gray', // Assign predefined colors
            name: key.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()), // Format name
          }))
          .filter(item => item.value > 0); // Remove zero-value entries

        if (series.length === 0) {
          setActivityType([]); // Avoid invalid pie chart
        } else {
          setActivityType(series);
        }
      })
      .catch(err => {
        console.log('Error fetching mileage', err);
      });
  };

  const onRefresh = () => {
    setReload(state => !state);
  };

  const templateSpecs = getTemplateSpecs(
    store.getState().loginReducer.eventDetail?.template,
  );

  return (
    <CustomScreenWrapper
      onRefresh={onRefresh}
      loadingIndicator={achievementsFetching}>
      <View style={styles.container}>
        <Text style={styles.userName}>{`${
          user?.display_name || user?.name
        }'s Stats`}</Text>
        <Text style={styles.miles({color: templateSpecs.bottomTabIconColor})}>
          {`${getFloatNumber(chartMiles?.miles?.total)} miles`}
        </Text>
        {/* <CustomMilesGraph
          containerStyle={styles.graphMiles}
          achievementResponseData={achievementsData}
          loading={achievementsFetching}
          chartMiles={chartMiles}
        /> */}
      </View>
      {eventDetail?.template == templateName?.AMERITHON && (
        <Journey distance={distance} />
      )}
      {/* {eventDetail?.template == templateName?.AMERITHON && <MemberTotals />}
      {eventDetail?.template == templateName?.AMERITHON && <MemberBestDays />} */}
      <DaysMilesChart
        data={thirtyDays}
        containerStyle={styles.mileageByMonth}
      />
      <MileageByMonth
        monthMileage={monthMileage}
        containerStyle={styles.mileageByMonth}
      />
      {eventDetail?.template == templateName?.AMERITHON && (
        <MileageByActivityType
          data={activityType}
          containerStyle={styles.mileageByMonth}
        />
      )}
      <YearlyMilesChart data={yearly} containerStyle={styles.mileageByMonth} />
    </CustomScreenWrapper>
  );
};

export default GraphContainer;
const styles = StyleSheet.create({
  container: {
    paddingTop: moderateScale(60),
    // flex: 1,
    marginHorizontal: moderateScale(10),
    backgroundColor: colors.white,
    borderRadius: moderateScale(30),
    marginBottom: moderateScale(20),
    paddingBottom: moderateScale(20),
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    color: colors.primaryGrey,
    paddingBottom: moderateScale(15),
  },
  graphMiles: {paddingTop: moderateScale(5)},
  mileageByMonth: {paddingTop: moderateScale(20)},

  miles: (props?: {color?: string}): TextStyle => ({
    fontSize: moderateScale(17),
    fontWeight: '800',
    color: props?.color || colors.primaryBlue,
    marginTop: moderateScale(5),
    textAlign: 'center',
  }),
});
