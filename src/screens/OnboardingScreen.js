import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import config from '../constants/config';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';

const OnboardingScreen = () => {
    const { colors, isDark } = useTheme();
    const { user, idToken, syncProfile } = useAuth(); // Assuming syncProfile will refresh state

    const [saving, setSaving] = useState(false);

    // Form fields
    const [name, setName] = useState(user?.name || '');
    const [bio, setBio] = useState('');
    const [location, setLocation] = useState('');
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [semester, setSemester] = useState('');
    const [branch, setBranch] = useState('');

    React.useEffect(() => {
        const getPermission = async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.warn('[Onboarding] Location permission not granted');
            }
        };
        getPermission();
    }, []);

    const captureLocation = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Permission to access location was denied');
            return;
        }

        setSaving(true);
        try {
            let currentLocation = await Location.getCurrentPositionAsync({});
            setLatitude(currentLocation.coords.latitude);
            setLongitude(currentLocation.coords.longitude);
            Alert.alert('Location Captured', 'GPS coordinates saved!');
        } catch (error) {
            console.error('[Onboarding] Location capture failed:', error);
            Alert.alert('Error', 'Could not get current location.');
        } finally {
            setSaving(false);
        }
    };

    const handleFinish = async () => {
        if (!name || !branch || !semester) {
            Alert.alert('Required Fields', 'Please fill in your Name, Branch, and Semester.');
            return;
        }

        setSaving(true);
        try {
            const response = await fetch(`${config.API_BASE_URL}/user/me`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({
                    name,
                    bio,
                    location,
                    latitude,
                    longitude,
                    semester: parseInt(semester),
                    branch
                })
            });

            const result = await response.json();
            if (result.success) {
                // Force context refresh if needed, or rely on App.js re-render
                if (syncProfile) await syncProfile();
            } else {
                Alert.alert('Error', result.error || 'Failed to save profile');
            }
        } catch (error) {
            console.error('[Onboarding] Update failed:', error);
            Alert.alert('Error', 'Something went wrong. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <LinearGradient
            colors={isDark ? ['#1a1a2e', '#16213e'] : ['#f0f4f8', '#d9e2ec']}
            style={styles.container}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: colors.textPrimary }]}>Almost there!</Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                            Help us personalize your experience by providing a few details.
                        </Text>
                    </View>

                    <View style={[styles.card, { backgroundColor: colors.surface }]}>
                        <InputField label="Full Name" value={name} onChange={setName} colors={colors} placeholder="e.g. Rahul Sharma" />
                        <InputField label="Branch" value={branch} onChange={setBranch} colors={colors} placeholder="e.g. IT, CSE, ME" />
                        <InputField label="Semester" value={semester} onChange={setSemester} colors={colors} keyboardType="numeric" placeholder="e.g. 6" />
                        <InputField label="Bio" value={bio} onChange={setBio} colors={colors} multiline placeholder="Tell us about yourself..." />
                        <InputField label="Hostel/Room (Optional)" value={location} onChange={setLocation} colors={colors} placeholder="e.g. H6-204" />

                        <TouchableOpacity
                            style={[styles.gpsButton, { borderColor: colors.primary }]}
                            onPress={captureLocation}
                        >
                            <Ionicons name="location-outline" size={20} color={colors.primary} />
                            <Text style={[styles.gpsButtonText, { color: colors.primary }]}>
                                {latitude ? 'Location Captured ✓' : 'Add Precise Location (GPS)'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.finishButton, { backgroundColor: colors.primary }]}
                            onPress={handleFinish}
                            disabled={saving}
                        >
                            {saving ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text style={styles.finishButtonText}>Complete Setup</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
};

const InputField = ({ label, value, onChange, colors, multiline, keyboardType, placeholder }) => (
    <View style={styles.fieldContainer}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
        <TextInput
            style={[styles.input, { color: colors.textPrimary, borderColor: colors.border }]}
            value={value}
            onChangeText={onChange}
            multiline={multiline}
            keyboardType={keyboardType}
            placeholder={placeholder}
            placeholderTextColor={colors.textSecondary}
        />
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
        paddingTop: 60,
    },
    header: {
        marginBottom: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
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
    fieldContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1.5,
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
    },
    gpsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1.5,
        marginBottom: 24,
        gap: 8,
    },
    gpsButtonText: {
        fontSize: 14,
        fontWeight: '700',
    },
    finishButton: {
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
    },
    finishButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    }
});

export default OnboardingScreen;
