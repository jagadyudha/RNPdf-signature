import React, {useEffect} from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Dimensions } from 'react-native';
import Pdf from 'react-native-pdf';
import { windowWidth } from '../Utils/Dimension';
import { fontSizer } from '../Utils/Font';
import { DragResizeBlock } from 'react-native-drag-resize';
import { decode as atob, encode as btoa } from 'base-64';
import { PDFDocument } from 'pdf-lib';

const RNFS = require('react-native-fs');

const PdfReader = ({ route, navigation }) => {
  const { pdfurl, pdfbase } = route.params;

  const [pdfBase64, setPdfBase64] = React.useState(pdfbase);
  const [pageSize, setPageSize] = React.useState(null);
  const [signatureBase64, setSignatureBase64] = React.useState(null);
  const [isDragable, setIsDragable] = React.useState(false);
  const [location, setLocation] = React.useState(null);
  const [signatureSize, setSignatureSize] = React.useState(null);
  const [pdfArrayBuffer, setPdfArrayBuffer] = React.useState(null);
  const [signatureArrayBuffer, setSignatureArrayBuffer] = React.useState(null);
  const [newPdfPath, setNewPdfPath] = React.useState(null);

  const _base64ToArrayBuffer = (base64) => {
    const binary_string = atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
  };

  const _uint8ToBase64 = (u8Arr) => {
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

  const getCoord = (coord) => {
    setLocation({
      cxValue: coord[0],
      cyValue: coord[1],
    });
  };

  const handleDone = async () => {
    // setPdfArrayBuffer(_base64ToArrayBuffer(pdfBase64));
    // setSignatureArrayBuffer(_base64ToArrayBuffer(signatureBase64));
    if (pdfArrayBuffer && signatureArrayBuffer) {
      const pdfDoc = await PDFDocument.load(pdfArrayBuffer);
      const pages = pdfDoc.getPages();
      const firstPage = pages[pageSize.page - 1];

      const signatureImage = await pdfDoc.embedPng(signatureArrayBuffer);
      if (Platform.OS == 'ios') {
        firstPage.drawImage(signatureImage, {
          x: (pageWidth * (x - 12)) / Dimensions.get('window').width,
          y: pageHeight - (pageHeight * (y + 12)) / 540,
          width: signatureSize.width,
          height: signatureSize.height,
        });
      } else {
        firstPage.drawImage(signatureImage, {
          x: ((pageSize.width * (location.cxValue - 12)) / Dimensions.get("window").width),
          // y:
          // (firstPage.getHeight() - ((firstPage.getHeight() * location.cyValue) / firstPage.getHeight())) - ( location.cyValue*1.1),
          y:
          (firstPage.getHeight() - ((firstPage.getHeight() * location.cyValue) / firstPage.getHeight()*2)) - 25,
          width: signatureSize.width + 30,
          height: signatureSize.height + 50,
        });
        console.log('ini firtstpage ', firstPage.getHeight());
      }
      // Play with these values as every project has different requirements

      const pdfBytes = await pdfDoc.save();
      const pdfBase64 = _uint8ToBase64(pdfBytes);
      const path = `${
        RNFS.DocumentDirectoryPath
      }/react-native_signed_${Date.now()}.pdf`;

      RNFS.writeFile(path, pdfBase64, 'base64')
        .then((success) => {
          setNewPdfPath(path);
          //setPdfBase64(pdfBase64)
        })
        .catch((err) => {
          console.log(err.message);
        });
    }
  };

  useEffect(() => {
    if (signatureBase64 && pdfBase64) {
      setSignatureArrayBuffer(_base64ToArrayBuffer(signatureBase64));
      setPdfArrayBuffer(_base64ToArrayBuffer(pdfBase64));
    }
  }, [signatureBase64, pdfBase64]);

  return (
    <View style={styles.container}>
      <Pdf
        minScale={1.0}
        maxScale={1.0}
        scale={1.0}
        spacing={0}
        fitPolicy={0}
        enablePaging={true}
        source={{
          uri: newPdfPath ? newPdfPath : pdfurl,
        }}
        onLoadComplete={(numberOfPages, filePath, { width, height }) => {
          setPageSize({
            width,
            height,
            page:1
          });
        }}
        onPageChanged={(page, numberOfPages) => {
          setPageSize((prevState) => ({
            ...prevState,
            page
          }))
        }}
        onError={(error) => {
          console.log(error);
        }}
        onPressLink={(uri) => {
          console.log(`Link presse: ${uri}`);
        }}
        // onPageSingleTap={(page, x, y) => {
        //   setPageSize((prevState) => ({
        //     ...prevState,
        //     page
        //   }))
        // }}

        onTouchStart={(e) => {
          if (signatureBase64 && !isDragable) {
            setIsDragable(true);
            setLocation({
              cxValue: e.nativeEvent.locationX,
              cyValue: e.nativeEvent.locationY,
            });

    
          }
        }}
        style={styles.pdf}
      />
      <TouchableOpacity
        style={{ justifyContent: 'center', flex: 1 }}
        onPress={() =>
          navigation.navigate('SignaturePad', {
            onReturn: (item) => {
              setSignatureBase64(item);
            },
          })
        }
      >
        <Text
          style={{
            color: '#fff',
            fontSize: fontSizer(),
            textAlign: 'center',
            backgroundColor: '#369BFE',
            paddingVertical: 10,
            borderRadius: 5,
            width: windowWidth() * 0.9,
          }}
        >
          Tanda Tangan
        </Text>
      </TouchableOpacity>

      {isDragable ? (
        <DragResizeBlock
          isResizable
          isDraggable
          x={location.cxValue}
          y={location.cyValue}
          w={50}
          h={50}
          onDrag={(e) => getCoord(e)}
          onDragEnd={(e) => getCoord(e)}
          onResizeEnd={(e) => getCoord(e)}
          // onResizeEnd={this._resizeRelease}
          connectors={['tl', 'tm', 'tr', 'br', 'bl',, 'c']}
        >
          <View
            onLayout={(e) =>
              setSignatureSize({
                width: e.nativeEvent.layout.width,
                height: e.nativeEvent.layout.height,
              })
            }
            style={{
              width: '100%',
              height: '100%',
              alignContent: 'center',
              alignItems: 'center',
              borderColor: '#000',
              borderWidth: 1,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                zIndex: 10,
                position: 'absolute',
                top: 0,
                right: 0,
                backgroundColor: '#FFFFFF',
              }}
            ></View>
            <Image
              source={{
                uri: `data:image/png;base64,${signatureBase64}`,
              }}
              style={{ width: '100%', height: '100%' }}
              resizeMode={'cover'}
            />
          </View>
          <TouchableOpacity onPress={handleDone}>
            <Text style={{ marginTop: 20 }}>Klik Untuk Submit</Text>
          </TouchableOpacity>
        </DragResizeBlock>
      ) : null}
    </View>
  );
};

export default PdfReader;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f4f4f4',
  },
  pdf: {
    width: windowWidth() * 0.9,
    height: 480,
  },
});
