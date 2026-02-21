import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Image,
    ActivityIndicator,
    Alert
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import config from '../constants/config';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

const ProfileScreen = () => {
    const { colors, isDark } = useTheme();
    const { user, idToken, logout } = useAuth();

    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form fields
    const [name, setName] = useState(user?.name || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [location, setLocation] = useState(user?.location || '');
    const [latitude, setLatitude] = useState(user?.latitude || null);
    const [longitude, setLongitude] = useState(user?.longitude || null);
    const [semester, setSemester] = useState(user?.semester?.toString() || '');
    const [branch, setBranch] = useState(user?.branch || '');

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
            Alert.alert('Location Captured', 'GPS coordinates updated! Don\'t forget to save.');
        } catch (error) {
            console.error('[Profile] Location capture failed:', error);
            Alert.alert('Error', 'Could not get current location.');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdate = async () => {
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
                Alert.alert('Success', 'Profile updated successfully!');
                setEditing(false);
            } else {
                Alert.alert('Error', result.error || 'Failed to update profile');
            }
        } catch (error) {
            console.error('[Profile] Update failed:', error);
            Alert.alert('Error', 'Something went wrong. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { backgroundColor: colors.primary }]}>
                <View style={styles.headerContent}>
                    <View style={styles.imageContainer}>
                        {user?.profile_pic_url ? (
                            <Image source={{ uri: user.profile_pic_url }} style={styles.profilePic} />
                        ) : (
                            <View style={[styles.profilePicPlaceholder, { backgroundColor: colors.surface }]}>
                                <Ionicons name="person" size={50} color={colors.primary} />
                            </View>
                        )}
                    </View>
                    <Text style={styles.headerName}>{user?.name || 'Student'}</Text>
                    <Text style={styles.headerRoll}>{user?.roll_number}</Text>
                </View>
            </View>

            <View style={styles.content}>
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Personal Details</Text>
                    {!editing ? (
                        <TouchableOpacity onPress={() => setEditing(true)}>
                            <Text style={{ color: colors.primary, fontWeight: '700' }}>Edit Profile</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.editActions}>
                            <TouchableOpacity onPress={() => setEditing(false)} style={{ marginRight: 16 }}>
                                <Text style={{ color: colors.textSecondary }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleUpdate} disabled={saving}>
                                {saving ? (
                                    <ActivityIndicator size="small" color={colors.primary} />
                                ) : (
                                    <Text style={{ color: colors.primary, fontWeight: '700' }}>Save</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <LabelText label="Full Name" value={name} editing={editing} onChange={setName} colors={colors} />
                    <LabelText label="Bio" value={bio} editing={editing} onChange={setBio} multiline colors={colors} />
                    <LabelText label="Exact Location (Hostel/Room)" value={location} editing={editing} onChange={setLocation} colors={colors} placeholder="e.g. H6-204 or Sector 3" />

                    {editing && (
                        <TouchableOpacity
                            style={[styles.gpsButton, { borderColor: colors.primary }]}
                            onPress={captureLocation}
                        >
                            <Ionicons name="location-outline" size={18} color={colors.primary} />
                            <Text style={[styles.gpsButtonText, { color: colors.primary }]}>
                                {latitude ? 'Update GPS Location' : 'Capture GPS Location'}
                            </Text>
                        </TouchableOpacity>
                    )}
                    {latitude && !editing && (
                        <Text style={[styles.gpsInfo, { color: colors.textSecondary }]}>
                            📍 GPS: {latitude.toFixed(4)}, {longitude.toFixed(4)}
                        </Text>
                    )}

                    <LabelText label="Semester" value={semester} editing={editing} onChange={setSemester} keyboardType="numeric" colors={colors} />
                    <LabelText label="Branch" value={branch} editing={editing} onChange={setBranch} colors={colors} />
                </View>

                <TouchableOpacity
                    style={[styles.logoutButton, { borderColor: colors.error }]}
                    onPress={logout}
                >
                    <Ionicons name="log-out-outline" size={20} color={colors.error} />
                    <Text style={[styles.logoutText, { color: colors.error }]}>Log Out</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const LabelText = ({ label, value, editing, onChange, multiline, keyboardType, colors, placeholder }) => (
    <View style={styles.fieldContainer}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
        {editing ? (
            <TextInput
                style={[styles.fieldInput, { color: colors.textPrimary, borderColor: colors.border }]}
                value={value}
                onChangeText={onChange}
                multiline={multiline}
                keyboardType={keyboardType}
                placeholder={placeholder}
                placeholderTextColor={colors.textSecondary}
            />
        ) : (
            <Text style={[styles.fieldValue, { color: colors.textPrimary }]}>{value || 'Not set'}</Text>
        )}
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 40,
        paddingBottom: 40,
        alignItems: 'center',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerContent: {
        alignItems: 'center',
    },
    imageContainer: {
        marginBottom: 16,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    profilePic: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: 'white',
    },
    profilePicPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'white',
    },
    headerName: {
        fontSize: 24,
        fontWeight: '800',
        color: 'white',
    },
    headerRoll: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
        marginTop: 4,
        fontWeight: '600',
    },
    content: {
        padding: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    editActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoCard: {
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        marginBottom: 24,
    },
    fieldContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 6,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    fieldValue: {
        fontSize: 16,
        fontWeight: '500',
    },
    fieldInput: {
        fontSize: 16,
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
    },
    logoutButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1.5,
        marginTop: 8,
        marginBottom: 80, // Tab bar height
        gap: 8,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '700',
    },
    gpsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1.5,
        marginVertical: 8,
        gap: 8,
    },
    gpsButtonText: {
        fontSize: 14,
        fontWeight: '700',
    },
    gpsInfo: {
        fontSize: 12,
        marginBottom: 12,
        fontStyle: 'italic',
    },
});

export default ProfileScreen;
