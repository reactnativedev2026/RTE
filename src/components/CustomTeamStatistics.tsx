import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { RootState } from '../core/store';
import { colors } from '../utils/colors';
import { dateFormatFullYear } from '../utils/dateFormats';
import { getFloatNumber } from '../utils/helpers';
import { moderateScale } from '../utils/metrics';

const comparePoints = (item: any) => {
  const bestDayAccomplishment =
    item?.achievements?.best_day?.[0]?.accomplishment || 0;
  const yearlyPoints = item?.yearlyPoints?.point || 0;
  return bestDayAccomplishment > yearlyPoints;
};

const Item = ({item, user}: {item: any; user: any}) => {
  // const showStar = comparePoints(item); // Compare points for best day vs yearly points
  const showStar = item?.id === user?.id;

  return (
    <View style={styles.rowContainer}>
      {showStar && (
        <Ionicons
          name={'star'}
          size={15}
          color={colors.yellow}
          style={styles.star}
        />
      )}
      <View style={styles.row}>
        <Text style={[styles.cell, {textAlign: 'left'}]}>
          {item?.display_name}
        </Text>
        <Text style={styles.cell}>
          {dateFormatFullYear(item?.achievements?.best_day?.[0]?.date)}
        </Text>
        <Text style={styles.cell}>
          {`${getFloatNumber(
            item?.achievements?.best_day?.[0]?.accomplishment || '0',
          )} miles`}
        </Text>
      </View>
    </View>
  );
};

const MemberItem = ({item, user}: {item: any; user: any}) => {
  const showStar = item?.is_admin;

  return (
    <View style={styles.rowContainer}>
      {showStar && (
        <Ionicons
          name={'star'}
          size={15}
          color={colors.yellow}
          style={styles.star}
        />
      )}
      <View style={styles.row}>
        <Text style={[styles.cell, {textAlign: 'left'}]}>
          {item?.display_name}
        </Text>
        <Text style={styles.cell}>
          {dateFormatFullYear(item?.recentActivity?.date)}
        </Text>
        <Text style={styles.cell}>{`${getFloatNumber(
          item?.yearlyPoints?.point || '0',
        )} miles`}</Text>
      </View>
    </View>
  );
};

interface CustomTeamStatisticsProps {
  completeProfile: any;
  isFetching: any;
  showMemberTotals: boolean;
  showBestDays: boolean;
  showHeading: boolean;
}

const CustomTeamStatistics = ({
  completeProfile,
  isFetching,
  showMemberTotals = true,
  showBestDays = true,
  showHeading = true,
}: CustomTeamStatisticsProps) => {
  const {user} = useSelector((state: RootState) => state.loginReducer);

  return (
    <View>
      {showMemberTotals && (
        <View style={styles.container}>
          {showHeading && <Text style={styles.textHeading}>Member Totals</Text>}
          <View>
            {isFetching ? (
              <ActivityIndicator
                color={colors.primaryGrey}
                size={'small'}
                style={{marginTop: 10}}
              />
            ) : (
              completeProfile?.users?.map((item: any) => (
                <MemberItem key={item.id} item={item} user={user} /> // Pass item as a prop
              ))
            )}
          </View>
          {!completeProfile?.users && !isFetching && (
            <Text style={styles.noMemberTxt}>No member found!</Text>
          )}
        </View>
      )}
      {showBestDays && (
        <View style={styles.secondContainer}>
          {showHeading && (
            <Text style={styles.textHeading}>Member's Best Days</Text>
          )}
          <View>
            {isFetching ? (
              <ActivityIndicator
                color={colors.primaryGrey}
                size={'small'}
                style={{marginTop: 20}}
              />
            ) : (
              completeProfile?.users?.map((item: any) => (
                <Item key={item?.id} item={item} user={user} /> // Pass item as a prop
              ))
            )}
          </View>
          {!completeProfile?.users && !isFetching && (
            <Text style={styles.noMemberTxt}>No member found!</Text>
          )}
        </View>
      )}
    </View>
  );
};

export default CustomTeamStatistics;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 10,
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 30,
  },
  secondContainer: {
    marginTop: 15,
    marginHorizontal: 10,
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 30,
    marginBottom: 20,
  },
  textHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.black,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingLeft: 15,
    justifyContent: 'space-between',
    flex: 1,
  },
  cell: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    color: colors.primaryGrey,
    width: moderateScale(100),
  },
  star: {position: 'absolute', left: 0},
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noMemberTxt: {
    color: colors.primaryGrey,
    paddingVertical: moderateScale(30),
    textAlign: 'center',
  },
});
