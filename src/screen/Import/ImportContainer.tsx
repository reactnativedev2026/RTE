import React, {useState, useMemo} from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  FlatList,
  Keyboard,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {
  CustomDDPicker,
  CustomHeader,
  CustomHorizontalLine,
  CustomScreenWrapper,
  CustomAlert,
} from '../../components';
import {useAdjustKeyboard} from '../../hooks';
import {colors, images} from '../../utils';
import {getTemplateSpecs, getYearsList} from '../../utils/helpers';
import {IOS, moderateScale} from '../../utils/metrics';
import {RootState, store} from '../../core/store';
import Entypo from 'react-native-vector-icons/Entypo';
import {useUpdateImportsMutation} from '../../services/setting.api';
import {useSelector} from 'react-redux';
import {pop} from '../../services/NavigationService';

import * as Animatable from 'react-native-animatable';

interface ImportContainerProps {}
const ImportContainer = ({}: ImportContainerProps) => {
  useAdjustKeyboard();
  const {user} = useSelector((state: RootState) => state.loginReducer);
  const yearsList = useMemo(() => getYearsList(), []);

  const [items, setItems] = useState<{year: string; miles: string}[]>([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [miles, setMiles] = useState('');
  const [error, setError] = useState('');

  const [updateImports, {isLoading}] = useUpdateImportsMutation();

  const handleUpdateImports = () => {
    if (user?.preferred_event_id) {
      updateImports({
        event_id: user?.preferred_event_id,
        manual_entry: items,
      })
        .unwrap()
        .then(res => {
          CustomAlert({
            type: 'success',
            message: 'Data Imported Successfully!',
          });
          setItems([]);
          setMiles('');
          pop();
          console.log('RESPONSE>>>', res);
        })
        .catch(err => {
          CustomAlert({
            type: 'error',
            message: err?.data?.message,
          });
        });
    }
  };

  const handleAddItem = () => {
    Keyboard.dismiss();
    if (!selectedYear) {
      setError('Please select a year.');
      return;
    }

    if (!miles) {
      setError('Please enter miles.');
      return;
    }
    if (selectedYear && miles) {
      setItems([...items, {year: selectedYear, miles}]);
      setMiles('');
    }
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    setItems(updatedItems);
  };

  return (
    <CustomScreenWrapper removeScroll loadingIndicator={isLoading}>
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        style={styles.firstContainer}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps={'handled'}>
        <CustomHeader hideEditBtn={true} />
        <Text style={styles.headerText}>{'Import Data'}</Text>
        <Text style={styles.label}>
          {
            'Select a year and enter your miles for that year. You may add more than one year at a time.'
          }
        </Text>
        <CustomHorizontalLine customStyle={styles.topMargin} />
        <View style={styles.inputContainer}>
          <View style={styles.row}>
            <View style={styles.dropdownContainer}>
              <CustomDDPicker
                list={yearsList}
                placeholder={'Select year'}
                selectedValue={selectedYear}
                onSelectItem={value => {
                  setError('');
                  setSelectedYear(value?.value);
                }}
              />
            </View>

            <View style={styles.inputWrapper}>
              <TextInput
                placeholder="Enter miles"
                style={styles.textInput}
                value={miles}
                onChangeText={text => {
                  setError('');
                  setMiles(text);
                }}
                keyboardType="numeric"
              />
            </View>

            <Pressable onPress={handleAddItem}>
              <images.PlusIcon />
            </Pressable>
          </View>
          <View style={{zIndex: -1}}>
            <Animatable.Text animation="bounceIn" style={styles.errorText}>
              {error}
            </Animatable.Text>
          </View>
        </View>
        <View style={styles.itemsContainer}>
          <FlatList
            data={items}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({item, index}) => (
              <View style={styles.itemRow} key={index?.toString()}>
                <View style={styles.itemBorder}>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.itemText,
                      styles.itemTextYear,
                    ]}>{`${item?.year}`}</Text>
                </View>
                <View style={styles.itemBorder}>
                  <Text
                    numberOfLines={1}
                    style={styles.itemText}>{`${item?.miles}`}</Text>
                </View>

                <Pressable onPress={() => handleRemoveItem(index)}>
                  <Entypo name="minus" size={25} color="red" />
                </Pressable>
              </View>
            )}
          />
        </View>
        <Pressable
          onPress={handleUpdateImports}
          style={[
            styles.btnContainer,
            {
              backgroundColor: getTemplateSpecs(
                store.getState().loginReducer.eventDetail?.template,
              ).btnPrimaryColor,
            },
          ]}>
          <Text style={styles.btnText}>Save Miles</Text>
        </Pressable>
      </KeyboardAwareScrollView>
    </CustomScreenWrapper>
  );
};
export default ImportContainer;

const styles = StyleSheet.create({
  firstContainer: {
    backgroundColor: colors.white,
    paddingTop: moderateScale(20),
    marginHorizontal: moderateScale(10),
    borderRadius: moderateScale(25),
    paddingHorizontal: moderateScale(15),
    paddingBottom: moderateScale(20),
    marginBottom: moderateScale(20),
    flex: 1,
  },

  contentContainer: {
    flexGrow: 1,
    paddingBottom: moderateScale(50),
  },

  headerText: {
    fontSize: moderateScale(16),
    fontWeight: '800',
    color: colors.primaryGrey,
    textAlign: 'center',
    marginTop: moderateScale(10),
  },
  label: {
    fontSize: moderateScale(14),
    fontWeight: '400',
    color: colors.primaryGrey,
    marginTop: moderateScale(25),
  },
  topMargin: {
    marginTop: moderateScale(20),
  },
  inputContainer: {
    marginTop: moderateScale(20),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownContainer: {
    width: moderateScale(124),
  },
  inputWrapper: {
    borderWidth: moderateScale(2),
    borderColor: colors.lightGrey,
    borderRadius: moderateScale(100),
    width: moderateScale(124),
  },
  textInput: {
    paddingHorizontal: moderateScale(10),
    color: 'black',
    padding: 0,
    margin: 0,
    // paddingVertical: IOS ? moderateScale(13) : moderateScale(8),
    height: moderateScale(35),
  },
  btnContainer: {
    borderRadius: moderateScale(50),
    paddingHorizontal: moderateScale(20),
    paddingVertical: moderateScale(10),
    marginTop: moderateScale(25),
    alignSelf: 'center',
    zIndex: -1,
  },
  btnText: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: colors.white,
  },
  itemsContainer: {
    zIndex: -1,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: moderateScale(5),
    flex: 1,
  },
  itemText: {
    fontSize: moderateScale(14),
    color: colors.headerBlack,
    textAlign: 'center',
    flex: 1,
  },
  itemTextYear: {
    textAlign: 'left',
    marginLeft: moderateScale(15),
  },
  itemBorder: {
    paddingVertical: moderateScale(10),
    borderRadius: moderateScale(50),
    borderWidth: moderateScale(2),
    borderColor: colors.lightGrey,
    width: moderateScale(124),
  },
  errorText: {
    color: 'red',
    paddingHorizontal: moderateScale(15),
  },
});
