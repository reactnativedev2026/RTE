import {Dimensions, Platform} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';
export const WINDOW_WIDTH = Dimensions.get('window').width;
export const WINDOW_HEIGHT = Dimensions.get('window').height;
export const SCREEN_HEIGHT = Dimensions.get('screen').height;
export const SCREEN_WIDTH = Dimensions.get('screen').width;
const guidelineBaseWidth = 375; // change this based upon the designs given
const guidelineBaseHeight = 812; // change this based upon the designs given

export const scaleFont = size => (WINDOW_WIDTH / guidelineBaseWidth) * size;

export const moderateScale = (size, factor = 0.5) =>
  size + (scaleFont(size) - size) * factor;

export const ms = moderateScale;
export const RF = moderateScale;

export const verticalScale = size =>
  (WINDOW_HEIGHT / guidelineBaseHeight) * size;

export const vs = verticalScale;
export const ANDROID = Platform.OS === 'android';
export const IOS = Platform.OS === 'ios';

export {RFValue};

export const defaultDimensions = {
  windowWidth: WINDOW_WIDTH,
  windowHeight: WINDOW_HEIGHT,
  screenwidth: SCREEN_WIDTH,
  screenheight: SCREEN_HEIGHT,
  smallPadding: moderateScale(10),
  basePadding: moderateScale(20),
  smallMargin: moderateScale(10),
  baseMargin: moderateScale(20),
  buttonHeight: moderateScale(48),
  PLATFORMS: {
    ANDROID,
    IOS,
  },
};
