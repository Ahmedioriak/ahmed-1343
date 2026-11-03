// ===== سيرفر الأونلاين (Firebase Realtime Database) =====
// الصق هنا إعدادات مشروعك من Firebase:
//   Firebase Console ← ⚙️ Project settings ← Your apps ← (Web </>) ← SDK setup and configuration ← Config
// لازم يكون فيها databaseURL.
// إذا خليتها null اللعبة تستخدم الاتصال المباشر بين الجهازين بدل السيرفر.
window.SHILLA_FIREBASE = null;

/* مثال:
window.SHILLA_FIREBASE = {
  apiKey: "AIza....",
  authDomain: "my-game.firebaseapp.com",
  databaseURL: "https://my-game-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "my-game",
  appId: "1:123:web:abc"
};
*/
