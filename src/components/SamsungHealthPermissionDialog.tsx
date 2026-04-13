import React from 'react';
import {StyleSheet, Text, View, ActivityIndicator} from 'react-native';
import CustomModal from './CustomModal';
import {colors} from '../utils/colors';
import {moderateScale} from '../utils/metrics';

interface SamsungHealthPermissionDialogProps {
  visible: boolean;
  missingPermissions: string[];
  onRequestPermissions: () => Promise<boolean>;
  onDismiss: () => void;
}

export const SamsungHealthPermissionDialog: React.FC<
  SamsungHealthPermissionDialogProps
> = ({visible, missingPermissions, onRequestPermissions, onDismiss}) => {
  const [isRequesting, setIsRequesting] = React.useState(false);

  const handleRequestPermissions = async () => {
    setIsRequesting(true);
    try {
      const granted = await onRequestPermissions();
      if (granted) {
        // Success - dialog will close automatically via visible prop
      } else {
        // User denied - close dialog
        onDismiss();
      }
    } catch (error) {
      onDismiss();
    } finally {
      setIsRequesting(false);
    }
  };

  const permissionList = missingPermissions.join(', ');

  return (
    <CustomModal
      visible={visible}
      title="Samsung Health Permissions"
      description={`Your Samsung Health connection needs additional permissions to sync data:\n\n${permissionList}\n\nWould you like to grant these permissions now?`}
      showDescription={true}
      descriptionStyle={styles.description}
      cancelButtonTitle="Not Now"
      confirmButtonTitle={isRequesting ? 'Requesting...' : 'Grant Permissions'}
      disabled={isRequesting}
      onClose={onDismiss}
      onCloseIcon={onDismiss}
      onConfirm={handleRequestPermissions}>
      {isRequesting && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primaryMediumBlue} />
          <Text style={styles.loadingText}>Opening Samsung Health...</Text>
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
