import * as yup from 'yup';

// create a validation schema using Yup
const loginSchema = yup.object().shape({
  username: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

const forgotPasswordSchema = yup.object().shape({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
});

const resetPasswordSchema = yup.object().shape({
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

const createTeamSchema = yup.object().shape({
  teamName: yup
    .string()
    .min(2, 'Too Short!')
    .max(50, 'Too Long!')
    .required('Team name required'),
});

const sendInviteSchema = yup.object().shape({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
});

const updatePasswordSchema = yup.object().shape({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('New password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

const userPointsSchema = yup.object().shape({
  daily_steps: yup
    .string()
    .test(
      'is-number-or-empty',
      'Invalid value, must be a number or float',
      value => {
        if (!value) {
          return true;
        } // Allow empty values
        return /^[0-9]*\.?[0-9]+$/.test(value); // Validate numbers or floats
      },
    ),
  run: yup
    .string()
    .test(
      'is-number-or-empty',
      'Invalid value, must be a number or float',
      value => {
        if (!value) {
          return true;
        } // Allow empty values
        return /^[0-9]*\.?[0-9]+$/.test(value); // Validate numbers or floats
      },
    ),
  walk: yup
    .string()
    .test(
      'is-number-or-empty',
      'Invalid value, must be a number or float',
      value => {
        if (!value) {
          return true;
        } // Allow empty values
        return /^[0-9]*\.?[0-9]+$/.test(value); // Validate numbers or floats
      },
    ),
  bike: yup
    .string()
    .test(
      'is-number-or-empty',
      'Invalid value, must be a number or float',
      value => {
        if (!value) {
          return true;
        } // Allow empty values
        return /^[0-9]*\.?[0-9]+$/.test(value); // Validate numbers or floats
      },
    ),
  other: yup
    .string()
    .test(
      'is-number-or-empty',
      'Invalid value, must be a number or float',
      value => {
        if (!value) {
          return true;
        } // Allow empty values
        return /^[0-9]*\.?[0-9]+$/.test(value); // Validate numbers or floats
      },
    ),
});
export {
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  createTeamSchema,
  sendInviteSchema,
  updatePasswordSchema,
  userPointsSchema,
};
