import React from 'react';
import { Keyboard, Pressable, StyleSheet } from 'react-native';
import ReactNativeModal from 'react-native-modal';
import { colors } from '../../utils';
import { moderateScale } from '../../utils/metrics';
import AddPhotoModalContent from './AddPhotoModalContent';

interface AddPhotoModalProps {
  onRequestClose?: () => void;
  visible?: boolean;
  onClose?: () => void;
  onPressUpload?: () => void;
  setManageQuest?: any;
  manageQuest?: any;
  error?: string | undefined;
  onPressSave?: () => void;
  questItem?: any;
}
const AddPhotoModal = ({
  onRequestClose,
  visible,
  onClose,
  onPressUpload,
  setManageQuest,
  manageQuest,
  error,
  onPressSave,
  questItem,
}: AddPhotoModalProps) => {
  return (
    <ReactNativeModal
      isVisible={visible}
      animationIn="zoomIn"
      animationOut="zoomOut"
      useNativeDriver
      useNativeDriverForBackdrop
      hideModalContentWhileAnimating
      backdropTransitionOutTiming={0}
      animationOutTiming={150}
      style={{margin: 0}}
      onBackdropPress={onRequestClose}
      onBackButtonPress={onRequestClose}
      onModalHide={() => Keyboard.dismiss()}>
      <Pressable
        onPress={() => Keyboard.dismiss()}
        style={{
          backgroundColor: colors.white,
          paddingVertical: moderateScale(20),
          paddingHorizontal: moderateScale(15),
          borderRadius: moderateScale(8),
        }}>
        <AddPhotoModalContent
          onClose={onClose}
          onPressUpload={onPressUpload}
          setManageQuest={setManageQuest}
          manageQuest={manageQuest}
          error={error}
          onPressSave={onPressSave}
          questItem={questItem}
        />
      </Pressable>
    </ReactNativeModal>
  );
};
export default AddPhotoModal;

const styles = StyleSheet.create({});
