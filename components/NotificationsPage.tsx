import React from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface Notification {
    id: string;
    type: 'important' | 'update' | 'psychology' | 'other';
    title: string;
    date: string;
    imageUrl?: string;
}

interface NotificationsPageProps {
    onBack: () => void;
}

const mockNotifications: Notification[] = [
    {
        id: '1',
        type: 'important',
        title: '【重要】利用規約改定のお知らせ',
        date: '11/19(水)',
        imageUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=100&h=100&fit=crop',
    },
    {
        id: '2',
        type: 'update',
        title: '新機能「挑戦カード」がリリースされました！興味のあるテーマを探してみましょう。',
        date: '11/18(火)',
        imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&h=100&fit=crop',
    },
    {
        id: '3',
        type: 'psychology',
        title: 'あなたの隠れた才能がわかる？「ビジネス心理テスト」公開中',
        date: '11/15(金)',
        imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&h=100&fit=crop',
    },
    {
        id: '4',
        type: 'update',
        title: 'システムメンテナンスのお知らせ（11/25実施予定）',
        date: '11/10(日)',
        imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=100&h=100&fit=crop',
    },
    {
        id: '5',
        type: 'other',
        title: 'プロフィールを充実させて、マッチング率をアップさせましょう！',
        date: '11/05(火)',
        imageUrl: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=100&h=100&fit=crop',
    },
];

export function NotificationsPage({ onBack }: NotificationsPageProps) {
    const getBadgeStyle = (type: string) => {
        switch (type) {
            case 'important':
                return { backgroundColor: '#FF5252', text: '重要' };
            case 'update':
                return { backgroundColor: '#9E9E9E', text: 'アップデート' };
            case 'psychology':
                return { backgroundColor: '#E040FB', text: '心理テスト' };
            default:
                return { backgroundColor: '#2196F3', text: 'お知らせ' };
        }
    };

    const renderItem = ({ item }: { item: Notification }) => {
        const badge = getBadgeStyle(item.type);
        return (
            <TouchableOpacity style={styles.itemContainer}>
                {/* Icon/Image */}
                <View style={styles.iconContainer}>
                    {item.imageUrl ? (
                        <Image source={{ uri: item.imageUrl }} style={styles.iconImage} />
                    ) : (
                        <View style={styles.placeholderIcon} />
                    )}
                </View>

                {/* Content */}
                <View style={styles.contentContainer}>
                    <View style={styles.headerRow}>
                        <View style={[styles.badge, { backgroundColor: badge.backgroundColor }]}>
                            <Text style={styles.badgeText}>{badge.text}</Text>
                        </View>
                        <Text style={styles.dateText}>{item.date}</Text>
                    </View>
                    <Text style={styles.titleText} numberOfLines={2}>
                        {item.title}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={28} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>お知らせ</Text>
                <View style={{ width: 28 }} />
            </View>
            <FlatList
                data={mockNotifications}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    listContent: {
        paddingBottom: 20,
    },
    itemContainer: {
        flexDirection: 'row',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
        alignItems: 'flex-start',
    },
    iconContainer: {
        marginRight: 12,
    },
    iconImage: {
        width: 48,
        height: 48,
        borderRadius: 8,
        backgroundColor: '#eee',
    },
    placeholderIcon: {
        width: 48,
        height: 48,
        borderRadius: 8,
        backgroundColor: '#eee',
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        alignSelf: 'flex-start',
    },
    badgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    dateText: {
        fontSize: 12,
        color: '#999',
    },
    titleText: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
    },
});
