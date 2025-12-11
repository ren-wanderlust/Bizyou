import { Alert } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

/**
 * エラーハンドリングユーティリティ
 */

// ネットワーク状態を確認
export const checkNetworkConnection = async (): Promise<boolean> => {
    const state = await NetInfo.fetch();
    return state.isConnected ?? false;
};

// リトライロジック付きのフェッチ
export const fetchWithRetry = async <T>(
    fetchFn: () => Promise<T>,
    maxRetries = 3,
    delay = 1000
): Promise<T> => {
    let lastError: Error;

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fetchFn();
        } catch (error) {
            lastError = error as Error;

            // ネットワークエラーかチェック
            if (!await checkNetworkConnection()) {
                throw new Error('ネットワーク接続がありません');
            }

            // 最後の試行でなければ待機
            if (i < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
            }
        }
    }

    throw lastError!;
};

// ユーザーフレンドリーなエラーメッセージ
export const handleError = (error: any, context: string = '') => {
    let message = 'エラーが発生しました';

    if (error.message?.includes('ネットワーク')) {
        message = 'ネットワーク接続を確認してください';
    } else if (error.message?.includes('timeout')) {
        message = 'タイムアウトしました。もう一度お試しください';
    } else if (error.code === 'PGRST301') {
        message = 'データが見つかりませんでした';
    } else if (context) {
        message = `${context}中にエラーが発生しました`;
    }

    Alert.alert('エラー', message);
    console.error(`Error in ${context}:`, error);
};
