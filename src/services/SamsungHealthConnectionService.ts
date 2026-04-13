import AsyncStorage from '@react-native-async-storage/async-storage';
import {Platform} from 'react-native';
import {deviceConnectApi} from './deviceConnect.api';
import {store} from '../core/store';

const SAMSUNG_CONNECTION_CACHE_KEY = '@samsung_health_connection_status';

export interface SamsungConnectionStatus {
  isConnected: boolean;
  hasSourceProfile: boolean;
  lastChecked: string;
}

/**
 * Samsung Health Connection Service
 * Provides centralized connection status checking for Samsung Health
 */
class SamsungHealthConnectionService {
  /**
   * Check if Samsung Health is connected by querying device sync API
   * @returns Connection status with caching
   */
  async checkConnectionStatus(): Promise<SamsungConnectionStatus> {
    if (Platform.OS !== 'android') {
      return {
        isConnected: false,
        hasSourceProfile: false,
        lastChecked: new Date().toISOString(),
      };
    }

    try {
      // Query the device sync API to check for Samsung source_profile
      const result = await store.dispatch(
        deviceConnectApi.endpoints.getDeviceSync.initiate(
          {},
          {forceRefetch: true},
        ),
      );

      if ('data' in result && result.data?.data) {
        const devices = result.data.data;
        const samsungDevice = devices.find(
          (d: any) => d.short_name === 'samsung',
        );

        const status: SamsungConnectionStatus = {
          isConnected: !!samsungDevice?.source_profile,
          hasSourceProfile: !!samsungDevice?.source_profile,
          lastChecked: new Date().toISOString(),
        };

        // Cache the result
        await AsyncStorage.setItem(
          SAMSUNG_CONNECTION_CACHE_KEY,
          JSON.stringify(status),
        );

        return status;
      }

      return {
        isConnected: false,
        hasSourceProfile: false,
        lastChecked: new Date().toISOString(),
      };
    } catch (error) {
      console.error(
        '[SamsungConnection] Error checking connection status:',
        error,
      );

      // Try to return cached status
      try {
        const cached = await AsyncStorage.getItem(
          SAMSUNG_CONNECTION_CACHE_KEY,
        );
        if (cached) {
          return JSON.parse(cached);
        }
      } catch (e) {
        // Silent error
      }

      return {
        isConnected: false,
        hasSourceProfile: false,
        lastChecked: new Date().toISOString(),
      };
    }
  }

  /**
   * Get cached connection status (fast, non-network call)
   * @returns Cached connection status or null if not cached
   */
  async getCachedConnectionStatus(): Promise<SamsungConnectionStatus | null> {
    try {
      const cached = await AsyncStorage.getItem(SAMSUNG_CONNECTION_CACHE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      // Silent error
    }
    return null;
  }

  /**
   * Clear cached connection status
   */
  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(SAMSUNG_CONNECTION_CACHE_KEY);
    } catch (e) {
      // Silent error
    }
  }
}

export const SamsungHealthConnection = new SamsungHealthConnectionService();
