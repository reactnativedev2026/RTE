import React from 'react';
import {setHidden, setAdjustNothing} from 'rn-android-keyboard-adjust';
const useAdjustKeyboard = () => {
  React.useEffect(() => {
    setHidden();
    setAdjustNothing();
    return () => {
      setHidden();
      setAdjustNothing();
    };
  }, []);
};

export default useAdjustKeyboard;
