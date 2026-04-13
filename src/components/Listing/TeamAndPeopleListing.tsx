import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {getPeopleFollowStatus} from '../../screen/Teams/helper';
import {colors} from '../../utils';
import {moderateScale} from '../../utils/metrics';

const TeamAndPeopleListing = ({item, onPress, team, customText, requested}) => {
  return (
    <View style={styles.listContainer} key={item?.toString()}>
      <View style={styles.listView}>
        <View>
          <Text numberOfLines={1} style={styles.questTitle}>
            {team ? item?.name : item?.display_name}
          </Text>
          {requested && (
            <Text style={{color: colors.darkBlue, fontSize: 12}}>
              Requested
            </Text>
          )}
          <Text />
        </View>
        <View style={styles.customRow}>
          {!item?.public_profile && (
            <Feather name={'lock'} size={18} color={colors.darkPurple} />
          )}
          <TouchableOpacity style={styles.button} onPress={onPress}>
            <Text style={styles.editGoalTxt}>
              {customText
                ? customText
                : getPeopleFollowStatus(
                    team ? item?.follow_status : item?.following_status,
                  )}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default TeamAndPeopleListing;
const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
    marginTop: 10,
    marginBottom: 10,
    alignItems: 'center',
    flexDirection: 'row',
  },
  listView: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: moderateScale(6.5),
    borderBottomLeftRadius: moderateScale(20),
    borderBottomRightRadius: moderateScale(20),
  },
  questTitle: {
    // flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.headerBlack,
  },
  customRow: {
    gap: 5,
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
  },
  button: {
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: moderateScale(125),
    backgroundColor: colors.lightGrey,
    paddingVertical: moderateScale(10),
    paddingHorizontal: moderateScale(20),
  },
  editGoalTxt: {color: colors.white, fontWeight: '400'},
});
