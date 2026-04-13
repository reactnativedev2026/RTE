import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {colors} from '../../utils/colors';

interface ProfileCredentialsProps {
  label: string | any;
  heading: string;
}

const ProfileCredentials = ({heading, label}: ProfileCredentialsProps) => {
  return (
    <View style={styles.rowView}>
      <Text style={styles.headingStyle}>{heading}</Text>
      <Text style={styles.inputStyle} numberOfLines={3}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  rowView: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  headingStyle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.headerBlack,
    width: '30%',
  },
  inputStyle: {
    color: colors.lightGrey,
    width: '70%',
    textAlign: 'right',
    fontSize: 14,
    fontWeight: '500',
  },
});
export default ProfileCredentials;
