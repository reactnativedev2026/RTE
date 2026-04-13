import {Alert} from 'react-native';

interface CustomAlertProps {
  type: 'success' | 'error' | 'info';
  message?: string;
  title?: string;
}

const CustomAlert = ({type, message, title}: CustomAlertProps) => {
  const alertTitle =
    title ||
    (type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Info');

  Alert.alert(alertTitle, message, [{text: 'OK'}], {cancelable: true});
};

export default CustomAlert;
