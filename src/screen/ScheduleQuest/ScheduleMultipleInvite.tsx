import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AutocompleteDropdown } from 'react-native-autocomplete-dropdown';
import Entypo from 'react-native-vector-icons/Entypo';
import { useSelector } from 'react-redux';
import CustomAlert from '../../components/CustomAlert';
import { RootState } from '../../core/store';
import { useLazyGetUsersToInviteQuery } from '../../services/teams.api';
import { colors, images } from '../../utils';
import { IOS, moderateScale } from '../../utils/metrics';

interface ScheduleMultipleInviteProps {
  emailFields?: any;
  setEmailFields?: any;
  isLoading?: boolean;
}

const ScheduleMultipleInvite = ({
  emailFields,
  setEmailFields,
  isLoading,
}: ScheduleMultipleInviteProps) => {
  const {user} = useSelector((state: RootState) => state.loginReducer);

  const [getMembersToInvite] = useLazyGetUsersToInviteQuery();
  const [inviteUsers, setInviteUsers] = React.useState([]);
  const [filteredInviteUsers, setFilteredInviteUsers] = React.useState([]); // For filtered results
  const [errorMessage, setErrorMessage] = React.useState('');

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
          CustomAlert({
            type: 'error',
            message: err?.data?.message,
          });
        });
    }
  }, [user?.preferred_event_id]);

  const addEmailField = (email, index) => {
    const isValidEmail = inviteUsers.some(user => user?.email == email);

    if (isValidEmail) {
      setEmailFields([...emailFields, {id: Date.now(), email: ''}]);
      setErrorMessage('');
    } else {
      setErrorMessage('This email is not valid!');
    }
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
    const selectedEmails = emailFields.map(field => field.email);
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

  return (
    <View style={styles.secondContainer}>
      <View style={styles.heading}>
        <Text style={styles.headingText}>
          {'Tell someone you’re doing this:'}
        </Text>
      </View>
      {emailFields?.map((field, index) => (
        <View key={field.id} style={styles.inputWrapper}>
          <View style={styles.inputContainer}>
            {index === emailFields?.length - 1 ? (
              <AutocompleteDropdown
                clearOnFocus={false}
                closeOnBlur={true}
                closeOnSubmit={false}
                onSelectItem={item => {
                  handleEmailChange(item?.title, field.id);
                }}
                containerStyle={{flex: 1}}
                inputContainerStyle={{
                  backgroundColor: colors.white,
                  flexDirection: 'row-reverse',
                }}
                dataSet={[]}
                // dataSet={filteredInviteUsers.map(user => ({
                //   id: user?.id?.toString(),
                //   title: user?.email,
                // }))}
                textInputProps={{
                  placeholder: 'Email Address',
                  style: {
                    // textAlign: 'right',
                    fontSize: moderateScale(14),
                    fontWeight: '700',
                    color: colors.primaryGrey,
                    height: moderateScale(30),
                    margin: 0,
                    padding: 0,
                  },
                  value: field?.email,

                  onChangeText: text => {
                    handleEmailChange(text, field.id);
                    setErrorMessage('');
                  },
                  editable: !isLoading, // Disable editing if isLoading is true
                  pointerEvents: isLoading ? 'none' : 'auto', // Prevent focus if isLoading is true
                }}
                renderItem={item => (
                  <View
                    style={{
                      padding: 10,
                      backgroundColor: colors.white,
                      marginVertical: 2,
                    }}>
                    <Text
                      style={{
                        // textAlign: 'right',
                        width: '100%',
                      }}>
                      {item.title}
                    </Text>
                  </View>
                )}
                suggestionsListContainerStyle={{
                  // position: 'absolute',
                  bottom: IOS ? 45 : 10,
                  backgroundColor: colors.white,
                  borderRadius: 5,
                  elevation: 3,
                  zIndex: 1000,
                  maxHeight: 150,
                }}
                rightButtonsContainerStyle={{
                  backgroundColor: 'red',
                  overflow: 'hidden',
                  height: 0,
                  width: 0,
                }}
                emptyResultText={''}
                EmptyResultComponent={<View />}
              />
            ) : (
              // Non-editable text for other entries
              <Text
                style={{
                  flex: 1,
                  padding: moderateScale(10),
                  fontSize: moderateScale(14),
                  fontWeight: '700',
                  color: colors.primaryGrey,
                  height: moderateScale(35),
                }}>
                {field.email}
              </Text>
            )}
            <images.EmailIcon height={20} width={20} />
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
              size={25}
              color={'red'}
              name={'minus'}
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
    </View>
  );
};

export default ScheduleMultipleInvite;

const styles = StyleSheet.create({
  secondContainer: {backgroundColor: colors.white},
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: moderateScale(10),
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: moderateScale(2),
    borderColor: colors.lightGrey,
    borderRadius: moderateScale(100),
    paddingVertical: moderateScale(2),
    paddingHorizontal: moderateScale(20),
  },
  plusIcon: {marginLeft: moderateScale(10)},
  fieldError: {fontSize: 14, color: 'red', marginLeft: 10, marginTop: 5},
  headingText: {
    fontWeight: '700',
    color: colors.headerBlack,
    fontSize: moderateScale(14),
    paddingLeft: moderateScale(3),
  },
  heading: {paddingBottom: moderateScale(8), flexDirection: 'row'},
});
