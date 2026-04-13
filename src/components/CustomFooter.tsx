import React from 'react';
import {ActivityIndicator} from 'react-native';
import {colors} from '../utils';
import {moderateScale} from '../utils/metrics';

const FooterComponent = (isFetching: boolean) => {
  const ListFooterComponent = React.useMemo(() => {
    if (isFetching) {
      return (
        <ActivityIndicator
          size="small"
          color={colors.primaryGrey}
          style={{paddingVertical: moderateScale(10)}}
        />
      );
    }
    return null;
  }, [isFetching]);
  return ListFooterComponent;
};

export default FooterComponent;
