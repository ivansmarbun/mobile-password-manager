import { useState, useEffect, useRef, RefObject } from 'react';
import { Keyboard, Dimensions, ScrollView } from 'react-native';

interface UseKeyboardHandlerOptions {
    scrollViewRef?: RefObject<ScrollView | null>;
    scrollToEndOnFocus?: boolean;
    scrollDelay?: number;
}

export const useKeyboardHandler = (options: UseKeyboardHandlerOptions = {}) => {
    const {
        scrollViewRef,
        scrollToEndOnFocus = false,
        scrollDelay = 300
    } = options;

    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [screenHeight] = useState(Dimensions.get('window').height);
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
            setKeyboardHeight(e.endCoordinates.height);
            setIsKeyboardVisible(true);
        });

        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardHeight(0);
            setIsKeyboardVisible(false);
        });

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    const scrollToEnd = () => {
        if (scrollViewRef?.current && scrollToEndOnFocus) {
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, scrollDelay);
        }
    };

    const getContentContainerStyle = () => ({
        paddingBottom: isKeyboardVisible ? keyboardHeight + 50 : 100,
        minHeight: screenHeight
    });

    return {
        keyboardHeight,
        screenHeight,
        isKeyboardVisible,
        scrollToEnd,
        getContentContainerStyle
    };
};