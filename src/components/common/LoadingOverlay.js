import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";

export default function LoadingOverlay({ visible, message = "Loading..." }) {
    const { colors, isDark } = useTheme();
    const spinValue = useRef(new Animated.Value(0)).current;
    const fadeValue = useRef(new Animated.Value(0)).current;
    const widthValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            // Reset values
            spinValue.setValue(0);
            fadeValue.setValue(0);
            widthValue.setValue(0);

            // High-performance native animations
            Animated.parallel([
                Animated.timing(fadeValue, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.loop(
                    Animated.timing(spinValue, {
                        toValue: 1,
                        duration: 1500,
                        easing: Easing.linear,
                        useNativeDriver: true,
                    })
                ),
            ]).start();

            // JS-thread animation for layout properties (width)
            Animated.timing(widthValue, {
                toValue: 1,
                duration: 400,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: false,
            }).start();
        } else {
            Animated.timing(fadeValue, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "360deg"],
    });

    if (!visible && fadeValue._value === 0) return null;

    return (
        <Modal transparent visible={visible} animationType="none">
            <View style={styles.overlay}>
                <Animated.View
                    style={[
                        styles.container,
                        {
                            backgroundColor: isDark ? "rgba(30, 30, 30, 0.9)" : "rgba(255, 255, 255, 0.9)",
                            opacity: fadeValue,
                            transform: [
                                {
                                    scale: fadeValue.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [1.1, 1],
                                    }),
                                },
                            ],
                        },
                    ]}
                >
                    <Animated.View style={{ transform: [{ rotate: spin }] }}>
                        <Ionicons name="sync" size={40} color={colors.primary} />
                    </Animated.View>
                    <Text style={[styles.text, { color: colors.textPrimary }]}>{message}</Text>
                    <View style={[styles.progressLine, { backgroundColor: colors.primary + "10" }]}>
                        <Animated.View
                            style={[
                                styles.progressFill,
                                {
                                    backgroundColor: colors.primary,
                                    width: widthValue.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: ["0%", "100%"],
                                    })
                                }
                            ]}
                        />
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.15)",
        justifyContent: "center",
        alignItems: "center",
    },
    container: {
        padding: 30,
        borderRadius: 24,
        alignItems: "center",
        width: 200,
        elevation: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
    },
    text: {
        marginTop: 20,
        fontSize: 16,
        fontWeight: "700",
        letterSpacing: 0.5,
    },
    progressLine: {
        height: 3,
        width: 60,
        borderRadius: 1.5,
        marginTop: 12,
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
    },
});
