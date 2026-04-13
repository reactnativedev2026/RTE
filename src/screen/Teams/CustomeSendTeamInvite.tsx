import React from 'react';
import { ActivityIndicator, StyleSheet,TextInput, Text, View } from 'react-native';
import { AutocompleteDropdown } from 'react-native-autocomplete-dropdown';
import Entypo from 'react-native-vector-icons/Entypo';
import { useSelector } from 'react-redux';
import CustomAlert from '../../components/CustomAlert';
import MultipleTapsPress from '../../components/MultipleTapsPress';
import { RootState, store } from '../../core/store';
import {
  useInviteAMembershipMutation,
  useLazyGetUsersToInviteQuery,
} from '../../services/teams.api';
import { colors, images } from '../../utils';
import { getTemplateSpecs } from '../../utils/helpers';
import { IOS, moderateScale } from '../../utils/metrics';

const CustomSendTeamInvite: React.FC = ({onFocus}) => {
  const {user} = useSelector((state: RootState) => state.loginReducer);

  const [getMembersToInvite] = useLazyGetUsersToInviteQuery();
  const [inviteMember, {isLoading}] = useInviteAMembershipMutation();

  const [inviteUsers, setInviteUsers] = React.useState([]);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [filteredInviteUsers, setFilteredInviteUsers] = React.useState([]); // For filtered results
  const [emailFields, setEmailFields] = React.useState([{id: 1, email: ''}]); // Assign unique id for each field

  React.useEffect(() => {
    if (user?.preferred_event_id) {
      getMembersToInvite({
        event_id: user?.preferred_event_id,
        email: emailFields[emailFields?.length - 1]?.email,
      })
        .unwrap()
        .then(res => {
          setInviteUsers(res?.data?.data);
          setFilteredInviteUsers(res?.data?.data);
        })
        .catch(err => {
          CustomAlert({type: 'error', message: err?.data?.message});
        });
    }
  }, [user?.preferred_event_id]);

  const isInviteButtonEnabled =
    emailFields.length > 0 &&
    emailFields.some(field => field.email && field.email.trim() !== '');

  const addEmailField = (email, index) => {
    const isValidEmail = inviteUsers.some(user => user?.email == email);

    // if (isValidEmail) {
    setEmailFields([...emailFields, {id: Date.now(), email: ''}]);
    setErrorMessage('');
    // } else {
    //   setErrorMessage('This email is not valid!');
    // }
  };

  const removeEmailField = id => {
    setEmailFields(emailFields?.filter(field => field?.id !== id));
  };

  const handleEmailChange = (text, id) => {
    setEmailFields(
      emailFields?.map(field =>
        field.id === id ? {...field, email: text} : field,
      ),
    );

    // Get the list of selected emails
    const selectedEmails = emailFields?.map(field => field?.email);
    // Filter inviteUsers based on the typed text and exclude selected emails
    const filteredList = text
      ? inviteUsers.filter(
          user =>
            user?.email?.toLowerCase()?.includes(text?.toLowerCase()) &&
            !selectedEmails.includes(user?.email),
        )
      : inviteUsers.filter(user => !selectedEmails.includes(user?.email));

    setFilteredInviteUsers(filteredList);
  };

  const handleInviteMember = async () => {
    const resultArray = emailFields
      .filter(item => item.email)
      .map(item => item.email);
    if (resultArray?.length > 0) {
      const sentInviteObj = {
        emails: resultArray,
        team_id: user?.preferred_team_id,
        event_id: user?.preferred_event_id,
      };
      inviteMember(sentInviteObj)
        ?.unwrap()
        .then(res => {
          CustomAlert({type: 'success', message: res?.message});
          setEmailFields([{id: 1, email: ''}]);
        })
        .catch(err => {
          CustomAlert({type: 'error', message: err?.data?.message});
        });
    }
  };

  return (
    <View style={styles.secondContainer}>
      <Text style={styles.textHeading}>Invite People</Text>
      <View style={styles.inviteContent}>
        <Text style={styles.textDescription}>
          If you need to invite more than 10 people, add them in batches of 10.
          Only the team owner can accept.
        </Text>

        {emailFields?.map((field, index) => (
          <View key={field.id} style={styles.inputWrapper}>
            <View style={styles.inputContainer}>
              <images.EmailIcon height={20} width={20} />
              {index === emailFields?.length - 1 ? (
                IOS ? (
                  <TextInput
                    value={field?.email}
                    editable={!isLoading}
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="emailAddress"
                    keyboardType="email-address"
                    placeholder="Email Address"
                    style={[styles.textInputStyle, {flex: 1, marginLeft: moderateScale(10)}]}
                    contextMenuHidden={false}
                    selectTextOnFocus={false}
                    onChangeText={text => {
                      handleEmailChange(text, field.id);
                      setErrorMessage('');
                      onFocus && onFocus();
                    }}
                    onFocus={() => {
                      onFocus && onFocus();
                    }}
                  />
                ) : <AutocompleteDropdown
                  onFocus={onFocus}
                  closeOnBlur={true}
                  clearOnFocus={false}
                  emptyResultText={''}
                  closeOnSubmit={false}
                  EmptyResultComponent={<View />}
                  containerStyle={styles.dropDownContainer}
                  inputContainerStyle={styles.dropDownInput}
                  rightButtonsContainerStyle={styles.rightButtonsContainer}
                  suggestionsListContainerStyle={styles.suggestionListContainer}
                  onSelectItem={item => {
                    handleEmailChange(item?.title, field.id);
                  }}
                  dataSet={[]}
                  // dataSet={filteredInviteUsers.map(user => ({
                  //   id: user?.id?.toString(),
                  //   title: user?.email,
                  // }))}
                  textInputProps={{
                    multiline: false,
                    numberOfLines: 1,
                    value: field?.email,
                    editable: !isLoading, // Disable editing if isLoading is true
                    autoCapitalize: 'none',
                    placeholder: 'Email Address',
                    style: styles.textInputStyle,
                    pointerEvents: isLoading ? 'none' : 'auto', // Prevent focus if isLoading is true
                    onChangeText: text => {
                      handleEmailChange(text, field.id);
                      setErrorMessage('');
                      onFocus();
                    },
                  }}
                  renderItem={item => (
                    <View style={styles.renderContainer}>
                      <Text style={styles.renderText}>{item.title}</Text>
                    </View>
                  )}
                />
              ) : (
                // Non-editable text for other entries
                <Text style={styles.noEmailText}>{field.email}</Text>
              )}
            </View>

            {index === emailFields.length - 1 ? (
              <Entypo
                name="plus"
                size={25}
                color="green"
                style={styles.plusIcon}
                onPress={() => {
                  if (isLoading) {
                    return;
                  } else if (field?.email) {
                    addEmailField(field.email, index);
                  }
                }}
              />
            ) : (
              <Entypo
                name="minus"
                size={25}
                color="red"
                style={styles.plusIcon}
                onPress={() => {
                  if (!isLoading) {
                    removeEmailField(field.id);
                  }
                }}
              />
            )}
          </View>
        ))}

        {errorMessage ? (
          <Text style={styles.fieldError}>{errorMessage}</Text>
        ) : null}

        <MultipleTapsPress
          onPress={handleInviteMember}
          disabled={isLoading}
          style={[
            styles.button,
            {
              backgroundColor: isInviteButtonEnabled
                ? getTemplateSpecs(
                    store.getState().loginReducer.eventDetail.template,
                  )?.btnPrimaryColor
                : colors.lightGrey,
            },
          ]}>
          <Text style={styles.buttonHeading}>
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              'Send Invite(s)'
            )}
          </Text>
        </MultipleTapsPress>
      </View>
    </View>
  );
};

export default CustomSendTeamInvite;

const styles = StyleSheet.create({
  secondContainer: {
    borderRadius: 30,
    padding: moderateScale(20),
    backgroundColor: colors.white,
    marginBottom: moderateScale(25),
    marginHorizontal: moderateScale(10),
  },
  textHeading: {fontSize: 18, fontWeight: '700', color: colors.headerBlack},
  inviteContent: {marginTop: moderateScale(10)},
  textDescription: {fontSize: 14, fontWeight: '400', color: colors.primaryGrey},
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: moderateScale(10),
  },
  inputContainer: {
    flex: 1,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#EDEDED',
    borderWidth: moderateScale(2),
    borderRadius: moderateScale(100),
    paddingVertical: moderateScale(2),
    paddingHorizontal: moderateScale(20),
  },
  dropDownContainer: {flex: 1},
  dropDownInput: {backgroundColor: colors.white, flexDirection: 'row-reverse'},
  textInputStyle: {
    textAlign: 'right',
    paddingVertical: 0,
    height: IOS ? 30 : 40,
    color: colors.primaryGrey,
    fontSize: moderateScale(14),
    paddingHorizontal: moderateScale(5),
  },
  plusIcon: {marginLeft: moderateScale(10)},
  fieldError: {fontSize: 14, color: 'red', marginLeft: 10, marginTop: 5},
  button: {
    width: 140,
    backgroundColor: colors.lightGrey,
    alignSelf: 'center',
    marginVertical: 15,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonHeading: {color: colors.white, fontSize: 14, fontWeight: '600'},
  noEmailText: {
    flex: 1,
    textAlign: 'right',
    padding: moderateScale(10),
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: colors.primaryGrey,
  },
  renderText: {textAlign: 'right', width: '100%'},
  renderContainer: {
    padding: 10,
    marginVertical: 2,
    backgroundColor: colors.white,
  },
  suggestionListContainer: {
    zIndex: 1000,
    elevation: 3,
    maxHeight: 150,
    borderRadius: 5,
    bottom: IOS ? 45 : 10,
    backgroundColor: colors.white,
  },
  rightButtonsContainer: {
    width: 0,
    height: 0,
    overflow: 'hidden',
    backgroundColor: 'red',
  },
});
