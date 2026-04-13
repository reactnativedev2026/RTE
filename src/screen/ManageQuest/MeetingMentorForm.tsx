import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScrollView } from 'react-native-virtualized-view';
import { CustomButtonWithIcon, CustomQuestDescription } from '../../components';
import { store } from '../../core/store';
import { colors } from '../../utils';
import { getCompleteWDate, getTwoWeeksLaterDate } from '../../utils/dateFormats';
import { moderateScale } from '../../utils/metrics';

interface MeetingMentorFormProps {
  questItem?: any;
  manageQuest?: any;
  onPressAdd?: () => void;
  onPressDelete?: () => void;
  onPressMoveToHistory?: (val: any) => void;
  onPressClaimLoot?: () => void;
  hideHistory?: boolean | undefined;
  hideClaim?: boolean | undefined;
  hideBoth?: boolean | undefined;
}
const MeetingMentorForm = ({
  questItem,
  onPressAdd,
  onPressDelete,
  onPressMoveToHistory,
  onPressClaimLoot,
  hideHistory,
  hideClaim,
  hideBoth,
  manageQuest,
}: MeetingMentorFormProps) => {
  const timezone = store.getState().loginReducer.user?.time_zone_name;
  return (
    <>
      {questItem?.activity?.name && (
        <Text style={styles.headerText} numberOfLines={5}>
          {questItem?.activity?.name}
        </Text>
      )}
      <ScrollView
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        style={styles.container}>
        {manageQuest?.date && (
          <Text style={styles.date}>{getCompleteWDate(manageQuest?.date)}</Text>
        )}
        {questItem?.activity?.total_points && (
          <Text style={styles.date}>
            {questItem?.activity?.total_points + ' Miles'}
          </Text>
        )}

        <CustomQuestDescription
          description={questItem?.activity?.description}
        />
        <View style={styles.buttonsContainer}>
          <CustomButtonWithIcon
            iconName={'EditIcon'}
            label={'Add Notes/Photo'}
            onPress={onPressAdd}
          />

          {/* {!hideClaim && (
            <CustomButtonWithIcon
              label={'Claim Loot'}
              onPress={onPressClaimLoot}
              customStyle={styles.loot}
            />
          )} */}
          {!hideHistory && (
            <CustomButtonWithIcon
              iconName={'ClockIcon'}
              label={'Move to History'}
              onPress={() => onPressMoveToHistory(questItem?.id)}
            />
          ) }

          {!questItem?.is_past && (
            <CustomButtonWithIcon
              iconName={'Calander'}
              label={'Change Day'}
              onPress={onPressAdd}
              iconWidth={15}
            />
          )}

          <CustomButtonWithIcon
            iconName={'DeleteIcon'}
            label={'Delete Quest'}
            customStyle={styles.delete}
            onPress={onPressDelete}
          />
        </View>
        {!hideBoth && (
          <Text style={styles.footerText}>
            {!questItem?.is_completed
              ? 'If you need to reschedule a quest, you will need to delete the quest first and then schedule a new.'
              : `Your bard will automatically move this quest into your Quest History on ${getTwoWeeksLaterDate(
                  questItem?.date,
                  timezone,
                )}.`}
          </Text>
        )}
      </ScrollView>
    </>
  );
};
export default MeetingMentorForm;

const styles = StyleSheet.create({
  headerText: {
    fontWeight: '800',
    textAlign: 'center',
    color: colors.headerBlack,
    fontSize: moderateScale(16),
    marginTop: moderateScale(20),
  },
  container: {marginTop: moderateScale(25)},
  date: {
    fontWeight: '500',
    textAlign: 'center',
    color: colors.primaryGrey,
    fontSize: moderateScale(14),
  },
  footerText: {
    fontWeight: '400',
    color: colors.primaryGrey,
    fontSize: moderateScale(14),
    paddingBottom: moderateScale(25),
  },
  buttonsContainer: {
    flex: 1,
    flexWrap: 'wrap',
    flexDirection: 'row',
    marginTop: moderateScale(25),
    justifyContent: 'space-between',
  },
  delete: {backgroundColor: colors.primaryGrey, minWidth: moderateScale(140)},
  loot: {backgroundColor: colors.primaryYellow, minWidth: moderateScale(140)},
});
