import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Tooltip from 'react-native-walkthrough-tooltip';
import { store } from '../../core/store';
import { colors } from '../../utils';
import { rteMonthNameFormat } from '../../utils/dateFormats';
import { getTemplateSpecs } from '../../utils/helpers';
import { moderateScale } from '../../utils/metrics';

interface response {
  month?: string;
  total_miles?: number;
}
interface CustomMileageByMonthListingProps {
  index?: number;
  item?: response | any;
  maxValue?: any;
}

const MileageByMonthListing = ({
  index,
  item,
  maxValue,
}: CustomMileageByMonthListingProps) => {
  const timezone = store.getState().loginReducer.user?.time_zone_name;
  const [visible, setVisible] = React.useState(false);
  const graphColor = getTemplateSpecs(
    store.getState().loginReducer.eventDetail?.template,
  )?.statsColor;

  const chartHeight = 200; // Fixed chart height
  const barHeight = maxValue ? (parseFloat(item?.amount) / maxValue) * chartHeight : 0;
  return (
    <View key={index} style={styles.barWrapper}>
      <View style={{flex: 1}}>
        <Tooltip
          isVisible={visible}
          content={<Text>{item?.amount}</Text>}
          placement="bottom"
          onClose={() => setVisible(false)}>
          <TouchableOpacity
            onPress={() => setVisible(true)}
            activeOpacity={0.8}
            style={styles.barContainer}>
            <View
              style={[
                styles.bar,
                {height: barHeight, backgroundColor: graphColor},
              ]}
            />
          </TouchableOpacity>
        </Tooltip>
      </View>
      <Text style={styles.yearLabel}>
        {rteMonthNameFormat(item?.date, timezone)}
      </Text>
    </View>
  );
};

export default MileageByMonthListing;

const styles = StyleSheet.create({
  yearLabel: {
    color: colors.headerBlack,
    fontSize: moderateScale(14),
    paddingVertical: moderateScale(5),
  },
  barWrapper: {
    alignItems: 'center',
    width: moderateScale(50),
    justifyContent: 'flex-end',
  },
  barContainer: {
    flex: 1,
    height: 200,
    borderWidth: 1,
    borderTopWidth: 0,
    borderRightWidth: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingLeft: moderateScale(10),
    paddingRight: moderateScale(10),
  },
  bar: {
    width: moderateScale(30),
    borderTopLeftRadius: moderateScale(4),
    borderTopRightRadius: moderateScale(4),
  },
});
