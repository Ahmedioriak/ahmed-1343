# معركة الشلة — Shilla Fight

لعبة قتال ثنائية في المتصفح: لاعبين على نفس الجهاز، ضد الكمبيوتر، أو **أونلاين** بكود غرفة.

| الملف | وش هو |
|---|---|
| `index.html` | اللعبة (كمبيوتر وجوال — أزرار اللمس تطلع لحالها في الجوال) |
| `mobile.html` | نسخة الجوال (أزرار اللمس دايماً) ← الرابط `/mobile` |
| `firebase-config.js` | إعدادات سيرفر الأونلاين (Firebase) — الصق إعدادات مشروعك هنا |
| `database.rules.json` | قواعد قاعدة البيانات في Firebase |
| `firebase.json` / `vercel.json` | إعدادات الاستضافة |
| `src/` | ملفات المصدر — بعد أي تعديل: `python3 src/build.py` |

## سيرفر الأونلاين (Firebase)
1. https://console.firebase.google.com ← **Create a project**.
2. **Build ← Realtime Database ← Create Database** ← المكان: **Belgium (europe-west1)** ← **Start in test mode**.
3. تبويب **Rules**: الصق محتوى `database.rules.json` واضغط **Publish**.
4. ⚙️ **Project settings ← Your apps ← Web (`</>`)** ← سجّل التطبيق ← انسخ `firebaseConfig`.
5. الصقه في `firebase-config.js` مكان `null` (تقدر تعدّله من GitHub مباشرة).

بعدها اللعبة تربط اللاعبين عن طريق السيرفر. بدون الإعدادات تستخدم اتصال مباشر بين الجهازين.

## الاستضافة
- **Vercel**: Add New ← Project ← اختر هذا المستودع ← Deploy.
- **Firebase Hosting** (اختياري): `npm i -g firebase-tools` ← `firebase login` ← `firebase use --add` ← `firebase deploy`.
