import { StyleSheet, Text, View, TouchableOpacity, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Profile } from '../types';

interface BottomNavProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    currentUser: Profile | null;
    badges?: { [key: string]: number };
}

export function BottomNav({ activeTab, onTabChange, currentUser, badges }: BottomNavProps) {
    const insets = useSafeAreaInsets();

    const tabs = [
        { id: 'search', icon: 'search', label: 'さがす' },
        { id: 'likes', icon: 'heart', label: 'いいね' },
        { id: 'challenge', icon: 'pricetags', label: '挑戦カード' },
        { id: 'talk', icon: 'chatbubble', label: 'トーク' },
        { id: 'profile', icon: 'person', label: 'マイページ' },
    ];

    return (
        <View style={[styles.container, { paddingBottom: Math.max(insets.bottom - 10, 0) + 10 }]}>
            <View style={styles.tabBar}>
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const badgeCount = badges?.[tab.id] || 0;

                    const renderBadge = () => {
                        if (badgeCount > 0) {
                            return (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>
                                        {badgeCount > 99 ? '99+' : badgeCount}
                                    </Text>
                                </View>
                            );
                        }
                        return null;
                    };

                    if (tab.id === 'profile' && currentUser?.image) {
                        return (
                            <TouchableOpacity
                                key={tab.id}
                                onPress={() => onTabChange(tab.id)}
                                style={styles.tabButton}
                                activeOpacity={0.7}
                            >
                                <View>
                                    <Image
                                        source={{ uri: currentUser.image }}
                                        style={[
                                            styles.profileIcon,
                                            isActive && styles.profileIconActive
                                        ]}
                                    />
                                    {renderBadge()}
                                </View>
                            </TouchableOpacity>
                        );
                    }

                    // Ionicons names logic
                    let iconName: any = tab.icon;
                    if (!isActive) {
                        iconName = `${tab.icon}-outline`;
                    }

                    return (
                        <TouchableOpacity
                            key={tab.id}
                            onPress={() => onTabChange(tab.id)}
                            style={styles.tabButton}
                            activeOpacity={0.7}
                        >
                            <View>
                                <Ionicons
                                    name={iconName}
                                    size={28}
                                    color={isActive ? '#0d9488' : '#6b7280'} // teal-600 : gray-500
                                />
                                {renderBadge()}
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    tabBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: 15,
    },
    tabButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
    },
    tabLabel: {
        fontSize: 10,
        marginBottom: 2,
    },
    tabLabelActive: {
        color: '#0d9488', // teal-600
        fontWeight: '500',
    },
    tabLabelInactive: {
        color: '#6b7280', // gray-500
    },
    profileIcon: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    profileIconActive: {
        borderColor: '#0d9488',
        borderWidth: 2,
    },
    badge: {
        position: 'absolute',
        top: -4,
        right: -6,
        backgroundColor: '#EF4444',
        borderRadius: 10,
        minWidth: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: 'white',
        zIndex: 10,
    },
    badgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
        paddingHorizontal: 2,
    },
});
