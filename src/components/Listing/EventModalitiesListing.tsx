import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {colors} from '../../utils';
import {getFloatNumber} from '../../utils/helpers';
import {IOS, moderateScale} from '../../utils/metrics';

const EventModalitiesListing = ({item, value, onChangeText}) => {
  const milesInputRef = React.useRef(null);
  const [error, setError] = React.useState('');
  const handleFocus = React.useCallback(() => {
    milesInputRef.current?.focus();
  }, []);

  return (
    <View style={styles.inputContainer}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleFocus}
        style={[
          styles.milesContainer,
          {
            borderColor: error ? colors.lightRed : colors.lightGrey,
            backgroundColor: item.data_source_id === 1 ? 'white' : undefined,
          },
        ]}>
        <TextInput
          value={item.data_source_id === 1 ? value : getFloatNumber(value, item.data_source_id === 7 ? 4 : 2)}
          placeholder={'0'}
          ref={milesInputRef}
          style={styles.textInput}
          keyboardType={'decimal-pad'}
          placeholderTextColor={colors.secondary}
          onChangeText={txt => {
            onChangeText(txt);
            setError(!!txt.replace(/^[0-9]*\.?[0-9]+$/g, ''));
          }}
          editable={item.data_source_id === 1}
        />
        <Text
          style={[
            styles.milesText,
            {color: value ? colors.secondaryGrey : colors.secondary},
          ]}>
          {'miles'}
        </Text>
      </TouchableOpacity>
      <Text style={styles.infoText}>
        {item?.modality.replace(/(^.|_)/g, (match, offset) =>
          match === '_' ? ' ' : match.toUpperCase(),
        ) + ' Miles'}
      </Text>
    </View>
  );
};

export default EventModalitiesListing;

const styles = StyleSheet.create({
  inputContainer: {flexDirection: 'row', justifyContent: 'space-between'},
  milesContainer: {
    paddingVertical: 0,
    flexDirection: 'row',
    paddingHorizontal: 5,
    alignItems: 'center',
    width: moderateScale(110),
    borderWidth: moderateScale(2),
    borderRadius: moderateScale(50),
    marginVertical: moderateScale(5),
  },
  textInput: {
    paddingLeft: 0,
    fontWeight: '600',
    textAlign: 'right',
    height: moderateScale(30),
    fontSize: moderateScale(14),
    minWidth: moderateScale(35),
    maxWidth: moderateScale(60),
    color: colors.secondaryGrey,
    textAlignVertical: 'center',
    lineHeight: moderateScale(18),
    paddingRight: moderateScale(5),
    paddingVertical: moderateScale(5),
  },
  infoText: {
    color: 'black',
    fontWeight: '700',
    textAlign: 'right',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40%',
    marginTop: moderateScale(10),
    marginLeft: moderateScale(20),
  },
  milesText: {
    marginVertical: 5,
    fontWeight: '600',
    paddingTop: IOS ? moderateScale(1) : 0,
  },
});
