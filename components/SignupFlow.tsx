import React, { useState } from 'react';
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
    Keyboard,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface SignupFlowProps {
    onComplete: () => void;
    onCancel: () => void;
}

export function SignupFlow({ onComplete, onCancel }: SignupFlowProps) {
    const [step, setStep] = useState<1 | 2 | 3>(1);

    // Step 1: Account info
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [nickname, setNickname] = useState('');

    // Step 2: Profile info
    const [age, setAge] = useState('');
    const [university, setUniversity] = useState('');
    const [bio, setBio] = useState('');

    // Step 3: Tags (same as ProfileEdit)
    const [seekingFor, setSeekingFor] = useState<string[]>([]);
    const [skills, setSkills] = useState<string[]>([]);
    const [seekingRoles, setSeekingRoles] = useState<string[]>([]);

    // Validation errors state
    const [errors, setErrors] = useState({
        nickname: false,
        email: false,
        password: false,
        passwordConfirm: false,
        age: false,
        university: false,
        bio: false,
        seekingFor: false,
        skills: false,
        seekingRoles: false,
    });

    // Tag data (copied from ProfileEdit)
    const skillCategories = [
        {
            title: '💻 エンジニア',
            skills: ['フロントエンド', 'バックエンド', 'モバイルアプリ', 'ゲーム開発', 'AI / データ', 'ノーコード']
        },
        {
            title: '🎨 デザイナー',
            skills: ['UI / UXデザイン', 'グラフィック / イラスト']
        },
        {
            title: '📣 マーケ / 広報',
            skills: ['マーケティング', 'SNS運用', 'ライター']
        },
        {
            title: '💼 セールス / BizDev',
            skills: ['セールス (営業)', '事業開発 (BizDev)']
        },
        {
            title: '🎥 動画 / クリエイター',
            skills: ['動画編集', '3D / CG']
        },
        {
            title: '1️⃣ PM / ディレクター',
            skills: ['PM / ディレクター', 'コミュニティ運営']
        },
        {
            title: '💰 財務 / 専門職',
            skills: ['財務 / 会計', '法務 / 知財']
        },
        {
            title: '🌏 その他 / 語学',
            skills: ['英語 / 語学']
        }
    ];

    const seekingOptions = [
        '💻 エンジニア',
        '🎨 デザイナー',
        '📣 マーケ / 広報',
        '💼 セールス / BizDev',
        '🎥 動画 / クリエイター',
        '1️⃣ PM / ディレクター',
        '💰 財務 / 専門職',
        '🌏 その他 / 語学',
        '🗣️ 壁打ち相手',
        '🤔 まだ分からない',
    ];

    const seekingForOptions = [
        'ビジネスメンバー探し',
        'アイデア模索中',
        'コミュニティ形成',
        'まずは話してみたい',
        '起業に興味あり',
        '壁打ち相手募集',
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

    const validateStep1 = () => {
        let isValid = true;
        const newErrors = { ...errors };
        let errorMessage = '';

        if (!nickname.trim()) {
            newErrors.nickname = true;
            isValid = false;
            if (!errorMessage) errorMessage = 'ニックネームを入力してください。';
        } else {
            newErrors.nickname = false;
        }

        if (!email.trim()) {
            newErrors.email = true;
            isValid = false;
            if (!errorMessage) errorMessage = 'メールアドレスを入力してください。';
        } else if (!email.includes('@')) {
            newErrors.email = true;
            isValid = false;
            if (!errorMessage) errorMessage = '正しいメールアドレスを入力してください。';
        } else {
            newErrors.email = false;
        }

        if (password.length < 8) {
            newErrors.password = true;
            isValid = false;
            if (!errorMessage) errorMessage = 'パスワードは8文字以上で設定してください。';
        } else {
            newErrors.password = false;
        }

        if (password !== passwordConfirm) {
            newErrors.passwordConfirm = true;
            isValid = false;
            if (!errorMessage) errorMessage = 'パスワードが一致しません。';
        } else {
            newErrors.passwordConfirm = false;
        }

        setErrors(newErrors);

        if (!isValid) {
            Alert.alert('エラー', errorMessage || '入力内容を確認してください。');
        }
        return isValid;
    };

    const validateStep2 = () => {
        let isValid = true;
        const newErrors = { ...errors };
        let errorMessage = '';

        if (!age.trim()) {
            newErrors.age = true;
            isValid = false;
            if (!errorMessage) errorMessage = '年齢を入力してください。';
        } else if (isNaN(Number(age))) {
            newErrors.age = true;
            isValid = false;
            if (!errorMessage) errorMessage = '年齢は半角数字で入力してください。';
        } else {
            newErrors.age = false;
        }

        if (!university.trim()) {
            newErrors.university = true;
            isValid = false;
            if (!errorMessage) errorMessage = '職種 / 大学名を入力してください。';
        } else {
            newErrors.university = false;
        }

        if (!bio.trim()) {
            newErrors.bio = true;
            isValid = false;
            if (!errorMessage) errorMessage = '自己紹介文を入力してください。';
        } else {
            newErrors.bio = false;
        }

        setErrors(newErrors);

        if (!isValid) {
            Alert.alert('エラー', errorMessage || '入力内容を確認してください。');
        }
        return isValid;
    };

    const validateStep3 = () => {
        let isValid = true;
        const newErrors = { ...errors };

        if (seekingFor.length === 0) newErrors.seekingFor = true;
        else newErrors.seekingFor = false;

        if (skills.length === 0) newErrors.skills = true;
        else newErrors.skills = false;

        if (seekingRoles.length === 0) newErrors.seekingRoles = true;
        else newErrors.seekingRoles = false;

        setErrors(newErrors);

        if (seekingFor.length === 0 || skills.length === 0 || seekingRoles.length === 0) {
            Alert.alert('エラー', 'すべての項目で少なくとも1つのタグを選択してください。');
            isValid = false;
        }
        return isValid;
    };

    const handleNext = () => {
        if (step === 1) {
            if (validateStep1()) setStep(2);
        } else if (step === 2) {
            if (validateStep2()) setStep(3);
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep((step - 1) as 1 | 2 | 3);
        } else {
            onCancel();
        }
    };

    const handleComplete = () => {
        if (validateStep3()) {
            // Here you would typically save the data
            console.log('Registration complete', {
                email, password, nickname, age, university, bio,
                seekingFor, skills, seekingRoles
            });
            onComplete();
        }
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>
            <View style={styles.progressContainer}>
                <Text style={styles.headerTitle}>アカウント作成</Text>
                <Text style={styles.stepText}>Step {step}/3</Text>
            </View>
            <View style={styles.placeholder} />
        </View>
    );

    const renderProgressBar = () => (
        <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${(step / 3) * 100}%` }]} />
        </View>
    );

    const renderStep1 = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>アカウント情報</Text>
            <Text style={styles.stepSubtitle}>メールアドレスとパスワードを設定してください</Text>

            <View style={styles.formGroup}>
                <Text style={styles.label}>ニックネーム</Text>
                <TextInput
                    value={nickname}
                    onChangeText={(text) => {
                        setNickname(text);
                        if (errors.nickname) setErrors({ ...errors, nickname: false });
                    }}
                    placeholder="例: タロウ"
                    autoCapitalize="none"
                    textContentType="none"
                    autoComplete="off"
                    importantForAutofill="no"
                    autoCorrect={false}
                    spellCheck={false}
                    style={[
                        styles.input,
                        { backgroundColor: '#ffffff' },
                        errors.nickname && styles.inputError
                    ]}
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>メールアドレス</Text>
                <TextInput
                    value={email}
                    onChangeText={(text) => {
                        setEmail(text);
                        if (errors.email) setErrors({ ...errors, email: false });
                    }}
                    placeholder="example@email.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    textContentType="emailAddress"
                    autoComplete="off"
                    importantForAutofill="no"
                    autoCorrect={false}
                    spellCheck={false}
                    style={[
                        styles.input,
                        { backgroundColor: '#ffffff' },
                        errors.email && styles.inputError
                    ]}
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>パスワード</Text>
                <TextInput
                    value={password}
                    onChangeText={(text) => {
                        setPassword(text);
                        if (errors.password) setErrors({ ...errors, password: false });
                    }}
                    placeholder="8文字以上"
                    secureTextEntry={true}
                    textContentType="oneTimeCode"
                    autoComplete="off"
                    importantForAutofill="no"
                    autoCorrect={false}
                    spellCheck={false}
                    style={[
                        styles.input,
                        { backgroundColor: '#ffffff' },
                        errors.password && styles.inputError
                    ]}
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>パスワード（確認）</Text>
                <TextInput
                    value={passwordConfirm}
                    onChangeText={(text) => {
                        setPasswordConfirm(text);
                        if (errors.passwordConfirm) setErrors({ ...errors, passwordConfirm: false });
                    }}
                    placeholder="もう一度入力してください"
                    secureTextEntry={true}
                    textContentType="oneTimeCode"
                    autoComplete="off"
                    importantForAutofill="no"
                    autoCorrect={false}
                    spellCheck={false}
                    style={[
                        styles.input,
                        { backgroundColor: '#ffffff' },
                        errors.passwordConfirm && styles.inputError
                    ]}
                />
            </View>
        </View>
    );

    const renderStep2 = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>基本プロフィール</Text>
            <Text style={styles.stepSubtitle}>あなたの基本情報を入力してください</Text>

            <View style={styles.formGroup}>
                <Text style={styles.label}>年齢</Text>
                <TextInput
                    value={age}
                    onChangeText={(text) => {
                        setAge(text);
                        if (errors.age) setErrors({ ...errors, age: false });
                    }}
                    placeholder="例: 20"
                    keyboardType="numeric"
                    textContentType="none"
                    autoComplete="off"
                    importantForAutofill="no"
                    autoCorrect={false}
                    spellCheck={false}
                    style={[
                        styles.input,
                        { backgroundColor: '#ffffff' },
                        errors.age && styles.inputError
                    ]}
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>職種 / 大学名</Text>
                <TextInput
                    value={university}
                    onChangeText={(text) => {
                        setUniversity(text);
                        if (errors.university) setErrors({ ...errors, university: false });
                    }}
                    placeholder="例: 東京大学 / 株式会社〇〇"
                    textContentType="none"
                    autoComplete="off"
                    importantForAutofill="no"
                    autoCorrect={false}
                    spellCheck={false}
                    style={[
                        styles.input,
                        { backgroundColor: '#ffffff' },
                        errors.university && styles.inputError
                    ]}
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>自己紹介文</Text>
                <TextInput
                    value={bio}
                    onChangeText={(text) => {
                        setBio(text);
                        if (errors.bio) setErrors({ ...errors, bio: false });
                    }}
                    placeholder="自己紹介を入力してください"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    textContentType="none"
                    autoComplete="off"
                    importantForAutofill="no"
                    autoCorrect={false}
                    spellCheck={false}
                    style={[
                        styles.input,
                        styles.textArea,
                        { backgroundColor: '#ffffff' },
                        errors.bio && styles.inputError
                    ]}
                />
            </View>
        </View>
    );

    const renderStep3 = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>タグ設定</Text>
            <Text style={styles.stepSubtitle}>あなたのスキルや目的を選択してください</Text>

            {/* Status/Purpose */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Ionicons name="flag-outline" size={20} color={errors.seekingFor ? "#ef4444" : "#0d9488"} />
                    <Text style={[styles.sectionTitle, errors.seekingFor && styles.sectionTitleError]}>🌱 現在のステータス・目的</Text>
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

            {/* Skills */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Ionicons name="flash-outline" size={20} color={errors.skills ? "#ef4444" : "#0d9488"} />
                    <Text style={[styles.sectionTitle, errors.skills && styles.sectionTitleError]}>⚡️ 持っているスキル</Text>
                </View>
                {skillCategories.map((category, categoryIndex) => (
                    <View key={categoryIndex}>
                        <Text style={styles.categoryTitle}>{category.title}</Text>
                        <View style={styles.chipContainer}>
                            {category.skills.map((skill) => (
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
                ))}
            </View>

            {/* Seeking Roles */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Ionicons name="people-outline" size={20} color={errors.seekingRoles ? "#ef4444" : "#0d9488"} />
                    <Text style={[styles.sectionTitle, errors.seekingRoles && styles.sectionTitleError]}>🤝 求める仲間・条件</Text>
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
    );



    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                {renderHeader()}
                {renderProgressBar()}

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View>
                            {step === 1 && renderStep1()}
                            {step === 2 && renderStep2()}
                            {step === 3 && renderStep3()}
                        </View>
                    </TouchableWithoutFeedback>
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity
                        onPress={step === 3 ? handleComplete : handleNext}
                        activeOpacity={0.9}
                    >
                        <LinearGradient
                            colors={['#0d9488', '#14b8a6']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.nextButton}
                        >
                            <Text style={styles.nextButtonText}>
                                {step === 3 ? '登録してはじめる' : '次へ'}
                            </Text>
                            {step < 3 && <Ionicons name="arrow-forward" size={20} color="white" />}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
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
    backButton: {
        padding: 8,
    },
    progressContainer: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
    },
    stepText: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 2,
    },
    placeholder: {
        width: 40,
    },
    progressBarBg: {
        height: 4,
        backgroundColor: '#e5e7eb',
        width: '100%',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#0d9488',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    stepContainer: {
        marginBottom: 20,
    },
    stepTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 8,
    },
    stepSubtitle: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 24,
    },
    formGroup: {
        marginBottom: 20,
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
        paddingVertical: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#000',
    },
    inputError: {
        backgroundColor: '#fef2f2',
        borderColor: '#ef4444',
    },
    sectionTitleError: {
        color: '#ef4444',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
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
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 8,
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
        backgroundColor: '#f0fdfa',
        borderColor: '#0d9488',
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
    categoryTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#6b7280',
        marginTop: 16,
        marginBottom: 8,
    },
    footer: {
        padding: 16,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
    nextButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
        borderRadius: 12,
    },
    nextButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
