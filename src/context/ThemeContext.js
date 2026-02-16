import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import { lightColors, darkColors } from "../theme/colors";

const ThemeContext = createContext({
    isDark: false,
    colors: lightColors,
    toggleTheme: () => { },
    setTheme: () => { },
});

const SETTINGS_DIR = FileSystem.documentDirectory + "settings/";
const THEME_FILE = SETTINGS_DIR + "theme_pref.json";

export function ThemeProvider({ children }) {
    const systemScheme = useColorScheme();
    const [isDark, setIsDark] = useState(systemScheme === "dark");
    const [loaded, setLoaded] = useState(false);

    // Load saved preference
    useEffect(() => {
        (async () => {
            try {
                const dirInfo = await FileSystem.getInfoAsync(SETTINGS_DIR);
                if (!dirInfo.exists) {
                    await FileSystem.makeDirectoryAsync(SETTINGS_DIR, {
                        intermediates: true,
                    });
                }

                const fileInfo = await FileSystem.getInfoAsync(THEME_FILE);
                if (fileInfo.exists) {
                    const content = await FileSystem.readAsStringAsync(THEME_FILE);
                    const pref = JSON.parse(content);
                    if (typeof pref.isDark === "boolean") {
                        setIsDark(pref.isDark);
                    }
                }
            } catch (e) {
                console.warn("Failed to load theme pref", e);
            } finally {
                setLoaded(true);
            }
        })();
    }, []);

    const savePref = async (dark) => {
        try {
            await FileSystem.writeAsStringAsync(
                THEME_FILE,
                JSON.stringify({ isDark: dark })
            );
        } catch (e) {
            console.warn("Failed to save theme pref", e);
        }
    };

    const toggleTheme = () => {
        setIsDark((prev) => {
            const next = !prev;
            savePref(next);
            return next;
        });
    };

    const setTheme = (mode) => {
        const next = mode === "dark";
        setIsDark(next);
        savePref(next);
    };

    const themeColors = isDark ? darkColors : lightColors;

    return (
        <ThemeContext.Provider
            value={{
                isDark,
                colors: themeColors,
                toggleTheme,
                setTheme,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);
