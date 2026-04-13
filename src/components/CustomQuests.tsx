import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {colors} from '../utils';
import {moderateScale} from '../utils/metrics';
import {Routes} from '../utils/Routes';
import CustomQuestList from './CustomQuestList';

interface CustomQuestsProps {
  questData?: any;
  loading?: boolean;
}

const CustomQuests = ({questData, loading}: CustomQuestsProps) => {
  const navigation = useNavigation();
  if (loading) {
    return (
      <View style={[styles.container]}>
        <ActivityIndicator
          color={colors.primaryGrey}
          size={'small'}
          style={{marginVertical: moderateScale(20)}}
        />
      </View>
    );
  }
  return (
    <View style={styles.targetContainer}>
      <Text style={styles.targetHeaderText}>Scheduled Quests</Text>

      <ScrollView
        nestedScrollEnabled
        style={styles.scrollContainer}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {questData?.length > 0 ? (
          questData?.map(item => (
            <CustomQuestList
              key={item?.date}
              item={item}
              initialRoute={Routes.HOME}
            />
          ))
        ) : (
          <Text style={styles.description}>
            No quests scheduled, click below to schedule a quest!
          </Text>
        )}
      </ScrollView>

      <View style={styles.row}>
        {questData.length > 0 && (
          <TouchableOpacity
            style={styles.editGoalBtn}
            onPress={() => {
              navigation.navigate(Routes.QUEST_STACK, {
                screen: Routes.MANAGE_QUEST,
              });
            }}>
            <Text style={styles.editGoalTxt}>Manage Quest</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.editGoalBtn}
          onPress={() => {
            navigation.navigate(Routes.QUEST_STACK, {
              screen: Routes.SCHEDULE_QUEST,
            });
          }}>
          <Text style={styles.editGoalTxt}>Schedule Quest</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CustomQuests;

const styles = StyleSheet.create({
  targetContainer: {
    marginHorizontal: moderateScale(10),
    backgroundColor: colors.white,
    padding: moderateScale(20),
    borderRadius: moderateScale(30),
    marginBottom: moderateScale(20),
    flex: 1,
    maxHeight: moderateScale(370),
  },
  container: {
    flex: 1,
    marginHorizontal: moderateScale(10),
    backgroundColor: colors.white,
    padding: moderateScale(10),
    borderRadius: moderateScale(30),
    marginBottom: moderateScale(20),
    paddingBottom: moderateScale(20),
  },
  content: {
    paddingTop: moderateScale(10),
  },
  targetHeaderText: {
    fontSize: moderateScale(16),
    fontWeight: 'bold',
    color: 'black',
    marginTop: moderateScale(5),
    textAlign: 'center',
  },
  description: {
    fontSize: moderateScale(13),
    fontWeight: '400',
    color: colors.primaryGrey,
    marginTop: moderateScale(20),
    width: '100%',
    textAlign: 'center',
  },
  scrollContainer: {
    maxHeight: '75%',
    marginTop: moderateScale(10),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: moderateScale(20),
  },
  editGoalBtn: {
    paddingHorizontal: moderateScale(20),
    paddingVertical: moderateScale(10),
    backgroundColor: colors.primaryBrown,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editGoalTxt: {
    color: colors.white,
  },
});
