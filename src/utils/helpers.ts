import { tz } from 'moment-timezone';
import { Linking } from 'react-native';
import { store } from '../core/store';
import { colors } from './colors';

const trimText = (text: string): string => {
  return text.replace(/^\s+|\s+$/g, '').replace(/\n/g, '');
};
const getCurrenttemplate = store.getState().loginReducer.eventDetail?.template;

const getFloatNumber = (num: any, decimalPlaces: number = 2): string => {
  const number = Number(num)
  if (isNaN(number)) {
    return number;
  }
  return number.toFixed(decimalPlaces);
};

const getYearsList = () => {
  const startYear = 2015;
  const timezone = store.getState().loginReducer.user?.time_zone_name;
  const currentYear = tz(timezone || 'UTC').year() - 1;
  const yearsArray = Array.from(
    {length: currentYear - startYear + 1},
    (_, index) => {
      const year = startYear + index;
      return {label: year?.toString(), value: year?.toString()};
    },
  );
  return yearsArray.reverse();
};

const trackerAttitudeOptions = [
  {label: 'Default', value: 'default'},
  {label: 'Yoda', value: 'yoda'},
  {label: 'Tough Love', value: 'tough_love'},
  {label: 'Positive', value: 'positive'},
  {label: 'Cheerleader', value: 'cheerleader'},
  {label: 'Scifi', value: 'scifi'},
  {label: 'Historian', value: 'historian'},
  {label: 'Superhero', value: 'superhero'},
];

function generateGoals(
  start: number,
  end: number,
  totalMiles?: number,
): {label: string; value: string}[] {
  const goals = Array.from(
    {length: Math.floor((end - start) / 500) + 1},
    (_, i) => {
      const value = Math.ceil(start / 500) * 500 + i * 500;
      return {label: value.toString(), value: value.toString()};
    },
  );
  if (totalMiles !== undefined && totalMiles !== null) {
    goals.push({label: totalMiles.toString(), value: totalMiles.toString()});
  }
  const uniqueGoals = goals.filter(
    (goal, index, self) =>
      index ===
      self.findIndex(t => {
        const goalValue = parseFloat(goal.value);
        const tValue = parseFloat(t.value);
        return Math.round(goalValue) === Math.round(tValue);
      }),
  );

  return uniqueGoals;
}

const templatePrimaryColors = [
  colors.primaryDarkBlue,
  colors.primaryBlue,
  colors.primaryBrown,
  colors.darkBlue,
];
const templateSettingsColors = [
  colors.primaryDarkBlue,
  colors.primaryBlue,
  colors.primaryYellow,
  colors.darkBlue,
];
const templateName = {
  AMERITHON: 1,
  RUN_WALK: 2,
  HEROS_JOURNEY: 3,
  RUN_FOUR: 4,
};

const gradientColors = [
  [
    'rgba(39, 87, 168, 1)',
    'rgba(39, 87, 168, 0.5)',
    'rgba(234, 29, 40, 0.15)',
    'rgba(255, 255, 255, 0)',
  ],
  [
    'rgba(47, 57, 143, 0.8)',
    'rgba(47, 57, 143, 0.8)',
    'rgba(0, 175, 237, 0.5)',
    'rgba(0, 178, 223, 0.55)',
    'rgba(0, 178, 223, 0)',
    'rgba(0, 178, 223, 0)',
  ],

  [
    'rgba(50, 10, 0, 1)',
    'rgba(50, 10, 0, 1)',
    'rgba(73, 22, 9, 0.5)',
    'rgba(237, 167, 76, 0.3)',
    'rgba(255, 255, 255, 0)',
  ],
  [
    'rgba(92, 46, 145, 1)',
    'rgba(92, 46, 145, 1)',
    'rgba(146, 39, 143, 0.9)',
    'rgba(146, 39, 143, 0.32)',
    'rgba(255, 255, 255, 0)',
  ],
];

const TabIconColor = [
  colors.primaryRed,
  colors.primaryBlue,
  colors.primaryYellow,
  colors.primaryPink,
];
const btnPrimaryColorArr = [
  colors.primaryDarkBlue,
  colors.primaryBlue,
  colors.primaryBrown,
  colors.darkPurple,
];
const toggleColorArr = [
  colors.lightRed,
  colors.headerBlack,
  colors.primaryBrown,
  colors.darkPurple,
];
const graphColorArr = [
  colors.primaryDarkBlue,
  colors.darkPink,
  colors.primaryBrown,
  colors.primaryMediumBlue,
];

const statsColorArr = [colors.primaryDarkBlue, colors.darkBlue];

const svgColorArr = [colors.headerBlack, colors.primaryBlue];

const statBtnClrArr = [colors.darkBlue, colors.primaryBlue];

const alertColorsArr = [
  colors.lightRed,
  colors.secondaryPink,
  colors.primaryYellow,
  colors.secondaryPink,
];
const starColorsArr = [
  colors.primaryYellow,
  colors.primaryYellow,
  colors.primaryGrey,
  colors.primaryYellow,
];

const getTemplateSpecs = getTemplate => {
  return {
    primaryColor: templatePrimaryColors[getTemplate - 1] || colors.headerBlack,
    gradientColor: gradientColors[getTemplate - 1] || ['#4267B2', '#4267B2'],
    bottomTabIconColor: TabIconColor[getTemplate - 1] || colors.headerBlack,
    btnPrimaryColor: btnPrimaryColorArr[getTemplate - 1] || colors.headerBlack,
    toggleColor: toggleColorArr[getTemplate - 1] || colors.headerBlack,
    graphColor: graphColorArr[getTemplate - 1] || colors.headerBlack,
    alertColors: alertColorsArr[getTemplate - 1] || colors.headerBlack,
    settingsColor:
      templateSettingsColors[getTemplate - 1] || colors.headerBlack,
    starColor: starColorsArr[getTemplate - 1] || colors.primaryYellow,
    statsColor: statsColorArr[getTemplate - 1] || colors.headerBlack,
    svgColor: svgColorArr[getTemplate - 1] || colors.headerBlack,
    statBtnClr: statBtnClrArr[getTemplate - 1] || colors.headerBlack,
  };
};
function getStartAndEndDateOfMonth(params?: {
  customMonth?: number;
  customYear?: number;
}): {startDate: string; endDate: string} {
  const timezone = store.getState().loginReducer.user?.time_zone_name;
  // This function will return the current month's start and end date
  const currentDate = new Date();
  const year = params?.customYear || currentDate.getFullYear();
  const month = params?.customMonth || currentDate.getMonth() + 1;
  // Create start and end dates in one line
  const paddedMonth = String(month).padStart(2, '0');
  const startDate = tz(`${year}-${paddedMonth}-01`, timezone || 'UTC').format(
    'YYYY-MM-DD',
  );
  const endDate = tz(`${year}-${paddedMonth}-01`, timezone || 'UTC')
    .endOf('month')
    .format('YYYY-MM-DD');

  return {startDate, endDate};
}

const openLink = url => {
  Linking.openURL(url).catch(err => console.error('Failed to open URL: ', err));
};

// CSS Named Colors Mapping
const namedColors: Record<string, string> = {
  white: '#FFFFFF',
  black: '#000000',
  gray: '#808080',
  grey: '#808080',
  silver: '#C0C0C0',
  lightgray: '#D3D3D3',
  lightgrey: '#D3D3D3',
  gainsboro: '#DCDCDC',
  whitesmoke: '#F5F5F5',
  snow: '#FFFAFA',
  linen: '#FAF0E6',
  seashell: '#FFF5EE',
};

const isWhite = (color: string) => {
  const whiteLimit = 200; // Adjust this threshold as needed

  // Convert named colors to hex
  if (namedColors[color.toLowerCase()]) {
    color = namedColors[color.toLowerCase()];
  }

  let r = 0,
    g = 0,
    b = 0;

  // HEX formats (#RRGGBB, #RRGGBBAA, #RGB, #RGBA)
  if (color.startsWith('#')) {
    let hex = color.slice(1);

    if (hex.length === 3 || hex.length === 4) {
      hex = hex
        .split('')
        .map(char => char + char)
        .join('');
    }
    if (hex.length === 6 || hex.length === 8) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    }
  }
  // RGB(A) format
  else if (color.startsWith('rgb')) {
    const match = color.match(/\d+/g);
    if (match) {
      r = parseInt(match[0], 10);
      g = parseInt(match[1], 10);
      b = parseInt(match[2], 10);
    }
  } else {
    return false; // Invalid format
  }

  return r >= whiteLimit && g >= whiteLimit && b >= whiteLimit;
};

function yearlyTransformData(inputData) {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  return inputData.map(({label, month}) => {
    const monthData = Object.fromEntries(
      month.map(({month, total_miles, coordinates}) => [
        month,
        {total_miles, coordinates},
      ]),
    );

    return {
      year: label,
      month: months.map(m => ({
        month: m,
        total_miles: monthData[m]?.total_miles || 0,
      })),
    };
  });
}

// Shared y-axis config helper for all charts logic works well till 6000 miles
export function getYAxisConfig(maxVal: number) {
  if (maxVal <= 100) {
    return {max: 100, increment: 10, labels: 11};
  } else if (maxVal <= 200) {
    return {max: 200, increment: 20, labels: 11};
  } else if (maxVal <= 500) {
    const max = Math.ceil(maxVal / 50) * 50;
    return {max, increment: 50, labels: Math.ceil(max / 50) + 1};
  } else if (maxVal <= 1000) {
    const max = Math.ceil(maxVal / 100) * 100;
    return {max, increment: 100, labels: Math.ceil(max / 100) + 1};
  } else {
    const max = Math.ceil(maxVal / 500) * 500;
    return {max, increment: 500, labels: Math.ceil(max / 500) + 1};
  }
}

export {
  generateGoals,
  getCurrenttemplate,
  getFloatNumber,
  getStartAndEndDateOfMonth,
  getTemplateSpecs,
  getYearsList,
  isWhite,
  openLink,
  templateName,
  trackerAttitudeOptions,
  trimText,
  yearlyTransformData
};

