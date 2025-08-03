import { useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus, PanResponder } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';

interface UseInactivityTimerProps {
    onInactivityTimeout: () => void;
    timeoutMinutes: number;
    enabled: boolean;
}

export const useInactivityTimer = ({ 
    onInactivityTimeout, 
    timeoutMinutes, 
    enabled 
}: UseInactivityTimerProps) => {
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const appStateRef = useRef<AppStateStatus>(AppState.currentState);
    const lastActivityRef = useRef<number>(Date.now());

    // Reset the inactivity timer
    const resetTimer = useCallback(() => {
        if (!enabled) return;

        lastActivityRef.current = Date.now();
        
        // Clear existing timer
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        // Set new timer
        timerRef.current = setTimeout(() => {
            onInactivityTimeout();
        }, timeoutMinutes * 60 * 1000);
    }, [enabled, timeoutMinutes, onInactivityTimeout]);

    // Clear the timer
    const clearTimer = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    // Handle app state changes
    const handleAppStateChange = useCallback((nextAppState: AppStateStatus) => {
        const previousAppState = appStateRef.current;
        appStateRef.current = nextAppState;

        if (!enabled) return;

        if (previousAppState === 'background' && nextAppState === 'active') {
            // App came back to foreground
            const timeInBackground = Date.now() - lastActivityRef.current;
            const timeoutMs = timeoutMinutes * 60 * 1000;

            if (timeInBackground >= timeoutMs) {
                // Been in background longer than timeout period
                onInactivityTimeout();
            } else {
                // Reset timer with remaining time
                const remainingTime = timeoutMs - timeInBackground;
                clearTimer();
                timerRef.current = setTimeout(() => {
                    onInactivityTimeout();
                }, remainingTime);
            }
        } else if (nextAppState === 'background') {
            // App went to background - just pause the timer, don't lock immediately
            // The lock will happen when coming back if enough time has passed
            lastActivityRef.current = Date.now();
            clearTimer();
        }
    }, [enabled, timeoutMinutes, onInactivityTimeout, clearTimer]);

    // Create pan responder to detect touch events
    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => {
            resetTimer();
            return false; // Don't capture the touch, let it pass through
        },
        onMoveShouldSetPanResponder: () => {
            resetTimer();
            return false;
        },
    });

    // Setup effect
    useEffect(() => {
        if (!enabled) {
            clearTimer();
            return;
        }

        // Start the timer
        resetTimer();

        // Add app state listener
        const subscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            clearTimer();
            subscription?.remove();
        };
    }, [enabled, resetTimer, clearTimer, handleAppStateChange]);

    // Reset timer when timeout changes
    useEffect(() => {
        if (enabled) {
            resetTimer();
        }
    }, [timeoutMinutes, resetTimer, enabled]);

    return {
        panResponder,
        resetTimer,
        clearTimer
    };
};