import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Image
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { auth } from '../config/firebase';
import {
    sendSignInLinkToEmail,
    GoogleAuthProvider,
    signInWithCredential
} from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const LoginScreen = () => {
    const { colors, isDark } = useTheme();
    const { sendOtp, verifyOtp } = useAuth();
    const [rollNumber, setRollNumber] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [stage, setStage] = useState('identify'); // 'identify' or 'verify'
    const [timer, setTimer] = useState(0);

    const startTimer = () => {
        setTimer(60);
        const interval = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleSendOtp = async () => {
        if (!rollNumber || rollNumber.length < 8) {
            Alert.alert('Invalid Roll Number', 'Please enter a valid NIT KKR Roll Number (e.g. 12212236).');
            return;
        }

        const email = `${rollNumber}@nitkkr.ac.in`;
        setLoading(true);
        try {
            const result = await sendOtp(email);
            if (result.success) {
                setStage('verify');
                startTimer();
                Alert.alert('Code Sent!', result.message);
            } else {
                Alert.alert('Error', result.error || 'Failed to send code.');
            }
        } catch (error) {
            console.error('[Login] OTP send failed:', error);
            Alert.alert('Error', 'Something went wrong. Please check your internet.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otpCode || otpCode.length !== 6) {
            Alert.alert('Invalid Code', 'Please enter the 6-digit code sent to your email.');
            return;
        }

        const email = `${rollNumber}@nitkkr.ac.in`;
        setLoading(true);
        try {
            const result = await verifyOtp(email, otpCode);
            if (!result.success) {
                Alert.alert('Verification Failed', result.error || 'Invalid code.');
            }
        } catch (error) {
            console.error('[Login] Verification failed:', error);
            Alert.alert('Error', 'Verification failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        Alert.alert('Google Sign-In', 'This feature requires native configuration. Please use Roll Number login for now.');
    };

    return (
        <LinearGradient
            colors={isDark ? ['#1a1a2e', '#16213e'] : ['#f0f4f8', '#d9e2ec']}
            style={styles.container}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.inner}
            >
                <View style={styles.logoContainer}>
                    <View style={[styles.logoCircle, { backgroundColor: colors.primary }]}>
                        <Ionicons name="school" size={50} color="white" />
                    </View>
                    <Text style={[styles.title, { color: colors.textPrimary }]}>RustiNet</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>The NIT KKR Student Ecosystem</Text>
                </View>

                <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.shadowDark }]}>
                    {stage === 'identify' ? (
                        <>
                            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Welcome back!</Text>
                            <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>Login with your college account</Text>

                            <View style={styles.inputWrapper}>
                                <Ionicons name="person-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, { color: colors.textPrimary, borderColor: colors.border }]}
                                    placeholder="Roll Number (e.g. 12212236)"
                                    placeholderTextColor={colors.textSecondary}
                                    value={rollNumber}
                                    onChangeText={setRollNumber}
                                    keyboardType="number-pad"
                                    autoCapitalize="none"
                                />
                            </View>

                            <TouchableOpacity
                                style={[styles.loginButton, { backgroundColor: colors.primary }]}
                                onPress={handleSendOtp}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text style={styles.loginButtonText}>Send Verification Code</Text>
                                )}
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Verify Account</Text>
                            <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                                Enter the 6-digit code sent to {rollNumber}@nitkkr.ac.in
                            </Text>

                            <View style={styles.inputWrapper}>
                                <Ionicons name="keypad-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, { color: colors.textPrimary, borderColor: colors.border }]}
                                    placeholder="Enter 6-digit Code"
                                    placeholderTextColor={colors.textSecondary}
                                    value={otpCode}
                                    onChangeText={setOtpCode}
                                    keyboardType="number-pad"
                                    maxLength={6}
                                />
                            </View>

                            <TouchableOpacity
                                style={[styles.loginButton, { backgroundColor: colors.primary }]}
                                onPress={handleVerifyOtp}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text style={styles.loginButtonText}>Verify & Login</Text>
                                )}
                            </TouchableOpacity>

                            <View style={styles.resendContainer}>
                                {timer > 0 ? (
                                    <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                                        Resend code in {timer}s
                                    </Text>
                                ) : (
                                    <TouchableOpacity onPress={handleSendOtp}>
                                        <Text style={[styles.footerText, { color: colors.primary, fontWeight: '700' }]}>
                                            Resend Code
                                        </Text>
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity onPress={() => setStage('identify')}>
                                    <Text style={[styles.footerText, { color: colors.textSecondary, marginLeft: 16 }]}>
                                        Change Roll Number
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}

                    <View style={styles.dividerContainer}>
                        <View style={[styles.divider, { backgroundColor: colors.border }]} />
                        <Text style={[styles.dividerText, { color: colors.textSecondary }]}>OR</Text>
                        <View style={[styles.divider, { backgroundColor: colors.border }]} />
                    </View>

                    <TouchableOpacity
                        style={[styles.googleButton, { borderColor: colors.border }]}
                        onPress={handleGoogleLogin}
                    >
                        <Ionicons name="logo-google" size={20} color="#DB4437" />
                        <Text style={[styles.googleButtonText, { color: colors.textPrimary }]}>Sign in with Google</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                        By logging in, you agree to our Terms & Conditions.
                    </Text>
                </View>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    inner: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: 16,
        marginTop: 4,
        opacity: 0.8,
    },
    card: {
        padding: 24,
        borderRadius: 24,
        elevation: 4,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardTitle: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 14,
        marginBottom: 24,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        position: 'relative',
    },
    inputIcon: {
        position: 'absolute',
        left: 16,
        zIndex: 1,
    },
    input: {
        flex: 1,
        height: 56,
        borderWidth: 1.5,
        borderRadius: 16,
        paddingHorizontal: 48,
        fontSize: 16,
    },
    loginButton: {
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
        elevation: 2,
    },
    loginButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
    },
    divider: {
        flex: 1,
        height: 1,
    },
    dividerText: {
        marginHorizontal: 16,
        fontSize: 12,
        fontWeight: '600',
    },
    googleButton: {
        flexDirection: 'row',
        height: 56,
        borderRadius: 16,
        borderWidth: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    googleButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        marginTop: 32,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        textAlign: 'center',
    },
    resendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    }
});

export default LoginScreen;
