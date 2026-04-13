import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import {
  CustomDDPicker,
  CustomHeader,
  CustomHorizontalLine,
  CustomToggleSwitch,
} from '../../components';
import { renderAnchors } from '../../components/ClickAbleText';
import { RootState } from '../../core/store';
import { navigate } from '../../services/NavigationService';
import { colors, Routes } from '../../utils';
import { templateName } from '../../utils/helpers';
import { moderateScale } from '../../utils/metrics';

interface RtyGoalsFormProps {
  initiallySelectedValue?: any;
  onSelectItem?: any;
  goalsData?: any;
  loading?: any;
  rtyPoints?: any;
  toggleExtraMiles?: any;
}

const RtyGoalsForm = ({
  initiallySelectedValue,
  onSelectItem,
  goalsData,
  loading,
  rtyPoints,
  toggleExtraMiles,
}: RtyGoalsFormProps) => {
  const {user, eventDetail} = useSelector(
    (state: RootState) => state.loginReducer,
  );

  const overrides = goalsData?.extra?.participation?.modality_overrides || [];

  const swimEnable = overrides.includes('swim'); // true or false
  const bikeEnable = overrides.includes('bike'); // true or false
  const otherEnable = overrides.includes('other'); // true or false

  return (
    <View style={styles.firstContainer}>
      <CustomHeader
        hideEditBtn={true}
        onPressBack={() => navigate(Routes.SETTING)}
      />
      <Text style={styles.headerText}>{`${user?.name}'s Goals`}</Text>
      <>
        {eventDetail?.template !== templateName?.AMERITHON &&
          goalsData?.goal_message &&
          renderAnchors(
            goalsData?.goal_message,
            styles.textWithMargin,
          )
          // <Text style={styles.textWithMargin}>{goalsData?.goal_message}</Text>
        }
        {
          goalsData?.message_after_goal_message &&
            renderAnchors(
              goalsData?.message_after_goal_message,
              styles.textWithMargin,
            )

          // <Text style={styles.textWithMargin}>
          //   {goalsData?.message_after_goal_message}
          // </Text>
        }
        {goalsData?.rty_stats_message &&
          renderAnchors(goalsData?.rty_stats_message, styles.textWithMargin)}
        {/* <Text style={styles.text}>
          {`So far, you averaged ${
          loading ? 0 : goalsData?.mileage_per_day
        } miles per day. Moving forward, ${
          !loading && goalsData?.mileage_required_per_day > 0
            ? goalsData?.mileage_required_per_day
            : '0'
        } miles per day would ensure you reach your goal in time. This could be quite a challenge, but maybe you're up for it!?${
          eventDetail?.template !== templateName?.AMERITHON
            ? 'Or you can adjust your goal in Account Settings.'
            : ''
        }`}
        </Text> */}
        {goalsData?.rty_stats_action_message &&
          renderAnchors(goalsData?.rty_stats_action_message, styles.boldText2)}
        {/* {eventDetail?.template !== templateName?.AMERITHON && (
          <>
            <Text style={styles.boldText}>
              {`You need to increase your average daily mileage to ${
                !loading && goalsData?.mileage_required_per_day > 0
                  ? goalsData?.mileage_required_per_day
                  : '0'
              } miles per day to reach your goal at the end of year.`}
            </Text>
            <CustomHorizontalLine customStyle={styles.lineSpacing} />
            <Text style={styles.text}>
              Run The Year your way! Pick a goal that is right for you!
            </Text>
          </>
        )} */}
        {rtyPoints?.length > 0 && (
          <View style={styles.row}>
            <Text
              style={
                styles.heading
              }>{`Mileage goal for ${eventDetail?.name}:`}</Text>
            <View style={styles.pickerWrapper}>
              <CustomDDPicker
                list={rtyPoints?.map(item => {
                  return {label: item, value: item};
                })}
                ddCustomStyle={styles.ddHeight}
                initiallySelectedValue={initiallySelectedValue}
                onSelectItem={onSelectItem}
              />
            </View>
          </View>
        )}

        <Text style={styles.boldText}>
          The default settings of RTY only include miles accumulated on your
          feet, such as running, walking, stepping, etc{' '}
        </Text>
        <Text style={[styles.boldText, {marginTop: 20}]}>
          You can add extra miles here, by flipping each switch:
        </Text>
        <CustomToggleSwitch
          isOn={bikeEnable}
          onToggle={() => {
            toggleExtraMiles('bike', !bikeEnable);
          }}
          label="I want my biking miles to be included in my totals"
          onColor={colors.lightBlue}
          offColor="grey"
          labelStyle={{
            fontSize: moderateScale(14),
            fontWeight: '700',
            maxWidth: '80%',
          }}
        />
        <CustomToggleSwitch
          isOn={swimEnable}
          onToggle={() => {
            toggleExtraMiles('swim', !swimEnable);
          }}
          label="I want my swimming miles to be included in my totals"
          onColor={colors.lightBlue}
          offColor="grey"
          labelStyle={{
            fontSize: moderateScale(14),
            fontWeight: '700',
            maxWidth: '80%',
          }}
        />
        <CustomToggleSwitch
          isOn={otherEnable}
          onToggle={() => {
            toggleExtraMiles('other', !otherEnable);
          }}
          label="I want my other miles to be included in my totals"
          onColor={colors.lightBlue}
          offColor="grey"
          labelStyle={{
            fontSize: moderateScale(14),
            fontWeight: '700',
            maxWidth: '80%',
          }}
        />
        <CustomHorizontalLine customStyle={styles.lineSpacing} />
      </>
    </View>
  );
};

export default RtyGoalsForm;

const styles = StyleSheet.create({
  firstContainer: {
    backgroundColor: colors.white,
    paddingTop: moderateScale(20),
    borderRadius: moderateScale(25),
    marginBottom: moderateScale(20),
    paddingBottom: moderateScale(150),
    marginHorizontal: moderateScale(10),
    paddingHorizontal: moderateScale(15),
    flexGrow: 1,
  },
  headerText: {
    fontWeight: '800',
    textAlign: 'center',
    color: colors.primaryGrey,
    fontSize: moderateScale(16),
    marginTop: moderateScale(10),
  },
  text: {
    fontWeight: '400',
    color: colors.primaryGrey,
    fontSize: moderateScale(14),
  },
  textWithMargin: {
    fontWeight: '400',
    color: colors.primaryGrey,
    fontSize: moderateScale(14),
    marginTop: moderateScale(20),
  },
  boldText: {
    fontWeight: 'bold',
    color: colors.primaryGrey,
    fontSize: moderateScale(14),
    marginTop: moderateScale(30),
  },
  boldText2: {
    fontWeight: 'bold',
    color: colors.primaryGrey,
    fontSize: moderateScale(14),
    marginTop: moderateScale(20),
  },
  lineSpacing: {
    zIndex: -1,
    marginTop: moderateScale(20),
    marginBottom: moderateScale(20),
  },
  row: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: moderateScale(30),
    justifyContent: 'space-between',
  },
  heading: {
    fontWeight: '700',
    width: moderateScale(175),
    color: colors.headerBlack,
    fontSize: moderateScale(14),
  },
  pickerWrapper: {width: moderateScale(140), flex: 1},
  ddHeight: {maxHeight: moderateScale(130)},
});
