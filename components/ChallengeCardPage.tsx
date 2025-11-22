import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ThemeCardProps {
    icon: string;
    title: string;
    count: number;
    onPress: () => void;
}

const ThemeCard = ({ icon, title, count, onPress }: ThemeCardProps) => (
    <TouchableOpacity style={styles.card} onPress={onPress}>
        <View style={styles.cardIconContainer}>
            <Text style={styles.cardIcon}>{icon}</Text>
        </View>
        <Text style={styles.cardTitle} numberOfLines={2}>{title}</Text>
        <View style={styles.cardFooter}>
            <Ionicons name="people-outline" size={12} color="#6b7280" />
            <Text style={styles.cardCount}>{count}人が挑戦中</Text>
        </View>
        <View style={styles.actionLink}>
            <Text style={styles.actionLinkText}>👉 参加者を見る</Text>
        </View>
    </TouchableOpacity>
);

interface ChallengeCardPageProps {
    onThemeSelect?: (themeName: string) => void;
}

export function ChallengeCardPage({ onThemeSelect }: ChallengeCardPageProps) {
    const recommended = [
        { id: 1, icon: '🤖', title: 'AIプロダクト開発', count: 127 },
        { id: 2, icon: '🌍', title: 'SDGs・社会課題', count: 85 },
        { id: 3, icon: '📱', title: 'モバイルアプリ', count: 203 },
        { id: 4, icon: '🎨', title: 'UI/UXデザイン', count: 94 },
    ];

    const trending = [
        { id: 5, icon: '🚀', title: 'スタートアップ', count: 342 },
        { id: 6, icon: '💰', title: 'FinTech', count: 156 },
        { id: 7, icon: '🎮', title: 'GameFi / Web3', count: 78 },
        { id: 8, icon: '📢', title: 'マーケティング', count: 112 },
    ];

    return (
        <View style={styles.container}>
            {/* Header - Navigation Bar Style */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>挑戦テーマ</Text>
                <TouchableOpacity
                    style={styles.searchButton}
                    onPress={() => console.log('Search')}
                >
                    <Ionicons name="search-outline" size={28} color="#333" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Recommended Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>✨ あなたにおすすめ (AI推薦)</Text>
                    </View>
                    <View style={styles.grid}>
                        {recommended.map((item) => (
                            <ThemeCard
                                key={item.id}
                                icon={item.icon}
                                title={item.title}
                                count={item.count}
                                onPress={() => onThemeSelect?.(item.title)}
                            />
                        ))}
                    </View>
                </View>

                {/* Trending Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>📈 注目の挑戦テーマ (人気急上昇)</Text>
                    </View>
                    <View style={styles.grid}>
                        {trending.map((item) => (
                            <ThemeCard
                                key={item.id}
                                icon={item.icon}
                                title={item.title}
                                count={item.count}
                                onPress={() => onThemeSelect?.(item.title)}
                            />
                        ))}
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    header: {
        height: 90, // Reduced from 100
        paddingTop: 45, // Reduced from 50
        paddingBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center', // Center the title
        backgroundColor: '#FAFAFA',
        position: 'relative', // For absolute positioning of search button
        zIndex: 10,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333333',
    },
    searchButton: {
        position: 'absolute',
        right: 16,
        bottom: 12, // Adjusted to align with title
        padding: 4,
    },
    content: {
        flex: 1,
    },
    section: {
        paddingHorizontal: 16,
        paddingBottom: 24,
        marginBottom: 8,
    },
    sectionHeader: {
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1A1A',
        letterSpacing: 0.3,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    card: {
        width: (Dimensions.get('window').width - 32 - 12) / 2, // (Screen width - padding*2 - gap) / 2
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        // Clean, soft shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 2,
        borderWidth: 0, // Remove border for cleaner look
    },
    cardIconContainer: {
        width: 52,
        height: 52,
        backgroundColor: '#F5F7FA',
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    cardIcon: {
        fontSize: 26,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 8,
        height: 44,
        lineHeight: 22,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    cardCount: {
        fontSize: 12,
        color: '#9CA3AF',
        fontWeight: '500',
    },
    actionLink: {
        marginTop: 12,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    actionLinkText: {
        fontSize: 12,
        color: '#009688',
        fontWeight: 'bold',
    },
});
