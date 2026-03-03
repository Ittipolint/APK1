import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Alert, ScrollView, SafeAreaView } from 'react-native';
import { Camera } from 'expo-camera';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [photos, setPhotos] = useState([]);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current && isCameraReady) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
        setPhotos([...photos, photo.uri]);
      } catch (error) {
        Alert.alert('Error', 'ไม่สามารถถ่ายรูปได้: ' + error.message);
      }
    }
  };

  const createPDF = async () => {
    if (photos.length === 0) {
      Alert.alert('คำแนะนำ', 'กรุณาถ่ายรูปอย่างน้อย 1 รูป');
      return;
    }

    try {
      let htmlContent = '<html><body style="margin:0;padding:0;">';
      photos.forEach((uri) => {
        htmlContent += `<div style="page-break-after: always; text-align: center;">
          <img src="${uri}" style="width: 100%; height: auto; max-height: 100vh; object-fit: contain;" />
        </div>`;
      });
      htmlContent += '</body></html>';

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      console.log('PDF created at:', uri);
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert('สำเร็จ', 'บันทึกไฟล์ PDF เรียบร้อยแล้วที่: ' + uri);
      }
    } catch (error) {
      Alert.alert('Error', 'ไม่สามารถสร้าง PDF ได้: ' + error.message);
    }
  };

  const clearPhotos = () => {
    setPhotos([]);
  };

  if (hasPermission === null) {
    return <View style={styles.container}><Text>กำลังขอสิทธิ์ใช้งานกล้อง...</Text></View>;
  }
  if (hasPermission === false) {
    return <View style={styles.container}><Text>ไม่ได้รับสิทธิ์ใช้งานกล้อง</Text></View>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.cameraContainer}>
        <Camera 
          style={styles.camera} 
          type={type} 
          ref={cameraRef}
          onCameraReady={() => setIsCameraReady(true)}
        />
      </View>

      <View style={styles.previewContainer}>
        <ScrollView horizontal style={styles.scrollView}>
          {photos.map((uri, index) => (
            <Image key={index} source={{ uri }} style={styles.previewImage} />
          ))}
        </ScrollView>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.captureButton]} onPress={takePicture}>
          <Text style={styles.buttonText}>ถ่ายรูป</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.pdfButton]} onPress={createPDF}>
          <Text style={styles.buttonText}>สร้าง PDF ({photos.length})</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={clearPhotos}>
          <Text style={styles.buttonText}>ล้างรูป</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  cameraContainer: {
    flex: 0.6,
    overflow: 'hidden',
    marginTop: 10,
    marginHorizontal: 10,
    borderRadius: 20,
  },
  camera: {
    flex: 1,
  },
  previewContainer: {
    flex: 0.2,
    padding: 10,
  },
  scrollView: {
    flexDirection: 'row',
  },
  previewImage: {
    width: 80,
    height: 120,
    marginRight: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonContainer: {
    flex: 0.2,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 10,
    minWidth: 80,
    alignItems: 'center',
    elevation: 3,
  },
  captureButton: {
    backgroundColor: '#007AFF',
  },
  pdfButton: {
    backgroundColor: '#4CD964',
  },
  clearButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
