import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SamsungHealthBackgroundSync,
  SYNC_FREQUENCY_KEY,
  SYNC_START_DATE_KEY,
  LAST_SYNC_DATE_KEY,
  SYNCED_TRANSACTION_IDS_KEY,
  SYNCED_STEPS_DATES_KEY,
  SYNCED_DISTANCE_DATES_KEY,
  ALLOWED_DATA_TYPES_KEY,
  EOD_SYNC_ENABLED_KEY,
  HOURLY_RECONCILIATION_ENABLED_KEY,
  RESYNC_SAMSUNG_SYNC_ID_KEY,
} from './SamsungHealthBackgroundSync';
import { SamsungHealth } from './SamsungHealthService';

/**
 * Interface for the mobile app user debug data payload
 */
export interface MobileAppUserPayload {
  model: string;
  system_version: string;
  app_version: string;
  debug_data: Record<string, any>;
}

/**
 * Service to collect mobile app debug data for API submission
 */
class MobileAppDebugServiceClass {
  /**
   * Collect all device information
   */
  private async collectDeviceInfo(): Promise<Record<string, any>> {
    try {
      const deviceInfo: Record<string, any> = {
        deviceId: await DeviceInfo.getDeviceId(),
        brand: DeviceInfo.getBrand(),
        model: DeviceInfo.getModel(),
        systemName: DeviceInfo.getSystemName(),
        systemVersion: DeviceInfo.getSystemVersion(),
        appVersion: DeviceInfo.getVersion(),
        buildNumber: DeviceInfo.getBuildNumber(),
        bundleId: DeviceInfo.getBundleId(),
        isEmulator: await DeviceInfo.isEmulator(),
        manufacturer: await DeviceInfo.getManufacturer(),
        apiLevel: Platform.OS === 'android' ? await DeviceInfo.getApiLevel() : null,
        totalMemory: await DeviceInfo.getTotalMemory(),
        usedMemory: await DeviceInfo.getUsedMemory(),
        deviceType: DeviceInfo.getDeviceType(),
        isTablet: DeviceInfo.isTablet(),
        hasNotch: DeviceInfo.hasNotch(),
        firstInstallTime: await DeviceInfo.getFirstInstallTime(),
        lastUpdateTime: await DeviceInfo.getLastUpdateTime(),
      };
      return deviceInfo;
    } catch (error: any) {
      console.error('[MobileAppDebugService] Error collecting device info:', error);
      return { error: error?.message || 'Failed to collect device info' };
    }
  }

  /**
   * Collect Samsung Health specific data (Android only)
   */
  private async collectSamsungHealthData(): Promise<Record<string, any> | null> {
    if (Platform.OS !== 'android') {
      return null;
    }

    try {
      // Get debug info from background sync service
      const syncDebugInfo = await SamsungHealthBackgroundSync.getDebugInfo();

      // Try to get permissions info
      let permissionsInfo = null;
      try {
        await SamsungHealth.initialize();
        const allowedDataTypes = syncDebugInfo?.serviceState?.allowedDataTypes || ['STEPS', 'EXERCISE'];
        permissionsInfo = await SamsungHealth.checkGrantedPermissions(allowedDataTypes);
      } catch (permError: any) {
        permissionsInfo = { error: permError?.message || 'Failed to check permissions' };
      }

      return {
        ...syncDebugInfo,
        permissions: permissionsInfo,
      };
    } catch (error: any) {
      console.error('[MobileAppDebugService] Error collecting Samsung Health data:', error);
      return { error: error?.message || 'Failed to collect Samsung Health data' };
    }
  }

  /**
   * Collect AsyncStorage data related to the app
   */
  private async collectStorageData(): Promise<Record<string, any>> {
    try {
      const storageData: Record<string, any> = {};

      // Samsung Health related keys (Android only)
      if (Platform.OS === 'android') {
        const [
          syncFrequency,
          syncStartDate,
          lastSyncDate,
          syncedIds,
          syncedSteps,
          syncedDistance,
          allowedTypes,
          eodEnabled,
          hourlyReconciliationEnabled,
          resyncId,
          bgFetchFailed,
        ] = await Promise.all([
          AsyncStorage.getItem(SYNC_FREQUENCY_KEY),
          AsyncStorage.getItem(SYNC_START_DATE_KEY),
          AsyncStorage.getItem(LAST_SYNC_DATE_KEY),
          AsyncStorage.getItem(SYNCED_TRANSACTION_IDS_KEY),
          AsyncStorage.getItem(SYNCED_STEPS_DATES_KEY),
          AsyncStorage.getItem(SYNCED_DISTANCE_DATES_KEY),
          AsyncStorage.getItem(ALLOWED_DATA_TYPES_KEY),
          AsyncStorage.getItem(EOD_SYNC_ENABLED_KEY),
          AsyncStorage.getItem(HOURLY_RECONCILIATION_ENABLED_KEY),
          AsyncStorage.getItem(RESYNC_SAMSUNG_SYNC_ID_KEY),
          AsyncStorage.getItem('@bg_fetch_setup_failed'),
        ]);

        storageData.samsungHealth = {
          syncFrequency,
          syncStartDate,
          lastSyncDate,
          syncedTransactionIdsCount: syncedIds ? JSON.parse(syncedIds).length : 0,
          syncedStepsDatesCount: syncedSteps ? JSON.parse(syncedSteps).length : 0,
          syncedDistanceDatesCount: syncedDistance ? JSON.parse(syncedDistance).length : 0,
          allowedDataTypes: allowedTypes,
          eodSyncEnabled: eodEnabled,
          hourlyReconciliationEnabled: hourlyReconciliationEnabled,
          resyncSyncId: resyncId,
          bgFetchSetupFailed: bgFetchFailed,
        };
      }

      // Add other app-related storage data here if needed
      const samsungConnectionStatus = await AsyncStorage.getItem('@samsung_health_connection_status');
      if (samsungConnectionStatus) {
        storageData.samsungConnectionStatus = samsungConnectionStatus;
      }

      return storageData;
    } catch (error: any) {
      console.error('[MobileAppDebugService] Error collecting storage data:', error);
      return { error: error?.message || 'Failed to collect storage data' };
    }
  }

  /**
   * Build the model string: "brand - model"
   */
  private async buildModelString(): Promise<string> {
    const brand = DeviceInfo.getBrand();
    const model = DeviceInfo.getModel();
    return `${brand} - ${model}`;
  }

  /**
   * Build the system version string
   * iOS: iOS version (e.g., "17.2")
   * Android: "Android version (API level)" (e.g., "11 (API 30)")
   */
  private async buildSystemVersionString(): Promise<string> {
    const systemVersion = DeviceInfo.getSystemVersion();

    if (Platform.OS === 'android') {
      try {
        const apiLevel = await DeviceInfo.getApiLevel();
        return `${systemVersion} (API ${apiLevel})`;
      } catch {
        return systemVersion;
      }
    }

    return systemVersion;
  }

  /**
   * Build the app version string: "appVersion (buildNumber)"
   */
  private buildAppVersionString(): string {
    const appVersion = DeviceInfo.getVersion();
    const buildNumber = DeviceInfo.getBuildNumber();
    return `${appVersion} (${buildNumber})`;
  }

  /**
   * Collect all debug data and build the payload for API submission
   */
  async collectDebugData(): Promise<MobileAppUserPayload> {
    const timestamp = new Date().toISOString();

    // Collect all data in parallel where possible
    const [
      model,
      systemVersion,
      deviceInfo,
      samsungHealthData,
      storageData,
    ] = await Promise.all([
      this.buildModelString(),
      this.buildSystemVersionString(),
      this.collectDeviceInfo(),
      this.collectSamsungHealthData(),
      this.collectStorageData(),
    ]);

    const appVersion = this.buildAppVersionString();

    // Build the debug_data object with all information
    const debugData: Record<string, any> = {
      timestamp,
      platform: Platform.OS,
      platformVersion: Platform.Version,
      device: deviceInfo,
      storage: storageData,
    };

    // Add Samsung Health data for Android
    if (Platform.OS === 'android' && samsungHealthData) {
      debugData.samsungHealth = samsungHealthData;
    }

    // Also include model, system_version, app_version in debug_data as requested
    debugData.model = model;
    debugData.system_version = systemVersion;
    debugData.app_version = appVersion;

    return {
      model,
      system_version: systemVersion,
      app_version: appVersion,
      debug_data: debugData,
    };
  }

  /**
   * Helper to wrap a 5-day cron summary with device information
   */
  async wrapCronSummary(summary: any): Promise<MobileAppUserPayload> {
    const basePayload = await this.collectDebugData();

    return {
      ...basePayload,
      debug_data: {
        ...basePayload.debug_data,
        cron_summary: summary,
      },
    };
  }
}

// Export singleton instance
export const MobileAppDebugService = new MobileAppDebugServiceClass();
