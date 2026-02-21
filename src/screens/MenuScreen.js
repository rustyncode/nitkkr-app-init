import React from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { spacing, typography } from "../theme/spacing";
import config from "../constants/config";

const { width } = Dimensions.get("window");
const COLUMN_WIDTH = (width - spacing.screenHorizontal * 2 - spacing.md) / 2;

function MenuCard({ icon, title, subtitle, onPress, color, bgColor }) {
    const { colors } = useTheme();

    return (
        <TouchableOpacity
            style={[
                styles.card,
                { backgroundColor: colors.surface, borderColor: colors.borderLight }
            ]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={[styles.iconCircle, { backgroundColor: bgColor || colors.primary + "15" }]}>
                <Ionicons name={icon} size={24} color={color || colors.primary} />
            </View>
            <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{title}</Text>
                <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]} numberOfLines={2}>
                    {subtitle}
                </Text>
            </View>
            <View style={styles.cardFooter}>
                <Ionicons name="arrow-forward-circle" size={20} color={color || colors.primary} />
            </View>
        </TouchableOpacity>
    );
}

function ProfileCard({ user, colors, onPress }) {
    return (
        <TouchableOpacity
            style={[styles.profileCard, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
            onPress={onPress}
            activeOpacity={0.9}
        >
            <View style={styles.profileInfo}>
                <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>
                        {user?.name?.charAt(0) || user?.roll_number?.charAt(0) || "S"}
                    </Text>
                </View>
                <View style={styles.profileTextContainer}>
                    <Text style={styles.userName}>{user?.name || "Student"}</Text>
                    <Text style={styles.userRoll}>{user?.roll_number}</Text>
                </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="white" opacity={0.8} />
        </TouchableOpacity>
    );
}

export default function MenuScreen({ navigation }) {
    const { colors, isDark } = useTheme();
    const { user } = useAuth(); // Import useAuth to get user data

    const menuItems = [
        {
            id: "bookmarks",
            title: "Saved Items",
            subtitle: "Papers & Jobs you bookmarked",
            icon: "bookmark",
            color: colors.featureTeal,
            bgColor: colors.featureTealBg,
            target: "Bookmarks"
        },
        {
            id: "notes",
            title: "Notes & Material",
            subtitle: "Study resources & shared notes",
            icon: "library",
            color: colors.featurePurple,
            bgColor: colors.featurePurpleBg,
            target: "Notes"
        },
        {
            id: "settings",
            title: "App Settings",
            subtitle: "Theme, cache & configurations",
            icon: "settings",
            color: colors.featureBlue,
            bgColor: colors.featureBlueBg,
            target: "Settings"
        },
        {
            id: "about",
            title: "About App",
            subtitle: "Version, credits & useful links",
            icon: "information-circle",
            color: colors.featureOrange,
            bgColor: colors.featureOrangeBg,
            target: "About" // We can handle this in Settings or a new screen
        }
    ];

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: colors.background }]}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.textPrimary }]}>Explore Menu</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    Access all features from one place
                </Text>
            </View>

            <ProfileCard
                user={user}
                colors={colors}
                onPress={() => navigation.navigate("Profile")}
            />

            <View style={styles.grid}>
                {menuItems.map((item) => (
                    <MenuCard
                        key={item.id}
                        title={item.title}
                        subtitle={item.subtitle}
                        icon={item.icon}
                        color={item.color}
                        bgColor={item.bgColor}
                        onPress={() => navigation.navigate(item.target)}
                    />
                ))}
            </View>

            <View style={[styles.infoSection, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                <View style={styles.infoRow}>
                    <Ionicons name="git-branch-outline" size={18} color={colors.textTertiary} />
                    <Text style={[styles.infoText, { color: colors.textSecondary }]}>Version {config.APP_VERSION}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="code-working-outline" size={18} color={colors.textTertiary} />
                    <Text style={[styles.infoText, { color: colors.textSecondary }]}>Built for NIT KKR</Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        paddingBottom: 100, // Account for bottom tab
    },
    header: {
        paddingHorizontal: spacing.screenHorizontal,
        paddingTop: spacing.xxl,
        paddingBottom: spacing.lg,
    },
    title: {
        fontSize: typography.fontSize.xxl,
        fontWeight: typography.fontWeight.bold,
    },
    subtitle: {
        fontSize: typography.fontSize.md,
        marginTop: 4,
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        paddingHorizontal: spacing.screenHorizontal,
        gap: spacing.md,
    },
    card: {
        width: COLUMN_WIDTH,
        borderRadius: 24,
        padding: spacing.lg,
        paddingBottom: spacing.md,
        borderWidth: 1,
        elevation: 4,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        marginBottom: spacing.xs,
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: spacing.md,
    },
    cardContent: {
        flex: 1,
        marginBottom: spacing.md,
    },
    cardTitle: {
        fontSize: typography.fontSize.md,
        fontWeight: typography.fontWeight.bold,
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: typography.fontSize.xs,
        lineHeight: 16,
    },
    cardFooter: {
        alignItems: "flex-end",
    },
    infoSection: {
        marginTop: spacing.xl,
        marginHorizontal: spacing.screenHorizontal,
        borderRadius: 20,
        padding: spacing.lg,
        borderWidth: 1,
        gap: spacing.sm,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    infoText: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
    },
    profileCard: {
        marginHorizontal: spacing.screenHorizontal,
        padding: spacing.lg,
        borderRadius: 24,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: spacing.xl,
        elevation: 12,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
    },
    profileInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
    },
    avatarPlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "rgba(255, 255, 255, 0.25)",
        alignItems: "center",
        justifyContent: "center",
    },
    avatarText: {
        fontSize: 20,
        fontWeight: "bold",
        color: "white",
    },
    profileTextContainer: {
        gap: 2,
    },
    userName: {
        fontSize: 18,
        fontWeight: "bold",
        color: "white",
    },
    userRoll: {
        fontSize: 14,
        color: "rgba(255, 255, 255, 0.8)",
        fontWeight: "600",
    },
});
