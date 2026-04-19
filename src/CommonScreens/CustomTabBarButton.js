import React from 'react';
import {View} from 'react-native';
import {colors} from '../utils/colors';
import {images} from '../utils';
import {getTemplateSpecs} from '../utils/helpers';
import {store} from '../core/store';

const CustomTabBarButton = ({name, focused}) => {
  let Icon = images[name || 'Menu'];
  return (
    <View
      style={{
        backgroundColor: focused ? '#F7F7F7' : null,
        borderRadius: 60,
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Icon
        height={28}
        width={28}
        fill={
          focused
            ? getTemplateSpecs(
                store.getState().loginReducer.eventDetail?.template,
              )?.bottomTabIconColor
            : colors.lightGrey
        }
      />
    </View>
  );
};

export default CustomTabBarButton;
