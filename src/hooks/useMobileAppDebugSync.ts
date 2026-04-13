import {useEffect, useRef} from 'react';
import {AppState, AppStateStatus, Platform} from 'react-native';
import {useSelector} from 'react-redux';
import {RootState} from '../core/store';
import {MobileAppDebugService} from '../services/MobileAppDebugService';
import {usePushMobileAppUserDataMutation} from '../services/deviceConnect.api';
import {SamsungHealthBackgroundSync} from '../services/SamsungHealthBackgroundSync';

/**
 * Hook to sync mobile app debug data to the server
 * Triggers on:
 * - App open (initial load)
 * - Background to foreground transition
 */
export const useMobileAppDebugSync = () => {
  const {user} = useSelector((state: RootState) => state.loginReducer);
  const [pushDebugData] = usePushMobileAppUserDataMutation();
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const isSyncingRef = useRef(false);
  const lastSyncTimeRef = useRef<number>(0);
  const SYNC_COOLDOWN_MS = 15 * 60 * 1000; // 15 minutes

  useEffect(() => {
    // Only run when user is logged in
    if (!user?.id) {
      return;
    }

    const syncDebugData = async () => {
      if (isSyncingRef.current) {
        console.log('[MobileAppDebugSync] Sync already in progress, skipping...');
        return;
      }

      const now = Date.now();
      const elapsed = now - lastSyncTimeRef.current;
      if (elapsed < SYNC_COOLDOWN_MS) {
        const remainingMin = Math.ceil((SYNC_COOLDOWN_MS - elapsed) / 60000);
        console.log(`[MobileAppDebugSync] Cooldown active, skipping (${remainingMin} min remaining)`);
        return;
      }

      isSyncingRef.current = true;
      lastSyncTimeRef.current = now;
      try {
        console.log('[MobileAppDebugSync] Collecting debug data...');

        // Collect all debug data
        const payload = await MobileAppDebugService.collectDebugData();

        console.log('[MobileAppDebugSync] Pushing debug data to server...');

        // Push to server
        await pushDebugData(payload).unwrap();

        console.log('[MobileAppDebugSync] Debug data synced successfully');

        // Trigger Samsung Health daily data sync on Android (skips internally if not connected)
        if (Platform.OS === 'android') {
          await SamsungHealthBackgroundSync.performDailyDataSync();
        }
      } catch (error: any) {
        // Silent fail - don't disrupt user experience
        console.error('[MobileAppDebugSync] Failed to sync debug data:', error?.message || error);
      } finally {
        isSyncingRef.current = false;
      }
    };

    // Handle app state changes (background to foreground)
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      // Trigger sync when app comes to foreground from background/inactive
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('[MobileAppDebugSync] App came to foreground, syncing...');
        syncDebugData();
      }
      appStateRef.current = nextAppState;
    };

    // Subscribe to app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Initial sync on mount (app open) with small delay
    const timeoutId = setTimeout(() => {
      console.log('[MobileAppDebugSync] Initial app open, syncing...');
      syncDebugData();
    }, 3000);

    // Cleanup
    return () => {
      clearTimeout(timeoutId);
      subscription.remove();
    };
  }, [user?.id, pushDebugData]);
};
