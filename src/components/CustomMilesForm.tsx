import { FieldArray, Formik } from 'formik';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useAdjustKeyboard } from '../hooks';
import { useLazyGetEventModalitiesQuery } from '../services/Calander.api';
import { colors } from '../utils/colors';
import { ANDROID, moderateScale } from '../utils/metrics';
import { userPointsSchema } from '../utils/validation';
import CustomBottonsContainer from './CustomBottonsContainer';
import CustomCalanderFooter from './CustomCalanderFooter';
import { CustomHeader, CustomScreenLoader, Listing } from './index';

interface CustomMilesFormProps {
  onPressCancel?: () => void;
  setNoteDetail?: Dispatch<SetStateAction<object | null>>;
  onPressSave?: (values: object | undefined) => void;
  fitBit?: any;
  pointsDetail?: object[] | undefined | null;
  footerObj?: any;
  noteDetail: any;
  isLoading?: boolean;
  eventId?: string | number | undefined;
}
const CustomMilesForm = ({
  onPressCancel,
  setNoteDetail,
  onPressSave,
  fitBit,
  pointsDetail = [],
  footerObj,
  noteDetail,
  isLoading,
  eventId,
}: CustomMilesFormProps) => {

  useAdjustKeyboard();
  const {EventModalitiesListing} = Listing;
  const scrollRef = React.useRef(null);

  const [modalities, setModalities] = useState([]);
  const [getEventModalities, {isFetching}] = useLazyGetEventModalitiesQuery();

  const handleScrollToEnd = () => {
    if (ANDROID) {
      scrollRef.current?.scrollToEnd({animated: true});
    }
  };
  useEffect(() => {
    if (eventId) {
      getEventModalities({event_id: eventId})
        .unwrap()
        .then(res => {
          setModalities(res?.data?.event_modalities || []);
        })
        .catch(error => {});
    }
  }, [eventId]);

  const onSubmitUserPoints = (values: any) => {
    const dataSourceId = 1;
    const points = values.modalities
      .map(({modality, amount, id}) => ({
        modality,
        data_source_id: dataSourceId,
        amount: Number(amount) ,
        id: id,
      }));

    onPressSave && onPressSave({points, notes: noteDetail});
  };

  if (isFetching || isLoading) {
    return (
      <View
        style={{
          ...StyleSheet.absoluteFillObject,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <CustomScreenLoader />
      </View>
    );
  }
  const existingModalities =
    pointsDetail
      ?.filter(detail => detail.data_source_id === 1)
      ?.map(detail => ({
        modality: detail.modality,
        amount: detail.amount,
        data_source_id: detail.data_source_id,
        id: detail.id,
      })) || [];

  // Extract all the modality names from pointsDetail
  const presentModalities = existingModalities.map(item => item.modality);
 
  // Find which modalities from `modalities` list are missing
  const missingModalities = modalities.filter(
    modality => !presentModalities.includes(modality),
  );

  // Create default empty entries for missing modalities
  const defaultModalities = missingModalities.map(modality => ({
    modality,
    amount: '',
    data_source_id: 1,
    id: null,
  }));

  // Build a map for quick lookup
  const existingMap = new Map(existingModalities.map(m => [m.modality, m]));
  const defaultMap = new Map(defaultModalities.map(m => [m.modality, m]));
  // Use the master order from the modalities array
  const initialModalities = modalities.map(
    modality => existingMap.get(modality) || defaultMap.get(modality),
  );

  const fitbitDataLength =
    pointsDetail?.filter(item => item?.data_source_id === 2).length || 0;
  const garminDataLength =
    pointsDetail?.filter(item => item?.data_source_id === 3).length || 0;
  const straviaDataLength =
    pointsDetail?.filter(item => item?.data_source_id === 4).length || 0;
  const appleDataLength =
    pointsDetail?.filter(item => item?.data_source_id === 5).length || 0;
  const ouraDataLength =
    pointsDetail?.filter(item => item?.data_source_id === 6).length || 0;
  const samsungDataLength =
    pointsDetail?.filter(item => item?.data_source_id === 7).length || 0;

  return (
    <KeyboardAwareScrollView
      innerRef={ref => {
        scrollRef.current = ref;
      }}
      enableOnAndroid={true} // Ensures compatibility with Android devices
      keyboardShouldPersistTaps="handled" // Allows taps to propagate while the keyboard is open
      contentContainerStyle={styles.contentContainer}
      style={{flex: 1}}
      extraHeight={250} // Equivalent to `keyboardOffset`
      showsVerticalScrollIndicator={false}>
      <View style={styles.firstContainer}>
        <CustomHeader
          hideEditBtn={true}
          onPressBack={
            onPressCancel
              ? () => {
                  onPressCancel();
                }
              : undefined
          }
        />
        <View style={styles.footerContainer}>
          <CustomCalanderFooter
            hideNotes
            miles={fitBit?.miles || 0}
            hideEdit
            footerObj={footerObj}
            isLoading={false}
          />
        </View>

        <Formik
          initialValues={{
            modalities: initialModalities,
          }}
          enableReinitialize
          onSubmit={onSubmitUserPoints}
          validationSchema={userPointsSchema}>
          {({handleChange, handleSubmit, values}) => {
            return (
              <View style={styles.containerView}>
                {fitbitDataLength !== 0 && (
                  <View style={styles.centerAlign}>
                    <Text style={styles.infoText}>
                      Activities Synced From Fitbit
                    </Text>
                    <FieldArray name="modalities2">
                      {() =>
                        pointsDetail
                          ?.filter(item => item?.data_source_id === 2)
                          ?.map((item, index) => {
                            return (
                              <EventModalitiesListing
                                item={item}
                                value={item?.amount}
                                onChangeText={handleChange(
                                  `modalities[${index}].amount`,
                                )}
                              />
                            );
                          })
                      }
                    </FieldArray>
                  </View>
                )}
                {garminDataLength !== 0 && (
                  <View style={styles.centerAlign}>
                    <Text style={styles.infoText}>
                      Activities Synced From Garmin
                    </Text>
                    <FieldArray name="modalities2">
                      {() =>
                        pointsDetail
                          ?.filter(item => item.data_source_id === 3)
                          ?.map((item, index) => {
                            return (
                              <EventModalitiesListing
                                item={item}
                                value={item?.amount}
                                onChangeText={handleChange(
                                  `modalities[${index}].amount`,
                                )}
                              />
                            );
                          })
                      }
                    </FieldArray>
                  </View>
                )}
                {straviaDataLength !== 0 && (
                  <View style={styles.centerAlign}>
                    <Text style={styles.infoText}>
                      Activities Synced From Strava
                    </Text>
                    <FieldArray name="modalities2">
                      {() =>
                        pointsDetail
                          ?.filter(item => item.data_source_id === 4)
                          ?.map((item, index) => {
                            return (
                              <EventModalitiesListing
                                item={item}
                                value={item?.amount}
                                onChangeText={handleChange(
                                  `modalities[${index}].amount`,
                                )}
                              />
                            );
                          })
                      }
                    </FieldArray>
                  </View>
                )}
                {appleDataLength !== 0 && (
                  <View style={styles.centerAlign}>
                    <Text style={styles.infoText}>
                      Activities Synced From Apple
                    </Text>
                    <FieldArray name="modalities2">
                      {() =>
                        pointsDetail
                          ?.filter(item => item.data_source_id === 5)
                          ?.map((item, index) => {
                            return (
                              <EventModalitiesListing
                                item={item}
                                value={item?.amount}
                                onChangeText={handleChange(
                                  `modalities[${index}].amount`,
                                )}
                              />
                            );
                          })
                      }
                    </FieldArray>
                  </View>
                )}
                {samsungDataLength !== 0 && (
                  <View style={styles.centerAlign}>
                    <Text style={styles.infoText}>
                      Activities From Samsung Health
                    </Text>
                    <FieldArray name="modalities2">
                      {() =>
                        pointsDetail
                          ?.filter(item => item.data_source_id === 7)
                          ?.map((item, index) => {
                            return (
                              <EventModalitiesListing
                                item={item}
                                value={item?.amount}
                                onChangeText={handleChange(
                                  `modalities[${index}].amount`,
                                )}
                              />
                            );
                          })
                      }
                    </FieldArray>
                  </View>
                )}
                {ouraDataLength !== 0 && (
                  <View style={styles.centerAlign}>
                    <Text style={styles.infoText}>
                      Activities From Oura Ring
                    </Text>
                    <FieldArray name="modalities2">
                      {() =>
                        pointsDetail
                          ?.filter(item => item.data_source_id === 6)
                          ?.map((item, index) => {
                            return (
                              <EventModalitiesListing
                                item={item}
                                value={item?.amount}
                                onChangeText={handleChange(
                                  `modalities[${index}].amount`,
                                )}
                              />
                            );
                          })
                      }
                    </FieldArray>
                  </View>
                )}
                <View style={styles.centerAlign}>
                  <Text style={styles.infoText}>
                    Manually Entered Distances
                  </Text>
                  <FieldArray name="modalities">
                    {() =>
                      values?.modalities?.map((item, index) => {
                        return (
                          <EventModalitiesListing
                            item={item}
                            value={item?.amount}
                            onChangeText={handleChange(
                              `modalities[${index}].amount`,
                            )}
                          />
                        );
                      })
                    }
                  </FieldArray>
                </View>
                <TextInput
                  multiline
                  maxLength={100}
                  value={noteDetail}
                  blurOnSubmit={true}
                  style={styles.notes}
                  returnKeyLabel={'Done'}
                  keyboardType={'default'}
                  placeholderTextColor={colors.secondary}
                  placeholder={'Click here to add a note. 100 characters max.'}
                  onChangeText={text => {
                    handleScrollToEnd();
                    setNoteDetail?.(text);
                  }}
                />
                <CustomBottonsContainer
                  onPressBtn={onPressCancel}
                  onPressSave={handleSubmit}
                />
              </View>
            );
          }}
        </Formik>
      </View>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create<{
  firstContainer: ViewStyle;
  containerView: ViewStyle;
  notes: TextStyle;
  contentContainer: ViewStyle;
  infoText: TextStyle;
  centerAlign: ViewStyle;
  mt10: ViewStyle;
  footerContainer: ViewStyle;
}>({
  centerAlign: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ededed',
    paddingHorizontal: 50,
    paddingVertical: 20,
    borderRadius: 20,
    marginTop: 10,
  },
  mt10: {marginTop: 10},
  contentContainer: {flexGrow: 1},
  firstContainer: {
    flex: 1,
    backgroundColor: colors.white,
    paddingTop: moderateScale(40),
    borderRadius: moderateScale(25),
    marginBottom: moderateScale(10),
    paddingBottom: moderateScale(20),
  },
  containerView: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: moderateScale(-50),
  },
  notes: {
    textAlignVertical: 'top',
    width: moderateScale(230),
    height: moderateScale(110),
    padding: moderateScale(10),
    marginTop: moderateScale(20),
    borderWidth: moderateScale(2),
    borderColor: colors.lightGrey,
    borderRadius: moderateScale(10),
  },
  infoText: {
    color: 'black',
    fontWeight: '700',
    textAlign: 'right',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  footerContainer: {
    marginBottom: moderateScale(40),
  },
});

export default CustomMilesForm;
