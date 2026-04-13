import {
  Text,
  View,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {
  CustomHeader,
  CustomMainHeader,
  CustomProgressbar,
} from '../../components';
import React from 'react';
import {store} from '../../core/store';
import {colors} from '../../utils/colors';
import ProfileViewForm from './ProfileViewForm';
import {moderateScale} from '../../utils/metrics';
import ProfileInputForm from './ProfileInputForm';
import {getTemplateSpecs} from '../../utils/helpers';
import {goBack} from '../../services/NavigationService';
import LinearGradient from 'react-native-linear-gradient';
import {useLazyGetUserProfileQuery} from '../../services/profile.api';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

interface ProfileFormProps {}

const ProfileForm = ({}: ProfileFormProps) => {
  const [getUserProfile, {isFetching}] = useLazyGetUserProfileQuery();
  const [refetch, setRefetch] = React.useState(false);
  const [editState, setEditState] = React.useState(false);
  const [userProfileData, setUserProfileData] = React.useState(null);

  React.useEffect(() => {
    fetchProfile();
  }, [editState]);

  const fetchProfile = async () => {
    await getUserProfile()
      .unwrap()
      .then(res => setUserProfileData(res?.data))
      .catch(err => console.log('ERRpr', err));
  };

  const backAction = () => (editState ? setEditState(false) : goBack());

  const onRefresh = () => {
    setRefetch(true);
    fetchProfile().finally(() => setRefetch(false));
  };
  return (
    <View style={styles.constainer}>
      <LinearGradient
        colors={
          getTemplateSpecs(store.getState().loginReducer.eventDetail?.template)
            ?.gradientColor
        }
        style={styles.constainer}>
        <CustomMainHeader />
        <KeyboardAwareScrollView
          refreshControl={
            <RefreshControl refreshing={refetch} onRefresh={onRefresh} />
          }
          resetScrollToCoords={{x: 0, y: 0}}
          enableOnAndroid={true} // Ensures compatibility with Android devices
          keyboardShouldPersistTaps="handled" // Allows taps to propagate while the keyboard is open
          contentContainerStyle={{flexGrow: 1}}
          style={styles.constainer}
          extraHeight={300} // Equivalent to `keyboardOffset`
          showsVerticalScrollIndicator={false}>
          <>
            <View style={styles.progressContainer}>
              <CustomProgressbar />
            </View>
            <View
              style={[
                styles.firstContainer,
                {height: isFetching ? 450 : null},
              ]}>
              <CustomHeader
                onPressEdit={() => setEditState(true)}
                onPressBack={backAction}
                hideEditBtn={editState || isFetching}
              />
              {!isFetching && (
                <Text style={styles.headerText}>{`${editState ? 'Edit' : ''} ${
                  userProfileData?.name
                }'s Profile`}</Text>
              )}
              {isFetching ? (
                <ActivityIndicator color="black" style={styles.constainer} />
              ) : editState ? (
                <ProfileInputForm
                  backAction={backAction}
                  userProfileData={userProfileData}
                  setUserProfileData={setUserProfileData}
                />
              ) : (
                <ProfileViewForm userProfileData={userProfileData} />
              )}
            </View>
          </>
        </KeyboardAwareScrollView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  constainer: {flex: 1},
  firstContainer: {
    flex: 1,
    backgroundColor: colors.white,
    paddingTop: moderateScale(20),
    borderRadius: moderateScale(25),
    marginBottom: moderateScale(20),
    paddingBottom: moderateScale(20),
    marginHorizontal: moderateScale(10),
    paddingHorizontal: moderateScale(15),
  },
  headerText: {
    fontWeight: '800',
    textAlign: 'center',
    color: colors.primaryGrey,
    fontSize: moderateScale(16),
    marginVertical: moderateScale(10),
  },
  progressContainer: {zIndex: 999, marginTop: moderateScale(10)},
});

export default ProfileForm;
