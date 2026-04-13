import React from 'react';
import {Formik} from 'formik';
import {StyleSheet} from 'react-native';
import {Routes} from '../../../utils/Routes';
import {ANDROID} from '../../../utils/metrics';
import {navigate} from '../../../services/NavigationService';
import {forgotPasswordSchema} from '../../../utils/validation';
import {useForgotMutation} from '../../../services/forgot.api';
import {AuthForm, CustomInput, CustomToast} from '../../../components';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

interface ForgotPasswordValues {
  email: string;
}

const ForgotPassword: React.FC<ForgotPasswordValues> = () => {
  const [forgotMutation, {isLoading}] = useForgotMutation();
  const [error, setError] = React.useState('');
  const scrollRef = React.useRef(null);

  const onSubmitLogin = async (values: {email: string}) => {
    const body = {email: values.email};
    await forgotMutation(body)
      .unwrap()
      .then(res => CustomToast({type: 'success', message: res?.message}))
      .catch(err => setError(err?.data?.errors?.email?.[0]));
  };

  const handleScrollToEnd = () => {
    if (ANDROID) {
      scrollRef.current?.scrollToEnd({animated: true});
    }
  };

  return (
    <KeyboardAwareScrollView
      enableOnAndroid={true} // Ensures compatibility with Android devices
      keyboardShouldPersistTaps="handled" // Allows taps to propagate while the keyboard is open
      contentContainerStyle={styles.contentContainer}
      style={styles.firstContainer}
      extraHeight={150} // Equivalent to `keyboardOffset`
      showsVerticalScrollIndicator={false}>
      <Formik
        onSubmit={onSubmitLogin}
        validationSchema={forgotPasswordSchema}
        initialValues={{email: ''}}>
        {({handleChange, handleSubmit, handleBlur, errors}) => (
          <AuthForm
            onPress={handleSubmit}
            primaryBtnText="Forgot Password"
            secondaryBtnText="Login"
            onPressSecondary={() => navigate(Routes.LOGIN)}
            btnLoading={isLoading}>
            <CustomInput
              props={{
                placeholder: 'Email',
                keyboardType: 'email-address',
                placeholderTextColor: 'rgba(204, 204, 204, 1)',
                // onChangeText: handleChange('email'),
                onChangeText: text => {
                  handleScrollToEnd();
                  handleChange('email')(text);
                },
                onBlur: handleBlur('email'),
                autoCapitalize: 'none',
              }}
              errorMsg={(errors?.email || error) ?? ''}
            />
          </AuthForm>
        )}
      </Formik>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
  },
  firstContainer: {
    flex: 1,
  },
});

export default ForgotPassword;
