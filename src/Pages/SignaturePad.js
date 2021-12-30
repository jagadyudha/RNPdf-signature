import React, { ref } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import SignatureScreen from 'react-native-signature-canvas';

const SignaturePad = ({ route, navigation }) => {
  const handleSignature = (signature) => {
    route.params.onReturn(signature.replace('data:image/png;base64,', ''));
    navigation.goBack();
  };

  const style = `.m-signature-pad {box-shadow: none; border: none; } 
                  body,html {
                  width: 100%; height: 50%;}`;

  return (
    <SignatureScreen
      webStyle={style}
      ref={ref}
      onOK={(sig) => handleSignature(sig)}
      onEmpty={() => console.log('___onEmpty')}
      descriptionText='Sign'
      clearText='Clear'
      confirmText='Confirm'
    />
  );
};

export default SignaturePad;

const styles = StyleSheet.create({});
