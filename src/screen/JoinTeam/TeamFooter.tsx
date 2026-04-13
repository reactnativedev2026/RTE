import React from 'react';
import {Text, View, StyleSheet, Pressable} from 'react-native';
import {CustomArrow} from '../../components';
import {colors} from '../../utils';
import {moderateScale} from '../../utils/metrics';

interface TeamFooterProps {
  isFetching?: boolean | undefined;
  onPressPrevious?: () => void;
  onPressNext?: () => void;
  teamApiData?: any | undefined;
}
const TeamFooter = ({
  isFetching,
  onPressPrevious,
  onPressNext,
  teamApiData,
}: TeamFooterProps) => {
  const nextDisable = isFetching || !teamApiData?.next_page_url;
  const previousDisable = isFetching || !teamApiData?.prev_page_url;
  return (
    <View style={styles.cardFooter}>
      <Pressable
        style={styles.customrow}
        onPress={onPressPrevious}
        disabled={previousDisable}>
        <CustomArrow
          fill={previousDisable ? colors.primaryGrey : colors.headerBlack}
          props={{
            style: {transform: [{rotate: '180deg'}]},
          }}
        />
        <Text style={styles.label({loading: previousDisable})}>Previous</Text>
      </Pressable>
      <Pressable
        style={styles.customrow}
        onPress={onPressNext}
        disabled={nextDisable}>
        <Text style={styles.label({loading: nextDisable})}>Next</Text>
        <CustomArrow
          fill={nextDisable ? colors.primaryGrey : colors.headerBlack}
        />
      </Pressable>
    </View>
  );
};
export default TeamFooter;

const styles = StyleSheet.create({
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 10,
    padding: 5,
  },

  customrow: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },
  label: props => ({
    fontSize: moderateScale(14),
    fontWeight: '400',
    color: props?.loading ? colors.primaryGrey : colors.headerBlack,
  }),
});
