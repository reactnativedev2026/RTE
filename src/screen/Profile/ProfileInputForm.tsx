import {
  CustomAlert,
  CustomInput,
  CustomDropDown,
  CustomScreenLoader,
  CustomBottonsContainer,
} from '../../components';
import {
  useLazyGetUserProfileQuery,
  useLazyUpdateUserProfileQuery,
} from '../../services/profile.api';
import {tz} from 'moment';
import React from 'react';
import * as Yup from 'yup';
import {Formik} from 'formik';
import {colors} from '../../utils/colors';
import {RootState} from '../../core/store';
import {moderateScale} from '../../utils/metrics';
import {StyleSheet, Text, View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {setCompleteProfile, setUser} from '../AuthScreen/login/login.slice';

interface ProfileInputFormProps {
  userProfileData?: object | undefined;
  backAction: () => void;
  setUserProfileData: any;
}

// Validation schema using Yup
const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email format')
    .required('Email is required'),
  first_name: Yup.string().required('First Name is required'),
  last_name: Yup.string().required('Last Name is required'),
  display_name: Yup.string().required('Display Name is required'),
  // bio: Yup.string().required('Bio is required'),
  time_zone: Yup.string().required('Timezone is required'),
  // gender: Yup.string().required('Gender is required'),
  // birthday: Yup.string().required('Birthday is required'),
});

const ProfileInputForm = ({
  userProfileData,
  backAction,
  setUserProfileData,
}: ProfileInputFormProps) => {
  const dispatch = useDispatch();
  const [fetchProfile, {isFetching: Pr_Fetch}] = useLazyGetUserProfileQuery();
  const [updateProfileSubmit, {isFetching}] = useLazyUpdateUserProfileQuery();
  const {user} = useSelector((state: RootState) => state.loginReducer);

  function formatDate(dateInput) {
    const date = tz(dateInput, user?.time_zone_name).toDate(); // Works for both formats
    const year = date?.getFullYear();
    const month = String(date?.getMonth() + 1)?.padStart(2, '0');
    const day = String(date?.getDate())?.padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  const formattedTimeZones = userProfileData?.timezones
    ? Object.keys(userProfileData.timezones).map(key => ({
        label: `${key} (${
          userProfileData.timezones[key]?.match(/\(GMT.*\)/)?.[0] || ''
        })`,
        value: key,
      }))
    : [];

  const updateProfileAction = async values => {
    const {...rest} = values;
    const updateObj = {
      preferred_event_id: user?.preferred_event_id,
      shirt_size: 'unknown_size',
      settings: user?.settings,
      birthday: formatDate(Date.now()),
      ...rest,
    };
    await updateProfileSubmit(updateObj)
      .unwrap()
      .then(async () => {
        await fetchProfile({})
          .unwrap()
          .then(res => {
            setUserProfileData(res?.data);
            dispatch(setUser({...user, ...res?.data}));
            dispatch(setCompleteProfile({...user, ...res?.data}));
            backAction();
          });
      })
      .catch(err => {
        CustomAlert({type: 'error', message: err?.data?.message});
      });
  };

  return (
    <Formik
      initialValues={{
        email: userProfileData?.email ?? '',
        first_name: userProfileData?.first_name ?? '',
        last_name: userProfileData?.last_name ?? '',
        display_name: userProfileData?.name ?? '',
        bio: userProfileData?.bio ?? '',
        time_zone: userProfileData?.time_zone ?? '',
        gender: userProfileData?.gender ?? '',
        birthday: userProfileData?.birthday ?? '',
      }}
      validationSchema={validationSchema}
      onSubmit={values => {
        updateProfileAction(values);
      }}>
      {({handleChange, handleBlur, handleSubmit, values, errors, touched}) => (
        <View>
          {(isFetching || Pr_Fetch) && <CustomScreenLoader />}
          {/* Email Field */}
          <View style={styles.rowView}>
            <Text style={styles.headingStyle}>Email</Text>
            <CustomInput
              containerStyle={styles.input}
              inputStyle={styles.inputColor}
              props={{
                textAlign: 'auto',
                placeholder: 'Email',
                value: values.email,
                onChangeText: handleChange('email'),
                onBlur: handleBlur('email'),
              }}
            />
          </View>

          <Text style={styles.errorText}>
            {touched.email && errors.email && errors.email}
          </Text>

          {/* Name Field */}
          <View style={styles.rowView}>
            <Text style={styles.headingStyle}>First Name</Text>
            <CustomInput
              inputStyle={styles.inputColor}
              containerStyle={styles.input}
              props={{
                placeholder: 'First Name',
                value: values.first_name,
                onChangeText: handleChange('first_name'),
                onBlur: handleBlur('first_name'),
              }}
            />
          </View>
          <Text style={styles.errorText}>
            {touched.first_name && errors.first_name && errors.first_name}
          </Text>

          <View style={styles.rowView}>
            <Text style={styles.headingStyle}>Last Name</Text>
            <CustomInput
              inputStyle={styles.inputColor}
              containerStyle={styles.input}
              props={{
                placeholder: 'Last Name',
                value: values.last_name,
                onChangeText: handleChange('last_name'),
                onBlur: handleBlur('last_name'),
              }}
            />
          </View>
          <Text style={styles.errorText}>
            {touched.last_name && errors.last_name && errors.last_name}
          </Text>

          {/* Display Name Field */}
          <View style={styles.rowView}>
            <Text style={styles.headingStyle}>Display Name</Text>
            <CustomInput
              inputStyle={styles.inputColor}
              containerStyle={styles.input}
              props={{
                placeholder: 'Display Name',
                value: values.display_name,
                onChangeText: handleChange('display_name'),
                onBlur: handleBlur('display_name'),
              }}
            />
          </View>
          <Text style={styles.errorText}>
            {touched.display_name && errors.display_name && errors.display_name}
          </Text>

          {/* Bio Field */}
          <View style={styles.rowView}>
            <Text style={styles.headingStyle}>Bio</Text>
            <CustomInput
              containerStyle={[styles.input, styles.bioContainer]}
              inputStyle={[styles.bioInput, styles.inputColor]}
              props={{
                placeholder: 'Bio',
                value: values.bio,
                onChangeText: handleChange('bio'),
                onBlur: handleBlur('bio'),
                multiline: true,
                textAlignVertical: 'top',
              }}
            />
          </View>
          <Text style={styles.errorText}>
            {touched.bio && errors.bio && errors.bio}
          </Text>

          {/* Timezone Field */}
          <View style={styles.rowView}>
            <Text style={styles.timeheadingStyle}>Timezone</Text>
            <View style={styles.timeZoneConatiner}>
              <CustomDropDown
                data={formattedTimeZones}
                selectedTextProps={{numberOfLines: 1}}
                setSelectedValue={value => handleChange('time_zone')(value)}
                placeholderTxt={values.time_zone?.label || values.time_zone}
                value={values.time_zone?.value || values.time_zone}
              />
            </View>
          </View>
          <Text style={styles.errorText}>
            {touched.time_zone && errors.time_zone && errors.time_zone}
          </Text>

          <CustomBottonsContainer
            onPressBtn={backAction}
            onPressSave={handleSubmit}
            loading={isFetching}
            customStyleBtn={{textAlign: 'center', alignItem: 'center'}}
          />
        </View>
      )}
    </Formik>
  );
};

const styles = StyleSheet.create({
  contentContainer: {flexGrow: 1, flex: 1},
  horizontalLine: {
    borderBottomWidth: 2,
    borderColor: 'rgba(247, 247, 247, 1)',
    marginTop: 10,
  },
  sharedText: {
    fontSize: 12,
    marginTop: 30,
    lineHeight: 17,
    marginBottom: 20,
    fontWeight: '700',
    color: colors.headerBlack,
  },
  rowView: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headingStyle: {
    width: '30%',
    fontSize: 14,
    fontWeight: '700',
    color: colors.headerBlack,
  },
  timeheadingStyle: {
    width: '30%',
    fontSize: 14,
    marginTop: 20,
    fontWeight: '700',
    color: colors.headerBlack,
  },
  input: {width: '65%', marginTop: 0},
  errorText: {
    color: 'red',
    width: '65%',
    fontSize: 12,
    marginVertical: 5,
    alignSelf: 'flex-end',
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
    borderRadius: moderateScale(10),
  },
  bioContainer: {borderRadius: 10},
  inputColor: {color: colors.primaryGrey},
  dropDownContainer: {width: '65%', right: 15},
  datePickerContainer: {
    width: '65%',
    right: moderateScale(15),
    marginTop: moderateScale(10),
  },
  timeZoneConatiner: {
    width: '65%',
    right: moderateScale(15),
    marginTop: moderateScale(10),
  },
});

export default ProfileInputForm;
