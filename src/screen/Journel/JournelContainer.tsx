import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import Timeline from 'react-native-timeline-flatlist';
import { useSelector } from 'react-redux';
import {
  CustomAlert,
  CustomQuestHeader,
  CustomScreenWrapper,
} from '../../components';
import { RootState } from '../../core/store';
import { useLazyGetJournalListQuery } from '../../services/quest.api';
import { colors } from '../../utils';
import { moderateScale } from '../../utils/metrics';

interface JournelContainerProps {}
const JournelContainer = ({}: JournelContainerProps) => {
  const {user} = useSelector((state: RootState) => state.loginReducer);
  const [jounalList, setJournalList] = useState([]);
  const [getJournalList, {isFetching}] = useLazyGetJournalListQuery();

  const handleGetJournalList = () => {
    if (user?.preferred_event_id) {
      getJournalList({event_id: user?.preferred_event_id, page_limit: 10})
        .unwrap()
        .then(res => {
          setJournalList(res?.data?.data);
        })
        .catch(err => {
          CustomAlert({
            type: 'error',
            message: err?.data?.message,
          });
        });
    }
  };

  useEffect(() => {
    handleGetJournalList();
  }, []);

  return (
    <CustomScreenWrapper removeScroll loadingIndicator={isFetching}>
      <View style={styles.firstContainer}>
        <CustomQuestHeader />
        <Text style={styles.headerText}>Journal</Text>

        {jounalList?.length < 1 && !isFetching && (
          <Text style={styles.labelText}>
            Nothing to see here, don’t forget to add notes and photos to your
            quests as you complete them!
          </Text>
        )}

        <Timeline
          data={jounalList}
          lineWidth={5}
          lineColor={colors.primaryYellow}
          options={{
            showsVerticalScrollIndicator: false,
          }}
          renderFullLine
          circleStyle={styles.circle}
          eventContainerStyle={styles.event}
          renderTime={rowData => {
            return (
              <View style={styles.leftShieldContainer}>
                <View style={{flexDirection: 'row'}}>
                  <FastImage
                    source={{uri: rowData?.activity?.bib_image}}
                    style={styles.shieldImage}
                  />
                  <View style={styles.leftHorizontalLine} />
                </View>
              </View>
            );
          }}
          renderDetail={rowData => {
            return (
              <View>
                <Text style={styles.QuestTitle} numberOfLines={3}>
                  {rowData?.activity?.name}
                </Text>
                {(rowData?.date || rowData?.activity?.total_points) && (
                  <View style={styles.Listcard}>
                    {rowData?.date && (
                      <Text style={styles.listItem}>{rowData?.date}</Text>
                    )}
                    {rowData?.activity?.total_points && (
                      <>
                        <View style={styles.verticalLine} />
                        <Text
                          style={
                            styles.listItem
                          }>{`${rowData?.activity?.total_points} Miles`}</Text>
                      </>
                    )}
                  </View>
                )}
                {rowData?.activity?.description && (
                  <Text style={styles.description} numberOfLines={6}>
                    {rowData?.activity?.description}
                  </Text>
                )}
                {rowData?.image && (
                  <FastImage
                    source={{uri: rowData?.image}}
                    style={styles.images}
                  />
                )}
              </View>
            );
          }}
        />
      </View>
    </CustomScreenWrapper>
  );
};
export default JournelContainer;

const styles = StyleSheet.create({
  firstContainer: {
    flex: 1,
    backgroundColor: colors.white,
    paddingTop: moderateScale(20),
    marginHorizontal: moderateScale(10),
    borderRadius: moderateScale(25),
    paddingHorizontal: moderateScale(25),
    paddingBottom: moderateScale(5),
    marginBottom: moderateScale(10),
  },
  headerText: {
    fontSize: moderateScale(16),
    fontWeight: '800',
    color: colors.headerBlack,
    textAlign: 'center',
    marginTop: moderateScale(15),
  },
  labelText: {
    fontSize: moderateScale(14),
    fontWeight: '400',
    color: colors.primaryGrey,
    marginTop: moderateScale(25),
  },
  QuestTitle: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    flex: 1,
    color: colors.headerBlack,
  },
  Listcard: {
    flexDirection: 'row',
    marginTop: moderateScale(15),
    flex: 1,
  },
  listItem: {
    color: colors.headerBlack,
    // flex: 1,
  },
  verticalLine: {
    borderWidth: moderateScale(1),
    borderColor: colors.headerBlack,
    marginHorizontal: moderateScale(5),
  },
  description: {
    fontSize: moderateScale(14),
    fontWeight: '400',
    flex: 1,
    color: colors.primaryGrey,
    marginTop: moderateScale(20),
  },
  images: {
    height: moderateScale(150),
    width: 'auto',
    bottom: moderateScale(5.5),
    borderRadius: moderateScale(10),
    marginTop: moderateScale(15),
  },
  shieldImage: {
    height: moderateScale(50),
    width: moderateScale(45),
  },
  leftShieldContainer: {
    justifyContent: 'flex-start',
  },
  leftHorizontalLine: {
    alignSelf: 'center',
    borderTopWidth: moderateScale(3),
    borderColor: colors.primaryYellow,
    width: moderateScale(20),
    zIndex: -1,
  },
  event: {
    marginLeft: 0,
  },
  circle: {height: 0, width: 0},
});
