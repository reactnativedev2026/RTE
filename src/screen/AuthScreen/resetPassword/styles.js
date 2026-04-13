import {StyleSheet} from 'react-native';
import {colors} from '../../../utils/colors';
import {fonts} from '../../../utils/fonts';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  backgroundImage: {
    resizeMode: 'cover',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
  },
  textContainer: {
    marginVertical: 100,
    display: 'flex',
    alignItems: 'center',
  },
  bannerImage: {
    marginVertical: 20,
    height: 250,
    width: 231,
  },
  formContainer: {
    marginTop: 20,
    backgroundColor: 'white',
    padding: 20,
    borderTopRightRadius: 50,
    borderTopLeftRadius: 50,
    borderBottomLeftRadius: 50,
    bottom: 80,
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
    marginVertical: 10,
    height: 50,
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 10,
    fontFamily: fonts.Light,
  },
  forgotPasswordText: {
    textAlign: 'right',
    color: '#00526E',
    fontFamily: fonts.Light,
    marginVertical: 20,
    fontSize: 12,
  },
  loginButtonWrapper: {
    backgroundColor: '#00967C',
    borderRadius: 100,
    marginTop: 20,
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
    marginTop: -5,
  },
  icon: {
    paddingHorizontal: 10,
  },
});

export default styles;
