import {StyleSheet} from 'react-native';
import {moderateScale, WINDOW_HEIGHT, WINDOW_WIDTH} from '../../utils/metrics';
import {colors} from '../../utils/colors';
import {fonts} from '../../utils/fonts';

export const styles = StyleSheet.create({
  contentContainer: {flexGrow: 1},
  backgroundImage: {height: WINDOW_HEIGHT, width: WINDOW_WIDTH, flex: 1},
  imageStyle: {transform: [{rotate: '180deg'}]},
  imgStyle: {
    height: WINDOW_HEIGHT * 0.4,
    width: WINDOW_WIDTH * 0.9,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  mainView: {
    flex: 1,
    paddingHorizontal: moderateScale(25),
    paddingBottom: moderateScale(10),
  },
  logoImageView: {
    alignItems: 'center',
    alignSelf: 'center',
    flex: 1,
    marginTop: moderateScale(20),
  },
  formContainer: {
    backgroundColor: 'white',
    paddingHorizontal: moderateScale(20),
    paddingTop: moderateScale(20),
    borderTopRightRadius: moderateScale(50),
    borderTopLeftRadius: moderateScale(50),
    borderBottomLeftRadius: moderateScale(50),
    // width: '100%',
    // alignSelf: 'center',
    // opacity: moderateScale(10),
    // shadowOpacity: moderateScale(0.1),
    // height: 370,
  },
  tContainer: {
    borderRadius: moderateScale(10),
    marginVertical: moderateScale(10),
    alignItems: 'center',
  },
  text: {
    fontSize: moderateScale(14),
    color: colors.primaryGrey,
    textAlign: 'center',
    lineHeight: moderateScale(20),
    fontWeight: '400',
  },
  link: {
    color: colors.dodgerBlue,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    fontSize: moderateScale(14),
  },
  loginButtonWrapper: {
    backgroundColor: colors.primaryBlue,
    borderRadius: moderateScale(100),
    marginTop: 10,
  },

  loginContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: moderateScale(10),
  },
  loginText: {
    color: colors.white,
    fontSize: moderateScale(16),
    fontFamily: fonts.Regular,
    fontWeight: '700',
    textAlign: 'center',
    flex: 1,
  },
  loginIcon: {
    marginRight: moderateScale(10),
    position: 'absolute',
    right: moderateScale(10),
  },
  forgotPasswordText: {
    color: 'rgba(15, 109, 182, 1)',
    fontFamily: fonts.Light,
    fontSize: moderateScale(14),
    fontWeight: '700',
  },
  secondaryBtnView: {
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    marginBottom: moderateScale(20),
    marginTop: moderateScale(10),
  },
  forgetPasswordHeaderText: {
    textAlign: 'center',
    marginVertical: moderateScale(10),
    marginTop: moderateScale(10),
    color: colors.primaryGrey,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
  },
});
