import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Firestore
import {
  getFirestore, collection, query, where, orderBy, limit, getDocs,
  doc, updateDoc, deleteDoc, DocumentData, Timestamp
} from 'firebase/firestore';

type Tab = 'open' | 'resolved' | 'all';

@Component({
  selector: 'app-manage-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-reports.component.html',
  styleUrls: ['./manage-reports.component.scss']
})
export class ManageReportsComponent {
  db = getFirestore();

  // UI state
  loading = false;
  tab: Tab = 'open';
  search = '';

  // rows (all fetched for current tab), then client-side filtered/paginated
  rows: any[] = [];
  filtered: any[] = [];

  // pagination (same pattern as your other pages)
  rowsPerPageOptions = [10, 25, 50];
  rowsPerPage = 10;
  currentPage = 1;

  // counts for tab badges
  counts = { open: 0, resolved: 0, all: 0 };

  // modals
  toResolve: any | null = null;
  toDelete: any | null = null;
  note = '';

  async ngOnInit() {
    await this.refreshCounts();
    await this.load();
  }

  get totalPages() {
    return Math.max(1, Math.ceil(this.filtered.length / this.rowsPerPage));
  }

  get paginatedRows() {
    const start = (this.currentPage - 1) * this.rowsPerPage;
    return this.filtered.slice(start, start + this.rowsPerPage);
  }

  changeTab(next: Tab) {
    if (this.tab !== next) {
      this.tab = next;
      this.currentPage = 1;
      this.load();
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
    if (!s) {
      this.filtered = [...this.rows];
    } else {
      this.filtered = this.rows.filter(r => {
        const fields = [
          r.reason || '',
          r.collection || '',
          r.id || '',
          r.userId || '',
          r.status || ''
        ].join(' ').toLowerCase();
        return fields.includes(s);
      });
    }
    this.currentPage = 1;
  }

  private async refreshCounts() {
    const col = collection(this.db, 'reports');
    const openQ  = query(col, where('status', '==', 'open'), limit(1));
    const resQ   = query(col, where('status', '==', 'resolved'), limit(1));

    // Lightweight “exists” checks + fall back by reading full "all" when loading
    // (Or replace with aggregate queries if you want exact counts on load here)
    const [openSnap, resSnap] = await Promise.all([getDocs(openQ), getDocs(resQ)]);

    // We’ll show approximate counts; exact “all” comes from load()
    this.counts.open = openSnap.size; // 0 or 1 here — replaced below by exact
    this.counts.resolved = resSnap.size;
    // counts.all updated in load()
  }

  async load() {
    this.loading = true;
    try {
      const col = collection(this.db, 'reports');

      let qy = query(col, orderBy('createdAt', 'desc'), limit(500)); // cap to 500 for admin view
      if (this.tab === 'open') {
        qy = query(col, where('status', '==', 'open'), orderBy('createdAt', 'desc'), limit(500));
      } else if (this.tab === 'resolved') {
        qy = query(col, where('status', '==', 'resolved'), orderBy('createdAt', 'desc'), limit(500));
      }

      const snap = await getDocs(qy);
      this.rows = snap.docs.map(d => {
        const data = d.data() as DocumentData;
        return { id: d.id, ...data };
      });

      // update counts accurately when we have the data in memory
      this.counts.all = this.tab === 'all' ? this.rows.length : this.counts.all;
      if (this.tab === 'open') this.counts.open = this.rows.length;
      if (this.tab === 'resolved') this.counts.resolved = this.rows.length;

      // client-side filter & paginate
      this.applyClientFilter();
    } finally {
      this.loading = false;
    }
  }

  async markResolved(r: any, action: 'fixed'|'hidden'|'dismissed' = 'fixed') {
    const ref = doc(this.db, 'reports', r.id);
    await updateDoc(ref, {
      status: 'resolved',
      resolution: {
        action,
        notes: this.note || '',
        at: new Date()
      }
    });
    this.closeResolveModal();
    await this.load();
  }

  async hideTarget(r: any) {
    // If adoption, flag as hidden; for directories: set Inactive
    if (r.collection === 'pet-adoption') {
      const targetRef = doc(this.db, 'pet-adoption', r.id);
      await updateDoc(targetRef, { is_hidden: true, updatedAt: new Date() });
    } else {
      const targetRef = doc(this.db, r.collection, r.id);
      await updateDoc(targetRef, { status: 'Inactive', updatedAt: new Date() });
    }
    // also resolve this report as "hidden"
    await this.markResolved(r, 'hidden');
  }

  copyId(r: any) {
    navigator.clipboard?.writeText(r.id);
  }

  openResolveModal(r: any) {
    this.toResolve = r;
    this.note = '';
  }
  closeResolveModal() { this.toResolve = null; this.note = ''; }

  openDeleteModal(r: any) { this.toDelete = r; }
  closeDeleteModal() { this.toDelete = null; }

  async confirmDelete() {
    if (!this.toDelete) return;
    await deleteDoc(doc(this.db, 'reports', this.toDelete.id));
    this.closeDeleteModal();
    await this.load();
  }
}
