import React from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import {BarIndicator} from 'react-native-indicators';
import ToggleSwitch from 'toggle-switch-react-native';
import {colors} from '../utils';
import {moderateScale} from '../utils/metrics';

interface CustomToggleSwitchProps {
  isOn?: boolean;
  onToggle: (isOn: boolean) => void;
  label?: string;
  onColor?: string;
  offColor?: string;
  containerStyle?: any;
  labelStyle?: any;
  loading?: boolean | undefined;
  toggleStyle?: any;
}

const CustomToggleSwitch: React.FC<CustomToggleSwitchProps> = ({
  isOn,
  onToggle,
  label,
  onColor = colors.lightBlue,
  offColor = 'grey',
  containerStyle,
  labelStyle,
  loading,
  toggleStyle,
}) => {
  return (
    <React.Fragment>
      {loading && (
        <ActivityIndicator
          size="large"
          color={colors.primaryMediumBlue}
          style={styles.activityIndicator}
        />
      )}
      <View style={[styles.container, containerStyle]}>
        {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
        {!loading ? (
          <ToggleSwitch
            isOn={isOn}
            onColor={onColor}
            offColor={offColor}
            labelStyle={styles.toggleLabel}
            size="small"
            onToggle={onToggle}
            disabled={loading}
            style={[styles.toggle, toggleStyle]}
          />
        ) : (
          <View style={styles.indicator}>
            <BarIndicator size={moderateScale(20)} color={offColor} count={4} />
          </View>
        )}
      </View>
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  label: {color: colors.headerBlack, fontWeight: '600', marginRight: 10},
  toggleLabel: {color: 'transparent'},
  indicator: {
    alignSelf: 'flex-end',
    height: moderateScale(23),
    alignItems: 'center',
  },
  toggle: {height: moderateScale(23), marginRight: moderateScale(5)},
  activityIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    zIndex: 1,
  },
});

export default CustomToggleSwitch;
