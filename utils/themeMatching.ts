import { Profile } from '../types';

/**
 * テーマタイトルから検索用キーワードを抽出する
 * 絵文字を除去し、区切り文字（スラッシュ、スペース、中黒）で分割する
 */
export const getThemeKeywords = (themeTitle: string): string[] => {
    // 絵文字を除去
    // Unicode Ranges: Emoticons, Misc Symbols and Pictographs, Transport and Map Symbols, Enclosed Alphanumeric Supplement, Misc Symbols, Dingbats
    const cleanTitle = themeTitle.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();

    // 区切り文字で分割して空文字を除去
    return cleanTitle.split(/[\/\s・]+/).filter(k => k.length > 0);
};

/**
 * プロフィールが指定されたテーマにマッチするか判定する
 */
export const isProfileMatchingTheme = (profile: Profile, themeTitle: string): boolean => {
    const keywords = getThemeKeywords(themeTitle);

    // プロフィールの関連テキストを結合 (bioも含めることで検索ヒット率を上げる)
    const profileText = `${profile.theme || ''} ${profile.challengeTheme || ''} ${profile.bio || ''} ${profile.skills.join(' ')}`.toLowerCase();

    return keywords.some(keyword => {
        const lowerKeyword = keyword.toLowerCase();

        // 1. キーワードがプロフィール文に含まれている
        if (profileText.includes(lowerKeyword)) return true;

        // 2. プロフィールのスキルがキーワードの一部である（例: テーマ"AIプロダクト" -> スキル"AI"を持つユーザーもヒットさせる）
        const hasMatchingSkill = profile.skills.some(skill =>
            lowerKeyword.includes(skill.toLowerCase()) && skill.length > 1 // 1文字のスキルは誤検知防止のため除外
        );

        return hasMatchingSkill;
    });
};
