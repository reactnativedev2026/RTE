import {StyleSheet, Dimensions} from 'react-native';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  backgroundImage: {
    resizeMode: 'cover',
    position: 'absolute',
    width: windowWidth,
    height: windowHeight,
  },
  progressContainer: {
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
    zIndex: 1,
  },
  cardContainer: {
    width: '100%',
    paddingHorizontal: 5,
    paddingTop: 20,
    marginTop: 80,
  },
  innerCardContainer: {
    backgroundColor: 'white',
    borderRadius: 30,
    paddingVertical: 40,
  },
  textContainer: {
    paddingTop: 25,
    alignItems: 'center',
  },
  model: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  headingLeftBorder: {
    width: '48%',
    height: 60,
    backgroundColor: '#F7F7F7',
    justifyContent: 'center',
    marginTop: 2,
    borderTopRightRadius: 30,
    borderBottomRightRadius: 30,
    paddingHorizontal: 15,
  },
  headingRightBorder: {
    width: '48%',
    height: 60,
    backgroundColor: 'rgba(0, 175, 237, 1)',
    justifyContent: 'center',
    marginTop: 2,
    borderTopLeftRadius: 30,
    borderBottomLeftRadius: 30,
    paddingHorizontal: 15,
  },
  headingLeftText: {
    color: 'black',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  headingRightText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  flexRowSpaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  displayAsMilesContainer: {
    // backgroundColor: '#F7F7F7',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 10,
  },
  displayAsMilesButton: {
    backgroundColor: '#CCCCCC',
    borderRadius: 30,
    padding: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginLeft: 5,
  },
  goalButton: {
    backgroundColor: '#CCCCCC',
  },
  targetContainer: {
    backgroundColor: 'white',
    marginTop: 20,
    padding: 10,
    borderRadius: 30,
    width: '100%',
    marginBottom: 20,
  },
  targetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    padding: 5,
  },
  targetHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    marginTop: 5,
  },
  targetContent: {
    flexDirection: 'row',
    gap: 20,
    flexWrap: 'wrap',
    marginTop: 10,
  },
  targetText: {
    color: '#888888',
    textAlign: 'left',
    width: '58%',
  },
  img: {
    height: 80,
    width: 110,
  },
  HeadingBoldtxt: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#888888',
  },
  headingBottom: {
    color: '#888888',
    fontSize: 16,
    fontWeight: '400',
  },
  linearGradient: {
    width: '100%',
    height: '100%',
    opacity: 0.95,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdown: {
    margin: 0,
    height: 40,
    width: 180,
    // backgroundColor: '#CCCCCC',
    borderRadius: 22,
    paddingHorizontal: 4,
  },
  dropdownContainer: {
    backgroundColor: '#444444',
    borderRadius: 22,
    marginTop: 10,
    width: 200,
  },
  // dropdownItemContainer: {
  //   backgroundColor: 'black',
  // },
  dropdownItemText: {
    color: 'white',
  },
  sselectedDropdownItem: {
    backgroundColor: 'blue',
  },
  selectedDropdownItemText: {
    color: 'white',
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

export default styles;
