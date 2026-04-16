import {
  SamsungHealth,
  ExerciseData,
  StepsData,
  ActivitySummaryDistanceData,
} from './SamsungHealthService';

// Supported modalities in the system
export type Modality = 'other' | 'swim' | 'bike' | 'walk' | 'run' | 'daily_steps';

export interface MappedExerciseData extends ExerciseData {
  modality: Modality;
  displayName: string;
  synced?: boolean; // Track if this exercise has been synced to the server
}

export interface SyncExercisePayload {
  points: Array<{
    modality: string;
    data_source_id: number;
    amount: string;
  }>;
  date: string;
  event_id: number;
  transaction_id: string | null;
  note: string;
}

class SamsungHealthDataService {
  /**
   * Map Samsung Health exercise types to supported modalities
   */
  mapExerciseTypeToModality(type: string): Modality {
    // Remove "PredefinedExerciseType." prefix if present
    const cleanType = type.replace('PredefinedExerciseType.', '').toLowerCase();

    // Map specific activities only:
    // Mountain biking, Cycling, Biking = bike
    if (
      cleanType === 'mountain_biking' ||
      cleanType === 'cycling' ||
      cleanType === 'biking'
    ) {
      return 'bike';
    }

    // Hiking = other
    if (cleanType === 'hiking') {
      return 'other';
    }

    // Swimming (but not lap swimming) = swim
    if (cleanType === 'swimming') {
      return 'swim';
    }

    // Running = run
    if (cleanType === 'running') {
      return 'run';
    }

    // Walking = walk
    if (cleanType === 'walking') {
      return 'walk';
    }

    // Default to 'other' for unmapped activities
    return 'other';
  }

  /**
   * Format exercise type for display
   * Returns: "Original Name (Modality)"
   */
  formatExerciseType(type: string): string {
    // Remove "PredefinedExerciseType." prefix if present
    const cleanType = type.replace('PredefinedExerciseType.', '');

    // Convert from UPPER_CASE to Title Case
    const originalName = cleanType
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');

    const modality = this.mapExerciseTypeToModality(type);
    const modalityDisplay = modality.charAt(0).toUpperCase() + modality.slice(1);

    // Return both: "Running (Run)" or "Mountain Biking (Bike)"
    return `${originalName} (${modalityDisplay})`;
  }

  /**
   * Format duration in seconds to human readable format
   */
  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }

  /**
   * Format distance in meters to human readable format
   */
  formatDistance(meters: number): string {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(2)} km`;
    }
    return `${Math.round(meters)} m`;
  }

  /**
   * Format date/time string to localized format
   */
  formatDateTime(dateTimeStr: string): string {
    try {
      const date = new Date(dateTimeStr);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateTimeStr;
    }
  }

  /**
   * Format date to ISO string without timezone (local time)
   */
  private formatDateToISO(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}T00:00:00`;
  }

  /**
   * Fetch exercise data from Samsung Health for a given number of days
   * @param days Number of days to fetch (default: 30)
   */
  async fetchExerciseData(days: number = 30): Promise<MappedExerciseData[]> {
    // Initialize Samsung Health
    await SamsungHealth.initialize();

    // Calculate date range
    const endDate = new Date();
    // Add 1 day to end date to include all of today's data
    endDate.setDate(endDate.getDate() + 1);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const startDateStr = this.formatDateToISO(startDate);
    const endDateStr = this.formatDateToISO(endDate);

    const data = await SamsungHealth.getExerciseData(startDateStr, endDateStr);

    // Map data with modality and display name
    const mappedData: MappedExerciseData[] = data.map(exercise => ({
      ...exercise,
      modality: this.mapExerciseTypeToModality(exercise.exerciseType),
      displayName: this.formatExerciseType(exercise.exerciseType),
    }));

    return mappedData;
  }

  /**
   * Convert distance from meters to miles with 6 decimal precision
   * @param meters Distance in meters
   * @returns Distance in miles (up to 6 decimal places)
   */
  private metersToMiles(meters: number): number {
    const miles = meters * 0.000621371192;
    return parseFloat(miles.toFixed(6));
  }

  /**
   * Convert distance from kilometers to miles with 6 decimal precision
   * @param kilometers Distance in kilometers
   * @returns Distance in miles (up to 6 decimal places)
   */
  private kilometersToMiles(kilometers: number): number {
    const miles = kilometers * 0.621371192;
    return parseFloat(miles.toFixed(6));
  }

  /**
   * Convert steps to miles (2000 steps = 1 mile)
   * @param steps Number of steps
   * @returns Distance in miles (up to 6 decimal places)
   * @deprecated Use Activity Summary Distance instead
   */
  private stepsToMiles(steps: number): number {
    const miles = steps / 2000;
    return parseFloat(miles.toFixed(6));
  }

  /**
   * Format date to YYYY-MM-DD format for API
   * Keeps the date exactly as received from Samsung without any timezone conversion
   */
  private formatDateForAPI(dateStr: string): string {
    console.log('[SamsungHealthData] Formatting date:', dateStr);
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
        console.log('[SamsungHealthData] Extracted date:', dateMatch[1]);
        return dateMatch[1];
      }
      
      // Fallback: return as-is if we can't parse it
      console.error('[SamsungHealthData] Fallback formatting date:', dateStr);
      return dateStr;
    } catch {
      console.error('[SamsungHealthData] Error formatting date:', dateStr);
      return dateStr;
    }
  }

  /**
   * Generate unique transaction ID for Samsung Health exercise
   * Using combination of start time and exercise type
   */
  private generateTransactionId(exercise: MappedExerciseData): string {
    // Create unique ID from startTime and exerciseType
    const timestamp = new Date(exercise.startTime).getTime();
    const typeHash = exercise.exerciseType
      .replace('PredefinedExerciseType.', '')
      .toLowerCase();
    return `samsung_${timestamp}_${typeHash}`;
  }

  /**
   * Prepare exercise data for syncing to the server
   * Converts Samsung Health exercise data to the API format
   * Groups exercises by date and aggregates same modalities on the same day
   * @param exercises Array of mapped exercise data
   * @param eventId User's preferred event ID
   * @returns Array of payloads ready for API submission (one per date)
   */
  prepareSyncPayload(
    exercises: MappedExerciseData[],
    eventId: number,
  ): SyncExercisePayload[] {
    // Group exercises by date
    const exercisesByDate: {[date: string]: MappedExerciseData[]} = {};

    exercises.forEach(exercise => {
      const date = this.formatDateForAPI(exercise.startTime);
      if (!exercisesByDate[date]) {
        exercisesByDate[date] = [];
      }
      exercisesByDate[date].push(exercise);
    });

    // Create payload for each date
    const payloads: SyncExercisePayload[] = [];

    Object.entries(exercisesByDate).forEach(([date, dateExercises]) => {
      // Aggregate exercises by modality (sum distances for same activity type)
      const modalityDistances: {[modality: string]: number} = {};

      dateExercises.forEach(exercise => {
        const distanceInMiles = this.metersToMiles(exercise.distance);

        if (!modalityDistances[exercise.modality]) {
          modalityDistances[exercise.modality] = 0;
        }
        modalityDistances[exercise.modality] += distanceInMiles;
      });

      // Create points array with aggregated distances
      const points = Object.entries(modalityDistances).map(([modality, totalDistance]) => {
        return {
          modality,
          data_source_id: 7, // Samsung Health data source ID
          amount: totalDistance.toFixed(6), // Store with up to 6 decimal places
        };
      });

      // Generate deterministic transaction ID based on date and modalities
      // This ensures the same transaction ID is used for the same date regardless of which exercises are present
      const modalities = Object.keys(modalityDistances).sort().join('_');
      const transactionId = `samsung_${date}_${modalities}`;

      payloads.push({
        points,
        date,
        event_id: eventId,
        transaction_id: transactionId,
        note: '',
      });
    });

    return payloads;
  }

  /**
   * Filter out exercises that have 0 distance (if needed)
   * Some activities may not have distance data
   */
  filterExercisesWithDistance(
    exercises: MappedExerciseData[],
  ): MappedExerciseData[] {
    return exercises.filter(exercise => exercise.distance > 0);
  }

  /**
   * Fetch steps data from Samsung Health for a given number of days
   * @param days Number of days to fetch (default: 30)
   */
  async fetchStepsData(days: number = 30): Promise<StepsData[]> {
    try {
      // Initialize Samsung Health
      await SamsungHealth.initialize();

      // Calculate date range
      const endDate = new Date();
      // Add 1 day to end date to include all of today's data
      endDate.setDate(endDate.getDate() + 1);

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const startDateStr = this.formatDateToISO(startDate);
      const endDateStr = this.formatDateToISO(endDate);
      const data = await SamsungHealth.getStepsData(startDateStr, endDateStr);

      return data;
    } catch (error: any) {
      console.error('[SamsungHealthData] Error fetching steps data:', error);
      throw error;
    }
  }

  /**
   * Fetch activity summary distance data from Samsung Health for a given number of days
   * @param days Number of days to fetch (default: 30)
   */
  async fetchActivitySummaryDistance(
    days: number = 30,
  ): Promise<ActivitySummaryDistanceData[]> {
    try {
      // Initialize Samsung Health
      await SamsungHealth.initialize();

      // Calculate date range
      const endDate = new Date();
      // Add 1 day to end date to include all of today's data
      endDate.setDate(endDate.getDate() + 1);

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const startDateStr = this.formatDateToISO(startDate);
      const endDateStr = this.formatDateToISO(endDate);
      const data = await SamsungHealth.getActivitySummaryDistance(
        startDateStr,
        endDateStr,
      );

      return data;
    } catch (error: any) {
      console.error(
        '[SamsungHealthData] Error fetching activity summary distance:',
        error,
      );
      throw error;
    }
  }

  /**
   * Prepare daily steps data for syncing to the server
   * Calculates: Activity Summary Total Distance - Exercise Distance = daily_steps
   * Uses modality "daily_steps" for the calculated distance
   * @param activitySummaryDistance Array of activity summary distance data
   * @param exercises Array of exercise data
   * @param eventId User's preferred event ID
   * @returns Array of payloads ready for API submission (one per date)
   */
  prepareDailyStepsPayload(
    activitySummaryDistance: ActivitySummaryDistanceData[],
    exercises: MappedExerciseData[],
    eventId: number,
  ): SyncExercisePayload[] {
    try {
      console.log('[SamsungHealthData] Preparing daily steps payload...', {
        activitySummaryCount: activitySummaryDistance.length,
        exercisesCount: exercises.length,
      });

      // Group activity summary distance by date (in kilometers, already from Samsung)
      const activityDistanceByDate: {[date: string]: number} = {};
      activitySummaryDistance.forEach(summary => {
        const date = this.formatDateForAPI(summary.date);
        if (!activityDistanceByDate[date]) {
          activityDistanceByDate[date] = 0;
        }
        // Use kilometers from Samsung Health
        activityDistanceByDate[date] += summary.distanceKilometers;
      });

      // Group exercise distance by date and sum them (convert meters to km)
      const exerciseDistanceByDate: {[date: string]: number} = {};
      exercises.forEach(exercise => {
        const date = this.formatDateForAPI(exercise.startTime);
        if (!exerciseDistanceByDate[date]) {
          exerciseDistanceByDate[date] = 0;
        }
        // Convert meters to kilometers
        const distanceKm = exercise.distance / 1000;
        exerciseDistanceByDate[date] += distanceKm;
      });

      // Create payload for each date
      const payloads: SyncExercisePayload[] = [];

      Object.entries(activityDistanceByDate).forEach(([date, totalActivityKm]) => {
        // Get exercise distance for this date (default to 0 if none)
        const exerciseKm = exerciseDistanceByDate[date] || 0;

        // Calculate: Activity Summary Distance - Exercise Distance = daily_steps
        const dailyStepsKm = Math.max(0, totalActivityKm - exerciseKm);

        // Convert kilometers to miles (1 km = 0.621371 miles)
        const dailyStepsMiles = this.kilometersToMiles(dailyStepsKm);

        // Log detailed calculation for debugging
        console.log(`[SamsungHealthData] ${date} calculation:`, {
          activitySummaryKm: totalActivityKm.toFixed(6),
          activitySummaryMiles: this.kilometersToMiles(totalActivityKm).toFixed(6),
          exerciseKm: exerciseKm.toFixed(6),
          exerciseMiles: this.kilometersToMiles(exerciseKm).toFixed(6),
          dailyStepsKm: dailyStepsKm.toFixed(6),
          dailyStepsMiles: dailyStepsMiles.toFixed(6),
          dailyStepsMilesRaw: dailyStepsMiles,
          exercisesForDate: exercises.filter(e => {
            const exerciseDate = this.formatDateForAPI(e.startTime);
            return exerciseDate === date;
          }).map(e => ({
            type: e.exerciseType,
            distanceMeters: e.distance,
            distanceKm: (e.distance / 1000).toFixed(6),
            distanceMiles: this.metersToMiles(e.distance).toFixed(6),
          })),
        });

        // Create payload for all dates to ensure we store the calculation even if result is 0
        const threshold = 0.000001; // Small threshold to handle floating point precision
        // Ensure amount is never negative
        const finalAmount = Math.max(0, dailyStepsMiles);
          
        // Convert to string with 6 decimal places for consistency with other modalities
        const amountString = finalAmount.toFixed(6);
        
        const points = [
          {
            modality: 'daily_steps',
            data_source_id: 7, // Samsung Health data source ID
            amount: amountString, // Store as string with up to 6 decimal places
          },
        ];

        // Generate deterministic transaction ID based on date and modality
        const transactionId = `samsung_${date}_daily_steps`;

        payloads.push({
          points,
          date,
          event_id: eventId,
          transaction_id: transactionId,
          note: '',
        });
      });

      console.log('[SamsungHealthData] Daily steps payloads prepared:', {
        count: payloads.length,
        payloads: payloads.map(p => ({
          date: p.date,
          miles: p.points[0]?.amount,
          transaction_id: p.transaction_id,
        })),
      });

      return payloads;
    } catch (error: any) {
      console.error('[SamsungHealthData] Error preparing steps sync payload:', error);
      throw error;
    }
  }

  /**
   * Prepare total distance data for syncing to the server
   * Uses modality "total_distance" for the total distance from activity summary
   * @param activitySummaryDistance Array of activity summary distance data (should contain today's data)
   * @param eventId User's preferred event ID
   * @returns Array of payloads ready for API submission (one per date, typically just today)
   */
  prepareTotalDistancePayload(
    activitySummaryDistance: ActivitySummaryDistanceData[],
    eventId: number,
  ): SyncExercisePayload[] {
    try {
      console.log('[SamsungHealthData] Preparing total distance payload...', {
        activitySummaryCount: activitySummaryDistance.length,
      });

      // Group activity summary distance by date (in kilometers, already from Samsung)
      const activityDistanceByDate: {[date: string]: number} = {};
      activitySummaryDistance.forEach(summary => {
        const date = this.formatDateForAPI(summary.date);
        if (!activityDistanceByDate[date]) {
          activityDistanceByDate[date] = 0;
        }
        // Use kilometers from Samsung Health
        activityDistanceByDate[date] += summary.distanceKilometers;
      });

      // Create payload for each date
      const payloads: SyncExercisePayload[] = [];

      Object.entries(activityDistanceByDate).forEach(([date, totalDistanceKm]) => {
        // Convert kilometers to miles (1 km = 0.621371 miles)
        const totalDistanceMiles = this.kilometersToMiles(totalDistanceKm);

        // Log detailed calculation for debugging
        console.log(`[SamsungHealthData] ${date} total distance:`, {
          totalDistanceKm: totalDistanceKm.toFixed(6),
          totalDistanceMiles: totalDistanceMiles.toFixed(6),
          totalDistanceMilesRaw: totalDistanceMiles,
        });

        // Create payload for all dates to ensure we store 0 distance
        const threshold = 0.000001; // Small threshold to handle floating point precision
        
        // Ensure amount is never negative
        const finalAmount = Math.max(0, totalDistanceMiles);
        
        // Convert to string with 6 decimal places for consistency with other modalities
        const amountString = finalAmount.toFixed(6);
          
        const points = [
          {
            modality: 'total_distance',
            data_source_id: 7, // Samsung Health data source ID
            amount: amountString, // Store as string with up to 6 decimal places
          },
        ];

        // Generate deterministic transaction ID based on date and modality
        const transactionId = `samsung_${date}_total_distance`;

        payloads.push({
          points,
          date,
          event_id: eventId,
          transaction_id: transactionId,
          note: '',
        });
      });

      console.log('[SamsungHealthData] Total distance payloads prepared:', {
        count: payloads.length,
        payloads: payloads.map(p => ({
          date: p.date,
          miles: p.points[0]?.amount,
          transaction_id: p.transaction_id,
        })),
      });

      return payloads;
    } catch (error: any) {
      console.error('[SamsungHealthData] Error preparing total distance sync payload:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const SamsungHealthData = new SamsungHealthDataService();
