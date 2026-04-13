import { Formik } from 'formik';
import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';
import Entypo from 'react-native-vector-icons/Entypo';
import { useDispatch, useSelector } from 'react-redux';
import {
  CustomBottonsContainer,
  CustomHeader,
  CustomHorizontalLine,
  CustomInput,
  CustomScreenWrapper,
} from '../../components';
import CustomToggleSwitch from '../../components/CustomToggleSwitch';
import { RootState, store } from '../../core/store';
import { useAdjustKeyboard } from '../../hooks';
import { replace } from '../../services/NavigationService';
import { useCreateATeamMutation } from '../../services/teams.api';
import { colors } from '../../utils';
import { getFloatNumber, getTemplateSpecs } from '../../utils/helpers';
import { moderateScale } from '../../utils/metrics';
import { Routes } from '../../utils/Routes';
import { createTeamSchema } from '../../utils/validation';
import { setTeamDetail, setUser } from '../AuthScreen/login/login.slice';
import { oneSpace, onKeyPress } from '../Teams/helper';

interface CreateTeamContainerProps { }

const CreateTeamContainer = ({ }: CreateTeamContainerProps) => {
  useAdjustKeyboard();
  const dispatch = useDispatch();
  const [createTeam] = useCreateATeamMutation();
  const { user, eventDetail } = useSelector((state: RootState) => state.loginReducer);
  const [formValues, setFormValues] = React.useState({
    public_profile: false,
    isLoading: false,
    isModalVisible: false,
    error: null,
    chutzpah_factor: 1,
  });

  const handleCreateATeam = (values: any) => {
    const formData = {
      event_id: user?.preferred_event_id,
      name: values.teamName,
      public_profile: formValues?.public_profile,
      settings: { "chutzpah_factor": formValues.chutzpah_factor },
    };
    setFormValues(prevFormValues => ({
      ...prevFormValues,
      isLoading: true,
    }));

    createTeam(formData)
      .unwrap()
      .then(res => {
        dispatch(setTeamDetail(res?.data));
        store.dispatch(
          setUser({ ...user, has_team: true, preferred_team_id: res?.data?.id }),
        );
        replace(Routes.MEMEBR_ON_TEAM);
      })
      .catch(err => {
        console.log('Error creating team:', err);
        setFormValues(prevFormValues => ({
          ...prevFormValues,
          error: err?.data?.message,
          isModalVisible: true,
        }));
      })
      .finally(() => {
        setFormValues(prevFormValues => ({
          ...prevFormValues,
          isLoading: false,
        }));
      });

    // setTimeout(() => {
    //   setFormValues(prevFormValues => ({
    //     ...prevFormValues,
    //     isLoading: false,
    //   }));
    // }, 3000);
  };

  const closeModal = () => {
    setFormValues(prevFormValues => ({
      ...prevFormValues,
      isModalVisible: false,
      error: null,
    }));
  };

  return (
    <CustomScreenWrapper
      removeScroll={true}
      loadingIndicator={formValues?.isLoading}>
      <Formik
        onSubmit={handleCreateATeam}
        validationSchema={createTeamSchema}
        initialValues={{
          teamName: '',
        }}>
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
        }) => (
          <View style={styles.Maincontainer}>
            <CustomHeader hideEditBtn={true} />
            <ScrollView
              bounces={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 50 }}>
              <Text style={styles.heading}>Create a Team</Text>
              <View style={styles.TeamCard}>
                <Text style={styles.inputHeading}>Team Name</Text>
                <View style={styles.inputCard}>
                  <Text style={styles.label}>
                    What do you want your team to be named?
                  </Text>

                  <CustomInput
                    inputStyle={{
                      fontWeight: '400',
                      fontSize: moderateScale(14),
                    }}
                    containerStyle={{
                      borderColor: colors.secondWhite,
                      width: '100%',
                    }}
                    props={{
                      placeholder: 'Enter your team name',
                      placeholderTextColor: colors.lightGrey,
                      value: values.teamName,
                      onBlur: handleBlur('teamName'),
                      multiline: true,
                      numberOfLines: 1,
                      maxLength: 20,
                      textAlign: 'center',
                      returnKeyType: 'done',
                      onKeyPress: onKeyPress,
                      onChangeText: (text: string) => {
                        const initialText = text
                          ?.split('')
                          .filter(oneSpace)
                          .join('');
                        const finalText = initialText?.replace(
                          /(\r\n|\n|\r)/gm,
                          ' ',
                        );

                        handleChange('teamName')(finalText);
                      },
                    }}
                  />
                  <Text style={styles.fieldError}>
                    {touched.teamName && errors.teamName && errors.teamName}
                  </Text>
                </View>
                <CustomHorizontalLine
                  customStyle={{ marginTop: moderateScale(5) }}
                />
              </View>

              <View style={styles.SwitchCard}>
                <Text style={styles.inputHeading}>Team Goal</Text>
                <View style={styles.inputCard}>
                  <Text style={styles.label2}>
                    Your team will need to complete <Text style={{ fontWeight: 'bold' }}>{getFloatNumber(eventDetail?.total_points * formValues?.chutzpah_factor)} Miles</Text> 
                  </Text>
                  <View style={styles.chutzpahContainer}>
                    {[
                      [1, 2, 3, 4, 5],
                      [6, 7, 8, 9, 10],
                    ].map((row, index) => (
                      <View key={index} style={styles.chutzpahRow}>
                        {row.map(item => (
                          <Pressable
                            key={item}
                            onPress={() =>
                              setFormValues(prev => ({
                                ...prev,
                                chutzpah_factor: item,
                              }))
                            }
                            style={[
                              styles.chutzpahButton,
                              formValues.chutzpah_factor === item &&
                              styles.chutzpahButtonSelected,
                              formValues.chutzpah_factor === item
                                ? {
                                  backgroundColor: getTemplateSpecs(
                                    store.getState().loginReducer.eventDetail
                                      ?.template,
                                  )?.btnPrimaryColor,
                                  borderColor: getTemplateSpecs(
                                    store.getState().loginReducer.eventDetail
                                      ?.template,
                                  )?.btnPrimaryColor,
                                }
                                : {},
                            ]}>
                            <Text
                              style={[
                                styles.chutzpahText,
                                formValues.chutzpah_factor === item &&
                                styles.chutzpahTextSelected,
                              ]}>
                              {item}X
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    ))}
                  </View>
                </View>
                <CustomHorizontalLine
                  customStyle={{ marginTop: moderateScale(5) }}
                />
              </View>

              <View style={styles.SwitchCard}>
                <Text style={styles.inputHeading}>
                  To be public, or not be public?
                </Text>
                <View style={styles.inputCard}>
                  <Text style={styles.label}>
                    Choose to make your team public or private. Public teams
                    will show up in searches and allow others to follow your
                    progress. Private teams will be invisible to others.
                  </Text>
                  <CustomToggleSwitch
                    isOn={formValues?.public_profile}
                    onToggle={() =>
                      setFormValues(prevFormValues => ({
                        ...prevFormValues,
                        public_profile: !prevFormValues.public_profile,
                      }))
                    }
                    label="Make team's profile page public?"
                    onColor={
                      getTemplateSpecs(
                        store.getState().loginReducer.eventDetail?.template,
                      )?.settingsColor || colors.lightBlue
                    }
                    offColor="grey"
                    labelStyle={{
                      fontSize: moderateScale(14),
                      fontWeight: '700',
                    }}
                  />
                  <CustomBottonsContainer
                    hideCancelBtn
                    secondBtnTxt="Create Team"
                    customStyleBtn={{ paddingHorizontal: moderateScale(12) }}
                    onPressSave={handleSubmit}
                  />
                </View>
              </View>
            </ScrollView>
            <Modal
              transparent={true}
              animationType="slide"
              visible={formValues?.isModalVisible}
              onRequestClose={closeModal}>
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <Entypo
                    name="circle-with-cross"
                    size={100}
                    color={colors.primaryRed}
                    style={{ marginTop: 2 }}
                  />
                  <View style={styles.column}>
                    <Text style={styles.errorText}>Error</Text>
                    <Text style={styles.errorMessage}>{formValues?.error}</Text>
                  </View>
                  <Button
                    onPress={closeModal}
                    mode="contained"
                    style={styles.closeButton}>
                    Close
                  </Button>
                </View>
              </View>
            </Modal>
          </View>
        )}
      </Formik>
    </CustomScreenWrapper>
  );
};

export default CreateTeamContainer;

const styles = StyleSheet.create({
  Maincontainer: {
    backgroundColor: colors.white,
    paddingTop: moderateScale(20),
    marginHorizontal: moderateScale(10),
    borderRadius: moderateScale(25),
    paddingHorizontal: moderateScale(15),
    marginBottom: moderateScale(20),
  },
  heading: {
    fontSize: moderateScale(16),
    fontWeight: '800',
    textAlign: 'center',
    marginTop: moderateScale(20),
    color: colors.primaryGrey,
  },
  label: {
    color: colors.primaryGrey,
    fontSize: moderateScale(14),
    fontWeight: '400',
    lineHeight: moderateScale(19),
  },
   label2: {
    fontWeight: '400',
    color: colors.primaryGrey,
    lineHeight: moderateScale(19),
    textAlign: 'center',
  }, 
  TeamCard: {
    padding: moderateScale(10),
  },
  textInput: {
    padding: moderateScale(8),
    borderRadius: moderateScale(50),
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: colors.lightGrey,
    paddingLeft: moderateScale(20),
    marginTop: moderateScale(15),
    textAlign: 'center',
  },
  inputHeading: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    marginTop: moderateScale(15),
    color: colors.headerBlack,
  },
  inputCard: {
    marginTop: moderateScale(15),
  },

  column: {
    flexDirection: 'column',
  },
  SwitchCard: {
    paddingHorizontal: moderateScale(10),
  },
  button: {
    backgroundColor: colors.lightBlue,
    marginTop: moderateScale(20),
    width: '50%',
    alignSelf: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: colors.white,
    borderRadius: moderateScale(10),
    padding: moderateScale(20),
    alignItems: 'center',
    justifyContent: 'center',
    gap: moderateScale(20),
  },
  fieldError: {
    fontSize: moderateScale(14),
    color: 'red',
    marginLeft: moderateScale(10),
    // marginTop: moderateScale(5),
  },
  errorText: {
    fontSize: moderateScale(20),
    color: 'red',
    textAlign: 'center',
    fontWeight: '600',
  },
  errorMessage: {
    fontSize: moderateScale(16),
    textAlign: 'center',
    marginTop: moderateScale(10),
  },
  closeButton: {
    backgroundColor: colors.lightBlue,
  },
  chutzpahContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    gap: moderateScale(10),
    marginTop: moderateScale(10),
  },
  chutzpahRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: moderateScale(10),
  },
  chutzpahButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    borderWidth: 1,
    borderColor: colors.lightGrey,
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',
    textAlign: 'center',
    overflow: 'hidden',
  },
  chutzpahButtonSelected: {
    backgroundColor: colors.lightBlue,
    borderColor: colors.lightBlue,
  },
  chutzpahText: {
    color: colors.primaryGrey,
    fontWeight: '600',
    fontSize: moderateScale(12),
  },
  chutzpahTextSelected: {
    color: colors.white,
  },
});
