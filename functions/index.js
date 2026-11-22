const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
initializeApp();
const db = getFirestore();

exports.gradeAssignment = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Silakan masuk terlebih dahulu.');
  const { assignmentId, answers } = request.data || {};
  if (typeof assignmentId !== 'string' || !Array.isArray(answers)) throw new HttpsError('invalid-argument', 'Data jawaban tidak valid.');
  const userId = request.auth.uid;
  const [assignmentSnap, keySnap, userSnap] = await Promise.all([
    db.doc(`assignments/${assignmentId}`).get(),
    db.doc(`answerKeys/${assignmentId}`).get(),
    db.doc(`users/${userId}`).get()
  ]);
  if (!assignmentSnap.exists || !keySnap.exists || !userSnap.exists) throw new HttpsError('not-found', 'Tugas atau data pengguna tidak ditemukan.');
  const assignment = assignmentSnap.data();
  const user = userSnap.data();
  if (user.role !== 'student') throw new HttpsError('permission-denied', 'Hanya akun siswa yang dapat mengerjakan tugas.');
  const classSnap = await db.doc(`classes/${assignment.classId}`).get();
  if (!classSnap.exists || !(classSnap.data().memberIds || []).includes(userId)) throw new HttpsError('permission-denied', 'Kamu bukan anggota kelas ini.');
  const key = keySnap.data().answers;
  if (!Array.isArray(key) || answers.length !== key.length || answers.some(a => !Number.isInteger(a) || a < 0 || a > 3)) throw new HttpsError('invalid-argument', 'Jumlah atau format jawaban tidak sesuai.');
  const existing = await db.collection('submissions').where('assignmentId', '==', assignmentId).where('studentId', '==', userId).limit(1).get();
  if (!existing.empty) throw new HttpsError('already-exists', 'Kamu sudah mengirim jawaban untuk tugas ini.');
  const correct = answers.reduce((sum, answer, i) => sum + (answer === key[i] ? 1 : 0), 0);
  const score = Math.round((correct / key.length) * 100);
  await db.collection('submissions').add({
    assignmentId, title: assignment.title, classId: assignment.classId,
    className: assignment.className, studentId: userId,
    studentName: user.name || request.auth.token.name || 'Siswa',
    answers, score, correct, total: key.length, submittedAt: FieldValue.serverTimestamp()
  });
  return { score, correct, total: key.length };
});
