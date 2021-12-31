import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { fontSizer } from '../Utils/Font';
import HomeImage from '../Assets/home.png';
import { windowWidth } from '../Utils/Dimension';
import DocumentPicker, { isInProgress } from 'react-native-document-picker';
const RNFS = require('react-native-fs');

const FilePicker = ({ navigation }) => {
  const HandleOpenFile = async () => {
    try {
      const pickerResult = await DocumentPicker.pickSingle({
        presentationStyle: 'fullScreen',
        copyTo: 'cachesDirectory',
      });

      RNFS.readFile(`${pickerResult.fileCopyUri}`, 'base64').then(
        (contents) => {
          navigation.navigate('PdfReader', {
            pdfurl: pickerResult.fileCopyUri,
            pdfname: pickerResult.name,
            pdfbase: contents,
          });
        }
      );
    } catch (e) {
      handleError(e);
    }
  };

  const handleError = (err) => {
    if (DocumentPicker.isCancel(err)) {
      console.warn('cancelled');
      // User cancelled the picker, exit any dialogs or menus and move on
    } else if (isInProgress(err)) {
      console.warn(
        'multiple pickers were opened, only the last will be considered'
      );
    } else {
      throw err;
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Image
        style={{
          width: windowWidth() * 0.8199513381995134,
          aspectRatio: 1,
          resizeMode: 'contain',
        }}
        source={HomeImage}
      />
      <TouchableOpacity
        onPress={HandleOpenFile}
        style={{
          backgroundColor: '#369BFE',
          paddingVertical: 10,
          borderRadius: 5,
          width: windowWidth() * 0.8199513381995134,
        }}
      >
        <Text
          style={{ color: '#fff', fontSize: fontSizer(), textAlign: 'center' }}
        >
          Buka File PDF
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default FilePicker;

const styles = StyleSheet.create({});
