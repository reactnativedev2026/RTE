import {
  View,
  Text,
  ImageBackground,
  Image,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import React, {useState} from 'react';
import styles from './styles';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {useNavigation} from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {colors} from '../../../utils/colors';
import {Formik} from 'formik';
import {resetPasswordSchema} from '../../../utils/validation';

const ResetPassword = () => {
  const navigation = useNavigation();
  const [secureEntry, setSecureEntry] = useState(true);
  const [showPassword, setShowPassword] = useState(true);

  const onSubmitForm = () => {
    console.log('sdfsfsdfsf');
  };

  return (
    <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
      <ImageBackground
        source={require('../../../assets/background.png')}
        style={styles.backgroundImage}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <AntDesign name="arrowleft" size={24} color={colors.black} />
        </TouchableOpacity>
        <Formik
          onSubmit={onSubmitForm}
          validationSchema={resetPasswordSchema}
          initialValues={{password: '', confirmPassword: ''}}>
          {({handleChange, handleSubmit, values, errors, touched}) => (
            <View style={styles.container}>
              <View style={styles.textContainer}>
                <Image
                  source={require('../../../assets/Login-Screen-Logo.png')}
                  style={styles.bannerImage}
                />
              </View>
              <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Password"
                    placeholderTextColor={colors.secondary}
                    secureTextEntry={secureEntry}
                    value={values.password}
                    onChangeText={text => {
                      handleChange('password')(text);
                      // setApiError('');
                    }}
                  />
                  <TouchableOpacity
                    onPress={() => {
                      setSecureEntry(prev => !prev);
                    }}>
                    <AntDesign
                      name={secureEntry ? 'eyeo' : 'eye'}
                      size={20}
                      color={colors.secondary}
                      style={styles.icon}
                    />
                  </TouchableOpacity>
                </View>
                {touched.password && errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Confirm Password"
                    placeholderTextColor={colors.secondary}
                    secureTextEntry={showPassword}
                    value={values.confirmPassword}
                    onChangeText={text => {
                      handleChange('confirmPassword')(text);
                      // setApiError('');
                    }}
                  />
                  <TouchableOpacity
                    onPress={() => {
                      setShowPassword(prev => !prev);
                    }}>
                    <AntDesign
                      name={showPassword ? 'eyeo' : 'eye'}
                      size={20}
                      color={colors.secondary}
                      style={styles.icon}
                    />
                  </TouchableOpacity>
                </View>
                {touched.confirmPassword && errors.confirmPassword && (
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                )}
                <TouchableOpacity
                  style={styles.loginButtonWrapper}
                  onPress={handleSubmit}>
                  <View style={styles.loginContent}>
                    {/* {loading ? (
                  <ActivityIndicator color="black" />
                ) : (
                  <> */}
                    <Text style={styles.loginText}>Reset Password</Text>
                    <AntDesign
                      name="doubleright"
                      size={15}
                      color={colors.white}
                      style={styles.loginIcon}
                    />
                    {/* </>
                )} */}
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Formik>
      </ImageBackground>
    </KeyboardAwareScrollView>
  );
};
export default ResetPassword;
