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
    Alert,
    Dimensions
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import config from '../constants/config';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { spacing, typography } from '../theme/spacing';

const { width } = Dimensions.get("window");
const CARD_MARGIN = spacing.screenHorizontal;

const ProfileScreen = ({ navigation }) => {
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
    const [cgpa, setCgpa] = useState(user?.cgpa ? user.cgpa.toString() : '');

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
                    branch,
                    cgpa: cgpa ? parseFloat(cgpa) : null
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
                    <View style={styles.badgesContainer}>
                        <View style={[styles.badge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                            <Ionicons name="star" size={14} color="#FFD700" />
                            <Text style={styles.badgeText}>Verified</Text>
                        </View>
                        <View style={[styles.badge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                            <Ionicons name="school" size={14} color="#FFF" />
                            <Text style={styles.badgeText}>{user?.branch || 'N/A'}</Text>
                        </View>
                    </View>
                </View>
            </View>

            <View style={styles.content}>

                {/* ─── Profile Details Section ─── */}
                <View style={[styles.dashboardCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleRow}>
                            <Ionicons name="person-circle-outline" size={24} color={colors.primary} />
                            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Profile Info</Text>
                        </View>
                        {!editing ? (
                            <TouchableOpacity onPress={() => setEditing(true)}>
                                <Text style={{ color: colors.primary, fontWeight: '700' }}>Edit</Text>
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

                    <View style={styles.divider} />

                    <View style={styles.profileGrid}>
                        <LabelText label="Full Name" value={name} editing={editing} onChange={setName} colors={colors} fullWidth />
                        <LabelText label="Branch" value={branch} editing={editing} onChange={setBranch} colors={colors} />
                        <LabelText label="Semester" value={semester} editing={editing} onChange={setSemester} keyboardType="numeric" colors={colors} />
                        <LabelText label="CGPA" value={cgpa} editing={editing} onChange={setCgpa} keyboardType="numeric" colors={colors} placeholder="NA" />
                        <LabelText label="Location" value={location} editing={editing} onChange={setLocation} colors={colors} fullWidth />
                    </View>

                    {editing && (
                        <TouchableOpacity
                            style={[styles.gpsButton, { borderColor: colors.primary, backgroundColor: colors.primary + '11' }]}
                            onPress={captureLocation}
                        >
                            <Ionicons name="location-outline" size={18} color={colors.primary} />
                            <Text style={[styles.gpsButtonText, { color: colors.primary }]}>
                                {latitude ? 'Update GPS Location' : 'Capture GPS Location'}
                            </Text>
                        </TouchableOpacity>
                    )}
                    {latitude && !editing && (
                        <Text style={[styles.gpsInfo, { color: colors.featureTeal }]}>
                            📍 GPS Verified: {latitude.toFixed(3)}, {longitude.toFixed(3)}
                        </Text>
                    )}
                </View>

                {/* ─── Quick Actions / Activity Section ─── */}
                <Text style={[styles.blockTitle, { color: colors.textPrimary }]}>Quick Links</Text>
                <View style={styles.quickLinksRow}>
                    <TouchableOpacity style={[styles.quickBox, { backgroundColor: colors.featurePurpleBg }]} onPress={() => navigation.navigate("Bookmarks")}>
                        <Ionicons name="bookmark" size={28} color={colors.featurePurple} />
                        <Text style={[styles.quickBoxTitle, { color: colors.textPrimary }]}>Saved</Text>
                        <Text style={[styles.quickBoxSub, { color: colors.textSecondary }]}>Bookmarks</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.quickBox, { backgroundColor: colors.featureBlueBg }]} onPress={() => navigation.navigate("Notes")}>
                        <Ionicons name="library" size={28} color={colors.featureBlue} />
                        <Text style={[styles.quickBoxTitle, { color: colors.textPrimary }]}>Notes</Text>
                        <Text style={[styles.quickBoxSub, { color: colors.textSecondary }]}>My Material</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.quickBox, { backgroundColor: colors.featureOrangeBg }]} onPress={() => navigation.navigate("Settings")}>
                        <Ionicons name="settings" size={28} color={colors.featureOrange} />
                        <Text style={[styles.quickBoxTitle, { color: colors.textPrimary }]}>Settings</Text>
                        <Text style={[styles.quickBoxSub, { color: colors.textSecondary }]}>App Prefs</Text>
                    </TouchableOpacity>
                </View>

                {/* ─── Notifications Feed Section (Placeholder) ─── */}
                <Text style={[styles.blockTitle, { color: colors.textPrimary, marginTop: 20 }]}>Recent Notifications</Text>
                <View style={[styles.dashboardCard, { backgroundColor: colors.surface, borderColor: colors.borderLight, alignItems: 'center', paddingVertical: 40 }]}>
                    <Ionicons name="notifications-off-circle" size={50} color={colors.border} />
                    <Text style={[styles.emptyStateTitle, { color: colors.textPrimary }]}>No Notifications Yet</Text>
                    <Text style={[styles.emptyStateSub, { color: colors.textSecondary }]}>
                        Alerts and official notices will appear here in the future once the integration is ready.
                    </Text>
                </View>

                <TouchableOpacity
                    style={[styles.logoutButton, { borderColor: colors.error, backgroundColor: isDark ? colors.surface : '#FFF' }]}
                    onPress={logout}
                >
                    <Ionicons name="log-out-outline" size={20} color={colors.error} />
                    <Text style={[styles.logoutText, { color: colors.error }]}>Log Out of RustiNet</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const LabelText = ({ label, value, editing, onChange, keyboardType, colors, placeholder, fullWidth }) => (
    <View style={[styles.fieldContainer, fullWidth && { width: '100%' }]}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
        {editing ? (
            <TextInput
                style={[styles.fieldInput, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.background }]}
                value={value}
                onChangeText={onChange}
                keyboardType={keyboardType}
                placeholder={placeholder}
                placeholderTextColor={colors.textSecondary}
            />
        ) : (
            <Text style={[styles.fieldValue, { color: colors.textPrimary }]}>{value || placeholder || 'NA'}</Text>
        )}
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 60,
        paddingBottom: 40,
        alignItems: 'center',
        borderBottomLeftRadius: 36,
        borderBottomRightRadius: 36,
        elevation: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
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
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 4,
        borderColor: 'white',
    },
    profilePicPlaceholder: {
        width: 110,
        height: 110,
        borderRadius: 55,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: 'white',
    },
    headerName: {
        fontSize: typography.fontSize.xxl,
        fontWeight: typography.fontWeight.black,
        color: 'white',
        letterSpacing: 0.5,
    },
    headerRoll: {
        fontSize: typography.fontSize.md,
        color: 'rgba(255, 255, 255, 0.9)',
        marginTop: 4,
        fontWeight: typography.fontWeight.bold,
    },
    badgesContainer: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 12,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 4,
    },
    badgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '700',
    },
    content: {
        padding: spacing.screenHorizontal,
        paddingBottom: 100, // accommodate bottom tab
    },
    dashboardCard: {
        padding: spacing.lg,
        borderRadius: 24,
        borderWidth: 1,
        marginBottom: 24,
        elevation: 5,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowColor: "#000",
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    sectionTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(150,150,150,0.2)',
        marginVertical: 16,
    },
    profileGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        rowGap: 16,
    },
    fieldContainer: {
        width: '48%',
    },
    label: {
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    fieldValue: {
        fontSize: 16,
        fontWeight: '600',
    },
    fieldInput: {
        fontSize: 16,
        borderWidth: 1.5,
        borderRadius: 12,
        padding: 12,
        fontWeight: '600',
    },
    editActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    gpsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 14,
        borderRadius: 12,
        borderWidth: 1.5,
        marginTop: 16,
        gap: 8,
    },
    gpsButtonText: {
        fontSize: 14,
        fontWeight: '800',
    },
    gpsInfo: {
        fontSize: 13,
        marginTop: 12,
        fontWeight: '600',
    },
    blockTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        marginBottom: 12,
        marginLeft: 4,
    },
    quickLinksRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    quickBox: {
        width: (width - spacing.screenHorizontal * 2 - 24) / 3,
        padding: 16,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    quickBoxTitle: {
        fontSize: 14,
        fontWeight: '800',
        marginTop: 12,
    },
    quickBoxSub: {
        fontSize: 11,
        marginTop: 2,
    },
    emptyStateTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: 'bold',
        marginTop: 16,
    },
    emptyStateSub: {
        fontSize: typography.fontSize.sm,
        textAlign: 'center',
        marginTop: 8,
        paddingHorizontal: 20,
        lineHeight: 20,
    },
    logoutButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        borderWidth: 1.5,
        marginTop: 16,
        gap: 8,
        elevation: 2,
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '800',
    },
});

export default ProfileScreen;
