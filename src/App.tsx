import React, { useEffect, useState } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Auth from './screens/Auth';
import Home from './screens/Home';
import Groups from './screens/Groups';
import Group from './screens/Group';
import Activity from './screens/Activity';
import Profile from './screens/Profile';
import NewSplitHub from './screens/NewSplitHub';
import { StatusBar } from 'expo-status-bar';
import { theme } from './theme';
import { getToken } from './services/storage';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.brand,
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: { backgroundColor: '#0F172A', borderTopColor: '#0F172A', height: 64 },
        tabBarLabelStyle: { fontWeight: '700' },
      }}
    >
      <Tab.Screen name="Friends" component={Home} />
      <Tab.Screen name="Groups" component={Groups} />
      <Tab.Screen
        name="New"
        component={NewSplitHub}
        options={{
          tabBarLabel: 'Add',
          // keep default button; center FAB styling can be added later with a custom tabBarButton
        }}
      />
      <Tab.Screen name="Activity" component={Activity} />
      <Tab.Screen name="Account" component={Profile} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [initial, setInitial] = useState<'Auth' | 'Main'>('Auth');
  useEffect(() => {
    setInitial(getToken() ? 'Main' : 'Auth');
  }, []);

  const navTheme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: theme.colors.bg } };

  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style="light" />
      <Stack.Navigator initialRouteName={initial} screenOptions={{ headerShadowVisible: false, contentStyle: { backgroundColor: theme.colors.bg } }}>
        <Stack.Screen name="Auth" component={Auth} options={{ headerShown: false }} />
        <Stack.Screen name="Main" component={Tabs} options={{ headerShown: false }} />
        <Stack.Screen name="Group" component={Group} options={{ title: 'Group' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
