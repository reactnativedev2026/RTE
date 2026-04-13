import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import ReactNativeModal from 'react-native-modal';
import Feather from 'react-native-vector-icons/Feather';
import { store } from '../core/store';
import { colors } from '../utils';
import { getTemplateSpecs } from '../utils/helpers';
import { moderateScale } from '../utils/metrics';
import CustomDropDown from './CustomDropDown';
import MultipleTapsPress from './MultipleTapsPress';

interface CustomModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onCloseIcon: () => void;
  title?: string;
  description?: string;
  cancelButtonTitle?: string;
  confirmButtonTitle?: string;
  showDescription?: boolean;
  options?: string[];
  selectedOption?: string;
  onSelectOption?: (value: string) => void;
  containerStyle?: StyleProp<ViewStyle>;
  descriptionStyle?: any;
  hideCancelBtn?: boolean;
  children?: React.ReactNode;
  optionsLoading?: boolean;
  customBtnStyle?: any;
  customCancelButton?: any;
  disabled?: boolean;
  hideConfirmBtn?: boolean;
}

const CustomModal2: React.FC<CustomModalProps> = ({
  visible,
  disabled,
  onClose,
  onConfirm,
  onCloseIcon,
  title = 'Are you sure?',
  description = 'Are you sure you want to proceed?',
  cancelButtonTitle = 'Cancel',
  confirmButtonTitle = 'Confirm',
  showDescription = true,
  options = [],
  selectedOption,
  onSelectOption,
  containerStyle,
  descriptionStyle,
  hideCancelBtn,
  children,
  optionsLoading,
  customBtnStyle,
  customCancelButton,
  hideConfirmBtn,
}) => {
  return (
    <ReactNativeModal
      isVisible={visible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      animationIn="fadeInUp"
      animationOut="fadeOutDown"
      useNativeDriver
      hideModalContentWhileAnimating
      backdropTransitionOutTiming={0}
      statusBarTranslucent
      style={{ margin: 0, justifyContent: 'center', alignItems: 'center' }}
    >
      <View style={[styles.modalContent, containerStyle]}>
        <View style={styles.modalTitleContainer}>
          <Text style={styles.modalTitle}>{title}</Text>
          <TouchableOpacity onPress={onCloseIcon}>
            <Feather name="x" size={24} color={colors.lightGrey} />
          </TouchableOpacity>
        </View>

        {showDescription && (
          <Text style={[styles.modalDescription, descriptionStyle]}>
            {description}
          </Text>
        )}

        {children}

        {options.length > 0 && !optionsLoading && (
          <View style={{ width: '100%', height: 70 }}>
            <CustomDropDown
              data={options}
              setSelectedValue={onSelectOption}
              value={selectedOption}
            />
          </View>
        )}

        <View style={styles.modalButtons}>
          {!hideCancelBtn && (
            <TouchableOpacity
              style={[styles.modalButtonCancel, customCancelButton]}
              onPress={onClose}
            >
              <Text style={styles.modalButtonText}>{cancelButtonTitle}</Text>
            </TouchableOpacity>
          )}

          {!hideConfirmBtn && (
            <MultipleTapsPress
              disabled={disabled}
              style={[
                styles.modalButton,
                {
                  backgroundColor: getTemplateSpecs(
                    store.getState().loginReducer.eventDetail?.template,
                  ).btnPrimaryColor,
                },
                customBtnStyle,
              ]}
              onPress={onConfirm}
            >
              <Text style={styles.modalButtonText}>{confirmButtonTitle}</Text>
            </MultipleTapsPress>
          )}
        </View>
      </View>
    </ReactNativeModal>
  );
};

export default CustomModal2;

const styles = StyleSheet.create({
  modalContent: {
    width: '90%',
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingVertical: moderateScale(20),
    paddingHorizontal: moderateScale(15),
    alignItems: 'center',
  },
  modalTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: moderateScale(10),
  },
  modalTitle: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: colors.headerBlack,
    width: '90%',
  },
  modalDescription: {
    fontSize: 14,
    textAlign: 'left',
    marginBottom: moderateScale(20),
    width: '100%',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  modalButtonCancel: {
    height: 40,
    backgroundColor: colors.lightGrey,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    paddingHorizontal: moderateScale(20),
  },
  modalButton: {
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: moderateScale(20),
  },
  modalButtonText: {
    textAlign: 'center',
    color: colors.white,
    fontSize: moderateScale(14),
    fontWeight: '700',
  },
});
