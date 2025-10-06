// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';

// // Firestore
// import {
//   getFirestore, collection, query, where, orderBy, limit, getDocs,
//   doc, updateDoc, deleteDoc, DocumentData, Timestamp
// } from 'firebase/firestore';

// type Tab = 'open' | 'resolved' | 'all';

// @Component({
//   selector: 'app-manage-reports',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './manage-reports.component.html',
//   styleUrls: ['./manage-reports.component.scss']
// })
// export class ManageReportsComponent {
//   db = getFirestore();

//   // UI state
//   loading = false;
//   tab: Tab = 'open';
//   search = '';

//   // rows (all fetched for current tab), then client-side filtered/paginated
//   rows: any[] = [];
//   filtered: any[] = [];

//   // pagination (same pattern as your other pages)
//   rowsPerPageOptions = [10, 25, 50];
//   rowsPerPage = 10;
//   currentPage = 1;

//   // counts for tab badges
//   counts = { open: 0, resolved: 0, all: 0 };

//   // modals
//   toResolve: any | null = null;
//   toDelete: any | null = null;
//   note = '';

//   async ngOnInit() {
//     await this.refreshCounts();
//     await this.load();
//   }

//   get totalPages() {
//     return Math.max(1, Math.ceil(this.filtered.length / this.rowsPerPage));
//   }

//   get paginatedRows() {
//     const start = (this.currentPage - 1) * this.rowsPerPage;
//     return this.filtered.slice(start, start + this.rowsPerPage);
//   }

//   changeTab(next: Tab) {
//     if (this.tab !== next) {
//       this.tab = next;
//       this.currentPage = 1;
//       this.load();
//     }
//   }

//   changeRowsPerPage(val: number) {
//     this.rowsPerPage = +val || 10;
//     this.currentPage = 1;
//   }

//   changePage(p: number) {
//     this.currentPage = Math.min(Math.max(1, p), this.totalPages);
//   }

//   applyClientFilter() {
//     const s = (this.search || '').trim().toLowerCase();
//     if (!s) {
//       this.filtered = [...this.rows];
//     } else {
//       this.filtered = this.rows.filter(r => {
//         const fields = [
//           r.reason || '',
//           r.collection || '',
//           r.id || '',
//           r.userId || '',
//           r.status || ''
//         ].join(' ').toLowerCase();
//         return fields.includes(s);
//       });
//     }
//     this.currentPage = 1;
//   }

//   private async refreshCounts() {
//     const col = collection(this.db, 'reports');
//     const openQ  = query(col, where('status', '==', 'open'), limit(1));
//     const resQ   = query(col, where('status', '==', 'resolved'), limit(1));

//     // Lightweight “exists” checks + fall back by reading full "all" when loading
//     // (Or replace with aggregate queries if you want exact counts on load here)
//     const [openSnap, resSnap] = await Promise.all([getDocs(openQ), getDocs(resQ)]);

//     // We’ll show approximate counts; exact “all” comes from load()
//     this.counts.open = openSnap.size; // 0 or 1 here — replaced below by exact
//     this.counts.resolved = resSnap.size;
//     // counts.all updated in load()
//   }

//   async load() {
//     this.loading = true;
//     try {
//       const col = collection(this.db, 'reports');

//       let qy = query(col, orderBy('createdAt', 'desc'), limit(500)); // cap to 500 for admin view
//       if (this.tab === 'open') {
//         qy = query(col, where('status', '==', 'open'), orderBy('createdAt', 'desc'), limit(500));
//       } else if (this.tab === 'resolved') {
//         qy = query(col, where('status', '==', 'resolved'), orderBy('createdAt', 'desc'), limit(500));
//       }

//       const snap = await getDocs(qy);
//       this.rows = snap.docs.map(d => {
//         const data = d.data() as DocumentData;
//         return { id: d.id, ...data };
//       });

//       // update counts accurately when we have the data in memory
//       this.counts.all = this.tab === 'all' ? this.rows.length : this.counts.all;
//       if (this.tab === 'open') this.counts.open = this.rows.length;
//       if (this.tab === 'resolved') this.counts.resolved = this.rows.length;

//       // client-side filter & paginate
//       this.applyClientFilter();
//     } finally {
//       this.loading = false;
//     }
//   }

//   async markResolved(r: any, action: 'fixed'|'hidden'|'dismissed' = 'fixed') {
//     const ref = doc(this.db, 'reports', r.id);
//     await updateDoc(ref, {
//       status: 'resolved',
//       resolution: {
//         action,
//         notes: this.note || '',
//         at: new Date()
//       }
//     });
//     this.closeResolveModal();
//     await this.load();
//   }

//   async hideTarget(r: any) {
//     // If adoption, flag as hidden; for directories: set Inactive
//     if (r.collection === 'pet-adoption') {
//       const targetRef = doc(this.db, 'pet-adoption', r.id);
//       await updateDoc(targetRef, { is_hidden: true, updatedAt: new Date() });
//     } else {
//       const targetRef = doc(this.db, r.collection, r.id);
//       await updateDoc(targetRef, { status: 'Inactive', updatedAt: new Date() });
//     }
//     // also resolve this report as "hidden"
//     await this.markResolved(r, 'hidden');
//   }

//   copyId(r: any) {
//     navigator.clipboard?.writeText(r.id);
//   }

//   openResolveModal(r: any) {
//     this.toResolve = r;
//     this.note = '';
//   }
//   closeResolveModal() { this.toResolve = null; this.note = ''; }

//   openDeleteModal(r: any) { this.toDelete = r; }
//   closeDeleteModal() { this.toDelete = null; }

//   async confirmDelete() {
//     if (!this.toDelete) return;
//     await deleteDoc(doc(this.db, 'reports', this.toDelete.id));
//     this.closeDeleteModal();
//     await this.load();
//   }
// }

import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  getFirestore,
  collection,
  query,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  DocumentData,
  Timestamp,
  orderBy,
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

type Tab = 'open' | 'resolved' | 'all';

interface ProcessedReport {
  id: string;
  createdAt: Timestamp | null;
  collection: string;
  reason: string;
  userId: string;
  status: string;
}

@Component({
  selector: 'app-manage-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-reports.component.html',
  styleUrls: ['./manage-reports.component.scss'],
})
export class ManageReportsComponent implements OnDestroy {
  db = getFirestore();
  auth = getAuth();

  loading = false;
  tab: Tab = 'open';
  search = '';
  isAdmin = false;
  rows: ProcessedReport[] = [];
  filtered: ProcessedReport[] = [];
  rowsPerPageOptions = [10, 25, 50];
  rowsPerPage = 10;
  currentPage = 1;
  counts = { open: 0, resolved: 0, all: 0 };
  toResolve: ProcessedReport | null = null;
  toDelete: ProcessedReport | null = null;
  note = '';
  private unsubscribe?: () => void;
  private authUnsubscribe?: () => void;

  async ngOnInit() {
    this.loading = true;
    this.authUnsubscribe = onAuthStateChanged(
      this.auth,
      async (user) => {
        console.log(
          'Auth state changed:',
          user ? `UID: ${user.uid}` : 'No user'
        );
        await this.checkAdminStatus(user);
        if (this.isAdmin) {
          this.setupRealTimeUpdates();
        } else {
          console.error('Admin access required');
          this.loading = false;
        }
      },
      (error) => {
        console.error('Auth state listener error:', error);
        this.isAdmin = false;
        this.loading = false;
      }
    );
  }

  ngOnDestroy() {
    if (this.unsubscribe) {
      try {
        this.unsubscribe();
        console.log('Unsubscribed from reports listener');
      } catch (e) {
        console.error('Error unsubscribing from reports listener:', e);
      }
    }
    if (this.authUnsubscribe) {
      try {
        this.authUnsubscribe();
        console.log('Unsubscribed from auth listener');
      } catch (e) {
        console.error('Error unsubscribing from auth listener:', e);
      }
    }
  }

  private async checkAdminStatus(user: any | null) {
    if (!user) {
      console.warn('No authenticated user found');
      this.isAdmin = false;
      return;
    }
    try {
      console.log('Checking admin status for UID:', user.uid);
      const adminDoc = await getDoc(doc(this.db, 'admins', user.uid));
      this.isAdmin = adminDoc.exists() || this.isFallbackAdmin(user.uid);
      console.log(
        'Admin status:',
        this.isAdmin,
        'Admin doc exists:',
        adminDoc.exists()
      );
      if (!this.isAdmin) {
        console.warn(`User ${user.uid} is not an admin`);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      this.isAdmin = false;
    }
  }

  private isFallbackAdmin(uid: string): boolean {
    const isFallback = uid === 'an34sdrlaNZRNYaG132yc40zmhL2';
    console.log('Checking fallback admin UID:', uid, 'Result:', isFallback);
    return isFallback;
  }

  get totalPages() {
    return Math.max(1, Math.ceil(this.filtered.length / this.rowsPerPage));
  }

  get paginatedRows() {
    const start = (this.currentPage - 1) * this.rowsPerPage;
    return this.filtered.slice(start, start + this.rowsPerPage);
  }

  changeTab(next: Tab) {
    if (this.tab !== next && this.isAdmin) {
      this.tab = next;
      this.currentPage = 1;
      this.applyClientFilter();
    }
  }

  changeRowsPerPage(val: number) {
    this.rowsPerPage = +val || 10;
    this.currentPage = 1;
  }

  changePage(p: number) {
    this.currentPage = Math.min(Math.max(1, p), this.totalPages);
  }

  applyClientFilter() {
    const s = (this.search || '').trim().toLowerCase();
    let filteredRows = [...this.rows];

    if (this.tab === 'open') {
      filteredRows = filteredRows.filter((r) => r.status === 'open');
    } else if (this.tab === 'resolved') {
      filteredRows = filteredRows.filter((r) => r.status === 'resolved');
    }

    if (s) {
      filteredRows = filteredRows.filter((r) => {
        const fields = [
          r.reason || '',
          r.collection || '',
          r.id || '',
          r.userId || '',
          r.status || '',
        ]
          .join(' ')
          .toLowerCase();
        return fields.includes(s);
      });
    }

    this.filtered = filteredRows;
    this.currentPage = Math.min(this.currentPage, this.totalPages);
    this.refreshCounts();
  }

  private setupRealTimeUpdates() {
    if (!this.isAdmin || this.unsubscribe) {
      console.warn(
        'Skipping real-time updates: not admin or listener already active'
      );
      return;
    }

    this.loading = true;
    const col = collection(this.db, 'reports');
    const q = query(col, orderBy('createdAt', 'desc'));
    this.unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log('Snapshot received, documents:', snapshot.docs.length);
        this.rows = snapshot.docs.map((d) => {
          const data = d.data() as DocumentData;
          return {
            id: d.id,
            createdAt: data['createdAt'] || null,
            collection: data['collection'] || '',
            reason: data['reason'] || 'No reason provided',
            userId: data['userId'] || '',
            status: data['status'] || 'open',
          } as ProcessedReport;
        });
        console.log('Processed reports:', this.rows);
        this.applyClientFilter();
        this.loading = false;
      },
      (error) => {
        console.error('Error in reports listener:', error);
        this.loading = false;
        this.rows = [];
        this.filtered = [];
        this.counts = { open: 0, resolved: 0, all: 0 };
      }
    );
  }

  private refreshCounts() {
    this.counts = {
      open: this.rows.filter((r) => r.status === 'open').length,
      resolved: this.rows.filter((r) => r.status === 'resolved').length,
      all: this.rows.length,
    };
    console.log('Updated counts:', this.counts);
  }

  async markResolved(
    r: ProcessedReport,
    action: 'fixed' | 'hidden' | 'dismissed' = 'fixed'
  ) {
    if (!this.isAdmin) {
      console.warn('Cannot resolve report: not admin');
      return;
    }
    const ref = doc(this.db, 'reports', r.id);
    try {
      await updateDoc(ref, {
        status: 'resolved',
        resolution: { action, notes: this.note || '', at: new Date() },
      });
      console.log(`Report ${r.id} resolved with action: ${action}`);
      this.closeResolveModal();
    } catch (error) {
      console.error('Error resolving report:', error);
    }
  }

  async hideTarget(r: ProcessedReport) {
    if (!this.isAdmin) {
      console.warn('Cannot hide target: not admin');
      return;
    }
    try {
      if (r.collection === 'pet-adoption') {
        const targetRef = doc(this.db, 'pet-adoption', r.id);
        await updateDoc(targetRef, { is_hidden: true, updatedAt: new Date() });
      } else {
        const targetRef = doc(this.db, r.collection, r.id);
        await updateDoc(targetRef, {
          status: 'Inactive',
          updatedAt: new Date(),
        });
      }
      console.log(`Target ${r.id} in ${r.collection} hidden`);
      await this.markResolved(r, 'hidden');
    } catch (error) {
      console.error('Error hiding target:', error);
    }
  }

  copyId(r: ProcessedReport) {
    navigator.clipboard?.writeText(r.id);
    console.log(`Copied ID: ${r.id}`);
  }

  openResolveModal(r: ProcessedReport, event?: MouseEvent) {
    console.log(
      'Opening resolve modal for report:',
      r.id,
      'Click event:',
      event ? { x: event.clientX, y: event.clientY } : 'No event'
    );
    this.toResolve = r;
    this.note = '';
    console.log('toResolve set to:', this.toResolve);
  }

  closeResolveModal() {
    console.log('Closing resolve modal, toResolve was:', this.toResolve);
    this.toResolve = null;
    this.note = '';
  }

  openDeleteModal(r: ProcessedReport, event?: MouseEvent) {
    console.log(
      'Opening delete modal for report:',
      r.id,
      'Click event:',
      event ? { x: event.clientX, y: event.clientY } : 'No event'
    );
    this.toDelete = r;
    console.log('toDelete set to:', this.toDelete);
  }

  closeDeleteModal() {
    console.log('Closing delete modal, toDelete was:', this.toDelete);
    this.toDelete = null;
  }

  async confirmDelete() {
    if (!this.toDelete || !this.isAdmin) {
      console.warn('Cannot delete report: no report selected or not admin');
      return;
    }
    try {
      await deleteDoc(doc(this.db, 'reports', this.toDelete.id));
      console.log(`Report ${this.toDelete.id} deleted`);
      this.closeDeleteModal();
    } catch (error) {
      console.error('Error deleting report:', error);
    }
  }
}
