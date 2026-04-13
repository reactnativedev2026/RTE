import Toast from 'react-native-toast-message';
import {moderateScale} from '../utils/metrics';

interface CustomToastProps {
  type: 'success' | 'error' | 'info';
  message: string;
}

const CustomToast = ({type, message}: CustomToastProps) => {
  Toast.show({
    type: type,
    text1: type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Info',
    text2: message,
    position: 'top',
    topOffset: moderateScale(100),
  });
};
export default CustomToast;
