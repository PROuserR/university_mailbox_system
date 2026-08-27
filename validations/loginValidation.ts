import * as yup from 'yup';

export const userSchema = yup.object().shape({
    email: yup.string().email().required(),
    password: yup.string().min(4).max(10).matches(/[a-z]/, 'Password must contain at least one lowercase letter')
        .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .matches(/\d/, 'Password must contain at least one number')
        .matches(/[@$!%*?&#]/, 'Password must contain at least one special sign').required()
})