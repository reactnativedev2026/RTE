import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {
  CustomBottonsContainer,
  CustomModal,
  CustomScreenLoader,
  Listing,
} from '../../components';
import {colors} from '../../utils';
import {getTemplateSpecs} from '../../utils/helpers';
import {moderateScale} from '../../utils/metrics';
import {Routes} from '../../utils/Routes';
import {RootState, store} from '../../core/store';
import {goBack, replace} from '../../services/NavigationService';

import {
  useAcceptTeamMemberRequestMutation,
  useDeclineTeamMemberRequestMutation,
  useLazyGetTeamDetailQuery,
} from '../../services/teams.api';
import {setTeamDetail, setUser} from '../AuthScreen/login/login.slice';
import {useSelector} from 'react-redux';

const TeamWrapper: React.FC = ({requestList}) => {
  const navigation = useNavigation();
  const {TeamAndPeopleListing} = Listing;

  const [showRespond, setShowResponse] = React.useState(false);
  const {user} = useSelector((state: RootState) => state.loginReducer);

  const [getTeamDetails] = useLazyGetTeamDetailQuery();
  const [acceptMemberRequest, {isLoading: isAccepting}] =
    useAcceptTeamMemberRequestMutation();
  const [declineMemberRequest, {isLoading: isDeclining}] =
    useDeclineTeamMemberRequestMutation();

  const DeclineRequest = async item => {
    const body = {team_id: item?.id, event_id: item?.event_id};
    setShowResponse(false);
    await declineMemberRequest(body)
      .unwrap()
      .then(() => goBack())
      .catch(error => {
        console.log('Respond team error', error);
      });
  };

  const AceeptRequest = async item => {
    const body = {team_id: item?.id, event_id: item?.event_id};
    setShowResponse(false);
    try {
      await acceptMemberRequest(body).unwrap();
      const teamDetails = await getTeamDetails({
        teamId: item?.id,
        body: {event_id: item?.event_id},
      }).unwrap();
      store.dispatch(setTeamDetail(teamDetails?.data));
      store.dispatch(
        setUser({...user, has_team: true, preferred_team_id: item?.id}),
      );
      replace(Routes.MEMEBR_ON_TEAM);
    } catch (error) {
      console.error('Error responding to team request:', error);
    }
  };
  const isLoading = isAccepting || isDeclining;

  return (
    <View style={styles.Container}>
      {isLoading && <CustomScreenLoader />}

      <Text style={styles.heading}>
        You're not currently on a team, {'\n'} you can create a team or join a
        team!
      </Text>
      <CustomBottonsContainer
        cancelBtnTxt={'Create Team'}
        onPressBtn={() => navigation.navigate(Routes.CREATE_TEAM)}
        secondBtnTxt="Join Team"
        onPressSave={() => navigation.navigate(Routes.JOIN_TEAM)}
        customStyleBtnCancel={[
          styles.btnPadding,
          {
            backgroundColor: getTemplateSpecs(
              store.getState().loginReducer.eventDetail?.template,
            ).btnPrimaryColor,
          },
        ]}
        customStyleBtn={styles.btnPadding}
      />
      <View style={{marginTop: moderateScale(20)}}>
        {requestList?.length > 0 && (
          <>
            <Text style={styles.headerText}>Team Requests</Text>
            {requestList?.map(item => (
              <>
                <TeamAndPeopleListing
                  item={item}
                  customText={'Respond'}
                  team={true}
                  onPress={() => setShowResponse(true)}
                />
                <CustomModal
                  visible={showRespond}
                  onClose={() => DeclineRequest(item)}
                  onConfirm={() => AceeptRequest(item)}
                  title="Are you sure"
                  description="Are you sure you want to join the team?"
                  cancelButtonTitle="Reject"
                  confirmButtonTitle="Accept"
                  showDescription={true}
                  onCloseIcon={() => setShowResponse(false)}
                />
              </>
            ))}
          </>
        )}
      </View>
    </View>
  );
};
export default TeamWrapper;

const styles = StyleSheet.create({
  Container: {flex: 1},
  heading: {
    fontSize: moderateScale(16),
    fontWeight: '400',
    alignSelf: 'center',
    textAlign: 'center',
    color: colors.primaryGrey,
  },
  btnPadding: {paddingHorizontal: moderateScale(15), width: 135},
  headerText: {
    fontSize: moderateScale(16),
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
