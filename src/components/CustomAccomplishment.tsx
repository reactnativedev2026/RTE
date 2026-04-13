import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BarIndicator } from 'react-native-indicators';
import { store } from '../core/store';
import { colors } from '../utils/colors';
import {
  dateFormat,
  getMonthNameFormat,
  getWeekRangeFormat,
} from '../utils/dateFormats';
import { getFloatNumber, getTemplateSpecs, templateName } from '../utils/helpers';
interface AccomplishmentData {
  title: string;
  date?: string;
  accomplishment?: string;
  currentTitle: string;
  currentValue: string;
  currentDate: string;
  backgroundColor: string;
  textColor: string;
  isFetching?: boolean;
}

interface CustomAccomplishmentProps {
  achievementsData?: any;
  isFetching?: boolean;
  isTeam?: boolean;
  teamAchievementsData?: any;
}

const AccomplishmentSection = ({
  title,
  date,
  accomplishment,
  currentTitle,
  currentValue,
  currentDate,
  backgroundColor,
  textColor,
  isFetching,
}: AccomplishmentData) => {
  const timezone = store.getState().loginReducer.user?.time_zone_name;
  let formattedDate;
  let currentFormattedDate;
  if (title === 'Best Week' && date) {
    formattedDate = getWeekRangeFormat(date, timezone);
  } else if (title === 'Best Month' && date) {
    formattedDate = getMonthNameFormat(date, timezone);
  } else if (date) {
    formattedDate = dateFormat(date, timezone);
  }

  if (currentTitle === 'This Week' && currentDate) {
    currentFormattedDate = getWeekRangeFormat(currentDate, timezone);
  } else if (currentTitle === 'This Month' && currentDate) {
    currentFormattedDate = getMonthNameFormat(currentDate, timezone);
  } else if (currentDate) {
    currentFormattedDate = dateFormat(currentDate, timezone);
  }
  return (
    <View style={styles.model}>
      <View style={styles.headingLeftBorder}>
        <Text style={styles.headingLeftText}>{title}</Text>
        <View style={styles.flexRowSpaceBetween}>
          {isFetching ? (
            <BarIndicator size={17} color={colors.primaryGrey} />
          ) : (
            formattedDate ? (
              <Text style={{color: '#808080'}}>{formattedDate}</Text>
            ) : (
              <Text style={{color: '#808080'}}>{}</Text>
            )
          )}

          {isFetching ? (
            <BarIndicator size={17} color={colors.primaryGrey} />
          ) : (
            <View style={{flexDirection: 'row', maxWidth: '90%'}}>
              <Text numberOfLines={1} style={styles.miles}>
                {accomplishment}
              </Text>
              <Text> mi</Text>
            </View>
          )}
        </View>
      </View>
      <View style={[styles.headingRightBorder, {backgroundColor}]}>
        <Text style={[styles.headingRightText, {color: textColor}]}>
          {currentTitle}
        </Text>
        <View style={styles.flexRowSpaceBetween}>
          {isFetching ? (
            <BarIndicator size={17} color={colors.primaryGrey} />
          ) : (
            <View style={{flexDirection: 'row', maxWidth: '90%'}}>
              <Text numberOfLines={1} style={{color: textColor}}>
                {currentValue}
              </Text>
              <Text style={{color: textColor}}> mi</Text>
            </View>
          )}
          {isFetching ? (
            <BarIndicator size={17} color={colors.primaryGrey} />
          ) : (
            currentFormattedDate && (
              <Text style={{color: textColor}}>{currentFormattedDate}</Text>
            )
          )}
        </View>
      </View>
    </View>
  );
};

const CustomAccomplishment = ({
  achievementsData,
  isFetching,
  isTeam,
  teamAchievementsData,
}: CustomAccomplishmentProps) => {
  const primaryColor = getTemplateSpecs(
    store.getState().loginReducer.eventDetail?.template,
  )?.primaryColor;
  const changeOpacity = (opacity: any) =>
    primaryColor?.replace(/[\d\.]+\)$/g, `${opacity})`);
  const isHerosTemplate = Boolean(
    store.getState().loginReducer.eventDetail?.template ==
      templateName?.HEROS_JOURNEY,
  );

  const accomplishmentBestDay = isTeam
    ? getFloatNumber(
        teamAchievementsData?.achievements?.best_day?.[0]?.accomplishment ??
          0.0,
      ) ?? 0
    : getFloatNumber(achievementsData?.best_day?.accomplishment) ?? 0.0;

  const accomplishmentBestDate = isTeam
    ? teamAchievementsData?.achievements?.best_day?.[0]?.date
    : achievementsData?.best_day?.date;

  const accomplishmentTodayValue = isTeam
    ? getFloatNumber(teamAchievementsData?.todayPoints?.point) ?? 0.0 //change
    : getFloatNumber(achievementsData?.current_day?.accomplishment) ?? 0.0;

  const accomplishmentTodayDate = isTeam
    ? teamAchievementsData?.todayPoints?.date //Change
    : achievementsData?.current_day?.date;

  const bestWeekDate = isTeam
    ? teamAchievementsData?.achievements?.best_week?.[0]?.date
    : achievementsData?.best_week?.date;

  const bestWeekValue = isTeam
    ? getFloatNumber(
        teamAchievementsData?.achievements?.best_week?.[0]?.accomplishment ??
          0.0,
      ) ?? 0
    : getFloatNumber(achievementsData?.best_week?.accomplishment) ?? 0.0;

  const thisWeekValue = isTeam
    ? getFloatNumber(teamAchievementsData?.thisWeekPoints?.point) ?? 0.0
    : //CHANGE
      getFloatNumber(achievementsData?.current_week?.accomplishment) ?? 0.0;

  const thisWeekDate = isTeam
    ? teamAchievementsData?.thisWeekPoints?.start_date //Chnage
    : achievementsData?.current_week?.date;

  const bestMonthValue = isTeam
    ? getFloatNumber(
        teamAchievementsData?.achievements?.best_month?.[0]?.accomplishment ??
          0.0,
      ) ?? 0
    : getFloatNumber(achievementsData?.best_month?.accomplishment) ?? 0.0;

  const thisMonthValue = isTeam
    ? getFloatNumber(teamAchievementsData?.thisMonthPoints?.point) ?? 0.0
    : getFloatNumber(achievementsData?.current_month?.accomplishment) ?? 0.0;

  const thisBestMonthDate = isTeam
    ? teamAchievementsData?.achievements?.best_month?.[0]?.date
    : achievementsData?.best_month?.date;

  const currentMonth = isTeam
    ? teamAchievementsData?.thisMonthPoints?.start_date //change
    : achievementsData?.current_month?.date;

  return (
    <View>
      <AccomplishmentSection
        title={'Best Day'}
        date={accomplishmentBestDate}
        accomplishment={accomplishmentBestDay}
        currentTitle={'Today'}
        currentValue={accomplishmentTodayValue}
        currentDate={accomplishmentTodayDate}
        backgroundColor={primaryColor}
        textColor={'white'}
        isFetching={isFetching}
      />
      <AccomplishmentSection
        title="Best Week"
        date={bestWeekDate}
        accomplishment={bestWeekValue}
        currentTitle={'This Week'}
        currentValue={thisWeekValue}
        currentDate={thisWeekDate}
        backgroundColor={changeOpacity(0.7)}
        textColor="white"
        isFetching={isFetching}
      />
      {!isHerosTemplate && (
        <AccomplishmentSection
          title="Best Month"
          date={thisBestMonthDate}
          accomplishment={bestMonthValue}
          currentTitle="This Month"
          currentValue={thisMonthValue}
          currentDate={currentMonth}
          backgroundColor={changeOpacity(0.5)}
          textColor="white"
          isFetching={isFetching}
        />
      )}
    </View>
  );
};

export default CustomAccomplishment;

const styles = StyleSheet.create({
  model: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  headingLeftBorder: {
    width: '48%',
    minHeight: 60,
    paddingVertical: 8,
    backgroundColor: '#F7F7F7',
    justifyContent: 'center',
    marginTop: 2,
    borderTopRightRadius: 30,
    borderBottomRightRadius: 30,
    paddingHorizontal: 15,
  },
  headingRightBorder: {
    width: '48%',
    minHeight: 60,
    paddingVertical: 8,
    justifyContent: 'center',
    marginTop: 2,
    borderTopLeftRadius: 30,
    borderBottomLeftRadius: 30,
    paddingHorizontal: 15,
  },
  headingLeftText: {
    color: 'black',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  headingRightText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  flexRowSpaceBetween: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  miles: {
    textAlign: 'right',

    // flex: 1,
  },
});
