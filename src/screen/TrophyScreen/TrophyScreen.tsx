import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { useSelector } from 'react-redux';
import { CustomScreenWrapper } from '../../components';
import CustomImageMoal from '../../components/CustomImageModel';
import CustomToggle from '../../components/CustomToggle';
import { RootState } from '../../core/store';
import useCustomHomeWrapper from '../../hooks/useCustomHomeWrapper';
import { useLazyGetTrophyCasesQuery } from '../../services/quest.api';
import { colors, images } from '../../utils';
import { templateName } from '../../utils/helpers';
import { moderateScale } from '../../utils/metrics';

const ImageWithLoader = ({item, uri, style, isHero}) => {
  const [loading, setLoading] = useState(true);

  return (
    <View style={[style, {justifyContent: 'center', alignItems: 'center'}]}>
      {loading && (
        <ActivityIndicator
          size="small"
          color="#999"
          style={{position: 'absolute', zIndex: 1}}
        />
      )}

      <FastImage
        source={{
          uri: !isHero
            ? uri
            : item?.is_achieved
            ? item?.images?.bib_image
            : item?.images?.bib_image_bw,
          priority: FastImage.priority.normal,
          cache: FastImage.cacheControl.immutable,
        }}
        style={[style, {position: 'absolute'}]}
        resizeMode={FastImage.resizeMode.contain}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => setLoading(false)}
      />
    </View>
  );
};

const TrophyScreen = () => {
  const {user, eventDetail} = useSelector(
    (state: RootState) => state.loginReducer,
  );

  const {teamAchievementsData} = useCustomHomeWrapper({});

  const [videoModalVisible, setVideoModalVisible] = React.useState(false);
  const [isTeam, setIsTeam] = React.useState(false);
  const [questList, setQuestlist] = React.useState([]);
  const [selectedQuest, setSelectedQuest] = React.useState([]);
  const [getTrophyCases, {isFetching}] = useLazyGetTrophyCasesQuery()

  React.useEffect(() => {
    // getTrophy();
    getTrophyCasesLocal();
  }, []);

  useEffect(() => {
    getTrophyCasesLocal();
  }, [isTeam]);

  const getTrophyCasesLocal = () => {
    getTrophyCases({
      event_id: eventDetail.id,
      team_bib: isTeam,
    })
      .unwrap()
      .then(res => {
        setQuestlist(res?.data);
      })
      .catch(err => console.log('error', err));
  };

  return (
    <CustomScreenWrapper
      onRefresh={getTrophyCasesLocal}
      loadingIndicator={isFetching}
      // isTeam={isTeam}
      // teamAchievementsData={teamAchievementsData}
    >
      <View style={styles.firstContainer}>
        <Text style={styles.headingBottom}>
          {eventDetail?.template === templateName?.HEROS_JOURNEY
            ? 'Armory'
            : 'Trophy Case'}
        </Text>
        {eventDetail?.template !== templateName?.HEROS_JOURNEY && (
          <View style={styles.toggle}>
            <CustomToggle setIsTeam={setIsTeam} isTeam={isTeam} />
          </View>
        )}
        <FlatList
          data={questList}
          numColumns={3}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.contentContainer}
          style={styles.flatList}
          renderItem={({item}) => (
            <Pressable
              onPress={() => {
                if (item?.is_achieved) {
                  setSelectedQuest(item);
                  setTimeout(() => {
                    setVideoModalVisible(true);
                  }, 200);
                }
              }}
              style={[styles.containImage]}>
              <ImageWithLoader
                item={item}
                uri={item?.images?.bib_image}
                style={styles.image}
                isHero={eventDetail?.template === templateName?.HEROS_JOURNEY}
              />

              {!item?.is_achieved &&
                eventDetail?.template !== templateName?.HEROS_JOURNEY && (
                  <ImageBackground style={styles.lockOpactity}>
                    <images.LockIcon
                      height={moderateScale(30)}
                      width={moderateScale(30)}
                      stroke={'#FFF'}
                      color={'#FFF'}
                    />
                  </ImageBackground>
                )}
            </Pressable>
          )}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={{alignItems: 'center', marginTop: 20}}>
              {!isFetching && (
                <Text>
                  {eventDetail?.template === templateName?.HEROS_JOURNEY
                    ? 'No Armory '
                    : 'No Trophy'}
                </Text>
              )}
            </View>
          )}
        />
      </View>

      {videoModalVisible && (
        <CustomImageMoal
          modalVisible={videoModalVisible}
          setModalVisible={setVideoModalVisible}
          type="image"
          imageUri={selectedQuest?.images?.bib_image}
        />
      )}
    </CustomScreenWrapper>
  );
};

export default TrophyScreen;

const styles = StyleSheet.create({
  firstContainer: {
    backgroundColor: colors.white,
    paddingTop: moderateScale(30),
    marginHorizontal: moderateScale(10),
    borderRadius: moderateScale(25),
    paddingBottom: moderateScale(20),
    marginBottom: moderateScale(20),
  },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: moderateScale(10),
    marginTop: moderateScale(10),
    alignSelf: 'center',
  },

  columnWrapper: {
    justifyContent: 'space-between',
    padding: moderateScale(12),
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  flatList: {
    flex: 1,
  },
  containImage: {
    alignItems: 'center',
    justifyContent: 'center',
    width: moderateScale(110),
    height: moderateScale(110),
    borderRadius: 5,
  },
  image: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    height: moderateScale(100),
    width: moderateScale(100),
  },
  headingBottom: {
    color: '#888888',
    fontSize: moderateScale(16),
    fontWeight: '400',
    marginTop: moderateScale(20),
    alignSelf: 'center',
  },
  lockOpactity: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    width: moderateScale(110),
    height: moderateScale(110),
    borderRadius: 5,
  },
});
