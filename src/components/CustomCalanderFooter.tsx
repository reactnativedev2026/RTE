import { tz } from 'moment-timezone';
import React from 'react';
import {
  Linking,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { store } from '../core/store';
import { navigate } from '../services/NavigationService';
import { colors, images } from '../utils';
import { dateTimeFormat } from '../utils/dateFormats';
import { getFloatNumber, getTemplateSpecs } from '../utils/helpers';
import { moderateScale } from '../utils/metrics';
import { Routes } from '../utils/Routes';
import CustomHorizontalLine from './CustomHorizontalLine';
import CustomImageMoal from './CustomImageModel';

const getVideoId = (url: string | undefined) => {
  const match = url?.match(/vimeo\.com\/(\d+)/);
  return match ? match[1] : null;
};

interface CustomCalanderFooterProps {
  onPressEdit?: () => void;
  startDate?: string;
  hideNotes?: boolean;
  miles?: any | undefined;
  customNotesStyle?: any;
  containerStyle?: any;
  hideEdit?: boolean;
  notes?: string | undefined;
  footerObj?: any;
  mainStyle?: any;
  notesContainer?: any;
  customImage?: any;
  monthlyPoints?: any;
  onPointsAddCallback?: () => void;
}
const CustomCalanderFooter = ({
  startDate,
  onPressEdit,
  hideNotes,
  miles,
  customNotesStyle,
  containerStyle,
  hideEdit,
  notes,
  footerObj,
  mainStyle,
  notesContainer,
  customImage,
  monthlyPoints,
  onPointsAddCallback,
}: CustomCalanderFooterProps) => {
  const timezone = store.getState().loginReducer.user?.time_zone_name;
  const inputDate = startDate || footerObj?.date;
  const isCurrentYear =
    tz(inputDate || '', timezone || '').year() === tz(timezone || '').year();

  const [modalVisible, setModalVisible] = React.useState(false);
  const [videoModalVisible, setVideoModalVisible] = React.useState(false);

  const isDateSelected = startDate || footerObj?.date;

  const renderItem = ({item, index}: {item: any; index: any}) => {
    const isEven = index % 2 === 0;

    return (
      <View key={index?.toString()} style={styles.itemContainer}>
        <CustomHorizontalLine customStyle={styles.lineStyling} />
        <View style={styles.itemStyling(isEven)}>
          <CustomCalanderFooter
            onPressEdit={() => {
              navigate(Routes.ADD_CALENDAR_MILES, {
                miles: item?.total_mile,
                date: item?.date,
                onPointsAddCallback,
              });
            }}
            footerObj={item}
            notes={item?.note}
            startDate={item?.date}
            hideNotes={!item?.note}
            miles={item?.total_mile}
            customImage={styles.image}
            containerStyle={styles.containerStyle2}
            notesContainer={styles.calendarListNotes}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={mainStyle}>
      <View style={[styles.main, containerStyle]}>
        <View style={styles.rowView}>
          <Text style={styles.date}>
            {isDateSelected
              ? `${dateTimeFormat(footerObj?.date || startDate, timezone)}`
              : 'Select a date'}
          </Text>

          {(startDate || footerObj?.date) && (
            <View
              style={[
                styles.secondRow,
                hideEdit && {flexDirection: 'row-reverse'},
              ]}>
              <View>
                <Text
                  style={[
                    styles.miles,
                    {
                      color: getTemplateSpecs(
                        store.getState().loginReducer.eventDetail?.template,
                      )?.primaryColor,
                      textAlign: hideEdit ? 'right' : 'left',
                    },
                  ]}>
                  {getFloatNumber(
                    footerObj?.total_mile || footerObj?.miles || 0,
                  ) + ' miles'}
                  {/* {`${
                    getFloatNumber(footerObj?.miles || miles)
                      ? getFloatNumber(footerObj?.miles || miles)
                      : '0.0'
                  } miles`} */}
                </Text>
              </View>
              {!hideEdit && isCurrentYear && (
                <Pressable onPress={onPressEdit} style={styles.editContainer}>
                  <Text style={styles.editIcon}>Edit</Text>
                  <images.EditIcon />
                </Pressable>
              )}
            </View>
          )}
        </View>
      </View>

      {/* <FlatList
        data={monthlyPoints}
        scrollEnabled={false}
        renderItem={renderItem}
        keyExtractor={(item, index) => index?.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{flexGrow: 1}}
      /> */}

      {(startDate || footerObj?.date) && (
        <View style={notesContainer}>
          {!hideNotes && (
            <View style={[styles.notesContainer, customNotesStyle]}>
              <Text numberOfLines={5} style={styles.notes}>
                Note:{' '}
                <Text style={styles.noteText}>{footerObj?.notes || notes}</Text>
              </Text>
            </View>
          )}
          <View style={styles.imageContainer}>
            {(footerObj?.logo ||
              footerObj?.milestone?.image?.logo_image_url) && (
              <TouchableOpacity onPress={() => setModalVisible(true)}>
                <FastImage
                  source={{
                    uri:
                      footerObj?.logo ||
                      footerObj?.milestone?.image?.logo_image_url,
                  }}
                  style={[styles.image, customImage]}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {footerObj?.vimeo_id?.flyover_url && (
        <View style={{alignSelf: 'center', flexDirection: 'row'}}>
          <TouchableOpacity
            onPress={() => {
              setVideoModalVisible(true);
            }}>
            <Text style={styles.videoLinks}>Click Here</Text>
          </TouchableOpacity>
          <Text style={{color: colors.black}}>{' to see the video'}</Text>
        </View>
      )}

      {footerObj?.extra?.bibs_url && (
        <View
          style={{alignSelf: 'center', flexDirection: 'row', marginTop: 14}}>
          <TouchableOpacity
            onPress={() => {
              Linking.openURL(footerObj?.extra?.bibs_url);
            }}>
            <Text style={styles.videoLinks}>Click here</Text>
          </TouchableOpacity>
          <Text style={{color: colors.black}}>{' to make a custom bib!'}</Text>
        </View>
      )}

      {videoModalVisible && (
        <CustomImageMoal
          modalVisible={videoModalVisible}
          setModalVisible={setVideoModalVisible}
          type="video"
          videoUrl={`https://player.vimeo.com/video/${getVideoId(
            footerObj?.vimeo_id?.flyover_url || '',
          )}?autoplay=1&loop=0`}
        />
      )}
      {modalVisible && (
        <CustomImageMoal
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          imageUri={
            footerObj?.extra?.milestone?.image?.logo_image_url ??  footerObj?.milestone?.image?.logo_image_url ?? footerObj?.logo 
          }
          obj={footerObj}
        />
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  main: {
    flex: 1,
    marginTop: moderateScale(20),
    paddingHorizontal: moderateScale(5),
  },
  rowView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  date: {
    fontSize: moderateScale(16),
    fontWeight: 'bold',
    color: colors.black,
    width: moderateScale(150),
  },
  secondRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  miles: {fontWeight: 'bold', width: moderateScale(90)},
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: moderateScale(3),
  },
  editIcon: {color: colors.primaryGrey, marginRight: moderateScale(5)},
  notesContainer: {
    marginTop: moderateScale(10),
    flex: 1,
    paddingBottom: moderateScale(10),
    paddingHorizontal: moderateScale(4),
  },
  notes: {
    color: colors.primaryGrey,
    fontSize: moderateScale(16),
    fontWeight: '700',
    width: moderateScale(220),
  },
  imageContainer: {
    flex: 1,
    marginTop: moderateScale(5),
    marginBottom: moderateScale(5),
    marginLeft: moderateScale(10),
    width: moderateScale(65),
    alignSelf: 'flex-end',
  },
  image: {
    height: moderateScale(70),
    width: moderateScale(65),
    alignSelf: 'flex-end',
    objectFit: 'contain',
  },
  noteText: {fontWeight: '400'},
  videoLinks: {
    fontSize: 13,
    textDecorationLine: 'underline',
    color: colors.blue,
    fontWeight: 'bold',
    textDecorationColor: colors.blue,
  },

  lineStyling: {borderColor: colors.lightGrey, marginTop: moderateScale(-1)},
  itemStyling: isEven => ({
    width: '100%',
    backgroundColor: !isEven && colors.white,
  }),
  itemContainer: {
    backgroundColor: colors.lightGray,
    // paddingHorizontal: moderateScale(10),
  },
  containerStyle2: {
    marginTop: moderateScale(15),
    paddingHorizontal: moderateScale(14),
  },
});
export default CustomCalanderFooter;
