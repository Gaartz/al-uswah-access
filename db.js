/* ============================================
   Database Module — Firestore Operations
   ============================================
   All data operations use Cloud Firestore.
   Requires firebase-config.js to be loaded first.
   ============================================ */

const DB = {
    // ── User Operations ──

    async saveUser(uid, userData) {
        await db.collection('users').doc(uid).set(userData, { merge: true });
    },

    async getUser(uid) {
        const doc = await db.collection('users').doc(uid).get();
        return doc.exists ? { uid: doc.id, ...doc.data() } : null;
    },

    async getAllUsers() {
        const snapshot = await db.collection('users').get();
        return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
    },

    async findUserByEmail(email) {
        const snapshot = await db.collection('users').where('email', '==', email).limit(1).get();
        if (snapshot.empty) return null;
        const doc = snapshot.docs[0];
        return { uid: doc.id, ...doc.data() };
    },

    async deleteUser(uid) {
        await db.collection('users').doc(uid).delete();
    },

    async updateUser(uid, updates) {
        await db.collection('users').doc(uid).update(updates);
    },

    // ── Attendance Operations ──

    async saveAttendanceLog(uid, logEntry) {
        // Add a single log entry to the user's attendance array
        await db.collection('attendance').doc(uid).set({
            logs: firebase.firestore.FieldValue.arrayUnion(logEntry)
        }, { merge: true });
    },

    async updateAttendanceLogs(uid, logs) {
        // Overwrite the entire logs array (used for updates like adding timeOut)
        await db.collection('attendance').doc(uid).set({ logs }, { merge: true });
    },

    async getAttendanceLogs(uid) {
        const doc = await db.collection('attendance').doc(uid).get();
        return doc.exists ? (doc.data().logs || []) : [];
    },

    async getAllAttendance() {
        const snapshot = await db.collection('attendance').get();
        const result = {};
        snapshot.docs.forEach(doc => {
            result[doc.id] = doc.data().logs || [];
        });
        return result;
    },

    // ── Menu Operations ──

    async saveMenus(menuData) {
        await db.collection('config').doc('menus').set({ items: menuData });
    },

    async getMenus() {
        const doc = await db.collection('config').doc('menus').get();
        return doc.exists ? doc.data().items : null;
    },

    // ── Branch / QR Code Operations ──

    async saveBranches(branches) {
        await db.collection('config').doc('branches').set({ items: branches });
    },

    async getBranches() {
        const doc = await db.collection('config').doc('branches').get();
        return doc.exists ? doc.data().items : null;
    },

    // ── App Config Operations ──

    async saveAppConfig(configData) {
        await db.collection('config').doc('app').set(configData, { merge: true });
    },

    async getAppConfig() {
        const doc = await db.collection('config').doc('app').get();
        return doc.exists ? doc.data() : null;
    },

    // ── Perizinan (Leave Request) Operations ──

    async savePerizinan(data) {
        const ref = await db.collection('perizinan').add(data);
        return ref.id;
    },

    async getPerizinanByUser(uid) {
        const snapshot = await db.collection('perizinan').where('uid', '==', uid).orderBy('createdAt', 'desc').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async getAllPerizinan() {
        const snapshot = await db.collection('perizinan').orderBy('createdAt', 'desc').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async updatePerizinan(id, updates) {
        await db.collection('perizinan').doc(id).update(updates);
    },

    // ── Pelanggaran (Violation) Operations ──

    async savePelanggaran(data) {
        const ref = await db.collection('pelanggaran').add(data);
        return ref.id;
    },

    async getPelanggaranByUser(uid) {
        const snapshot = await db.collection('pelanggaran').where('targetUid', '==', uid).get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    },

    async getAllPelanggaran() {
        const snapshot = await db.collection('pelanggaran').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    },

    async deletePelanggaran(id) {
        await db.collection('pelanggaran').doc(id).delete();
    },

    // ── Slip Gaji Operations ──

    async getSlipGajiTemplate() {
        const doc = await db.collection('config').doc('slip_gaji_template').get();
        return doc.exists ? doc.data() : null;
    },

    async saveSlipGajiTemplate(templateData) {
        await db.collection('config').doc('slip_gaji_template').set(templateData, { merge: true });
    },

    async saveSlipGaji(docId, data) {
        await db.collection('slip_gaji').doc(docId).set(data, { merge: true });
    },

    async getSlipGajiByUser(uid) {
        const snapshot = await db.collection('slip_gaji').where('uid', '==', uid).get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => (b.period || '').localeCompare(a.period || ''));
    },

    async getSlipGajiByPeriod(period, branch) {
        let query = db.collection('slip_gaji').where('period', '==', period);
        if (branch) query = query.where('branch', '==', branch);
        const snapshot = await query.get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async getAllSlipGaji() {
        const snapshot = await db.collection('slip_gaji').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => (b.period || '').localeCompare(a.period || ''));
    },

    async deleteSlipGaji(docId) {
        await db.collection('slip_gaji').doc(docId).delete();
    },

    // ── Arsip Operations ──

    async getArsipByCategory(category) {
        const snapshot = await db.collection('arsip').where('category', '==', category).get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    },

    async saveArsip(data) {
        return await db.collection('arsip').add(data);
    },

    async updateArsip(id, data) {
        await db.collection('arsip').doc(id).update(data);
    },

    async deleteArsip(id) {
        await db.collection('arsip').doc(id).delete();
    }
};
