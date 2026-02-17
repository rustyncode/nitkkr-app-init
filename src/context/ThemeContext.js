import React, { createContext, useContext } from "react";
import { lightColors } from "../theme/colors";

const ThemeContext = createContext({
    isDark: false,
    colors: lightColors,
    toggleTheme: () => { },
    setTheme: () => { },
});

export function ThemeProvider({ children }) {
    // Force light mode always
    const isDark = false;
    const themeColors = lightColors;

    // No-op functions
    const toggleTheme = () => { };
    const setTheme = () => { };

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
