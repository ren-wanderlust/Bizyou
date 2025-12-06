import React, { useRef, useEffect } from 'react';
import { Animated, StyleSheet, Dimensions, ViewStyle } from 'react-native';

const { width } = Dimensions.get('window');

interface AnimatedTabViewProps {
    activeTab: string;
    children: React.ReactNode;
    tabId: string;
    direction?: 'left' | 'right' | 'fade';
    style?: ViewStyle;
}

// Individual tab content with animation
export function AnimatedTabContent({
    activeTab,
    tabId,
    children,
    direction = 'left',
    style,
}: AnimatedTabViewProps) {
    const isActive = activeTab === tabId;
    const opacity = useRef(new Animated.Value(isActive ? 1 : 0)).current;
    const translateX = useRef(new Animated.Value(isActive ? 0 : (direction === 'left' ? width : -width))).current;

    useEffect(() => {
        if (isActive) {
            // Animate in
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.spring(translateX, {
                    toValue: 0,
                    useNativeDriver: true,
                    friction: 8,
                    tension: 65,
                }),
            ]).start();
        } else {
            // Animate out
            Animated.timing(opacity, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
            }).start();
        }
    }, [isActive]);

    if (!isActive) {
        return null;
    }

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    opacity,
                    transform: [{ translateX }],
                },
                style,
            ]}
        >
            {children}
        </Animated.View>
    );
}

// Tab indices for determining slide direction
const TAB_ORDER: { [key: string]: number } = {
    'search': 0,
    'likes': 1,
    'create': 2,
    'talk': 3,
    'profile': 4,
};

interface TabContainerProps {
    activeTab: string;
    previousTab: string | null;
    children: React.ReactNode;
    style?: ViewStyle;
}

// Main container that handles direction logic
export function AnimatedTabContainer({
    activeTab,
    previousTab,
    children,
    style,
}: TabContainerProps) {
    const currentIndex = TAB_ORDER[activeTab] ?? 0;
    const prevIndex = previousTab ? (TAB_ORDER[previousTab] ?? 0) : currentIndex;
    const direction = currentIndex > prevIndex ? 'left' : 'right';

    return React.Children.map(children, (child) => {
        if (React.isValidElement<{ tabId?: string }>(child) && child.props.tabId) {
            return React.cloneElement(child as React.ReactElement<any>, {
                direction,
            });
        }
        return child;
    });
}

// Simple fade-only animation (lighter weight)
export function FadeTabContent({
    activeTab,
    tabId,
    children,
    style,
}: Omit<AnimatedTabViewProps, 'direction'>) {
    const isActive = activeTab === tabId;
    const opacity = useRef(new Animated.Value(isActive ? 1 : 0)).current;
    const scale = useRef(new Animated.Value(isActive ? 1 : 0.97)).current;

    useEffect(() => {
        if (isActive) {
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 180,
                    useNativeDriver: true,
                }),
                Animated.spring(scale, {
                    toValue: 1,
                    useNativeDriver: true,
                    friction: 8,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 120,
                    useNativeDriver: true,
                }),
                Animated.timing(scale, {
                    toValue: 0.97,
                    duration: 120,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [isActive]);

    if (!isActive) {
        return null;
    }

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    opacity,
                    transform: [{ scale }],
                },
                style,
            ]}
        >
            {children}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
});
