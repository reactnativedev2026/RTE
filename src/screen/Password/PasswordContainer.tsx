import {Formik} from 'formik';
import React from 'react';
import {Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import {useSelector} from 'react-redux';
import {CustomHeader, CustomScreenWrapper} from '../../components';
import {RootState, store} from '../../core/store';
import {useAdjustKeyboard} from '../../hooks';
import {useUpdatePasswordMutation} from '../../services/login.api';
import {images} from '../../utils';
import {colors} from '../../utils/colors';
import {fonts} from '../../utils/fonts';
import {getTemplateSpecs} from '../../utils/helpers';
import {IOS, moderateScale} from '../../utils/metrics';
import {updatePasswordSchema} from '../../utils/validation';

interface PasswordContainerProps {}

const PasswordContainer = ({}: PasswordContainerProps) => {
  useAdjustKeyboard();
  const {user} = useSelector((state: RootState) => state.loginReducer);
  const [saved, setSaved] = React.useState(false);
  const [apiErr, setApiErr] = React.useState(false);
  const [updatePasswordSubmit] = useUpdatePasswordMutation();

  const updatePasswordAction = values => {
    const submitObj = {
      current_password: values?.currentPassword,
      password: values?.newPassword,
      password_confirmation: values?.confirmPassword,
    };
    updatePasswordSubmit(submitObj)
      .unwrap()
      .then(res => {
        setSaved(true);
      })
      .catch(err => {
        setApiErr(err?.data?.message);
      });
  };

  return (
    <CustomScreenWrapper>
      <View style={styles.firstContainer}>
        <CustomHeader hideEditBtn={true} />
        <Text style={styles.headerText}>{`${
          user?.display_name || user?.name
        }'s Password`}</Text>
        <View style={styles.formContainer}>
          {saved ? (
            <Text style={styles.updated}>Your password has been updated!</Text>
          ) : (
            <Formik
              initialValues={{
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
              }}
              validationSchema={updatePasswordSchema}
              onSubmit={values => {
                updatePasswordAction(values);
              }}>
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                errors,
                touched,
              }) => (
                <>
                  <View style={styles.inputContainer}>
                    <images.PasswordIcon fill={colors.lightGrey} />
                    <TextInput
                      style={styles.textInputStyle}
                      placeholder="Current password"
                      placeholderTextColor={colors.lightGrey}
                      secureTextEntry
                      onChangeText={handleChange('currentPassword')}
                      onBlur={handleBlur('currentPassword')}
                      value={values.currentPassword}
                    />
                  </View>
                  <Text style={styles.errorText}>
                    {touched.currentPassword && errors.currentPassword
                      ? errors.currentPassword
                      : ' '}
                  </Text>

                  <View style={styles.inputContainer}>
                    <images.PasswordIcon fill={colors.lightGrey} />
                    <TextInput
                      style={styles.textInputStyle}
                      placeholder="New password"
                      placeholderTextColor={colors.lightGrey}
                      secureTextEntry
                      onChangeText={handleChange('newPassword')}
                      onBlur={handleBlur('newPassword')}
                      value={values.newPassword}
                    />
                  </View>
                  <Text style={styles.errorText}>
                    {touched.newPassword && errors.newPassword
                      ? errors.newPassword
                      : ' '}
                  </Text>

                  <View style={styles.inputContainer}>
                    <images.PasswordIcon fill={colors.lightGrey} />
                    <TextInput
                      style={styles.textInputStyle}
                      placeholder="Confirm password"
                      placeholderTextColor={colors.lightGrey}
                      secureTextEntry
                      onChangeText={handleChange('confirmPassword')}
                      onBlur={handleBlur('confirmPassword')}
                      value={values.confirmPassword}
                    />
                  </View>
                  <Text style={styles.errorText}>
                    {touched.confirmPassword && errors.confirmPassword
                      ? errors.confirmPassword
                      : apiErr || ' '}
                  </Text>

                  <Pressable
                    style={[
                      styles.btnContainer,
                      {
                        backgroundColor: getTemplateSpecs(
                          store.getState().loginReducer.eventDetail?.template,
                        ).btnPrimaryColor,
                      },
                    ]}
                    onPress={handleSubmit}>
                    <Text style={styles.btnText}>Save</Text>
                  </Pressable>
                </>
              )}
            </Formik>
          )}
        </View>
      </View>
    </CustomScreenWrapper>
  );
};

const styles = StyleSheet.create({
  firstContainer: {
    backgroundColor: colors.white,
    paddingTop: moderateScale(20),
    marginHorizontal: moderateScale(10),
    borderRadius: moderateScale(25),
    paddingHorizontal: moderateScale(15),
    paddingBottom: moderateScale(120),
    marginBottom: moderateScale(20),
  },
  headerText: {
    fontSize: moderateScale(16),
    fontWeight: '800',
    color: colors.primaryGrey,
    textAlign: 'center',
    marginTop: moderateScale(10),
  },
  btnText: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: colors.white,
  },
  btnContainer: {
    borderRadius: moderateScale(50),
    paddingHorizontal: moderateScale(40),
    paddingVertical: moderateScale(10),
    marginHorizontal: moderateScale(5),
    marginVertical: moderateScale(20),
    alignSelf: 'center',
  },
  inputContainer: {
    borderWidth: moderateScale(2),
    borderColor: '#EDEDED',
    borderRadius: moderateScale(100),
    paddingHorizontal: moderateScale(20),
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: moderateScale(2),
    marginTop: moderateScale(5),
    justifyContent: 'flex-end',
  },
  textInputStyle: {
    flex: 1,
    textAlign: 'right',
    paddingHorizontal: moderateScale(10),
    fontFamily: fonts.Light,
    color: 'black',
    padding: 0,
    margin: 0,
    paddingVertical: IOS ? moderateScale(5) : moderateScale(2.5),
  },
  formContainer: {
    marginTop: moderateScale(20),
  },
  updated: {
    textAlign: 'center',
    fontSize: moderateScale(14),
    fontWeight: '500',
    color: colors.headerBlack,
    paddingBottom: moderateScale(160),
  },
  errorText: {
    color: 'red',
    fontSize: moderateScale(12),
    marginTop: moderateScale(2),
    marginHorizontal: moderateScale(15),
  },
});

export default PasswordContainer;
