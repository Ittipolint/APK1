# Camera to PDF (Expo App)

แอปพลิเคชันสำหรับถ่ายภาพและรวบรวมเป็นไฟล์ PDF สร้างด้วย React Native และ Expo SDK 50

## ฟีเจอร์หลัก
- ถ่ายภาพผ่านกล้อง (expo-camera)
- เลือก/ไม่เลือกรูปภาพที่ต้องการส่งออก
- สร้างไฟล์ PDF จากรูปภาพที่เลือก
- แชร์ไฟล์ PDF ไปยังแอปอื่นๆ
- รองรับ Android 8.0 ขึ้นไป

## การตั้งค่าสำหรับนักพัฒนา (Setup)

### 1. เครื่องมือที่ต้องมี
- [Node.js](https://nodejs.org/) (แนะนำเวอร์ชัน 18 ขึ้นไป)
- [Git](https://git-scm.com/)
- มือถือ Android สำหรับทดสอบ หรือ Emulator

### 2. ติดตั้งโปรเจกต์
```bash
# Clone โปรเจกต์
git clone https://github.com/Ittipolint/APK1.git

# เข้าไปที่โฟลเดอร์
cd APK1

# ติดตั้ง Dependencies
npm install
```

### 3. การรันแอป (Development)
```bash
# เริ่ม Metro Bundler
npx expo start
```
จากนั้นเปิดแอป **Expo Go** บนมือถือแล้วสแกน QR Code

### 4. การสร้าง APK (Build)
โปรเจกต์นี้ตั้งค่า GitHub Actions ไว้แล้ว หากต้องการ Build ด้วยตัวเองในเครื่อง:
```bash
# สร้าง Native Folder (Android)
npx expo prebuild --platform android

# Build Debug APK
cd android && ./gradlew assembleDebug

# Build Release APK (ใช้ debug key)
cd android && ./gradlew assembleRelease
```

## โครงสร้างโปรเจกต์
- `App.js`: โค้ดหลักของแอป (UI, กล้อง, การสร้าง PDF)
- `.github/workflows/build.yml`: การตั้งค่า CI/CD สำหรับ Build APK อัตโนมัติบน GitHub
- `app.json`: การตั้งค่า Expo โปรเจกต์

## ติดต่อผู้พัฒนา
- เจ้าของโปรเจกต์: [Ittipolint](https://github.com/Ittipolint)
