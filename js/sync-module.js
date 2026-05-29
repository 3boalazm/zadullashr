/* ═══════════════════════════════════════════════════════════════════════════
   زاد — الفيز الحادي عشر: المزامنة السحابية (Dexie Cloud)
   ─────────────────────────────────────────────────────────────────────────
   امتداد طبيعي لـ Dexie.js من الفيز الثاني — مزامنة بين الأجهزة بدون تغيير
   architecture. اختيارية بالكامل: التطبيق يعمل أوفلاين بدون تسجيل.
   
   المبدأ: Privacy by design — لا حساب مطلوب، المزامنة خيار للمستخدم.
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── إعدادات المزامنة ────────────────────────────────────────────────────── */
const SYNC_CONFIG = {
  /* رابط Dexie Cloud — يُملأ عند إعداد الحساب على dexie.cloud */
  databaseUrl: '', /* مثال: 'https://xxxxx.dexie.cloud' */
  enabled: false,
};

/* البيانات التي تُزامَن (لا نزامن كل شيء — خصوصية) */
const SYNCED_TABLES = ['worshipLog', 'takbeer', 'mushaf', 'fasting', 'badges', 'history', 'zakatCalc'];
/* البيانات المحلية فقط: settings, state, profile (تبقى على الجهاز) */

/* ── 1. حالة المزامنة ────────────────────────────────────────────────────── */
const SyncState = {
  status: 'offline',   /* offline | syncing | synced | error */
  lastSync: null,
  userId: null,
};

/* ── 2. تفعيل المزامنة (يختاره المستخدم صراحةً) ──────────────────────────── */
async function enableCloudSync() {
  if (!SYNC_CONFIG.databaseUrl) {
    showSyncMessage('المزامنة السحابية غير مُعدّة بعد. تحتاج لإعداد Dexie Cloud أولاً.', 'info');
    showSyncSetupGuide();
    return;
  }

  try {
    /* تحميل إضافة dexie-cloud */
    await loadDexieCloudAddon();

    /* إعادة فتح قاعدة البيانات مع dexie-cloud */
    SyncState.status = 'syncing';
    updateSyncUI();

    /* ملاحظة: التهيئة الفعلية تحتاج إعادة تعريف ZadDB مع cloud addon
       هذا يتم في storage.js عند توفر databaseUrl */
    if (window.ZadDB?.cloud) {
      await window.ZadDB.cloud.configure({
        databaseUrl: SYNC_CONFIG.databaseUrl,
        requireAuth: false, /* مزامنة anonymous ممكنة */
      });
    }

    SYNC_CONFIG.enabled = true;
    localStorage.setItem('zad_sync_enabled', '1');
    SyncState.status = 'synced';
    SyncState.lastSync = Date.now();
    updateSyncUI();
    showSyncMessage('✅ تم تفعيل المزامنة — بياناتك الآن محفوظة سحابياً', 'success');

  } catch (err) {
    SyncState.status = 'error';
    updateSyncUI();
    showSyncMessage('تعذّر تفعيل المزامنة — حاول لاحقاً', 'error');
    console.error('[Sync]', err);
  }
}
window.enableCloudSync = enableCloudSync;

/* ── إيقاف المزامنة ──────────────────────────────────────────────────────── */
async function disableCloudSync() {
  SYNC_CONFIG.enabled = false;
  localStorage.removeItem('zad_sync_enabled');
  SyncState.status = 'offline';
  updateSyncUI();
  showSyncMessage('تم إيقاف المزامنة — بياناتك تبقى محفوظة على هذا الجهاز', 'info');
}
window.disableCloudSync = disableCloudSync;

/* ── 3. تحميل إضافة Dexie Cloud ──────────────────────────────────────────── */
function loadDexieCloudAddon() {
  return new Promise((resolve, reject) => {
    if (window.DexieCloud) { resolve(); return; }
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/dexie-cloud-addon@1.0.0/dist/umd/dexie-cloud-addon.min.js';
    s.onload = resolve;
    s.onerror = () => reject(new Error('فشل تحميل dexie-cloud'));
    document.head.appendChild(s);
  });
}

/* ── 4. واجهة المزامنة في الإعدادات ──────────────────────────────────────── */
function renderSyncPanel() {
  const container = document.getElementById('sync-panel');
  if (!container) return;

  const enabled = localStorage.getItem('zad_sync_enabled') === '1';

  container.innerHTML = `
    <div class="sync-card">
      <div class="sync-header">
        <div class="sync-icon">${enabled ? '☁️' : '📴'}</div>
        <div class="sync-info">
          <div class="sync-title">المزامنة السحابية</div>
          <div class="sync-status-text" id="sync-status-text">
            ${enabled ? 'مفعّلة — بياناتك تُزامَن بين أجهزتك' : 'معطّلة — بياناتك على هذا الجهاز فقط'}
          </div>
        </div>
      </div>

      <div class="sync-explain">
        المزامنة <strong>اختيارية تماماً</strong>. التطبيق يعمل بالكامل بدون إنترنت وبدون حساب.
        عند التفعيل، تُزامَن متابعتك (الحصاد، الأوسمة، التقدم) بين أجهزتك.
        <br><br>
        🔒 <strong>الخصوصية:</strong> إعداداتك الشخصية وملفك الشخصي يبقيان على جهازك ولا يُرفعان.
      </div>

      <div class="sync-tables">
        <div class="sync-tables-title">ما يُزامَن:</div>
        <div class="sync-tables-list">سجل العبادات · التكبير · الختمة · الصيام · الأوسمة · حسابات الزكاة</div>
      </div>

      ${enabled
        ? `<button class="btn btn-ghost" onclick="disableCloudSync()" style="width:100%">إيقاف المزامنة</button>`
        : `<button class="btn btn-primary" onclick="enableCloudSync()" style="width:100%">تفعيل المزامنة بين الأجهزة</button>`
      }
    </div>`;
}

function updateSyncUI() {
  const statusText = document.getElementById('sync-status-text');
  if (statusText) {
    const messages = {
      offline: 'معطّلة — بياناتك على هذا الجهاز فقط',
      syncing: '⏳ جارٍ المزامنة...',
      synced: '✅ مُزامَنة — آخر تحديث الآن',
      error: '⚠️ خطأ في المزامنة',
    };
    statusText.textContent = messages[SyncState.status] || '';
  }
}

function showSyncMessage(msg, type) {
  if (typeof showToast === 'function') showToast(msg);
}

/* ── 5. دليل إعداد Dexie Cloud (للمطوّر) ─────────────────────────────────── */
function showSyncSetupGuide() {
  const modal = document.createElement('div');
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px';
  modal.innerHTML = `
    <div style="background:var(--card,#fff);border-radius:20px;padding:24px;max-width:420px;max-height:80vh;overflow:auto">
      <h3 style="margin:0 0 16px;font-size:17px">إعداد المزامنة السحابية</h3>
      <div style="font-size:14px;line-height:1.9;color:var(--ink)">
        لتفعيل المزامنة، يحتاج المطوّر لإعداد Dexie Cloud (مجاني حتى 100 مستخدم):
        <ol style="padding-right:20px;margin:12px 0">
          <li>سجّل في <strong>dexie.cloud</strong></li>
          <li>أنشئ قاعدة بيانات جديدة (مجاني)</li>
          <li>انسخ الـ databaseUrl</li>
          <li>ضعه في <code>SYNC_CONFIG.databaseUrl</code> داخل <code>js/sync-module.js</code></li>
        </ol>
        البديل: Firebase Firestore لو احتجت Real-time أقوى — لكن Dexie Cloud أبسط
        لأنه امتداد مباشر لقاعدة البيانات الحالية.
      </div>
      <button onclick="this.closest('[style*=fixed]').remove()" 
              class="btn btn-primary" style="width:100%;margin-top:16px">فهمت</button>
    </div>`;
  document.body.appendChild(modal);
}
window.showSyncSetupGuide = showSyncSetupGuide;

/* ── 6. الأنماط ──────────────────────────────────────────────────────────── */
const SYNC_CSS = `
.sync-card { background: var(--card, #fff); border: 1.5px solid var(--border, #ddd); border-radius: 18px; padding: 20px; }
.sync-header { display: flex; gap: 14px; align-items: center; margin-bottom: 16px; }
.sync-icon { font-size: 36px; }
.sync-title { font-size: 17px; font-weight: 800; }
.sync-status-text { font-size: 13px; color: var(--muted, #888); margin-top: 2px; }
.sync-explain { font-size: 13px; line-height: 1.8; color: var(--ink); background: rgba(0,0,0,.03); padding: 14px; border-radius: 12px; margin-bottom: 14px; }
.sync-tables { margin-bottom: 16px; }
.sync-tables-title { font-size: 13px; font-weight: 700; margin-bottom: 4px; }
.sync-tables-list { font-size: 13px; color: var(--muted, #888); line-height: 1.6; }
`;

function injectSyncCSS() {
  if (document.getElementById('sync-css')) return;
  const s = document.createElement('style');
  s.id = 'sync-css'; s.textContent = SYNC_CSS;
  document.head.appendChild(s);
}

/* ── تشغيل ───────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('sync-panel')) {
    injectSyncCSS();
    renderSyncPanel();
    /* استعادة حالة المزامنة */
    if (localStorage.getItem('zad_sync_enabled') === '1' && SYNC_CONFIG.databaseUrl) {
      SYNC_CONFIG.enabled = true;
    }
    console.log('[SyncModule] ✅ موديول المزامنة جاهز');
  }
});

window.SYNC_CONFIG = SYNC_CONFIG;
window.SyncState = SyncState;
