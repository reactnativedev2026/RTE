import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import {colors, images} from '../utils';
import {moderateScale} from '../utils/metrics';
import CustomArrow from './CustomArrow';

interface CustomDDPickerProps {
  initiallySelectedValue?: any | undefined;
  onSelectItem?: (value: any) => void;
  list?: [];
  placeholder?: string;
  containerStyle?: any;
  ddCustomStyle?: any;
  renderListItem?: any;
  close?: any;
  setClose?: any;
}

const CustomDDPicker = ({
  initiallySelectedValue,
  onSelectItem,
  list,
  placeholder,
  containerStyle,
  ddCustomStyle,
  renderListItem,
  close,
  setClose,
}: CustomDDPickerProps) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');

  React.useEffect(() => {
    setValue(initiallySelectedValue || '');
  }, [initiallySelectedValue]);
  React.useEffect(() => {
    setOpen(close);
  }, [close]);

  return (
    <View style={[styles.flex, containerStyle]}>
      <DropDownPicker
        onOpen={() => {
          setClose && setClose(true);
        }}
        onClose={() => setClose && setClose(false)}
        open={open}
        value={value}
        items={list}
        setOpen={setOpen}
        setValue={setValue}
        renderListItem={renderListItem}
        onSelectItem={onSelectItem}
        placeholder={placeholder || 'Select.'}
        style={[open ? styles.openStyle : styles.closedStyle]}
        dropDownContainerStyle={[styles.dContainer, ddCustomStyle]}
        placeholderStyle={styles.placeholder}
        textStyle={styles.text}
        selectedItemLabelStyle={styles.item}
        ArrowUpIconComponent={ArrowUpIcon}
        ArrowDownIconComponent={ArrowDownIcon}
        TickIconComponent={TickIcon}
        flatListProps={{
          nestedScrollEnabled: true,
          contentContainerStyle: {
            flexGrow: 1,
          },
          keyExtractor: (item, index) => index?.toString(),
        }}
      />
    </View>
  );
};

const ArrowUpIcon = () => (
  <CustomArrow fill={colors.primaryGrey} props={{style: styles.arrowUp}} />
);

const ArrowDownIcon = () => (
  <CustomArrow fill={colors.primaryGrey} props={{style: styles.arrowDown}} />
);

const TickIcon = () => (
  <images.TickIcon height={moderateScale(12)} width={moderateScale(12)} />
);

export default CustomDDPicker;

const styles = StyleSheet.create({
  dContainer: {
    borderColor: colors.lightGrey,
    borderWidth: moderateScale(2),
    borderTopWidth: 0,
    maxHeight: moderateScale(150),
  },
  placeholder: {
    fontSize: moderateScale(14),
    color: colors.primaryGrey,
  },
  text: {
    fontSize: moderateScale(14),
    color: colors.primaryGrey,
  },
  item: {
    fontSize: moderateScale(14),
    color: colors.headerBlack,
  },
  arrowUp: {
    transform: [{rotate: '270deg'}],
  },
  arrowDown: {
    transform: [{rotate: '90deg'}],
  },
  openStyle: {
    borderRadius: moderateScale(10),
    borderColor: colors.lightGrey,
    borderWidth: moderateScale(2),
    borderBottomWidth: 0,
    minHeight: moderateScale(40),
  },
  closedStyle: {
    borderRadius: moderateScale(50),
    borderColor: colors.lightGrey,
    borderWidth: moderateScale(2),
    minHeight: moderateScale(40),
  },
  flex: {
    flex: 1,
  },
});
