import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, Animated, Dimensions } from "react-native";
import { StatusBar } from "expo-status-bar";
import { checkForNewNotifications } from "../utils/notificationTracker";
import { colors } from "../theme"; // We will use static colors here for now until context is fully integrated
import Constants from "expo-constants";

const { width } = Dimensions.get("window");

export default function SplashScreen({ onFinish }) {
    const [fadeAnim] = useState(new Animated.Value(0));
    const [scaleAnim] = useState(new Animated.Value(0.8));

    useEffect(() => {
        // Start animations
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 6,
                tension: 40,
                useNativeDriver: true,
            }),
        ]).start();

        const initApp = async () => {
            const minTimePromise = new Promise((resolve) => setTimeout(resolve, 2500));

            // Run the checks
            const checkPromise = (async () => {
                try {
                    console.log("[Splash] Checking capabilities...");
                    await checkForNewNotifications();
                } catch (e) {
                    console.warn("[Splash] Check failed", e);
                }
            })();

            await Promise.all([minTimePromise, checkPromise]);

            // Fade out
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
            }).start(() => {
                onFinish();
            });
        };

        initApp();
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <Animated.View
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }],
                    },
                ]}
            >
                <View style={styles.logoContainer}>
                    <Image
                        source={require("../../assets/nitkkr-logo.png")}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>

                <Text style={styles.title}>NIT KKR PYQ</Text>
                <Text style={styles.subtitle}>Previous Year Questions & Notes</Text>

                <View style={styles.loaderContainer}>
                    <View style={styles.dot} />
                    <View style={[styles.dot, { opacity: 0.6 }]} />
                    <View style={[styles.dot, { opacity: 0.3 }]} />
                </View>
            </Animated.View>

            <View style={styles.footer}>
                <Text style={styles.version}>v{Constants.expoConfig?.version || "1.0.0"}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#141D52", // primaryDark
        alignItems: "center",
        justifyContent: "center",
    },
    content: {
        alignItems: "center",
        width: "100%",
        paddingHorizontal: 20,
    },
    logoContainer: {
        width: 160,
        height: 160,
        backgroundColor: "rgba(255,255,255,0.1)",
        borderRadius: 80,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 30,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.15)",
    },
    logo: {
        width: 100,
        height: 100,
    },
    title: {
        fontSize: 32,
        fontWeight: "800",
        color: "#FFFFFF",
        marginBottom: 8,
        textAlign: "center",
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: 16,
        color: "rgba(255,255,255,0.7)",
        textAlign: "center",
        maxWidth: "80%",
        lineHeight: 24,
    },
    loaderContainer: {
        flexDirection: "row",
        gap: 8,
        marginTop: 60,
        height: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#F59E0B", // Accent color
    },
    footer: {
        position: "absolute",
        bottom: 40,
        opacity: 0.5,
    },
    version: {
        color: "#FFFFFF",
        fontSize: 12,
    },
});
