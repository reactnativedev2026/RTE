import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {colors} from '../../utils/colors';
import {moderateScale} from '../../utils/metrics';
import {navigate} from '../../services/NavigationService';
import {Routes} from '../../utils/Routes';
import {getTemplateSpecs} from '../../utils/helpers';
import {RootState, store} from '../../core/store';
import {useSelector} from 'react-redux';

interface ConnectAppleProps {}

const ConnectApple = ({}: ConnectAppleProps) => {
  return (
    <View style={{flex: 1}}>
      <Text style={styles.headerText}>{'Connect Apple'}</Text>
      <Text style={styles.descriptionText}>
        {
          'To sync your Apple Watch search for "Trackery" in the App Store and download the free app. Once connected, miles from your Apple Watch will sync to the RTE Tracker.'
        }
      </Text>
      <View style={styles.tContainer}>
        <Text style={styles.text}>
          Check out this{' '}
          <Text
            style={[
              styles.linkText,
              {
                color: getTemplateSpecs(
                  store.getState().loginReducer.eventDetail?.template,
                ).btnPrimaryColor,
              },
            ]}
            onPress={() => navigate(Routes.TUTORIAL)}>
            tutorial
          </Text>{' '}
          for a step-by-step guide to get set up.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tContainer: {
    borderRadius: moderateScale(10),
    marginVertical: moderateScale(10),
    justifyContent: 'center',
  },
  headerText: {
    fontSize: moderateScale(16),
    fontWeight: '800',
    color: colors.primaryGrey,
    textAlign: 'center',
    marginTop: moderateScale(10),
  },
  text: {
    fontSize: moderateScale(14),
    color: colors.primaryGrey,
    lineHeight: moderateScale(20),
    fontWeight: '400',
  },
  linkText: {
    fontSize: moderateScale(14),
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    textAlignVertical: 'center',
  },
  descriptionText: {
    fontSize: moderateScale(14),
    fontWeight: '400',
    color: colors.primaryGrey,
    lineHeight: moderateScale(20),
    marginTop: moderateScale(20),
  },
});

export default ConnectApple;
