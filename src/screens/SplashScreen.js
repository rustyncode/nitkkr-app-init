import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, Animated, Dimensions } from "react-native";
import { StatusBar } from "expo-status-bar";
import { checkForNewNotifications } from "../utils/notificationTracker";
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
                        source={require("../../assets/splash-icon.png")}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>

                <Text style={styles.title}>RustiNet</Text>
                <Text style={styles.subtitle}>Student Hub for NIT KKR</Text>

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
        width: 180,
        height: 180,
        borderRadius: 90,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 30,
        overflow: 'hidden',
    },
    logo: {
        width: 180,
        height: 180,
        borderRadius: 90,
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
