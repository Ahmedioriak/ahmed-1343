# معركة الشلة — Shilla Fight

لعبة قتال ثنائية في المتصفح: لاعبين على نفس الجهاز، ضد الكمبيوتر، أو **أونلاين** بكود غرفة.

| الملف | وش هو |
|---|---|
| `index.html` | **النسخة الأساسية** — اللعبة بـ14 شخصية (كمبيوتر وجوال) |
| `v2/index.html` | **معركة الشلة 2** — الإصدار الجديد بـ15 شخصية ← الرابط `/v2` |
| `v2/mobile.html` | نسخة الجوال من الإصدار 2 ← الرابط `/v2/mobile` |
| `mobile.html` | نسخة الجوال من النسخة الأساسية ← الرابط `/mobile` |
| `manifest.webmanifest` / `manifest-mobile.webmanifest` / `sw.js` / `icons/` | تثبيت اللعبة كتطبيق وتشغيلها بدون إنترنت (النسخة الأساسية) |
| `firebase-config.js` | إعدادات سيرفر الأونلاين (Firebase) — الصق إعدادات مشروعك هنا |
| `database.rules.json` | قواعد قاعدة البيانات في Firebase |
| `firebase.json` / `vercel.json` | إعدادات الاستضافة |
| `src/` | ملفات مصدر الإصدار 2 — بعد أي تعديل: `python3 src/build.py` (يحدّث مجلد `v2` بس) |

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

## تثبيت اللعبة كتطبيق 📲
افتح رابط موقعك (Vercel) — الأفضل رابط الجوال `/mobile` في الجوال:
- **أندرويد / Chrome / Edge:** الإعدادات داخل اللعبة ← «ثبّت اللعبة كتطبيق»، أو من قائمة المتصفح ⋮ ← «تثبيت التطبيق».
- **آيفون / آيباد:** افتحه في Safari ← زر المشاركة ⬆️ ← «إضافة إلى الشاشة الرئيسية».

بعد أول فتح تنحفظ اللعبة في الجهاز وتشتغل **بدون إنترنت** (لاعبين، ضد الكمبيوتر، القصة). الأونلاين يحتاج إنترنت.
لما ترفع تحديث جديد، اللعبة تنزّله بالخلفية وتقول لك تسكّرها وتفتحها.
