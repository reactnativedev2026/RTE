import {useEffect, useState} from 'react';
import {Platform} from 'react-native';
import {useSelector} from 'react-redux';
import {RootState} from '../core/store';
import {SamsungHealth} from '../services/SamsungHealthService';
import {SamsungHealthConnection} from '../services/SamsungHealthConnectionService';
import {useCheckUatAuthorizationQuery} from '../services/deviceConnect.api';

export interface PermissionCheckState {
  isChecking: boolean;
  needsPermissions: boolean;
  missingPermissions: string[];
  showPermissionDialog: boolean;
}

/**
 * Hook to check Samsung Health permissions
 * Checks if Samsung Health is connected and verifies permissions
 */
export const useSamsungHealthPermissionCheck = () => {
  const {user} = useSelector((state: RootState) => state.loginReducer);
  const {data: uatAuthData} = useCheckUatAuthorizationQuery(
    {},
    {refetchOnMountOrArgChange: true},
  );

  const [state, setState] = useState<PermissionCheckState>({
    isChecking: false,
    needsPermissions: false,
    missingPermissions: [],
    showPermissionDialog: false,
  });

  useEffect(() => {
    if (Platform.OS !== 'android' || !user?.preferred_event_id) {
      return;
    }

    // Add a small delay to ensure screen is fully loaded
    const timer = setTimeout(() => {
      checkPermissionsOnLaunch();
    }, 1000);

    return () => clearTimeout(timer);
  }, [user?.preferred_event_id, uatAuthData]);

  const checkPermissionsOnLaunch = async () => {
    try {
      setState(prev => ({...prev, isChecking: true}));

      // Step 1: Check if Samsung Health is connected
      const connectionStatus =
        await SamsungHealthConnection.checkConnectionStatus();

      if (!connectionStatus.isConnected) {
        console.log(
          '[PermissionCheck] Samsung Health not connected, skipping permission check',
        );
        setState(prev => ({...prev, isChecking: false}));
        return;
      }

      // Step 2: Initialize Samsung Health SDK
      try {
        await SamsungHealth.initialize();
      } catch (error) {
        console.error(
          '[PermissionCheck] Failed to initialize Samsung Health:',
          error,
        );
        setState(prev => ({...prev, isChecking: false}));
        return;
      }

      // Step 3: Get allowed data types from UAT API
      let allowedDataTypes: string[] | undefined = undefined;
      if (
        uatAuthData?.success === true &&
        uatAuthData?.data?.allowed_data_types
      ) {
        allowedDataTypes = uatAuthData.data.allowed_data_types;
      }

      // Step 4: Check granted permissions
      const permissionStatus = await SamsungHealth.checkGrantedPermissions(
        allowedDataTypes,
      );

      // Step 5: Determine if permissions are missing
      const missingPermissions: string[] = [];

      if (!permissionStatus.hasSteps) {
        missingPermissions.push('Steps');
      }
      if (!permissionStatus.hasActivitySummary) {
        missingPermissions.push('Activity Summary');
      }

      const isExerciseAllowed = allowedDataTypes?.some(
        type => type.toUpperCase() === 'EXERCISE',
      );
      if (isExerciseAllowed && !permissionStatus.hasExercise) {
        missingPermissions.push('Exercise');
      }

      // Step 6: Update state and show dialog if needed
      if (missingPermissions.length > 0) {
        console.log('[PermissionCheck] Missing permissions:', missingPermissions);
        setState({
          isChecking: false,
          needsPermissions: true,
          missingPermissions,
          showPermissionDialog: true,
        });
      } else {
        console.log('[PermissionCheck] All permissions granted');
        setState({
          isChecking: false,
          needsPermissions: false,
          missingPermissions: [],
          showPermissionDialog: false,
        });
      }
    } catch (error) {
      console.error('[PermissionCheck] Error checking permissions:', error);
      setState(prev => ({...prev, isChecking: false}));
    }
  };

  const requestMissingPermissions = async () => {
    try {
      // Get allowed data types
      let allowedDataTypes: string[] | undefined = undefined;
      if (
        uatAuthData?.success === true &&
        uatAuthData?.data?.allowed_data_types
      ) {
        allowedDataTypes = uatAuthData.data.allowed_data_types;
      }

      // Request permissions (this will show Samsung Health permission dialog)
      const granted = await SamsungHealth.requestPermissions(allowedDataTypes);

      if (granted) {
        setState({
          isChecking: false,
          needsPermissions: false,
          missingPermissions: [],
          showPermissionDialog: false,
        });
        return true;
      } else {
        // User denied some permissions
        setState(prev => ({...prev, showPermissionDialog: false}));
        return false;
      }
    } catch (error) {
      console.error('[PermissionCheck] Error requesting permissions:', error);
      setState(prev => ({...prev, showPermissionDialog: false}));
      return false;
    }
  };

  const dismissPermissionDialog = () => {
    setState(prev => ({...prev, showPermissionDialog: false}));
  };

  return {
    ...state,
    requestMissingPermissions,
    dismissPermissionDialog,
    recheckPermissions: checkPermissionsOnLaunch,
  };
};
