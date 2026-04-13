import { Formik } from 'formik';
import React from 'react';
import { Keyboard, StyleSheet } from 'react-native';
import {
  AuthForm,
  CustomAlert,
  CustomInput,
  CustomScreenLoader,
} from '../../../components';
import { useLoginMutation } from '../../../services/login.api';
import { navigate } from '../../../services/NavigationService';
import {
  useLazyGetBroadcastUnseenQuery,
  useLazyGetCompleteProfileQuery,
  useLazyGetEventListingQuery,
  useLazyGetEventQuery
} from '../../../services/profile.api';
import { getStartAndEndDateOfMonth } from '../../../utils/helpers';
import { Routes } from '../../../utils/Routes';
import { loginSchema } from '../../../utils/validation';
import useLoginStore from './useLoginStore';

const LoginUser: React.FC = () => {
  const [loginMutation, {isLoading}] = useLoginMutation();
  const [getCompleteProfile] = useLazyGetCompleteProfileQuery();
  const [getEventDetails] = useLazyGetEventQuery();
  const [getEventList] = useLazyGetEventListingQuery();

  const [getBroadcastUnseen] = useLazyGetBroadcastUnseenQuery(); // 👈 for GET
  // const [readBroadcast] = useReadBroadcastMutation();
  // 👈 for POST
  const getProfileBody = {
    start_date: getStartAndEndDateOfMonth()?.startDate,
    end_date: getStartAndEndDateOfMonth()?.endDate,
  }; 

  const {
    apiError,
    loading,
    setApiError,
    setLoading,
    handleFormSubmit,
    secureEntry,
    setSecureEntry,
    broadcastModal,
  } = useLoginStore();
 
  const onSubmitLogin = async (values: {
    username: string;
    password: string;
  }) => {
    Keyboard.dismiss();
    setLoading(true);
    try {
      await handleFormSubmit({
        values,
        loginMutation,
        getCompleteProfile,
        getEventDetails,
        getProfileBody,
        getEventList,
        getBroadcastUnseen, // 👈 unseen fetcher
        // readBroadcast, // 👈 read marker
      });

      navigate(Routes.HOME_STACK);
    } catch (error) {
      CustomAlert({type: 'error', message: error?.toString()});
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {(isLoading || loading) && <CustomScreenLoader />}
      <Formik
        onSubmit={onSubmitLogin}
        validationSchema={loginSchema}
        initialValues={{
          username: __DEV__ ? 'production@w3creatives.com' : '',
          password: __DEV__ ? '88888888' : '',
        }}>
        {({handleChange, handleSubmit, handleBlur, values, errors}) => (
          <AuthForm
            formType={'login'}
            onPress={handleSubmit}
            primaryBtnText={'Login'}
            secondaryBtnText={'Forgot Password'}
            onPressSecondary={() => navigate(Routes.FORGOT_PASSWORD)}>
            <CustomInput
              props={{
                value: values.username,
                placeholder: 'Email',
                keyboardType: 'email-address',
                autoCapitalize: 'none',
                onChangeText: handleChange('username'),
                placeholderTextColor: 'rgba(204, 204, 204, 1)',
                // onBlur: handleBlur('username'),
              }}
              errorMsg={errors.username ?? ' '}
            />
            <CustomInput
              props={{
                value: values.password,
                placeholder: 'Password',
                onChangeText: (text: string) => {
                  handleChange('password')(text);
                  setApiError('');
                },
                placeholderTextColor: 'rgba(204, 204, 204, 1)',
                autoCapitalize: 'none',
                // onBlur: handleBlur('password'),
                secureTextEntry: secureEntry,
              }}
              errorMsg={(errors.password || apiError) ?? ' '}
              secureTextEntry={secureEntry}
              onPressIcon={() => {
                const toggleState = (prev: boolean): boolean => {
                  return !prev;
                };
                setSecureEntry(toggleState);
              }}
              showIcon={true}
            />
          </AuthForm>
        )}
      </Formik>
    </>
  );
};

const styles = StyleSheet.create({
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default React.memo(LoginUser);
