import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { FetchBaseUrl } from '../services/initialBaseUrl.api';
import { navigationRef } from '../services/NavigationService';
import AuthNavigator from './AuthNavigator';
import PublicNavigator from './PublicNavigator';

const Navigation = () => {
  const { token } = useSelector(state => state.loginReducer);
  const [isBaseUrlReady, setIsBaseUrlReady] = useState(false);
  const linking = {
    prefixes: [
      'rte://',
      'https://rte.com',
      'https://*.rte.com',
      'https://rte-api-new.w3creatives.com',
    ],
    config: {
      screens: {
        SettingStack: {
          initialRouteName: 'Setting',
          screens: {
            ConnectDevice:
              'settings/:access_token?/:refresh_token?/:token_expires_at?/:access_token_secret?/:short_name?/:id?',
          },
        },
      },
    },
  };

  useEffect(() => {
    const initializeApp = async () => {
      await FetchBaseUrl();
      setIsBaseUrlReady(true);
    };
    initializeApp();
  }, []);

  if (!isBaseUrlReady) {
    return null; // or a loading screen
  }

  return (
    <NavigationContainer linking={linking} ref={navigationRef}>
      {token ? <PublicNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};
export default Navigation;
