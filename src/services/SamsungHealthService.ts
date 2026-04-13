import {NativeModules, Platform} from 'react-native';

const {SamsungHealthModule} = NativeModules;

/**
 * Exercise data interface
 */
export interface ExerciseData {
  exerciseType: string;
  startTime: string;
  endTime: string;
  duration: number; // in seconds
  calories: number;
  distance: number; // in meters
}

/**
 * Steps data interface
 */
export interface StepsData {
  count: number;
  startTime: string;
  endTime: string;
  date: string;
}

/**
 * Activity Summary distance data interface
 */
export interface ActivitySummaryDistanceData {
  startTime: string;
  endTime: string;
  date: string;
  distanceMeters: number;
  distanceKilometers: number;
  distanceKilometersString: string; // Precise string representation with 2 decimals
}

/**
 * Permission check result interface
 */
export interface PermissionCheckResult {
  hasSteps: boolean;
  hasActivitySummary: boolean;
  hasExercise: boolean;
  hasAllRequired: boolean;
}

/**
 * Samsung Health Module interface
 */
export interface SamsungHealthModuleInterface {
  /**
   * Initialize Samsung Health SDK
   * Must be called before any other methods
   * @returns Promise that resolves to true if successful
   */
  initialize(): Promise<boolean>;

  /**
   * Request permissions for Samsung Health data access
   * Requests permissions based on allowed_data_types from UAT API
   * STEPS is always requested, EXERCISE is requested if in allowed_data_types
   * @param allowedDataTypes Optional array of allowed data types (e.g., ["STEPS", "EXERCISE"])
   *                         If not provided, defaults to requesting both STEPS and EXERCISE
   * @returns Promise that resolves to true if all permissions granted
   */
  requestPermissions(allowedDataTypes?: string[]): Promise<boolean>;

  /**
   * Get exercise data for a specific date range
   * @param startDate Start date in ISO format (e.g., "2024-01-01T00:00:00")
   * @param endDate End date in ISO format (e.g., "2024-01-02T00:00:00")
   * @returns Promise that resolves to array of exercise data
   */
  getExerciseData(startDate: string, endDate: string): Promise<ExerciseData[]>;

  /**
   * Get steps data for a specific date range
   * @param startDate Start date in ISO format (e.g., "2024-01-01T00:00:00")
   * @param endDate End date in ISO format (e.g., "2024-01-02T00:00:00")
   * @returns Promise that resolves to array of steps data
   */
  getStepsData(startDate: string, endDate: string): Promise<StepsData[]>;

  /**
   * Get activity summary distance data for a specific date range
   * @param startDate Start date in ISO format (e.g., "2024-01-01T00:00:00")
   * @param endDate End date in ISO format (e.g., "2024-01-02T00:00:00")
   * @returns Promise that resolves to array of activity summary distance data
   */
  getActivitySummaryDistance(
    startDate: string,
    endDate: string,
  ): Promise<ActivitySummaryDistanceData[]>;

  /**
   * Get device unique identifier
   * @returns Promise that resolves to device unique ID string
   */
  getDeviceId(): Promise<string>;

  /**
   * Disconnect from Samsung Health
   * @returns Promise that resolves to true if successful
   */
  disconnect(): Promise<boolean>;

  /**
   * Check if Samsung Health is connected
   * @returns Promise that resolves to true if connected
   */
  isConnected(): Promise<boolean>;

  /**
   * Check which permissions are currently granted
   * @param allowedDataTypes Optional array of allowed data types (e.g., ["STEPS", "EXERCISE"])
   * @returns Promise that resolves to permission check result
   */
  checkGrantedPermissions(
    allowedDataTypes?: string[],
  ): Promise<PermissionCheckResult>;
}

/**
 * Samsung Health Service wrapper
 * Provides a safe interface to Samsung Health native module for connection and permissions
 */
class SamsungHealthService implements SamsungHealthModuleInterface {
  private isAndroid: boolean;

  constructor() {
    this.isAndroid = Platform.OS === 'android';
  }

  private checkPlatform(): void {
    if (!this.isAndroid) {
      throw new Error('Samsung Health is only available on Android devices');
    }
    if (!SamsungHealthModule) {
      throw new Error('Samsung Health module is not available');
    }
  }

  async initialize(): Promise<boolean> {
    this.checkPlatform();
    try {
      return await SamsungHealthModule.initialize();
    } catch (error) {
      console.error('Samsung Health initialization error:', error);
      throw error;
    }
  }

  async requestPermissions(allowedDataTypes?: string[]): Promise<boolean> {
    this.checkPlatform();
    try {
      // React Native automatically converts JavaScript arrays to ReadableArray
      // Pass null if not provided to use default behavior (both STEPS and EXERCISE)
      return await SamsungHealthModule.requestPermissions(allowedDataTypes || null);
    } catch (error) {
      console.error('Samsung Health permission request error:', error);
      throw error;
    }
  }

  async getExerciseData(
    startDate: string,
    endDate: string,
  ): Promise<ExerciseData[]> {
    this.checkPlatform();
    try {
      return await SamsungHealthModule.getExerciseData(startDate, endDate);
    } catch (error) {
      console.error('Samsung Health get exercise data error:', error);
      throw error;
    }
  }

  async getStepsData(
    startDate: string,
    endDate: string,
  ): Promise<StepsData[]> {
    this.checkPlatform();
    try {
      return await SamsungHealthModule.getStepsData(startDate, endDate);
    } catch (error) {
      console.error('Samsung Health get steps data error:', error);
      throw error;
    }
  }

  async getActivitySummaryDistance(
    startDate: string,
    endDate: string,
  ): Promise<ActivitySummaryDistanceData[]> {
    this.checkPlatform();
    try {
      return await SamsungHealthModule.getActivitySummaryDistance(
        startDate,
        endDate,
      );
    } catch (error) {
      console.error('Samsung Health get activity summary distance error:', error);
      throw error;
    }
  }

  async getDeviceId(): Promise<string> {
    this.checkPlatform();
    try {
      return await SamsungHealthModule.getDeviceId();
    } catch (error) {
      console.error('Samsung Health get device ID error:', error);
      throw error;
    }
  }

  async disconnect(): Promise<boolean> {
    this.checkPlatform();
    try {
      return await SamsungHealthModule.disconnect();
    } catch (error) {
      console.error('Samsung Health disconnect error:', error);
      throw error;
    }
  }

  async isConnected(): Promise<boolean> {
    this.checkPlatform();
    try {
      return await SamsungHealthModule.isConnected();
    } catch (error) {
      console.error('Samsung Health connection check error:', error);
      return false;
    }
  }

  async checkGrantedPermissions(
    allowedDataTypes?: string[],
  ): Promise<PermissionCheckResult> {
    this.checkPlatform();
    try {
      return await SamsungHealthModule.checkGrantedPermissions(
        allowedDataTypes || null,
      );
    } catch (error) {
      console.error('Samsung Health permission check error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const SamsungHealth = new SamsungHealthService();

// Export types
export type {
  SamsungHealthModuleInterface,
  ExerciseData,
  StepsData,
  ActivitySummaryDistanceData,
  PermissionCheckResult,
};

