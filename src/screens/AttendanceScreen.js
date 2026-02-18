import React, { useState, useEffect, useCallback, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Modal,
    TextInput,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { initDB, getSubjects, addSubject, markAttendance, deleteSubject } from "../services/attendanceDB";
import { CameraView, useCameraPermissions } from "expo-camera";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { predictAttendance, calculatePercentage, calculateOverallStats } from "../utils/attendanceUtils";

const DISCLAIMER_SHOWN_KEY = "@attendance_disclaimer_shown";

// Initialize DB on file load
try {
    initDB();
} catch (e) {
    console.warn("DB Init error", e);
}

function SubjectCard({ subject, onMark, onDelete }) {
    const { colors } = useTheme();

    const percentage = calculatePercentage(subject.attended_classes, subject.total_classes);
    const prediction = predictAttendance(
        subject.attended_classes,
        subject.total_classes,
        subject.required_percentage
    );

    const isLow = parseFloat(percentage) < subject.required_percentage;
    const progress = subject.total_classes === 0 ? 0 : subject.attended_classes / subject.total_classes;

    return (
        <View style={[styles.compactCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
            <View style={styles.cardTop}>
                <View style={styles.subjectInfo}>
                    <View style={[styles.colorIndicator, { backgroundColor: subject.color_code || colors.primary }]} />
                    <View>
                        <Text style={[styles.subjectNameCompact, { color: colors.textPrimary }]} numberOfLines={1}>
                            {subject.name}
                        </Text>
                        <Text style={[styles.subjectMeta, { color: colors.textSecondary }]}>
                            {subject.attended_classes}/{subject.total_classes} • {percentage}%
                        </Text>
                    </View>
                </View>

                <View style={styles.cardHeaderActions}>
                    <TouchableOpacity onPress={() => onDelete(subject.id)} style={styles.deleteBtn}>
                        <Ionicons name="trash-outline" size={16} color={colors.textTertiary} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.predictionRow}>
                <View style={[
                    styles.predictionBadge,
                    { backgroundColor: (prediction.isSafe ? colors.success : colors.error) + "15" }
                ]}>
                    <Ionicons
                        name={prediction.isSafe ? "checkmark-circle" : "warning"}
                        size={12}
                        color={prediction.isSafe ? colors.success : colors.error}
                    />
                    <Text style={[
                        styles.predictionText,
                        { color: prediction.isSafe ? colors.success : colors.error }
                    ]} numberOfLines={1} ellipsizeMode="tail">
                        {prediction.status}
                    </Text>
                </View>
            </View>

            {/* Compact Progress Bar */}
            <View style={[styles.progressBarCompact, { backgroundColor: colors.borderLight }]}>
                <View
                    style={[
                        styles.progressBarFill,
                        {
                            backgroundColor: isLow ? colors.error : colors.success,
                            width: `${Math.min(100, progress * 100)}%`
                        }
                    ]}
                />
            </View>

            <View style={styles.compactActions}>
                <TouchableOpacity
                    style={[styles.miniActionBtn, { backgroundColor: colors.success + "15" }]}
                    onPress={() => onMark(subject.id, "PRESENT")}
                >
                    <Ionicons name="checkmark" size={16} color={colors.success} />
                    <Text style={[styles.miniActionText, { color: colors.success }]}>Present</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.miniActionBtn, { backgroundColor: colors.error + "15" }]}
                    onPress={() => onMark(subject.id, "ABSENT")}
                >
                    <Ionicons name="close" size={16} color={colors.error} />
                    <Text style={[styles.miniActionText, { color: colors.error }]}>Absent</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

export default function AttendanceScreen() {
    const { colors } = useTheme();
    const [subjects, setSubjects] = useState([]);
    const [refresh, setRefresh] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [newSubName, setNewSubName] = useState("");
    const [newSubCode, setNewSubCode] = useState("");
    const [newSubRequired, setNewSubRequired] = useState("75");

    // Camera verification states
    const [disclaimerVisible, setDisclaimerVisible] = useState(false);
    const [cameraVisible, setCameraVisible] = useState(false);
    const [pendingSubjectId, setPendingSubjectId] = useState(null);
    const [disclaimerSeen, setDisclaimerSeen] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef(null);

    // Check if disclaimer was already seen
    useEffect(() => {
        const checkDisclaimer = async () => {
            try {
                const value = await AsyncStorage.getItem(DISCLAIMER_SHOWN_KEY);
                if (value === "true") {
                    setDisclaimerSeen(true);
                }
            } catch (e) {
                console.error("Error reading disclaimer state", e);
            }
        };
        checkDisclaimer();
    }, []);

    const loadData = useCallback(async () => {
        const data = await getSubjects();
        setSubjects(data || []);
    }, [refresh]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleAdd = async () => {
        if (!newSubName) return;
        const required = parseFloat(newSubRequired) || 75;
        await addSubject(newSubName, newSubCode, "#3B82F6", required);
        setModalVisible(false);
        setNewSubName("");
        setNewSubCode("");
        setNewSubRequired("75");
        setRefresh(prev => !prev);
    };

    const handleMark = async (id, status) => {
        // If marking as PRESENT, check disclaimer
        if (status === "PRESENT") {
            setPendingSubjectId(id);
            if (!disclaimerSeen) {
                setDisclaimerVisible(true);
            } else {
                // Skip disclaimer, go straight to camera
                handleDisclaimerAccept();
            }
            return;
        }

        // For ABSENT or CANCELLED, mark directly
        await markAttendance(id, status);
        setRefresh(prev => !prev);
    };

    const handleDisclaimerAccept = async () => {
        setDisclaimerVisible(false);
        setDisclaimerSeen(true);

        // Mark as seen persistently
        try {
            await AsyncStorage.setItem(DISCLAIMER_SHOWN_KEY, "true");
        } catch (e) {
            console.error("Error saving disclaimer state", e);
        }

        // Request camera permission
        if (!permission || !permission.granted) {
            const result = await requestPermission();
            if (!result.granted) {
                Alert.alert(
                    "Permission Required",
                    "Camera permission is required to verify attendance. Please enable it in app settings."
                );
                setPendingSubjectId(null);
                return;
            }
        }

        // Open camera
        setCameraVisible(true);
    };

    const handleCameraCapture = async () => {
        if (cameraRef.current && pendingSubjectId) {
            try {
                // Take photo (but don't save it)
                await cameraRef.current.takePictureAsync({ skipProcessing: true });

                // Close camera
                setCameraVisible(false);

                // Mark attendance
                await markAttendance(pendingSubjectId, "PRESENT");
                setRefresh(prev => !prev);
                setPendingSubjectId(null);
            } catch (error) {
                console.error("Camera error:", error);
                Alert.alert("Error", "Failed to capture photo. Please try again.");
            }
        }
    };

    const handleCameraCancel = () => {
        setCameraVisible(false);
        setPendingSubjectId(null);
    };

    const handleDelete = (id) => {
        Alert.alert("Delete Subject", "Are you sure?", [
            { text: "Cancel" },
            {
                text: "Delete", style: 'destructive', onPress: async () => {
                    await deleteSubject(id);
                    setRefresh(prev => !prev);
                }
            }
        ])
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.premiumHeader, { backgroundColor: colors.surface }]}>
                <View>
                    <Text style={[styles.premiumHeaderTitle, { color: colors.textPrimary }]}>Attendance</Text>
                    <Text style={[styles.premiumHeaderSub, { color: colors.textSecondary }]}>Keep track of your classes</Text>
                </View>
                <TouchableOpacity
                    style={[styles.addBtnContainer, { backgroundColor: colors.primary + "15" }]}
                    onPress={() => setModalVisible(true)}
                >
                    <Ionicons name="add" size={24} color={colors.primary} />
                </TouchableOpacity>
            </View>

            {subjects.length > 0 && (
                <View style={[styles.miniDashboard, { backgroundColor: colors.surface }]}>
                    <View style={styles.dashboardStat}>
                        <Text style={[styles.dashboardStatValue, { color: colors.primary }]}>
                            {calculateOverallStats(subjects).percentage}%
                        </Text>
                        <Text style={[styles.dashboardStatLabel, { color: colors.textTertiary }]}>Overall</Text>
                    </View>
                    <View style={[styles.statDivider, { backgroundColor: colors.borderLight }]} />
                    <View style={styles.dashboardStat}>
                        <Text style={[styles.dashboardStatValue, { color: colors.textPrimary }]}>
                            {calculateOverallStats(subjects).attended}/{calculateOverallStats(subjects).total}
                        </Text>
                        <Text style={[styles.dashboardStatLabel, { color: colors.textTertiary }]}>Total</Text>
                    </View>
                </View>
            )}

            <FlatList
                data={subjects}
                keyExtractor={item => item.id ? item.id.toString() : Math.random().toString()}
                renderItem={({ item }) => (
                    <SubjectCard
                        subject={item}
                        onMark={handleMark}
                        onDelete={handleDelete}
                    />
                )}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={{ color: colors.textTertiary }}>No subjects added yet.</Text>
                    </View>
                }
            />

            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                        <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Add Subject</Text>

                        <TextInput
                            placeholder="Subject Name (e.g. Maths)"
                            placeholderTextColor={colors.textTertiary}
                            style={[styles.input, { color: colors.textPrimary, borderColor: colors.border }]}
                            value={newSubName}
                            onChangeText={setNewSubName}
                        />

                        <TextInput
                            placeholder="Subject Code (Optional)"
                            placeholderTextColor={colors.textTertiary}
                            style={[styles.input, { color: colors.textPrimary, borderColor: colors.border }]}
                            value={newSubCode}
                            onChangeText={setNewSubCode}
                        />
                        <TextInput
                            placeholder="Required Percentage (default 75%)"
                            placeholderTextColor={colors.textTertiary}
                            keyboardType="numeric"
                            style={[styles.input, { color: colors.textPrimary, borderColor: colors.border }]}
                            value={newSubRequired}
                            onChangeText={setNewSubRequired}
                        />

                        <View style={styles.modalActions}>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalBtn}>
                                <Text style={{ color: colors.textSecondary }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleAdd} style={[styles.modalBtn, { backgroundColor: colors.primary }]}>
                                <Text style={{ color: '#FFF' }}>Add</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Disclaimer Modal */}
            <Modal visible={disclaimerVisible} transparent animationType="fade" onRequestClose={() => setDisclaimerVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.disclaimerContent, { backgroundColor: colors.surface }]}>
                        <Ionicons name="shield-checkmark-outline" size={48} color={colors.primary} />
                        <Text style={[styles.disclaimerTitle, { color: colors.textPrimary }]}>Privacy Notice</Text>
                        <Text style={[styles.disclaimerText, { color: colors.textSecondary }]}>We are not storing your image. It is just to authenticate that you are present in class.</Text>
                        <View style={styles.disclaimerButtons}>
                            <TouchableOpacity style={[styles.disclaimerBtn, { backgroundColor: colors.borderLight }]} onPress={() => { setDisclaimerVisible(false); setPendingSubjectId(null); }}>
                                <Text style={[styles.disclaimerBtnText, { color: colors.textPrimary }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.disclaimerBtn, { backgroundColor: colors.primary }]} onPress={handleDisclaimerAccept}>
                                <Text style={[styles.disclaimerBtnText, { color: colors.white }]}>OK, Continue</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Camera Modal */}
            <Modal visible={cameraVisible} animationType="slide" onRequestClose={handleCameraCancel}>
                <View style={styles.cameraContainer}>
                    <CameraView style={styles.camera} facing="front" ref={cameraRef}>
                        <View style={styles.cameraOverlay}>
                            <TouchableOpacity style={[styles.cameraCloseBtn, { backgroundColor: colors.error }]} onPress={handleCameraCancel}>
                                <Ionicons name="close" size={24} color={colors.white} />
                            </TouchableOpacity>
                            <View style={styles.cameraBottomBar}>
                                <Text style={[styles.cameraInstruction, { color: colors.white }]}>Take a photo to verify attendance</Text>
                                <TouchableOpacity style={[styles.captureBtn, { borderColor: colors.white }]} onPress={handleCameraCapture}>
                                    <View style={[styles.captureBtnInner, { backgroundColor: colors.white }]} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </CameraView>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    premiumHeader: {
        paddingTop: 20,
        paddingBottom: 16,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    premiumHeaderTitle: {
        fontSize: 22,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    premiumHeaderSub: {
        fontSize: 13,
        fontWeight: '500',
        marginTop: 2,
    },
    addBtnContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    miniDashboard: {
        flexDirection: 'row',
        paddingVertical: 12,
        marginHorizontal: 20,
        marginTop: 16,
        borderRadius: 12,
        elevation: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    dashboardStat: {
        flex: 1,
        alignItems: 'center',
    },
    dashboardStatValue: {
        fontSize: 18,
        fontWeight: '800',
    },
    dashboardStatLabel: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        height: '60%',
        alignSelf: 'center',
    },
    list: {
        padding: 20,
        paddingBottom: 100,
    },
    compactCard: {
        borderRadius: 16,
        padding: 14,
        marginBottom: 12,
        borderWidth: 1,
        elevation: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    cardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    subjectInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 10,
    },
    colorIndicator: {
        width: 4,
        height: 32,
        borderRadius: 2,
    },
    subjectNameCompact: {
        fontSize: 16,
        fontWeight: '700',
    },
    subjectMeta: {
        fontSize: 12,
        fontWeight: '500',
        marginTop: 1,
    },
    cardHeaderActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    predictionRow: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    predictionBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
        flexShrink: 1,
    },
    predictionText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    deleteBtn: {
        padding: 4,
    },
    progressBarCompact: {
        height: 6,
        borderRadius: 3,
        marginBottom: 12,
        width: '100%',
        overflow: 'hidden',
    },
    compactActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    miniActionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        borderRadius: 8,
        gap: 4,
    },
    miniActionText: {
        fontWeight: '700',
        fontSize: 12,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    colorDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    subjectName: {
        fontSize: 20,
        fontWeight: '700',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    percent: {
        fontSize: 48,
        fontWeight: '800',
        lineHeight: 52,
    },
    statLabel: {
        fontSize: 14,
        fontWeight: '500',
        marginTop: 2,
    },
    progressBarBg: {
        height: 6,
        borderRadius: 3,
        marginTop: 12,
        width: '100%',
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    statusContainer: {
        alignItems: 'flex-end',
        flex: 1,
        marginLeft: 12,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'right',
    },
    divider: {
        height: 1,
        marginBottom: 16,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 10,
        gap: 6,
    },
    actionText: {
        fontWeight: '700',
        fontSize: 14,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        padding: 24,
        borderRadius: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 16,
        marginTop: 8,
    },
    modalBtn: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    empty: {
        alignItems: 'center',
        marginTop: 40,
    },
    // Disclaimer modal styles
    disclaimerContent: {
        padding: 30,
        borderRadius: 16,
        alignItems: 'center',
        maxWidth: 340,
        width: '90%',
        gap: 16,
        alignSelf: 'center',
    },
    disclaimerTitle: {
        fontSize: 22,
        fontWeight: '700',
        textAlign: 'center',
    },
    disclaimerText: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
    },
    disclaimerButtons: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
        marginTop: 8,
    },
    disclaimerBtn: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    disclaimerBtnText: {
        fontSize: 15,
        fontWeight: '600',
    },
    // Camera modal styles
    cameraContainer: {
        flex: 1,
        backgroundColor: '#000',
    },
    camera: {
        flex: 1,
    },
    cameraOverlay: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    cameraCloseBtn: {
        position: 'absolute',
        top: 50,
        right: 20,
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    cameraBottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: 50,
        paddingTop: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        gap: 20,
    },
    cameraInstruction: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    captureBtn: {
        width: 70,
        height: 70,
        borderRadius: 35,
        borderWidth: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureBtnInner: {
        width: 56,
        height: 56,
        borderRadius: 28,
    },
});
