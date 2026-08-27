import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../auth/AuthContext';
import { hasSeenOnboarding, markOnboardingSeen } from '../auth/storage';
import LoginScreen from '../screens/LoginScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ProfileScreen from '../screens/ProfileScreen';
import DocumentsScreen from '../screens/DocumentsScreen';
import RecordsScreen from '../screens/RecordsScreen';
import HelsbScreen from '../screens/HelsbScreen';
import { colors } from '../theme';

export type TabParamList = {
  Home: undefined;
  Documents: undefined;
  Records: undefined;
  HELSB: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator<TabParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.surface,
    primary: colors.indigo,
    text: colors.navy,
    card: colors.white,
    border: colors.border,
  },
};

function StudentTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerTitleStyle: { fontWeight: '800', color: colors.navy },
        tabBarActiveTintColor: colors.indigo,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { borderTopColor: colors.border },
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            Home: 'home-outline',
            Documents: 'document-text-outline',
            Records: 'journal-outline',
            HELSB: 'briefcase-outline',
            Profile: 'person-circle-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="Documents" component={DocumentsScreen} />
      <Tab.Screen name="Records" component={RecordsScreen} options={{ title: 'Records' }} />
      <Tab.Screen name="HELSB" component={HelsbScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const { user, ready } = useAuth();
  const [onboardingReady, setOnboardingReady] = React.useState(false);
  const [showOnboarding, setShowOnboarding] = React.useState(false);

  React.useEffect(() => {
    hasSeenOnboarding()
      .then((seen) => setShowOnboarding(!seen))
      .catch(() => setShowOnboarding(true))
      .finally(() => setOnboardingReady(true));
  }, []);

  const finishOnboarding = React.useCallback(async () => {
    await markOnboardingSeen();
    setShowOnboarding(false);
  }, []);

  if (!ready || !onboardingReady) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface }}>
        <ActivityIndicator color={colors.indigo} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {showOnboarding ? (
          <Stack.Screen name="Onboarding" options={{ animation: 'fade' }}>
            {() => <OnboardingScreen onFinished={finishOnboarding} />}
          </Stack.Screen>
        ) : user ? (
          <Stack.Screen name="Student" component={StudentTabs} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
