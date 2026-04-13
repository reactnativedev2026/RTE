import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppStateStatus, Platform } from 'react-native';
import BackgroundFetch from 'react-native-background-fetch';
import {
  SamsungHealthData,
  MappedExerciseData,
  SyncExercisePayload,
} from './SamsungHealthDataService';
import {
  SamsungHealth,
  ActivitySummaryDistanceData,
  StepsData,
  ExerciseData,
} from './SamsungHealthService';
import { store } from '../core/store';

// Storage keys
const SYNC_FREQUENCY_KEY = '@samsung_health_sync_frequency';
const SYNC_START_DATE_KEY = '@samsung_health_sync_start_date';
const LAST_SYNC_DATE_KEY = '@samsung_health_last_sync_date';
const SYNCED_TRANSACTION_IDS_KEY = '@samsung_health_synced_transactions';
const SYNCED_STEPS_DATES_KEY = '@samsung_health_synced_steps_dates';
const SYNCED_DISTANCE_DATES_KEY = '@samsung_health_synced_distance_dates';
const ALLOWED_DATA_TYPES_KEY = '@samsung_health_allowed_data_types';
const EOD_SYNC_ENABLED_KEY = '@samsung_health_eod_sync_enabled';
const HOURLY_RECONCILIATION_ENABLED_KEY =
  '@samsung_health_hourly_reconciliation_enabled';
const RESYNC_SAMSUNG_SYNC_ID_KEY = '@samsung_health_resync_sync_id';

// Daily data sync payload interface - comprehensive data for the day
export interface DailyDataSyncPayload {
  date: string; // YYYY-MM-DD
  sync_timestamp: string; // ISO timestamp of when sync was performed
  data: {
    steps: Array<{
      count: number;
      start_time: string;
      end_time: string;
      date: string;
    }>;
    activity_summary: Array<{
      start_time: string;
      end_time: string;
      date: string;
      distance_meters: number;
      distance_kilometers: number;
    }>;
    exercises: Array<{
      exercise_type: string;
      modality: string;
      start_time: string;
      end_time: string;
      duration_seconds: number;
      calories: number;
      distance_meters: number;
      distance_miles: number;
    }>;
  };
  raw_data: {
    steps: StepsData[];
    activity_summary: ActivitySummaryDistanceData[];
    exercises: ExerciseData[];
  };
  summary: {
    total_steps: number;
    total_distance_kilometers: number;
    total_distance_miles: number;
    total_exercise_distance_meters: number;
    total_exercise_distance_miles: number;
    daily_steps_distance_miles: number;
    total_calories_burned: number;
    total_exercise_duration_seconds: number;
    exercise_count: number;
  };
}

// Last sync date API response interface
export interface LastSyncDateResponse {
  success: boolean;
  data: {
    resync_data: boolean;
    last_sync_date: string; // YYYY-MM-DD format
    update_points_during_resync?: boolean; // If true, also update points data during resync
  };
  message: string;
}

export interface BackgroundSyncConfig {
  eventId: number;
  onSyncComplete?: (success: boolean, message: string) => void;
  onSyncStart?: () => void;
  allowedDataTypes?: string[]; // Optional array of allowed data types (e.g., ["STEPS", "EXERCISE"])
  resyncSamsungFrom?: string; // Date to resync from (YYYY-MM-DD format from UAT API)
  resyncSamsungSyncId?: string; // Sync ID from UAT API to track resync triggers
}

class SamsungHealthBackgroundSyncService {
  private intervalRef: NodeJS.Timeout | null = null;
  private syncFrequency: number = 600; // Default 10 minutes in seconds
  private syncStartDate: Date = new Date();
  private config: BackgroundSyncConfig | null = null;
  private syncApiFunction: ((payload: any) => Promise<any>) | null = null;
  private dailyDataSyncApiFunction: ((payload: any) => Promise<any>) | null =
    null;
  private updateLastCronApiFunction: ((payload: any) => Promise<any>) | null =
    null;
  private pushMobileAppUserDataApiFunction: ((payload: any) => Promise<any>) | null =
    null;
  private isSyncing: boolean = false;
  private appStateSubscription: any = null;
  private syncedTransactionIds: Set<string> = new Set(); // Stores individual exercise transaction IDs to detect new exercises
  private syncedStepsDates: Set<string> = new Set(); // Stores dates that have been synced for steps
  private syncedDistanceDates: Set<string> = new Set(); // Stores dates that have been synced for total distance
  private allowedDataTypes: string[] = []; // Stores allowed data types from UAT API
  private isInitialSync: boolean = true; // Track if this is the first sync
  private isInitialized: boolean = false; // Track if service has been initialized
  private isInitializing: boolean = false; // Track if service is currently initializing
  private isBackgroundFetchConfigured: boolean = false;
  // End-of-day sync properties
  private eodSyncEnabled: boolean = true; // End-of-day sync enabled by default
  private eodSyncTime: string = '02:00'; // Default 2:00 AM
  private isEodSyncScheduled: boolean = false; // Track if end-of-day sync task is scheduled
  // Hourly reconciliation sync properties
  private hourlyReconciliationEnabled: boolean = true; // Hourly reconciliation sync enabled by default
  private isHourlyReconciliationScheduled: boolean = false; // Track if hourly reconciliation task is scheduled
  // Resync properties
  private storedResyncSyncId: string | null = null; // Stored sync ID for detecting resync triggers
  // Foreground cron job state
  private isForegroundJobRunning: boolean = false;
  private foregroundJobQueued: boolean = false;
  // Scheduled jobs tracking
  private backgroundFetchConfiguredAt: Date | null = null;
  private eodSyncScheduledAt: Date | null = null;
  private eodSyncNextRunTime: Date | null = null;
  private hourlyReconciliationScheduledAt: Date | null = null;
  private hourlyReconciliationNextRunTime: Date | null = null;
  private regularSyncScheduledAt: Date | null = null;

  /**
   * Initialize the background sync service
   */
  async initialize(
    config: BackgroundSyncConfig,
    syncApiFunction: (payload: any) => Promise<any>,
    dailyDataSyncApiFunction?: (payload: any) => Promise<any>,
    updateLastCronApiFunction?: (payload: any) => Promise<any>,
    pushMobileAppUserDataApiFunction?: (payload: any) => Promise<any>,
  ): Promise<void> {
    // If already initialized, just update config and allowed data types
    if (this.isInitialized || this.isInitializing) {
      if (this.isInitialized) {
        this.config = config;
        this.syncApiFunction = syncApiFunction;
        if (dailyDataSyncApiFunction) {
          this.dailyDataSyncApiFunction = dailyDataSyncApiFunction;
        }
        if (updateLastCronApiFunction) {
          this.updateLastCronApiFunction = updateLastCronApiFunction;
        }
        if (pushMobileAppUserDataApiFunction) {
          this.pushMobileAppUserDataApiFunction = pushMobileAppUserDataApiFunction;
        }
        // Update allowed data types if provided
        if (config.allowedDataTypes) {
          this.allowedDataTypes = config.allowedDataTypes;
          await this.saveAllowedDataTypes();
          console.log(
            '[SamsungHealthSync] Updated allowed data types:',
            config.allowedDataTypes,
          );
        }
        // Check if resync is needed (even if already initialized)
        if (config.resyncSamsungFrom && config.resyncSamsungSyncId) {
          const resyncTriggered = await this.checkAndHandleResync(
            config.resyncSamsungFrom,
            config.resyncSamsungSyncId,
          );
          if (resyncTriggered) {
            console.log(
              '[SamsungHealthSync] Resync triggered during re-initialization',
            );
            // Trigger immediate sync after resync configuration
            await this.performSync();
          }
        }
      }
      return;
    }

    this.isInitializing = true;

    this.config = config;
    this.syncApiFunction = syncApiFunction;
    if (dailyDataSyncApiFunction) {
      this.dailyDataSyncApiFunction = dailyDataSyncApiFunction;
    }
    if (updateLastCronApiFunction) {
      this.updateLastCronApiFunction = updateLastCronApiFunction;
    }
    if (pushMobileAppUserDataApiFunction) {
      this.pushMobileAppUserDataApiFunction = pushMobileAppUserDataApiFunction;
    }

    // Load configuration from AsyncStorage
    await this.loadConfiguration();

    // Load synced transaction IDs
    await this.loadSyncedTransactionIds();

    // Load synced steps dates
    await this.loadSyncedStepsDates();

    // Load synced distance dates
    await this.loadSyncedDistanceDates();

    // Load allowed data types
    await this.loadAllowedDataTypes();

    // Update allowed data types from config if provided
    if (config.allowedDataTypes) {
      this.allowedDataTypes = config.allowedDataTypes;
      await this.saveAllowedDataTypes();
    }

    // Load end-of-day sync configuration
    await this.loadEodSyncConfig();

    // Load hourly reconciliation sync configuration
    await this.loadHourlyReconciliationConfig();

    // Load stored resync sync ID
    await this.loadResyncSyncId();

    // Check if resync is needed (before initial sync)
    if (config.resyncSamsungFrom && config.resyncSamsungSyncId) {
      const resyncTriggered = await this.checkAndHandleResync(
        config.resyncSamsungFrom,
        config.resyncSamsungSyncId,
      );
      if (resyncTriggered) {
        console.log(
          '[SamsungHealthSync] Resync triggered, sync start date and synced data cleared',
        );
      }
    }

    // Check if BackgroundFetch setup failed previously and retry
    if (Platform.OS === 'android') {
      try {
        const setupFailed = await AsyncStorage.getItem(
          '@bg_fetch_setup_failed',
        );
        if (setupFailed === 'true') {
          // Retry BackgroundFetch setup after a short delay
          setTimeout(() => {
            this.setupAndroidBackgroundFetchWithRetry();
          }, 500);
        }
      } catch (e) {
        // Silent error
      }
    }

    // Mark as initial sync (only for the very first initialization)
    this.isInitialSync = true;

    // Start the initial sync
    await this.performSync();

    // After initial sync, mark subsequent syncs as non-initial
    this.isInitialSync = false;

    // Perform initial day-by-day daily data sync (syncStartDate → today)
    if (this.dailyDataSyncApiFunction) {
      await this.performInitialDailySync();
    }

    // Mark service as initialized
    this.isInitialized = true;
    this.isInitializing = false;

    // Set up auto-refresh
    this.startAutoRefresh();

    // Listen to app state changes
    this.setupAppStateListener();

    // Android-only native background trigger so sync runs when app is killed
    // Delay setup to ensure native module is fully ready (especially on first install)
    if (Platform.OS === 'android') {
      // Use setTimeout to ensure React Native bridge is fully initialized
      setTimeout(() => {
        this.setupAndroidBackgroundFetchWithRetry();
      }, 1000);

      // Set up end-of-day sync scheduled task
      setTimeout(() => {
        this.setupEndOfDaySync();
      }, 1500);

      // Set up hourly reconciliation sync scheduled task
      setTimeout(() => {
        this.setupHourlyReconciliationSync();
      }, 2000);
    }
  }

  /**
   * Stop the background sync service
   */
  stop(): void {
    this.stopAutoRefresh();
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
    this.isInitialized = false;
  }

  /**
   * Reset all in-memory state (used during disconnect)
   * This clears all cached data to ensure clean reconnection
   */
  async reset(): Promise<void> {
    console.log('[SamsungHealthSync] Resetting all in-memory state...');

    // Stop the service first
    this.stop();

    // Stop background fetch on Android
    if (Platform.OS === 'android') {
      try {
        await BackgroundFetch.stop();
        console.log('[SamsungHealthSync] BackgroundFetch stopped');
      } catch (error) {
        console.error(
          '[SamsungHealthSync] Error stopping BackgroundFetch:',
          error,
        );
      }
    }

    // Clear all in-memory collections
    this.syncedTransactionIds.clear();
    this.syncedStepsDates.clear();
    this.syncedDistanceDates.clear();

    // Reset configuration
    this.config = null;
    this.syncApiFunction = null;
    this.dailyDataSyncApiFunction = null;
    this.updateLastCronApiFunction = null;
    this.pushMobileAppUserDataApiFunction = null;
    this.allowedDataTypes = [];

    // Reset flags
    this.isSyncing = false;
    this.isInitialSync = true;
    this.isBackgroundFetchConfigured = false;
    this.isForegroundJobRunning = false;
    this.foregroundJobQueued = false;
    this.isEodSyncScheduled = false;
    this.isHourlyReconciliationScheduled = false;

    // Reset resync state
    this.storedResyncSyncId = null;

    // Reset to defaults
    this.syncFrequency = 600;
    this.syncStartDate = new Date();

    console.log('[SamsungHealthSync] All in-memory state cleared');
  }

  /**
   * Load configuration from AsyncStorage
   */
  private async loadConfiguration(): Promise<void> {
    try {
      // Load sync frequency
      const savedFrequency = await AsyncStorage.getItem(SYNC_FREQUENCY_KEY);
      if (savedFrequency !== null) {
        this.syncFrequency = parseInt(savedFrequency, 10);
      }

      // Load sync start date
      const savedStartDate = await AsyncStorage.getItem(SYNC_START_DATE_KEY);
      if (savedStartDate !== null) {
        this.syncStartDate = new Date(savedStartDate);
      }
    } catch (error) {
      // Silent error
    }
  }

  /**
   * Load synced transaction IDs from AsyncStorage
   */
  private async loadSyncedTransactionIds(): Promise<void> {
    try {
      const saved = await AsyncStorage.getItem(SYNCED_TRANSACTION_IDS_KEY);
      if (saved !== null) {
        this.syncedTransactionIds = new Set(JSON.parse(saved));
      }
    } catch (error) {
      // Silent error
    }
  }

  /**
   * Save synced transaction IDs to AsyncStorage
   */
  private async saveSyncedTransactionIds(): Promise<void> {
    try {
      const idsArray = Array.from(this.syncedTransactionIds);
      await AsyncStorage.setItem(
        SYNCED_TRANSACTION_IDS_KEY,
        JSON.stringify(idsArray),
      );
    } catch (error) {
      // Silent error
    }
  }

  /**
   * Load synced steps dates from AsyncStorage
   */
  private async loadSyncedStepsDates(): Promise<void> {
    try {
      const saved = await AsyncStorage.getItem(SYNCED_STEPS_DATES_KEY);
      if (saved !== null) {
        this.syncedStepsDates = new Set(JSON.parse(saved));
      }
    } catch (error) {
      // Silent error
    }
  }

  /**
   * Save synced steps dates to AsyncStorage
   */
  private async saveSyncedStepsDates(): Promise<void> {
    try {
      const datesArray = Array.from(this.syncedStepsDates);
      await AsyncStorage.setItem(
        SYNCED_STEPS_DATES_KEY,
        JSON.stringify(datesArray),
      );
    } catch (error) {
      // Silent error
    }
  }

  /**
   * Load synced distance dates from AsyncStorage
   */
  private async loadSyncedDistanceDates(): Promise<void> {
    try {
      const saved = await AsyncStorage.getItem(SYNCED_DISTANCE_DATES_KEY);
      if (saved !== null) {
        this.syncedDistanceDates = new Set(JSON.parse(saved));
      }
    } catch (error) {
      // Silent error
    }
  }

  /**
   * Save synced distance dates to AsyncStorage
   */
  private async saveSyncedDistanceDates(): Promise<void> {
    try {
      const datesArray = Array.from(this.syncedDistanceDates);
      await AsyncStorage.setItem(
        SYNCED_DISTANCE_DATES_KEY,
        JSON.stringify(datesArray),
      );
    } catch (error) {
      // Silent error
    }
  }

  /**
   * Load allowed data types from AsyncStorage
   */
  private async loadAllowedDataTypes(): Promise<void> {
    try {
      const saved = await AsyncStorage.getItem(ALLOWED_DATA_TYPES_KEY);
      if (saved !== null) {
        this.allowedDataTypes = JSON.parse(saved);
      }
    } catch (error) {
      // Silent error
    }
  }

  /**
   * Save allowed data types to AsyncStorage
   */
  private async saveAllowedDataTypes(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        ALLOWED_DATA_TYPES_KEY,
        JSON.stringify(this.allowedDataTypes),
      );
    } catch (error) {
      // Silent error
    }
  }

  /**
   * Load end-of-day sync configuration from AsyncStorage
   */
  private async loadEodSyncConfig(): Promise<void> {
    try {
      const enabled = await AsyncStorage.getItem(EOD_SYNC_ENABLED_KEY);
      if (enabled !== null) {
        this.eodSyncEnabled = enabled === 'true';
      }
    } catch (error) {
      // Silent error
    }
  }

  /**
   * Load hourly reconciliation sync configuration from AsyncStorage
   */
  private async loadHourlyReconciliationConfig(): Promise<void> {
    try {
      const enabled = await AsyncStorage.getItem(
        HOURLY_RECONCILIATION_ENABLED_KEY,
      );
      if (enabled !== null) {
        this.hourlyReconciliationEnabled = enabled === 'true';
      }
    } catch (error) {
      // Silent error
    }
  }

  /**
   * Load stored resync sync ID from AsyncStorage
   */
  private async loadResyncSyncId(): Promise<void> {
    try {
      const storedId = await AsyncStorage.getItem(RESYNC_SAMSUNG_SYNC_ID_KEY);
      this.storedResyncSyncId = storedId;
      console.log(
        '[SamsungHealthSync] Loaded stored resync sync ID:',
        storedId,
      );
    } catch (error) {
      // Silent error
    }
  }

  /**
   * Save resync sync ID to AsyncStorage
   */
  private async saveResyncSyncId(syncId: string): Promise<void> {
    try {
      await AsyncStorage.setItem(RESYNC_SAMSUNG_SYNC_ID_KEY, syncId);
      this.storedResyncSyncId = syncId;
      console.log('[SamsungHealthSync] Saved resync sync ID:', syncId);
    } catch (error) {
      // Silent error
    }
  }

  /**
   * Update allowed data types (called when UAT authorization changes)
   */
  async updateAllowedDataTypes(allowedDataTypes: string[]): Promise<void> {
    this.allowedDataTypes = allowedDataTypes;
    await this.saveAllowedDataTypes();
    console.log(
      '[SamsungHealthSync] Updated allowed data types:',
      allowedDataTypes,
    );
  }

  /**
   * Setup app state listener for background/foreground transitions
   */
  private setupAppStateListener(): void {
    this.appStateSubscription = AppState.addEventListener(
      'change',
      async (nextAppState: AppStateStatus) => {
        if (nextAppState === 'active') {
          await this.performSync();
          // Check if EOD sync was missed and run it if needed
          await this.checkAndRunMissedEodSync();
          // Process pending cron data on foreground
          this.performForegroundJob();
        }
        // Continue syncing in background - interval keeps running
      },
    );
  }

  /**
   * Check if EOD sync was missed and run it if needed
   * This serves as a fallback mechanism when the scheduled 02:00 AM task is missed
   * due to device being in Doze mode, heavy load, or battery optimization
   */
  private async checkAndRunMissedEodSync(): Promise<void> {
    if (!this.eodSyncEnabled || !this.eodSyncNextRunTime) {
      return;
    }

    const now = new Date();

    // If next scheduled EOD sync time is in the past, it was missed
    if (this.eodSyncNextRunTime < now) {
      const missedBy = Math.floor(
        (now.getTime() - this.eodSyncNextRunTime.getTime()) / 1000 / 60,
      ); // minutes
      console.log(
        `[SamsungHealthSync] Missed EOD sync detected (missed by ${missedBy} minutes), running now...`,
      );

      try {
        await this.performEndOfDaySync();

        // Recalculate next run time for tomorrow
        const [targetHour, targetMinute] = this.eodSyncTime
          .split(':')
          .map(Number);
        const delayMs = this.getMillisecondsUntilTime(targetHour, targetMinute);
        this.eodSyncNextRunTime = new Date(Date.now() + delayMs);

        console.log(
          '[SamsungHealthSync] Missed EOD sync completed. Next run:',
          this.eodSyncNextRunTime.toISOString(),
        );
      } catch (error: any) {
        console.error(
          '[SamsungHealthSync] Error running missed EOD sync:',
          error,
        );
      }
    }
  }

  /**
   * Get previous day's date in YYYY-MM-DD format
   */
  private getPreviousDayDate(): string {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const year = yesterday.getFullYear();
    const month = String(yesterday.getMonth() + 1).padStart(2, '0');
    const day = String(yesterday.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Calculate milliseconds until target time (default 2:00 AM)
   * If target time has passed today, schedule for tomorrow
   */
  private getMillisecondsUntilTime(
    targetHour: number = 2,
    targetMinute: number = 0,
  ): number {
    const now = new Date();
    const target = new Date();
    target.setHours(targetHour, targetMinute, 0, 0);

    // If target time has already passed today, schedule for tomorrow
    if (target <= now) {
      target.setDate(target.getDate() + 1);
    }

    return target.getTime() - now.getTime();
  }

  /**
   * Setup BackgroundFetch with retry logic (Android only)
   */
  private async setupAndroidBackgroundFetchWithRetry(
    retryCount: number = 0,
  ): Promise<void> {
    if (this.isBackgroundFetchConfigured) {
      return;
    }

    try {
      await this.setupAndroidBackgroundFetch();
    } catch (error) {
      console.error('[BGFetch] Setup failed, retry:', retryCount, error);

      // Retry up to 3 times with increasing delay
      if (retryCount < 3) {
        const delay = (retryCount + 1) * 2000; // 2s, 4s, 6s
        setTimeout(() => {
          this.setupAndroidBackgroundFetchWithRetry(retryCount + 1);
        }, delay);
      } else {
        // Store flag to retry on next app open
        try {
          await AsyncStorage.setItem('@bg_fetch_setup_failed', 'true');
        } catch (e) {
          // Silent error
        }
      }
    }
  }

  /**
   * Configure native background fetch (Android only)
   */
  private async setupAndroidBackgroundFetch(): Promise<void> {
    if (this.isBackgroundFetchConfigured) {
      return;
    }

    const onEvent = async (taskId: string) => {
      try {
        console.log('[BGFetch] Task triggered:', taskId);

        // Handle end-of-day sync task
        if (taskId === 'shealth-eod-sync') {
          console.log('[BGFetch] Running end-of-day sync...');
          await this.performEndOfDaySync();
          BackgroundFetch.finish(taskId);
          return;
        }

        // Handle hourly reconciliation sync task
        if (taskId === 'shealth-hourly-reconciliation') {
          console.log('[BGFetch] Running hourly reconciliation sync...');
          await this.performHourlyReconciliation();
          BackgroundFetch.finish(taskId);
          return;
        }

        // Handle regular sync task
        const currentAppState = AppState.currentState;
        // Skip if app is in foreground - interval handles foreground syncs
        if (currentAppState === 'active') {
          BackgroundFetch.finish(taskId);
          return;
        }
        await this.performSync();
      } catch (error) {
        console.error('[BGFetch] Sync error:', error);
      } finally {
        BackgroundFetch.finish(taskId);
      }
    };

    const onTimeout = async () => {
      BackgroundFetch.finish();
    };

    // Align background trigger to the same seconds cadence as performSync.
    const minimumFetchInterval = Math.ceil(this.syncFrequency / 60); // minutes

    await BackgroundFetch.configure(
      {
        minimumFetchInterval,
        stopOnTerminate: false,
        startOnBoot: true,
        enableHeadless: true,
        requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY,
        forceAlarmManager: true, // more reliable on some OEMs
      },
      onEvent,
      onTimeout,
    );

    // Additional scheduled task to improve reliability
    await BackgroundFetch.scheduleTask({
      taskId: 'shealth-sync',
      delay: this.syncFrequency * 1000,
      forceAlarmManager: true,
      periodic: true,
      stopOnTerminate: false,
      enableHeadless: true,
      requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY,
    });

    await BackgroundFetch.start();
    this.isBackgroundFetchConfigured = true;
    this.backgroundFetchConfiguredAt = new Date();
    this.regularSyncScheduledAt = new Date();

    // Clear any previous failure flag
    try {
      await AsyncStorage.removeItem('@bg_fetch_setup_failed');
    } catch (e) {
      // Silent error
    }
  }

  /**
   * Setup end-of-day sync scheduled task (Android only)
   * Schedules a task to run at 2:00 AM daily to sync previous day's data
   */
  private async setupEndOfDaySync(): Promise<void> {
    if (!this.eodSyncEnabled) {
      console.log('[SamsungHealthSync] EOD sync is disabled, skipping setup');
      return;
    }

    if (this.isEodSyncScheduled) {
      console.log('[SamsungHealthSync] EOD sync already scheduled');
      return;
    }

    try {
      // Parse EOD sync time (format: "HH:MM")
      const [targetHour, targetMinute] = this.eodSyncTime
        .split(':')
        .map(Number);

      // Calculate delay until 2:00 AM (or configured time)
      const delayMs = this.getMillisecondsUntilTime(targetHour, targetMinute);
      const delaySeconds = Math.floor(delayMs / 1000);

      console.log('[SamsungHealthSync] Scheduling EOD sync task:', {
        targetTime: this.eodSyncTime,
        delayMs,
        delaySeconds,
        nextRunTime: new Date(Date.now() + delayMs).toISOString(),
      });

      // Schedule end-of-day sync task
      await BackgroundFetch.scheduleTask({
        taskId: 'shealth-eod-sync',
        delay: delayMs, // Delay until 2:00 AM
        periodic: true, // Repeat daily
        forceAlarmManager: true, // Use AlarmManager for precise timing
        stopOnTerminate: false, // Continue after app is killed
        enableHeadless: true, // Run even when app is not running
        requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY,
      });

      this.isEodSyncScheduled = true;
      this.eodSyncScheduledAt = new Date();
      this.eodSyncNextRunTime = new Date(Date.now() + delayMs);
      console.log('[SamsungHealthSync] EOD sync task scheduled successfully');
    } catch (error: any) {
      console.error('[SamsungHealthSync] Error setting up EOD sync:', error);
    }
  }

  /**
   * Setup hourly reconciliation sync scheduled task (Android only)
   * Schedules a task to run every hour to reconcile and sync current day's data
   * This helps ensure data accuracy throughout the day and reduces discrepancies
   */
  private async setupHourlyReconciliationSync(): Promise<void> {
    if (!this.hourlyReconciliationEnabled) {
      console.log(
        '[SamsungHealthSync] Hourly reconciliation sync is disabled, skipping setup',
      );
      return;
    }

    if (this.isHourlyReconciliationScheduled) {
      console.log(
        '[SamsungHealthSync] Hourly reconciliation sync already scheduled',
      );
      return;
    }

    try {
      // Schedule to run every hour (3600000 ms)
      const hourlyIntervalMs = 60 * 60 * 1000; // 1 hour in milliseconds

      console.log(
        '[SamsungHealthSync] Scheduling hourly reconciliation sync task:',
        {
          intervalMs: hourlyIntervalMs,
          intervalMinutes: 60,
          nextRunTime: new Date(Date.now() + hourlyIntervalMs).toISOString(),
        },
      );

      // Schedule hourly reconciliation sync task
      await BackgroundFetch.scheduleTask({
        taskId: 'shealth-hourly-reconciliation',
        delay: hourlyIntervalMs, // Run every hour
        periodic: true, // Repeat hourly
        forceAlarmManager: true, // Use AlarmManager for reliable timing
        stopOnTerminate: false, // Continue after app is killed
        enableHeadless: true, // Run even when app is not running
        requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY,
      });

      this.isHourlyReconciliationScheduled = true;
      this.hourlyReconciliationScheduledAt = new Date();
      this.hourlyReconciliationNextRunTime = new Date(
        Date.now() + hourlyIntervalMs,
      );
      console.log(
        '[SamsungHealthSync] Hourly reconciliation sync task scheduled successfully',
      );
    } catch (error: any) {
      console.error(
        '[SamsungHealthSync] Error setting up hourly reconciliation sync:',
        error,
      );
    }
  }

  /**
   * Start auto-refresh interval
   */
  private startAutoRefresh(): void {
    // Clear any existing interval
    this.stopAutoRefresh();

    if (this.syncFrequency > 0) {
      this.intervalRef = setInterval(() => {
        this.performSync();
      }, this.syncFrequency * 1000);
    }
  }

  /**
   * Stop auto-refresh interval
   */
  private stopAutoRefresh(): void {
    if (this.intervalRef) {
      clearInterval(this.intervalRef);
      this.intervalRef = null;
    }
  }

  /**
   * Generate transaction ID for an individual exercise (for tracking purposes)
   */
  private generateExerciseTransactionId(exercise: MappedExerciseData): string {
    const timestamp = new Date(exercise.startTime).getTime();
    const typeHash = exercise.exerciseType
      .replace('PredefinedExerciseType.', '')
      .toLowerCase();
    return `samsung_exercise_${timestamp}_${typeHash}`;
  }

  /**
   * Filter exercises to find which ones haven't been synced yet
   */
  private filterUnSyncedExercises(
    exercises: MappedExerciseData[],
  ): MappedExerciseData[] {
    return exercises.filter(exercise => {
      const transactionId = this.generateExerciseTransactionId(exercise);
      return !this.syncedTransactionIds.has(transactionId);
    });
  }

  /**
   * Mark individual exercises as synced
   */
  private async markExercisesAsSynced(
    exercises: MappedExerciseData[],
  ): Promise<void> {
    exercises.forEach(exercise => {
      const transactionId = this.generateExerciseTransactionId(exercise);
      this.syncedTransactionIds.add(transactionId);
    });
    await this.saveSyncedTransactionIds();
  }

  /**
   * Get unique date+modality combinations from exercises
   */
  private getDateModalityCombinations(
    exercises: MappedExerciseData[],
  ): Set<string> {
    const combinations = new Set<string>();
    exercises.forEach(exercise => {
      const date = this.formatDateForAPI(exercise.startTime);
      const key = `${date}_${exercise.modality}`;
      combinations.add(key);
    });
    return combinations;
  }

  /**
   * Format date to YYYY-MM-DD format for API
   * Keeps the date exactly as received from Samsung without any timezone conversion
   */
  private formatDateForAPI(dateStr: string): string {
    console.log('[SamsungHealthSync] Formatting date:', dateStr);
    try {
      // Check if the string is already in YYYY-MM-DD format (date-only)
      const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;
      if (dateOnlyPattern.test(dateStr)) {
        // Return as-is - this is what Samsung returns
        return dateStr;
      }

      // For datetime strings, extract the date part directly from the string
      // This avoids any timezone conversion issues
      // Format: "YYYY-MM-DDTHH:mm:ss" or "YYYY-MM-DD HH:mm:ss"
      const dateMatch = dateStr.match(/^(\d{4}-\d{2}-\d{2})/);
      if (dateMatch) {
        console.log('[SamsungHealthSync] Extracted date:', dateMatch[1]);
        return dateMatch[1];
      }

      // Fallback: return as-is if we can't parse it
      console.error('[SamsungHealthSync] Fallback formatting date:', dateStr);
      return dateStr;
    } catch {
      console.error('[SamsungHealthSync] Error formatting date:', dateStr);
      return dateStr;
    }
  }

  /**
   * Filter exercises to only include those from specific date+modality combinations
   */
  private filterExercisesByDateModality(
    exercises: MappedExerciseData[],
    dateModalityCombinations: Set<string>,
  ): MappedExerciseData[] {
    return exercises.filter(exercise => {
      const date = this.formatDateForAPI(exercise.startTime);
      const key = `${date}_${exercise.modality}`;
      return dateModalityCombinations.has(key);
    });
  }

  /**
   * Check if resync is needed and handle it
   * This is called during initialization with config from UAT API
   * If resync_samsung_sync_id has changed, trigger a full resync from resync_samsung_from date
   */
  async checkAndHandleResync(
    resyncSamsungFrom?: string,
    resyncSamsungSyncId?: string,
  ): Promise<boolean> {
    // If no resync data provided, skip
    if (!resyncSamsungSyncId || !resyncSamsungFrom) {
      console.log(
        '[SamsungHealthSync] No resync data provided, skipping resync check',
      );
      return false;
    }

    console.log('[SamsungHealthSync] Checking resync requirement:', {
      apiSyncId: resyncSamsungSyncId,
      storedSyncId: this.storedResyncSyncId,
      resyncFrom: resyncSamsungFrom,
    });

    // Check if sync ID has changed
    if (this.storedResyncSyncId === resyncSamsungSyncId) {
      console.log(
        '[SamsungHealthSync] Resync sync ID matches, no resync needed',
      );
      return false;
    }

    // Resync is needed
    console.log(
      '[SamsungHealthSync] Resync sync ID changed, triggering resync from:',
      resyncSamsungFrom,
    );

    try {
      // Clear all synced data to force full resync
      console.log('[SamsungHealthSync] Clearing synced data for resync...');
      await this.clearSyncedData();

      // Update sync start date to the resync_from date
      const resyncStartDate = new Date(resyncSamsungFrom);
      if (isNaN(resyncStartDate.getTime())) {
        console.error(
          '[SamsungHealthSync] Invalid resync_from date:',
          resyncSamsungFrom,
        );
        return false;
      }

      console.log(
        '[SamsungHealthSync] Setting sync start date to:',
        resyncStartDate.toISOString(),
      );
      await this.updateSyncStartDate(resyncStartDate);

      // Save the new resync sync ID
      await this.saveResyncSyncId(resyncSamsungSyncId);

      console.log(
        '[SamsungHealthSync] Resync configuration updated, sync will start automatically',
      );
      return true;
    } catch (error: any) {
      console.error('[SamsungHealthSync] Error handling resync:', error);
      return false;
    }
  }

  /**
   * Perform sync operation
   */
  private async performSync(): Promise<void> {
    // Prevent concurrent syncs
    if (this.isSyncing) {
      return;
    }

    if (!this.config || !this.syncApiFunction) {
      return;
    }

    this.isSyncing = true;

    try {
      if (this.config.onSyncStart) {
        this.config.onSyncStart();
      }

      // Calculate days to fetch from sync start date to today
      const today = new Date();
      const daysDiff = Math.ceil(
        (today.getTime() - this.syncStartDate.getTime()) /
        (1000 * 60 * 60 * 24),
      );
      const daysToFetch = Math.max(1, daysDiff);

      // Check if EXERCISE is in allowed data types
      const isExerciseAllowed = this.allowedDataTypes
        .map(t => t.toUpperCase())
        .includes('EXERCISE');

      console.log('[SamsungHealthSync] Allowed data types:', {
        allowed: this.allowedDataTypes,
        isExerciseAllowed,
      });

      // Fetch data based on allowed types
      let allExercises: MappedExerciseData[] = [];
      let allActivitySummaryDistance: ActivitySummaryDistanceData[] = [];

      try {
        // Always fetch activity summary distance (always allowed)
        // Only fetch exercise if EXERCISE is in allowed data types
        const fetchPromises: Promise<any>[] = [
          SamsungHealthData.fetchActivitySummaryDistance(daysToFetch),
        ];

        if (isExerciseAllowed) {
          fetchPromises.push(SamsungHealthData.fetchExerciseData(daysToFetch));
        } else {
          console.log(
            '[SamsungHealthSync] Exercise data not allowed, skipping fetch',
          );
        }

        const results = await Promise.all(fetchPromises);
        allActivitySummaryDistance = results[0];
        if (isExerciseAllowed && results.length > 1) {
          allExercises = results[1];
        }

        console.log('[SamsungHealthSync] Fetched data:', {
          exercises: allExercises.length,
          activitySummaryDistance: allActivitySummaryDistance.length,
          daysToFetch,
          isExerciseAllowed,
        });
      } catch (fetchError: any) {
        // If error is about exercise not being allowed, only log it and continue with activity summary
        if (
          fetchError?.message?.includes('not allowed to read for exercise') ||
          fetchError?.code === 'AuthorizationException'
        ) {
          console.warn(
            '[SamsungHealthSync] Exercise data not allowed, continuing with activity summary only:',
            fetchError.message,
          );
          // Try to fetch activity summary distance only
          try {
            allActivitySummaryDistance =
              await SamsungHealthData.fetchActivitySummaryDistance(daysToFetch);
            allExercises = [];
          } catch (activityError: any) {
            console.error(
              '[SamsungHealthSync] Error fetching activity summary distance:',
              activityError,
            );
            throw activityError;
          }
        } else {
          console.error('[SamsungHealthSync] Error fetching data:', fetchError);
          throw fetchError;
        }
      }

      // Process exercise data
      const exercisesAfterStartDate = allExercises.filter(exercise => {
        const exerciseDate = new Date(exercise.startTime);
        return exerciseDate >= this.syncStartDate;
      });

      const exercisesWithDistance =
        SamsungHealthData.filterExercisesWithDistance(exercisesAfterStartDate);

      // Process activity summary distance data - filter by sync start date
      const syncStartDateStr = this.formatDateForAPI(
        this.syncStartDate.toISOString(),
      );
      const activityAfterStartDate = allActivitySummaryDistance.filter(
        activity => {
          const activityDateStr = this.formatDateForAPI(activity.date);
          // Compare date strings (YYYY-MM-DD format)
          return activityDateStr >= syncStartDateStr;
        },
      );

      console.log(
        '[SamsungHealthSync] Activity summary after start date filter:',
        {
          totalActivity: allActivitySummaryDistance.length,
          afterStartDate: activityAfterStartDate.length,
          syncStartDate: this.syncStartDate.toISOString(),
        },
      );

      // Filter out activity dates that have already been synced
      const unSyncedActivity = activityAfterStartDate.filter(activity => {
        const date = this.formatDateForAPI(activity.date);
        return !this.syncedStepsDates.has(date);
      });

      console.log('[SamsungHealthSync] Unsynced activity summary:', {
        unSyncedCount: unSyncedActivity.length,
        syncedDatesCount: this.syncedStepsDates.size,
      });

      // Prepare exercise payloads
      let exercisePayloads: SyncExercisePayload[] = [];
      let unSyncedExercises: MappedExerciseData[] = [];
      let exercisesToAggregate: MappedExerciseData[] = [];

      if (exercisesWithDistance.length > 0) {
        unSyncedExercises = this.filterUnSyncedExercises(exercisesWithDistance);

        if (unSyncedExercises.length > 0) {
          const affectedDateModalities =
            this.getDateModalityCombinations(unSyncedExercises);
          exercisesToAggregate = this.filterExercisesByDateModality(
            exercisesWithDistance,
            affectedDateModalities,
          );
          exercisePayloads = SamsungHealthData.prepareSyncPayload(
            exercisesToAggregate,
            this.config.eventId,
          );
        }
      }

      // Prepare daily steps payloads using Activity Summary Distance - Exercise Distance
      // IMPORTANT: For each date in unSyncedActivity, we need to subtract ALL exercises for that date
      // (from start date), not just the ones being synced in this sync operation.
      // This ensures: Daily Steps = Activity Summary - All Exercises (each exercise subtracted only once)
      // Since unSyncedActivity only contains dates that haven't been synced yet, we can safely
      // use all exercises from start date for those dates.
      let dailyStepsPayloads: SyncExercisePayload[] = [];
      if (unSyncedActivity.length > 0) {
        try {
          // For dates that haven't been synced yet, use ALL exercises from start date
          // This ensures we calculate: Activity Summary - All Exercises (each exercise only once)
          // We use exercisesAfterStartDate (all exercises) because:
          // 1. These dates haven't been synced yet (in unSyncedActivity)
          // 2. We need to subtract ALL exercises for these dates, not just new ones
          // 3. Once a date is synced, it won't be in unSyncedActivity anymore, so won't be recalculated
          console.log(
            '[SamsungHealthSync] Preparing daily steps for unsynced dates:',
            {
              unsyncedDatesCount: unSyncedActivity.length,
              allExercisesCount: exercisesAfterStartDate.length,
              unsyncedExercisesCount: unSyncedExercises.length,
            },
          );

          dailyStepsPayloads = SamsungHealthData.prepareDailyStepsPayload(
            unSyncedActivity,
            exercisesAfterStartDate, // Use ALL exercises from start date for unsynced dates
            this.config.eventId,
          );
          console.log('[SamsungHealthSync] Prepared daily steps payloads:', {
            count: dailyStepsPayloads.length,
            payloads: dailyStepsPayloads.map(p => ({
              date: p.date,
              points: p.points.length,
              modalities: p.points.map(pt => pt.modality),
            })),
          });
        } catch (error: any) {
          console.error(
            '[SamsungHealthSync] Error preparing daily steps payloads:',
            error,
          );
          throw error;
        }
      }

      // IMPORTANT: Send daily_steps separately to avoid backend processing issues
      // The backend may be overwriting daily_steps when it's merged with exercise modalities
      // Strategy: Send exercises first, then send daily_steps in a separate call for the same date
      const datesWithBoth = new Set<string>();
      exercisePayloads.forEach(p => datesWithBoth.add(p.date));
      dailyStepsPayloads.forEach(p => {
        if (datesWithBoth.has(p.date)) {
          datesWithBoth.add(p.date);
        }
      });

      // Separate daily_steps payloads that need to be sent separately
      const dailyStepsToSendSeparately = dailyStepsPayloads.filter(p =>
        datesWithBoth.has(p.date),
      );
      const dailyStepsToMerge = dailyStepsPayloads.filter(
        p => !datesWithBoth.has(p.date),
      );

      // Merge only daily_steps that don't have exercises for the same date
      const mergedPayloads = this.mergePayloadsByDate(
        exercisePayloads,
        dailyStepsToMerge,
      );

      console.log('[SamsungHealthSync] Payload separation:', {
        exercisePayloads: exercisePayloads.length,
        dailyStepsPayloads: dailyStepsPayloads.length,
        dailyStepsToSendSeparately: dailyStepsToSendSeparately.length,
        dailyStepsToMerge: dailyStepsToMerge.length,
        mergedPayloads: mergedPayloads.length,
        datesWithBoth: Array.from(datesWithBoth),
      });

      // Check if there's today's total distance to sync (before early return)
      // This ensures we sync today's distance even when there's no historical data
      const todayDate = new Date();
      const todayDateStr = this.formatDateForAPI(todayDate.toISOString());
      const todayActivityDistance = allActivitySummaryDistance.filter(
        activity => {
          const activityDateStr = this.formatDateForAPI(activity.date);
          return activityDateStr === todayDateStr;
        },
      );
      const todayExercises = exercisesAfterStartDate.filter(exercise => {
        const exerciseDateStr = this.formatDateForAPI(exercise.startTime);
        return exerciseDateStr === todayDateStr;
      });
      const hasTodayDistanceToSync = todayActivityDistance.length > 0;

      // If there's nothing to sync (including today's distance), return early
      if (
        mergedPayloads.length === 0 &&
        unSyncedExercises.length === 0 &&
        unSyncedActivity.length === 0 &&
        !hasTodayDistanceToSync
      ) {
        console.log('[SamsungHealthSync] No data to sync');
        if (this.isInitialSync && this.config.onSyncComplete) {
          this.config.onSyncComplete(true, 'No new data to sync');
        }
        return;
      }

      // Send all payloads to API - one day at a time (sequentially)
      // This ensures each day is stored separately in the database
      if (mergedPayloads.length > 0) {
        console.log(
          '[SamsungHealthSync] Sending payloads to API (day by day):',
          mergedPayloads.length,
        );

        // Sort payloads by date to ensure chronological order
        const sortedPayloads = [...mergedPayloads].sort((a, b) => {
          return a.date.localeCompare(b.date);
        });

        try {
          // Send each day sequentially (one at a time)
          for (let index = 0; index < sortedPayloads.length; index++) {
            const payload = sortedPayloads[index];

            // Log detailed payload information before sending
            const dailyStepsPoint = payload.points.find(
              p => p.modality === 'daily_steps',
            );
            console.log(
              `[SamsungHealthSync] Sending day ${index + 1}/${sortedPayloads.length
              } (${payload.date}):`,
              {
                date: payload.date,
                points: payload.points.length,
                modalities: payload.points.map(p => p.modality),
                transaction_id: payload.transaction_id,
                dailyStepsPoint: dailyStepsPoint
                  ? {
                    modality: dailyStepsPoint.modality,
                    data_source_id: dailyStepsPoint.data_source_id,
                    amount: dailyStepsPoint.amount,
                    amountType: typeof dailyStepsPoint.amount,
                    amountValue: dailyStepsPoint.amount,
                  }
                  : 'NOT FOUND',
                allPoints: payload.points.map(p => ({
                  modality: p.modality,
                  data_source_id: p.data_source_id,
                  amount: p.amount,
                  amountType: typeof p.amount,
                })),
                fullPayload: JSON.stringify(payload, null, 2),
              },
            );

            try {
              // Final verification of payload before sending to API
              const dailyStepsPointBeforeSend = payload.points.find(
                p => p.modality === 'daily_steps',
              );
              console.log(
                `[SamsungHealthSync] FINAL PAYLOAD VERIFICATION for ${payload.date} before API call:`,
                {
                  date: payload.date,
                  event_id: payload.event_id,
                  transaction_id: payload.transaction_id,
                  pointsCount: payload.points.length,
                  dailyStepsPoint: dailyStepsPointBeforeSend
                    ? {
                      modality: dailyStepsPointBeforeSend.modality,
                      data_source_id:
                        dailyStepsPointBeforeSend.data_source_id,
                      amount: dailyStepsPointBeforeSend.amount,
                      amountType: typeof dailyStepsPointBeforeSend.amount,
                      amountParsed: parseFloat(
                        dailyStepsPointBeforeSend.amount,
                      ),
                      amountStringified: JSON.stringify(
                        dailyStepsPointBeforeSend.amount,
                      ),
                    }
                    : 'NOT FOUND IN PAYLOAD',
                  allPoints: payload.points.map(p => ({
                    modality: p.modality,
                    data_source_id: p.data_source_id,
                    amount: p.amount,
                    amountType: typeof p.amount,
                    amountParsed: parseFloat(p.amount),
                  })),
                  fullPayloadJSON: JSON.stringify(payload),
                },
              );

              const result = await this.syncApiFunction!(payload);
              console.log(
                `[SamsungHealthSync] Day ${payload.date} stored successfully:`,
                result,
              );

              // Verify what was returned from API
              console.log(
                `[SamsungHealthSync] API Response for ${payload.date}:`,
                {
                  result: result,
                  resultType: typeof result,
                  resultStringified: JSON.stringify(result),
                },
              );

              // Mark this date as synced immediately after successful API call
              // This ensures we don't re-sync if the process is interrupted
              // Only mark if this payload contains steps data
              const hasStepsData = payload.points.some(
                p => p.modality === 'daily_steps',
              );
              if (hasStepsData) {
                this.syncedStepsDates.add(payload.date);
                // Save immediately to persist the sync state
                await this.saveSyncedStepsDates();
                console.log(
                  `[SamsungHealthSync] Marked ${payload.date} as synced for steps`,
                );
              }
            } catch (apiError: any) {
              console.error(
                `[SamsungHealthSync] Error storing day ${payload.date}:`,
                apiError,
              );
              // Continue with next day even if one fails
              // This ensures other days can still be synced
              throw apiError;
            }
          }

          console.log('[SamsungHealthSync] All days stored successfully');
        } catch (apiError: any) {
          console.error(
            '[SamsungHealthSync] Error sending payloads to API:',
            apiError,
          );
          throw apiError;
        }
      }

      // Send daily_steps separately for dates that also have exercises
      // This ensures daily_steps is not overwritten by backend processing
      if (dailyStepsToSendSeparately.length > 0) {
        console.log(
          '[SamsungHealthSync] Sending daily_steps separately to avoid merge issues:',
          dailyStepsToSendSeparately.length,
        );

        // Sort by date
        const sortedDailySteps = [...dailyStepsToSendSeparately].sort(
          (a, b) => {
            return a.date.localeCompare(b.date);
          },
        );

        try {
          for (let index = 0; index < sortedDailySteps.length; index++) {
            const payload = sortedDailySteps[index];

            console.log(
              `[SamsungHealthSync] Sending daily_steps separately for ${payload.date
              } (${index + 1}/${sortedDailySteps.length}):`,
              {
                date: payload.date,
                points: payload.points.map(p => ({
                  modality: p.modality,
                  data_source_id: p.data_source_id,
                  amount: p.amount,
                  amountType: typeof p.amount,
                })),
                fullPayload: JSON.stringify(payload, null, 2),
              },
            );

            try {
              const result = await this.syncApiFunction!(payload);
              console.log(
                `[SamsungHealthSync] Daily steps for ${payload.date} stored successfully:`,
                result,
              );

              // Mark as synced
              this.syncedStepsDates.add(payload.date);
              await this.saveSyncedStepsDates();
              console.log(
                `[SamsungHealthSync] Marked ${payload.date} as synced for steps (separate call)`,
              );
            } catch (apiError: any) {
              console.error(
                `[SamsungHealthSync] Error storing daily_steps separately for ${payload.date}:`,
                apiError,
              );
              throw apiError;
            }
          }

          console.log(
            '[SamsungHealthSync] All separate daily_steps stored successfully',
          );
        } catch (apiError: any) {
          console.error(
            '[SamsungHealthSync] Error sending separate daily_steps payloads:',
            apiError,
          );
          throw apiError;
        }
      }

      // Mark exercises as synced
      if (unSyncedExercises.length > 0) {
        await this.markExercisesAsSynced(unSyncedExercises);
      }

      // Mark steps dates as synced (backup - most dates already marked during API calls)
      // This ensures any dates that weren't marked during the loop are still marked
      if (unSyncedActivity.length > 0) {
        // Only mark dates that were actually sent in the payloads
        // (they may have been merged with exercise data)
        const sentDates = new Set(
          mergedPayloads
            .filter(p => p.points.some(pt => pt.modality === 'daily_steps'))
            .map(p => p.date),
        );

        // Mark all dates that were sent
        sentDates.forEach(date => {
          this.syncedStepsDates.add(date);
        });

        if (sentDates.size > 0) {
          await this.saveSyncedStepsDates();
          console.log(
            '[SamsungHealthSync] Marked steps dates as synced:',
            Array.from(sentDates),
          );
        }
      }

      // Sync today's total distance as daily_steps (Activity Summary - Exercise Distance)
      // This ensures today's daily_steps is updated regularly throughout the day
      // Calculate: Today's Activity Summary - Today's Exercise Distance = Today's daily_steps
      // IMPORTANT: This runs even when there's no historical data to sync
      let todayDistanceSynced = false;
      try {
        console.log(
          "[SamsungHealthSync] Preparing today's total distance sync (as daily_steps):",
          {
            todayDate: todayDateStr,
            todayActivityCount: todayActivityDistance.length,
            todayExercisesCount: todayExercises.length,
          },
        );

        if (todayActivityDistance.length > 0) {
          // Prepare daily_steps payload for today (Activity Summary - Exercise Distance)
          // This will calculate and store the remainder as daily_steps modality
          const todayDailyStepsPayloads =
            SamsungHealthData.prepareDailyStepsPayload(
              todayActivityDistance,
              todayExercises,
              this.config.eventId,
            );

          if (todayDailyStepsPayloads.length > 0) {
            console.log(
              "[SamsungHealthSync] Sending today's total distance as daily_steps payload:",
              {
                count: todayDailyStepsPayloads.length,
                payloads: todayDailyStepsPayloads.map(p => ({
                  date: p.date,
                  amount: p.points[0]?.amount,
                  modality: p.points[0]?.modality,
                })),
              },
            );

            // Send each daily_steps payload for today
            for (const payload of todayDailyStepsPayloads) {
              try {
                const result = await this.syncApiFunction!(payload);
                console.log(
                  `[SamsungHealthSync] Today's total distance as daily_steps (${payload.date}) stored successfully:`,
                  result,
                );
                todayDistanceSynced = true;

                // Note: We don't mark today in syncedStepsDates since we want to sync today every time
                // This ensures today's daily_steps is always up-to-date throughout the day
              } catch (apiError: any) {
                console.error(
                  `[SamsungHealthSync] Error storing today's total distance as daily_steps (${payload.date}):`,
                  apiError,
                );
                // Continue even if today's distance fails - don't throw
              }
            }
          } else {
            console.log(
              '[SamsungHealthSync] No daily_steps payload to send for today',
            );
          }
        } else {
          console.log(
            '[SamsungHealthSync] No activity summary distance data for today',
          );
        }
      } catch (distanceError: any) {
        console.error(
          "[SamsungHealthSync] Error syncing today's total distance as daily_steps:",
          distanceError,
        );
        // Don't throw - allow other sync operations to complete
      }

      // Update last sync date if any sync occurred (exercises, steps, or today's distance)
      // This ensures last sync date is updated even when only today's distance is synced
      const hasAnySyncOccurred =
        mergedPayloads.length > 0 ||
        dailyStepsToSendSeparately.length > 0 ||
        unSyncedExercises.length > 0 ||
        todayDistanceSynced;

      if (hasAnySyncOccurred) {
        await AsyncStorage.setItem(
          LAST_SYNC_DATE_KEY,
          new Date().toISOString(),
        );
        console.log('[SamsungHealthSync] Last sync date updated');
      }

      // Only call callback for initial sync
      if (this.isInitialSync && this.config.onSyncComplete) {
        const exerciseCount = unSyncedExercises.length;
        const activityCount = unSyncedActivity.length;
        const totalDates = mergedPayloads.length;
        let message = '';

        if (exerciseCount > 0 && activityCount > 0) {
          message = `Successfully synced ${exerciseCount} exercise(s) and ${activityCount} day(s) of activity across ${totalDates} date(s)`;
        } else if (exerciseCount > 0) {
          message = `Successfully synced ${exerciseCount} exercise(s) across ${totalDates} date(s)`;
        } else if (activityCount > 0) {
          message = `Successfully synced ${activityCount} day(s) of activity across ${totalDates} date(s)`;
        } else {
          message = 'No new data to sync';
        }

        this.config.onSyncComplete(true, message);
      }
    } catch (error: any) {
      console.error('[SamsungHealthSync] Sync error:', {
        message: error?.message,
        stack: error?.stack,
        error: error,
      });
      // Only call callback for initial sync
      if (this.isInitialSync && this.config?.onSyncComplete) {
        this.config.onSyncComplete(
          false,
          error?.message || 'Failed to sync Samsung Health data',
        );
      }
    } finally {
      this.isSyncing = false;
      console.log('[SamsungHealthSync] Sync completed, isSyncing set to false');
    }
  }

  /**
   * Merge exercise and steps payloads by date
   * If both have data for the same date, combine their points arrays
   */
  private mergePayloadsByDate(
    exercisePayloads: SyncExercisePayload[],
    stepsPayloads: SyncExercisePayload[],
  ): SyncExercisePayload[] {
    const mergedMap = new Map<string, SyncExercisePayload>();

    // Add exercise payloads
    exercisePayloads.forEach(payload => {
      mergedMap.set(payload.date, { ...payload });
      console.log(
        `[SamsungHealthSync] Added exercise payload for ${payload.date}:`,
        {
          points: payload.points.map(p => ({
            modality: p.modality,
            amount: p.amount,
          })),
        },
      );
    });

    // Merge steps payloads
    stepsPayloads.forEach(stepsPayload => {
      const existing = mergedMap.get(stepsPayload.date);
      if (existing) {
        // Log before merge
        const dailyStepsPoint = stepsPayload.points.find(
          p => p.modality === 'daily_steps',
        );
        console.log(
          `[SamsungHealthSync] Merging daily_steps payload for ${stepsPayload.date}:`,
          {
            existingPoints: existing.points.map(p => ({
              modality: p.modality,
              amount: p.amount,
            })),
            stepsPoints: stepsPayload.points.map(p => ({
              modality: p.modality,
              amount: p.amount,
            })),
            dailyStepsPoint: dailyStepsPoint
              ? {
                modality: dailyStepsPoint.modality,
                amount: dailyStepsPoint.amount,
                amountType: typeof dailyStepsPoint.amount,
              }
              : 'NOT FOUND',
          },
        );

        // Combine points arrays
        existing.points = [...existing.points, ...stepsPayload.points];

        // Log after merge
        const mergedDailyStepsPoint = existing.points.find(
          p => p.modality === 'daily_steps',
        );
        console.log(
          `[SamsungHealthSync] After merge for ${stepsPayload.date}:`,
          {
            mergedPoints: existing.points.map(p => ({
              modality: p.modality,
              amount: p.amount,
              amountType: typeof p.amount,
            })),
            mergedDailyStepsPoint: mergedDailyStepsPoint
              ? {
                modality: mergedDailyStepsPoint.modality,
                amount: mergedDailyStepsPoint.amount,
                amountType: typeof mergedDailyStepsPoint.amount,
              }
              : 'NOT FOUND',
          },
        );

        // Update transaction ID to include both modalities
        const modalities = existing.points
          .map(p => p.modality)
          .sort()
          .join('_');
        existing.transaction_id = `samsung_${stepsPayload.date}_${modalities}`;
      } else {
        // Add new payload
        const dailyStepsPoint = stepsPayload.points.find(
          p => p.modality === 'daily_steps',
        );
        console.log(
          `[SamsungHealthSync] Adding new daily_steps payload for ${stepsPayload.date}:`,
          {
            points: stepsPayload.points.map(p => ({
              modality: p.modality,
              amount: p.amount,
              amountType: typeof p.amount,
            })),
            dailyStepsPoint: dailyStepsPoint
              ? {
                modality: dailyStepsPoint.modality,
                amount: dailyStepsPoint.amount,
                amountType: typeof dailyStepsPoint.amount,
              }
              : 'NOT FOUND',
          },
        );
        mergedMap.set(stepsPayload.date, { ...stepsPayload });
      }
    });

    const merged = Array.from(mergedMap.values());
    console.log('[SamsungHealthSync] Final merged payloads:', {
      count: merged.length,
      payloads: merged.map(p => ({
        date: p.date,
        points: p.points.map(pt => ({
          modality: pt.modality,
          amount: pt.amount,
          amountType: typeof pt.amount,
        })),
      })),
    });

    return merged;
  }

  /**
   * Mark steps dates as synced
   * @deprecated This method is not used. Steps dates are marked as synced in performSync.
   */
  // private async markStepsDatesAsSynced(steps: StepsData[]): Promise<void> {
  //   steps.forEach(step => {
  //     const date = this.formatDateForAPI(step.date);
  //     this.syncedStepsDates.add(date);
  //   });
  //   await this.saveSyncedStepsDates();
  // }

  /**
   * Manually trigger sync (for user-initiated refresh)
   */
  async manualSync(): Promise<void> {
    await this.performSync();
  }

  /**
   * Fetch last sync date from API
   */
  private async fetchLastSyncDate(): Promise<LastSyncDateResponse | null> {
    try {
      const state = store.getState();
      const baseUrl = state?.baseUrlReducer?.BaseUrl;
      const token = state?.loginReducer?.token;

      if (!baseUrl || !token) {
        console.error(
          '[SamsungHealthSync] Cannot fetch last sync date - no baseUrl or token',
        );
        return null;
      }

      const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
      const apiUrl = `${normalizedBaseUrl}samsung-health/last-sync-date`;

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result: LastSyncDateResponse = await response.json();
        console.log('[SamsungHealthSync] Fetched last sync date:', result);
        return result;
      } else {
        const errorText = await response.text();
        console.error('[SamsungHealthSync] Failed to fetch last sync date:', {
          status: response.status,
          body: errorText,
        });
        return null;
      }
    } catch (error: any) {
      console.error(
        '[SamsungHealthSync] Error fetching last sync date:',
        error,
      );
      return null;
    }
  }

  /**
   * Generate array of dates between start and end (inclusive)
   */
  private getDateRange(startDate: string, endDate: string): string[] {
    const dates: string[] = [];
    const current = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T00:00:00');

    while (current <= end) {
      dates.push(this.formatDateString(current));
      current.setDate(current.getDate() + 1);
    }

    return dates;
  }

  /**
   * Sync data for a single date
   * @param targetDate - The date to sync (YYYY-MM-DD format)
   * @param updatePoints - If true, also update points data via user/points API
   */
  private async syncDataForDate(
    targetDate: string,
    updatePoints: boolean = false,
  ): Promise<boolean> {
    console.log('[SamsungHealthSync] Syncing data for date:', targetDate, {
      updatePoints,
    });

    try {
      // Calculate date range for the target day
      const targetDay = new Date(targetDate + 'T00:00:00');
      const nextDay = new Date(targetDay);
      nextDay.setDate(nextDay.getDate() + 1);

      const startDateStr = `${targetDate}T00:00:00`;
      const endDateStr = `${this.formatDateString(nextDay)}T00:00:00`;

      // Check if EXERCISE is in allowed data types
      const isExerciseAllowed = this.allowedDataTypes
        .map(t => t.toUpperCase())
        .includes('EXERCISE');

      // Fetch all data types for the target day
      let stepsData: StepsData[] = [];
      let activitySummaryData: ActivitySummaryDistanceData[] = [];
      let exerciseData: ExerciseData[] = [];

      try {
        // Always fetch steps and activity summary
        const fetchPromises: Promise<any>[] = [
          SamsungHealth.getStepsData(startDateStr, endDateStr),
          SamsungHealth.getActivitySummaryDistance(startDateStr, endDateStr),
        ];

        if (isExerciseAllowed) {
          fetchPromises.push(
            SamsungHealth.getExerciseData(startDateStr, endDateStr),
          );
        }

        const results = await Promise.all(fetchPromises);
        stepsData = results[0] || [];
        activitySummaryData = results[1] || [];
        if (isExerciseAllowed && results.length > 2) {
          exerciseData = results[2] || [];
        }
      } catch (fetchError: any) {
        console.error(
          `[SamsungHealthSync] Error fetching data for ${targetDate}:`,
          fetchError,
        );
        // If exercise fetch fails, try without it
        if (fetchError?.message?.includes('not allowed to read for exercise')) {
          try {
            const fallbackResults = await Promise.all([
              SamsungHealth.getStepsData(startDateStr, endDateStr),
              SamsungHealth.getActivitySummaryDistance(
                startDateStr,
                endDateStr,
              ),
            ]);
            stepsData = fallbackResults[0] || [];
            activitySummaryData = fallbackResults[1] || [];
          } catch (fallbackError) {
            console.error(
              `[SamsungHealthSync] Fallback fetch also failed for ${targetDate}:`,
              fallbackError,
            );
            return false;
          }
        } else {
          return false;
        }
      }

      console.log(`[SamsungHealthSync] Fetched data for ${targetDate}:`, {
        steps: stepsData.length,
        activitySummary: activitySummaryData.length,
        exercises: exerciseData.length,
      });

      // Map exercises with modality
      const mappedExercises = exerciseData.map(exercise => ({
        ...exercise,
        modality: SamsungHealthData.mapExerciseTypeToModality(
          exercise.exerciseType,
        ),
      }));

      // Calculate summary values
      const totalSteps = stepsData.reduce((sum, s) => sum + s.count, 0);
      const totalDistanceKm = activitySummaryData.reduce(
        (sum, a) => sum + a.distanceKilometers,
        0,
      );
      const totalDistanceMiles = totalDistanceKm * 0.621371192;
      const totalExerciseDistanceMeters = exerciseData.reduce(
        (sum, e) => sum + e.distance,
        0,
      );
      const totalExerciseDistanceMiles =
        totalExerciseDistanceMeters * 0.000621371192;
      const dailyStepsDistanceKm = Math.max(
        0,
        totalDistanceKm - totalExerciseDistanceMeters / 1000,
      );
      const dailyStepsDistanceMiles = dailyStepsDistanceKm * 0.621371192;
      const totalCalories = exerciseData.reduce(
        (sum, e) => sum + e.calories,
        0,
      );
      const totalDurationSeconds = exerciseData.reduce(
        (sum, e) => sum + e.duration,
        0,
      );

      // Build comprehensive payload
      const payload: DailyDataSyncPayload = {
        date: targetDate,
        sync_timestamp: new Date().toISOString(),
        data: {
          steps: stepsData.map(s => ({
            count: s.count,
            start_time: s.startTime,
            end_time: s.endTime,
            date: s.date,
          })),
          activity_summary: activitySummaryData.map(a => ({
            start_time: a.startTime,
            end_time: a.endTime,
            date: a.date,
            distance_meters: a.distanceMeters,
            distance_kilometers: a.distanceKilometers,
          })),
          exercises: mappedExercises.map(e => ({
            exercise_type: e.exerciseType.replace(
              'PredefinedExerciseType.',
              '',
            ),
            modality: e.modality,
            start_time: e.startTime,
            end_time: e.endTime,
            duration_seconds: e.duration,
            calories: e.calories,
            distance_meters: e.distance,
            distance_miles: parseFloat(
              (e.distance * 0.000621371192).toFixed(6),
            ),
          })),
        },
        raw_data: {
          steps: stepsData,
          activity_summary: activitySummaryData,
          exercises: exerciseData,
        },
        summary: {
          total_steps: totalSteps,
          total_distance_kilometers: parseFloat(totalDistanceKm.toFixed(6)),
          total_distance_miles: parseFloat(totalDistanceMiles.toFixed(6)),
          total_exercise_distance_meters: parseFloat(
            totalExerciseDistanceMeters.toFixed(6),
          ),
          total_exercise_distance_miles: parseFloat(
            totalExerciseDistanceMiles.toFixed(6),
          ),
          daily_steps_distance_miles: parseFloat(
            dailyStepsDistanceMiles.toFixed(6),
          ),
          total_calories_burned: totalCalories,
          total_exercise_duration_seconds: totalDurationSeconds,
          exercise_count: exerciseData.length,
        },
      };

      console.log(`[SamsungHealthSync] Payload prepared for ${targetDate}:`, {
        stepsCount: payload.data.steps.length,
        activitySummaryCount: payload.data.activity_summary.length,
        exercisesCount: payload.data.exercises.length,
        summary: payload.summary,
      });

      // Post to samsung-health/daily-data-sync API (logs)
      // const result = await this.dailyDataSyncApiFunction!(payload);
      // console.log(
      //   `[SamsungHealthSync] Data synced successfully for ${targetDate}:`,
      //   result,
      // );

      let result;
      let isSuccess = true;
      try {
        result = await this.retryApiCall(
          () => this.dailyDataSyncApiFunction!(payload),
          1, // 1 retry
        );

        console.log(
          `[SamsungHealthSync] Data synced successfully for ${targetDate}:`,
          result,
        );
      } catch (error) {
        isSuccess = false;
        console.error(
          `[SamsungHealthSync] API failed after retry for ${targetDate}, sending fallback data`,
        );

        // 🔥 fallback payload (0 data)
        const fallbackPayload: DailyDataSyncPayload = {
          ...payload,
          data: {
            steps: [],
            activity_summary: [],
            exercises: [],
          },
          raw_data: {
            steps: [],
            activity_summary: [],
            exercises: [],
          },
          summary: {
            total_steps: 0,
            total_distance_kilometers: 0,
            total_distance_miles: 0,
            total_exercise_distance_meters: 0,
            total_exercise_distance_miles: 0,
            daily_steps_distance_miles: 0,
            total_calories_burned: 0,
            total_exercise_duration_seconds: 0,
            exercise_count: 0,
          },
        };

        try {
          await this.dailyDataSyncApiFunction!(fallbackPayload);
          console.log(
            `[SamsungHealthSync] Fallback (0 data) sent for ${targetDate}`,
          );
        } catch (fallbackError) {
          console.error(
            `[SamsungHealthSync] Fallback also failed for ${targetDate}`,
            fallbackError,
          );
        }
      }

      // If updatePoints flag is true, also update points data via user/points API
      if (updatePoints && this.syncApiFunction && this.config) {
        console.log(
          `[SamsungHealthSync] Updating points data for ${targetDate}...`,
        );

        try {
          // Prepare exercise payloads for points API
          const exercisesWithDistance =
            SamsungHealthData.filterExercisesWithDistance(mappedExercises);
          let exercisePayloads: SyncExercisePayload[] = [];
          if (exercisesWithDistance.length > 0) {
            exercisePayloads = SamsungHealthData.prepareSyncPayload(
              exercisesWithDistance,
              this.config.eventId,
            );
          }

          // Prepare daily steps payload (Activity Summary - Exercises)
          let dailyStepsPayloads: SyncExercisePayload[] = [];
          if (activitySummaryData.length > 0) {
            dailyStepsPayloads = SamsungHealthData.prepareDailyStepsPayload(
              activitySummaryData,
              mappedExercises,
              this.config.eventId,
            );
          }

          // Merge payloads by date
          const mergedPayloads = this.mergePayloadsByDate(
            exercisePayloads,
            dailyStepsPayloads,
          );

          console.log(
            `[SamsungHealthSync] Points payloads prepared for ${targetDate}:`,
            {
              exercisePayloads: exercisePayloads.length,
              dailyStepsPayloads: dailyStepsPayloads.length,
              mergedPayloads: mergedPayloads.length,
            },
          );

          // Send points payloads to user/points API
          for (const pointsPayload of mergedPayloads) {
            try {
              const pointsResult = await this.retryApiCall(
                () => this.syncApiFunction!(pointsPayload),
                1,
              );

              console.log(
                `[SamsungHealthSync] Points updated successfully for ${pointsPayload.date}`,
              );
            } catch (error) {
              isSuccess = false;
              console.error(
                `[SamsungHealthSync] Points API failed after retry for ${pointsPayload.date}`,
              );
            }
          }
        } catch (pointsError: any) {
          console.error(
            `[SamsungHealthSync] Error preparing points payloads for ${targetDate}:`,
            pointsError,
          );
          // Don't fail the entire sync if points update fails
        }
      }

      return true;
    } catch (error: any) {
      console.error(
        `[SamsungHealthSync] Error syncing data for ${targetDate}:`,
        error,
      );
      return false;
    }
  }


  private async retryApiCall<T>(
    apiFn: () => Promise<T>,
    retries: number = 1,
    delay: number = 1000,
  ): Promise<T> {
    try {
      return await apiFn();
    } catch (error: any) {
      const status = error?.status || error?.response?.status;

      // 🔥 Special handling for 429
      if (status === 429) {
        console.log('[SamsungHealthSync] Rate limited (429), taking 1s break and retrying...');
        await new Promise(res => setTimeout(res, 1500));
        // Retry without decrementing counter so we wait it out instead of failing
        return await this.retryApiCall(apiFn, retries, delay);
      }

      if (retries > 0) {
        console.log('[SamsungHealthSync] Retry API call...');
        await new Promise(res => setTimeout(res, delay));
        return await this.retryApiCall(apiFn, retries - 1, delay * 2);
      }

      throw error;
    }
  }
  /**
   * Perform initial day-by-day sync from syncStartDate to today.
   * Uses getSamsungHealthLastCron to resume from the last processed date if interrupted.
   * Called once during initialize() after the initial exercise/steps sync.
   */
  async performInitialDailySync(): Promise<void> {
    if (!this.dailyDataSyncApiFunction) {
      return;
    }

    const todayDate = this.formatDateString(new Date());
    const syncStartDateStr = this.formatDateString(this.syncStartDate);

    const startDate = syncStartDateStr;

    if (startDate > todayDate) {
      console.log(
        '[SamsungHealthSync] Initial daily sync: all dates already processed',
      );
      return;
    }

    const datesToSync = this.getDateRange(startDate, todayDate);
    console.log(
      `[SamsungHealthSync] Initial daily sync: ${datesToSync.length} day(s) from ${startDate} to ${todayDate}`,
    );

    try {
      await SamsungHealth.initialize();
    } catch (error: any) {
      console.error(
        '[SamsungHealthSync] Initial daily sync - Samsung Health init failed:',
        error,
      );
      return;
    }

    let successCount = 0;
    let failCount = 0;

    for (const date of datesToSync) {
      const success = await this.syncDataForDate(date, true);
      if (success) {
        successCount++;
      } else {
        failCount++;
      }
      // Add a short delay to avoid hammering the server with rapid requests
      await new Promise(res => setTimeout(res, 250));
    }

    console.log('[SamsungHealthSync] Initial daily sync completed:', {
      totalDates: datesToSync.length,
      successful: successCount,
      failed: failCount,
    });
  }

  /**
   * Perform daily data sync - collects Samsung Health data based on last sync date from API
   * If resync_data is true and last_sync_date is more than 1 day ago, syncs from last_sync_date to yesterday
   * Otherwise, only syncs yesterday's data
   */
  async performDailyDataSync(): Promise<void> {
    if (!this.dailyDataSyncApiFunction) {
      console.log(
        '[SamsungHealthSync] Daily data sync skipped - no API function configured',
      );
      return;
    }

    const previousDayDate = this.getPreviousDayDate();
    console.log(
      '[SamsungHealthSync] Starting daily data sync. Previous day:',
      previousDayDate,
    );

    try {
      // Initialize Samsung Health
      await SamsungHealth.initialize();

      // Fetch last sync date from API
      const lastSyncResponse = await this.fetchLastSyncDate();

      let datesToSync: string[] = [];
      let updatePointsDuringResync = false;

      if (lastSyncResponse?.success && lastSyncResponse.data) {
        const { last_sync_date, resync_data, update_points_during_resync } =
          lastSyncResponse.data;
        updatePointsDuringResync = update_points_during_resync === true;

        console.log('[SamsungHealthSync] Last sync date from API:', {
          last_sync_date,
          resync_data,
          update_points_during_resync: updatePointsDuringResync,
          previousDayDate,
        });

        // Check if last_sync_date is before yesterday
        const lastSyncDateObj = new Date(last_sync_date + 'T00:00:00');
        const previousDayDateObj = new Date(previousDayDate + 'T00:00:00');

        if (lastSyncDateObj < previousDayDateObj && resync_data) {
          // Resync from last_sync_date to yesterday (inclusive)
          datesToSync = this.getDateRange(last_sync_date, previousDayDate);
          console.log(
            '[SamsungHealthSync] Resyncing data from',
            last_sync_date,
            'to',
            previousDayDate,
          );
          console.log(
            '[SamsungHealthSync] Total dates to sync:',
            datesToSync.length,
          );
          console.log(
            '[SamsungHealthSync] Update points during resync:',
            updatePointsDuringResync,
          );
        } else {
          // Only sync yesterday
          datesToSync = [previousDayDate];
          console.log(
            '[SamsungHealthSync] Only syncing previous day:',
            previousDayDate,
          );
        }
      } else {
        // API call failed, fallback to just syncing yesterday
        console.log(
          '[SamsungHealthSync] Could not fetch last sync date, syncing only previous day',
        );
        datesToSync = [previousDayDate];
      }

      // Sync data for each date
      // If update_points_during_resync is true, also update points data for resync dates
      let successCount = 0;
      let failCount = 0;

      for (const date of datesToSync) {
        const success = await this.syncDataForDate(
          date,
          updatePointsDuringResync,
        );
        if (success) {
          successCount++;
          // Update last processed cron date after each successful day sync
          if (this.updateLastCronApiFunction) {
            try {
              await this.updateLastCronApiFunction({
                data_source_id: 7,
                cron_start_date: date,
              });
              console.log(
                `[SamsungHealthSync] Last cron date updated for ${date}`,
              );
            } catch (cronError: any) {
              console.error(
                `[SamsungHealthSync] Failed to update last cron date for ${date}:`,
                cronError,
              );
            }
          }
        } else {
          failCount++;
        }
      }

      console.log('[SamsungHealthSync] Daily data sync completed:', {
        totalDates: datesToSync.length,
        successful: successCount,
        failed: failCount,
        pointsUpdated: updatePointsDuringResync,
      });
    } catch (error: any) {
      console.error('[SamsungHealthSync] Daily data sync error:', error);
    }
  }

  /**
   * Fetch last cron data from the /samsung-health/last-cron GET API.
   * Returns cron_start_date and days_to_process for the foreground job.
   */
  private async fetchLastCronData(): Promise<{
    cron_start_date: string;
    days_to_process: number;
  } | null> {
    if (!this.config) {
      return null;
    }

    try {
      const state = store.getState();
      const baseUrl = state?.baseUrlReducer?.BaseUrl;
      const token = state?.loginReducer?.token;

      if (!baseUrl || !token) {
        console.error(
          '[SamsungHealthSync] Cannot fetch last cron data - no baseUrl or token',
        );
        return null;
      }

      const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
      const params = new URLSearchParams({
        event_id: String(this.config.eventId),
        data_source_id: '7',
      });
      const apiUrl = `${normalizedBaseUrl}samsung-health/last-cron?${params.toString()}`;

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log('[SamsungHealthSync] Fetched last cron data:', result);
        if (result?.success && result?.data) {
          return result.data;
        }
        return null;
      } else {
        const errorText = await response.text();
        console.error('[SamsungHealthSync] Failed to fetch last cron data:', {
          status: response.status,
          body: errorText,
        });
        return null;
      }
    } catch (error: any) {
      console.error(
        '[SamsungHealthSync] Error fetching last cron data:',
        error,
      );
      return null;
    }
  }

  /**
   * Entry point for the foreground cron job.
   * Guards against concurrent runs: if a job is already running, queues the next run
   * and waits for the current one to finish before starting a new cycle.
   */
  private lastForegroundJobRunAt: number = 0;
  private FOREGROUND_JOB_COOLDOWN = 5 * 60 * 1000;

  private async performForegroundJob(): Promise<void> {
    // Wait for initial sync to be fully complete before processing cron data

    if (!this.isInitialized) {
      console.log(
        '[SamsungHealthSync] Foreground job skipped - initial sync not yet complete',
      );
      return;
    }

    if (!this.dailyDataSyncApiFunction || !this.config) {
      return;
    }
    const now = Date.now();
    const timePassed = now - this.lastForegroundJobRunAt;
    const remainingTime = this.FOREGROUND_JOB_COOLDOWN - timePassed;

    if (remainingTime > 0) {
      const remainingSeconds = Math.ceil(remainingTime / 1000);
      const minutes = Math.floor(remainingSeconds / 60);
      const seconds = remainingSeconds % 60;

      console.log(
        `[SamsungHealthSync] Foreground job skipped due to cooldown. Remaining: ${minutes}m ${seconds}s`,
      );

      return;
    }
    if (this.isForegroundJobRunning) {
      // A job is in progress; queue the next cycle instead of starting a duplicate
      console.log(
        '[SamsungHealthSync] Foreground job already running, queuing next run',
      );
      this.foregroundJobQueued = true;
      return;
    }

    this.isForegroundJobRunning = true;
    try {
      await this.runForegroundCronJob();
      this.lastForegroundJobRunAt = Date.now();
    } finally {
      this.isForegroundJobRunning = false;
      // If another foreground event arrived while we were running, start the next cycle
      if (this.foregroundJobQueued) {
        this.foregroundJobQueued = false;
        console.log('[SamsungHealthSync] Running queued foreground job...');
        // Defer slightly so the call stack unwinds cleanly
        //  setTimeout(() => this.performForegroundJob(), 0);
        setTimeout(() => {
          if (!this.isForegroundJobRunning) {
            this.performForegroundJob();
          }
        }, 0);
      }
    }
  }

  /**
   * Core foreground cron job logic:
   * 1. GET /samsung-health/last-cron to retrieve cron_start_date and days_to_process
   * 2. Sync Samsung Health data day-by-day starting from cron_start_date
   * 3. POST /samsung-health/last-cron after each successfully processed day
   */
  private async runForegroundCronJob(): Promise<void> {
    if (!this.config || !this.dailyDataSyncApiFunction) {
      return;
    }

    console.log('[SamsungHealthSync] Foreground job: fetching cron data...');

    const cronData = await this.fetchLastCronData();
    if (!cronData) {
      console.log(
        '[SamsungHealthSync] Foreground job: no cron data available, skipping',
      );
      return;
    }

    const { cron_start_date, days_to_process: rawDaysToProcess } = cronData;
    const days_to_process =
      rawDaysToProcess && rawDaysToProcess > 0 ? rawDaysToProcess : 5;

    if (!cron_start_date) {
      console.log(
        '[SamsungHealthSync] Foreground job: no cron_start_date, skipping',
      );
      return;
    }

    console.log('[SamsungHealthSync] Foreground job: starting processing', {
      cron_start_date,
      days_to_process,
    });

    try {
      await SamsungHealth.initialize();
    } catch (error: any) {
      console.error(
        '[SamsungHealthSync] Foreground job: Samsung Health init failed:',
        error,
      );
      return;
    }

    const yesterdayDate = this.getPreviousDayDate();

    // If cron_start_date has already reached or passed yesterday, all data is up to date — nothing to do.
    // This also prevents re-processing yesterday when the server returns it as the next start date.
    if (cron_start_date >= yesterdayDate) {
      console.log(
        `[SamsungHealthSync] Foreground job: cron_start_date ${cron_start_date} is yesterday or future, data is already up to date`,
      );
      return;
    }

    // Cap days_to_process so the batch never exceeds yesterday (inclusive).
    const maxAllowedDays = this.getDateRange(
      cron_start_date,
      yesterdayDate,
    ).length;
    const effectiveDaysToProcess = Math.min(days_to_process, maxAllowedDays);

    console.log(
      '[SamsungHealthSync] Foreground job: effective days to process',
      {
        requested: days_to_process,
        allowed: effectiveDaysToProcess,
        cron_start_date,
        yesterdayDate,
      },
    );

    console.log('[SamsungHealthSync] Foreground job: completed', {
      startDate: cron_start_date,
      daysProcessed: effectiveDaysToProcess,
    });

    let currentDate = cron_start_date;
    const syncResults: any[] = [];
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < effectiveDaysToProcess; i++) {
      // Hard boundary enforced at every iteration — never process yesterday or beyond.
      if (currentDate > yesterdayDate) {
        break;
      }

      console.log(
        `[SamsungHealthSync] Foreground job: processing day ${i + 1
        }/${effectiveDaysToProcess}: ${currentDate}`,
      );

      const success = await this.syncDataForDate(currentDate, true);

      if (success) {
        successCount++;
        syncResults.push({ date: currentDate, status: 'success' });
        if (this.updateLastCronApiFunction) {
          try {
            await this.updateLastCronApiFunction({
              data_source_id: 7,
              cron_start_date: currentDate,
            });
            console.log(
              `[SamsungHealthSync] Foreground job: cron_start_date updated to ${currentDate}`,
            );
          } catch (cronError: any) {
            console.error(
              `[SamsungHealthSync] Foreground job: failed to update cron_start_date for ${currentDate}:`,
              cronError,
            );
          }
        }
      } else {
        failCount++;
        syncResults.push({ date: currentDate, status: 'failure' });
        console.error(
          `[SamsungHealthSync] Foreground job: failed to sync data for ${currentDate}, stopping batch`,
        );
        break;
      }

      // Advance to the next day
      const nextDay = new Date(currentDate + 'T00:00:00');
      nextDay.setDate(nextDay.getDate() + 1);
      currentDate = this.formatDateString(nextDay);

      // Add a short delay to avoid hammering the server with rapid requests
      await new Promise(res => setTimeout(res, 400));
    }

    const finalReport = {
      type: 'foreground_cron_job_report',
      cron_start_date: cron_start_date,
      days_to_process: days_to_process,
      effective_days: effectiveDaysToProcess,
      results: syncResults,
      summary: {
        total: syncResults.length,
        successful: successCount,
        failed: failCount,
      },
      final_cron_date: currentDate > cron_start_date ? currentDate : cron_start_date,
      timestamp: new Date().toISOString()
    };

    console.log('[SamsungHealthSync] Foreground job completed. Sending report:', finalReport);

    if (this.pushMobileAppUserDataApiFunction) {
      try {
        await this.pushMobileAppUserDataApiFunction(finalReport);
        console.log('[SamsungHealthSync] Foreground job report sent successfully');
      } catch (reportError) {
        console.error('[SamsungHealthSync] Failed to send foreground job report:', reportError);
      }
    }
  }

  /**
   * Format a Date object to YYYY-MM-DD string
   */
  private formatDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Perform end-of-day sync for the previous day
   * This syncs only the previous day's complete data
   */
  async performEndOfDaySync(): Promise<void> {
    if (!this.config || !this.syncApiFunction) {
      console.log(
        '[SamsungHealthSync] EOD sync skipped - service not configured',
      );
      return;
    }

    if (!this.eodSyncEnabled) {
      console.log('[SamsungHealthSync] EOD sync skipped - disabled');
      return;
    }

    const previousDayDate = this.getPreviousDayDate();
    console.log(
      '[SamsungHealthSync] Starting end-of-day sync for:',
      previousDayDate,
    );

    // Perform daily data sync - post all raw data to samsung-health/daily-data-sync
    // This uses the API to determine date range (resync if needed)
    await this.performDailyDataSync();

    try {
      // Check if EXERCISE is in allowed data types
      const isExerciseAllowed = this.allowedDataTypes
        .map(t => t.toUpperCase())
        .includes('EXERCISE');

      console.log('[SamsungHealthSync] EOD sync - Allowed data types:', {
        allowed: this.allowedDataTypes,
        isExerciseAllowed,
      });

      // Fetch previous day's data only (1 day)
      let previousDayExercises: MappedExerciseData[] = [];
      let previousDayActivityDistance: ActivitySummaryDistanceData[] = [];

      try {
        // Always fetch activity summary distance
        const fetchPromises: Promise<any>[] = [
          SamsungHealthData.fetchActivitySummaryDistance(1), // Just yesterday
        ];

        if (isExerciseAllowed) {
          fetchPromises.push(
            SamsungHealthData.fetchExerciseData(1), // Just yesterday
          );
        }

        const results = await Promise.all(fetchPromises);
        previousDayActivityDistance = results[0];
        if (isExerciseAllowed && results.length > 1) {
          previousDayExercises = results[1];
        }

        console.log('[SamsungHealthSync] EOD sync - Fetched data:', {
          exercises: previousDayExercises.length,
          activitySummaryDistance: previousDayActivityDistance.length,
        });
      } catch (fetchError: any) {
        console.error(
          '[SamsungHealthSync] EOD sync - Error fetching data:',
          fetchError,
        );
        return;
      }

      // Filter data to only include the previous day
      const previousDayExercisesFiltered = previousDayExercises.filter(
        exercise => {
          const exerciseDate = this.formatDateForAPI(exercise.startTime);
          return exerciseDate === previousDayDate;
        },
      );

      const previousDayActivityFiltered = previousDayActivityDistance.filter(
        activity => {
          const activityDate = this.formatDateForAPI(activity.date);
          return activityDate === previousDayDate;
        },
      );

      console.log('[SamsungHealthSync] EOD sync - Filtered to previous day:', {
        date: previousDayDate,
        exercises: previousDayExercisesFiltered.length,
        activitySummary: previousDayActivityFiltered.length,
      });

      // If no data for previous day, skip
      if (
        previousDayExercisesFiltered.length === 0 &&
        previousDayActivityFiltered.length === 0
      ) {
        console.log(
          '[SamsungHealthSync] EOD sync - No data for previous day, skipping',
        );
        return;
      }

      // Prepare exercise payloads
      const exercisesWithDistance =
        SamsungHealthData.filterExercisesWithDistance(
          previousDayExercisesFiltered,
        );
      let exercisePayloads: SyncExercisePayload[] = [];
      if (exercisesWithDistance.length > 0) {
        exercisePayloads = SamsungHealthData.prepareSyncPayload(
          exercisesWithDistance,
          this.config.eventId,
        );
      }

      // Prepare daily steps payload (Activity Summary - Exercises)
      let dailyStepsPayloads: SyncExercisePayload[] = [];
      if (previousDayActivityFiltered.length > 0) {
        dailyStepsPayloads = SamsungHealthData.prepareDailyStepsPayload(
          previousDayActivityFiltered,
          previousDayExercisesFiltered,
          this.config.eventId,
        );
      }

      // Merge payloads by date
      const mergedPayloads = this.mergePayloadsByDate(
        exercisePayloads,
        dailyStepsPayloads,
      );

      console.log('[SamsungHealthSync] EOD sync - Prepared payloads:', {
        exercisePayloads: exercisePayloads.length,
        dailyStepsPayloads: dailyStepsPayloads.length,
        mergedPayloads: mergedPayloads.length,
      });

      // Send payloads to API
      if (mergedPayloads.length > 0) {
        for (const payload of mergedPayloads) {
          try {
            console.log(
              `[SamsungHealthSync] EOD sync - Sending payload for ${payload.date}`,
            );
            const result = await this.syncApiFunction!(payload);
            console.log(
              `[SamsungHealthSync] EOD sync - Payload sent successfully for ${payload.date}:`,
              result,
            );
          } catch (apiError: any) {
            console.error(
              `[SamsungHealthSync] EOD sync - Error sending payload for ${payload.date}:`,
              apiError,
            );
          }
        }
      }

      console.log(
        '[SamsungHealthSync] EOD sync completed successfully for:',
        previousDayDate,
      );
    } catch (error: any) {
      console.error('[SamsungHealthSync] EOD sync error:', error);
      // Don't throw - just log the error
    }
  }

  /**
   * Perform hourly reconciliation sync for current and previous day's data
   * This syncs both today's and yesterday's data to ensure accuracy throughout the day
   * Also updates points for both days
   * Reduces data discrepancies by reconciling data hourly instead of only at EOD
   */
  async performHourlyReconciliation(): Promise<void> {
    if (!this.dailyDataSyncApiFunction) {
      console.log(
        '[SamsungHealthSync] Hourly reconciliation skipped - no daily data sync API function configured',
      );
      return;
    }

    if (!this.hourlyReconciliationEnabled) {
      console.log(
        '[SamsungHealthSync] Hourly reconciliation skipped - disabled',
      );
      return;
    }

    const todayDate = this.formatDateString(new Date());
    const previousDayDate = this.getPreviousDayDate();
    console.log('[SamsungHealthSync] Starting hourly reconciliation for:', {
      today: todayDate,
      yesterday: previousDayDate,
    });

    try {
      // Initialize Samsung Health
      await SamsungHealth.initialize();

      let todaySuccess = false;
      let yesterdaySuccess = false;

      // Sync previous day's data with points update
      console.log(
        `[SamsungHealthSync] Hourly reconciliation - Syncing previous day: ${previousDayDate}`,
      );
      yesterdaySuccess = await this.syncDataForDate(previousDayDate, true); // Update points for previous day

      if (yesterdaySuccess) {
        console.log(
          `[SamsungHealthSync] Hourly reconciliation - Previous day synced successfully: ${previousDayDate}`,
        );
      } else {
        console.log(
          `[SamsungHealthSync] Hourly reconciliation - Previous day sync failed: ${previousDayDate}`,
        );
      }

      // Sync today's data with points update
      console.log(
        `[SamsungHealthSync] Hourly reconciliation - Syncing today: ${todayDate}`,
      );
      todaySuccess = await this.syncDataForDate(todayDate, true); // Update points for today

      if (todaySuccess) {
        console.log(
          `[SamsungHealthSync] Hourly reconciliation - Today synced successfully: ${todayDate}`,
        );
      } else {
        console.log(
          `[SamsungHealthSync] Hourly reconciliation - Today sync failed: ${todayDate}`,
        );
      }

      // Log overall result
      if (todaySuccess && yesterdaySuccess) {
        console.log(
          '[SamsungHealthSync] Hourly reconciliation completed successfully for both days',
        );
      } else if (todaySuccess || yesterdaySuccess) {
        console.log(
          '[SamsungHealthSync] Hourly reconciliation partially completed',
        );
      } else {
        console.log(
          '[SamsungHealthSync] Hourly reconciliation failed for both days',
        );
      }

      // Update next run time
      const hourlyIntervalMs = 60 * 60 * 1000;
      this.hourlyReconciliationNextRunTime = new Date(
        Date.now() + hourlyIntervalMs,
      );
    } catch (error: any) {
      console.error('[SamsungHealthSync] Hourly reconciliation error:', error);
      // Don't throw - just log the error
    }
  }

  /**
   * Update sync frequency dynamically
   */
  async updateSyncFrequency(frequencyInSeconds: number): Promise<void> {
    this.syncFrequency = frequencyInSeconds;
    await AsyncStorage.setItem(
      SYNC_FREQUENCY_KEY,
      frequencyInSeconds.toString(),
    );

    // Restart auto-refresh with new frequency
    this.startAutoRefresh();

    // Keep Android background cadence aligned to the same interval
    if (Platform.OS === 'android') {
      // Reset flag to allow reconfiguration
      this.isBackgroundFetchConfigured = false;
      setTimeout(() => {
        this.setupAndroidBackgroundFetchWithRetry();
      }, 500);
    }
  }

  /**
   * Update sync start date
   */
  async updateSyncStartDate(startDate: Date): Promise<void> {
    this.syncStartDate = startDate;
    await AsyncStorage.setItem(SYNC_START_DATE_KEY, startDate.toISOString());

    // Trigger immediate sync with new start date
    await this.performSync();
  }

  /**
   * Clear all synced data (for testing or reset)
   */
  async clearSyncedData(): Promise<void> {
    this.syncedTransactionIds.clear();
    this.syncedStepsDates.clear();
    this.syncedDistanceDates.clear();
    await AsyncStorage.removeItem(SYNCED_TRANSACTION_IDS_KEY);
    await AsyncStorage.removeItem(SYNCED_STEPS_DATES_KEY);
    await AsyncStorage.removeItem(SYNCED_DISTANCE_DATES_KEY);
    await AsyncStorage.removeItem(LAST_SYNC_DATE_KEY);
    console.log('[SamsungHealthSync] Cleared all synced data');
  }

  /**
   * Get sync status
   */
  getSyncStatus(): {
    isActive: boolean;
    isSyncing: boolean;
    syncFrequency: number;
    syncStartDate: Date;
    syncedCount: number;
  } {
    return {
      isActive: this.intervalRef !== null,
      isSyncing: this.isSyncing,
      syncFrequency: this.syncFrequency,
      syncStartDate: this.syncStartDate,
      syncedCount: this.syncedTransactionIds.size,
    };
  }

  /**
   * Re-schedule all background tasks and reset Samsung Health sync to defaults
   * This fixes issues after app updates where tasks may not be running
   * Resets all configuration to defaults and clears any corrupted state
   */
  async rescheduleBackgroundTasks(): Promise<{
    success: boolean;
    message: string;
  }> {
    if (Platform.OS !== 'android') {
      return { success: false, message: 'Only available on Android' };
    }

    try {
      console.log(
        '[SamsungHealthSync] Re-scheduling background tasks and resetting to defaults...',
      );

      // Step 1: Stop existing background fetch
      try {
        await BackgroundFetch.stop();
        console.log('[SamsungHealthSync] Stopped existing BackgroundFetch');
      } catch (e) {
        console.log('[SamsungHealthSync] No existing BackgroundFetch to stop');
      }

      // Step 2: Reset all in-memory flags
      this.isBackgroundFetchConfigured = false;
      this.isEodSyncScheduled = false;
      this.isHourlyReconciliationScheduled = false;
      this.isSyncing = false;

      // Step 3: Reset sync frequency to default (10 minutes = 600 seconds)
      const defaultSyncFrequency = 600;
      this.syncFrequency = defaultSyncFrequency;
      await AsyncStorage.setItem(
        SYNC_FREQUENCY_KEY,
        defaultSyncFrequency.toString(),
      );
      console.log(
        '[SamsungHealthSync] Reset sync frequency to default:',
        defaultSyncFrequency,
      );

      // Step 4: Reset EOD sync settings to defaults
      this.eodSyncEnabled = true;
      this.eodSyncTime = '02:00';
      await AsyncStorage.setItem(EOD_SYNC_ENABLED_KEY, 'true');
      console.log('[SamsungHealthSync] Reset EOD sync settings to defaults');

      // Step 5: Reset hourly reconciliation sync settings to defaults
      this.hourlyReconciliationEnabled = true;
      await AsyncStorage.setItem(HOURLY_RECONCILIATION_ENABLED_KEY, 'true');
      console.log(
        '[SamsungHealthSync] Reset hourly reconciliation sync settings to defaults',
      );

      // Step 6: Clear background fetch setup failed flag
      try {
        await AsyncStorage.removeItem('@bg_fetch_setup_failed');
        console.log('[SamsungHealthSync] Cleared background fetch failed flag');
      } catch (e) {
        // Silent error
      }

      // Step 7: Clear last sync date to trigger fresh sync
      try {
        await AsyncStorage.removeItem(LAST_SYNC_DATE_KEY);
        console.log('[SamsungHealthSync] Cleared last sync date');
      } catch (e) {
        // Silent error
      }

      // Step 8: Load sync start date (keep user's original sync start date)
      const savedStartDate = await AsyncStorage.getItem(SYNC_START_DATE_KEY);
      if (savedStartDate !== null) {
        this.syncStartDate = new Date(savedStartDate);
      } else {
        // If no start date, set to today
        this.syncStartDate = new Date();
        this.syncStartDate.setHours(0, 0, 0, 0);
        await AsyncStorage.setItem(
          SYNC_START_DATE_KEY,
          this.syncStartDate.toISOString(),
        );
      }
      console.log(
        '[SamsungHealthSync] Sync start date:',
        this.syncStartDate.toISOString(),
      );

      // Step 9: Load allowed data types (from storage or use defaults)
      await this.loadAllowedDataTypes();
      if (this.allowedDataTypes.length === 0) {
        this.allowedDataTypes = ['STEPS', 'EXERCISE'];
        await this.saveAllowedDataTypes();
      }
      console.log(
        '[SamsungHealthSync] Allowed data types:',
        this.allowedDataTypes,
      );

      // Step 10: Re-setup background fetch with fresh configuration
      await this.setupAndroidBackgroundFetch();
      console.log('[SamsungHealthSync] Background fetch re-configured');

      // Step 11: Re-setup end-of-day sync
      await this.setupEndOfDaySync();
      console.log('[SamsungHealthSync] EOD sync re-scheduled');

      // Step 12: Re-setup hourly reconciliation sync
      await this.setupHourlyReconciliationSync();
      console.log(
        '[SamsungHealthSync] Hourly reconciliation sync re-scheduled',
      );

      // Step 13: Restart auto-refresh interval
      this.startAutoRefresh();
      console.log('[SamsungHealthSync] Auto-refresh restarted');

      console.log(
        '[SamsungHealthSync] All background tasks re-scheduled successfully',
      );
      return {
        success: true,
        message:
          'Background tasks re-scheduled and settings reset to defaults successfully',
      };
    } catch (error: any) {
      console.error(
        '[SamsungHealthSync] Error re-scheduling background tasks:',
        error,
      );
      return {
        success: false,
        message: error?.message || 'Failed to re-schedule tasks',
      };
    }
  }

  /**
   * Get comprehensive debug information for troubleshooting
   */
  async getDebugInfo(): Promise<Record<string, any>> {
    const debugInfo: Record<string, any> = {};

    try {
      // Service state
      debugInfo.serviceState = {
        isInitialized: this.isInitialized,
        isBackgroundFetchConfigured: this.isBackgroundFetchConfigured,
        isEodSyncScheduled: this.isEodSyncScheduled,
        isHourlyReconciliationScheduled: this.isHourlyReconciliationScheduled,
        isSyncing: this.isSyncing,
        isInitialSync: this.isInitialSync,
        hasConfig: !!this.config,
        hasSyncApiFunction: !!this.syncApiFunction,
        hasDailyDataSyncApiFunction: !!this.dailyDataSyncApiFunction,
        syncFrequency: this.syncFrequency,
        syncStartDate: this.syncStartDate?.toISOString() || null,
        eodSyncEnabled: this.eodSyncEnabled,
        eodSyncTime: this.eodSyncTime,
        hourlyReconciliationEnabled: this.hourlyReconciliationEnabled,
        allowedDataTypes: this.allowedDataTypes,
        syncedTransactionIdsCount: this.syncedTransactionIds.size,
        syncedStepsDatesCount: this.syncedStepsDates.size,
        syncedDistanceDatesCount: this.syncedDistanceDates.size,
        storedResyncSyncId: this.storedResyncSyncId,
      };

      // AsyncStorage data
      const [
        frequency,
        startDate,
        lastSync,
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

      debugInfo.asyncStorage = {
        syncFrequency: frequency,
        syncStartDate: startDate,
        lastSyncDate: lastSync,
        syncedTransactionIdsCount: syncedIds ? JSON.parse(syncedIds).length : 0,
        syncedStepsDatesCount: syncedSteps ? JSON.parse(syncedSteps).length : 0,
        syncedDistanceDatesCount: syncedDistance
          ? JSON.parse(syncedDistance).length
          : 0,
        allowedDataTypes: allowedTypes,
        eodSyncEnabled: eodEnabled,
        hourlyReconciliationEnabled: hourlyReconciliationEnabled,
        resyncSyncId: resyncId,
        bgFetchSetupFailed: bgFetchFailed,
      };

      // BackgroundFetch status
      try {
        const bgStatus = await BackgroundFetch.status();
        debugInfo.backgroundFetch = {
          status: bgStatus,
          statusText:
            bgStatus === 0
              ? 'Restricted'
              : bgStatus === 1
                ? 'Denied'
                : 'Available',
        };
      } catch (e: any) {
        debugInfo.backgroundFetch = {
          error: e?.message || 'Failed to get status',
        };
      }

      // Config info (without sensitive data)
      if (this.config) {
        debugInfo.config = {
          eventId: this.config.eventId,
          hasAllowedDataTypes: !!this.config.allowedDataTypes,
          allowedDataTypesCount: this.config.allowedDataTypes?.length || 0,
          hasResyncFrom: !!this.config.resyncSamsungFrom,
          resyncSamsungFrom: this.config.resyncSamsungFrom,
          resyncSamsungSyncId: this.config.resyncSamsungSyncId,
        };
      }

      // Scheduled jobs info
      debugInfo.scheduledJobs = {
        regularSync: {
          taskId: 'shealth-sync',
          isScheduled: this.isBackgroundFetchConfigured,
          scheduledAt: this.regularSyncScheduledAt?.toISOString() || null,
          interval: `${this.syncFrequency} seconds (${Math.floor(
            this.syncFrequency / 60,
          )} min)`,
          periodic: true,
        },
        endOfDaySync: {
          taskId: 'shealth-eod-sync',
          isScheduled: this.isEodSyncScheduled,
          scheduledAt: this.eodSyncScheduledAt?.toISOString() || null,
          nextRunTime: this.eodSyncNextRunTime?.toISOString() || null,
          targetTime: this.eodSyncTime,
          enabled: this.eodSyncEnabled,
          periodic: true,
        },
        hourlyReconciliation: {
          taskId: 'shealth-hourly-reconciliation',
          isScheduled: this.isHourlyReconciliationScheduled,
          scheduledAt:
            this.hourlyReconciliationScheduledAt?.toISOString() || null,
          nextRunTime:
            this.hourlyReconciliationNextRunTime?.toISOString() || null,
          interval: '60 minutes (1 hour)',
          enabled: this.hourlyReconciliationEnabled,
          periodic: true,
        },
        foregroundInterval: {
          isActive: this.intervalRef !== null,
          interval: `${this.syncFrequency} seconds (${Math.floor(
            this.syncFrequency / 60,
          )} min)`,
        },
      };

      debugInfo.timestamp = new Date().toISOString();
    } catch (error: any) {
      debugInfo.error = error?.message || 'Failed to collect debug info';
    }

    return debugInfo;
  }
}

// Export singleton instance
export const SamsungHealthBackgroundSync =
  new SamsungHealthBackgroundSyncService();

// Storage key exports
export {
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
};
