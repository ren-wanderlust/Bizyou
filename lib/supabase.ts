import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra as {
    supabaseUrl?: string;
    supabaseAnonKey?: string;
};
const SUPABASE_URL = extra?.supabaseUrl;
const SUPABASE_ANON_KEY = extra?.supabaseAnonKey;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase URL and Anon Key must be set in app.config.ts');
}

// TypeScriptの型チェックを通過させるため、ここで型を確定させる
const SUPABASE_URL_FINAL: string = SUPABASE_URL;
const SUPABASE_ANON_KEY_FINAL: string = SUPABASE_ANON_KEY;

// セッションの永続化にSecureStoreを使用するアダプター
const ExpoSecureStoreAdapter = {
    getItem: (key: string) => {
        return SecureStore.getItemAsync(key);
    },
    setItem: (key: string, value: string) => {
        SecureStore.setItemAsync(key, value);
    },
    removeItem: (key: string) => {
        SecureStore.deleteItemAsync(key);
    },
};

export const supabase = createClient(SUPABASE_URL_FINAL, SUPABASE_ANON_KEY_FINAL, {
    auth: {
        storage: Platform.OS === 'web' ? undefined : ExpoSecureStoreAdapter, // Webの場合はデフォルト(localStorage)を使用
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
