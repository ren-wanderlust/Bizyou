import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    ScrollView,
    TouchableOpacity,
    Image,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    ActivityIndicator,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';
import { SHADOWS } from '../constants/DesignSystem';
import { HapticTouchable } from './HapticButton';

interface ProfileEditProps {
    initialProfile: Profile;
    onSave: (profile: Profile) => void;
    onCancel: () => void;
}

export function ProfileEdit({ initialProfile, onSave, onCancel }: ProfileEditProps) {
    const [name, setName] = useState(initialProfile.name || '');
    const [age, setAge] = useState(initialProfile.age?.toString() || '');
    const [university, setUniversity] = useState(initialProfile.university || initialProfile.company || '');
    const [bio, setBio] = useState(initialProfile.bio || '');
    const [seekingFor, setSeekingFor] = useState<string[]>(initialProfile.seekingFor || []);
    const [skills, setSkills] = useState<string[]>(initialProfile.skills || []);
    const [seekingRoles, setSeekingRoles] = useState<string[]>(initialProfile.seekingRoles || []);
    const [image, setImage] = useState(initialProfile.image || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const seekingForOptions = [
        { id: '起業に興味あり', icon: '🚀' },
        { id: 'ビジネスメンバー探し', icon: '🤝' },
        { id: 'アイデア模索中', icon: '💡' },
        { id: 'まずは話してみたい', icon: '💬' },
        { id: 'コミュニティ形成', icon: '👥' },
        { id: '壁打ち相手募集', icon: '🎯' },
    ];

    const skillCategories = [
        {
            title: '開発・技術',
            icon: 'code-slash',
            color: '#3B82F6',
            skills: ['フロントエンド', 'バックエンド', 'モバイルアプリ', 'AI / データ', 'インフラ / クラウド', 'ブロックチェーン', 'ゲーム開発']
        },
        {
            title: 'デザイン',
            icon: 'color-palette',
            color: '#EC4899',
            skills: ['UI / UXデザイン', 'グラフィック / イラスト', 'Webデザイン']
        },
        {
            title: 'ビジネス',
            icon: 'briefcase',
            color: '#F59E0B',
            skills: ['マーケティング', 'セールス / BizDev', 'PM / ディレクター', '広報 / PR', 'ファイナンス / 経理']
        },
        {
            title: 'その他',
            icon: 'sparkles',
            color: '#8B5CF6',
            skills: ['動画 / クリエイター', 'ライティング']
        }
    ];

    const seekingOptions = [
        { id: 'エンジニア', icon: '💻' },
        { id: 'デザイナー', icon: '🎨' },
        { id: 'マーケ / 広報', icon: '📣' },
        { id: 'セールス / BizDev', icon: '💼' },
        { id: 'PM / ディレクター', icon: '📋' },
        { id: 'ファイナンス', icon: '💰' },
        { id: '壁打ち相手', icon: '🗣️' },
        { id: 'まだ分からない', icon: '🤔' },
    ];

    const handleImageChange = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleToggle = (item: string, list: string[], setList: (l: string[]) => void) => {
        if (list.includes(item)) {
            setList(list.filter(i => i !== item));
        } else {
            setList([...list, item]);
        }
    };

    const handleSave = async () => {
        // Validation
        if (!name.trim()) {
            Alert.alert('エラー', 'ニックネームを入力してください');
            return;
        }
        if (!age.trim() || isNaN(parseInt(age))) {
            Alert.alert('エラー', '年齢を正しく入力してください');
            return;
        }
        if (!university.trim()) {
            Alert.alert('エラー', '職種 / 大学名を入力してください');
            return;
        }

        setIsSubmitting(true);
        try {
            let uploadedImageUrl = image;

            // Upload image if it's a local URI (changed)
            if (image && image !== initialProfile.image && !image.startsWith('http')) {
                try {
                    const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
                        const xhr = new XMLHttpRequest();
                        xhr.onload = function () {
                            resolve(xhr.response);
                        };
                        xhr.onerror = function (e) {
                            console.log(e);
                            reject(new TypeError('Network request failed'));
                        };
                        xhr.responseType = 'arraybuffer';
                        xhr.open('GET', image, true);
                        xhr.send(null);
                    });

                    const fileExt = image.split('.').pop()?.toLowerCase() ?? 'jpg';
                    const fileName = `${initialProfile.id}/${Date.now()}.${fileExt}`;
                    const filePath = `${fileName}`;

                    const { error: uploadError } = await supabase.storage
                        .from('avatars')
                        .upload(filePath, arrayBuffer, {
                            contentType: `image/${fileExt}`,
                            upsert: true,
                        });

                    if (uploadError) {
                        console.error('Image upload error:', uploadError);
                        throw uploadError;
                    } else {
                        const { data: { publicUrl } } = supabase.storage
                            .from('avatars')
                            .getPublicUrl(filePath);
                        uploadedImageUrl = publicUrl;
                    }
                } catch (uploadErr) {
                    console.error('Error uploading image:', uploadErr);
                    Alert.alert('エラー', '画像のアップロードに失敗しました');
                    setIsSubmitting(false);
                    return;
                }
            }

            const updatedProfile: Profile = {
                ...initialProfile,
                name,
                age: parseInt(age) || 0,
                university: university,
                bio,
                seekingFor,
                skills,
                seekingRoles,
                image: uploadedImageUrl
            };
            onSave(updatedProfile);
        } catch (error) {
            console.error('Error saving profile:', error);
            Alert.alert('エラー', 'プロフィールの保存に失敗しました');
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFormValid = name.trim() && age.trim() && university.trim();

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                {/* Modern Header */}
                <View style={styles.header}>
                    <HapticTouchable onPress={onCancel} style={styles.headerButtonLeft} hapticType="light">
                        <Ionicons name="close" size={24} color="#6B7280" />
                    </HapticTouchable>

                    <Text style={styles.headerTitle}>プロフィール編集</Text>

                    <HapticTouchable
                        onPress={handleSave}
                        style={[styles.saveButton, !isFormValid && styles.saveButtonDisabled]}
                        hapticType="success"
                        disabled={isSubmitting || !isFormValid}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <Text style={[styles.saveButtonText, !isFormValid && styles.saveButtonTextDisabled]}>保存</Text>
                        )}
                    </HapticTouchable>
                </View>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View>
                            {/* Profile Image Section */}
                            <View style={styles.imageSection}>
                                <View style={styles.imageWrapper}>
                                    <Image source={{ uri: image }} style={styles.profileImage} />
                                    <TouchableOpacity
                                        style={styles.editImageBadge}
                                        onPress={handleImageChange}
                                        activeOpacity={0.8}
                                    >
                                        <Ionicons name="camera" size={18} color="white" />
                                    </TouchableOpacity>
                                </View>
                                <TouchableOpacity onPress={handleImageChange}>
                                    <Text style={styles.changePhotoText}>写真を変更</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Basic Info Card */}
                            <View style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <View style={styles.cardIconContainer}>
                                        <Ionicons name="person" size={18} color="#009688" />
                                    </View>
                                    <Text style={styles.cardTitle}>基本情報</Text>
                                </View>

                                <View style={styles.formGroup}>
                                    <View style={styles.labelRow}>
                                        <Text style={styles.label}>ニックネーム</Text>
                                        <Text style={styles.requiredBadge}>必須</Text>
                                    </View>
                                    <View style={styles.inputWrapper}>
                                        <TextInput
                                            style={styles.input}
                                            value={name}
                                            onChangeText={setName}
                                            placeholder="例: タロウ"
                                            placeholderTextColor="#9CA3AF"
                                        />
                                    </View>
                                </View>

                                <View style={styles.formGroup}>
                                    <View style={styles.labelRow}>
                                        <Text style={styles.label}>年齢</Text>
                                        <Text style={styles.requiredBadge}>必須</Text>
                                    </View>
                                    <View style={styles.inputWrapper}>
                                        <TextInput
                                            style={styles.input}
                                            value={age}
                                            onChangeText={setAge}
                                            placeholder="例: 22"
                                            placeholderTextColor="#9CA3AF"
                                            keyboardType="numeric"
                                        />
                                    </View>
                                </View>

                                <View style={styles.formGroup}>
                                    <View style={styles.labelRow}>
                                        <Text style={styles.label}>職種 / 大学名</Text>
                                        <Text style={styles.requiredBadge}>必須</Text>
                                    </View>
                                    <View style={styles.inputWrapper}>
                                        <TextInput
                                            style={styles.input}
                                            value={university}
                                            onChangeText={setUniversity}
                                            placeholder="例: 東京大学 / 株式会社〇〇"
                                            placeholderTextColor="#9CA3AF"
                                        />
                                    </View>
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>自己紹介</Text>
                                    <View style={styles.textAreaWrapper}>
                                        <TextInput
                                            style={styles.textArea}
                                            value={bio}
                                            onChangeText={setBio}
                                            placeholder="あなたの経歴、興味、目標などを書いてみましょう"
                                            placeholderTextColor="#9CA3AF"
                                            multiline
                                            numberOfLines={4}
                                            textAlignVertical="top"
                                        />
                                    </View>
                                </View>
                            </View>

                            {/* Status & Purpose Card */}
                            <View style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <View style={[styles.cardIconContainer, { backgroundColor: '#FEF3C7' }]}>
                                        <Ionicons name="flag" size={18} color="#F59E0B" />
                                    </View>
                                    <Text style={styles.cardTitle}>現在のステータス・目的</Text>
                                </View>
                                <Text style={styles.cardSubtitle}>あなたの状況に当てはまるものを選んでください</Text>
                                <View style={styles.chipGrid}>
                                    {seekingForOptions.map((option) => (
                                        <HapticTouchable
                                            key={option.id}
                                            onPress={() => handleToggle(option.id, seekingFor, setSeekingFor)}
                                            style={[
                                                styles.chip,
                                                seekingFor.includes(option.id) && styles.chipSelected
                                            ]}
                                            hapticType="selection"
                                        >
                                            <Text style={styles.chipEmoji}>{option.icon}</Text>
                                            <Text style={[
                                                styles.chipText,
                                                seekingFor.includes(option.id) && styles.chipTextSelected
                                            ]}>
                                                {option.id}
                                            </Text>
                                            {seekingFor.includes(option.id) && (
                                                <Ionicons name="checkmark-circle" size={16} color="#009688" style={{ marginLeft: 4 }} />
                                            )}
                                        </HapticTouchable>
                                    ))}
                                </View>
                            </View>

                            {/* Skills Card */}
                            <View style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <View style={[styles.cardIconContainer, { backgroundColor: '#DBEAFE' }]}>
                                        <Ionicons name="flash" size={18} color="#3B82F6" />
                                    </View>
                                    <Text style={styles.cardTitle}>持っているスキル</Text>
                                </View>
                                <Text style={styles.cardSubtitle}>あなたが得意なスキルを選んでください</Text>

                                {skillCategories.map((category, categoryIndex) => (
                                    <View key={categoryIndex} style={styles.skillCategory}>
                                        <View style={styles.categoryHeader}>
                                            <View style={[styles.categoryIconContainer, { backgroundColor: category.color + '20' }]}>
                                                <Ionicons name={category.icon as any} size={14} color={category.color} />
                                            </View>
                                            <Text style={styles.categoryTitle}>{category.title}</Text>
                                        </View>
                                        <View style={styles.chipContainer}>
                                            {category.skills.map((skill) => (
                                                <HapticTouchable
                                                    key={skill}
                                                    onPress={() => handleToggle(skill, skills, setSkills)}
                                                    style={[
                                                        styles.skillChip,
                                                        skills.includes(skill) && styles.skillChipSelected
                                                    ]}
                                                    hapticType="selection"
                                                >
                                                    <Text style={[
                                                        styles.skillChipText,
                                                        skills.includes(skill) && styles.skillChipTextSelected
                                                    ]}>
                                                        {skill}
                                                    </Text>
                                                </HapticTouchable>
                                            ))}
                                        </View>
                                    </View>
                                ))}
                            </View>

                            {/* Seeking Roles Card */}
                            <View style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <View style={[styles.cardIconContainer, { backgroundColor: '#FCE7F3' }]}>
                                        <Ionicons name="people" size={18} color="#EC4899" />
                                    </View>
                                    <Text style={styles.cardTitle}>求める仲間</Text>
                                </View>
                                <Text style={styles.cardSubtitle}>一緒に活動したい仲間のタイプを選んでください</Text>
                                <View style={styles.chipGrid}>
                                    {seekingOptions.map((role) => (
                                        <HapticTouchable
                                            key={role.id}
                                            onPress={() => handleToggle(role.id, seekingRoles, setSeekingRoles)}
                                            style={[
                                                styles.chip,
                                                seekingRoles.includes(role.id) && styles.chipSelected
                                            ]}
                                            hapticType="selection"
                                        >
                                            <Text style={styles.chipEmoji}>{role.icon}</Text>
                                            <Text style={[
                                                styles.chipText,
                                                seekingRoles.includes(role.id) && styles.chipTextSelected
                                            ]}>
                                                {role.id}
                                            </Text>
                                            {seekingRoles.includes(role.id) && (
                                                <Ionicons name="checkmark-circle" size={16} color="#009688" style={{ marginLeft: 4 }} />
                                            )}
                                        </HapticTouchable>
                                    ))}
                                </View>
                            </View>

                            <View style={{ height: 40 }} />
                        </View>
                    </TouchableWithoutFeedback>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    headerButtonLeft: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#111827',
    },
    saveButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#009688',
    },
    saveButtonDisabled: {
        backgroundColor: '#E5E7EB',
    },
    saveButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: 'white',
    },
    saveButtonTextDisabled: {
        color: '#9CA3AF',
    },
    scrollContent: {
        padding: 16,
    },
    imageSection: {
        alignItems: 'center',
        marginBottom: 24,
        paddingTop: 8,
    },
    imageWrapper: {
        position: 'relative',
        marginBottom: 12,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#E5E7EB',
        borderWidth: 4,
        borderColor: 'white',
        ...SHADOWS.md,
    },
    editImageBadge: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#009688',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: 'white',
    },
    changePhotoText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#009688',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        ...SHADOWS.sm,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    cardIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#E0F2F1',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    cardSubtitle: {
        fontSize: 13,
        color: '#6B7280',
        marginBottom: 16,
        marginLeft: 42,
    },
    formGroup: {
        marginBottom: 16,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
    },
    requiredBadge: {
        fontSize: 10,
        fontWeight: '600',
        color: '#DC2626',
        backgroundColor: '#FEE2E2',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginLeft: 8,
    },
    inputWrapper: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        overflow: 'hidden',
    },
    input: {
        paddingVertical: 14,
        paddingHorizontal: 14,
        fontSize: 16,
        color: '#111827',
    },
    textAreaWrapper: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        overflow: 'hidden',
    },
    textArea: {
        padding: 14,
        fontSize: 15,
        color: '#111827',
        minHeight: 120,
        lineHeight: 22,
    },
    chipGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 12,
        backgroundColor: '#F9FAFB',
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
    },
    chipSelected: {
        backgroundColor: '#E0F2F1',
        borderColor: '#009688',
    },
    chipEmoji: {
        fontSize: 16,
        marginRight: 6,
    },
    chipText: {
        fontSize: 14,
        color: '#374151',
        fontWeight: '500',
    },
    chipTextSelected: {
        color: '#009688',
        fontWeight: '600',
    },
    skillCategory: {
        marginTop: 16,
    },
    categoryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    categoryIconContainer: {
        width: 24,
        height: 24,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    categoryTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6B7280',
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    skillChip: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    skillChipSelected: {
        backgroundColor: '#E0F2F1',
        borderColor: '#009688',
    },
    skillChipText: {
        fontSize: 13,
        color: '#374151',
        fontWeight: '500',
    },
    skillChipTextSelected: {
        color: '#009688',
        fontWeight: '600',
    },
});
