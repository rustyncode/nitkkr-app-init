import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { getAllBookmarks, toggleBookmark } from "../services/bookmarkService";
import PaperCard from "../components/papers/PaperCard";
import JobCard from "../components/jobs/JobCard";

export default function BookmarksScreen() {
    const { colors } = useTheme();
    const navigation = useNavigation();
    const [activeTab, setActiveTab] = useState("papers");
    const [bookmarks, setBookmarks] = useState({ papers: [], jobs: [] });
    const [loading, setLoading] = useState(true);

    const loadBookmarks = async () => {
        setLoading(true);
        const data = await getAllBookmarks();
        setBookmarks(data);
        setLoading(false);
    };

    // Re-load bookmarks when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            loadBookmarks();
        }, [])
    );

    const handleToggle = async (type, item) => {
        await toggleBookmark(type, item);
        await loadBookmarks(); // Refresh
    };

    const renderEmpty = () => (
        <View style={styles.empty}>
            <Ionicons name="bookmark-outline" size={64} color={colors.textTertiary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No saved {activeTab} yet.
            </Text>
            <Text style={[styles.emptySub, { color: colors.textTertiary }]}>
                Items you bookmark will appear here.
            </Text>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { backgroundColor: colors.surface }]}>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Saved Items</Text>
            </View>

            <View style={[styles.tabs, { backgroundColor: colors.surface }]}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === "papers" && { borderBottomColor: colors.primary, borderBottomWidth: 3 }]}
                    onPress={() => setActiveTab("papers")}
                >
                    <Text style={[styles.tabText, { color: activeTab === "papers" ? colors.primary : colors.textSecondary }]}>Papers</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === "jobs" && { borderBottomColor: colors.primary, borderBottomWidth: 3 }]}
                    onPress={() => setActiveTab("jobs")}
                >
                    <Text style={[styles.tabText, { color: activeTab === "jobs" ? colors.primary : colors.textSecondary }]}>Jobs</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={bookmarks[activeTab]}
                    keyExtractor={(item) => (item.id || Math.random()).toString()}
                    renderItem={({ item, index }) => activeTab === "papers" ? (
                        <PaperCard paper={item} index={index} />
                    ) : (
                        <JobCard job={item} />
                    )}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Ionicons name="bookmark-outline" size={64} color={colors.textTertiary} />
                            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                                No saved {activeTab} yet.
                            </Text>
                            <Text style={[styles.emptySub, { color: colors.textTertiary }]}>
                                Items you bookmark will appear here.
                            </Text>
                        </View>
                    }
                />
            )}
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
        elevation: 2,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "bold",
    },
    tabs: {
        flexDirection: "row",
        height: 50,
    },
    tab: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    tabText: {
        fontSize: 16,
        fontWeight: "600",
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
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    titleInfo: {
        flex: 1,
        marginRight: 10,
    },
    subjectCode: {
        fontSize: 12,
        fontWeight: "700",
        marginBottom: 2,
    },
    subjectName: {
        fontSize: 17,
        fontWeight: "600",
    },
    company: {
        fontSize: 12,
        fontWeight: "700",
        marginBottom: 2,
    },
    jobTitle: {
        fontSize: 17,
        fontWeight: "600",
    },
    cardFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 4,
    },
    metaText: {
        fontSize: 13,
    },
    viewBtn: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    viewBtnText: {
        fontSize: 12,
        fontWeight: "700",
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    empty: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 100,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: "700",
        marginTop: 16,
    },
    emptySub: {
        fontSize: 14,
        marginTop: 8,
        textAlign: "center",
    },
});
