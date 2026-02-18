import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    Linking,
    TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { spacing, typography } from "../../theme/spacing";
import { useTheme } from "../../context/ThemeContext";
import { toggleBookmark, isBookmarked } from "../../services/bookmarkService";

const JobCard = ({ job }) => {
    const { colors, isDark } = useTheme();

    // Highlight partner companies (MNCs)
    const isPartner = ["Google", "Microsoft", "Amazon", "Atlassian", "Flipkart", "PhonePe"].includes(job.company);

    const [bookmarked, setBookmarked] = useState(false);

    useEffect(() => {
        const check = async () => {
            setBookmarked(await isBookmarked("jobs", job.id));
        };
        check();
    }, [job.id]);

    const handleToggle = async () => {
        const added = await toggleBookmark("jobs", job);
        setBookmarked(added);
    };

    return (
        <TouchableOpacity
            style={[
                styles.jobCard,
                {
                    backgroundColor: isDark ? "rgba(30, 30, 30, 0.7)" : colors.surface,
                    borderColor: isPartner ? colors.primary + "60" : colors.borderLight,
                    borderWidth: isPartner ? 1.5 : 1,
                },
                isPartner && styles.partnerCard
            ]}
            activeOpacity={0.8}
            onPress={() => job.link && Linking.openURL(job.link).catch(() => { })}
        >
            {isPartner && (
                <View style={[styles.partnerTag, { backgroundColor: colors.primary }]}>
                    <Ionicons name="sparkles" size={10} color="#FFF" />
                    <Text style={styles.partnerTagText}>PREMIUM</Text>
                </View>
            )}

            <View style={styles.jobCardTop}>
                <View style={[styles.jobIconBgSmall, {
                    backgroundColor: isPartner ? colors.primary + "20" : isDark ? "rgba(255,255,255,0.05)" : colors.primarySoft
                }]}>
                    <Ionicons name={isPartner ? "pulse" : "briefcase-outline"} size={24} color={isPartner ? colors.primary : colors.textSecondary} />
                </View>
                <View style={styles.jobInfo}>
                    <Text style={[styles.jobTitle, { color: colors.textPrimary }]} numberOfLines={1}>{job.title}</Text>
                    <Text style={[styles.jobCompany, { color: colors.textSecondary }]}>{job.company}</Text>
                </View>
                <TouchableOpacity onPress={handleToggle} style={{ padding: 4 }}>
                    <Ionicons
                        name={bookmarked ? "bookmark" : "bookmark-outline"}
                        size={22}
                        color={bookmarked ? colors.primary : colors.textTertiary}
                    />
                </TouchableOpacity>
                <View style={[styles.jobTypeBadge, { backgroundColor: isPartner ? colors.primary + "20" : isDark ? "rgba(255,255,255,0.1)" : colors.primary + '10' }]}>
                    <Text style={[styles.jobTypeText, { color: colors.primary }]}>{job.type}</Text>
                </View>
            </View>

            <View style={[styles.jobCardDetails, { borderTopColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }]}>
                <View style={styles.detailItem}>
                    <Ionicons name="location-outline" size={14} color={colors.textTertiary} />
                    <Text style={[styles.detailText, { color: colors.textTertiary }]}>{job.location}</Text>
                </View>
                <View style={styles.detailItem}>
                    <Ionicons name="cash-outline" size={14} color={colors.featureGreen || "#4CAF50"} />
                    <Text style={[styles.detailText, { color: isDark ? colors.featureGreen : colors.textPrimary, fontWeight: '700' }]}>{job.stipend || "Best in Industry"}</Text>
                </View>
                <View style={styles.detailItem}>
                    <Ionicons name="calendar-outline" size={14} color={colors.textTertiary} />
                    <Text style={[styles.detailText, { color: colors.textTertiary }]}>{job.deadline}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    jobCard: {
        borderRadius: spacing.cardRadius,
        borderWidth: 1,
        padding: spacing.lg,
        marginBottom: spacing.md,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    jobCardTop: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: spacing.md,
    },
    jobIconBgSmall: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        marginRight: spacing.md,
    },
    jobInfo: {
        flex: 1,
    },
    jobTitle: {
        fontSize: typography.fontSize.md + 1,
        fontWeight: typography.fontWeight.bold,
        marginBottom: 2,
    },
    jobCompany: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
    },
    jobTypeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    jobTypeText: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.bold,
        textTransform: "uppercase",
    },
    jobCardDetails: {
        flexDirection: "row",
        justifyContent: "space-between",
        borderTopWidth: 1,
        paddingTop: spacing.md,
    },
    detailItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    detailText: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.medium,
    },
    partnerCard: {
        shadowColor: "#FF4500",
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 8,
    },
    partnerTag: {
        position: "absolute",
        top: -10,
        right: 15,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        zIndex: 10,
        elevation: 4,
    },
    partnerTagText: {
        color: "#FFF",
        fontSize: 9,
        fontWeight: typography.fontWeight.black,
        letterSpacing: 1,
    },
});

export default JobCard;
