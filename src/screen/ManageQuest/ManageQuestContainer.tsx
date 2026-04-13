import React, {memo, useEffect, useMemo} from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  CustomQuestHeader,
  CustomQuestList,
  CustomScreenWrapper,
} from '../../components';
import {colors} from '../../utils';
import {moderateScale} from '../../utils/metrics';
import {Routes} from '../../utils/Routes';
import {useLazyGetManageQuestQuery} from '../../services/quest.api';
import {useSelector} from 'react-redux';
import {RootState} from '../../core/store';
import {navigate} from '../../services/NavigationService';

interface ListHeaderProps {}

const ListHeader = memo(({}: ListHeaderProps) => {
  return (
    <View>
      <Text style={styles.details}>
        {
          'Two weeks after the date of completion, your bard will automatically move your completed quests into your Quest History.\n\nIf you need to reschedule a quest, you will need to delete the quest first and then schedule a new.'
        }
      </Text>
    </View>
  );
});

interface ManageQuestContainerProps {}

const ManageQuestContainer = ({}: ManageQuestContainerProps) => {
  const {eventDetail} = useSelector((state: RootState) => state.loginReducer);
  const getQuestObj = {event_id: eventDetail?.id, list_type: 'all'};

  const [getQuestList, {isFetching: questIsFetching, data}] =
    useLazyGetManageQuestQuery();

  useEffect(() => {
    getQuestList(getQuestObj).unwrap();
  }, []);

  const ListFooterComponent = useMemo(() => {
    if (questIsFetching) {
      return (
        <ActivityIndicator
          size="small"
          color={colors.primaryGrey}
          style={styles.loadingIndicator}
        />
      );
    }
    return null;
  }, [questIsFetching]);

  const ListEmptyComponent = useMemo(() => {
    if (!questIsFetching) {
      return <Text style={styles.textDescription}>No Quest Found!</Text>;
    }
    return null;
  }, [questIsFetching]);
  const onRefresh = () => {
    getQuestList(getQuestObj).unwrap();
  };
  return (
    <CustomScreenWrapper removeScroll>
      <View style={styles.firstContainer}>
        <CustomQuestHeader onPressBack={() => navigate(Routes.QUEST_OPTIONS)} />
        <Text style={styles.headerText}>{'Manage Your Quests'}</Text>
        <FlatList
          refreshControl={
            <RefreshControl
              refreshing={questIsFetching}
              onRefresh={onRefresh}
            />
          }
          showsVerticalScrollIndicator={false}
          style={styles.container}
          data={data?.data?.data}
          renderItem={({item}) => {
            return (
              <CustomQuestList
                item={item}
                showCompleted={true}
                initialRoute={Routes.MANAGE_QUEST}
              />
            );
          }}
          keyExtractor={(_, index) => index.toString()}
          ListHeaderComponent={ListHeader}
          // onEndReached={handleOnEndReached}
          // ListFooterComponent={ListFooterComponent}
          ListEmptyComponent={ListEmptyComponent}
        />
      </View>
    </CustomScreenWrapper>
  );
};

export default ManageQuestContainer;

const styles = StyleSheet.create({
  firstContainer: {
    flex: 1,
    backgroundColor: colors.white,
    paddingTop: moderateScale(20),
    marginHorizontal: moderateScale(10),
    borderRadius: moderateScale(25),
    paddingHorizontal: moderateScale(25),
    paddingBottom: moderateScale(40),
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
  details: {
    fontSize: moderateScale(14),
    fontWeight: '400',
    color: colors.primaryGrey,
    paddingBottom: moderateScale(25),
  },

  loadingIndicator: {
    paddingVertical: moderateScale(10),
  },
  textDescription: {
    fontSize: moderateScale(14),
    fontWeight: '400',
    color: colors.primaryGrey,
    paddingTop: moderateScale(10),
    paddingBottom: moderateScale(20),
    textAlign: 'center',
  },
});
