import { store } from '../core/store';
import { Routes } from './Routes';

const settingOptions: {value: string; iconName: string; routeName?: string}[] =
  [
    {value: 'Profile', iconName: 'ProfileIcon', routeName: Routes.PROFILE},
    {value: 'Password', iconName: 'PasswordIcon', routeName: Routes.PASSWORD},
    {
      value: 'Device \n Sync',
      iconName: 'DeviceSyncIcon',
      routeName: Routes.DEVICE_SYNC,
    },
    {
      value: 'Notifications',
      iconName: 'NotificationsIcon',
      routeName: Routes.NOTIFICATIONS,
    },
    {
      value: 'Manual  \n Entry',
      iconName: 'ManualEntryIcon',
      routeName: Routes.MANUAL_ENTRY,
    },
    {value: 'Privacy', iconName: 'PrivacyIcon', routeName: Routes.PRIVACY},
    // {value: 'Import', iconName: 'ImportIcon', routeName: Routes.IMPORT},
    {value: 'RTY \n Goals', iconName: 'RtyGoalsIcon', routeName: Routes.GOALS},
    // {
    //   value: 'Tracker \n Attitude',
    //   iconName: 'AttitudeIcon',
    //   routeName: Routes.TRACKER_ATTITUDE,
    // },
    {value: 'Tutorials', iconName: 'TutorialIcon', routeName: Routes.TUTORIAL},
    {value: 'Logout', iconName: 'LogoutIcon'},
  ];
const settingOptionsAmerithone: {
  value: string;
  iconName: string;
  routeName?: string;
}[] = [
  {value: 'Profile', iconName: 'ProfileIcon', routeName: Routes.PROFILE},
  {value: 'Password', iconName: 'PasswordIcon', routeName: Routes.PASSWORD},
  {
    value: 'Device \n Sync',
    iconName: 'DeviceSyncIcon',
    routeName: Routes.DEVICE_SYNC,
  },
  {
    value: 'Notifications',
    iconName: 'NotificationsIcon',
    routeName: Routes.NOTIFICATIONS,
  },
  {
    value: 'Manual \n Entry',
    iconName: 'ManualEntryIcon',
    routeName: Routes.MANUAL_ENTRY,
  },
  {value: 'Privacy', iconName: 'PrivacyIcon', routeName: Routes.PRIVACY},
  {value: 'RTY \n Goals', iconName: 'RtyGoalsIcon', routeName: Routes.GOALS},
  {value: 'Tutorials', iconName: 'TutorialIcon', routeName: Routes.TUTORIAL},
  {value: 'Logout', iconName: 'LogoutIcon'},
];
const settingOptionsHerosJourney: {
  value: string;
  iconName: string;
  routeName?: string;
}[] = [
  {value: 'Profile', iconName: 'ProfileIcon', routeName: Routes.PROFILE},
  {value: 'Password', iconName: 'PasswordIcon', routeName: Routes.PASSWORD},
  {
    value: 'Device \n Sync',
    iconName: 'DeviceSyncIcon',
    routeName: Routes.DEVICE_SYNC,
  },
  {
    value: 'Notifications',
    iconName: 'NotificationsIcon',
    routeName: Routes.NOTIFICATIONS,
  },
  {
    value: 'Manual \n Entry',
    iconName: 'ManualEntryIcon',
    routeName: Routes.MANUAL_ENTRY,
  },
  {value: 'Privacy', iconName: 'PrivacyIcon', routeName: Routes.PRIVACY},
  {value: 'Tutorials', iconName: 'TutorialIcon', routeName: Routes.TUTORIAL},
  {value: 'Logout', iconName: 'LogoutIcon'},
];

const questOptions: {value: string; iconName: string; routeName?: string}[] = [
  {
    value: 'Schedule a Quest',
    iconName: 'ScheduleQuestIcon',
    routeName: Routes.SCHEDULE_QUEST,
  },
  {
    value: 'Manage Quests',
    iconName: 'QuestsMagicIcon',
    routeName: Routes.MANAGE_QUEST,
  },
  {
    value: 'Quest\nHistory',
    iconName: 'HistoryIcon',
    routeName: Routes.QUEST_HISTORY,
  },
  {
    value: 'Journal',
    iconName: 'JournalIcon',
    routeName: Routes.JOURNEL,
  },
];

const genderOptions: {value: string; label: string}[] = [
  {label: 'male', value: 'male'},
  {label: 'female', value: 'female'},
  {label: 'other', value: 'other'},
];
const scheduleQuestOptions: {value: string; label: string}[] = [
  {label: 'Meeting with the Mentor', value: '1'},
  {label: 'Meeting with the Member', value: '2'},
];
const syndDevicesOptions: {label: string; iconName?: string; value: number}[] =
  [
    {label: 'FitBit', iconName: 'LogoFitBit', value: 1},
    {label: 'Garmin', iconName: 'LogoGarmin', value: 2},
    {label: 'Strava', iconName: 'LogoStrava', value: 3},
    {label: 'Apple', iconName: 'LogoAppleWatch', value: 4},
    {label: 'Oura Ring', iconName: 'LogoOura', value: 6},
    {label: 'Samsung', iconName: 'LogoSamsung', value: 7},
  ];

const adminOptions = [
  {label: 'Laure Smith', value: '1'},
  {label: 'Amy Gordon', value: '2'},
  {label: 'Tim Catalano', value: '3'},
];

const popusArray = [
  {
    id: 1,
    heading: 'Transfer Admin Role',
    description:
      'Select team member to whom you would like to transfer team admin role.',
    buttonTitle: 'Assign New Admin',
    showDropdown: true,
  },
  {
    id: 2,
    heading: 'Leave Team',
    description:
      'You are a team admin. Before you leave the team, you should talk to your team members and select a new team admin. If you leave now without transferring the team admin function, the first available team member will become team captain. Are you sure you want to leave %teamname%?',
    buttonTitle: 'Leave Team',
    showDropdown: false,
  },
  {
    id: 3,
    heading: 'Dissolve Team',
    description:
      'Thar! Here be dragons! If you dissolve a team, you will remove all members from it and delete team data. Don’t worry, individual members’ data will be preserved.\n\nAre you absolutely positively sure you want to dissolve and delete team %teamname%?',
    buttonTitle: 'Dissolve Team',
    showDropdown: false,
  },
];

const USTimeZones = [
  {
    label: 'Hawaii-Aleutian Standard Time (HST)',
    value: 'Hawaii-Aleutian Standard Time (HST)',
  },
  {
    label: 'Hawaii-Aleutian Daylight Time (HADT)',
    value: 'Hawaii-Aleutian Daylight Time (HADT)',
  },
  {label: 'Alaska Standard Time (AKST)', value: 'Alaska Standard Time (AKST)'},
  {label: 'Pacific Standard Time (PST)', value: 'Pacific Standard Time (PST)'},
  {
    label: 'Mountain Standard Time (MST)',
    value: 'Mountain Standard Time (MST)',
  },
  {label: 'Central Standard Time (CST)', value: 'Central Standard Time (CST)'},
  {label: 'Eastern Standard Time (EST)', value: 'Eastern Standard Time (EST'},
  {
    label: 'Atlantic Standard Time (AST)',
    value: 'Atlantic Standard Time (AST)',
  },
  {
    label: 'Newfoundland Standard Time (NST)',
    value: 'Newfoundland Standard Time (NST)',
  },
];

const MONTHS = [
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

const SpeedoMeterLabel = [
  {
    name: `${
      store.getState().loginReducer.eventDetail?.statistics?.completed_miles
    }\n miles`,
    labelColor: '#d3d3d3',
    activeBarColor: '#098522',
  },
  {
    name: `${
      store.getState().loginReducer.eventDetail?.statistics?.completed_miles
    }\n miles`,
    labelColor: '#d3d3d3',
    activeBarColor: '#098522',
  },
  {
    name: `${
      store.getState().loginReducer.eventDetail?.statistics?.completed_miles
    }\n miles`,
    labelColor: '#d3d3d3',
    activeBarColor: '#098522',
  },
  {
    name: `${
      store.getState().loginReducer.eventDetail?.statistics?.completed_miles
    }\n miles`,
    labelColor: '#d3d3d3',
    activeBarColor: '#098522',
  },
  {
    name: `${
      store.getState().loginReducer.eventDetail?.statistics?.completed_miles
    }\n miles`,
    labelColor: '#d3d3d3',
    activeBarColor: '#098522',
  },
  {
    name: `${
      store.getState().loginReducer.eventDetail?.statistics?.completed_miles
    }\n miles`,
    labelColor: '#d3d3d3',
    activeBarColor: '#098522',
  },
  {
    name: `${
      store.getState().loginReducer.eventDetail?.statistics?.completed_miles
    }\n miles`,
    labelColor: '#d3d3d3',
    activeBarColor: '#098522',
  },
  {
    name: `${
      store.getState().loginReducer.eventDetail?.statistics?.completed_miles
    }\n miles`,
    labelColor: '#d3d3d3',
    activeBarColor: '#098522',
  },
];

const deviceName: {[key: string]: number} = {
  manual: 1,
  fitbit: 2,
  garmin: 3,
  strava: 4,
  apple: 5,
  ouraring: 6,
  samsung: 7, // Updated to match syndDevicesOptions and backend API
};

const yearlyMilesChart = {
  years: [
    {
      id: '1',
      year: 2025,
      bgClr: 'rgba(67, 67, 72, 1)',
      month: [
        {name: 'Jan', total_miles: 100},
        {name: 'Feb', total_miles: 95},
        {name: 'Mar', total_miles: 89},
        {name: 'Apr', total_miles: 67},
        {name: 'May', total_miles: 0},
        {name: 'Jun', total_miles: 0},
        {name: 'Jul', total_miles: 0},
        {name: 'Aug', total_miles: 0},
        {name: 'Sep', total_miles: 0},
        {name: 'Oct', total_miles: 0},
        {name: 'Nov', total_miles: 0},
        {name: 'Dec', total_miles: 0},
      ],
    },
    {
      id: '2',
      year: 2024,
      bgClr: 'rgba(128, 182, 234, 1)',
      month: [
        {name: 'Jan', total_miles: 23},
        {name: 'Feb', total_miles: 21},
        {name: 'Mar', total_miles: 89},
        {name: 'Apr', total_miles: 67},
        {name: 'May', total_miles: 0},
        {name: 'Jun', total_miles: 0},
        {name: 'Jul', total_miles: 0},
        {name: 'Aug', total_miles: 0},
        {name: 'Sep', total_miles: 0},
        {name: 'Oct', total_miles: 0},
        {name: 'Nov', total_miles: 0},
        {name: 'Dec', total_miles: 0},
      ],
    },
    {
      id: '3',
      year: 2023,
      bgClr: 'rgba(237, 105, 41, 1)',
      month: [
        {name: 'Jan', total_miles: 22},
        {name: 'Feb', total_miles: 21},
        {name: 'Mar', total_miles: 89},
        {name: 'Apr', total_miles: 67},
        {name: 'May', total_miles: 0},
        {name: 'Jun', total_miles: 0},
        {name: 'Jul', total_miles: 0},
        {name: 'Aug', total_miles: 0},
        {name: 'Sep', total_miles: 0},
        {name: 'Oct', total_miles: 0},
        {name: 'Nov', total_miles: 0},
        {name: 'Dec', total_miles: 0},
      ],
    },
    {
      id: '4',
      year: 2022,
      bgClr: 'rgba(175, 218, 46, 1)',
      month: [
        {name: 'Jan', total_miles: 105},
        {name: 'Feb', total_miles: 21},
        {name: 'Mar', total_miles: 89},
        {name: 'Apr', total_miles: 67},
        {name: 'May', total_miles: 0},
        {name: 'Jun', total_miles: 0},
        {name: 'Jul', total_miles: 0},
        {name: 'Aug', total_miles: 0},
        {name: 'Sep', total_miles: 0},
        {name: 'Oct', total_miles: 0},
        {name: 'Nov', total_miles: 0},
        {name: 'Dec', total_miles: 0},
      ],
    },
    {
      id: '5',
      year: 2021,
      bgClr: 'rgba(33, 42, 68, 1)',
      month: [
        {name: 'Jan', total_miles: 20},
        {name: 'Feb', total_miles: 21},
        {name: 'Mar', total_miles: 89},
        {name: 'Apr', total_miles: 67},
        {name: 'May', total_miles: 0},
        {name: 'Jun', total_miles: 0},
        {name: 'Jul', total_miles: 0},
        {name: 'Aug', total_miles: 0},
        {name: 'Sep', total_miles: 0},
        {name: 'Oct', total_miles: 0},
        {name: 'Nov', total_miles: 0},
        {name: 'Dec', total_miles: 0},
      ],
    },
    {
      id: '6',
      year: 2020,
      bgClr: 'rgba(61, 226, 184, 1)',
      month: [
        {name: 'Jan', total_miles: 19},
        {name: 'Feb', total_miles: 21},
        {name: 'Mar', total_miles: 89},
        {name: 'Apr', total_miles: 67},
        {name: 'May', total_miles: 0},
        {name: 'Jun', total_miles: 0},
        {name: 'Jul', total_miles: 0},
        {name: 'Aug', total_miles: 0},
        {name: 'Sep', total_miles: 0},
        {name: 'Oct', total_miles: 0},
        {name: 'Nov', total_miles: 0},
        {name: 'Dec', total_miles: 0},
      ],
    },
    {
      id: '7',
      year: 2019,
      bgClr: 'rgba(183, 59, 250, 1)',
      month: [
        {name: 'Jan', total_miles: 18},
        {name: 'Feb', total_miles: 21},
        {name: 'Mar', total_miles: 89},
        {name: 'Apr', total_miles: 67},
        {name: 'May', total_miles: 0},
        {name: 'Jun', total_miles: 0},
        {name: 'Jul', total_miles: 0},
        {name: 'Aug', total_miles: 0},
        {name: 'Sep', total_miles: 0},
        {name: 'Oct', total_miles: 0},
        {name: 'Nov', total_miles: 0},
        {name: 'Dec', total_miles: 0},
      ],
    },
    {
      id: '8',
      year: 2018,
      bgClr: 'rgba(126, 2, 28, 1)',
      month: [
        {name: 'Jan', total_miles: 17},
        {name: 'Feb', total_miles: 21},
        {name: 'Mar', total_miles: 89},
        {name: 'Apr', total_miles: 67},
        {name: 'May', total_miles: 0},
        {name: 'Jun', total_miles: 0},
        {name: 'Jul', total_miles: 0},
        {name: 'Aug', total_miles: 0},
        {name: 'Sep', total_miles: 0},
        {name: 'Oct', total_miles: 0},
        {name: 'Nov', total_miles: 0},
        {name: 'Dec', total_miles: 0},
      ],
    },
    {
      id: '9',
      year: 2017,
      bgClr: 'rgb(102, 24, 220)',
      month: [
        {name: 'Jan', total_miles: 16},
        {name: 'Feb', total_miles: 21},
        {name: 'Mar', total_miles: 89},
        {name: 'Apr', total_miles: 67},
        {name: 'May', total_miles: 0},
        {name: 'Jun', total_miles: 0},
        {name: 'Jul', total_miles: 0},
        {name: 'Aug', total_miles: 0},
        {name: 'Sep', total_miles: 0},
        {name: 'Oct', total_miles: 0},
        {name: 'Nov', total_miles: 0},
        {name: 'Dec', total_miles: 0},
      ],
    },
    {
      id: '10',
      year: 2016,
      bgClr: 'rgb(235, 228, 228)',
      month: [
        {name: 'Jan', total_miles: 23},
        {name: 'Feb', total_miles: 21},
        {name: 'Mar', total_miles: 89},
        {name: 'Apr', total_miles: 67},
        {name: 'May', total_miles: 0},
        {name: 'Jun', total_miles: 0},
        {name: 'Jul', total_miles: 0},
        {name: 'Aug', total_miles: 0},
        {name: 'Sep', total_miles: 0},
        {name: 'Oct', total_miles: 0},
        {name: 'Nov', total_miles: 0},
        {name: 'Dec', total_miles: 0},
      ],
    },
  ],
};

const trackerDetails = {
  default: (date: string) =>
    `Nicely done! You are ahead! Even more ice-cream for you! You are predicted to finish approximately on ${date}.`,
  yoda: (date: string) =>
    `Powerful you have become but future is always changing. Finish you will on approximately ${date}.`,
  tough_love: () =>
    "Don't get cocky just because you are ahead of pace. You still have a lot to prove so go get more miles!",
  positive: (date: string) =>
    `Wow! You are amazing and well ahead of your goal! You are on target to finish approximately on ${date}.`,
  cheerleader: (date: string) =>
    `Pom-poms out, you're leading the pack! Keep that sparkle and stay on track! ${date}!`,
  scifi: (date: string) =>
    `Warp speed ahead! You're racing through the galaxy and on track to orbit the finish star on ${date}.`,
  historian: (date: string) =>
    `Bravo! You're setting a pace worthy of the history books, racing towards a triumphant finish on ${date}.`,
  superhero: (date: string) =>
    `Incredible! With great power comes great progress! You're soaring above the skyline, on course to save the day on ${date}.`,
};
const maxMilesCustom = 50;
export {
  adminOptions,
  deviceName,
  genderOptions,
  maxMilesCustom,
  MONTHS,
  popusArray,
  questOptions,
  scheduleQuestOptions,
  settingOptions,
  settingOptionsAmerithone,
  settingOptionsHerosJourney,
  SpeedoMeterLabel,
  syndDevicesOptions,
  trackerDetails,
  USTimeZones,
  yearlyMilesChart
};

