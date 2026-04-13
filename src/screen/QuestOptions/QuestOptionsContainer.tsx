import React from 'react';
import {FlatList, Pressable, StyleSheet, Text, View} from 'react-native';
import {useSelector} from 'react-redux';
import {CustomScreenWrapper} from '../../components';
import {RootState} from '../../core/store';
import {colors, images} from '../../utils';
import {questOptions} from '../../utils/dummyData';
import {moderateScale} from '../../utils/metrics';
import {navigate} from '../../services/NavigationService';
import {useEventData} from '../../hooks';

interface QuestOptionsContainerProps {}
const QuestOptionsContainer = ({}: QuestOptionsContainerProps) => {
  const {fetchEventData} = useEventData();

  const {user} = useSelector((state: RootState) => state.loginReducer);

  const renderItem = ({item}) => {
    const Icon = images[item?.iconName || 'Menu'];
    return (
      <Pressable
        key={item?.toString()}
        style={styles.itemContainer}
        onPress={() => {
          navigate(item?.routeName);
        }}>
        <Icon
          style={{top: 5}}
          width={moderateScale(24)}
          height={moderateScale(24)}
        />
        <View style={styles.textWrapper}>
          <Text style={styles.textStyle}>{item?.value}</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <CustomScreenWrapper onRefresh={fetchEventData}>
      <View style={styles.firstContainer}>
        <Text style={styles.headerText}>{`${
          user?.display_name || user?.name
        }'s Quests`}</Text>

        <FlatList
          scrollEnabled={false}
          data={questOptions}
          renderItem={renderItem}
          numColumns={3}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.contentContainer}
          style={styles.flatList}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
    </CustomScreenWrapper>
  );
};
export default QuestOptionsContainer;

const styles = StyleSheet.create({
  firstContainer: {
    backgroundColor: colors.white,
    paddingTop: moderateScale(40),
    marginHorizontal: moderateScale(10),
    borderRadius: moderateScale(25),
    paddingHorizontal: moderateScale(15),
    paddingBottom: moderateScale(130),
    marginBottom: moderateScale(20),
  },
  headerText: {
    fontSize: moderateScale(16),
    fontWeight: '800',
    color: colors.primaryGrey,
    textAlign: 'center',
    marginTop: moderateScale(10),
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingVertical: moderateScale(5),
    alignSelf: 'center',
    gap: moderateScale(10),
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  flatList: {
    flex: 1,
  },
  itemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: moderateScale(12),
    width: moderateScale(100),
    borderWidth: 1,
    borderColor: 'rgba(247, 247, 247, 1)',
    borderRadius: 5,
    height: moderateScale(100),
  },
  textStyle: {
    color: colors.headerBlack,
    fontSize: moderateScale(14),
    fontWeight: '500',
    marginTop: moderateScale(10),
    textAlign: 'center',
  },
  textWrapper: {
    height: moderateScale(45),
    justifyContent: 'center',
    alignItems: 'center',
  },
});
