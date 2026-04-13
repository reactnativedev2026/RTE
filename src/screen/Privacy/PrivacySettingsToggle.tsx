import React from 'react';
import {colors} from '../../utils';
import {store} from '../../core/store';
import FastImage from 'react-native-fast-image';
import {moderateScale} from '../../utils/metrics';
import {StyleSheet, Text, View} from 'react-native';
import {getTemplateSpecs} from '../../utils/helpers';
import {CustomHorizontalLine, CustomToggleSwitch} from '../../components';

interface PrivacySettingsToggleProps {
  item?: any;
  onToggle?: (value: any) => void;
}

const PrivacySettingsToggle = ({
  item,
  onToggle,
}: PrivacySettingsToggleProps) => {
  return (
    <View>
      <CustomHorizontalLine customStyle={styles.line} />
      <FastImage
        source={{uri: item?.logo_url}}
        style={styles.image}
        resizeMode={'contain'}
      />
      <CustomToggleSwitch
        isOn={item?.user?.participation?.public_profile}
        onToggle={() => {
          onToggle && onToggle(item?.user?.participation);
        }}
        label={`${
          item?.user?.participation?.public_profile ? 'Public' : 'Private'
        } Profile`}
        onColor={
          getTemplateSpecs(store.getState().loginReducer.eventDetail?.template)
            ?.settingsColor || colors.lightBlue
        }
        offColor="grey"
        labelStyle={styles.customToogle}
      />
      <Text style={styles.label}>{`Your profile is set to ${
        item?.user?.participation?.public_profile ? 'public' : 'private'
      }.`}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  line: {marginTop: moderateScale(20)},
  label: {
    fontWeight: '600',
    color: colors.headerBlack,
    fontSize: moderateScale(14),
    lineHeight: moderateScale(20),
  },
  image: {
    alignSelf: 'center',
    height: moderateScale(60),
    width: moderateScale(140),
  },
  customToogle: {fontWeight: '700'},
});

export default PrivacySettingsToggle;
