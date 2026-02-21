import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth } from '../config/firebase';
import {
    onAuthStateChanged,
    signInWithCustomToken,
    signOut
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../constants/config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [idToken, setIdToken] = useState(null);

    const syncProfile = async (token) => {
        try {
            const response = await fetch(`${config.API_BASE_URL}/user/me`, {
                headers: {
                    'Authorization': `Bearer ${token || idToken}`
                }
            });
            const result = await response.json();
            if (result.success) {
                setUser(result.data);
            }
        } catch (error) {
            console.error('[AuthContext] Backend sync failed:', error);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const token = await firebaseUser.getIdToken();
                setIdToken(token);
                await syncProfile(token);
            } else {
                setUser(null);
                setIdToken(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const sendOtp = async (email) => {
        const response = await fetch(`${config.API_BASE_URL}/auth/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        return await response.json();
    };

    const verifyOtp = async (email, code) => {
        const response = await fetch(`${config.API_BASE_URL}/auth/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code })
        });
        const result = await response.json();

        if (result.success && result.token) {
            await signInWithCustomToken(auth, result.token);
        }
        return result;
    };

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('[AuthContext] Logout failed:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, idToken, sendOtp, verifyOtp, syncProfile, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
