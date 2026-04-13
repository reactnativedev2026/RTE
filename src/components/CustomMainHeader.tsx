import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import { CustomArrow, CustomEventSheet } from '.';
import { RootState, store } from '../core/store';
import { setEventList } from '../screen/AuthScreen/login/login.slice';
import { colors } from '../utils/colors';
import images from '../utils/images';
import { moderateScale } from '../utils/metrics';

interface CustomMainHeaderProps {
  setEventLoading?: any;
}
const CustomMainHeader = ({setEventLoading}: CustomMainHeaderProps) => {
  const {eventDetail, eventList} = useSelector(
    (state: RootState) => state.loginReducer,
  );
   const eventRef = React.useRef();
  const openSheet = () => {
    if (eventDetail?.id) {
      const dataArray = [...eventList];
      const index = dataArray.findIndex(item => item.id == eventDetail.id);
      if (index > 0) {
        dataArray.unshift(dataArray.splice(index, 1)[0]);
      }
      store.dispatch(setEventList(dataArray));
    }
    setTimeout(() => {
      eventRef?.current?.open();
    }, 300);
  };

  return (
    <View style={styles.container}>
      <View style={styles.whiteContainer}>
        <View style={styles.blackContainer}>
          <images.RunEdge />
          <TouchableOpacity
            hitSlop={styles.hitSlop}
            onPress={openSheet}
            disabled={eventList?.length < 1}
            style={styles.eventBtn}>
            <View style={styles.textContainer}>
              <Text numberOfLines={1} style={styles.headingText}>
                {eventDetail?.name}
              </Text>
              {eventList?.length > 0 && (
                <CustomArrow
                  fill={colors.white}
                  props={{
                    style: styles.arrow,
                  }}
                />
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <CustomEventSheet
        RBRef={eventRef}
        eventList={eventList}
        setEventLoading={setEventLoading}
      />
    </View>
  );
};

export default CustomMainHeader;

const styles = StyleSheet.create({
  container: {
    borderTopLeftRadius: moderateScale(40),
    borderTopRightRadius: moderateScale(40),
    backgroundColor: 'transparent',
  },
  whiteContainer: {
    backgroundColor: colors.headerEdge,
    paddingBottom: moderateScale(4.5),
    borderBottomLeftRadius: moderateScale(25),
    borderBottomRightRadius: moderateScale(25),
  },
  blackContainer: {
    backgroundColor: colors.headerBlack,
    borderBottomLeftRadius: moderateScale(20),
    borderBottomRightRadius: moderateScale(20),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingBottom: moderateScale(10),
    paddingHorizontal: moderateScale(20),
    height: moderateScale(80),
  },
  runEdge: {
    height: moderateScale(30),
  },
  headingText: {
    color: '#FFFFFF',
    fontSize: moderateScale(18),
    fontWeight: 'bold',
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: moderateScale(20),
    borderRadius: moderateScale(10),
    alignItems: 'center',
  },
  modalText: {
    marginBottom: moderateScale(20),
    fontSize: moderateScale(16),
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hitSlop: {
    top: 20,
    bottom: 20,
    right: 20,
    left: 20,
  },
  eventBtn: {
    flex: 1,
    paddingLeft: moderateScale(40),
  },
  arrow: {transform: [{rotate: '90deg'}], marginLeft: moderateScale(10)},
});
