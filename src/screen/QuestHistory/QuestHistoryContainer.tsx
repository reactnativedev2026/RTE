import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {useSelector} from 'react-redux';
import {
  CustomQuestHeader,
  CustomQuestList,
  CustomScreenWrapper,
} from '../../components';
import {RootState} from '../../core/store';
import useGetQuest from '../../hooks/useGetQuest';
import {colors} from '../../utils';
import {moderateScale} from '../../utils/metrics';
import {Routes} from '../../utils/Routes';

interface QuestHistoryContainerProps {}
const QuestHistoryContainer = ({}: QuestHistoryContainerProps) => {
  const {user} = useSelector((state: RootState) => state.loginReducer);
  const [questHistory, setQuestHistory] = useState([]);
  const {questData, questIsFetching} = useGetQuest({
    is_archived: true,
  });

  useEffect(() => {
    const groupBaseArray = questData?.reduce((acc, item) => {
      const group = item?.activity?.group;
      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group]?.push(item);
      return acc;
    }, {});

    // Convert grouped data into the required format
    const dropdownList = Object?.entries(groupBaseArray)?.map(
      ([group, items]) => ({
        group,
        items,
      }),
    );

    setQuestHistory(dropdownList);
  }, [questData]);

  const renderItem = ({group, items}) => {
    return (
      <View>
        <Text style={styles.groupTitle}>{group}</Text>
        <View
          style={{
            paddingBottom: moderateScale(20),
            paddingTop: moderateScale(10),
          }}>
          {items?.map((item: any) => {
            return (
              <CustomQuestList
                item={item}
                initialRoute={Routes.QUEST_HISTORY}
              />
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <CustomScreenWrapper removeScroll loadingIndicator={questIsFetching}>
      <View style={styles.firstContainer}>
        <CustomQuestHeader />
        <Text style={styles.headerText}>{`${
          user?.display_name || user?.name
        }'s Quest History`}</Text>

        <ScrollView
          style={{flex: 1, marginTop: 25}}
          showsVerticalScrollIndicator={false}
          bounces={false}>
          {questHistory?.map(item => {
            return renderItem(item);
          })}
        </ScrollView>
      </View>
    </CustomScreenWrapper>
  );
};
export default QuestHistoryContainer;

const styles = StyleSheet.create({
  firstContainer: {
    flex: 1,
    backgroundColor: colors.white,
    paddingTop: moderateScale(20),
    marginHorizontal: moderateScale(10),
    borderRadius: moderateScale(25),
    paddingHorizontal: moderateScale(25),
    marginBottom: moderateScale(10),
    paddingBottom: moderateScale(5),
  },
  headerText: {
    fontSize: moderateScale(16),
    fontWeight: '800',
    color: colors.primaryGrey,
    textAlign: 'center',
    marginTop: moderateScale(15),
  },
  container: {
    marginTop: moderateScale(25),
  },
  chapter: {
    fontWeight: '700',
    fontSize: moderateScale(16),
    textAlign: 'center',
    color: colors.primaryBrown,
  },
  verticalMargin: {
    marginTop: moderateScale(15),
  },
  groupTitle: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: colors.primaryBrown,
    textAlign: 'center',
  },
});
