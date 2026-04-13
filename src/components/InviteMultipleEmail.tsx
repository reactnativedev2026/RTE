import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AutocompleteDropdown } from 'react-native-autocomplete-dropdown';
import Entypo from 'react-native-vector-icons/Entypo';
import { colors, images } from '../utils';
import { moderateScale } from '../utils/metrics';

interface InviteMultipleEmailProps {
  emailFields?: any;
  filteredInviteUsers?: any;
  isLoading: boolean;
  errorMessage: string;
  handleEmailChange: (text: string, id: number) => void;
  addEmailField: (email: string, index: number) => void;
  removeEmailField: (id: number) => void;
  setErrorMessage: (message: string) => void;
}

const InviteMultipleEmail: React.FC<InviteMultipleEmailProps> = ({
  emailFields,
  filteredInviteUsers,
  isLoading,
  errorMessage,
  handleEmailChange,
  addEmailField,
  removeEmailField,
  setErrorMessage,
}) => {
  return (
    <View>
      {emailFields?.map((field, index) => (
        <View key={field.id} style={styles.inputWrapper}>
          <View style={styles.inputContainer}>
            <images.EmailIcon height={20} width={20} />

            {index === emailFields?.length - 1 ? (
              <AutocompleteDropdown
                clearOnFocus={false}
                closeOnBlur={true}
                closeOnSubmit={false}
                onSelectItem={item => {
                  handleEmailChange(item?.title || '', field.id);
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
                    textAlign: 'right',
                    fontSize: moderateScale(14),
                    fontWeight: '700',
                    color: colors.primaryGrey,
                  },
                  value: field?.email,
                  onChangeText: text => {
                    handleEmailChange(text, field.id);
                    setErrorMessage('');
                  },
                  editable: !isLoading,
                  pointerEvents: isLoading ? 'none' : 'auto',
                }}
                renderItem={item => (
                  <View
                    style={{
                      padding: 10,
                      backgroundColor: colors.white,
                      marginVertical: 2,
                    }}>
                    <Text style={{textAlign: 'right', width: '100%'}}>
                      {item.title}
                    </Text>
                  </View>
                )}
                rightButtonsContainerStyle={{
                  backgroundColor: 'red',
                  overflow: 'hidden',
                  height: 0,
                  width: 0,
                }}
              />
            ) : (
              <Text
                style={{
                  flex: 1,
                  textAlign: 'right',
                  padding: moderateScale(10),
                  fontSize: moderateScale(14),
                  fontWeight: '700',
                  color: colors.primaryGrey,
                }}>
                {field.email}
              </Text>
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
    </View>
  );
};

export default InviteMultipleEmail;

const styles = StyleSheet.create({
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: moderateScale(10),
  },
  inputContainer: {
    flex: 1,
    borderWidth: moderateScale(2),
    borderColor: '#EDEDED',
    borderRadius: moderateScale(100),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(20),
    paddingVertical: moderateScale(2),
  },
  plusIcon: {
    marginLeft: moderateScale(10),
  },
  fieldError: {
    fontSize: 14,
    color: 'red',
    marginLeft: 10,
    marginTop: 5,
  },
});
