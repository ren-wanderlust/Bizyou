import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export function ChallengeCardPage() {
    const categories = [
        { id: 'theme', label: '🔥 挑戦テーマ' },
        { id: 'skill', label: '</> スキル' },
        { id: 'role', label: '👥 募集役割' },
        { id: 'org', label: '🎓 所属' },
    ];

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

    const renderCard = (item: { id: number; icon: string; title: string; count: number }) => (
        <TouchableOpacity key={item.id} style={styles.card}>
            <View style={styles.cardIconContainer}>
                <Text style={styles.cardIcon}>{item.icon}</Text>
            </View>
            <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
            <View style={styles.cardFooter}>
                <Ionicons name="people-outline" size={12} color="#6b7280" />
                <Text style={styles.cardCount}>{item.count}人が挑戦中</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>挑戦カード</Text>
                <Text style={styles.headerSubtitle}>興味のあるテーマを探して、同じ挑戦者と繋がろう</Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Categories */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContainer}>
                    {categories.map((cat) => (
                        <TouchableOpacity key={cat.id} style={styles.categoryButton}>
                            <Text style={styles.categoryText}>{cat.label}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Recommended Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>✨ あなたにおすすめ (AI推薦)</Text>
                    </View>
                    <View style={styles.grid}>
                        {recommended.map(renderCard)}
                    </View>
                </View>

                {/* Trending Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>📈 注目の挑戦テーマ (人気急上昇)</Text>
                    </View>
                    <View style={styles.grid}>
                        {trending.map(renderCard)}
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
        backgroundColor: '#f9fafb',
    },
    header: {
        padding: 20,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#6b7280',
    },
    content: {
        flex: 1,
    },
    categoriesContainer: {
        padding: 16,
        gap: 12,
    },
    categoryButton: {
        backgroundColor: 'white',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    section: {
        padding: 16,
        paddingTop: 0,
    },
    sectionHeader: {
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    card: {
        width: (Dimensions.get('window').width - 32 - 12) / 2, // (Screen width - padding - gap) / 2
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardIconContainer: {
        width: 48,
        height: 48,
        backgroundColor: '#f0fdfa', // teal-50
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    cardIcon: {
        fontSize: 24,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 8,
        height: 44, // Fixed height for 2 lines
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    cardCount: {
        fontSize: 12,
        color: '#6b7280',
    },
});
