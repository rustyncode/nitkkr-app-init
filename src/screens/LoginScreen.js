import React, { useState, useEffect, useRef } from 'react';
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
    Image,
    Dimensions
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { auth } from '../config/firebase';
import {
    GoogleAuthProvider,
    signInWithCredential
} from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const LoginScreen = () => {
    const { colors, isDark } = useTheme();
    const { sendOtp, verifyOtp } = useAuth();


    const redirectUri = makeRedirectUri();

    // Log the EXACT redirect URI so we can see it in terminal
    console.log('[DEBUG] Exact Redirect URI:', redirectUri);

    const [request, response, promptAsync] = Google.useAuthRequest({
        iosClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
        androidClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
        prompt: 'select_account',
        redirectUri: 'https://auth.expo.io/@jaiyankargupta/rustinet'
    });

    useEffect(() => {
        if (response?.type === 'success') {
            const { id_token } = response.params;
            const credential = GoogleAuthProvider.credential(id_token);
            setGoogleLoading(true);

            const authenticate = async () => {
                try {
                    const userCredential = await signInWithCredential(auth, credential);
                    const email = userCredential.user?.email;
                    if (!email || !email.endsWith('@nitkkr.ac.in')) {
                        await auth.signOut();
                        Alert.alert('Login Failed', 'Please use your valid @nitkkr.ac.in email address.');
                    }
                } catch (err) {
                    console.error('[GoogleLogin] Firebase error:', err);
                    Alert.alert('Login Failed', 'Failed to sync with Firebase.');
                } finally {
                    setGoogleLoading(false);
                }
            };

            authenticate();
        } else if (response?.type === 'error' || response?.type === 'dismiss') {
            setGoogleLoading(false);
        }
    }, [response]);

    const [rollNumber, setRollNumber] = useState('');

    const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
    const otpRefs = useRef([]);
    const [otpLoading, setOtpLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
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

    const handleOtpChange = (text, index) => {
        // Only allow numbers
        const cleanText = text.replace(/[^0-9]/g, '');

        const newOtp = [...otpCode];
        newOtp[index] = cleanText;
        setOtpCode(newOtp);

        // Auto-advance to next box if filled
        if (cleanText && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyPress = (e, index) => {
        if (e.nativeEvent.key === 'Backspace' && !otpCode[index] && index > 0) {
            // Auto backtrack on empty backspace
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleSendOtp = async () => {
        if (!rollNumber || rollNumber.length < 8) {
            Alert.alert('Invalid Roll Number', 'Please enter a valid NIT KKR Roll Number (e.g. 12212236).');
            return;
        }

        const email = `${rollNumber}@nitkkr.ac.in`;
        setOtpLoading(true);
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
            setOtpLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        const code = otpCode.join('');
        if (code.length !== 6) {
            Alert.alert('Invalid Code', 'Please enter the 6-digit code sent to your email.');
            return;
        }

        const email = `${rollNumber}@nitkkr.ac.in`;
        setOtpLoading(true);
        try {
            const result = await verifyOtp(email, otpCode);
            if (!result.success) {
                Alert.alert('Verification Failed', result.error || 'Invalid code.');
            }
        } catch (error) {
            console.error('[Login] Verification failed:', error);
            Alert.alert('Error', 'Verification failed. Please try again.');
        } finally {
            setOtpLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setGoogleLoading(true);
        try {
            await promptAsync();
        } catch (error) {
            console.error('[GoogleLogin] Prompt failed:', error);
            setGoogleLoading(false);
        }
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
                                disabled={otpLoading}
                            >
                                {otpLoading ? (
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

                            <View style={styles.otpContainer}>
                                {otpCode.map((digit, index) => (
                                    <TextInput
                                        key={index}
                                        ref={(ref) => otpRefs.current[index] = ref}
                                        style={[
                                            styles.otpBox,
                                            { color: colors.textPrimary, borderColor: colors.border },
                                            digit ? { borderColor: colors.primary, backgroundColor: isDark ? '#232d4b' : '#e2e8f0' } : {}
                                        ]}
                                        value={digit}
                                        onChangeText={(text) => handleOtpChange(text, index)}
                                        onKeyPress={(e) => handleOtpKeyPress(e, index)}
                                        keyboardType="number-pad"
                                        maxLength={1}
                                        selectTextOnFocus
                                    />
                                ))}
                            </View>

                            <TouchableOpacity
                                style={[styles.loginButton, { backgroundColor: colors.primary }]}
                                onPress={handleVerifyOtp}
                                disabled={otpLoading}
                            >
                                {otpLoading ? (
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
                        disabled={googleLoading}
                    >
                        {googleLoading ? (
                            <ActivityIndicator color={colors.textPrimary} />
                        ) : (
                            <>
                                <Ionicons name="logo-google" size={20} color="#DB4437" />
                                <Text style={[styles.googleButtonText, { color: colors.textPrimary }]}>Sign in with Google</Text>
                            </>
                        )}
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
        justifyContent: 'flex-start',
        padding: 24,
        paddingTop: 120, // Increased top margin
        paddingBottom: 40, // Ensure bottom has some breathing space
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    logoCircle: {
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: 12,
        marginTop: 2,
        opacity: 0.8,
    },
    card: {
        padding: 20,
        borderRadius: 24,
        elevation: 4,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 13,
        marginBottom: 20,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        position: 'relative',
    },
    inputIcon: {
        position: 'absolute',
        left: 16,
        zIndex: 1,
    },
    input: {
        flex: 1,
        height: 50,
        borderWidth: 1.5,
        borderRadius: 16,
        paddingHorizontal: 48,
        fontSize: 16,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
        marginTop: 8,
    },
    otpBox: {
        width: 48,
        height: 56,
        borderWidth: 1.5,
        borderRadius: 12,
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    loginButton: {
        height: 50,
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
        marginVertical: 20,
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
        height: 50,
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
