import {Keyboard} from 'react-native';

const peopleFollowStates = {
  NOT_FOLLOW: 'request_to_follow',
  REQUESTED: 'request_to_follow_issued',
  FOLLOWED: 'request_to_follow_approved',
  TEAM_PEOPLE_NOT_FOLLOW: 'follow',
  TEAM_NOT_FOLLOW_PRIVATE: 'request_follow',
  FOLLOWING: 'following',
};

const peopleStatesMessages = {
  [peopleFollowStates.REQUESTED]: 'Requested',
  [peopleFollowStates.NOT_FOLLOW]: 'Follow',
  [peopleFollowStates.FOLLOWED]: 'Followed',
  [peopleFollowStates.TEAM_PEOPLE_NOT_FOLLOW]: 'Follow',
  [peopleFollowStates.TEAM_NOT_FOLLOW_PRIVATE]: 'Follow',
  [peopleFollowStates.FOLLOWING]: 'Following',
};

function getPeopleFollowStatus(status: any) {
  return peopleStatesMessages[status] || 'Follow';
}

const teamMembershipStatus = {
  REQUESTED: 'RequestedJoin',
  JOINED: 'Joined',
  JOIN_IN_PROGRESS: 'JoinInProcess',
};
const membershipStatusMessages = {
  [teamMembershipStatus.REQUESTED]: 'Requested',
  [teamMembershipStatus.JOINED]: 'Joined',
  [teamMembershipStatus.JOIN_IN_PROGRESS]: 'Respond',
};
function getMembershipStatus(status: any) {
  return membershipStatusMessages[status] || 'Join Team';
}

const onKeyPress = e => {
  if (e?.nativeEvent?.key === 'Enter') {
    Keyboard.dismiss();
  }
};

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
export {
  getMembershipStatus,
  teamMembershipStatus,
  membershipStatusMessages,
  onKeyPress,
  oneSpace,
  getPeopleFollowStatus,
  peopleFollowStates,
};
