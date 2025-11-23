import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, FlatList, TouchableOpacity, Platform, RefreshControl, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LoginScreen } from './components/LoginScreen';
import { ProfileCard } from './components/ProfileCard';
import { ProfileDetail } from './components/ProfileDetail';
import { BottomNav } from './components/BottomNav';
import { MyPage } from './components/MyPage';
import { LikesPage } from './components/LikesPage';
import { TalkPage } from './components/TalkPage';
import { ChatRoom } from './components/ChatRoom';
import { ChallengeCardPage } from './components/ChallengeCardPage';
import { NotificationsPage } from './components/NotificationsPage';
import { SignupFlow } from './components/SignupFlow';
import { FilterModal, FilterCriteria } from './components/FilterModal';
import { ProfileEdit } from './components/ProfileEdit';
import { SettingsPage } from './components/SettingsPage';
import { HelpPage } from './components/HelpPage';
import { ThemeDetailPage } from './components/ThemeDetailPage';
import { LegalDocumentPage } from './components/LegalDocumentPage';
import { OnboardingScreen } from './components/OnboardingScreen';
import { Profile } from './types';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { supabase } from './lib/supabase';
import { Alert } from 'react-native';

// Placeholder component for tabs under development
const PlaceholderScreen = ({ title }: { title: string }) => (
  <View style={styles.centerContainer}>
    <Text style={styles.placeholderTitle}>{title}</Text>
    <Text style={styles.placeholderText}>開発中</Text>
  </View>
);

function AppContent() {
  const { session, loading: authLoading, signOut } = useAuth();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const [showSignup, setShowSignup] = useState(false);

  React.useEffect(() => {
    // Simulate checking onboarding status
    const checkOnboarding = async () => {
      // In a real app, check AsyncStorage here
      setTimeout(() => {
        setHasCompletedOnboarding(true);
      }, 1000);
    };
    checkOnboarding();
  }, []);

  const [likedProfiles, setLikedProfiles] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState('search');
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [activeChatRoom, setActiveChatRoom] = useState<{
    partnerName: string;
    partnerImage: string;
  } | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteria | null>(null);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [legalDocument, setLegalDocument] = useState<{ title: string; content: string } | null>(null);

  const [currentUser, setCurrentUser] = useState<Profile | null>(null);

  const [sortOrder, setSortOrder] = useState<'recommended' | 'newest'>('recommended');
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);

  const [displayProfiles, setDisplayProfiles] = useState<Profile[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);

  // Fetch profiles from Supabase
  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) throw error;

      if (data) {
        // Map Supabase data to Profile type if necessary (snake_case to camelCase)
        // Assuming the table columns match the Profile type or we map them here
        const mappedProfiles: Profile[] = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          age: item.age,
          location: item.location || '', // Handle optional fields
          university: item.university,
          company: item.company,
          image: item.image,
          challengeTheme: item.challenge_theme || '', // Map snake_case
          theme: item.theme || '',
          bio: item.bio,
          skills: item.skills || [],
          seekingFor: item.seeking_for || [],
          seekingRoles: item.seeking_roles || [],
          statusTags: item.status_tags || [],
          isStudent: item.is_student,
          createdAt: item.created_at,
        }));
        setDisplayProfiles(mappedProfiles);
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
      Alert.alert('エラー', 'データの取得に失敗しました');
    }
  };

  // Fetch current user profile
  const fetchCurrentUser = async () => {
    if (!session?.user) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;

      if (data) {
        const mappedUser: Profile = {
          id: data.id,
          name: data.name,
          age: data.age,
          location: data.location || '',
          university: data.university,
          company: data.company,
          image: data.image,
          challengeTheme: data.challenge_theme || '',
          theme: data.theme || '',
          bio: data.bio,
          skills: data.skills || [],
          seekingFor: data.seeking_for || [],
          seekingRoles: data.seeking_roles || [],
          statusTags: data.status_tags || [],
          isStudent: data.is_student,
          createdAt: data.created_at,
        };
        setCurrentUser(mappedUser);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  React.useEffect(() => {
    fetchProfiles();
  }, []);

  React.useEffect(() => {
    if (session?.user) {
      fetchCurrentUser();
    }
  }, [session]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchProfiles();
    setRefreshing(false);
  }, []);

  // Determine if filter is active
  const isFilterActive = React.useMemo(() => {
    if (!filterCriteria) return false;
    const { ageMin, ageMax, location, isStudentOnly, statuses, keyword } = filterCriteria;
    return (
      (ageMin && ageMin !== '18') ||
      (ageMax && ageMax !== '25') ||
      (location && location !== '') ||
      isStudentOnly ||
      (statuses && statuses.length > 0) ||
      (keyword && keyword !== '')
    );
  }, [filterCriteria]);

  // Filtering logic
  const filteredProfiles = displayProfiles.filter(profile => {
    if (!filterCriteria) return true;

    // Keyword filter
    if (filterCriteria.keyword) {
      const lowerKeyword = filterCriteria.keyword.toLowerCase();
      const matchName = profile.name.toLowerCase().includes(lowerKeyword);
      const matchTheme = profile.challengeTheme.toLowerCase().includes(lowerKeyword);
      const matchSkills = profile.skills.some(skill => skill.toLowerCase().includes(lowerKeyword));
      if (!matchName && !matchTheme && !matchSkills) return false;
    }

    // Age filter
    if (filterCriteria.ageMin && profile.age < parseInt(filterCriteria.ageMin)) return false;
    if (filterCriteria.ageMax && profile.age > parseInt(filterCriteria.ageMax)) return false;

    // Location filter
    if (filterCriteria.location && !profile.location.includes(filterCriteria.location)) return false;

    // Student filter
    if (filterCriteria.isStudentOnly && !profile.isStudent) return false;

    // Status filter
    if (filterCriteria.statuses && filterCriteria.statuses.length > 0) {
      const matchStatus = profile.statusTags?.some(tag => filterCriteria.statuses!.includes(tag)) ||
        profile.seekingFor?.some(tag => filterCriteria.statuses!.includes(tag));
      if (!matchStatus) return false;
    }

    return true;
  });

  // Sorting logic
  const sortedProfiles = [...filteredProfiles].sort((a, b) => {
    if (sortOrder === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return 0; // Recommended order (default)
  });

  const handleLike = (profileId: string) => {
    setLikedProfiles((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(profileId)) {
        newSet.delete(profileId);
      } else {
        newSet.add(profileId);
      }
      return newSet;
    });
  };

  const handleSaveProfile = async (updatedProfile: Profile) => {
    if (!session?.user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: updatedProfile.name,
          age: updatedProfile.age,
          university: updatedProfile.university,
          company: updatedProfile.company,
          bio: updatedProfile.bio,
          skills: updatedProfile.skills,
          seeking_for: updatedProfile.seekingFor,
          seeking_roles: updatedProfile.seekingRoles,
          // status_tags: updatedProfile.statusTags, // Assuming this is derived or editable
        })
        .eq('id', session.user.id);

      if (error) throw error;

      setCurrentUser(updatedProfile);
      setShowProfileEdit(false);
      Alert.alert('完了', 'プロフィールを更新しました');
      fetchProfiles(); // Refresh list to show updates
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Alert.alert('エラー', 'プロフィールの更新に失敗しました');
    }
  };

  const handleEditProfile = () => {
    setShowProfileEdit(true);
  };

  // Show loading screen while checking onboarding status or auth status
  if (hasCompletedOnboarding === null || authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#009688" />
        <Text style={styles.loadingText}>読み込み中...</Text>
      </View>
    );
  }

  if (showSignup) {
    return (
      <SafeAreaProvider>
        <SignupFlow
          onComplete={() => {
            setShowSignup(false);
            // Session is handled by AuthProvider
          }}
          onCancel={() => setShowSignup(false)}
        />
      </SafeAreaProvider>
    );
  }

  if (!session) {
    return (
      <LoginScreen
        onCreateAccount={() => setShowSignup(true)}
      />
    );
  }

  // Show profile detail if selected
  if (selectedProfile) {
    return (
      <SafeAreaProvider>
        <ProfileDetail
          profile={selectedProfile}
          onBack={() => setSelectedProfile(null)}
          onLike={() => handleLike(selectedProfile.id)}
          isLiked={likedProfiles.has(selectedProfile.id)}
        />
      </SafeAreaProvider>
    );
  }

  // Show chat room if active
  if (activeChatRoom) {
    return (
      <SafeAreaProvider>
        <ChatRoom
          partnerName={activeChatRoom.partnerName}
          partnerImage={activeChatRoom.partnerImage}
          onBack={() => setActiveChatRoom(null)}
          onPartnerProfilePress={() => {
            const partner = displayProfiles.find(p => p.name === activeChatRoom.partnerName);
            if (partner) {
              setSelectedProfile(partner);
            }
          }}
        />
      </SafeAreaProvider>
    );
  }

  // Show profile edit screen if active
  if (showProfileEdit) {
    return (
      <SafeAreaProvider>
        <ProfileEdit
          initialProfile={currentUser!}
          onSave={handleSaveProfile}
          onCancel={() => setShowProfileEdit(false)}
        />
      </SafeAreaProvider>
    );
  }

  // Show notifications page if active
  if (showNotifications) {
    return (
      <SafeAreaProvider>
        <NotificationsPage onBack={() => setShowNotifications(false)} />
      </SafeAreaProvider>
    );
  }

  // Authenticated View - Main Screen
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />

        {/* Header - Only show on search tab */}
        {activeTab === 'search' && (
          <View style={styles.headerContainer}>
            {/* Top Header */}
            <View style={styles.headerTop}>
              <View style={styles.headerLeft} />
              <Text style={styles.headerTitle}>BizYou</Text>
              <TouchableOpacity
                style={styles.notificationButton}
                onPress={() => setShowNotifications(true)}
              >
                <Ionicons name="notifications-outline" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            {/* Search Control Bar */}
            <View style={styles.searchControlBar}>
              <TouchableOpacity
                onPress={() => setIsFilterOpen(true)}
                style={[
                  styles.filterButton,
                  isFilterActive && styles.filterButtonActive
                ]}
              >
                <Ionicons
                  name="search"
                  size={18}
                  color={isFilterActive ? "#FF5252" : "#666"}
                />
                <Text style={[
                  styles.controlButtonText,
                  isFilterActive && styles.controlButtonTextActive
                ]}>
                  {isFilterActive ? "絞り込み中" : "絞り込み"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setIsSortModalOpen(true)}
                style={styles.sortButton}
              >
                <Text style={styles.controlButtonText}>
                  {sortOrder === 'recommended' ? 'おすすめ順' : '登録日が新しい順'}
                </Text>
                <Ionicons name="chevron-down" size={18} color="#666" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Main Content Area */}
        <View style={styles.contentArea}>
          {activeTab !== 'search' && activeTab !== 'likes' && activeTab !== 'talk' && activeTab !== 'profile' && activeTab !== 'challenge' && (
            <PlaceholderScreen title={activeTab} />
          )}
          {activeTab === 'search' && (
            <FlatList
              data={sortedProfiles}
              renderItem={({ item }) => (
                <View style={styles.gridItem}>
                  <ProfileCard
                    profile={item}
                    isLiked={likedProfiles.has(item.id)}
                    onLike={() => handleLike(item.id)}
                    onSelect={() => {
                      console.log('Selected profile:', item.name);
                      setSelectedProfile(item);
                    }}
                  />
                </View>
              )}
              keyExtractor={(item) => item.id}
              numColumns={2}
              contentContainerStyle={styles.listContent}
              columnWrapperStyle={styles.columnWrapper}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={['#009688']}
                  tintColor="#009688"
                />
              }
              ListEmptyComponent={
                <View style={styles.centerContainer}>
                  <Text style={styles.placeholderText}>条件に一致するユーザーがいません</Text>
                </View>
              }
            />
          )}
          {activeTab === 'likes' && (
            <LikesPage
              likedProfileIds={likedProfiles}
              allProfiles={displayProfiles}
              onProfileSelect={(profile) => setSelectedProfile(profile)}
            />
          )}
          {activeTab === 'talk' && (
            <TalkPage
              onOpenChat={(room) => setActiveChatRoom({
                partnerName: room.partnerName,
                partnerImage: room.partnerImage,
              })}
            />
          )}
          {activeTab === 'challenge' && (
            selectedTheme ? (
              <ThemeDetailPage
                themeTitle={selectedTheme}
                onBack={() => setSelectedTheme(null)}
                profiles={displayProfiles}
                onProfileSelect={(profile) => setSelectedProfile(profile)}
                onLike={handleLike}
                likedProfileIds={likedProfiles}
              />
            ) : (
              <ChallengeCardPage
                onThemeSelect={setSelectedTheme}
                profiles={displayProfiles}
              />
            )
          )}
          {activeTab === 'profile' && (
            <>
              {legalDocument ? (
                <LegalDocumentPage
                  title={legalDocument.title}
                  content={legalDocument.content}
                  onBack={() => setLegalDocument(null)}
                />
              ) : showSettings ? (
                <SettingsPage
                  onBack={() => setShowSettings(false)}
                  onLogout={signOut}
                  onOpenTerms={() => setLegalDocument({
                    title: '利用規約',
                    content: '利用規約\n\nこの利用規約（以下，「本規約」といいます。）は，BizYou（以下，「当社」といいます。）がこのウェブサイト上で提供するサービス（以下，「本サービス」といいます。）の利用条件を定めるものです。登録ユーザーの皆さま（以下，「ユーザー」といいます。）には，本規約に従って，本サービスをご利用いただきます。\n\n第1条（適用）\n1. 本規約は，ユーザーと当社との間の本サービスの利用に関わる一切の関係に適用されるものとします。\n2. 当社は本サービスに関し，本規約のほか，ご利用にあたってのルール等，各種の定め（以下，「個別規定」といいます。）をすることがあります。これら個別規定はその名称のいかんに関わらず，本規約の一部を構成するものとします。\n3. 本規約の規定が前項の個別規定の規定と矛盾する場合には，個別規定において特段の定めなき限り，個別規定の規定が優先されるものとします。\n\n第2条（利用登録）\n1. 本サービスにおいては，登録希望者が本規約に同意の上，当社の定める方法によって利用登録を申請し，当社がこれを承認することによって，利用登録が完了するものとします。\n2. 当社は，利用登録の申請者に以下の事由があると判断した場合，利用登録の申請を承認しないことがあり，その理由については一切の開示義務を負わないものとします。\n   (1) 利用登録の申請に際して虚偽の事項を届け出た場合\n   (2) 本規約に違反したことがある者からの申請である場合\n   (3) その他，当社が利用登録を相当でないと判断した場合\n\n第3条（ユーザーIDおよびパスワードの管理）\n1. ユーザーは，自己の責任において，本サービスのユーザーIDおよびパスワードを適切に管理するものとします。\n2. ユーザーは，いかなる場合にも，ユーザーIDおよびパスワードを第三者に譲渡または貸与し，もしくは第三者と共用することはできません。当社は，ユーザーIDとパスワードの組み合わせが登録情報と一致してログインされた場合には，そのユーザーIDを登録しているユーザー自身による利用とみなします。\n3. ユーザーID及びパスワードが第三者によって使用されたことによって生じた損害は，当社に故意又は重大な過失がある場合を除き，当社は一切の責任を負わないものとします。\n\n（以下省略）'
                  })}
                  onOpenPrivacy={() => setLegalDocument({
                    title: 'プライバシーポリシー',
                    content: 'プライバシーポリシー\n\nBizYou（以下，「当社」といいます。）は，本ウェブサイト上で提供するサービス（以下，「本サービス」といいます。）における，ユーザーの個人情報の取扱いについて，以下のとおりプライバシーポリシー（以下，「本ポリシー」といいます。）を定めます。\n\n第1条（個人情報）\n「個人情報」とは，個人情報保護法にいう「個人情報」を指すものとし，生存する個人に関する情報であって，当該情報に含まれる氏名，生年月日，住所，電話番号，連絡先その他の記述等により特定の個人を識別できる情報及び容貌，指紋，声紋にかかるデータ，及び健康保険証の保険者番号などの当該情報単体から特定の個人を識別できる情報（個人識別情報）を指します。\n\n第2条（個人情報の収集方法）\n当社は，ユーザーが利用登録をする際に氏名，生年月日，住所，電話番号，メールアドレス，銀行口座番号，クレジットカード番号，運転免許証番号などの個人情報をお尋ねすることがあります。また，ユーザーと提携先などとの間でなされたユーザーの個人情報を含む取引記録や決済に関する情報を,当社の提携先（情報提供元，広告主，広告配信先などを含みます。以下，｢提携先｣といいます。）などから収集することがあります。\n\n第3条（個人情報を収集・利用する目的）\n当社が個人情報を収集・利用する目的は，以下のとおりです。\n1. 当社サービスの提供・運営のため\n2. ユーザーからのお問い合わせに回答するため（本人確認を行うことを含む）\n3. ユーザーが利用中のサービスの新機能，更新情報，キャンペーン等及び当社が提供する他のサービスの案内のメールを送付するため\n4. メンテナンス，重要なお知らせなど必要に応じたご連絡のため\n5. 利用規約に違反したユーザーや，不正・不当な目的でサービスを利用しようとするユーザーの特定をし，ご利用をお断りするため\n6. ユーザーにご自身の登録情報の閲覧や変更，削除，ご利用状況の閲覧を行っていただくため\n7. 有料サービスにおいて，ユーザーに利用料金を請求するため\n8. 上記の利用目的に付随する目的\n\n（以下省略）'
                  })}
                />
              ) : showHelp ? (
                <HelpPage
                  onBack={() => setShowHelp(false)}
                />
              ) : (
                currentUser ? (
                  <MyPage
                    profile={currentUser}
                    onLogout={signOut}
                    onEditProfile={handleEditProfile}
                    onOpenNotifications={() => setShowNotifications(true)}
                    onSettingsPress={() => setShowSettings(true)}
                    onHelpPress={() => setShowHelp(true)}
                  />
                ) : (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#009688" />
                  </View>
                )
              )}
            </>
          )}
        </View>
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Filter Modal */}
        <FilterModal
          visible={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          onApply={(criteria) => {
            setFilterCriteria(criteria);
            setIsFilterOpen(false);
          }}
          initialCriteria={filterCriteria || undefined}
        />

        {/* Sort Modal */}
        {isSortModalOpen && (
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.modalBackdrop}
              onPress={() => setIsSortModalOpen(false)}
            />
            <View style={styles.sortModalContent}>
              <Text style={styles.sortModalTitle}>並び替え</Text>
              <TouchableOpacity
                style={styles.sortOption}
                onPress={() => {
                  setSortOrder('recommended');
                  setIsSortModalOpen(false);
                }}
              >
                <Text style={[styles.sortOptionText, sortOrder === 'recommended' && styles.sortOptionTextActive]}>
                  おすすめ順
                </Text>
                {sortOrder === 'recommended' && <Ionicons name="checkmark" size={20} color="#0d9488" />}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.sortOption}
                onPress={() => {
                  setSortOrder('newest');
                  setIsSortModalOpen(false);
                }}
              >
                <Text style={[styles.sortOptionText, sortOrder === 'newest' && styles.sortOptionTextActive]}>
                  登録日が新しい順
                </Text>
                {sortOrder === 'newest' && <Ionicons name="checkmark" size={20} color="#0d9488" />}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  // ... (existing styles)
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA', // Updated to requested color
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  contentArea: {
    flex: 1,
    // paddingBottom handled in FlatList contentContainerStyle
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#374151',
  },
  placeholderText: {
    fontSize: 16,
    color: '#6b7280',
  },
  link: {
    color: 'blue',
    textDecorationLine: 'underline',
    padding: 10,
  },
  headerContainer: {
    backgroundColor: 'white',
    paddingBottom: 16,
    // Remove shadow/elevation for flat look
    shadowColor: "transparent",
    elevation: 0,
    zIndex: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerLeft: {
    width: 24, // Balance right icon
  },
  headerTitle: {
    fontSize: 32,
    color: '#009688',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontStyle: 'italic',
    fontWeight: 'normal', // Let the font family handle weight
  },
  notificationButton: {
    padding: 4,
  },
  searchControlBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 8,
    gap: 12,
  },
  filterButton: {
    flex: 6, // 60%
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 100,
    height: 44,
    paddingHorizontal: 16,
    gap: 8,
    justifyContent: 'flex-start', // Left aligned content
  },
  filterButtonActive: {
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#FF8A80',
  },
  sortButton: {
    flex: 4, // 40% (approx 35% requested, adjusted for gap)
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 100,
    height: 44,
    paddingHorizontal: 16,
    gap: 4,
    justifyContent: 'center',
  },
  controlButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  controlButtonTextActive: {
    color: '#FF5252',
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    gap: 12,
  },
  gridItem: {
    // width is handled in ProfileCard
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sortModalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  sortModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#111827',
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  sortOptionText: {
    fontSize: 16,
    color: '#374151',
  },
  sortOptionTextActive: {
    color: '#0d9488',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    color: '#009688',
    fontSize: 16,
  },
});
