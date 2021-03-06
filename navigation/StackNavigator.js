import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import GettingStarted from '../screens/Login/getting_started';
import Login from '../screens/Login/login';
import Signup from '../screens/Signup/signup';
import DrawerNavigator from './DrawerNavigator';
import isFirstLaunch from '../utils/checkFirstLaunch';

const StackNavigator = () => {
  const [firstLaunch, setFirstLaunch] = useState(false);

  useEffect(() => {
    isFirstLaunch().then((bool) =>
      bool ? setFirstLaunch(true) : setFirstLaunch(false)
    );
  }, []);

  const firstLaunchStack = createNativeStackNavigator();
  const nextLaunchStack = createNativeStackNavigator();
  const FirstLaunchStackScreen = () => {
    return (
      <firstLaunchStack.Navigator initialRouteName="GettingStarted">
        <firstLaunchStack.Screen
          options={{ headerShown: false }}
          name="GettingStarted"
          component={GettingStarted}
        />
        <firstLaunchStack.Screen
          options={{ headerShown: false }}
          name="Login"
          component={Login}
        />
        <firstLaunchStack.Screen
          name="Sign Up"
          component={Signup}
        ></firstLaunchStack.Screen>

        <firstLaunchStack.Screen
          options={{ headerShown: false }}
          name="StackHome"
          component={DrawerNavigator}
        />
      </firstLaunchStack.Navigator>
    );
  };

  const NextLaunchStackScreen = () => {
    return (
      <nextLaunchStack.Navigator initialRouteName="Login">
        <nextLaunchStack.Screen
          options={{ headerShown: false }}
          name="Login"
          component={Login}
        />
        <nextLaunchStack.Screen
          options={{ headerShown: false }}
          name="StackHome"
          component={DrawerNavigator}
        />
        <nextLaunchStack.Screen
          name="Sign Up"
          component={Signup}
        ></nextLaunchStack.Screen>
      </nextLaunchStack.Navigator>
    );
  };

  return (
    <NavigationContainer>
      {firstLaunch ? <FirstLaunchStackScreen /> : <NextLaunchStackScreen />}
    </NavigationContainer>
  );
};

export default StackNavigator;
