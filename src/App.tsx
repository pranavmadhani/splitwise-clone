import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  createBottomTabNavigator,
  BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Auth from './screens/Auth';
import Home from './screens/Home';
import Groups from './screens/Groups';
import Group from './screens/Group';
import Activity from './screens/Activity';
import Profile from './screens/Profile';
import { getToken } from './services/storage';
import { StatusBar } from 'expo-status-bar';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const BAR = {
  bg: '#2c2f33',
  bg2: '#232629',
  icon: '#b8c0c7',
  active: '#16c79a',
  text: '#e9edf0',
  shadow: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOpacity: 0.25,
      shadowOffset: { width: 0, height: 8 },
      shadowRadius: 16,
    },
    android: { elevation: 16 },
  }),
};

function MintTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom, 10);

  const onCenterPress = () => {
    // For now, jump to "Groups" (create group / pick group → add).
    // I can wire this to a true AddExpense modal on your next go.
    navigation.navigate('Groups' as never);
  };

  return (
    <View
      pointerEvents="box-none"
      style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}
    >
      <View style={[styles.bar, { paddingBottom: bottom }, BAR.shadow as any]}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const options = descriptors[route.key].options;
          const label =
            (options.tabBarLabel as string) ??
            (options.title as string) ??
            route.name;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name as never);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          const iconName = (() => {
            switch (route.name) {
              case 'Home':
                return 'view-grid-outline';
              case 'Groups':
                return 'account-group-outline'; // shows as "Friends" label below
              case 'Activity':
                return 'chart-line-variant';
              case 'Profile':
                return 'account-outline';
              default:
                return 'circle-outline';
            }
          })();

          const item = (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.item}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name={iconName}
                size={24}
                color={isFocused ? BAR.active : BAR.icon}
              />
              <Text
                style={[
                  styles.label,
                  { color: isFocused ? BAR.active : BAR.icon },
                ]}
              >
                {label === 'Profile' ? 'Account' : label === 'Groups' ? 'Friends' : label}
              </Text>
            </TouchableOpacity>
          );

          if (index === 1) {
            // leave a hole for the center FAB
            return (
              <View
                key={`${route.key}-with-center`}
                style={{ flexDirection: 'row', alignItems: 'center' }}
              >
                {item}
                <View style={{ width: 84 }} />
              </View>
            );
          }

          return item;
        })}

        {/* Center floating +, perfectly centered */}
        <TouchableOpacity onPress={onCenterPress} activeOpacity={0.9} style={styles.fab}>
          <MaterialCommunityIcons name="plus" size={30} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Tabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={(p) => <MintTabBar {...p} />}>
      <Tab.Screen name="Home" component={Home} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="Groups" component={Groups} options={{ tabBarLabel: 'Friends' }} />
      <Tab.Screen name="Activity" component={Activity} options={{ tabBarLabel: 'Activity' }} />
      <Tab.Screen name="Profile" component={Profile} options={{ tabBarLabel: 'Account' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [initialRoute, setInitialRoute] = React.useState<'Auth' | 'Main'>('Auth');
  useEffect(() => {
    setInitialRoute(getToken() ? 'Main' : 'Auth');
  }, []);

  const navTheme = {
    ...DefaultTheme,
    colors: { ...DefaultTheme.colors, background: '#0e1113' },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShadowVisible: false,
          headerStyle: { backgroundColor: '#0e1113' },
          headerTintColor: '#fff',
          contentStyle: { backgroundColor: '#0e1113' },
        }}
      >
        <Stack.Screen name="Auth" component={Auth} options={{ headerShown: false }} />
        <Stack.Screen name="Main" component={Tabs} options={{ headerShown: false }} />
        <Stack.Screen name="Group" component={Group} options={{ title: 'Group' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  bar: {
    width: '100%',               // <— add this
  marginHorizontal: 12,
  marginBottom: 8,
  backgroundColor: BAR.bg,
  borderRadius: 22,
  borderWidth: 1,
  borderColor: BAR.bg2,
  minHeight: 66,
  paddingTop: 10,
  paddingHorizontal: 12,
  flexDirection: 'row',
  alignItems: 'flex-end',
  justifyContent: 'space-between',
  },
  item: {
    height: 58,
    minWidth: 68,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
  },
  fab: {
  position: 'absolute',
  left: '50%',                 // hard center
  bottom: 30,
  width: 64,
  height: 64,
  borderRadius: 32,
  backgroundColor: BAR.active,
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 3,
  borderColor: BAR.bg,
  transform: [{ translateX: -32 }],   // center offset
},
});
