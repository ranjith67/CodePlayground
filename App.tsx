import 'react-native-get-random-values';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import PlaygroundScreen from './screens/PlaygroundScreen';
import HistoryScreen from './screens/HistoryScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';

export type RootStackParamList = {
  Playground: { code?: string };
  History: undefined;
};

const Tab = createBottomTabNavigator<RootStackParamList>();

const App = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tab.Screen
          name="Playground"
          component={PlaygroundScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="code-slash" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="History"
          component={HistoryScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="time" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;
