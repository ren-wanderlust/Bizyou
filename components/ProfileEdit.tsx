import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Profile } from '../types';

interface ProfileEditProps {
    initialProfile: Profile;
    onSave: (updatedProfile: Profile) => void;
    onCancel: () => void;
}

export function ProfileEdit({ initialProfile, onSave, onCancel }: ProfileEditProps) {
    const [name, setName] = useState(initialProfile.name);
    const [age, setAge] = useState(initialProfile.age.toString());
    const [university, setUniversity] = useState(initialProfile.university || initialProfile.company || '');
    const [bio, setBio] = useState(initialProfile.bio || '');

    const [seekingFor, setSeekingFor] = useState<string[]>(initialProfile.seekingFor || []);
    const [skills, setSkills] = useState<string[]>(initialProfile.skills || []);
    const [seekingRoles, setSeekingRoles] = useState<string[]>(initialProfile.seekingRoles || []);

    const skillOptions = [
        'エンジニア', 'デザイナー', 'マーケター', 'セールス',
        'ライター', 'プランナー', '財務/会計', '法務',
    ];

    const seekingOptions = [
        'エンジニア', 'デザイナー', 'マーケター', 'セールス',
        'ライター', 'プランナー', '財務/会計', '法務',
        'メンター', '投資家',
    ];

    const seekingForOptions = [
        'ビジネスパートナーを探す',
        'ビジネスメンバーを探す',
        '仕事を探したい',
        '情報収集',
        'その他',
    ];

    const handleToggle = (
        item: string,
        list: string[],
        setList: React.Dispatch<React.SetStateAction<string[]>>
    ) => {
        if (list.includes(item)) {
            setList(list.filter((i) => i !== item));
        } else {
            setList([...list, item]);
        }
    };

    const handleSave = () => {
        const updatedProfile: Profile = {
            ...initialProfile,
            name,
            age: parseInt(age, 10) || 0,
            university: university, // Simplified mapping, assuming university field for now
            bio,
            seekingFor,
            skills,
            seekingRoles,
        };
        onSave(updatedProfile);
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onCancel} style={styles.headerButton}>
                        <Text style={styles.cancelText}>キャンセル</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>プロフィール編集</Text>
                    <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
                        <Text style={styles.saveText}>保存</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View>
                            {/* Basic Info */}
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>基本情報</Text>

                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>ニックネーム</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={name}
                                        onChangeText={setName}
                                        placeholder="例: タロウ"
                                    />
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>年齢</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={age}
                                        onChangeText={setAge}
                                        placeholder="例: 20"
                                        keyboardType="numeric"
                                    />
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>職種 / 大学名</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={university}
                                        onChangeText={setUniversity}
                                        placeholder="例: 東京大学 / 株式会社〇〇"
                                    />
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>自己紹介文</Text>
                                    <TextInput
                                        style={[styles.input, styles.textArea]}
                                        value={bio}
                                        onChangeText={setBio}
                                        placeholder="自己紹介を入力してください"
                                        multiline
                                        numberOfLines={4}
                                        textAlignVertical="top"
                                    />
                                </View>
                            </View>

                            {/* Tags Section A */}
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Ionicons name="search" size={20} color="#0d9488" />
                                    <Text style={styles.sectionTitle}>今、何を探していますか？</Text>
                                </View>
                                <View style={styles.chipContainer}>
                                    {seekingForOptions.map((option) => (
                                        <TouchableOpacity
                                            key={option}
                                            onPress={() => handleToggle(option, seekingFor, setSeekingFor)}
                                            style={[
                                                styles.chip,
                                                seekingFor.includes(option) ? styles.chipSelected : styles.chipUnselected
                                            ]}
                                        >
                                            <Text style={seekingFor.includes(option) ? styles.chipTextSelected : styles.chipTextUnselected}>
                                                {option}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Tags Section B */}
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Ionicons name="flash-outline" size={20} color="#0d9488" />
                                    <Text style={styles.sectionTitle}>持っているスキル</Text>
                                </View>
                                <View style={styles.chipContainer}>
                                    {skillOptions.map((skill) => (
                                        <TouchableOpacity
                                            key={skill}
                                            onPress={() => handleToggle(skill, skills, setSkills)}
                                            style={[
                                                styles.chip,
                                                skills.includes(skill) ? styles.chipSelected : styles.chipUnselected
                                            ]}
                                        >
                                            <Text style={skills.includes(skill) ? styles.chipTextSelected : styles.chipTextUnselected}>
                                                {skill}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Tags Section C */}
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Ionicons name="people-outline" size={20} color="#0d9488" />
                                    <Text style={styles.sectionTitle}>求める仲間や条件等</Text>
                                </View>
                                <View style={styles.chipContainer}>
                                    {seekingOptions.map((role) => (
                                        <TouchableOpacity
                                            key={role}
                                            onPress={() => handleToggle(role, seekingRoles, setSeekingRoles)}
                                            style={[
                                                styles.chip,
                                                seekingRoles.includes(role) ? styles.chipSelected : styles.chipUnselected
                                            ]}
                                        >
                                            <Text style={seekingRoles.includes(role) ? styles.chipTextSelected : styles.chipTextUnselected}>
                                                {role}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
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
        backgroundColor: '#f9fafb',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    headerButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
    },
    cancelText: {
        fontSize: 16,
        color: '#6b7280',
    },
    saveText: {
        fontSize: 16,
        color: '#0d9488',
        fontWeight: 'bold',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 12,
    },
    formGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 12,
        fontSize: 16,
        color: '#111827',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
    },
    chipUnselected: {
        backgroundColor: 'white',
        borderColor: '#d1d5db',
    },
    chipSelected: {
        backgroundColor: '#f0fdfa', // teal-50
        borderColor: '#0d9488', // teal-600
    },
    chipTextUnselected: {
        color: '#374151',
        fontSize: 14,
    },
    chipTextSelected: {
        color: '#0d9488',
        fontSize: 14,
        fontWeight: 'bold',
    },
});
