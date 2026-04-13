import React from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  Platform,
  Pressable,
  Text,
  View,
  Linking,
  Image,
  Keyboard,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {goBack} from '../../services/NavigationService';
import {colors} from '../../utils/colors';
import {styles} from './styles';
import MultipleTapsPress from '../MultipleTapsPress';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

interface AuthFormProps {
  formType?: string;
  children?: React.ReactNode;
  btnLoading?: boolean;
  onPress?: () => void;
  primaryBtnText?: string;
  secondaryBtnText?: string;
  onPressSecondary?: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({
  formType,
  children,
  btnLoading,
  onPress,
  primaryBtnText,
  secondaryBtnText,
  onPressSecondary,
}) => {
  const scrollRef = React.useRef<any>(null);

  const handleEmailPress = () => {
    const email = 'info@runtheedge.com';
    Linking.openURL(`mailto:${email}`);
  };
  React.useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setTimeout(() => {
        scrollRef?.current?.scrollTo({y: 200, animated: true});
      }, 300);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      scrollRef?.current?.scrollTo({y: 0, animated: true});
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);
  return (
    <ImageBackground
      source={require('../../assets/background.png')}
      style={styles.backgroundImage}
      imageStyle={styles.imageStyle}>
      <KeyboardAwareScrollView
        innerRef={ref => {
          scrollRef.current = ref;
        }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
        keyboardShouldPersistTaps={'handled'}
        style={{flex: 1}}>
        {formType !== 'login' && (
          <Pressable style={styles.backButton} onPress={() => goBack()}>
            <AntDesign name="arrowleft" size={24} color={'black'} />
          </Pressable>
        )}
        <View style={styles.mainView}>
          <View style={styles.logoImageView}>
            <Image
              source={require('../../assets/Login-Screen-Logo.png')}
              style={styles.imgStyle}
            />
          </View>
          <View style={styles.formContainer}>
            {formType == 'login' ? (
              <View style={styles.tContainer}>
                <Text style={styles.text}>
                  Need help logging in? Just{' '}
                  <Text onPress={handleEmailPress} style={styles.link}>
                    email us.
                  </Text>
                  {' '}To purchase a registration visit{' '}
                  <Text onPress={() => Linking.openURL('https://runtheedge.com')} style={styles.link}>
                    runtheedge.com
                  </Text>
                </Text>
              </View>
            ) : (
              <Text style={styles.forgetPasswordHeaderText}>
                Enter your email address below and we will send you instructions
                for how to reset your password.
              </Text>
            )}
            {children}
            <MultipleTapsPress
              style={styles.loginButtonWrapper}
              onPress={onPress}>
              <View style={styles.loginContent}>
                {btnLoading ? (
                  <ActivityIndicator color="black" />
                ) : (
                  <>
                    <Text style={styles.loginText}>{primaryBtnText}</Text>
                    {formType == 'login' && (
                      <AntDesign
                        name="doubleright"
                        size={15}
                        color={colors.white}
                        style={styles.loginIcon}
                      />
                    )}
                  </>
                )}
              </View>
            </MultipleTapsPress>
            <MultipleTapsPress
              style={styles.secondaryBtnView}
              onPress={onPressSecondary}>
              <Text style={styles.forgotPasswordText}>{secondaryBtnText}</Text>
            </MultipleTapsPress>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </ImageBackground>
  );
};

export default AuthForm;
