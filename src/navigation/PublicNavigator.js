import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import CustomTabBarButton from '../CommonScreens/CustomTabBarButton';
import { store } from '../core/store';
import { setActiveTab } from '../screen/Home/Home.slice';
import { Routes } from '../utils/Routes';
import { colors } from '../utils/colors';
import { templateName } from '../utils/helpers';
import CalendarStack from './CalendarStack';
import GraphStack from './GraphStack';
import HomeStack from './HomeStack';
import QuestStack from './QuestStack';
import SettingStack from './SettingStack';
import TeamStacks from './TeamStacks';
import TrophyStack from './TrophyStack';

const Tab = createBottomTabNavigator();

const getScreenOptions = iconName => ({
  tabBarIcon: ({ focused }) => (
    <CustomTabBarButton name={iconName} focused={focused} />
  ),
});

const PublicNavigator = () => {
  const { eventDetail } = useSelector(state => state.loginReducer);
  const eventStatus = eventDetail?.event_status;

  const { activeTab } = useSelector(state => state.homeReducer);
  return (
    <View style={styles.container}>
      <Tab.Navigator
        initialRouteName={activeTab || Routes.HOME_STACK}
        backBehavior="history"
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBarStyle,
          tabBarIconStyle: styles.tabBarIconStyle,
          tabBarLabelStyle: styles.tabBarLabelStyle,
          statusBarStyle: 'light-content',
          headerStyle: { backgroundColor: 'transparent' },
        }}>
        <Tab.Screen
          name={Routes.HOME_STACK}
          component={HomeStack}
          options={getScreenOptions('Menu')}
          listeners={({ navigation }) => ({
            tabPress: e => {
              navigation.reset({
                routes: [
                  {
                    name: Routes.HOME_STACK,
                    state: { routes: [{ name: Routes.HOME }] },
                  },
                ],
              });
            },
          })}
        />
        {eventDetail?.template !== templateName?.HEROS_JOURNEY && (
          <Tab.Screen
            name={Routes.GRAPH_STACK}
            component={GraphStack}
            options={getScreenOptions('GraphIcon')}
            listeners={({ navigation }) => ({
              tabPress: e => {
                if (eventStatus === 'future') {
                  e.preventDefault(); // Stop tab navigation
                  Alert.alert(
                    'Hold On',
                    'You’ll be able to access this page once the event has started.',
                  );
                  return;
                }

                navigation.reset({
                  routes: [
                    {
                      name: Routes.GRAPH_STACK,
                      state: { routes: [{ name: Routes.GRAPH }] },
                    },
                  ],
                });
              },
            })}
          />
        )}
        {eventDetail?.template === templateName?.HEROS_JOURNEY && (
          <Tab.Screen
            name={Routes.QUEST_STACK}
            component={QuestStack}
            options={getScreenOptions('QuestIcon')}
            listeners={({ navigation }) => ({
              tabPress: e => {
                navigation.reset({
                  routes: [
                    {
                      name: Routes.QUEST_STACK,
                      state: {
                        routes: [{ name: Routes.QUEST_OPTIONS }],
                      },
                    },
                  ],
                });
              },
            })}
          />
        )}
        <Tab.Screen
          name={Routes.CALENDAR_STACK}
          component={CalendarStack}
          options={getScreenOptions('Calander')}
          listeners={{
            tabPress: () => {
              store.dispatch(setActiveTab(Routes.CALENDAR_STACK));
            },
          }}
        />
        {eventDetail?.template !== templateName?.HEROS_JOURNEY && (
          <Tab.Screen
            name={Routes.TEAM_STACK}
            component={TeamStacks}
            options={getScreenOptions('Teams')}
            listeners={{
              tabPress: () => {
                store.dispatch(setActiveTab(Routes.TEAM_STACK));
              },
            }}
          />
        )}
        {/* eventDetail?.template !== templateName?.HEROS_JOURNEY  */}
        <Tab.Screen
          name={Routes.TROPHY_STACK}
          component={TrophyStack}
          options={getScreenOptions('TrophyIcon')}
          listeners={({ navigation }) => ({
            tabPress: e => {
              navigation.reset({
                routes: [
                  {
                    name: Routes.TROPHY_STACK,
                    state: {
                      routes: [{ name: Routes.SETTING }],
                    },
                  },
                ],
              });
            },
          })}
        />
        <Tab.Screen
          name={Routes.SETTING_STACK}
          component={SettingStack}
          options={getScreenOptions('Settings')}
          listeners={({ navigation }) => ({
            tabPress: e => {
              navigation.reset({
                routes: [
                  {
                    name: Routes.SETTING_STACK,
                    state: {
                      routes: [{ name: Routes.SETTING }],
                    },
                  },
                ],
              });
            },
          })}
        />
      </Tab.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.secondaryWhite },
  tabBarStyle: {
    backgroundColor: colors.white,
    height: 100,
    borderTopLeftRadius: 55,
    borderTopRightRadius: 55,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 5,
    paddingHorizontal: 20,
  },
  tabBarIconStyle: { marginTop: 20, width: 50, borderRadius: 60 },
  tabBarLabelStyle: { display: 'none' },
});

export default PublicNavigator;
