import React, { useState } from 'react';
import axios from 'axios';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../firebase';
import { toast } from 'react-toastify';

// Configure axios with base URL
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
});

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [isResetPassword, setIsResetPassword] = useState(false);
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isOtpValidated, setIsOtpValidated] = useState(false);
    const [data, setData] = useState({
        username: '',
        email: '',
        password: '',
        fullName: '',
        otp: '',
        newPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [passwordCriteria, setPasswordCriteria] = useState({
        hasLowercase: false,
        hasUppercase: false,
        hasNumber: false,
        hasSpecialChar: false,
        hasMinLength: false,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData({ ...data, [name]: value.trim() });
        toast.dismiss(); // Clear existing toasts on input change

        // Real-time password validation for sign-up or new password
        if ((name === 'password' && !isLogin && !isResetPassword) || (name === 'newPassword' && isResetPassword)) {
            setPasswordCriteria({
                hasLowercase: /[a-z]/.test(value),
                hasUppercase: /[A-Z]/.test(value),
                hasNumber: /\d/.test(value),
                hasSpecialChar: /[!@#$%^&*]/.test(value),
                hasMinLength: value.length >= 6,
            });
        }
    };

    const validateForm = () => {
        if (!data.email.trim()) {
            toast.error('Email is required', { toastId: 'email-required', position: 'top-center', autoClose: 3000 });
            return false;
        }
        if (!/^[a-zA-Z0-9.]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$/.test(data.email)) {
            toast.error('Please enter a valid email address (e.g., example@gmail.com)', {
                toastId: 'email-invalid',
                position: 'top-center',
                autoClose: 3000,
            });
            return false;
        }
        if (!isResetPassword && !data.password.trim()) {
            toast.error('Password is required', { toastId: 'password-required', position: 'top-center', autoClose: 3000 });
            return false;
        }
        if (!isLogin && !isResetPassword) {
            // Password validation for sign-up
            if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/.test(data.password)) {
                toast.error(
                    'Password must include:\n- At least one special character (!@#$%^&*)\n- At least one number\n- At least one lowercase letter\n- At least one uppercase letter\n- Minimum 6 characters',
                    { toastId: 'password-criteria', position: 'top-center', autoClose: 5000 }
                );
                return false;
            }
            if (!data.username.trim()) {
                toast.error('Username is required', { toastId: 'username-required', position: 'top-center', autoClose: 3000 });
                return false;
            }
            if (!data.fullName.trim()) {
                toast.error('Full name is required', { toastId: 'fullname-required', position: 'top-center', autoClose: 3000 });
                return false;
            }
        }
        if (isResetPassword && isOtpSent && !isOtpValidated && !data.otp.trim()) {
            toast.error('OTP is required', { toastId: 'otp-required', position: 'top-center', autoClose: 3000 });
            return false;
        }
        if (isResetPassword && isOtpValidated && !data.newPassword.trim()) {
            toast.error('New password is required', { toastId: 'new-password-required', position: 'top-center', autoClose: 3000 });
            return false;
        }
        if (isResetPassword && isOtpValidated && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/.test(data.newPassword)) {
            toast.error(
                'New password must include:\n- At least one special character (!@#$%^&*)\n- At least one number\n- At least one lowercase letter\n- At least one uppercase letter\n- Minimum 6 characters',
                { toastId: 'new-password-criteria', position: 'top-center', autoClose: 5000 }
            );
            return false;
        }
        return true;
    };

    const checkUserExists = async () => {
        try {
            const response = await api.post('/checkUser', {
                email: data.email,
                username: data.username,
            });
            return response.data.exists;
        } catch (error) {
            console.error('Check user error:', error);
            toast.error('Error checking user existence. Please try again.', {
                toastId: 'check-user-error',
                position: 'top-center',
                autoClose: 3000,
            });
            return false;
        }
    };

    const handleGoogleAuth = async () => {
        const toastId = toast.loading('Processing Google authentication...', { position: 'top-center' });
        setLoading(true);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            const response = await api.post('/googlelogin', {
                email: user.email,
                fullName: user.displayName || '',
                googleId: user.uid,
            });

            if (response.data.success) {
                const { token, InfluencerID } = response.data.data;
                localStorage.setItem('token', token); // Store JWT token
                toast.update(toastId, {
                    render: isLogin ? 'Login successful! Redirecting...' : 'Sign up successful! Redirecting...',
                    type: 'success',
                    isLoading: false,
                    autoClose: 2000,
                });
                setTimeout(() => {
                    window.location.href = `/profile/${InfluencerID}`;
                }, 2000);
            } else {
                toast.update(toastId, {
                    render: response.data.error || 'Google authentication failed',
                    type: 'error',
                    isLoading: false,
                    autoClose: 3000,
                });
            }
        } catch (error) {
            console.error('Google Auth error:', error);
            const errorMessage =
                error.code === 'auth/popup-closed-by-user'
                    ? 'Google authentication cancelled.'
                    : error.message || 'Google authentication failed';
            toast.update(toastId, {
                render: errorMessage,
                type: 'error',
                isLoading: false,
                autoClose: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const toastId = toast.loading(
            isOtpSent
                ? isOtpValidated
                    ? 'Changing password...'
                    : 'Validating OTP...'
                : 'Sending OTP...',
            { position: 'top-center' }
        );
        setLoading(true);

        try {
            if (!isOtpSent) {
                // Request OTP
                const response = await api.post('/forgetpassword', { email: data.email });
                if (response.data.success) {
                    toast.update(toastId, {
                        render: 'OTP sent to your email!',
                        type: 'success',
                        isLoading: false,
                        autoClose: 3000,
                    });
                    setIsOtpSent(true);
                } else {
                    toast.update(toastId, {
                        render: response.data.error || 'Failed to send OTP',
                        type: 'error',
                        isLoading: false,
                        autoClose: 3000,
                    });
                }
            } else if (!isOtpValidated) {
                // Validate OTP
                const response = await api.post('/otpvalidation', {
                    email: data.email,
                    otp: data.otp,
                });
                if (response.data.success) {
                    toast.update(toastId, {
                        render: 'OTP validated successfully!',
                        type: 'success',
                        isLoading: false,
                        autoClose: 3000,
                    });
                    setIsOtpValidated(true);
                } else {
                    toast.update(toastId, {
                        render: response.data.error || 'Invalid OTP',
                        type: 'error',
                        isLoading: false,
                        autoClose: 3000,
                    });
                }
            } else {
                // Change password
                const response = await api.post('/changepassword', {
                    email: data.email,
                    newPassword: data.newPassword,
                });
                if (response.data.success) {
                    toast.update(toastId, {
                        render: 'Password changed successfully! Redirecting to login...',
                        type: 'success',
                        isLoading: false,
                        autoClose: 2000,
                    });
                    setTimeout(() => {
                        setIsResetPassword(false);
                        setIsOtpSent(false);
                        setIsOtpValidated(false);
                        setIsLogin(true);
                        setData({ username: '', email: '', password: '', fullName: '', otp: '', newPassword: '' });
                    }, 2000);
                } else {
                    toast.update(toastId, {
                        render: response.data.error || 'Failed to change password',
                        type: 'error',
                        isLoading: false,
                        autoClose: 3000,
                    });
                }
            }
        } catch (error) {
            console.error('Password reset error:', error);
            toast.update(toastId, {
                render: error.response?.data?.error || 'An error occurred. Please try again.',
                type: 'error',
                isLoading: false,
                autoClose: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const toastId = toast.loading(isLogin ? 'Logging in...' : 'Signing up...', { position: 'top-center' });
        setLoading(true);
        try {
            if (!isLogin) {
                const userExists = await checkUserExists();
                if (userExists) {
                    toast.update(toastId, {
                        render: 'Email or username already exists',
                        type: 'error',
                        isLoading: false,
                        autoClose: 3000,
                    });
                    setLoading(false);
                    return;
                }
            }

            const endpoint = isLogin ? '/login' : '/signUp';
            let response;

            if (isLogin) {
                response = await api.post(endpoint, {
                    email: data.email,
                    password: data.password,
                });
            } else {
                const formData = new FormData();
                formData.append('username', data.username);
                formData.append('email', data.email);
                formData.append('password', data.password);
                formData.append('fullName', data.fullName);

                response = await api.post(endpoint, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            }

            if (response.data.success) {
                const InfluencerID= response.data.data[0]?.InfluencerID || response.data.data.InfluencerID;
                toast.update(toastId, {
                    render: isLogin ? 'Login successful! Redirecting...' : 'Sign up successful! Redirecting...',
                    type: 'success',
                    isLoading: false,
                    autoClose: 2000,
                });
                setTimeout(() => {
                    window.location.href = `/profile/${InfluencerID}`;
                }, 2000);
            } else {
                toast.update(toastId, {
                    render: response.data.error || (isLogin ? 'Invalid credentials' : 'Sign up failed'),
                    type: 'error',
                    isLoading: false,
                    autoClose: 3000,
                });
            }
        } catch (error) {
            console.error('Form submission error:', error);
            toast.update(toastId, {
                render: error.response?.data?.error || 'An error occurred. Please try again.',
                type: 'error',
                isLoading: false,
                autoClose: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    const toggleForm = () => {
        setIsLogin(!isLogin);
        setIsResetPassword(false);
        setIsOtpSent(false);
        setIsOtpValidated(false);
        setData({ username: '', email: '', password: '', fullName: '', otp: '', newPassword: '' });
        toast.dismiss();
        setPasswordCriteria({
            hasLowercase: false,
            hasUppercase: false,
            hasNumber: false,
            hasSpecialChar: false,
            hasMinLength: false,
        });
    };

    const toggleResetPassword = () => {
        setIsResetPassword(true);
        setIsLogin(true);
        setIsOtpSent(false);
        setIsOtpValidated(false);
        setData({ username: '', email: '', password: '', fullName: '', otp: '', newPassword: '' });
        toast.dismiss();
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-6 text-blue-600">
                    {isResetPassword ? (isOtpValidated ? 'Change Password' : isOtpSent ? 'Enter OTP' : 'Reset Password') : isLogin ? 'Login' : 'Sign Up'}
                </h2>
                {!isResetPassword && (
                    <button
                        onClick={handleGoogleAuth}
                        disabled={loading}
                        className={`w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200 mb-4 ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        aria-label="Sign in with Google"
                    >
                        <svg
                            className="mr-2"
                            width="18"
                            height="18"
                            viewBox="0 0 18 18"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M17.57 7.91H7.5v2.25h5.76c-.24 1.26-.96 2.34-2.07 3.06v2.52h3.33c1.95-1.8 3.06-4.5 3.06-7.56 0-.72-.09-1.44-.27-2.07z"
                                fill="#4285F4"
                            />
                            <path
                                d="M9 17.25c2.25 0 4.14-.81 5.58-2.25l-2.52-1.98c-.72.54-1.71.9-2.88.9-2.25 0-4.14-1.53-4.83-3.6H2.88v2.25C4.32 15.48 6.48 17.25 9 17.25z"
                                fill="#34A853"
                            />
                            <path
                                d="M4.17 10.5c-.18-.63-.27-1.35-.27-2.07 0-.72.09-1.44.27-2.07L2.88 6.12v2.25h1.62c-.69 1.26-1.08 2.7-1.08 4.23 0 1.53.39 2.97 1.08 4.23H2.88l1.29-1.98z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M9 3.6c1.26 0 2.43.45 3.33 1.35l2.52-2.52C12.42 1.17 10.53.45 8.28.45 5.76.45 3.6 2.22 2.16 4.68l2.52 1.98c.69-1.89 2.61-3.33 4.32-3.33z"
                                fill="#EA4335"
                            />
                        </svg>
                        {isLogin ? 'Sign in with Google' : 'Sign up with Google'}
                    </button>
                )}
                {!isResetPassword && (
                    <div className="flex items-center my-4">
                        <div className="flex-1 h-px bg-gray-300"></div>
                        <span className="mx-4 text-gray-500">or</span>
                        <div className="flex-1 h-px bg-gray-300"></div>
                    </div>
                )}
                <form onSubmit={isResetPassword ? handleResetPassword : handleSubmit} className="space-y-4">
                    {isResetPassword ? (
                        <>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={data.email}
                                    onChange={handleChange}
                                    required
                                    disabled={isOtpSent}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                    aria-label="Email"
                                />
                            </div>
                            {isOtpSent && !isOtpValidated && (
                                <div>
                                    <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                                        OTP
                                    </label>
                                    <input
                                        type="text"
                                        id="otp"
                                        name="otp"
                                        value={data.otp}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        aria-label="OTP"
                                    />
                                </div>
                            )}
                            {isOtpValidated && (
                                <div>
                                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        id="newPassword"
                                        name="newPassword"
                                        value={data.newPassword}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        aria-label="New Password"
                                    />
                                    <div className="mt-2 text-sm text-gray-600">
                                        <p>New password must include:</p>
                                        <ul className="list-none">
                                            <li className={passwordCriteria.hasLowercase ? 'text-green-600' : 'text-gray-400'}>
                                                {passwordCriteria.hasLowercase ? '✅' : 'O'} At least one lowercase letter
                                            </li>
                                            <li className={passwordCriteria.hasUppercase ? 'text-green-600' : 'text-gray-400'}>
                                                {passwordCriteria.hasUppercase ? '✅' : 'O'} At least one uppercase letter
                                            </li>
                                            <li className={passwordCriteria.hasNumber ? 'text-green-600' : 'text-gray-400'}>
                                                {passwordCriteria.hasNumber ? '✅' : 'O'} At least one number
                                            </li>
                                            <li className={passwordCriteria.hasSpecialChar ? 'text-green-600' : 'text-gray-400'}>
                                                {passwordCriteria.hasSpecialChar ? '✅' : 'O'} At least one special character (!@#$%^&*)
                                            </li>
                                            <li className={passwordCriteria.hasMinLength ? 'text-green-600' : 'text-gray-400'}>
                                                {passwordCriteria.hasMinLength ? '✅' : 'O'} Minimum 6 characters
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            {!isLogin && (
                                <div>
                                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        id="fullName"
                                        name="fullName"
                                        value={data.fullName}
                                        onChange={handleChange}
                                        required={!isLogin}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        aria-label="Full Name"
                                    />
                                </div>
                            )}
                            {!isLogin && (
                                <div>
                                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        id="username"
                                        name="username"
                                        value={data.username}
                                        onChange={handleChange}
                                        required={!isLogin}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        aria-label="Username"
                                    />
                                </div>
                            )}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={data.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    aria-label="Email"
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={data.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    aria-label="Password"
                                />
                                {isLogin && (
                                    <button
                                        type="button"
                                        onClick={toggleResetPassword}
                                        className="mt-2 text-sm text-blue-600 hover:underline focus:outline-none"
                                        aria-label="Forgot Password"
                                    >
                                        Forgot Password?
                                    </button>
                                )}
                                {!isLogin && (
                                    <div className="mt-2 text-sm text-gray-600">
                                        <p>Password must include:</p>
                                        <ul className="list-none">
                                            <li className={passwordCriteria.hasLowercase ? 'text-green-600' : 'text-gray-400'}>
                                                {passwordCriteria.hasLowercase ? '✅' : 'O'} At least one lowercase letter
                                            </li>
                                            <li className={passwordCriteria.hasUppercase ? 'text-green-600' : 'text-gray-400'}>
                                                {passwordCriteria.hasUppercase ? '✅' : 'O'} At least one uppercase letter
                                            </li>
                                            <li className={passwordCriteria.hasNumber ? 'text-green-600' : 'text-gray-400'}>
                                                {passwordCriteria.hasNumber ? '✅' : 'O'} At least one number
                                            </li>
                                            <li className={passwordCriteria.hasSpecialChar ? 'text-green-600' : 'text-gray-400'}>
                                                {passwordCriteria.hasSpecialChar ? '✅' : 'O'} At least one special character (!@#$%^&*)
                                            </li>
                                            <li className={passwordCriteria.hasMinLength ? 'text-green-600' : 'text-gray-400'}>
                                                {passwordCriteria.hasMinLength ? '✅' : 'O'} Minimum 6 characters
                                            </li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        aria-label={isResetPassword ? (isOtpValidated ? 'Change Password' : isOtpSent ? 'Validate OTP' : 'Send OTP') : isLogin ? 'Login' : 'Sign Up'}
                    >
                        {loading
                            ? 'Loading...'
                            : isResetPassword
                            ? isOtpValidated
                                ? 'Change Password'
                                : isOtpSent
                                ? 'Validate OTP'
                                : 'Send OTP'
                            : isLogin
                            ? 'Sign In'
                            : 'Sign Up'}
                    </button>
                </form>
                {!isResetPassword && (
                    <p className="text-center mt-4 text-gray-600">
                        {isLogin ? 'Don’t have an account?' : 'Already have an account?'}
                        <button
                            onClick={toggleForm}
                            className="ml-1 text-blue-600 hover:underline focus:outline-none"
                            aria-label={isLogin ? 'Switch to Sign Up' : 'Switch to Login'}
                        >
                            {isLogin ? 'Sign Up' : 'Login'}
                        </button>
                    </p>
                )}
                {isResetPassword && (
                    <p className="text-center mt-4 text-gray-600">
                        <button
                            onClick={toggleForm}
                            className="text-blue-600 hover:underline focus:outline-none"
                            aria-label="Back to Login"
                        >
                            Back to Login
                        </button>
                    </p>
                )}
            </div>
        </div>
    );
};

export default Auth;