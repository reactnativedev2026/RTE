import React from 'react';
import {View, TextInput, StyleSheet, ScrollView, Text} from 'react-native';
import {colors} from '../../utils';
import {moderateScale} from '../../utils/metrics';

const EmailInputField = ({setEmails, setInput, input}) => {
  const handleChange = (text: string) => {
    // if (text.includes(',')) {
    //   const parts = text.split(',');
    //   const lastEmail = parts[0].trim();
    //   if (validateEmail(lastEmail)) {
    //     setEmails(prev => [...prev, lastEmail]);
    //     setIsInvalid(false);
    //   } else {
    //     setIsInvalid(true);
    //   }
    //   setInput('');
    // } else {
    //   setInput(text);
    //   setIsInvalid(text.length > 0 && !validateEmail(text));
    // }

    const parts = text?.split(',');
    setEmails(text ? parts : []);
    setInput(text);
  };

  return (
    <View>
      <Text style={styles.headingText}>
        {'Tell someone you’re doing this:'}
      </Text>
      <View
        style={[styles.chipInputContainer, input ? styles.inputError : null]}>
        {/* <ScrollView horizontal showsHorizontalScrollIndicator={false}> */}
        <TextInput
          value={input}
          onChangeText={handleChange}
          placeholder="tam@bourine.com, tom@tom.com"
          style={styles.textInput}
          autoCapitalize="none"
          placeholderTextColor={colors.primaryGrey}
        />
        {/* </ScrollView> */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headingText: {
    fontWeight: '700',
    color: colors.headerBlack,
    fontSize: moderateScale(14),
    paddingLeft: moderateScale(3),
    marginBottom: moderateScale(10),
  },
  chipInputContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderWidth: 1.5,
    borderColor: '#ccc',
    borderRadius: 30,
    paddingHorizontal: 8,
    alignItems: 'center',
    minHeight: 45,
  },
  inputError: {borderColor: colors.primaryBrown},
  chip: {
    flexDirection: 'row',
    backgroundColor: '#e0f7fa',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 6,
    alignItems: 'center',
  },
  chipText: {fontSize: 14, color: '#00796b'},
  chipClose: {color: '#00796b', fontWeight: 'bold', marginLeft: 8},
  textInput: {
    flex: 1,
    minWidth: 150,
    fontSize: 16,
    padding: 4,
    height: 40,
  },
});

export default EmailInputField;
