import React from 'react';
import {StyleSheet, Text, TextProps, View} from 'react-native';
import {Dropdown} from 'react-native-element-dropdown';
import {colors} from '../utils/colors';
import {moderateScale} from '../utils/metrics';
import CustomArrow from './CustomArrow';
import {getTemplateSpecs} from '../utils/helpers';
import {store} from '../core/store';

interface CustomDropDownProps {
  data: Array<{label: string; value: string}>;
  setSelectedValue?: (value: string) => void;
  headingText?: string;
  required?: boolean;
  placeholderTxt?: string;
  value?: string;
  selectedTextProps?: TextProps;
}

const CustomDropDown = ({
  data,
  setSelectedValue,
  headingText,
  required,
  placeholderTxt,
  selectedTextProps,
  value,
}: CustomDropDownProps) => {
  const getRequiredTextStyle = (color: string) => ({
    color: color || colors.headerBlack,
  });
  return (
    <View>
      {headingText && (
        <View style={styles.heading}>
          <Text style={styles.headingText}>{headingText}</Text>
          {required && (
            <Text
              style={getRequiredTextStyle(
                getTemplateSpecs(
                  store.getState().loginReducer.eventDetail?.template,
                ).bottomTabIconColor,
              )}>
              {' '}
              *
            </Text>
          )}
        </View>
      )}

      <Dropdown
        style={styles.dropdown}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        data={data}
        selectedTextProps={selectedTextProps}
        maxHeight={300}
        labelField="label"
        placeholder={placeholderTxt || 'Select Member'}
        searchPlaceholder="Search..."
        value={value}
        onChange={item => {
          setSelectedValue && setSelectedValue(item.value); // Pass only the value
        }}
        renderRightIcon={() => (
          <CustomArrow
            fill={colors.primaryGrey}
            props={{
              style: {transform: [{rotate: '90deg'}]},
            }}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  dropdown: {
    borderWidth: moderateScale(2),
    borderColor: colors.lightGrey,
    paddingVertical: moderateScale(8),
    paddingHorizontal: moderateScale(20),
    borderRadius: moderateScale(100),
    color: colors.primaryGrey,
    height: 45,
  },
  placeholderStyle: {
    color: colors.primaryGrey,
    fontSize: moderateScale(16),
  },
  selectedTextStyle: {
    color: colors.primaryGrey,
    fontSize: moderateScale(16),
  },
  headingText: {
    color: colors.headerBlack,
    fontWeight: '700',
    fontSize: moderateScale(14),
    paddingLeft: moderateScale(3),
  },
  heading: {
    paddingBottom: moderateScale(8),
    flexDirection: 'row',
  },
});

export default CustomDropDown;
