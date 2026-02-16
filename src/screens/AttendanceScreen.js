import React, { useState, useEffect, useCallback } from "react";
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
        await markAttendance(id, status);
        setRefresh(prev => !prev);
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
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
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
        fontSize: 18,
        fontWeight: '600',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    percent: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    statusContainer: {
        alignItems: 'flex-end',
    },
    divider: {
        height: 1,
        marginBottom: 12,
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
        paddingVertical: 8,
        borderRadius: 8,
        gap: 4,
    },
    actionText: {
        fontWeight: '600',
        fontSize: 12,
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
    }
});
