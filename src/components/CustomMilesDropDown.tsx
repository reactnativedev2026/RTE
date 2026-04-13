import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {SelectCountry} from 'react-native-element-dropdown';
import {colors} from '../utils/colors';

interface CustomMilesDropDownProps {}

const local_data = [
  {value: '1', label: 'Display as Miles'},
  {value: '2', label: 'Display as Points'},
  {value: '3', label: 'Display as Calories'},
  {value: '4', label: 'Display as Minutes'},
  {value: '5', label: 'Display as Steps'},
];

const CustomMilesDropDown = ({}: CustomMilesDropDownProps) => {
  const [country, setCountry] = useState('1');
  return (
    <View style={styles.displayAsMilesContainer}>
      <SelectCountry
        style={styles.dropdown}
        selectedTextStyle={styles.selectedTextStyle}
        placeholderStyle={styles.placeholderStyle}
        iconStyle={styles.iconStyle}
        maxHeight={200}
        value={country}
        data={local_data}
        valueField="value"
        labelField="label"
        placeholder="Select option"
        searchPlaceholder="Search..."
        onChange={e => setCountry(e.value)}
        containerStyle={styles.dropdownContainer}
        itemTextStyle={styles.dropdownItemText}
        selectedItemTextStyle={styles.selectedDropdownItemText}
        dropdownOffset={{top: 20, left: 0}}
      />
    </View>
  );
};

export default CustomMilesDropDown;

const styles = StyleSheet.create({
  displayAsMilesContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  displayAsMilesButton: {
    backgroundColor: '#CCCCCC',
    borderRadius: 30,
    padding: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdown: {
    margin: 0,
    height: 40,
    width: 160,
    borderRadius: 22,
    paddingHorizontal: 4,
    backgroundColor: colors.lightGrey,
  },
  dropdownContainer: {
    backgroundColor: '#444444',
    borderRadius: 22,
    marginTop: 10,
    width: 200,
  },

  dropdownItemText: {
    color: 'white',
  },
  sselectedDropdownItem: {
    backgroundColor: 'blue',
  },
  selectedDropdownItemText: {
    color: 'white',
    backgroundColor: 'red',
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
    marginLeft: 8,
    color: 'white',
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
});
