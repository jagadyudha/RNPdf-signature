//default
import React from 'react';
import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import {StatusBar} from 'react-native';
import {NativeBaseProvider} from 'native-base';
//navigation
import Router from './Router';

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#4B00E1',
    background: '#f6f6f6',
    text: '#000000',
  },
};

const App = () => {
  return (
    <NativeBaseProvider>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      <NavigationContainer theme={MyTheme}>
        <Router />
      </NavigationContainer>
    </NativeBaseProvider>
  );
};

export default App;
