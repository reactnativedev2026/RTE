import {StyleSheet} from 'react-native';
import {colors} from '../../../utils/colors';
import {fonts} from '../../../utils/fonts';
import {moderateScale} from '../../../utils/metrics';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  backgroundImage: {
    resizeMode: 'cover',
  },
  textContainer: {
    marginVertical: 30,
    alignItems: 'center',
  },
  bannerImage: {
    height: moderateScale(250),
    width: moderateScale(231),
  },
  formContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderTopRightRadius: 50,
    borderTopLeftRadius: 50,
    borderBottomLeftRadius: 50,
    width: '100%',
    alignSelf: 'center',
    opacity: 10,
    shadowOpacity: 0.1,
  },
  inputContainer: {
    borderWidth: 2,
    borderColor: '#EDEDED',
    borderRadius: 100,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 2,
    marginTop: 10,
    height: 50,
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 10,
    fontFamily: fonts.Light,
    color: 'black',
  },
  forgotPasswordText: {
    textAlign: 'right',
    color: 'rgba(15, 109, 182, 1)',
    fontFamily: fonts.Light,
    marginTop: 30,
    fontSize: 12,
    fontWeight: 'bold',
  },
  loginButtonWrapper: {
    backgroundColor: colors.primaryBlue,
    borderRadius: 100,
    paddingHorizontal: 20,
    height: 45,
  },
  loginContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  loginText: {
    color: colors.white,
    fontSize: 18,
    fontFamily: fonts.Regular,
    textAlign: 'center',
    flex: 1,
  },
  loginIcon: {
    marginLeft: 10,
  },
  backToPortalContainer: {
    bottom: 60,
    marginLeft: 20,
    display: 'flex',
    flexDirection: 'row',
    gap: 5,
  },
  errorText: {
    color: 'red',
    paddingHorizontal: 15,
  },
  icon: {
    paddingHorizontal: 10,
  },
  tContainer: {
    borderRadius: 10,
    marginVertical: 10,
    alignItems: 'center',
  },
  text: {
    fontSize: 14,
    color: colors.primaryGrey,
    textAlign: 'center',
  },
  link: {
    color: 'rgba(15, 109, 182, 1)',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

export default styles;
