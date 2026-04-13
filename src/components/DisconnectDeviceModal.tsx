import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useDeleteDataSourceMutation} from '../services/deviceConnect.api';
import {deviceName} from '../utils/dummyData';
import CustomModal from './CustomModal';
import ProfileDatePicker from '../screen/Profile/ProfileDatePicker';
import {rteDateFormatFullMonth} from '../utils/dateFormats';
import {getTemplateSpecs} from '../utils/helpers';
import {store} from '../core/store';
import {colors} from '../utils/colors';
import {moderateScale} from '../utils/metrics';

interface DisconnectDeviceModalProps {
  modal: boolean;
  setModal: any;
  preserved: boolean;
  setLoading: any;
  shortNameId: number;
  setPreserved: any;
}

const DisconnectDeviceModal = ({
  modal,
  setModal,
  preserved,
  setLoading,
  shortNameId,
  setPreserved,
}: DisconnectDeviceModalProps) => {
  const [deleteDataSource] = useDeleteDataSourceMutation();

  // Initialize delete date to 1st January of current year
  const getDefaultDeleteDate = () => {
    const currentYear = new Date().getFullYear();
    return new Date(currentYear, 0, 1); // January 1st of current year
  };

  const [deleteFromDate, setDeleteFromDate] = React.useState<Date>(
    getDefaultDeleteDate(),
  );

  // Get minimum date (1st January of current year) and maximum date (today)
  const getMinDate = () => {
    const currentYear = new Date().getFullYear();
    return new Date(currentYear, 0, 1); // January 1st of current year
  };

  const getMaxDate = () => {
    return new Date(); // Today
  };

  const PrimaryColor = getTemplateSpecs(
    store.getState().loginReducer.eventDetail?.template,
  ).btnPrimaryColor;

  return (
    <CustomModal
      visible={modal}
      title={`Disconnect ${Object.keys(deviceName)[shortNameId - 1]}`}
      description={
        'You can choose whether you want to keep previously synced miles, or delete all synced entries.'
      }
      // descriptionStyle={styles.modalDesc}
      confirmButtonTitle={'Disconnect'}
      showDescription={true}
      hideCancelBtn
      onClose={() => {}}
      onConfirm={() => {
        setLoading(true);
        const disconnectPayload: any = {
          data_source_id: shortNameId,
          synced_mile_action: preserved ? 'preserve' : 'delete',
        };

        // Add delete_from date if deleting miles
        if (!preserved) {
          disconnectPayload.delete_from = rteDateFormatFullMonth(deleteFromDate);
        }

        deleteDataSource(disconnectPayload)
          .unwrap()
          .finally(() => setLoading(false));
        setModal(false);
      }}
      onCloseIcon={() => setModal(false)}>
      <View style={styles.preserved_view}>
        <TouchableOpacity
          onPress={() => setPreserved(true)}
          style={styles.preserved_btn}>
          <Ionicons
            size={25}
            color={preserved ? 'blue' : 'gray'}
            name={preserved ? 'checkmark-circle-outline' : 'ellipse-outline'}
          />
          <Text style={styles.syncedMiles_txt}>Preserve Synced Miles</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setPreserved(false)}
          style={styles.preserved_btn}>
          <Ionicons
            size={25}
            color={!preserved ? 'blue' : 'gray'}
            name={!preserved ? 'checkmark-circle-outline' : 'ellipse-outline'}
          />
          <Text style={styles.syncedMiles_txt}>Delete Synced Miles</Text>
        </TouchableOpacity>
      </View>
      {!preserved && (
        <View style={styles.datePickerContainer}>
          <ProfileDatePicker
            value={deleteFromDate}
            onChangeText={(date: Date) => setDeleteFromDate(date)}
            headingText="Delete data from:"
            minimumDate={getMinDate()}
            maximumDate={getMaxDate()}
            containerStyle={[
              styles.datePickerStyle,
              {borderColor: PrimaryColor},
            ]}
            calendarStyle={{fill: PrimaryColor}}
          />
        </View>
      )}
    </CustomModal>
  );
};
export default DisconnectDeviceModal;
const styles = StyleSheet.create({
  preserved_view: {alignSelf: 'flex-start'},
  preserved_btn: {flexDirection: 'row', alignItems: 'center'},
  syncedMiles_txt: {marginLeft: 5},
  datePickerContainer: {
    marginTop: moderateScale(20),
  },
  datePickerStyle: {
    marginHorizontal: 0,
  },
});
