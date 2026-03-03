import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Alert, ScrollView, SafeAreaView } from 'react-native';
import { Camera } from 'expo-camera';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
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
        // New photos are selected by default
        setPhotos([...photos, { uri: photo.uri, selected: true }]);
      } catch (error) {
        Alert.alert('Error', 'ไม่สามารถถ่ายรูปได้: ' + error.message);
      }
    }
  };

  const toggleSelection = (index) => {
    const newPhotos = [...photos];
    newPhotos[index].selected = !newPhotos[index].selected;
    setPhotos(newPhotos);
  };

  const createPDF = async () => {
    const selectedPhotos = photos.filter(p => p.selected);

    if (selectedPhotos.length === 0) {
      Alert.alert('คำแนะนำ', 'กรุณาเลือกรูปอย่างน้อย 1 รูป');
      return;
    }

    try {
      let htmlContent = '<html><body style="margin:0;padding:0;background-color:white;">';

      // Convert all selected photos to base64 for reliable PDF embedding on Android
      const base64Data = await Promise.all(
        selectedPhotos.map(async (photo) => {
          const base64 = await FileSystem.readAsStringAsync(photo.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          return `data:image/jpeg;base64,${base64}`;
        })
      );

      base64Data.forEach((dataUri) => {
        htmlContent += `<div style="page-break-after: always; text-align: center; width: 100%;">
          <img src="${dataUri}" style="width: 100%; height: auto; max-height: 100vh; object-fit: contain;" />
        </div>`;
      });
      htmlContent += '</body></html>';

      const { uri } = await Print.printToFileAsync({ html: htmlContent });

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
    // Only remove photos that are selected
    setPhotos(photos.filter(p => !p.selected));
  };

  if (hasPermission === null) {
    return <View style={styles.container}><Text>กำลังขอสิทธิ์ใช้งานกล้อง...</Text></View>;
  }
  if (hasPermission === false) {
    return <View style={styles.container}><Text>ไม่ได้รับสิทธิ์ใช้งานกล้อง</Text></View>;
  }

  const selectedCount = photos.filter(p => p.selected).length;
  const totalCount = photos.length;

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
        <Text style={styles.totalText}>รูปทั้งหมด: {totalCount} | เลือก: {selectedCount}</Text>
        <ScrollView horizontal style={styles.scrollView}>
          {photos.map((item, index) => (
            <TouchableOpacity key={index} onPress={() => toggleSelection(index)} style={styles.imageWrapper}>
              <Image source={{ uri: item.uri }} style={[styles.previewImage, !item.selected && styles.dimmedImage]} />
              {item.selected && (
                <View style={styles.checkmarkContainer}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.captureButton]} onPress={takePicture}>
          <Text style={styles.buttonText}>ถ่ายรูป</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.pdfButton]} onPress={createPDF}>
          <Text style={styles.buttonText}>สร้าง PDF ({selectedCount})</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={clearPhotos}>
          <Text style={styles.buttonText}>ล้าง ({selectedCount})</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  cameraContainer: {
    flex: 0.6,
    overflow: 'hidden',
    marginTop: 40, // Increased margin to avoid status bar overlap
    marginHorizontal: 10,
    borderRadius: 20,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  previewContainer: {
    flex: 0.2,
    padding: 10,
  },
  totalText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
    textAlign: 'right',
  },
  scrollView: {
    flexDirection: 'row',
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 10,
  },
  previewImage: {
    width: 80,
    height: 120,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dimmedImage: {
    opacity: 0.4,
  },
  checkmarkContainer: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#4CD964',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  checkmarkText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
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
