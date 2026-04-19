// utils/initBaseUrl.ts
import SplashScreen from 'react-native-splash-screen';
import { store } from '../core/store';
import { setBaseUrl } from './slice/Base.slice';

const FallBackUrl = 'https://rte-api-staging.w3creatives.com/rte-api/public/api';

export const FetchBaseUrl = async () => {
  try {
    const response = await fetch(
      'https://tracker.runtheedge.com/api/v1/app_endpoints',
    );
    const data = await response.json();

    const baseUrl = FallBackUrl;
    console.log('🚀 ~ FetchBaseUrl ~ baseUrl:', baseUrl);
    store.dispatch(setBaseUrl(baseUrl));
    SplashScreen.hide();
  } catch (error) {
    console.error('Failed to fetch app endpoints:', error);
    store.dispatch(setBaseUrl(FallBackUrl));
    SplashScreen.hide();
  }
};
