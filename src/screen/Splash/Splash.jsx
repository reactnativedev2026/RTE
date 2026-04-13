import React from 'react';
import {
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useSelector} from 'react-redux';
import {navigate} from '../../services/NavigationService';
import {Routes} from '../../utils/Routes';
import {colors} from '../../utils/colors';
import {fonts} from '../../utils/fonts';
import images from '../../utils/images';
import {
  moderateScale,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  WINDOW_HEIGHT,
  WINDOW_WIDTH,
} from '../../utils/metrics';

const Splash = () => {
  const {token} = useSelector(state => state.loginReducer);
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      if (token) {
        navigate(Routes.PUBLIC_NAVIGATOR);
      }
      // else {
      //   navigate(Routes.LOGIN);
      // }
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  const NavigateToLogin = () => {
    navigate(Routes.LOGIN);
  };

  return (
    <ImageBackground
      source={images.AppBg}
      style={{
        height: SCREEN_HEIGHT,
        width: SCREEN_WIDTH,
      }}>
      <View style={styles.flex}>
        <View style={styles.activeImageContainer}>
          <Image
            source={require('../../assets/MyActiveLife.png')}
            style={styles.activeImage}
          />
          <Text style={styles.title}>Select a challenge to login.</Text>
        </View>
        <View style={styles.margin} />
        <Pressable style={styles.btn} onPress={NavigateToLogin}>
          <View style={[styles.rounderContainer]}>
            <Image
              source={require('../../assets/RunEdge.png')}
              style={styles.bannerImage}
            />
          </View>
          <images.PlayIcon
            fill={colors.green}
            height={moderateScale(34)}
            width={moderateScale(34)}
          />
        </Pressable>
        <Pressable style={styles.btn} onPress={NavigateToLogin}>
          <View style={[styles.rounderContainer]}>
            <Image
              source={require('../../assets/YMCA.png')}
              style={styles.logo}
            />
          </View>
          <images.PlayIcon
            height={moderateScale(34)}
            width={moderateScale(34)}
          />
        </Pressable>
      </View>
    </ImageBackground>
  );
};

export default Splash;

const styles = StyleSheet.create({
  logo: {
    height: moderateScale(40),
    width: moderateScale(50),
    marginTop: moderateScale(10),
    alignItems: 'center',
    alignSelf: 'center',
  },
  bannerImage: {
    marginVertical: moderateScale(10),
    height: moderateScale(40),
    width: moderateScale(210),
  },
  title: {
    fontSize: moderateScale(18),
    fontFamily: fonts.Regular,
    paddingHorizontal: moderateScale(20),
    textAlign: 'center',
    color: colors.blue,
    marginTop: moderateScale(20),
    marginBottom: moderateScale(30),
  },

  backgroundImage: {
    resizeMode: 'cover',
    position: 'absolute',
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
  },
  rounderContainer: {
    alignSelf: 'center',
    width: moderateScale(300),
    height: moderateScale(60),
    backgroundColor: 'white',
    borderBottomLeftRadius: moderateScale(50),
    borderTopRightRadius: moderateScale(50),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: moderateScale(2)},
    shadowOpacity: moderateScale(0.3),
    shadowRadius: moderateScale(4),
    elevation: moderateScale(5),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: moderateScale(20),
  },
  flex: {
    flex: 1,
  },
  activeImageContainer: {
    height: moderateScale(350),
    backgroundColor: colors.white,
    borderBottomRightRadius: moderateScale(50),
    borderBottomLeftRadius: moderateScale(50),
    justifyContent: 'flex-end',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: moderateScale(0.3),
    shadowRadius: moderateScale(4),
    elevation: moderateScale(5),
  },
  activeImage: {height: moderateScale(131), width: moderateScale(356)},
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: moderateScale(20),
  },
  margin: {
    marginTop: moderateScale(30),
  },
});
