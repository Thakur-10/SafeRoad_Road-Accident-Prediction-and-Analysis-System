import React, { useState, useEffect } from 'react';
import {
  Package,
  Wrench,
  Truck,
  Video,
  Shield,
  MapPin,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Download,
  Printer,
  AlertTriangle,
  CheckCircle2,
  Clock,
  User,
  Tag,
  FileText,
  BarChart3,
  Layers,
  RefreshCw,
  X,
  Check,
  Compass
} from 'lucide-react';
import { InventoryItem, MaintenanceRecord, InventoryCategory, InventoryStatus, User as UserType } from '../types';

interface InventoryManagementProps {
  currentUser: UserType | null;
}

export const InventoryManagement: React.FC<InventoryManagementProps> = ({ currentUser }) => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'catalog' | 'maintenance' | 'analytics'>('catalog');

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [lowStockOnly, setLowStockOnly] = useState<boolean>(false);

  // Modals
  const [isItemModalOpen, setIsItemModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  
  const [isMaintModalOpen, setIsMaintModalOpen] = useState<boolean>(false);
  const [editingMaint, setEditingMaint] = useState<MaintenanceRecord | null>(null);

  // Form states for Item
  const [formName, setFormName] = useState<string>('');
  const [formCategory, setFormCategory] = useState<InventoryCategory>('Vehicle');
  const [formSku, setFormSku] = useState<string>('');
  const [formSerialNumber, setFormSerialNumber] = useState<string>('');
  const [formStatus, setFormStatus] = useState<InventoryStatus>('Operational');
  const [formStock, setFormStock] = useState<number>(1);
  const [formThreshold, setFormThreshold] = useState<number>(3);
  const [formAssignedTo, setFormAssignedTo] = useState<string>('');
  const [formLocation, setFormLocation] = useState<string>('');
  const [formPurchaseDate, setFormPurchaseDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [formNextMaint, setFormNextMaint] = useState<string>(new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10));
  const [formNotes, setFormNotes] = useState<string>('');

  // Form states for Maintenance
  const [maintItemId, setMaintItemId] = useState<string>('');
  const [maintIssue, setMaintIssue] = useState<string>('');
  const [maintAction, setMaintAction] = useState<string>('');
  const [maintCost, setMaintCost] = useState<number>(0);
  const [maintTech, setMaintTech] = useState<string>('');
  const [maintStatus, setMaintStatus] = useState<'Scheduled' | 'In Progress' | 'Completed' | 'Overdue'>('Scheduled');
  const [maintDate, setMaintDate] = useState<string>(new Date().toISOString().slice(0, 10));

  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invRes, maintRes] = await Promise.all([
        fetch('/api/inventory'),
        fetch('/api/maintenance')
      ]);
      if (invRes.ok && maintRes.ok) {
        const invData = await invRes.json();
        const maintData = await maintRes.json();
        setItems(invData);
        setMaintenance(maintData);
      }
    } catch (err) {
      console.error('Failed to fetch inventory data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName) return;

    const payload = {
      name: formName,
      category: formCategory,
      sku: formSku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      serialNumber: formSerialNumber || `SN-${Math.floor(100000 + Math.random() * 900000)}`,
      status: formStatus,
      stockQuantity: formStock,
      minStockThreshold: formThreshold,
      assignedTo: formAssignedTo || 'Unassigned',
      location: formLocation || 'Main Warehouse',
      purchaseDate: formPurchaseDate,
      lastMaintenanceDate: new Date().toISOString().slice(0, 10),
      nextMaintenanceDate: formNextMaint,
      notes: formNotes,
      createdBy: currentUser?.id || 'usr_admin'
    };

    try {
      if (editingItem) {
        const res = await fetch(`/api/inventory/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const updated = await res.json();
          setItems(items.map((i) => (i.id === updated.id ? updated : i)));
        }
      } else {
        const res = await fetch('/api/inventory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const created = await res.json();
          setItems([created, ...items]);
        }
      }
      closeItemModal();
    } catch (err) {
      console.error('Error saving inventory item:', err);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!isAdmin) {
      alert('Only administrators can delete inventory items.');
      return;
    }
    if (!confirm('Are you sure you want to delete this inventory asset?')) return;
    try {
      const res = await fetch(`/api/inventory/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setItems(items.filter((i) => i.id !== id));
      }
    } catch (err) {
      console.error('Error deleting inventory item:', err);
    }
  };

  const handleSaveMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedItem = items.find((i) => i.id === maintItemId);
    if (!selectedItem || !maintIssue) {
      alert('Please select an item and describe the issue.');
      return;
    }

    const payload = {
      itemId: selectedItem.id,
      itemName: selectedItem.name,
      issue: maintIssue,
      actionTaken: maintAction || 'Inspection in progress',
      cost: maintCost,
      technician: maintTech || currentUser?.name || 'Authorized Technician',
      status: maintStatus,
      scheduledDate: maintDate,
      completedDate: maintStatus === 'Completed' ? new Date().toISOString().slice(0, 10) : ''
    };

    try {
      if (editingMaint) {
        const res = await fetch(`/api/maintenance/${editingMaint.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const updated = await res.json();
          setMaintenance(maintenance.map((m) => (m.id === updated.id ? updated : m)));
        }
      } else {
        const res = await fetch('/api/maintenance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const created = await res.json();
          setMaintenance([created, ...maintenance]);
        }
      }
      closeMaintModal();
    } catch (err) {
      console.error('Error saving maintenance record:', err);
    }
  };

  const handleDeleteMaintenance = async (id: string) => {
    if (!isAdmin) {
      alert('Only administrators can delete maintenance records.');
      return;
    }
    if (!confirm('Are you sure you want to delete this maintenance record?')) return;
    try {
      const res = await fetch(`/api/maintenance/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMaintenance(maintenance.filter((m) => m.id !== id));
      }
    } catch (err) {
      console.error('Error deleting maintenance record:', err);
    }
  };

  const openAddItemModal = () => {
    setEditingItem(null);
    setFormName('');
    setFormCategory('Vehicle');
    setFormSku(`SKU-${Math.floor(1000 + Math.random() * 9000)}`);
    setFormSerialNumber(`SN-${Math.floor(100000 + Math.random() * 900000)}`);
    setFormStatus('Operational');
    setFormStock(1);
    setFormThreshold(3);
    setFormAssignedTo(currentUser?.name || '');
    setFormLocation('Main Warehouse Bay 1');
    setFormPurchaseDate(new Date().toISOString().slice(0, 10));
    setFormNextMaint(new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10));
    setFormNotes('');
    setIsItemModalOpen(true);
  };

  const openEditItemModal = (item: InventoryItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormSku(item.sku);
    setFormSerialNumber(item.serialNumber);
    setFormStatus(item.status);
    setFormStock(item.stockQuantity);
    setFormThreshold(item.minStockThreshold);
    setFormAssignedTo(item.assignedTo);
    setFormLocation(item.location);
    setFormPurchaseDate(item.purchaseDate);
    setFormNextMaint(item.nextMaintenanceDate);
    setFormNotes(item.notes);
    setIsItemModalOpen(true);
  };

  const closeItemModal = () => {
    setIsItemModalOpen(false);
    setEditingItem(null);
  };

  const openAddMaintModal = () => {
    setEditingMaint(null);
    setMaintItemId(items[0]?.id || '');
    setMaintIssue('');
    setMaintAction('');
    setMaintCost(0);
    setMaintTech(currentUser?.name || '');
    setMaintStatus('Scheduled');
    setMaintDate(new Date().toISOString().slice(0, 10));
    setIsMaintModalOpen(true);
  };

  const openEditMaintModal = (m: MaintenanceRecord) => {
    setEditingMaint(m);
    setMaintItemId(m.itemId);
    setMaintIssue(m.issue);
    setMaintAction(m.actionTaken);
    setMaintCost(m.cost);
    setMaintTech(m.technician);
    setMaintStatus(m.status);
    setMaintDate(m.scheduledDate);
    setIsMaintModalOpen(true);
  };

  const closeMaintModal = () => {
    setIsMaintModalOpen(false);
    setEditingMaint(null);
  };

  // Export functions
  const exportCSV = () => {
    const headers = ['ID,Name,Category,SKU,SerialNumber,Status,Stock,MinThreshold,AssignedTo,Location,PurchaseDate,NextMaintenance\n'];
    const rows = items.map((i) => 
      `"${i.id}","${i.name}","${i.category}","${i.sku}","${i.serialNumber}","${i.status}",${i.stockQuantity},${i.minStockThreshold},"${i.assignedTo}","${i.location}","${i.purchaseDate}","${i.nextMaintenanceDate}"`
    );
    const csvContent = headers.concat(rows).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SafeRoad_AI_Inventory_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportExcelTSV = () => {
    const headers = ['ID\tName\tCategory\tSKU\tSerial Number\tStatus\tStock\tThreshold\tAssigned To\tLocation\tPurchase Date\tNext Maintenance\n'];
    const rows = items.map((i) => 
      `${i.id}\t${i.name}\t${i.category}\t${i.sku}\t${i.serialNumber}\t${i.status}\t${i.stockQuantity}\t${i.minStockThreshold}\t${i.assignedTo}\t${i.location}\t${i.purchaseDate}\t${i.nextMaintenanceDate}`
    );
    const tsvContent = headers.concat(rows).join('\n');
    const blob = new Blob([tsvContent], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SafeRoad_AI_Inventory_Export_${new Date().toISOString().slice(0, 10)}.xls`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const printPDFReport = () => {
    window.print();
  };

  // Filtered Items
  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;
    const matchesStock = !lowStockOnly || item.stockQuantity <= item.minStockThreshold;

    return matchesSearch && matchesCategory && matchesStatus && matchesStock;
  });

  // Metrics
  const totalAssetsCount = items.length;
  const lowStockCount = items.filter((i) => i.stockQuantity <= i.minStockThreshold).length;
  const inMaintenanceCount = items.filter((i) => i.status === 'In Maintenance').length;
  const operationalCount = items.filter((i) => i.status === 'Operational' || i.status === 'Deployed').length;
  const totalMaintenanceCost = maintenance.reduce((acc, m) => acc + m.cost, 0);

  const getCategoryIcon = (cat: InventoryCategory) => {
    switch (cat) {
      case 'Vehicle': return <Truck className="w-4 h-4 text-indigo-600" />;
      case 'Camera': return <Video className="w-4 h-4 text-emerald-600" />;
      case 'Safety Equipment': return <Shield className="w-4 h-4 text-amber-600" />;
      case 'GPS Device': return <Compass className="w-4 h-4 text-blue-600" />;
      case 'Stock': return <Package className="w-4 h-4 text-purple-600" />;
      default: return <Layers className="w-4 h-4 text-slate-600" />;
    }
  };

  const getStatusBadge = (status: InventoryStatus | string) => {
    switch (status) {
      case 'Operational':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">Operational</span>;
      case 'Deployed':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-400">Deployed</span>;
      case 'In Maintenance':
      case 'Scheduled':
      case 'In Progress':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400">{status}</span>;
      case 'Low Stock':
      case 'Overdue':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400">{status}</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-950 text-white rounded-2xl p-6 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-indigo-500/20">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <Package className="w-4 h-4" />
            <span>Enterprise Asset & Stock Intelligence</span>
          </div>
          <h2 className="text-2xl font-extrabold font-['Outfit'] mt-1 text-white">
            Inventory & Equipment Management
          </h2>
          <p className="text-slate-300 text-xs mt-1 max-w-2xl">
            Manage vehicles, AI dashcams, safety equipment, GPS tracking devices, and maintenance schedules with real-time stock alerts and role-based permissions.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={exportCSV}
            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition border border-white/10"
          >
            <Download className="w-3.5 h-3.5" /> CSV Export
          </button>
          <button
            onClick={exportExcelTSV}
            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition border border-white/10"
          >
            <FileText className="w-3.5 h-3.5" /> Excel / TSV
          </button>
          <button
            onClick={printPDFReport}
            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition border border-white/10"
          >
            <Printer className="w-3.5 h-3.5" /> Print PDF
          </button>
          {isAdmin && (
            <button
              onClick={openAddItemModal}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-md"
            >
              <Plus className="w-4 h-4" /> Add New Asset
            </button>
          )}
        </div>
      </div>

      {/* Low Stock Alert Banner */}
      {lowStockCount > 0 && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-4 flex items-center justify-between text-rose-900 dark:text-rose-200 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900 text-rose-600 dark:text-rose-300">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="font-bold text-sm">Low Stock Alert ({lowStockCount} items requiring replenishment)</h4>
              <p className="text-xs text-rose-700 dark:text-rose-300">One or more critical safety equipment or camera units have fallen below their minimum stock threshold.</p>
            </div>
          </div>
          <button
            onClick={() => setLowStockOnly(true)}
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition shadow-sm"
          >
            View Low Stock Items
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Assets</span>
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-3">{totalAssetsCount}</div>
          <p className="text-xs text-slate-500 mt-1">Across 6 enterprise categories</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Operational / Deployed</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-3">{operationalCount}</div>
          <p className="text-xs text-emerald-600 font-medium mt-1">Active fleet & equipment</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">In Maintenance</span>
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600">
              <Wrench className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-3">{inMaintenanceCount}</div>
          <p className="text-xs text-amber-600 font-medium mt-1">${totalMaintenanceCost} total service cost</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Low Stock Warnings</span>
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-3">{lowStockCount}</div>
          <p className="text-xs text-rose-600 font-medium mt-1">Requires immediate order</p>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 flex-wrap gap-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'catalog'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Package className="w-4 h-4" /> Inventory Catalog ({items.length})
          </button>
          <button
            onClick={() => setActiveTab('maintenance')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'maintenance'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Wrench className="w-4 h-4" /> Maintenance Logs ({maintenance.length})
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'analytics'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <BarChart3 className="w-4 h-4" /> Analytics & Reports
          </button>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Database synced • Role: <strong className="text-slate-800 dark:text-slate-200 uppercase">{currentUser?.role || 'user'}</strong>
        </div>
      </div>

      {/* TAB 1: INVENTORY CATALOG */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          
          {/* Search & Filters Toolbar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search assets, SKU, serial, location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center flex-wrap gap-3 w-full md:w-auto justify-end">
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="All">All Categories</option>
                  <option value="Vehicle">Vehicle</option>
                  <option value="Camera">Camera</option>
                  <option value="Safety Equipment">Safety Equipment</option>
                  <option value="GPS Device">GPS Device</option>
                  <option value="Stock">Stock</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Operational">Operational</option>
                <option value="Deployed">Deployed</option>
                <option value="In Maintenance">In Maintenance</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Decommissioned">Decommissioned</option>
              </select>

              <button
                onClick={() => setLowStockOnly(!lowStockOnly)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition border ${
                  lowStockOnly
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                Low Stock Only
              </button>

              <button
                onClick={fetchData}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition"
                title="Refresh Data"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Inventory Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="text-center py-16 text-slate-400">Loading inventory catalog...</div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-16 text-slate-400 space-y-2">
                <Package className="w-10 h-10 mx-auto opacity-40" />
                <p className="text-sm font-medium">No inventory assets match your criteria.</p>
                <button onClick={() => { setSearchTerm(''); setSelectedCategory('All'); setSelectedStatus('All'); setLowStockOnly(false); }} className="text-indigo-600 text-xs font-bold underline">
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3.5 px-4">Asset Name & SKU</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Stock / Threshold</th>
                      <th className="py-3.5 px-4">Assigned To</th>
                      <th className="py-3.5 px-4">Location</th>
                      <th className="py-3.5 px-4">Next Maint.</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {filteredItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            {getCategoryIcon(item.category)}
                            {item.name}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">SKU: {item.sku} • SN: {item.serialNumber}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-slate-700 dark:text-slate-300">{item.category}</span>
                        </td>
                        <td className="py-3 px-4">
                          {item.stockQuantity <= item.minStockThreshold ? (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400">
                              Low Stock ({item.stockQuantity})
                            </span>
                          ) : (
                            getStatusBadge(item.status)
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-slate-800 dark:text-slate-200">
                          {item.stockQuantity} <span className="text-[10px] text-slate-400 font-normal">(Min: {item.minStockThreshold})</span>
                        </td>
                        <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-indigo-500" />
                            {item.assignedTo}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {item.location}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                          {item.nextMaintenanceDate}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => openEditItemModal(item)}
                              className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 transition"
                              title="Edit Asset"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            {isAdmin && (
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-600 transition"
                                title="Delete Asset"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 2: MAINTENANCE LOGS */}
      {activeTab === 'maintenance' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm font-['Outfit']">
                Maintenance Schedule & Service Records
              </h3>
              <p className="text-xs text-slate-500">Track repairs, calibrations, servicing costs, and technician assignments.</p>
            </div>
            <button
              onClick={openAddMaintModal}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
            >
              <Plus className="w-4 h-4" /> Schedule Maintenance
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            {maintenance.length === 0 ? (
              <div className="text-center py-16 text-slate-400 space-y-2">
                <Wrench className="w-10 h-10 mx-auto opacity-40" />
                <p className="text-sm font-medium">No maintenance records logged.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3.5 px-4">Asset Item</th>
                      <th className="py-3.5 px-4">Reported Issue & Action</th>
                      <th className="py-3.5 px-4">Technician</th>
                      <th className="py-3.5 px-4">Cost</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Scheduled Date</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {maintenance.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                          {m.itemName}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-800 dark:text-slate-200">{m.issue}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">Action: {m.actionTaken}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                          {m.technician}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                          ${m.cost}
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(m.status)}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                          {m.scheduledDate}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => openEditMaintModal(m)}
                              className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 transition"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            {isAdmin && (
                              <button
                                onClick={() => handleDeleteMaintenance(m.id)}
                                className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-600 transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: ANALYTICS & REPORTS */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm font-['Outfit'] flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-600" /> Assets by Category Distribution
            </h3>
            <div className="space-y-3 pt-2">
              {['Vehicle', 'Camera', 'Safety Equipment', 'GPS Device', 'Stock'].map((cat) => {
                const count = items.filter((i) => i.category === cat).length;
                const pct = totalAssetsCount > 0 ? Math.round((count / totalAssetsCount) * 100) : 0;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <span>{cat}</span>
                      <span>{count} assets ({pct}%)</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm font-['Outfit'] flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" /> Asset Status Health Overview
            </h3>
            <div className="space-y-3 pt-2">
              {['Operational', 'Deployed', 'In Maintenance', 'Low Stock'].map((st) => {
                const count = st === 'Low Stock' 
                  ? items.filter((i) => i.stockQuantity <= i.minStockThreshold).length
                  : items.filter((i) => i.status === st).length;
                const pct = totalAssetsCount > 0 ? Math.round((count / totalAssetsCount) * 100) : 0;
                return (
                  <div key={st} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <span>{st}</span>
                      <span>{count} items ({pct}%)</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${
                        st === 'Operational' ? 'bg-emerald-500' :
                        st === 'Deployed' ? 'bg-blue-500' :
                        st === 'In Maintenance' ? 'bg-amber-500' : 'bg-rose-500'
                      }`} style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT ITEM MODAL */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base font-['Outfit']">
                {editingItem ? 'Edit Inventory Asset' : 'Add New Inventory Asset'}
              </h3>
              <button onClick={closeItemModal} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Asset Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. AI Smart Dashcam Pro"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Category *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as InventoryCategory)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Vehicle">Vehicle</option>
                    <option value="Camera">Camera</option>
                    <option value="Safety Equipment">Safety Equipment</option>
                    <option value="GPS Device">GPS Device</option>
                    <option value="Stock">Stock</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">SKU Number</label>
                  <input
                    type="text"
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Serial Number</label>
                  <input
                    type="text"
                    value={formSerialNumber}
                    onChange={(e) => setFormSerialNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as InventoryStatus)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Operational">Operational</option>
                    <option value="Deployed">Deployed</option>
                    <option value="In Maintenance">In Maintenance</option>
                    <option value="Decommissioned">Decommissioned</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Stock Qty</label>
                    <input
                      type="number"
                      min="0"
                      value={formStock}
                      onChange={(e) => setFormStock(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Min Threshold</label>
                    <input
                      type="number"
                      min="0"
                      value={formThreshold}
                      onChange={(e) => setFormThreshold(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Assigned To (User / Team)</label>
                  <input
                    type="text"
                    value={formAssignedTo}
                    onChange={(e) => setFormAssignedTo(e.target.value)}
                    placeholder="e.g. Alexander Wright"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Location / Vehicle Unit</label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="e.g. Bay 4 / Vehicle #104"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Purchase Date</label>
                  <input
                    type="date"
                    value={formPurchaseDate}
                    onChange={(e) => setFormPurchaseDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Next Maintenance Date</label>
                  <input
                    type="date"
                    value={formNextMaint}
                    onChange={(e) => setFormNextMaint(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Notes & Specifications</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Additional hardware specs or deployment instructions..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none resize-none"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={closeItemModal}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold transition hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-md"
                >
                  {editingItem ? 'Update Asset' : 'Save Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SCHEDULE MAINTENANCE MODAL */}
      {isMaintModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base font-['Outfit']">
                {editingMaint ? 'Edit Maintenance Record' : 'Schedule New Maintenance'}
              </h3>
              <button onClick={closeMaintModal} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMaintenance} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Select Asset *</label>
                <select
                  value={maintItemId}
                  onChange={(e) => setMaintItemId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                >
                  {items.map((i) => (
                    <option key={i.id} value={i.id}>{i.name} ({i.sku})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Reported Issue *</label>
                <input
                  type="text"
                  required
                  value={maintIssue}
                  onChange={(e) => setMaintIssue(e.target.value)}
                  placeholder="e.g. Routine calibration check or sensor fault"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Action Taken / Repair Notes</label>
                <input
                  type="text"
                  value={maintAction}
                  onChange={(e) => setMaintAction(e.target.value)}
                  placeholder="e.g. Realigned optical sensors and updated firmware"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Service Cost ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={maintCost}
                    onChange={(e) => setMaintCost(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Status</label>
                  <select
                    value={maintStatus}
                    onChange={(e) => setMaintStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Technician</label>
                  <input
                    type="text"
                    value={maintTech}
                    onChange={(e) => setMaintTech(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Scheduled Date</label>
                  <input
                    type="date"
                    value={maintDate}
                    onChange={(e) => setMaintDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={closeMaintModal}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold transition hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-md"
                >
                  {editingMaint ? 'Update Record' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
