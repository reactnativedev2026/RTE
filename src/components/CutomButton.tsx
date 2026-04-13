import React, {ReactNode, useEffect, useState} from 'react';
import {Pressable, PressableProps, GestureResponderEvent} from 'react-native';

interface CustomButtonProps extends PressableProps {
  onPress?: (e: GestureResponderEvent) => void;
  delayTime?: number;
  children?: ReactNode;
  props?: any;
}

const CustomButton = ({
  onPress,
  delayTime,
  children,
  props,
}: CustomButtonProps) => {
  const [isDisabled, setDisabled] = useState(false);

  useEffect(() => {
    if (!isDisabled) {
      return; // timeout elapsed, nothing to do
    }

    // isDisabled was changed to true, set back to false after `delay`
    const handle = setTimeout(
      () => {
        setDisabled(false);
      },
      delayTime ? delayTime : 500,
    );

    return () => clearTimeout(handle);
  }, [isDisabled, delayTime]);

  const handleClick = (e: GestureResponderEvent) => {
    if (isDisabled) {
      return;
    }

    setDisabled(true);
    onPress && onPress(e);
  };

  return (
    <Pressable
      onPress={handleClick}
      {...props}
      hitSlop={{top: 20, bottom: 20, right: 20, left: 20}}>
      {children}
    </Pressable>
  );
};

export default CustomButton;
