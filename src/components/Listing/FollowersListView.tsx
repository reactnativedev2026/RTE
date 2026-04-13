import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';
import {colors, Routes} from '../../utils';
import {getFloatNumber} from '../../utils/helpers';
import {moderateScale} from '../../utils/metrics';

const FollowersListView = ({
  data,
  team,
  loading,
  hideMore,
  onUnfollowBtn = () => {},
  showUnfolloBtn = false,
}) => {
  const {navigate} = useNavigation();

  const renderItem = ({item, index}) => {
    return (
      <View style={styles.renderMain_view}>
        <Text style={styles.itemName}>
          {hideMore
            ? team
              ? item?.user?.display_name
              : item?.display_name
            : item?.display_name || item?.team?.name}
        </Text>
        {/* <GradientProgressBar progress={item?.percentage} /> */}
        <View style={styles.mileage_view}>
          <Text style={styles.miles_txt}>
            {getFloatNumber(
              item?.total_miles || item?.statistics?.distance_completed || 0,
            )}{' '}
            miles
          </Text>
          {/* {team && !hideMore && ( */}
          {showUnfolloBtn && (
            <Pressable
              style={styles.button}
              onPress={() => {
                onUnfollowBtn(item);
              }}>
              <Text style={styles.follow_txt}>Unfollow</Text>
            </Pressable>
          )}
          {/* )} */}
        </View>
      </View>
    );
  };

  return (
    <View style={{flex: 1}}>
      {!loading && (
        <FlatList
          data={data}
          renderItem={renderItem}
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.flatListContentContainer}
          ListEmptyComponent={
            <Text style={styles.emptyList_view}>
              {!hideMore
                ? 'You are not following anyone. Boo-hoo'
                : 'No followers yet'}
            </Text>
          }
        />
      )}
      {!hideMore && (
        <View style={styles.clickHere_view}>
          <TouchableOpacity
            onPress={() => navigate(Routes.FOLLOW, {team: team})}
            activeOpacity={0.8}>
            <Text style={styles.clickHere_txt}>Click Here</Text>
          </TouchableOpacity>
          <Text style={{color: colors.primary}}>{` to find ${
            team ? 'team' : 'people'
          } to follow`}</Text>
        </View>
      )}
    </View>
  );
};

export default FollowersListView;

const styles = StyleSheet.create({
  follow_txt: {
    // paddingBottom: 5,
    fontSize: RFValue(10),
    color: colors.white,
    fontWeight: '400',
    // color: colors.deleteRed,
  },
  renderMain_view: {
    minHeight: 40,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mileage_view: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  miles_txt: {fontSize: RFValue(11)},
  itemName: {flex: 1, fontSize: RFValue(12)},
  emptyList_view: {textAlign: 'center', color: colors.primary},
  clickHere_view: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: moderateScale(10),
  },
  clickHere_txt: {
    fontWeight: '700',
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  flatListContentContainer: {flexGrow: 1},
  button: {
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    height: moderateScale(32),
    width: moderateScale(80),
    backgroundColor: colors.lightGrey,
    marginLeft: 10,
  },
});
