import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Pdf from 'react-native-pdf';
import { windowWidth } from '../Utils/Dimension';
import { fontSizer } from '../Utils/Font';

const PdfReader = ({ route, navigation }) => {
  const { pdfurl } = route.params;
  const [pageSize, setPageSize] = React.useState(null);
  const [signatureBase64, setSignatureBase64] = React.useState(null);

  console.log(signatureBase64);
  console.log(pageSize);
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
        onPageSingleTap={(page, x, y) => {
          this.handleSingleTap(page, x, y);
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
