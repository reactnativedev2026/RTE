import React, { useEffect } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle
} from 'react-native';
import { Button } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import {
  CustomAlert,
  CustomHeader,
  CustomHorizontalLine,
  CustomInput,
  CustomModal,
  CustomScreenWrapper,
  CustomToggleSwitch,
} from '../../components';
import { RootState, store } from '../../core/store';
import { navigateAndReset, pop, replace } from '../../services/NavigationService';
import {
  useDissolveTeamMutation,
  useLazyGetTeamAchievementsQuery,
  useLazyGetTeamDetailQuery,
  useLeaveATeamMutation,
  useTransferAdminRoleMutation,
  useUpdateTeamMutation,
} from '../../services/teams.api';
import { colors, Routes } from '../../utils';
import { popusArray } from '../../utils/dummyData';
import { getFloatNumber, getTemplateSpecs } from '../../utils/helpers';
import { moderateScale } from '../../utils/metrics';
import { setTeamDetail, setUser } from '../AuthScreen/login/login.slice';
import { onKeyPress } from '../Teams/helper';

const ManageTeamContainer = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, teamDetail, eventDetail } = useSelector(
    (state: RootState) => state.loginReducer,
  );
  const [teamName, setTeamName] = React.useState<string>('');
  const [toggle, setToggle] = React.useState<boolean>(false);
  const [chutzpahFactor, setChutzpahFactor] = React.useState<number>(1);
  const [modalVisible, setModalVisible] = React.useState<boolean>(false);
  const [dissolveATeam, { isLoading: isDissolving }] = useDissolveTeamMutation();
  const [leaveTeam, { isLoading: isLeaving }] = useLeaveATeamMutation();
  const [getTeamAchivements, { isFetching: teamIsFetching }] =
    useLazyGetTeamAchievementsQuery();
  const [TransferAdmin, { isLoading: isTransfer }] =
    useTransferAdminRoleMutation();
  const [updateTeam, { isLoading }] = useUpdateTeamMutation();
  const [getTeamDetails, { isFetching }] = useLazyGetTeamDetailQuery();

  const [teamUser, setTeamUser] = React.useState([]);

  const [modalContent, setModalContent] = React.useState<{
    id: number | undefined;
    heading: string;
    buttonTitle: string | undefined;
    title: string;
    description: string;
    showDropdown: boolean;
  } | null>(null);
  const [selectedOption, setSelectedOption] = React.useState('');

  useEffect(() => {
    handlegetTeam();
  }, []);

  const handlegetTeam = async () => {
    if (user?.preferred_team_id) {
      await getTeamDetails({
        teamId: user?.preferred_team_id,
        body: { event_id: user?.preferred_event_id },
      })
        .unwrap()
        .then(res => {
          dispatch(setTeamDetail(res?.data));
          setTeamName(res?.data?.name);
          setToggle(res?.data?.public_profile);
          try {
            let settings = res?.data?.settings;
            const key =
              eventDetail?.name
                .toLowerCase()
                ?.trim()
                .replace(/\s+/g, '-') ?? '';
            const parsedSettings = settings ? JSON.parse(settings) : null;
            const factor =
              parsedSettings?.chutzpah_factors
                ?.find((obj: any) => obj[key] !== undefined)
              ?.[key];
            if (factor !== undefined) {
              setChutzpahFactor(factor);
            }
          } catch (e) {
            console.log('Error parsing settings:', e);
          }
        })
        .catch(err => {
          CustomAlert({ type: 'error', message: err?.data?.message });
        });
    }
  };

  const handleDissolveTeam = async () => {
    const formData = { team_id: user?.preferred_team_id };
    try {
      await dissolveATeam(formData).unwrap();
      CustomAlert({
        type: 'success',
        message: 'Team dissolved successfully',
      });
      dispatch(setUser({ ...user, has_team: false, preferred_team_id: null }));
      navigateAndReset(Routes.TEAMS);
    } catch (error) {
      console.log('error', error);

      CustomAlert({ type: 'error', message: error?.data?.message });
    }
  };

  const teamUpdateAction = updatedToggle => {
    const checkGoback = typeof updatedToggle === 'object';
    if (typeof updatedToggle === 'object') {
      updatedToggle = toggle;
    }
    const body = {
      name: teamName,
      public_profile: updatedToggle,
      settings: { "chutzpah_factor": chutzpahFactor },
    };
    updateTeam({ teamId: user?.preferred_team_id || teamDetail?.id, body })
      .unwrap()
      .then(() => {
        checkGoback && pop();
        dispatch(
          setTeamDetail({
            ...teamDetail,
            name: teamName,
            public_profile: updatedToggle,
            settings: { "chutzpah_factor": chutzpahFactor },
          }),
        );
      })
      .catch(err => {
        CustomAlert({ type: 'error', message: err?.data?.message });
      });
  };

  const handleLeaveteam = async () => {
    const formData = { team_id: user?.preferred_team_id };
    console.log('saasasa');
    dispatch(setUser({ ...user, has_team: false, preferred_team_id: null }));

    await leaveTeam(formData)
      .unwrap()
      .then(() => {
        CustomAlert({
          type: 'success',
          message: 'You left your team successfully.',
        });
        dispatch(setUser({ ...user, has_team: false, preferred_team_id: null }));
        navigation.reset({
          index: 0,
          routes: [{ name: Routes.TEAMS }],
        });
      })
      .catch(err => {
        CustomAlert({ type: 'error', message: err?.data?.message });
      });
  };

  const getAchivements = async () => {
    const formData = {
      event_id: user?.preferred_event_id,
      team_id: user?.preferred_team_id,
    };
    try {
      if (user?.preferred_team_id) {
        const res = await getTeamAchivements(formData).unwrap();

        const formattedOptions = res?.data?.users.map((user: any) => ({
          id: user.id,
          label: user.display_name,
          value: user.id.toString(),
        }));
        setTeamUser(formattedOptions);
      }
    } catch (error) {
      console.log('achivement api error', error);
    }
  };

  const handleTransferAdmin = async () => {
    const formData = {
      team_id: user?.preferred_team_id,
      member_id: selectedOption,
    };

    try {
      const selectedUser = teamUser.find(user => user.value === selectedOption);
      const selectedUserName = selectedUser?.label || 'the new admin';
      await TransferAdmin(formData).unwrap();
      CustomAlert({
        type: 'success',
        message: `Team admin has been updated to ${selectedUserName}!`,
        title: 'Transfer Successful',
      });
      replace(Routes.MEMEBR_ON_TEAM);
    } catch (error) {
      CustomAlert({ type: 'error', message: error?.data?.message });
    }
  };

  const handleShowModel = (item: any) => {
    setModalContent({
      id: item.id,
      title:
        item.heading === 'Transfer Admin Role' ? item.heading : 'Are you sure?',
      description: item.description.replace('%teamname%', teamName),
      buttonTitle: item.buttonTitle,
      showDropdown: item.showDropdown,
    });
    if (item.heading === 'Transfer Admin Role') {
      teamUser?.filter(item => item?.id !== user?.id).length > 0
        ? setModalVisible(true)
        : CustomAlert({
          type: 'error',
          message:
            "You can't transfer the admin role at this time. Because there is not member in your team!",
          title: 'Error',
        });
    } else {
      setModalVisible(true);
    }
  };

  const handleConfirm = () => {
    if (modalContent?.id == 3) {
      handleDissolveTeam();
    }
    if (modalContent?.id == 2) {
      handleLeaveteam();
    }
    if (modalContent?.id == 1) {
      handleTransferAdmin();
    }
    setModalVisible(false);
  };

  const handleUpdate = () => {
    const updatedToggle = !toggle;
    setToggle(updatedToggle);
    teamUpdateAction(updatedToggle);
  };

  React.useEffect(() => {
    getAchivements();
  }, []);

  const oneSpace = (val1, ind, arr) => {
    if (ind == 0) {
      return true;
    }
    if (val1 !== ' ') {
      return true;
    }
    const val2 = arr[ind - 1];
    if (val2 !== ' ') {
      return true;
    }
    return false;
  };

  return (
    <CustomScreenWrapper
      onRefresh={handlegetTeam}
      loadingIndicator={isLeaving || isDissolving || isTransfer || isLoading}>
      <View style={styles.maincontainer}>
        <CustomHeader hideEditBtn={true} />
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.heading}>Manage Team</Text>
          <View style={styles.teamCard}>
            <Text style={styles.inputHeading}>Rename your team</Text>
            <View style={styles.inputCard}>
              <Text
                style={{
                  color: colors.primaryGrey,
                  marginBottom: moderateScale(10),
                }}>
                Enter new team name and click “Rename Team”
              </Text>
              <CustomInput
                containerStyle={styles.input}
                inputStyle={styles.inputColor}
                props={{
                  placeholderTextColor: colors.primaryGrey,
                  multiline: true,
                  numberOfLines: 1,
                  maxLength: 20,
                  textAlign: 'center',
                  returnKeyType: 'done',
                  onKeyPress: onKeyPress,
                  placeholder: 'Enter team name',
                  value: teamName,
                  onChangeText: (text: string) => {
                    const res = text?.split('').filter(oneSpace).join('');
                    const res1 = res?.replace(/(\r\n|\n|\r)/gm, ' ');
                    setTeamName(res1);
                  },
                }}
              />
            </View>
            <TouchableOpacity
              style={[
                styles.button,
                {
                  backgroundColor: getTemplateSpecs(
                    store.getState().loginReducer.eventDetail?.template,
                  ).btnPrimaryColor,
                },
              ]}
              onPress={teamUpdateAction}>
              <Text style={styles.editGoalTxt}>Rename Team</Text>
            </TouchableOpacity>
            <CustomHorizontalLine customStyle={{ marginTop: 20 }} />
            <View style={styles.switchCard}>
              <Text style={styles.inputHeading}>Team Goal</Text>
              <View style={styles.inputCard}>
                <Text style={styles.label2}>
                  Your team will need to complete <Text style={{ fontWeight: 'bold' }}>{getFloatNumber(eventDetail?.total_points * chutzpahFactor)} Miles</Text>
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
                          onPress={() => {
                            console.log("item", item)
                            setChutzpahFactor(item)
                          }}
                          style={[
                            styles.chutzpahButton,
                            chutzpahFactor === item &&
                            styles.chutzpahButtonSelected,
                            chutzpahFactor === item
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
                              chutzpahFactor === item &&
                              styles.chutzpahTextSelected,
                            ]}>
                            {item}X
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  ))}
                  <TouchableOpacity
                    style={[
                      styles.button,
                      {
                        marginTop: moderateScale(20),
                        backgroundColor: getTemplateSpecs(
                          store.getState().loginReducer.eventDetail?.template,
                        ).btnPrimaryColor,
                      },
                    ]}
                    onPress={teamUpdateAction}>
                    <Text style={styles.editGoalTxt}>Update Factor</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <CustomHorizontalLine customStyle={{ marginTop: 20 }} />
            <View style={styles.switchCard}>
              <Text style={styles.inputHeading}>
                To be public, or not be public?
              </Text>
              <View style={styles.inputCard}>
                <Text style={styles.label}>
                  Choose to make your team public or private. Public teams will
                  show up in searches and allow others to follow your progress.
                  Private teams will be invisible from others.
                </Text>
                <CustomToggleSwitch
                  isOn={toggle}
                  onToggle={handleUpdate}
                  label="Make team's profile page public?"
                  onColor={
                    getTemplateSpecs(
                      store.getState().loginReducer.eventDetail?.template,
                    )?.settingsColor || colors.lightBlue
                  }
                  offColor="grey"
                  labelStyle={styles.toggleLabel}
                  containerStyle={{
                    flexDirection: 'column',
                  }}
                  toggleStyle={{ marginTop: 10 }}
                />
              </View>
            </View>
            <CustomHorizontalLine customStyle={{ marginTop: 10 }} />
            <View style={styles.switchCard}>
              <Text style={styles.inputHeading}>Leave or Dissolve Team</Text>
              <View style={styles.buttonsCard}>
                {popusArray.map(item => (
                  <Button
                    labelStyle={styles.buttonLabelStyles}
                    mode="contained"
                    style={[
                      teamButton(item),
                      {
                        backgroundColor: getTemplateSpecs(
                          store.getState().loginReducer.eventDetail?.template,
                        ).alertColors,
                      },
                    ]}
                    onPress={() => handleShowModel(item)}>
                    {item.heading}
                  </Button>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
      {modalVisible && modalContent && (
        <CustomModal
          disabled={
            modalContent.buttonTitle !== 'Assign New Admin'
              ? false
              : !selectedOption
          }
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onConfirm={handleConfirm}
          title={modalContent.title}
          description={modalContent.description}
          cancelButtonTitle="Cancel"
          confirmButtonTitle={modalContent.buttonTitle}
          showDescription={true}
          options={
            modalContent.showDropdown
              ? teamUser?.filter(item => item?.id !== user?.id)
              : []
          }
          selectedOption={teamUser?.find(user => user.value === selectedOption)}
          onSelectOption={setSelectedOption}
          descriptionStyle={{ color: colors.primaryGrey }}
          optionsLoading={teamIsFetching}
          onCloseIcon={() => setModalVisible(false)}
          customBtnStyle={{
            backgroundColor: getTemplateSpecs(
              store.getState().loginReducer.eventDetail?.template,
            ).alertColors,
            width: modalContent?.id == 1 ? '50%' : '42%',
          }}
          customCancelButton={{
            width: modalContent?.id == 1 ? '50%' : '42%',
          }}
        />
      )}
    </CustomScreenWrapper>
  );
};

export default ManageTeamContainer;

const styles = StyleSheet.create<{
  input: ViewStyle;
  teamCard: ViewStyle;
  inputCard: ViewStyle;
  switchCard: ViewStyle;
  buttonsCard: ViewStyle;
  maincontainer: ViewStyle;
  label: TextStyle;
  label2: TextStyle;
  heading: TextStyle;
  inputColor: TextStyle;
  inputHeading: TextStyle;
  buttonLabelStyles: TextStyle;
  editGoalTxt: TextStyle;
  toggleLabel: TextStyle;
  chutzpahContainer: ViewStyle;
  chutzpahRow: ViewStyle;
  chutzpahButton: ViewStyle;
  chutzpahButtonSelected: ViewStyle;
  chutzpahText: TextStyle;
  chutzpahTextSelected: TextStyle;
  button: ViewStyle;
}>({
  maincontainer: {
    marginBottom: 20,
    paddingTop: moderateScale(20),
    backgroundColor: colors.white,
    borderRadius: moderateScale(25),
    marginHorizontal: moderateScale(10),
    paddingHorizontal: moderateScale(20),
  },
  heading: {
    fontWeight: '800',
    textAlign: 'center',
    color: colors.primaryGrey,
    fontSize: moderateScale(16),
    marginTop: moderateScale(20),
  },
  teamCard: { padding: 10, paddingBottom: 0, alignItems: 'center' },
  inputHeading: {
    fontSize: 16,
    marginTop: 20,
    fontWeight: '700',
    color: colors.headerBlack,
    alignItems: 'center',
    textAlign: 'center',
  },
  inputCard: { display: 'flex', marginTop: 20, alignItems: 'center' },
  inputColor: {
    fontWeight: 'bold',
    color: colors.headerBlack,
    fontSize: moderateScale(14),
  },
  input: { width: '100%', borderColor: colors.secondWhite },
  button: {
    backgroundColor: colors.lightBlue,
    alignSelf: 'center',
    paddingHorizontal: moderateScale(20),
    paddingVertical: moderateScale(10),
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchCard: { width: '100%', paddingTop: 0, padding: moderateScale(10) },
  buttonsCard: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: moderateScale(20),
  },
  label: {
    fontWeight: '400',
    color: colors.primaryGrey,
    fontSize: moderateScale(14),
    lineHeight: moderateScale(19),
    textAlign: 'center',
  },
  label2: {
    fontWeight: '400',
    color: colors.primaryGrey,
    lineHeight: moderateScale(19),
    textAlign: 'center',
  }, 
  buttonLabelStyles: {
    marginHorizontal: moderateScale(15),
    marginVertical: 8,
    color: colors.white,
  },
  editGoalTxt: { color: colors.white },
  toggleLabel: { fontSize: moderateScale(13), fontWeight: '700' },
  chutzpahContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    gap: moderateScale(10),
    marginTop: moderateScale(10),
    alignItems: 'center',
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

const teamButton = (item: any): ViewStyle => ({
  width: 'auto',
  alignItems: 'center',
  justifyContent: 'center',
  // @ts-ignore
  fontSize: moderateScale(12),
  marginBottom: moderateScale(10),
  paddingVertical: moderateScale(2),
  backgroundColor: colors.primaryRed,
  marginHorizontal: item?.id === 1 ? moderateScale(28) : moderateScale(5),
});
