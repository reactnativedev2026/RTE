import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useSelector } from 'react-redux';
import { CustomAlert, CustomHeader, CustomScreenLoader } from '../../components';
import MultipleTapsPress from '../../components/MultipleTapsPress';
import { RootState } from '../../core/store';
import { useLazyGetTutorialsQuery } from '../../services/setting.api';
import { colors, images } from '../../utils';
import { moderateScale } from '../../utils/metrics';
import VideoPlay from './VideoPlay';

interface TutorialsContainerProps {}
const TutorialsContainer = ({}: TutorialsContainerProps) => {
  const [tutorial, setTutorial] = React.useState({
    modal: false,
    selectedVideo: '',
    loading: true,
  });
  const {user} = useSelector((state: RootState) => state.loginReducer);
  const [videos, setVideos] = React.useState([]);

  const [getTutorial] = useLazyGetTutorialsQuery();

  React.useEffect(() => {
    getTutorial({event_id: user?.preferred_event_id})
      .unwrap()
      .then(res => {
        prepareVideoList({data: res});
      });
  }, []);

  const prepareVideoList = async ({data}) => {
    try {
      const raw = data?.data?.[0]?.tutorial_text;
      if (!raw) {
        CustomAlert({
          type: 'error',
          message: 'Videos are not available for this event.',
        });
        setTutorial({loading: false, modal: false, selectedVideo: ''});
        return;
      }
      const parsed = JSON.parse(raw);
      const validItems = parsed?.filter(item => item?.url);
      const fetchedVideos = await Promise.all(
        validItems.map(async item => {
          try {
            const res = await fetch(
              `https://vimeo.com/api/oembed.json?url=${item.url}`,
            );
            const json = await res.json();
            return {
              ...item,
              thumb: item.thumb || json?.thumbnail_url || null,
            };
          } catch (error) {
            console.error(
              `Error fetching thumbnail for ${item.url}: ${error.message}`,
            );
            return item; // fallback to item without thumb
          }
        }),
      );

      setVideos(fetchedVideos);
      setTutorial({loading: false, modal: false, selectedVideo: ''});
    } catch (err) {
      console.error('Tutorial parsing error:', err.message);
    }
  };

  const handlePress = url => {
    setTutorial({loading: true, modal: false, selectedVideo: url});
    setTimeout(() => {
      setTutorial({loading: true, modal: true, selectedVideo: url});
    }, 300);
  };
  return (
    <>
      {tutorial?.loading && (
        <View style={styles.loader}>
          <CustomScreenLoader />
        </View>
      )}
      <View style={styles.main}>
        <View style={styles.header}>
          <CustomHeader hideEditBtn={true} />
          <images.RunEdge style={styles.logo} />
        </View>
        <FlatList
          style={styles.flatlist}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          data={videos}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item, index}) => {
            return (
              <MultipleTapsPress
                key={index}
                style={styles.item}
                onPress={() => handlePress(item?.url)}>
                <FastImage
                  testID={index?.toString()}
                  source={{uri: item?.thumb}}
                  style={styles.image}>
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: colors.videoOpacity,
                      justifyContent: 'center',
                    }}>
                    <AntDesign
                      style={{alignSelf: 'center'}}
                      color={colors.headerEdge}
                      size={45}
                      name="play"
                    />
                  </View>
                </FastImage>
                <View style={styles.titleContainer}>
                  <Text style={styles.title}>{item?.title}</Text>
                </View>
              </MultipleTapsPress>
            );
          }}
        />
      </View>
      {tutorial?.modal && (
        <VideoPlay
          videoItem={tutorial?.selectedVideo}
          onLoadEnd={() => setTutorial({...tutorial, loading: false})}
          onClosePress={() =>
            setTutorial({loading: false, modal: false, selectedVideo: ''})
          }
        />
      )}
    </>
  );
};
export default TutorialsContainer;

const styles = StyleSheet.create({
  main: {backgroundColor: colors.white, flex: 1},
  header: {
    paddingVertical: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.headerBlack,
    paddingHorizontal: moderateScale(15),
  },
  logo: {alignSelf: 'center', paddingTop: moderateScale(15)},
  flatlist: {flex: 1, backgroundColor: colors.white},
  content: {paddingBottom: moderateScale(40)},
  item: {marginTop: moderateScale(20), alignItems: 'center'},
  image: {
    width: moderateScale(320),
    height: moderateScale(180),
    justifyContent: 'center',
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    borderWidth: 0.5,
    borderBottomWidth: 0,
  },
  titleContainer: {
    width: moderateScale(320),
    justifyContent: 'center',
    height: moderateScale(60),
    paddingVertical: moderateScale(10),
    borderBottomLeftRadius: moderateScale(20),
    borderBottomRightRadius: moderateScale(20),
    borderWidth: 0.5,
    borderTopWidth: 0,
    backgroundColor: 'rgba(205, 209, 228,0.8)',
  },
  title: {
    fontWeight: '400',
    textAlign: 'center',
    color: colors.headerBlack,
    fontSize: moderateScale(14),
    marginHorizontal: 10,
  },
  loader: {
    top: 0,
    flex: 1,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    position: 'absolute',
    backgroundColor: colors.loaderOpacity,
  },
});
