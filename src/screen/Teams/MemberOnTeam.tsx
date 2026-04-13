/* eslint-disable react/no-unstable-nested-components */
import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { CustomAlert, CustomModal, CustomScreenWrapper } from '../../components';
import MultipleTapsPress from '../../components/MultipleTapsPress';
import { RootState, store } from '../../core/store';
import { useAdjustKeyboard } from '../../hooks';
import useCustomHomeWrapper from '../../hooks/useCustomHomeWrapper';
import { navigate, replace } from '../../services/NavigationService';
import {
  useLazyGetTeamAchievementsQuery,
  useLazyGetTeamDetailQuery,
  useLeaveATeamMutation,
  useRemoveTeamMemberMutation,
} from '../../services/teams.api';
import { colors, images } from '../../utils';
import { dateFormat } from '../../utils/dateFormats';
import { getTemplateSpecs } from '../../utils/helpers';
import { moderateScale } from '../../utils/metrics';
import { Routes } from '../../utils/Routes';
import { setTeamDetail, setUser } from '../AuthScreen/login/login.slice';
import CustomSendTeamInvite from './CustomeSendTeamInvite';
import PendingInvites from './PendingInvites';
import { useKeyboardHeight } from './useKeyboardHeight';

interface MemberOnTeamProps {}

const MemberOnTeam: React.FC<MemberOnTeamProps> = () => {
  useAdjustKeyboard();
  const [member, setMember] = React.useState();
  const {user, teamDetail} = useSelector(
    (state: RootState) => state.loginReducer,
  );

  const [formValues, setFormValues] = React.useState<any>({
    modalVisible: false,
    isAdmin: false,
    removeMember: false,
    email: null,
    showToast: false,
    messageType: null,
    message: null,
    inviteLoading: false,
    achivementsData: null,
    teamMember: false,
  });

  const {teamAchievementsData, setIsTeam} = useCustomHomeWrapper({
    preferredEventId: user?.preferred_event_id,
    preferredTeamId: user?.preferred_team_id,
  });
  const scrollViewRef = React.useRef(null);

  const keyboardHeight = useKeyboardHeight();

  const [isModalVisible, setModalVisible] = React.useState(false);
  const [getTeamAchivements, {isFetching: teamIsFetching}] =
    useLazyGetTeamAchievementsQuery();
  const [leaveTeam, {isLoading}] = useLeaveATeamMutation();
  const [getTeamDetails, {isFetching}] = useLazyGetTeamDetailQuery();
  const [removeMember, {isLoading: removeMemberIsLoading}] =
    useRemoveTeamMemberMutation();

  const getAchivements = async () => {
    const formData = {
      event_id: user?.preferred_event_id,
      team_id: user?.preferred_team_id,
    };
    setIsTeam(true);

    if (user?.preferred_team_id) {
      await getTeamAchivements(formData)
        .unwrap()
        .then(res => {
          setFormValues((prevState: any) => ({
            ...prevState,
            achivementsData: res?.data?.users,
          }));
        })
        .catch(error => {
          store.dispatch(
            setUser({...user, has_team: false, preferred_team_id: null}),
          );
          replace(Routes.TEAMS);
          CustomAlert({type: 'error', message: error?.data?.message});
        });
    }
  };

  const handleLeaveteam = async () => {
    const formData = {team_id: user?.preferred_team_id};
    await leaveTeam(formData)
      .unwrap()
      .then(() => {
        CustomAlert({
          type: 'success',
          message: 'You left your team successfully',
        });
        store.dispatch(
          setUser({...user, has_team: false, preferred_team_id: null}),
        );
        replace(Routes.TEAMS);
      })
      .catch(error => {
        CustomAlert({type: 'error', message: error?.data?.message});
      });
  };

  const handlegetTeam = async () => {
    if (user?.preferred_team_id) {
      await getTeamDetails({
        teamId: user?.preferred_team_id,
        body: {event_id: user?.preferred_event_id},
      })
        .unwrap()
        .then(res => {
          store.dispatch(setTeamDetail(res?.data));
        })
        .catch(err => {
          replace(Routes.TEAMS);
          CustomAlert({type: 'error', message: err?.data?.message});
        });
    }
  };

  React.useEffect(() => {
    handlegetTeam().then(async () => {
      await getAchivements();
    });
  }, [user?.preferred_team_id]);

  const removeUserAction = () => {
    setModalVisible(false);
    removeMember({
      event_id: user?.preferred_event_id,
      team_id: user?.preferred_team_id,
      user_id: member,
    })
      .unwrap()
      .then(() => {
        CustomAlert({
          type: 'success',
          message: 'Team Member Removed Successfully',
        });
        const updatedAchievementsData = formValues?.achivementsData?.filter(
          _item => _item?.id !== member,
        );
        setFormValues((prevState: any) => ({
          ...prevState,
          achivementsData: updatedAchievementsData,
        }));
      })
      .catch(err => {
        CustomAlert({type: 'error', message: err?.data?.message});
      });
  };

  const MemberItem: React.FC<{item: any}> = ({item}) => {
    const isLoggedInUser = item?.id === user?.id;
    const isLoggedInUserAdmin = isLoggedInUser && item?.is_admin;

    const miles =
      parseFloat(Math.round(item.yearlyPoints.point * 100) / 100).toFixed(2) ||
      '0.0';

    return (
      <View>
        <View style={styles.row}>
          <View style={{flex: 1}}>
            {item?.is_admin && (
              <Ionicons
                size={15}
                name={'star'}
                color={colors.yellow}
                style={styles.star}
              />
            )}
            <Text style={[styles.cell, {textAlign: 'left', marginLeft: 3}]}>
              {item?.display_name}
            </Text>
          </View>
          {!teamDetail?.is_team_owner && (
            <Text style={styles.cell}>
              {dateFormat(item?.recentActivity?.date)}
            </Text>
          )}
          <Text style={styles.cell}>{`${miles} miles`}</Text>
          {teamDetail?.is_team_owner && !isLoggedInUser && (
            <MultipleTapsPress
              onPress={() => {
                handleRemoveMember();
                setMember(item?.id);
              }}
              disabled={item?.id == user?.id}
              style={{
                backgroundColor:
                  item?.id == user?.id ? colors.white : colors.lightGrey,
                paddingVertical: moderateScale(7),
                paddingHorizontal: moderateScale(20),
                borderRadius: moderateScale(30),
              }}>
              <Text style={styles.remove_txt}>Remove</Text>
            </MultipleTapsPress>
          )}
          {isLoggedInUserAdmin && <View style={{flex: 1}} />}
        </View>
        <CustomModal
          visible={isModalVisible}
          onClose={handleClose}
          onConfirm={() => removeUserAction()}
          title="Remove Team Member?"
          description="Please confirm you want to remove from your team"
          cancelButtonTitle="Cancel"
          confirmButtonTitle="Remove Member"
          showDescription={true}
          onCloseIcon={handleClose}
          customBtnStyle={{
            backgroundColor: getTemplateSpecs(
              store.getState().loginReducer.eventDetail?.template,
            ).alertColors,
          }}
        />
      </View>
    );
  };

  const handleConfirm = () => {
    handleLeaveteam();
    setFormValues((prevState: any) => ({
      ...prevState,
      modalVisible: false,
      removeMember: false,
    }));
  };

  const handleClose = () => {
    setFormValues((prevState: any) => ({
      ...prevState,
      modalVisible: false,
      removeMember: false,
    }));
    setModalVisible(false);
  };

  const handleRemoveMember = () => {
    setModalVisible(true);
  };

  const handleClick = () => {
    navigate(Routes.MANAGE_TEAM);
  };

  useEffect(() => {
  if (keyboardHeight > 0) {
    scrollViewRef.current?.scrollTo({
      y: 100 + keyboardHeight,
      animated: true,
    });
  }
}, [keyboardHeight]);

  function scrollViewSizeChanged() {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: 100 + keyboardHeight,
        animated: true,
      });
    }, 500);
  }

  const OnRefresh = () => {
    handlegetTeam();
    getAchivements();
  };

  return (
    <CustomScreenWrapper
      ref={scrollViewRef}
      isTeam={true}
      teamAchievementsData={teamAchievementsData}
      onRefresh={OnRefresh}
      loadingIndicator={isLoading || removeMemberIsLoading || isFetching}>
      <View style={styles.mainContainer}>
        {!teamDetail?.is_team_owner ? (
          <View style={{paddingTop: 20}} />
        ) : (
          <View style={{alignItems: 'flex-end'}}>
            <TouchableOpacity
              onPress={handleClick}
              style={styles.manageButton}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <Text style={styles.manage_txt}>Manage</Text>
              <images.EditIcon />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.container}>
          {teamIsFetching ? (
            <View style={styles.loaderConatiner}>
              <ActivityIndicator />
            </View>
          ) : !formValues?.achivementsData ||
            formValues?.achivementsData.length === 0 ? (
            <View style={styles.loaderConatiner}>
              <Text style={styles.noMembersText}>Members not found</Text>
            </View>
          ) : (
            <View>
              <Text style={styles.heading}>{teamDetail?.name || ''}</Text>
              <Text style={styles.textHeading}>Member Totals</Text>
              {formValues?.achivementsData?.map((item: any, index: any) => (
                <MemberItem key={index.toString()} item={item} />
              ))}
            </View>
          )}
        </View>
      </View>
      <CustomSendTeamInvite onFocus={scrollViewSizeChanged} />
      <PendingInvites isFetching={isFetching} />
      {teamDetail?.is_team_owner ? (
        <CustomModal
          visible={formValues?.removeMember}
          onClose={handleClose}
          onConfirm={handleConfirm}
          title="Remove Team Member?"
          description="Please confirm you want to remove from your team"
          cancelButtonTitle="Cancel"
          confirmButtonTitle="Remove Member"
          showDescription={true}
          onCloseIcon={handleClose}
        />
      ) : (
        <>
          <TouchableOpacity
            style={[
              styles.Teambutton,
              {
                backgroundColor: getTemplateSpecs(
                  store.getState().loginReducer.eventDetail?.template,
                ).alertColors,
              },
            ]}
            onPress={() =>
              setFormValues((prevState: any) => ({
                ...prevState,
                modalVisible: true,
              }))
            }>
            <Text style={styles.editGoalTxt}>Leave Team</Text>
          </TouchableOpacity>
          <CustomModal
            visible={formValues?.modalVisible}
            onClose={handleClose}
            onConfirm={handleConfirm}
            title="Are you sure?"
            description="Are you sure you want to leave team?"
            cancelButtonTitle="Cancel"
            confirmButtonTitle="Leave Team"
            showDescription={true}
            onCloseIcon={handleClose}
            customBtnStyle={{
              backgroundColor: getTemplateSpecs(
                store.getState().loginReducer.eventDetail?.template,
              ).alertColors,
            }}
          />
        </>
      )}
    </CustomScreenWrapper>
  );
};

export default MemberOnTeam;

const styles = StyleSheet.create({
  contentContainer: {flexGrow: 1, flex: 1},
  mainContainer: {
    backgroundColor: colors.white,
    paddingTop: moderateScale(20),
    marginBottom: moderateScale(20),
    borderRadius: moderateScale(25),
    marginHorizontal: moderateScale(10),
    paddingHorizontal: moderateScale(15),
  },
  heading: {
    fontWeight: '800',
    textAlign: 'center',
    color: colors.primaryGrey,
    fontSize: moderateScale(16),
    marginTop: moderateScale(0),
  },
  manageButton: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  container: {
    paddingLeft: 0,
    borderRadius: 30,
    backgroundColor: colors.white,
    paddingVertical: moderateScale(20),
    marginHorizontal: moderateScale(10),
  },
  textHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.headerBlack,
    marginTop: moderateScale(20),
  },
  star: {position: 'absolute', left: -15},
  row: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    paddingLeft: moderateScale(15),
    justifyContent: 'space-between',
    paddingVertical: moderateScale(12),
  },
  cell: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    color: colors.primaryGrey,
  },
  Teambutton: {
    width: '35%',
    borderRadius: 20,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.black,
    marginBottom: moderateScale(30),
    paddingVertical: moderateScale(10),
    paddingHorizontal: moderateScale(20),
  },
  noMembersText: {
    flex: 1,
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
    color: colors.primaryGrey,
  },
  loaderConatiner: {
    flex: 1,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  manage_txt: {
    marginRight: 5,
    textAlign: 'right',
    color: colors.primaryGrey,
  },
  editGoalTxt: {color: colors.white},
  remove_txt: {
    fontWeight: '700',
    color: colors.white,
    fontSize: moderateScale(14),
  },
});
