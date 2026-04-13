import React from 'react';
import {StyleSheet, Text, View, ActivityIndicator} from 'react-native';
import CustomModal from './CustomModal';
import {colors} from '../utils/colors';
import {moderateScale} from '../utils/metrics';

interface WelcomeBackAlertProps {
  visible: boolean;
  title: string;
  message: string;
  isReconnecting: boolean;
  deviceName: string | null;
  onDismiss: () => void;
  onReconnect: () => void;
}

export const WelcomeBackAlert: React.FC<WelcomeBackAlertProps> = ({
  visible,
  title,
  message,
  isReconnecting,
  deviceName,
  onDismiss,
  onReconnect,
}) => {
  const getButtonTitle = () => {
    if (isReconnecting) {
      return 'Reconnecting...';
    }
    if (deviceName) {
      return `Reconnect ${deviceName}`;
    }
    return 'Reconnect Garmin';
  };

  return (
    <CustomModal
      visible={visible}
      title={title}
      description={message}
      showDescription={true}
      descriptionStyle={styles.description}
      confirmButtonTitle={getButtonTitle()}
      hideCancelBtn={true}
      disabled={isReconnecting}
      onClose={isReconnecting ? () => {} : onDismiss}
      onCloseIcon={isReconnecting ? () => {} : onDismiss}
      onConfirm={!isReconnecting ? onReconnect : onDismiss}>
      {isReconnecting && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primaryMediumBlue} />
          <Text style={styles.loadingText}>Disconnecting and reconnecting device...</Text>
        </View>
      )}
    </CustomModal>
  );
};

const styles = StyleSheet.create({
  description: {
    fontSize: moderateScale(13),
    color: colors.primaryGrey,
    lineHeight: moderateScale(20),
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: moderateScale(15),
  },
  loadingText: {
    marginTop: moderateScale(10),
    fontSize: moderateScale(12),
    color: colors.primaryGrey,
  },
});
