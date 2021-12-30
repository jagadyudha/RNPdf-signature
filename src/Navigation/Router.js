//default
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

//pages
import FilePicker from '../Pages/FilePicker';
import PdfReader from '../Pages/PdfReader';
import SignaturePad from '../Pages/SignaturePad';

const Stack = createNativeStackNavigator();

const Router = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name='FilePicker'
        component={FilePicker}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name='PdfReader'
        component={PdfReader}
        options={({ route }) => ({
          title: route.params.pdfname,
          headerShown: true,
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontFamily: 'Poppins-Medium',
          },
          headerStyle: {
            borderBottomColor: '#E3E3E3',
            borderBottomWidth: 0.5,
            color: '#fff',
          },

          headerShadowVisible: false,
        })}
      />
      <Stack.Screen
        name='SignaturePad'
        component={SignaturePad}
        options={() => ({
          title: 'Tanda Tangan',
          headerShown: true,
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontFamily: 'Poppins-Medium',
          },
          headerStyle: {
            borderBottomColor: '#E3E3E3',
            borderBottomWidth: 0.5,
            color: '#fff',
          },

          headerShadowVisible: false,
        })}
      />
    </Stack.Navigator>
  );
};

export default Router;
