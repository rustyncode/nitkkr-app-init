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

const DISCLAIMER_SHOWN_KEY = "@attendance_disclaimer_shown";

// Initialize DB on file load
try {
    initDB();
} catch (e) {
    console.warn("DB Init error", e);
}

function SubjectCard({ subject, onMark, onDelete }) {
    const { colors } = useTheme();

    const percentage = subject.total_classes === 0
        ? 100
        : ((subject.attended_classes / subject.total_classes) * 100).toFixed(1);

    const isLow = parseFloat(percentage) < subject.required_percentage;

    let statusText = "";
    if (subject.total_classes > 0) {
        if (parseFloat(percentage) > subject.required_percentage) {
            const bunks = Math.floor((subject.attended_classes / (subject.required_percentage / 100)) - subject.total_classes);
            if (bunks > 0) statusText = `You can bunk ${bunks} class(es)`;
            else statusText = "On track";
        } else {
            const req = subject.required_percentage / 100;
            const needed = Math.ceil((req * subject.total_classes - subject.attended_classes) / (1 - req));
            if (needed > 0) statusText = `Attend next ${needed} class(es)`;
            else statusText = "Low attendance";
        }
    } else {
        statusText = "No classes yet";
    }

    return (
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
            <View style={styles.cardHeader}>
                <View style={styles.titleRow}>
                    <View style={[styles.colorDot, { backgroundColor: subject.color_code || colors.primary }]} />
                    <Text style={[styles.subjectName, { color: colors.textPrimary }]}>{subject.name}</Text>
                </View>
                <TouchableOpacity onPress={() => onDelete(subject.id)}>
                    <Ionicons name="trash-outline" size={18} color={colors.textTertiary} />
                </TouchableOpacity>
            </View>

            <View style={styles.statsRow}>
                <View>
                    <Text style={[styles.percent, { color: isLow ? colors.error : colors.success }]}>
                        {percentage}%
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                        {subject.attended_classes}/{subject.total_classes} Present
                    </Text>
                </View>
                <View style={styles.statusContainer}>
                    <Text style={[styles.statusText, { color: colors.textSecondary }]}>{statusText}</Text>
                </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: colors.success + "20" }]}
                    onPress={() => onMark(subject.id, "PRESENT")}
                >
                    <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                    <Text style={[styles.actionText, { color: colors.success }]}>Present</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: colors.error + "20" }]}
                    onPress={() => onMark(subject.id, "ABSENT")}
                >
                    <Ionicons name="close-circle" size={20} color={colors.error} />
                    <Text style={[styles.actionText, { color: colors.error }]}>Absent</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: colors.textTertiary + "20" }]}
                    onPress={() => onMark(subject.id, "CANCELLED")}
                >
                    <Ionicons name="remove-circle" size={20} color={colors.textSecondary} />
                    <Text style={[styles.actionText, { color: colors.textSecondary }]}>Off</Text>
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
        await addSubject(newSubName, newSubCode);
        setModalVisible(false);
        setNewSubName("");
        setNewSubCode("");
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
            <View style={[styles.header, { backgroundColor: colors.surface }]}>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Attendance Manager</Text>
                <TouchableOpacity onPress={() => setModalVisible(true)}>
                    <Ionicons name="add-circle" size={32} color={colors.primary} />
                </TouchableOpacity>
            </View>

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
    header: {
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 2,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    list: {
        padding: 20,
        paddingBottom: 100,
    },
    card: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
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
