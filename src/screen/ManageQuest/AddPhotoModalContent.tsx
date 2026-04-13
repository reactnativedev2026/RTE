import moment from 'moment';
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import Feather from 'react-native-vector-icons/Feather';
import {
  CustomBottonsContainer,
  CustomHorizontalLine,
  CustomInput,
} from '../../components';
import { colors } from '../../utils';
import { moderateScale } from '../../utils/metrics';
import ProfileDatePicker from '../Profile/ProfileDatePicker';

interface AddPhotoModalContentProps {
  onClose?: () => void;
  onPressUpload?: () => void;
  error?: string | undefined;
  setManageQuest?: any;
  manageQuest?: any;
  onPressSave?: () => void;
  questItem?: any;
}

const AddPhotoModalContent = ({
  onClose,
  onPressUpload,
  error,
  setManageQuest,
  manageQuest,
  onPressSave,
  questItem,
}: AddPhotoModalContentProps) => {
  const [isLoading, setLoading] = React.useState(true);
  const getFileName = (filePath: any) => {
    // Extract the filename using the last '/' character
    return filePath?.substring(filePath.lastIndexOf('/') + 1);
  };

  return (
    <View>
      <View style={styles.headerRow}>
        <Text style={styles.headerText}>Add Notes/Photo</Text>
        <Pressable onPress={onClose}>
          <Feather name={'x'} size={24} color={colors.lightGrey} />
        </Pressable>
      </View>
      <Text style={styles.subHeaderText}>
        Below you can add notes and photos for this quest:
      </Text>
      <Text style={styles.centerText}>{questItem?.activity?.name}</Text>
      <View style={styles.centerRow}>
        <Text style={styles.centerRowText}>
          {moment(manageQuest?.date).format('MMMM Do, YYYY')}
          {/* manageQuest */}
        </Text>
        <Text
          style={
            styles.centerRowText
          }>{` | ${questItem?.activity?.total_points} Miles`}</Text>
      </View>
      <CustomHorizontalLine customStyle={styles.horizontalLine} />
      <View style={{marginHorizontal: moderateScale(40), alignSelf: 'center'}}>
        {!questItem?.is_past && (
          <ProfileDatePicker
            value={manageQuest?.date}
            headingText="Quest Date"
            onChangeText={text =>  setManageQuest({...manageQuest, date: text, error: ''})}
            noMaximumDate
          />
        )}
        <View style={styles.buttons}>
          <Pressable style={styles.buttonBg} onPress={onPressUpload}>
            <Text style={styles.buttonTxt}>Upload</Text>
          </Pressable>
          {questItem?.image || manageQuest?.photo?.path ? (
            <View style={{flex: 1, alignItems: 'center'}}>
              <FastImage
                fallback={true}
                style={styles.image}
                onLoadEnd={() => setLoading(false)}
                onLoadStart={() => setLoading(true)}
                resizeMode={FastImage.resizeMode.contain}
                source={{
                  uri: manageQuest?.photo?.path || questItem?.image,
                  priority: FastImage.priority.high,
                }}>
                {isLoading && (
                  <ActivityIndicator
                    size={'small'}
                    style={styles.loaderStyle}
                  />
                )}
              </FastImage>
            </View>
          ) : (
            <Text style={styles.addPhoto} numberOfLines={4}>
              {getFileName(manageQuest?.photo?.path) || 'Add Photo'}
            </Text>
          )}
        </View>
        <View style={styles.inputContainer}>
          <CustomInput
            containerStyle={styles.customInputContainer}
            inputStyle={[styles.input]}
            props={{
              placeholder: 'Click here to add a note.\n100 characters max.',
              value: manageQuest?.note,
              onChangeText: (text: string) => {
                setManageQuest &&
                  setManageQuest({...manageQuest, note: text, error: ''});
              },
              multiline: true,
              textAlignVertical: 'top',
              maxLength: 100,
            }}
          />

          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
        <CustomHorizontalLine />
        <CustomBottonsContainer
          onPressBtn={onClose}
          onPressSave={onPressSave}
          containerStyle={{marginTop: moderateScale(20)}}
        />
      </View>
    </View>
  );
};

export default AddPhotoModalContent;

const styles = StyleSheet.create({
  headerRow: {flexDirection: 'row', justifyContent: 'space-between'},
  headerText: {
    fontWeight: '700',
    color: colors.headerBlack,
    fontSize: moderateScale(16),
  },
  subHeaderText: {
    fontWeight: '400',
    color: colors.primaryGrey,
    marginTop: moderateScale(5),
    fontSize: moderateScale(14),
  },
  centerText: {
    fontWeight: '700',
    textAlign: 'center',
    color: colors.headerBlack,
    fontSize: moderateScale(14),
    marginTop: moderateScale(10),
  },
  centerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: moderateScale(5),
  },
  centerRowText: {
    fontWeight: '700',
    textAlign: 'center',
    color: colors.headerBlack,
    fontSize: moderateScale(14),
    marginTop: moderateScale(10),
  },
  horizontalLine: {marginTop: moderateScale(30)},
  buttons: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: moderateScale(20),
  },
  buttonBg: {
    borderRadius: moderateScale(30),
    paddingVertical: moderateScale(7),
    backgroundColor: colors.lightGrey,
    paddingHorizontal: moderateScale(32),
  },
  buttonTxt: {
    fontWeight: '700',
    color: colors.white,
    fontSize: moderateScale(14),
  },
  addPhoto: {
    flex: 1,
    fontWeight: '700',
    textAlign: 'right',
    color: colors.headerBlack,
    fontSize: moderateScale(14),
    maxWidth: moderateScale(120),
    marginLeft: moderateScale(30),
  },
  customInputContainer: {
    width: '100%',
    borderRadius: 10,
    paddingHorizontal: 5,
  },
  input: {
    height: 100,
    textAlignVertical: 'top',
    color: colors.primaryGrey,
    borderRadius: moderateScale(10),
  },
  errorText: {
    width: '75%',
    color: colors.primaryRed,
    fontSize: moderateScale(12),
  },
  inputContainer: {marginTop: moderateScale(5)},
  image: {
    borderWidth: 1,
    borderRadius: 10,
    width: moderateScale(53),
    borderColor: colors.gray,
    height: moderateScale(55),
  },
  loaderStyle: {flex: 1},
});
