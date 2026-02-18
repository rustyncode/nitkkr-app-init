import React, { useEffect, useState, useRef } from "react";
import { View, Text, Image, StyleSheet, Animated, Dimensions, Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import { checkForNewNotifications } from "../utils/notificationTracker";
import Constants from "expo-constants";
import config from "../constants/config";

const { width, height } = Dimensions.get("window");

export default function SplashScreen({ onFinish, onReady }) {
    // Animation Values
    const fadeAnim = useRef(new Animated.Value(1)).current;
    // bgAnim: 0 = White (matching app.json), 1 = Brand Blue
    const bgAnim = useRef(new Animated.Value(0)).current;
    const contentMoveAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const textFadeAnim = useRef(new Animated.Value(0)).current;
    const progressWidth = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Step 1: Hide native splash IMMEDIATELY
        // Because our JS splash starts WHITE, the transition is invisible to the user.
        if (onReady) {
            onReady();
        }

        // Step 2: Start the "Morph" animation after a small breathing room
        Animated.sequence([
            Animated.delay(200),
            Animated.parallel([
                // Morph background from White to Blue
                Animated.timing(bgAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: false, // Background color needs false
                }),
                // Move logo up to make room for text
                Animated.timing(contentMoveAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                // Reveal other branding elements
                Animated.timing(textFadeAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ]).start();

        // Slow breathing for logo
        const breathing = Animated.loop(
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 1.05,
                    duration: 2500,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 2500,
                    useNativeDriver: true,
                }),
            ])
        );
        breathing.start();

        // Progress loader
        Animated.loop(
            Animated.sequence([
                Animated.timing(progressWidth, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: false,
                }),
                Animated.timing(progressWidth, {
                    toValue: 0,
                    duration: 0,
                    useNativeDriver: false,
                })
            ])
        ).start();

        const initApp = async () => {
            // Keep splash visible during sync and for brand recognition
            const minTimePromise = new Promise((resolve) => setTimeout(resolve, 4000));
            const checkPromise = (async () => {
                try {
                    await checkForNewNotifications();
                } catch (e) {
                    console.warn("[Splash] Sync failed", e);
                }
            })();

            await Promise.all([minTimePromise, checkPromise]);

            // Final graceful exit
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }).start(() => {
                onFinish();
            });
        };

        initApp();
        return () => breathing.stop();
    }, []);

    // Color Interpolations
    const backgroundColor = bgAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["#FFFFFF", "#141D52"]
    });

    const logoTranslateY = contentMoveAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -60],
    });

    return (
        <Animated.View style={[styles.container, { backgroundColor, opacity: fadeAnim }]}>
            <StatusBar style={bgAnim === 0 ? "dark" : "light"} />

            <Animated.View style={styles.content}>
                <Animated.View
                    style={[
                        styles.logoWrapper,
                        {
                            transform: [
                                { translateY: logoTranslateY },
                                { scale: scaleAnim }
                            ],
                        }
                    ]}
                >
                    <View style={styles.logoContainer}>
                        <Image
                            source={require("../../assets/splash-icon.png")}
                            style={styles.logo}
                            resizeMode="cover"
                        />
                    </View>
                </Animated.View>

                <Animated.View
                    style={[
                        styles.textContainer,
                        {
                            opacity: textFadeAnim,
                            transform: [{
                                translateY: contentMoveAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [40, 0]
                                })
                            }]
                        }
                    ]}
                >
                    <Text style={styles.brandName}>RustiNet</Text>
                    <View style={styles.taglineRow}>
                        <View style={styles.line} />
                        <Text style={styles.tagline}>STUDENT HUB • NIT KKR</Text>
                        <View style={styles.line} />
                    </View>

                    <View style={styles.loaderContainer}>
                        <View style={styles.loaderTrack}>
                            <Animated.View
                                style={[
                                    styles.loaderFill,
                                    {
                                        width: progressWidth.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: ["0%", "100%"]
                                        })
                                    }
                                ]}
                            />
                        </View>
                        <Text style={styles.loadingText}>Synchronizing your campus life...</Text>
                    </View>
                </Animated.View>
            </Animated.View>

            <Animated.View style={[styles.footer, { opacity: textFadeAnim }]}>
                <Text style={styles.footerText}>POWERED BY TEAM RUSTYN</Text>
                <Text style={styles.version}>v{config.APP_VERSION}</Text>
            </Animated.View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    content: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
    },
    logoWrapper: {
        alignItems: "center",
        justifyContent: "center",
    },
    logoContainer: {
        width: 154,
        height: 154,
        borderRadius: 77, // Force circular mask
        overflow: "hidden",
        backgroundColor: "#141D52", // Matches target blue to hide internal image edges
        elevation: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    logo: {
        width: "100%",
        height: "100%",
    },
    textContainer: {
        alignItems: "center",
        marginTop: 20,
    },
    brandName: {
        fontSize: 42,
        fontWeight: "900",
        color: "#FFFFFF",
        letterSpacing: -0.5,
        marginBottom: 4,
    },
    taglineRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    tagline: {
        fontSize: 11,
        fontWeight: "700",
        color: "rgba(255,255,255,0.6)",
        letterSpacing: 2,
    },
    line: {
        height: 1,
        width: 15,
        backgroundColor: "rgba(255,255,255,0.2)",
    },
    loaderContainer: {
        marginTop: 60,
        alignItems: "center",
        width: "100%",
    },
    loaderTrack: {
        height: 3,
        width: 140,
        backgroundColor: "rgba(255,255,255,0.1)",
        borderRadius: 2,
        overflow: "hidden",
        marginBottom: 10,
    },
    loaderFill: {
        height: "100%",
        backgroundColor: "#F59E0B",
        borderRadius: 2,
    },
    loadingText: {
        color: "rgba(255,255,255,0.4)",
        fontSize: 9,
        fontWeight: "700",
        letterSpacing: 1,
        textTransform: "uppercase",
    },
    footer: {
        position: "absolute",
        bottom: 10, // Avoid safe area issues at bottom
        alignItems: "center",
    },
    footerText: {
        color: "rgba(255,255,255,0.25)",
        fontSize: 10,
        fontWeight: "800",
        letterSpacing: 1.5,
        marginBottom: 4,
    },
    version: {
        color: "rgba(255,255,255,0.15)",
        fontSize: 11,
        fontWeight: "700",
    },
});
