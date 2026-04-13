import React from 'react';
import {images} from '../utils';

interface CustomArrowProps {
  props?: any;
  fill?: any;
}
const CustomArrow = ({props, fill}: CustomArrowProps) => {
  return <images.DoubleArrow fill={fill} {...props} />;
};
export default CustomArrow;
