import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Profile } from '../types';

interface ProfileCardProps {
    profile: Profile;
    isLiked: boolean;
    onLike: () => void;
    onSelect?: () => void;
}

const { width } = Dimensions.get('window');
// Calculate card width based on 2 columns with 16px padding on sides and 12px gap
const GAP = 12;
const PADDING = 16;
const CARD_WIDTH = (width - (PADDING * 2) - GAP) / 2;

export function ProfileCard({ profile, isLiked, onLike, onSelect }: ProfileCardProps) {
    return (
        <TouchableOpacity
            style={styles.cardContainer}
            onPress={onSelect}
            activeOpacity={0.8}
        >
            {/* Image Container - Square-ish with rounded corners */}
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: profile.image }}
                    style={styles.image}
                    resizeMode="cover"
                />

                {/* Top Left Badge: Common Points (Mock) */}
                <View style={styles.commonPointsBadge}>
                    <Text style={styles.commonPointsText}>共通点 5</Text>
                </View>

                {/* Bottom Right Badge: Photo Count (Mock) */}
                <View style={styles.photoCountBadge}>
                    <Ionicons name="camera" size={12} color="white" />
                    <Text style={styles.photoCountText}>3</Text>
                </View>
            </View>

            {/* Text Content - Left Aligned */}
            <View style={styles.content}>
                {/* Line 1: Age + Location */}
                <View style={styles.infoRow}>
                    <Text style={styles.primaryText}>
                        {profile.age}歳 {profile.location}
                    </Text>
                </View>

                {/* Line 2: University or Company */}
                {(profile.university || profile.company) && (
                    <Text style={styles.secondaryText} numberOfLines={1}>
                        {profile.university ? `🏫 ${profile.university}` : `🏢 ${profile.company}`}
                    </Text>
                )}

                {/* Line 3: Bio */}
                <Text style={styles.commentText} numberOfLines={3}>
                    {profile.bio}
                </Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        width: CARD_WIDTH,
        backgroundColor: 'transparent',
        marginBottom: 16,
        // No shadow for a clean, flat look
    },
    imageContainer: {
        width: '100%',
        aspectRatio: 1, // Square aspect ratio
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
        marginBottom: 8,
        backgroundColor: '#f3f4f6',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    commonPointsBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: '#ec4899', // Pink accent color
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    commonPointsText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    photoCountBadge: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.6)',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 12,
        gap: 4,
    },
    photoCountText: {
        color: 'white',
        fontSize: 10,
        fontWeight: '600',
    },
    content: {
        paddingHorizontal: 2,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
        gap: 6,
    },
    primaryText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    secondaryText: {
        fontSize: 11,
        color: '#6b7280', // Gray-500
        marginBottom: 4,
    },
    commentText: {
        fontSize: 12,
        color: '#333',
        lineHeight: 16,
        marginTop: 2,
    },
});
