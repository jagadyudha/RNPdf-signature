import React, {useEffect, useState, useRef} from 'react';
import {StyleSheet, Dimensions, View, Button, Text} from 'react-native';
import Pdf from 'react-native-pdf';
import DocumentPicker, {isInProgress} from 'react-native-document-picker';
import SignatureScreen from 'react-native-signature-canvas';
import {PDFDocument} from 'pdf-lib';
import {decode as atob, encode as btoa} from 'base-64';
const RNFS = require('react-native-fs');

export default PDFExample = () => {
  const [result, setResult] = useState();
  const [getSignaturePad, setSignaturePad] = useState(false);
  const [signatureBase64, setSignatureBase64] = useState(null);
  const [pdfEditMode, setPdfEditMode] = useState(false);
  const [signatureArrayBuffer, setSignatureArrayBuffer] = useState(null);
  const [pdfBase64, setPdfBase64] = useState(null);
  const [pdfArrayBuffer, setPdfArrayBuffer] = useState(null);
  const [newPdfSaved, setNewPdfSaved] = useState(false);
  const [newPdfPath, setNewPdfPath] = useState(null);
  const [pageWidth, setPageWidth] = useState(0);
  const [pageHeight, setPageHeight] = useState(0);

  const ref = useRef();

  _base64ToArrayBuffer = base64 => {
    const binary_string = atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
  };

  _uint8ToBase64 = u8Arr => {
    const CHUNK_SIZE = 0x8000; //arbitrary number
    let index = 0;
    const length = u8Arr.length;
    let result = '';
    let slice;
    while (index < length) {
      slice = u8Arr.subarray(index, Math.min(index + CHUNK_SIZE, length));
      result += String.fromCharCode.apply(null, slice);
      index += CHUNK_SIZE;
    }
    return btoa(result);
  };

  getSignature = () => {
    console.log('___getSignature -> Start');
    setSignaturePad(true);
  };

  handleSignature = signature => {
    setSignatureBase64(signature.replace('data:image/png;base64,', ''));
    setSignaturePad(false);
    setPdfEditMode(true);
  };

  handleSingleTap = async (page, x, y) => {
    console.log(`tap: ${page}`);
    console.log(`x: ${x}`);
    console.log(`y: ${y}`);

    if (pdfEditMode) {
      setNewPdfSaved(false);
      setPdfEditMode(false);
      const pdfDoc = await PDFDocument.load(pdfArrayBuffer);
      const pages = pdfDoc.getPages();
      const firstPage = pages[page - 1];

      const signatureImage = await pdfDoc.embedPng(signatureArrayBuffer);
      if (Platform.OS == 'ios') {
        firstPage.drawImage(signatureImage, {
          x: (pageWidth * (x - 12)) / Dimensions.get('window').width,
          y: pageHeight - (pageHeight * (y + 12)) / 540,
          width: 50,
          height: 50,
        });
      } else {
        firstPage.drawImage(signatureImage, {
          x: (firstPage.getWidth() * x) / pageWidth,
          y:
            firstPage.getHeight() -
            (firstPage.getHeight() * y) / pageHeight -
            25,
          width: 50,
          height: 50,
        });
      }
      // Play with these values as every project has different requirements

      const pdfBytes = await pdfDoc.save();
      const pdfBase64 = this._uint8ToBase64(pdfBytes);
      const path = `${
        RNFS.DocumentDirectoryPath
      }/react-native_signed_${Date.now()}.pdf`;

      RNFS.writeFile(path, pdfBase64, 'base64')
        .then(success => {
          setNewPdfPath(path);
          setNewPdfSaved(true);
          setPdfBase64(pdfBase64);
        })
        .catch(err => {
          console.log(err.message);
        });
    }
  };

  const handleError = err => {
    if (DocumentPicker.isCancel(err)) {
      console.warn('cancelled');
      // User cancelled the picker, exit any dialogs or menus and move on
    } else if (isInProgress(err)) {
      console.warn(
        'multiple pickers were opened, only the last will be considered',
      );
    } else {
      throw err;
    }
  };

  useEffect(() => {
    if (signatureBase64) {
      setSignatureArrayBuffer(this._base64ToArrayBuffer(signatureBase64));
    }
    if (newPdfSaved) {
      setResult(newPdfPath);
      console.log(this._base64ToArrayBuffer(pdfBase64));
      setPdfArrayBuffer(this._base64ToArrayBuffer(pdfBase64));
    }
  }, [signatureBase64, newPdfSaved, result]);

  const style = `.m-signature-pad {box-shadow: none; border: none; } 
                  body,html {
                  width: 100%; height: 50%;}`;

  // console.log(newPdfSaved);
  console.log(signatureArrayBuffer);
  // console.log(pdfEditMode);

  return (
    <View style={styles.container}>
      {result ? (
        <>
          {getSignaturePad ? (
            <SignatureScreen
              webStyle={style}
              ref={ref}
              onOK={sig => handleSignature(sig)}
              onEmpty={() => console.log('___onEmpty')}
              descriptionText="Sign"
              clearText="Clear"
              confirmText="Confirm"
            />
          ) : (
            <>
              <Pdf
                minScale={1.0}
                maxScale={1.0}
                scale={1.0}
                spacing={0}
                fitPolicy={0}
                enablePaging={true}
                source={{
                  uri: result,
                }}
                onLoadComplete={(numberOfPages, filePath, {width, height}) => {
                  setPageWidth(width);
                  setPageHeight(height);
                  console.log(width);
                  console.log(height);
                }}
                onPageChanged={(page, numberOfPages) => {
                  console.log(`current page: ${page}`);
                }}
                onError={error => {
                  console.log(error);
                }}
                onPressLink={uri => {
                  console.log(`Link presse: ${uri}`);
                }}
                onPageSingleTap={(page, x, y) => {
                  this.handleSingleTap(page, x, y);
                }}
                style={styles.pdf}
              />
              <Button
                style={{width: '80%'}}
                title="Tanda Tangan Dokumen"
                onPress={getSignature}
              />
            </>
          )}
        </>
      ) : (
        <Button
          title="open picker for single file selection"
          onPress={async () => {
            try {
              const pickerResult = await DocumentPicker.pickSingle({
                presentationStyle: 'fullScreen',
                copyTo: 'cachesDirectory',
              });
              setResult(pickerResult.fileCopyUri);
              RNFS.readFile(`${pickerResult.fileCopyUri}`, 'base64').then(
                contents => {
                  setPdfBase64(contents);
                  setPdfArrayBuffer(this._base64ToArrayBuffer(contents));
                },
              );
            } catch (e) {
              handleError(e);
            }
          }}
        />
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f4f4f4',
  },
  pdf: {
    width: Dimensions.get('window').width,
    height: 540,
  },
});
