import React from "react";
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { spacing, typography } from "../theme/spacing";

export default function AboutScreen() {
    const { colors, isDark } = useTheme();

    const openLink = (url) => {
        Linking.openURL(url).catch(() => {
            Alert.alert("Error", "Could not open link.");
        });
    };

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: colors.background }]}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
        >
            {/* ─── Hero Section ─────────────────────────────────── */}
            <View style={styles.header}>
                <View style={[styles.logoContainer, { backgroundColor: isDark ? colors.surface : colors.primary + "10", shadowColor: colors.primary }]}>
                    <Image
                        source={require("../../assets/icon.png")}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>
                <Text style={[styles.appName, { color: colors.textPrimary }]}>RustiNet</Text>
                <Text style={[styles.version, { color: colors.textTertiary }]}>VERSION 1.2.5 • STABLE</Text>
            </View>

            {/* ─── Mission Card ──────────────────────────────────── */}
            <View style={[styles.modernCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                <View style={styles.cardHeader}>
                    <View style={[styles.iconBox, { backgroundColor: colors.primary + "15" }]}>
                        <Ionicons name="sparkles" size={18} color={colors.primary} />
                    </View>
                    <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Our Mission</Text>
                </View>
                <Text style={[styles.cardText, { color: colors.textSecondary }]}>
                    Built for the students of NIT Kurukshetra, RustiNet is a unified digital companion designed to bridge the gap between academic life and career aspirations. We focus on simplicity, utility, and a premium experience.
                </Text>
            </View>

            {/* ─── Community Card ────────────────────────────────── */}
            <View style={[styles.modernCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                <View style={styles.cardHeader}>
                    <View style={[styles.iconBox, { backgroundColor: colors.secondary + "15" }]}>
                        <Ionicons name="people" size={18} color={colors.secondary} />
                    </View>
                    <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Team Rustyn</Text>
                </View>
                <View style={styles.teamList}>
                    <TeamMember name="Rustyn" role="Lead Developer & Designer" colors={colors} />
                    <TeamMember name="NIT KKR Community" role="Open Source Contributors" colors={colors} />
                </View>
            </View>

            {/* ─── Socials Card ──────────────────────────────────── */}
            <View style={[styles.modernCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                <View style={styles.cardHeader}>
                    <View style={[styles.iconBox, { backgroundColor: colors.featureTeal + "15" }]}>
                        <Ionicons name="link" size={18} color={colors.featureTeal} />
                    </View>
                    <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Connect</Text>
                </View>
                <View style={styles.socialGrid}>
                    <SocialBtn
                        icon="logo-github"
                        label="GitHub"
                        onPress={() => openLink("https://github.com/rustyn-app")}
                        colors={colors}
                    />
                    <SocialBtn
                        icon="mail-outline"
                        label="Support"
                        onPress={() => openLink("mailto:support@rustinet.com")}
                        colors={colors}
                    />
                    <SocialBtn
                        icon="globe-outline"
                        label="Website"
                        onPress={() => openLink("https://rustinet.com")}
                        colors={colors}
                    />
                </View>
            </View>

            <View style={styles.footerContainer}>
                <Text style={[styles.footerText, { color: colors.textTertiary }]}>
                    Made with pride for NIT Kurukshetra
                </Text>
                <Text style={[styles.copyright, { color: colors.textTertiary }]}>
                    © {new Date().getFullYear()} Rustyn Team
                </Text>
            </View>
        </ScrollView>
    );
}

function TeamMember({ name, role, colors }) {
    return (
        <View style={styles.memberRow}>
            <View style={[styles.memberAvatar, { backgroundColor: colors.primary + "10" }]}>
                <Text style={[styles.avatarText, { color: colors.primary }]}>{name.charAt(0)}</Text>
            </View>
            <View style={styles.memberInfo}>
                <Text style={[styles.memberName, { color: colors.textPrimary }]}>{name}</Text>
                <Text style={[styles.memberRole, { color: colors.textSecondary }]}>{role}</Text>
            </View>
        </View>
    );
}

function SocialBtn({ icon, label, onPress, colors }) {
    return (
        <TouchableOpacity
            style={[styles.socialBtn, { backgroundColor: colors.background, borderColor: colors.borderLight }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Ionicons name={icon} size={18} color={colors.primary} />
            <Text style={[styles.socialLabel, { color: colors.textPrimary }]}>{label}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        padding: spacing.xl,
        paddingBottom: spacing.massive,
    },
    header: {
        alignItems: "center",
        marginBottom: spacing.xxl,
        marginTop: spacing.lg,
    },
    logoContainer: {
        width: 110,
        height: 110,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: spacing.md,
        elevation: 12,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
    },
    logo: {
        width: 76,
        height: 76,
    },
    appName: {
        fontSize: 32,
        fontWeight: "900",
        letterSpacing: -1,
    },
    version: {
        fontSize: 10,
        fontWeight: "800",
        marginTop: 6,
        letterSpacing: 1.5,
    },
    modernCard: {
        borderRadius: 24,
        padding: 20,
        marginBottom: spacing.lg,
        borderWidth: 1,
        elevation: 2,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginBottom: 16,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: "800",
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    cardText: {
        fontSize: 15,
        lineHeight: 24,
        fontWeight: "500",
        opacity: 0.9,
    },
    teamList: {
        gap: 20,
    },
    memberRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
    },
    memberAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: "center",
        alignItems: "center",
    },
    avatarText: {
        fontSize: 20,
        fontWeight: "900",
    },
    memberInfo: {
        flex: 1,
    },
    memberName: {
        fontSize: 17,
        fontWeight: "700",
    },
    memberRole: {
        fontSize: 13,
        fontWeight: "500",
        marginTop: 1,
    },
    socialGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    socialBtn: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 16,
        borderWidth: 1,
        gap: 8,
        minWidth: '45%',
    },
    socialLabel: {
        fontSize: 14,
        fontWeight: "700",
    },
    footerContainer: {
        alignItems: "center",
        marginTop: spacing.massive,
        paddingBottom: spacing.xl,
    },
    footerText: {
        fontSize: 13,
        fontWeight: "600",
        opacity: 0.7,
    },
    copyright: {
        fontSize: 11,
        fontWeight: "700",
        marginTop: 6,
        opacity: 0.5,
        letterSpacing: 0.5,
    },
});
