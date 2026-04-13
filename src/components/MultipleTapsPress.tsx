import React, {ReactNode} from 'react';
import {Pressable, GestureResponderEvent, ViewStyle} from 'react-native';

interface MultipleTapsPressProps {
  onPress?: (e: GestureResponderEvent) => void;
  delayTime?: number;
  children: ReactNode;
  disabled?: boolean;
  style?: ViewStyle;
}

const MultipleTapsPress = ({
  onPress,
  delayTime,
  children,
  ...props
}: MultipleTapsPressProps) => {
  const [isDisabled, setDisabled] = React.useState(false);

  React.useEffect(() => {
    if (!isDisabled) {
      return;
    }
    const handle = setTimeout(
      () => {
        setDisabled(false);
      },
      delayTime ? delayTime : 1000,
    );
    return () => clearTimeout(handle);
  }, [isDisabled, delayTime]);

  const handleClick = (e: GestureResponderEvent) => {
    if (isDisabled) {
      return;
    }

    setDisabled(true);
    return onPress && onPress(e);
  };

  return (
    <Pressable onPress={handleClick} {...props}>
      {children}
    </Pressable>
  );
};

export default MultipleTapsPress;
