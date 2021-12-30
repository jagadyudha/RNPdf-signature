import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import Pdf from 'react-native-pdf';
import { windowWidth } from '../Utils/Dimension';
import { fontSizer } from '../Utils/Font';
import { DragResizeBlock, DragResizeContainer } from 'react-native-drag-resize';

const PdfReader = ({ route, navigation }) => {
  const { pdfurl } = route.params;
  const [pageSize, setPageSize] = React.useState(null);
  const [signatureBase64, setSignatureBase64] = React.useState(null);
  const [isDragable, setIsDragable] = React.useState(false);
  const [location, setLocation] = React.useState(null);
  const [signatureSize, setSignatureSize] = React.useState(null);

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
          uri: pdfurl,
        }}
        onLoadComplete={(numberOfPages, filePath, { width, height }) => {
          setPageSize({
            width,
            height,
          });
        }}
        onPageChanged={(page, numberOfPages) => {
          console.log(`current page: ${page}`);
        }}
        onError={(error) => {
          console.log(error);
        }}
        onPressLink={(uri) => {
          console.log(`Link presse: ${uri}`);
        }}
        // onPageSingleTap={(page, x, y) => {
        //   this.handleSingleTap(page, x, y);
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
          // onDragEnd={this._dragRelease}
          //onResizeEnd={(e) => console.log(e)}
          // onResizeEnd={this._resizeRelease}
          connectors={['tl', 'tr', 'br', 'bl', 'c']}
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
              style={{ aspectRatio: 4 / 3, width: '100%', height: '100%' }}
              resizeMode={'cover'}
            />
          </View>
          <Text style={{ marginTop: 20 }}>Klik Untuk Submit</Text>
          {signatureSize && (
            <Image
              source={{
                uri: `data:image/png;base64,${signatureBase64}`,
              }}
              style={{
                width: signatureSize.width,
                height: signatureSize.height,
              }}
            />
          )}
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
