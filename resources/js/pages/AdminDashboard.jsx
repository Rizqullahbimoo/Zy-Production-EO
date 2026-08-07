import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import MouManageModal from '../components/admin/MouManageModal';
import '../../css/pages/admin-dashboard.css';

const MOU_STATUS_BADGE = {
  belum_ada: 'status-selesai-dicek',
  menunggu_ttd_customer: 'status-menunggu-verifikasi',
  menunggu_ttd_admin: 'status-menunggu-konfirmasi',
  selesai: 'status-diproses',
};

const MOU_STATUS_LABEL = {
  belum_ada: 'Belum Ada',
  menunggu_ttd_customer: 'Menunggu TTD Customer',
  menunggu_ttd_admin: 'Menunggu TTD Admin',
  selesai: 'Selesai',
};

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [metrics, setMetrics] = useState({
    kategori: 0,
    paket: 0,
    pemesanan: 0,
    request_custom: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [user, setUser] = useState(null);

  // Data Pemesanan state
  const [orders, setOrders] = useState([]);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isSubmittingStatus, setIsSubmittingStatus] = useState(false);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [selectedOrderStatus, setSelectedOrderStatus] = useState('');

  // Custom Paket state
  const [customRequests, setCustomRequests] = useState([]);
  const [customSearch, setCustomSearch] = useState('');
  const [customStatusFilter, setCustomStatusFilter] = useState('');
  const [selectedCustomRequest, setSelectedCustomRequest] = useState(null);
  const [isLoadingCustomRequests, setIsLoadingCustomRequests] = useState(false);
  const [selectedCustomStatus, setSelectedCustomStatus] = useState('');
  const [isSubmittingCustomStatus, setIsSubmittingCustomStatus] = useState(false);

  // Kelola Dokumen MOU state
  const [mouModalTarget, setMouModalTarget] = useState(null); // { tipe, id, idMou }

  // Penawaran form states
  const [totalPenawaran, setTotalPenawaran] = useState('');
  const [dpAwal, setDpAwal] = useState('');
  const [catatanAdmin, setCatatanAdmin] = useState('');
  const [isSubmittingPenawaran, setIsSubmittingPenawaran] = useState(false);

  // Kategori & Paket Event state
  const [packages, setPackages] = useState([]);
  const [isLoadingPackages, setIsLoadingPackages] = useState(false);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);

  // Package form fields
  const [packageName, setPackageName] = useState('');
  const [packagePrice, setPackagePrice] = useState('');
  const [packageDesc, setPackageDesc] = useState('');
  const [packageStatus, setPackageStatus] = useState('aktif');
  const [packageFoto, setPackageFoto] = useState(null);
  const [isSubmittingPackage, setIsSubmittingPackage] = useState(false);

  // Package modal: tab Fasilitas
  const [packageModalTab, setPackageModalTab] = useState('info');
  const [packageFacilities, setPackageFacilities] = useState([]);
  const [isLoadingPackageFacilities, setIsLoadingPackageFacilities] = useState(false);
  const [selectedPackageFasilitas, setSelectedPackageFasilitas] = useState([]);
  const [isSubmittingPackageFacilities, setIsSubmittingPackageFacilities] = useState(false);

  // Category (Kategori) CRUD state
  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDesc, setCategoryDesc] = useState('');
  const [isSubmittingCategory, setIsSubmittingCategory] = useState(false);

  // Facility (Fasilitas) CRUD state
  const [facilities, setFacilities] = useState([]);
  const [isLoadingFacilities, setIsLoadingFacilities] = useState(false);
  const [showFacilityModal, setShowFacilityModal] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [facilityName, setFacilityName] = useState('');
  const [facilityDesc, setFacilityDesc] = useState('');
  const [isSubmittingFacility, setIsSubmittingFacility] = useState(false);

  // Galeri Event CRUD state
  const [galleryItems, setGalleryItems] = useState([]);
  const [isLoadingGallery, setIsLoadingGallery] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [selectedGallery, setSelectedGallery] = useState(null);
  const [galleryTitle, setGalleryTitle] = useState('');
  const [galleryDesc, setGalleryDesc] = useState('');
  const [galleryOrder, setGalleryOrder] = useState('');
  const [galleryFoto, setGalleryFoto] = useState(null);
  const [galleryTanggal, setGalleryTanggal] = useState('');
  const [isSubmittingGallery, setIsSubmittingGallery] = useState(false);

  // Profile admin states
  const [profileNama, setProfileNama] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileNoHp, setProfileNoHp] = useState('');
  const [profilePassword, setProfilePassword] = useState('');
  const [profilePasswordConfirm, setProfilePasswordConfirm] = useState('');
  const [profileFotoFile, setProfileFotoFile] = useState(null);
  const [profileFotoPreview, setProfileFotoPreview] = useState(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileErrorMsg, setProfileErrorMsg] = useState('');

  // Laporan states
  const [laporanBulan, setLaporanBulan] = useState(new Date().getMonth() + 1);
  const [laporanTahun, setLaporanTahun] = useState(new Date().getFullYear());
  const [isDownloadingLaporan, setIsDownloadingLaporan] = useState(false);

  // Pesan Masuk state
  const [pesanMasuk, setPesanMasuk] = useState([]);
  const [isLoadingPesan, setIsLoadingPesan] = useState(false);
  const [replyText, setReplyText] = useState({});
  const [activeReplyId, setActiveReplyId] = useState(null);

  const handleProfileFotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      alert('File harus berupa gambar (jpeg, png, jpg, gif).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran gambar maksimal adalah 5 MB.');
      return;
    }

    setProfileFotoFile(file);
    setProfileFotoPreview(URL.createObjectURL(file));
  };


  // Fetch category list
  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const response = await window.axios.get('/api/admin/kategori');
      if (response.data?.status === 'success') {
        setCategories(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const fetchPesanMasuk = async () => {
    setIsLoadingPesan(true);
    try {
      const response = await window.axios.get('/api/admin/pesan');
      if (response.data?.status === 'success') {
        setPesanMasuk(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching pesan masuk:', err);
    } finally {
      setIsLoadingPesan(false);
    }
  };

  const handleReplyPesan = async (id) => {
    if (!replyText[id] || !replyText[id].trim()) {
      alert('Balasan tidak boleh kosong!');
      return;
    }

    try {
      const response = await window.axios.patch(`/api/admin/pesan/${id}/reply`, {
        balasan_admin: replyText[id]
      });

      if (response.data?.status === 'success') {
        alert('Balasan berhasil dikirim!');
        setActiveReplyId(null);
        fetchPesanMasuk();
      }
    } catch (err) {
      console.error('Error replying pesan:', err);
      alert('Gagal mengirim balasan.');
    }
  };

  // Fetch facilities for a specific category ID
  const fetchFacilities = async (catId) => {
    setIsLoadingFacilities(true);
    setErrorMsg('');
    try {
      const response = await window.axios.get('/api/admin/fasilitas', {
        params: { id_kategori: catId }
      });
      if (response.data?.status === 'success') {
        setFacilities(response.data.data || []);
      } else {
        setErrorMsg('Gagal memuat data fasilitas layanan.');
      }
    } catch (err) {
      console.error('Error fetching facilities:', err);
      setErrorMsg('Terjadi kesalahan saat memuat data fasilitas layanan.');
    } finally {
      setIsLoadingFacilities(false);
    }
  };

  // Fetch order list for "Data Pemesanan" page
  const fetchOrders = async (searchVal = '', statusVal = '') => {
    setIsLoadingOrders(true);
    setErrorMsg('');
    try {
      const response = await window.axios.get(`/api/admin/pemesanan`, {
        params: {
          search: searchVal,
          status: statusVal
        }
      });
      if (response.data?.status === 'success') {
        setOrders(response.data.data);
      } else {
        setErrorMsg('Gagal memuat data pemesanan.');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setErrorMsg('Terjadi kesalahan saat memuat data pemesanan.');
    } finally {
      setIsLoadingOrders(false);
    }
  };

  // Trigger search
  const handleSearchOrders = () => {
    fetchOrders(orderSearch, orderStatusFilter);
  };

  // Fetch full details of a specific order
  const handleShowDetail = async (id) => {
    setErrorMsg('');
    try {
      const response = await window.axios.get(`/api/admin/pemesanan/${id}`);
      if (response.data?.status === 'success') {
        setSelectedOrder(response.data.data);
        setSelectedOrderStatus(response.data.data.status_pemesanan);
      } else {
        alert('Gagal mengambil rincian detail pemesanan.');
      }
    } catch (err) {
      console.error('Error fetching order detail:', err);
      alert('Terjadi kesalahan saat mengambil rincian detail pemesanan.');
    }
  };

  // Update order status inside the detail modal
  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setIsSubmittingStatus(true);
    setErrorMsg('');
    try {
      const response = await window.axios.patch(`/api/admin/pemesanan/${selectedOrder.id_pemesanan}/status`, {
        status_pemesanan: selectedOrderStatus
      });
      if (response.data?.status === 'success') {
        // Refresh the list
        fetchOrders(orderSearch, orderStatusFilter);

        // Update selected order view dynamically
        setSelectedOrder(prev => ({
          ...prev,
          status_pemesanan: selectedOrderStatus
        }));
        alert('Status pemesanan berhasil diperbarui!');
      } else {
        alert('Gagal memperbarui status.');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Terjadi kesalahan saat memperbarui status pemesanan.');
    } finally {
      setIsSubmittingStatus(false);
    }
  };

  // Trigger order list fetch when tab changes to 'data-pemesanan'
  useEffect(() => {
    if (activeTab === 'data-pemesanan') {
      fetchOrders(orderSearch, orderStatusFilter);
    }
  }, [activeTab]);

  // Fetch custom request list for "Custom Paket" page
  const fetchCustomRequests = async (searchVal = '', statusVal = '') => {
    setIsLoadingCustomRequests(true);
    setErrorMsg('');
    try {
      const response = await window.axios.get(`/api/admin/request-custom`, {
        params: {
          search: searchVal,
          status: statusVal
        }
      });
      if (response.data?.status === 'success') {
        setCustomRequests(response.data.data);
      } else {
        setErrorMsg('Gagal memuat data request custom.');
      }
    } catch (err) {
      console.error('Error fetching custom requests:', err);
      setErrorMsg('Terjadi kesalahan saat memuat data request custom.');
    } finally {
      setIsLoadingCustomRequests(false);
    }
  };

  // Trigger search for custom requests
  const handleSearchCustomRequests = () => {
    fetchCustomRequests(customSearch, customStatusFilter);
  };

  // Fetch full details of a specific custom request
  const handleShowCustomDetail = async (id) => {
    setErrorMsg('');
    try {
      const response = await window.axios.get(`/api/admin/request-custom/${id}`);
      if (response.data?.status === 'success') {
        const data = response.data.data;
        setSelectedCustomRequest(data);
        setSelectedCustomStatus(data.status_request);

        // Reset penawaran form
        setTotalPenawaran('');
        setDpAwal('');
        setCatatanAdmin('');
      } else {
        alert('Gagal mengambil rincian detail request custom.');
      }
    } catch (err) {
      console.error('Error fetching custom request detail:', err);
      alert('Terjadi kesalahan saat mengambil rincian detail request custom.');
    }
  };

  // Update custom request status inside the detail modal
  const handleUpdateCustomStatus = async (e) => {
    e.preventDefault();
    if (!selectedCustomRequest) return;

    setIsSubmittingCustomStatus(true);
    setErrorMsg('');
    try {
      const response = await window.axios.patch(`/api/admin/request-custom/${selectedCustomRequest.id_request}/status`, {
        status_request: selectedCustomStatus
      });
      if (response.data?.status === 'success') {
        // Refresh the list
        fetchCustomRequests(customSearch, customStatusFilter);

        // Update selected custom request view dynamically
        setSelectedCustomRequest(prev => ({
          ...prev,
          status_request: selectedCustomStatus
        }));
        alert('Status request custom berhasil diperbarui!');
      } else {
        alert('Gagal memperbarui status.');
      }
    } catch (err) {
      console.error('Error updating custom request status:', err);
      alert('Terjadi kesalahan saat memperbarui status request custom.');
    } finally {
      setIsSubmittingCustomStatus(false);
    }
  };

  // Submit Penawaran (Pricing Proposal) for custom requests
  const handleSubmitPenawaran = async (e) => {
    e.preventDefault();
    if (!selectedCustomRequest) return;

    if (!totalPenawaran || isNaN(totalPenawaran) || parseFloat(totalPenawaran) < 0) {
      alert('Harap masukkan total penawaran harga yang valid.');
      return;
    }

    setIsSubmittingPenawaran(true);
    setErrorMsg('');
    try {
      const response = await window.axios.post(`/api/admin/request-custom/${selectedCustomRequest.id_request}/penawaran`, {
        total_penawaran: parseFloat(totalPenawaran),
        dp_awal: dpAwal ? parseFloat(dpAwal) : 0,
        catatan_admin: catatanAdmin
      });
      if (response.data?.status === 'success') {
        alert('Penawaran harga berhasil dikirim!');
        // Refresh detail view to load the newly added penawaran
        handleShowCustomDetail(selectedCustomRequest.id_request);
        // Refresh list
        fetchCustomRequests(customSearch, customStatusFilter);
      } else {
        alert('Gagal mengirimkan penawaran harga.');
      }
    } catch (err) {
      console.error('Error submitting penawaran:', err);
      if (err.response?.data?.errors) {
        const validationErrs = Object.values(err.response.data.errors).flat().join('\n');
        alert(`Validasi gagal:\n${validationErrs}`);
      } else {
        alert('Terjadi kesalahan saat mengirimkan penawaran.');
      }
    } finally {
      setIsSubmittingPenawaran(false);
    }
  };

  // Fetch packages for a specific category ID
  const fetchPackages = async (catId) => {
    setIsLoadingPackages(true);
    setErrorMsg('');
    try {
      const response = await window.axios.get(`/api/admin/kategori/${catId}/paket`);
      if (response.data?.status === 'success') {
        setPackages(response.data.data.paket || []);
      } else {
        setErrorMsg('Gagal memuat data paket layanan.');
      }
    } catch (err) {
      console.error('Error fetching packages:', err);
      setErrorMsg('Terjadi kesalahan saat memuat data paket layanan.');
    } finally {
      setIsLoadingPackages(false);
    }
  };

  const handleOpenAddModal = () => {
    setSelectedPackage(null);
    setPackageName('');
    setPackagePrice('');
    setPackageDesc('');
    setPackageStatus('aktif');
    setPackageFoto(null);
    setPackageModalTab('info');
    setPackageFacilities([]);
    setSelectedPackageFasilitas([]);
    const fileInput = document.getElementById('package_foto');
    if (fileInput) fileInput.value = '';
    setShowPackageModal(true);
  };

  const handleOpenEditModal = (pkg) => {
    setSelectedPackage(pkg);
    setPackageName(pkg.nama_paket || '');
    setPackagePrice(pkg.harga || '');
    setPackageDesc(pkg.deskripsi || '');
    setPackageStatus(pkg.status_paket || 'aktif');
    setPackageFoto(null);
    setPackageModalTab('info');
    setPackageFacilities([]);
    setSelectedPackageFasilitas([]);
    const fileInput = document.getElementById('package_foto');
    if (fileInput) fileInput.value = '';
    setShowPackageModal(true);
  };

  /** Buka tab Fasilitas: fetch daftar fasilitas kategori + fasilitas yang sudah tersimpan di paket ini */
  const handleOpenPackageFacilitiesTab = async () => {
    setPackageModalTab('fasilitas');
    if (!selectedPackage) return;

    const catId = parseInt(activeTab.replace('kategori-', '')) || 1;
    setIsLoadingPackageFacilities(true);
    try {
      const [facilitiesRes, paketRes] = await Promise.all([
        window.axios.get(`/api/admin/fasilitas?id_kategori=${catId}`),
        window.axios.get(`/api/admin/kategori/${catId}/paket/${selectedPackage.id_paket}`),
      ]);
      if (facilitiesRes.data?.status === 'success') setPackageFacilities(facilitiesRes.data.data);
      if (paketRes.data?.status === 'success') {
        const existing = (paketRes.data.data.fasilitas || []).map(f => ({
          id_fasilitas: f.id_fasilitas,
          qty: f.qty || 1,
          keterangan: f.keterangan || '',
        }));
        setSelectedPackageFasilitas(existing);
      }
    } catch (err) {
      console.error('Error fetching package facilities:', err);
      alert('Gagal memuat data fasilitas paket.');
    } finally {
      setIsLoadingPackageFacilities(false);
    }
  };

  const handleTogglePackageFasilitas = (idFasilitas) => {
    setSelectedPackageFasilitas(prev => {
      const exists = prev.find(f => f.id_fasilitas === idFasilitas);
      if (exists) return prev.filter(f => f.id_fasilitas !== idFasilitas);
      return [...prev, { id_fasilitas: idFasilitas, qty: 1, keterangan: '' }];
    });
  };

  const handlePackageFasilitasFieldChange = (idFasilitas, field, value) => {
    setSelectedPackageFasilitas(prev => prev.map(f => f.id_fasilitas === idFasilitas ? { ...f, [field]: value } : f));
  };

  const handleSaveFasilitasPaket = async () => {
    if (!selectedPackage) return;
    const catId = parseInt(activeTab.replace('kategori-', '')) || 1;
    setIsSubmittingPackageFacilities(true);
    try {
      const payload = {
        fasilitas: selectedPackageFasilitas.map(f => ({
          id_fasilitas: f.id_fasilitas,
          qty: parseInt(f.qty) || 1,
          keterangan: f.keterangan || null,
        })),
      };
      const response = await window.axios.post(`/api/admin/kategori/${catId}/paket/${selectedPackage.id_paket}/fasilitas`, payload);
      if (response.data?.status === 'success') {
        alert('Fasilitas paket berhasil disimpan!');
        fetchPackages(catId);
      } else {
        alert(response.data?.message || 'Gagal menyimpan fasilitas paket.');
      }
    } catch (err) {
      console.error('Error saving package facilities:', err);
      if (err.response?.data?.errors) {
        const validationErrs = Object.values(err.response.data.errors).flat().join('\n');
        alert(`Validasi gagal:\n${validationErrs}`);
      } else {
        alert('Terjadi kesalahan saat menyimpan fasilitas paket.');
      }
    } finally {
      setIsSubmittingPackageFacilities(false);
    }
  };

  const handleSavePackage = async (e) => {
    e.preventDefault();
    if (!packageName.trim() || !packagePrice) {
      alert('Nama paket dan harga wajib diisi.');
      return;
    }

    const catId = parseInt(activeTab.replace('kategori-', '')) || 1;
    setIsSubmittingPackage(true);
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('nama_paket', packageName);
      formData.append('harga', packagePrice);
      formData.append('deskripsi', packageDesc || '');
      formData.append('status_paket', packageStatus);
      if (packageFoto) {
        formData.append('foto', packageFoto);
      }

      let response;
      if (selectedPackage) {
        // Edit mode. Use POST with _method=PUT to bypass PHP's multipart limits
        formData.append('_method', 'PUT');
        response = await window.axios.post(
          `/api/admin/kategori/${catId}/paket/${selectedPackage.id_paket}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      } else {
        // Add mode
        response = await window.axios.post(
          `/api/admin/kategori/${catId}/paket`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      }

      if (response.data?.status === 'success') {
        alert(selectedPackage ? 'Paket layanan berhasil diperbarui!' : 'Paket layanan berhasil ditambahkan!');
        setShowPackageModal(false);
        fetchPackages(catId);
      } else {
        alert(response.data?.message || 'Gagal menyimpan paket.');
      }
    } catch (err) {
      console.error('Error saving package:', err);
      if (err.response?.data?.errors) {
        const validationErrs = Object.values(err.response.data.errors).flat().join('\n');
        alert(`Validasi gagal:\n${validationErrs}`);
      } else {
        alert('Terjadi kesalahan saat menyimpan paket.');
      }
    } finally {
      setIsSubmittingPackage(false);
    }
  };

  const handleDeletePackage = async (pkgId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus paket layanan ini?')) {
      return;
    }

    const catId = parseInt(activeTab.replace('kategori-', '')) || 1;
    setErrorMsg('');

    try {
      const response = await window.axios.delete(`/api/admin/kategori/${catId}/paket/${pkgId}`);
      if (response.data?.status === 'success') {
        alert('Paket layanan berhasil dihapus!');
        fetchPackages(catId);
      } else {
        alert(response.data?.message || 'Gagal menghapus paket.');
      }
    } catch (err) {
      console.error('Error deleting package:', err);
      if (err.response?.status === 409) {
        alert('Paket tidak bisa dihapus karena sudah memiliki data pemesanan.');
      } else {
        alert('Terjadi kesalahan saat menghapus paket.');
      }
    }
  };

  const handleOpenAddCategory = () => {
    setSelectedCategory(null);
    setCategoryName('');
    setCategoryDesc('');
    setShowCategoryModal(true);
  };

  const handleOpenEditCategory = (cat) => {
    setSelectedCategory(cat);
    setCategoryName(cat.nama_kategori || '');
    setCategoryDesc(cat.deskripsi || '');
    setShowCategoryModal(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      alert('Nama kategori wajib diisi.');
      return;
    }

    setIsSubmittingCategory(true);
    setErrorMsg('');

    try {
      let response;
      if (selectedCategory) {
        // Edit mode
        response = await window.axios.put(`/api/admin/kategori/${selectedCategory.id_kategori}`, {
          nama_kategori: categoryName,
          deskripsi: categoryDesc,
        });
      } else {
        // Add mode
        response = await window.axios.post('/api/admin/kategori', {
          nama_kategori: categoryName,
          deskripsi: categoryDesc,
        });
      }

      if (response.data?.status === 'success') {
        alert(selectedCategory ? 'Kategori berhasil diperbarui!' : 'Kategori berhasil ditambahkan!');
        setShowCategoryModal(false);
        fetchCategories();
      } else {
        alert(response.data?.message || 'Gagal menyimpan kategori.');
      }
    } catch (err) {
      console.error('Error saving category:', err);
      if (err.response?.data?.errors) {
        const validationErrs = Object.values(err.response.data.errors).flat().join('\n');
        alert(`Validasi gagal:\n${validationErrs}`);
      } else {
        alert(err.response?.data?.message || 'Terjadi kesalahan saat menyimpan kategori.');
      }
    } finally {
      setIsSubmittingCategory(false);
    }
  };

  const handleDeleteCategory = async (catId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus kategori ini?')) {
      return;
    }

    setErrorMsg('');

    try {
      const response = await window.axios.delete(`/api/admin/kategori/${catId}`);
      if (response.data?.status === 'success') {
        alert('Kategori berhasil dihapus!');
        fetchCategories();
      } else {
        alert(response.data?.message || 'Gagal menghapus kategori.');
      }
    } catch (err) {
      console.error('Error deleting category:', err);
      if (err.response?.status === 409) {
        alert('Kategori tidak bisa dihapus karena masih memiliki paket layanan.');
      } else {
        alert('Terjadi kesalahan saat menghapus kategori.');
      }
    }
  };

  // Facility (Fasilitas) CRUD handlers
  const handleOpenAddFacility = () => {
    setSelectedFacility(null);
    setFacilityName('');
    setFacilityDesc('');
    setShowFacilityModal(true);
  };

  const handleOpenEditFacility = (facility) => {
    setSelectedFacility(facility);
    setFacilityName(facility.nama_fasilitas || '');
    setFacilityDesc(facility.deskripsi || '');
    setShowFacilityModal(true);
  };

  const handleSaveFacility = async (e) => {
    e.preventDefault();
    if (!facilityName.trim()) {
      alert('Nama fasilitas wajib diisi.');
      return;
    }

    const catId = parseInt(activeTab.replace('fasilitas-', '')) || 1;
    setIsSubmittingFacility(true);
    setErrorMsg('');

    try {
      let response;
      if (selectedFacility) {
        // Edit mode
        response = await window.axios.put(`/api/admin/fasilitas/${selectedFacility.id_fasilitas}`, {
          nama_fasilitas: facilityName,
          deskripsi: facilityDesc,
          id_kategori: catId
        });
      } else {
        // Add mode
        response = await window.axios.post('/api/admin/fasilitas', {
          nama_fasilitas: facilityName,
          deskripsi: facilityDesc,
          id_kategori: catId
        });
      }

      if (response.data?.status === 'success') {
        alert(selectedFacility ? 'Fasilitas berhasil diperbarui!' : 'Fasilitas berhasil ditambahkan!');
        setShowFacilityModal(false);
        fetchFacilities(catId);
      } else {
        alert(response.data?.message || 'Gagal menyimpan fasilitas.');
      }
    } catch (err) {
      console.error('Error saving facility:', err);
      if (err.response?.data?.errors) {
        const validationErrs = Object.values(err.response.data.errors).flat().join('\n');
        alert(`Validasi gagal:\n${validationErrs}`);
      } else {
        alert(err.response?.data?.message || 'Terjadi kesalahan saat menyimpan fasilitas.');
      }
    } finally {
      setIsSubmittingFacility(false);
    }
  };

  const handleDeleteFacility = async (facId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus fasilitas ini?')) {
      return;
    }

    const catId = parseInt(activeTab.replace('fasilitas-', '')) || 1;
    setErrorMsg('');

    try {
      const response = await window.axios.delete(`/api/admin/fasilitas/${facId}`);
      if (response.data?.status === 'success') {
        alert('Fasilitas berhasil dihapus!');
        fetchFacilities(catId);
      } else {
        alert(response.data?.message || 'Gagal menghapus fasilitas.');
      }
    } catch (err) {
      console.error('Error deleting facility:', err);
      if (err.response?.status === 409) {
        alert('Fasilitas tidak bisa dihapus karena sedang digunakan oleh paket atau request custom.');
      } else {
        alert('Terjadi kesalahan saat menghapus fasilitas.');
      }
    }
  };

  // Fetch gallery list
  const fetchGallery = async () => {
    setIsLoadingGallery(true);
    setErrorMsg('');
    try {
      const response = await window.axios.get('/api/admin/galeri');
      if (response.data?.status === 'success') {
        setGalleryItems(response.data.data || []);
      } else {
        setErrorMsg('Gagal memuat data galeri event.');
      }
    } catch (err) {
      console.error('Error fetching gallery:', err);
      setErrorMsg('Terjadi kesalahan saat memuat data galeri event.');
    } finally {
      setIsLoadingGallery(false);
    }
  };

  const handleOpenAddGallery = () => {
    setSelectedGallery(null);
    setGalleryTitle('');
    setGalleryDesc('');
    setGalleryOrder('');
    setGalleryFoto(null);
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setGalleryTanggal(`${yyyy}-${mm}-${dd}`);
    const fileInput = document.getElementById('gallery_foto');
    if (fileInput) fileInput.value = '';
    setShowGalleryModal(true);
  };

  const handleOpenEditGallery = (item) => {
    setSelectedGallery(item);
    setGalleryTitle(item.judul || '');
    setGalleryDesc(item.deskripsi || '');
    setGalleryOrder(item.urutan || '');
    setGalleryFoto(null);
    const itemDate = item.tanggal || (item.created_at ? item.created_at.split('T')[0] : '');
    setGalleryTanggal(itemDate);
    const fileInput = document.getElementById('gallery_foto');
    if (fileInput) fileInput.value = '';
    setShowGalleryModal(true);
  };

  const handleSaveGallery = async (e) => {
    e.preventDefault();
    if (!galleryTitle.trim()) {
      alert('Judul galeri wajib diisi.');
      return;
    }

    setIsSubmittingGallery(true);
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('judul', galleryTitle);
      formData.append('deskripsi', galleryDesc || '');
      formData.append('urutan', galleryOrder || '0');
      formData.append('tanggal', galleryTanggal || '');
      if (galleryFoto) {
        formData.append('foto', galleryFoto);
      }

      let response;
      if (selectedGallery) {
        // Edit mode. Use POST with _method=PUT to bypass PHP's multipart limits
        formData.append('_method', 'PUT');
        response = await window.axios.post(
          `/api/admin/galeri/${selectedGallery.id_galeri}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      } else {
        // Add mode
        response = await window.axios.post(
          '/api/admin/galeri',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      }

      if (response.data?.status === 'success') {
        alert(selectedGallery ? 'Item galeri berhasil diperbarui!' : 'Item galeri berhasil ditambahkan!');
        setShowGalleryModal(false);
        fetchGallery();
      } else {
        alert(response.data?.message || 'Gagal menyimpan galeri.');
      }
    } catch (err) {
      console.error('Error saving gallery:', err);
      if (err.response?.data?.errors) {
        const validationErrs = Object.values(err.response.data.errors).flat().join('\n');
        alert(`Validasi gagal:\n${validationErrs}`);
      } else {
        alert('Terjadi kesalahan saat menyimpan galeri.');
      }
    } finally {
      setIsSubmittingGallery(false);
    }
  };

  const handleDeleteGallery = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus item galeri ini?')) {
      return;
    }

    setErrorMsg('');

    try {
      const response = await window.axios.delete(`/api/admin/galeri/${id}`);
      if (response.data?.status === 'success') {
        alert('Item galeri berhasil dihapus!');
        fetchGallery();
      } else {
        alert(response.data?.message || 'Gagal menghapus galeri.');
      }
    } catch (err) {
      console.error('Error deleting gallery:', err);
      alert('Terjadi kesalahan saat menghapus galeri.');
    }
  };

  // Fetch admin profile
  const fetchProfile = async () => {
    setProfileSuccessMsg('');
    setProfileErrorMsg('');
    try {
      const response = await window.axios.get('/api/me');
      if (response.data?.status === 'success') {
        const data = response.data.data;
        setProfileNama(data.nama || '');
        setProfileEmail(data.email || '');
        setProfileNoHp(data.no_hp || '');
        setProfileFotoFile(null);
        setProfileFotoPreview(null);
        setUser(data);
        localStorage.setItem('auth_user', JSON.stringify(data));
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setProfileErrorMsg('Gagal memuat detail profil.');
    }
  };

  // Update admin profile details
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!profileNama.trim() || !profileEmail.trim() || !profileNoHp.trim()) {
      setProfileErrorMsg('Nama, Email, dan No. HP wajib diisi.');
      return;
    }

    if (profilePassword && profilePassword !== profilePasswordConfirm) {
      setProfileErrorMsg('Konfirmasi password tidak cocok.');
      return;
    }

    setIsSavingProfile(true);
    setProfileSuccessMsg('');
    setProfileErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('nama', profileNama);
      formData.append('email', profileEmail);
      formData.append('no_hp', profileNoHp);

      if (profilePassword) {
        formData.append('password', profilePassword);
        formData.append('password_confirmation', profilePasswordConfirm);
      }

      if (profileFotoFile) {
        formData.append('foto', profileFotoFile);
      }

      const response = await window.axios.post('/api/admin/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data?.status === 'success') {
        const updatedUser = response.data.data;
        setUser(updatedUser);
        localStorage.setItem('auth_user', JSON.stringify(updatedUser));
        setProfileSuccessMsg('Profil berhasil diperbarui!');
        setProfilePassword('');
        setProfilePasswordConfirm('');
        setProfileFotoFile(null);
        setProfileFotoPreview(null);
      } else {
        setProfileErrorMsg(response.data?.message || 'Gagal memperbarui profil.');
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      if (err.response?.data?.errors) {
        const validationErrs = Object.values(err.response.data.errors).flat().join(' ');
        setProfileErrorMsg(validationErrs);
      } else {
        setProfileErrorMsg(err.response?.data?.message || 'Terjadi kesalahan saat memperbarui profil.');
      }
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Trigger facilities list fetch when tab starts with 'fasilitas-'
  useEffect(() => {
    if (activeTab.startsWith('fasilitas-')) {
      const catId = parseInt(activeTab.replace('fasilitas-', '')) || 1;
      fetchFacilities(catId);
    }
  }, [activeTab]);

  // Trigger package list fetch when tab starts with 'kategori-'
  useEffect(() => {
    if (activeTab.startsWith('kategori-')) {
      const catId = parseInt(activeTab.replace('kategori-', '')) || 1;
      fetchPackages(catId);
    }
  }, [activeTab]);

  // Trigger custom request list fetch when tab changes to 'custom-paket'
  useEffect(() => {
    if (activeTab === 'custom-paket') {
      fetchCustomRequests(customSearch, customStatusFilter);
    }
  }, [activeTab]);

  // Trigger gallery list fetch when tab changes to 'galeri-event'
  useEffect(() => {
    if (activeTab === 'galeri-event') {
      fetchGallery();
    }
  }, [activeTab]);

  // Trigger profile fetch when tab changes to 'profil-admin'
  useEffect(() => {
    if (activeTab === 'profil-admin') {
      fetchProfile();
    }
  }, [activeTab]);

  // Trigger pesan masuk fetch when tab changes to 'pesan-masuk'
  useEffect(() => {
    if (activeTab === 'pesan-masuk') {
      fetchPesanMasuk();
    }
  }, [activeTab]);


  // Map custom request status values into UI labels & classes
  const getCustomRequestStatusDetails = (status, id) => {
    switch (status) {
      case 'menunggu':
        return { text: 'Menunggu Review', className: 'status-menunggu-verifikasi' };
      case 'diproses':
        return { text: 'Diproses', className: 'status-diproses' };
      case 'ditawarkan':
        return { text: 'Menunggu Penawaran', className: 'status-menunggu-konfirmasi' };
      case 'diterima':
        return { text: 'Siap Ditinjau', className: 'status-selesai-dicek' };
      case 'ditolak':
        return { text: 'Ditolak', className: 'status-dibatalkan' };
      case 'selesai':
        return { text: 'Selesai', className: 'status-selesai-dicek' };
      default:
        return { text: status, className: '' };
    }
  };

  const formatRupiah = (number) => {
    if (number === null || number === undefined) return '-';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number);
  };

  // Authenticate and load dashboard metrics on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('auth_user');

    if (!token) {
      window.location.href = '/login';
      return;
    }

    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Set auth header globally for Axios
    window.axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    const fetchDashboardData = async () => {
      try {
        const response = await window.axios.get('/api/admin/dashboard');
        if (response.data?.status === 'success') {
          const { counts, recent_pemesanan } = response.data.data;
          setMetrics(counts);
          setRecentOrders(recent_pemesanan);
        }
      } catch (err) {
        console.error('Failed to load dashboard statistics:', err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          // Token expired or invalid, clear and redirect to login
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          window.location.href = '/login';
        } else {
          setErrorMsg('Gagal memuat data dari server. Silakan muat ulang halaman.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
    fetchCategories();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        await window.axios.post('/api/logout');
      } catch (err) {
        console.error('Logout error on server:', err);
      }
    }
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    window.location.href = '/login';
  };

  // Convert Y-m-d date into Indonesian format
  const formatIndoDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      const day = String(date.getDate()).padStart(2, '0');
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      return `${day} ${month} ${year}`;
    } catch (e) {
      return dateStr;
    }
  };

  // Map order database status into UI labels & classes
  const getStatusDetails = (status, code) => {
    // Default mapping for other orders
    switch (status) {
      case 'menunggu':
        return { text: 'Menunggu Verifikasi', className: 'status-menunggu-verifikasi' };
      case 'dikonfirmasi':
        return { text: 'Dikonfirmasi', className: 'status-diproses' };
      case 'dibatalkan':
        return { text: 'Dibatalkan', className: 'status-dibatalkan' };
      case 'selesai':
        return { text: 'Selesai', className: 'status-selesai-dicek' };
      default:
        return { text: status, className: '' };
    }
  };

  // Get active menu label for breadcrumbs / titles
  const getTabLabel = (tabId) => {
    if (tabId.startsWith('kategori-') && tabId !== 'kategori-crud') {
      const catId = parseInt(tabId.replace('kategori-', ''));
      const cat = categories.find(c => c.id_kategori === catId);
      return cat ? `Paket Event — ${cat.nama_kategori}` : 'Paket Event';
    }
    if (tabId.startsWith('fasilitas-') && tabId !== 'fasilitas-layanan') {
      const catId = parseInt(tabId.replace('fasilitas-', ''));
      const cat = categories.find(c => c.id_kategori === catId);
      return cat ? `Fasilitas Layanan — ${cat.nama_kategori}` : 'Fasilitas Layanan';
    }
    const mapping = {
      'dashboard': 'Dashboard',
      'data-pemesanan': 'Data Pemesanan',
      'custom-paket': 'Custom Paket',
      'kategori-crud': 'Kategori Event',
      'kategori-event': 'Paket Event',
      'galeri-event': 'Galeri Event',
      'profil-admin': 'Profil Admin',
      'pesan-masuk': 'Pesan Masuk',
      'laporan': 'Laporan Keuangan',
      'wedding-event': 'Fasilitas Layanan — Wedding Event',
      'outbound': 'Fasilitas Layanan — Outbound',
      'launching-product': 'Fasilitas Layanan — Launching Product',
      'study-field': 'Fasilitas Layanan — Study Field',
      'birthday-party': 'Fasilitas Layanan — Birthday Party',
      'gathering': 'Fasilitas Layanan — Gathering',
    };
    return mapping[tabId] || tabId;
  };

  const renderPesanMasuk = () => (
    <>
      <div className="zy-breadcrumb">
        <div className="zy-breadcrumb-item">
          <a onClick={() => setActiveTab('dashboard')}>Dashboard</a>
        </div>
        <div className="zy-breadcrumb-item">/</div>
        <div className="zy-breadcrumb-item active">Pesan Masuk</div>
      </div>

      <header className="zy-dashboard-header">
        <h1>Pesan Masuk dari Pelanggan</h1>
        <p>Lihat dan balas pesan serta pertanyaan yang dikirim melalui form kontak.</p>
      </header>

      <section className="zy-section-card">
        {isLoadingPesan ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Memuat pesan...</div>
        ) : pesanMasuk.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            Belum ada pesan masuk.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {pesanMasuk.map(item => (
              <div key={item.id} style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '1.5rem', backgroundColor: 'var(--surface)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h4 style={{ margin: '0 0 0.5rem 0' }}>{item.nama_lengkap}</h4>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Kontak: {item.kontak}</p>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{new Date(item.created_at).toLocaleString('id-ID')}</p>
                  </div>
                  <span style={{ padding: '0.25rem 0.75rem', borderRadius: '50px', fontSize: '0.85rem', fontWeight: '500', backgroundColor: item.status === 'dibalas' ? '#EBFBEE' : '#FFF4E6', color: item.status === 'dibalas' ? '#2B8A3E' : '#E67700' }}>
                    {item.status === 'dibalas' ? 'Telah Dibalas' : 'Menunggu Balasan'}
                  </span>
                </div>

                <div style={{ padding: '1rem', backgroundColor: 'var(--bg-page)', borderRadius: '8px', marginBottom: '1rem' }}>
                  <p style={{ margin: 0 }}><strong>Pesan:</strong><br/>{item.pesan}</p>
                </div>

                {item.status === 'dibalas' ? (
                  <div style={{ padding: '1rem', backgroundColor: '#F8F9FA', borderRadius: '8px', borderLeft: '4px solid #4DABF7' }}>
                    <p style={{ margin: 0 }}><strong>Balasan Anda:</strong><br/>{item.balasan_admin}</p>
                  </div>
                ) : (
                  <>
                    {activeReplyId === item.id ? (
                      <div style={{ marginTop: '1rem' }}>
                        <textarea
                          className="zy-form-input"
                          style={{ minHeight: '100px', width: '100%', marginBottom: '1rem' }}
                          placeholder="Ketik balasan Anda di sini..."
                          value={replyText[item.id] || ''}
                          onChange={(e) => setReplyText({...replyText, [item.id]: e.target.value})}
                        ></textarea>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                          <button className="zy-btn-submit" onClick={() => handleReplyPesan(item.id)}>Kirim Balasan</button>
                          <button className="zy-btn-close" onClick={() => setActiveReplyId(null)}>Batal</button>
                        </div>
                      </div>
                    ) : (
                      <button className="zy-btn-submit" onClick={() => setActiveReplyId(item.id)}>Balas Pesan</button>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );

  const renderLaporan = () => (
    <>
      {/* Breadcrumbs */}
      <div className="zy-breadcrumb">
        <div className="zy-breadcrumb-item">
          <a onClick={() => setActiveTab('dashboard')}>Dashboard</a>
        </div>
        <div className="zy-breadcrumb-item">/</div>
        <div className="zy-breadcrumb-item active">Laporan Keuangan</div>
      </div>

      {/* Header Banner */}
      <header className="zy-dashboard-header">
        <h1>Laporan Keuangan & Pesanan</h1>
        <p>Cetak laporan bulanan format PDF atau Excel untuk rekapan pendapatan pemesanan Lunas.</p>
      </header>

      <div style={{ maxWidth: '800px', margin: '2rem auto' }}>
        {/* Filter Card */}
        <div className="zy-section-card fade-in" style={{ marginBottom: '1.5rem' }}>
          <h2 className="zy-section-card-title" style={{ marginBottom: '1.5rem' }}>Pilih Periode Laporan</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="zy-form-group">
              <label className="zy-form-label">Bulan</label>
              <select
                className="zy-form-select"
                value={laporanBulan}
                onChange={e => setLaporanBulan(e.target.value)}
              >
                {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('id-ID', { month: 'long' })}</option>
                ))}
              </select>
            </div>
            <div className="zy-form-group">
              <label className="zy-form-label">Tahun</label>
              <input
                type="number"
                className="zy-filter-input"
                value={laporanTahun}
                onChange={e => setLaporanTahun(e.target.value)}
                min="2020" max="2100"
              />
            </div>
          </div>
        </div>

        {/* 2 Cards Grid for Download Options */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

          {/* Card PDF */}
          <div className="zy-section-card fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '2rem' }}>
            <div style={{ background: 'rgba(220, 53, 69, 0.1)', color: '#dc3545', padding: '16px', borderRadius: '50%', marginBottom: '1rem' }}>
              <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" strokeWidth="2" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            </div>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.2rem', color: 'var(--text-main)' }}>Dokumen PDF</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', flex: 1 }}>Format rapi yang cocok untuk dicetak langsung atau dijadikan dokumen arsip.</p>
            <button
              style={{
                width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
                backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '12px 24px',
                borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '1rem',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 6px rgba(220, 53, 69, 0.2)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#bb2d3b';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#dc3545';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              onClick={() => {
                window.axios.get(`/api/admin/laporan?bulan=${laporanBulan}&tahun=${laporanTahun}&format=pdf`, { responseType: 'blob' })
                  .then(res => {
                    const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', `Laporan_Keuangan_ZY_Production_${laporanBulan}_${laporanTahun}.pdf`);
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                  })
                  .catch(err => {
                    alert('Gagal mengunduh laporan PDF.');
                    console.error(err);
                  });
              }}
            >
              Unduh PDF
            </button>
          </div>

          {/* Card Excel */}
          <div className="zy-section-card fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '2rem' }}>
            <div style={{ background: 'rgba(33,115,70,0.1)', color: '#217346', padding: '16px', borderRadius: '50%', marginBottom: '1rem' }}>
              <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" strokeWidth="2" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="8" y1="13" x2="16" y2="13"></line><line x1="8" y1="17" x2="16" y2="17"></line><line x1="8" y1="9" x2="16" y2="9"></line><line x1="12" y1="13" x2="12" y2="17"></line></svg>
            </div>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.2rem', color: 'var(--text-main)' }}>Spreadsheet Excel</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', flex: 1 }}>Format XLSX asli yang langsung siap untuk diolah menggunakan Microsoft Excel.</p>
            <button
              style={{
                width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
                backgroundColor: '#217346', color: 'white', border: 'none', padding: '12px 24px',
                borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '1rem',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 6px rgba(33, 115, 70, 0.2)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#1e683f';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#217346';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              onClick={() => {
                window.axios.get(`/api/admin/laporan?bulan=${laporanBulan}&tahun=${laporanTahun}&format=excel`, { responseType: 'blob' })
                  .then(res => {
                    const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', `Laporan_Keuangan_ZY_Production_${laporanBulan}_${laporanTahun}.xlsx`);
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                  })
                  .catch(err => {
                    alert('Gagal mengunduh laporan Excel.');
                    console.error(err);
                  });
              }}
            >
              Unduh Excel
            </button>
          </div>

        </div>
      </div>
    </>
  );

  return (
    <div className="zy-admin-layout">
      {/* Sidebar with callbacks wired up */}
      <Sidebar
        activeItem={activeTab}
        defaultActive="dashboard"
        onSelect={(tab) => setActiveTab(tab)}
        onLogout={handleLogout}
        categories={categories}
        user={user}
      />

      <main className="zy-admin-main">
        {errorMsg && (
          <div style={{ backgroundColor: '#FFF0F0', color: '#C92A2A', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #FFC9C9' }}>
            {errorMsg}
          </div>
        )}

        {/* Dynamic view rendering */}
        {activeTab === 'pesan-masuk' ? renderPesanMasuk() : activeTab === 'laporan' ? renderLaporan() : activeTab === 'dashboard' ? (
          /* DASHBOARD VIEW */
          <>
            {/* Header Banner */}
            <header className="zy-dashboard-header">
              <h1>Dashboard</h1>
              <p>Halaman utama admin untuk melihat ringkasan data sistem dan daftar pemesanan terbaru.</p>
            </header>

            {/* Metrics cards */}
            <section className="zy-stats-grid" aria-label="Ringkasan Statistik">
              {isLoading ? (
                // Skeleton loading cards
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="zy-stats-card skeleton-card">
                    <div className="zy-skeleton-line skeleton-title" />
                    <div className="zy-skeleton-line skeleton-row" />
                  </div>
                ))
              ) : (
                <>
                  <div className="zy-stats-card">
                    <span className="zy-stats-card-tag">Jumlah Kategori</span>
                    <div className="zy-stats-card-val">{metrics.kategori}</div>
                    <p className="zy-stats-card-desc">Kategori event yang tersedia pada sistem.</p>
                  </div>

                  <div className="zy-stats-card">
                    <span className="zy-stats-card-tag">Jumlah Paket</span>
                    <div className="zy-stats-card-val">{metrics.paket}</div>
                    <p className="zy-stats-card-desc">Total paket layanan yang aktif digunakan.</p>
                  </div>

                  <div className="zy-stats-card">
                    <span className="zy-stats-card-tag">Jumlah Pemesanan</span>
                    <div className="zy-stats-card-val">{metrics.pemesanan}</div>
                    <p className="zy-stats-card-desc">Total data pemesanan yang tercatat.</p>
                  </div>

                  <div className="zy-stats-card">
                    <span className="zy-stats-card-tag">Request Custom</span>
                    <div className="zy-stats-card-val">{metrics.request_custom}</div>
                    <p className="zy-stats-card-desc">Permintaan custom paket yang perlu ditinjau.</p>
                  </div>
                </>
              )}
            </section>

            {/* Recent Orders Table */}
            <section className="zy-section-card" aria-label="Tabel Pemesanan Terbaru">
              <h2 className="zy-section-card-title">Pemesanan Terbaru</h2>
              <p className="zy-section-card-desc">Tabel ringkasan berikut menampilkan beberapa data pemesanan terbaru yang masuk ke sistem.</p>

              {isLoading ? (
                // Table skeleton
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div className="zy-skeleton-line skeleton-row" />
                  <div className="zy-skeleton-line skeleton-row" />
                  <div className="zy-skeleton-line skeleton-row" />
                </div>
              ) : recentOrders.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Belum ada data pemesanan yang masuk.</p>
              ) : (
                <div className="zy-table-wrapper">
                  <table className="zy-table">
                    <thead>
                      <tr>
                        <th>Kode Pemesanan</th>
                        <th>Nama Pemesan</th>
                        <th>Paket</th>
                        <th>Tanggal Acara</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((item) => {
                        const statusObj = item.is_custom
                          ? getCustomRequestStatusDetails(item.status, item.id)
                          : getStatusDetails(item.status, item.kode);
                        const rowKey = item.is_custom ? `custom-${item.id}` : `standard-${item.id}`;
                        return (
                          <tr key={rowKey}>
                            <td style={{ fontWeight: 'bold' }}>{item.kode}</td>
                            <td>{item.nama_pemesan}</td>
                            <td>{item.paket}</td>
                            <td>{formatIndoDate(item.tanggal_acara)}</td>
                            <td>
                              <span className={`zy-status-badge ${statusObj.className}`}>
                                {statusObj.text}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        ) : activeTab === 'data-pemesanan' ? (
          /* DATA PEMESANAN VIEW */
          <>
            {/* Breadcrumb */}
            <div className="zy-breadcrumb">
              <div className="zy-breadcrumb-item">
                <a onClick={() => setActiveTab('dashboard')}>Dashboard</a>
              </div>
              <div className="zy-breadcrumb-item">/</div>
              <div className="zy-breadcrumb-item active">Data Pemesanan</div>
            </div>

            {/* Header Banner */}
            <header className="zy-dashboard-header">
              <h1>Data Pemesanan</h1>
              <p>Kelola semua pesanan layanan dari client ZY Production, verifikasi status, dan pantau rincian detail event.</p>
            </header>

            {/* Search/Filter Panel */}
            <div className="zy-search-filter-panel">
              <div className="zy-search-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  className="zy-filter-input"
                  placeholder="Cari kode pemesanan, nama client, atau nama paket..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSearchOrders(); }}
                />
              </div>
              <div className="zy-status-filter-wrapper" style={{ minWidth: '180px' }}>
                <select
                  className="zy-form-select"
                  style={{ padding: '0.72rem 1rem', height: '43px', borderRadius: '8px', border: '1px solid var(--neutral-light)', backgroundColor: 'var(--bg-page)', fontSize: '0.95rem' }}
                  value={orderStatusFilter}
                  onChange={(e) => {
                    setOrderStatusFilter(e.target.value);
                    fetchOrders(orderSearch, e.target.value);
                  }}
                >
                  <option value="">Semua Status</option>
                  <option value="menunggu">Menunggu Verifikasi</option>
                  <option value="dikonfirmasi">Dikonfirmasi</option>
                  <option value="dibatalkan">Dibatalkan</option>
                  <option value="selesai">Selesai</option>
                </select>
              </div>
              <button className="zy-filter-btn" onClick={handleSearchOrders}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filter
              </button>
            </div>

            {/* Main Table Card */}
            <section className="zy-section-card" aria-label="Tabel Data Pemesanan">
              <h2 className="zy-section-card-title">Daftar Pemesanan</h2>
              <p className="zy-section-card-desc">Berikut adalah daftar lengkap pemesanan client yang tersimpan di sistem ZY Production.</p>

              {isLoadingOrders ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div className="zy-skeleton-line skeleton-row" />
                  <div className="zy-skeleton-line skeleton-row" />
                  <div className="zy-skeleton-line skeleton-row" />
                  <div className="zy-skeleton-line skeleton-row" />
                </div>
              ) : orders.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                  Tidak ditemukan data pemesanan yang cocok dengan kriteria pencarian Anda.
                </p>
              ) : (
                <div className="zy-table-wrapper">
                  <table className="zy-table">
                    <thead>
                      <tr>
                        <th>Kode Pemesanan</th>
                        <th>Nama Pemesan</th>
                        <th>Paket</th>
                        <th>Tanggal Acara</th>
                        <th>Status Pemesanan</th>
                        <th>Status Pembayaran</th>
                        <th>Status MOU</th>
                        <th style={{ textAlign: 'center' }}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => {
                        const statusObj = getStatusDetails(order.status_pemesanan, order.kode_pemesanan);
                        return (
                          <tr key={order.id_pemesanan}>
                            <td style={{ fontWeight: 'bold' }}>{order.kode_pemesanan}</td>
                            <td>{order.nama_pemesan}</td>
                            <td>{order.paket}</td>
                            <td>{formatIndoDate(order.tanggal_acara)}</td>
                            <td>
                              <span className={`zy-status-badge ${statusObj.className}`}>
                                {statusObj.text}
                              </span>
                            </td>
                            <td>
                              {order.payment_status === 'paid' ? (
                                <span className="zy-status-badge status-diproses">Lunas</span>
                              ) : (
                                <span className="zy-status-badge status-menunggu-verifikasi">Belum Lunas</span>
                              )}
                            </td>
                            <td>
                              <span className={`zy-status-badge ${MOU_STATUS_BADGE[order.status_mou] || 'status-selesai-dicek'}`}>
                                {MOU_STATUS_LABEL[order.status_mou] || 'Belum Ada'}
                              </span>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <button
                                className="zy-btn-detail"
                                onClick={() => handleShowDetail(order.id_pemesanan)}
                              >
                                Detail
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        ) : activeTab === 'custom-paket' ? (
          /* CUSTOM PAKET VIEW */
          <>
            {/* Breadcrumb */}
            <div className="zy-breadcrumb">
              <div className="zy-breadcrumb-item">
                <a onClick={() => setActiveTab('dashboard')}>Dashboard</a>
              </div>
              <div className="zy-breadcrumb-item">/</div>
              <div className="zy-breadcrumb-item active">Custom Paket</div>
            </div>

            {/* Header Banner */}
            <header className="zy-dashboard-header">
              <h1>Custom Paket</h1>
              <p>Kelola semua request custom paket dari client ZY Production, verifikasi status, dan pantau penawaran harga.</p>
            </header>

            {/* Search/Filter Panel */}
            <div className="zy-search-filter-panel">
              <div className="zy-search-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  className="zy-filter-input"
                  placeholder="Cari kode request, nama client, atau kategori event..."
                  value={customSearch}
                  onChange={(e) => setCustomSearch(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSearchCustomRequests(); }}
                />
              </div>
              <div className="zy-status-filter-wrapper" style={{ minWidth: '180px' }}>
                <select
                  className="zy-form-select"
                  style={{ padding: '0.72rem 1rem', height: '43px', borderRadius: '8px', border: '1px solid var(--neutral-light)', backgroundColor: 'var(--bg-page)', fontSize: '0.95rem' }}
                  value={customStatusFilter}
                  onChange={(e) => {
                    setCustomStatusFilter(e.target.value);
                    fetchCustomRequests(customSearch, e.target.value);
                  }}
                >
                  <option value="">Semua Status</option>
                  <option value="menunggu">Menunggu Review</option>
                  <option value="diproses">Diproses</option>
                  <option value="ditawarkan">Menunggu Penawaran</option>
                  <option value="diterima">Siap Ditinjau</option>
                  <option value="ditolak">Ditolak</option>
                  <option value="selesai">Selesai</option>
                </select>
              </div>
              <button className="zy-filter-btn" onClick={handleSearchCustomRequests}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filter
              </button>
            </div>

            {/* Main Table Card */}
            <section className="zy-section-card" aria-label="Tabel Request Custom Paket">
              <h2 className="zy-section-card-title">Daftar Request Custom</h2>
              <p className="zy-section-card-desc">Berikut adalah daftar lengkap permintaan kustomisasi paket dari customer.</p>

              {isLoadingCustomRequests ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div className="zy-skeleton-line skeleton-row" />
                  <div className="zy-skeleton-line skeleton-row" />
                  <div className="zy-skeleton-line skeleton-row" />
                  <div className="zy-skeleton-line skeleton-row" />
                </div>
              ) : customRequests.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                  Tidak ditemukan data request custom yang cocok dengan kriteria pencarian Anda.
                </p>
              ) : (
                <div className="zy-table-wrapper">
                  <table className="zy-table">
                    <thead>
                      <tr>
                        <th>Kode</th>
                        <th>Client</th>
                        <th>Kategori</th>
                        <th>Tanggal Acara</th>
                        <th>Budget</th>
                        <th>Status</th>
                        <th>Status Pembayaran</th>
                        <th>Status MOU</th>
                        <th style={{ textAlign: 'center' }}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customRequests.map((req) => {
                        const statusObj = getCustomRequestStatusDetails(req.status_request, req.id_request);
                        const requestCode = `REQ-${String(req.id_request).padStart(3, '0')}`;
                        const categoryName = req.kategori_event?.nama_kategori || req.kategoriEvent?.nama_kategori || (req.id_kategori === 1 ? 'Wedding Event' : req.id_kategori === 2 ? 'Outbound' : req.id_kategori === 3 ? 'Launching Product' : req.id_kategori === 4 ? 'Study Field' : req.id_kategori === 5 ? 'Birthday Party' : req.id_kategori === 6 ? 'Gathering' : '-');
                        return (
                          <tr key={req.id_request}>
                            <td style={{ fontWeight: 'bold' }}>{requestCode}</td>
                            <td>{req.user?.nama || '-'}</td>
                            <td>{categoryName}</td>
                            <td>{formatIndoDate(req.tanggal_acara)}</td>
                            <td>{formatRupiah(req.budget_acara)}</td>
                            <td>
                              <span className={`zy-status-badge ${statusObj.className}`}>
                                {statusObj.text}
                              </span>
                            </td>
                            <td>
                              {(req.penawaran_custom && req.penawaran_custom.length > 0) || (req.penawaranCustom && req.penawaranCustom.length > 0) ? (
                                ((req.penawaran_custom || req.penawaranCustom)[(req.penawaran_custom || req.penawaranCustom).length - 1].payment_status === 'paid') ? (
                                  <span className="zy-status-badge status-diproses">Lunas</span>
                                ) : (
                                  <span className="zy-status-badge status-menunggu-verifikasi">Belum Lunas</span>
                                )
                              ) : (
                                <span className="zy-status-badge" style={{backgroundColor: 'var(--neutral-light)', color: 'var(--text-muted)'}}>-</span>
                              )}
                            </td>
                            <td>
                              {(() => {
                                const statusMou = (req.dokumenMou || req.dokumen_mou)?.status_mou || 'belum_ada';
                                return (
                                  <span className={`zy-status-badge ${MOU_STATUS_BADGE[statusMou] || 'status-selesai-dicek'}`}>
                                    {MOU_STATUS_LABEL[statusMou] || 'Belum Ada'}
                                  </span>
                                );
                              })()}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <button
                                className="zy-btn-detail"
                                onClick={() => handleShowCustomDetail(req.id_request)}
                              >
                                Detail
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        ) : activeTab === 'kategori-crud' ? (
          /* KATEGORI CRUD VIEW */
          <>
            {/* Breadcrumb */}
            <div className="zy-breadcrumb">
              <div className="zy-breadcrumb-item">
                <a onClick={() => setActiveTab('dashboard')}>Dashboard</a>
              </div>
              <div className="zy-breadcrumb-item">/</div>
              <div className="zy-breadcrumb-item active">Kategori Event</div>
            </div>

            {/* Header Banner */}
            <header className="zy-dashboard-header">
              <h1>Kelola Kategori Event</h1>
              <p>Tambah, edit, dan hapus kategori event. Kategori yang aktif akan otomatis muncul pada menu Paket Event dan Fasilitas Layanan.</p>
            </header>

            {/* Actions Panel */}
            <div className="zy-category-actions-panel">
              <button className="zy-btn-close" onClick={() => setActiveTab('dashboard')}>
                ← Kembali
              </button>
              <button className="zy-filter-btn" onClick={handleOpenAddCategory}>
                + Tambah Kategori
              </button>
            </div>

            {/* Main Table Card */}
            <section className="zy-section-card" aria-label="Tabel Kategori Event">
              <h2 className="zy-section-card-title">Daftar Kategori</h2>
              <p className="zy-section-card-desc">Berikut adalah daftar lengkap kategori event yang tersedia di sistem.</p>

              {isLoadingCategories ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div className="zy-skeleton-line skeleton-row" />
                  <div className="zy-skeleton-line skeleton-row" />
                  <div className="zy-skeleton-line skeleton-row" />
                </div>
              ) : categories.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                  Belum ada kategori event yang ditambahkan.
                </p>
              ) : (
                <div className="zy-table-wrapper">
                  <table className="zy-table">
                    <thead>
                      <tr>
                        <th style={{ width: '80px' }}>No</th>
                        <th>Nama Kategori</th>
                        <th>Deskripsi</th>
                        <th style={{ width: '150px', textAlign: 'center' }}>Jumlah Paket</th>
                        <th style={{ width: '200px', textAlign: 'center' }}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((cat, index) => (
                        <tr key={cat.id_kategori}>
                          <td>{index + 1}</td>
                          <td style={{ fontWeight: 'bold' }}>{cat.nama_kategori}</td>
                          <td>{cat.deskripsi || '-'}</td>
                          <td style={{ textAlign: 'center' }}>{cat.jumlah_paket ?? 0}</td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                              <button
                                className="zy-btn-detail"
                                style={{ backgroundColor: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)' }}
                                onClick={() => handleOpenEditCategory(cat)}
                              >
                                Edit
                              </button>
                              <button
                                className="zy-btn-submit"
                                style={{ backgroundColor: '#FFF0F0', color: '#C92A2A', border: '1px solid #FFC9C9', padding: '0.4rem 1rem', fontSize: '0.85rem', minWidth: 'auto', height: 'auto' }}
                                onClick={() => handleDeleteCategory(cat.id_kategori)}
                              >
                                Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        ) : activeTab.startsWith('kategori-') ? (
          /* KATEGORI EVENT VIEW */
          <>
            {/* Breadcrumb */}
            <div className="zy-breadcrumb">
              <div className="zy-breadcrumb-item">
                <a onClick={() => setActiveTab('dashboard')}>Dashboard</a>
              </div>
              <div className="zy-breadcrumb-item">/</div>
              <div className="zy-breadcrumb-item">Paket Event</div>
              <div className="zy-breadcrumb-item">/</div>
              <div className="zy-breadcrumb-item active">
                {(() => {
                  const currentCatId = parseInt(activeTab.replace('kategori-', '')) || 1;
                  if (categories.length > 0) {
                    const found = categories.find(c => c.id_kategori === currentCatId);
                    if (found) return found.nama_kategori;
                  }
                  const categoryList = [
                    { id: 1, label: 'Wedding Event' },
                    { id: 2, label: 'Outbound' },
                    { id: 3, label: 'Launching Product' },
                    { id: 4, label: 'Study Field' },
                    { id: 5, label: 'Birthday Party' },
                    { id: 6, label: 'Gathering' }
                  ];
                  return (categoryList.find(c => c.id === currentCatId) || categoryList[0]).label;
                })()}
              </div>
            </div>

            {/* Header Banner */}
            <header className="zy-dashboard-header">
              {(() => {
                const currentCatId = parseInt(activeTab.replace('kategori-', '')) || 1;
                if (categories.length > 0) {
                  const found = categories.find(c => c.id_kategori === currentCatId);
                  if (found) {
                    return (
                      <>
                        <h1>Paket Layanan – {found.nama_kategori}</h1>
                        <p>{found.deskripsi || 'Kelola daftar paket layanan dalam kategori ini. Setiap paket dapat ditambah, diedit, atau dihapus.'}</p>
                      </>
                    );
                  }
                }
                const categoryList = [
                  { id: 1, label: 'Wedding Event', desc: 'Kelola daftar paket layanan dalam kategori ini. Setiap paket dapat ditambah, diedit, atau dihapus.' },
                  { id: 2, label: 'Outbound', desc: 'Kelola daftar paket layanan dalam kategori ini. Setiap paket dapat ditambah, diedit, atau dihapus.' },
                  { id: 3, label: 'Launching Product', desc: 'Kelola daftar paket layanan dalam kategori ini. Setiap paket dapat ditambah, diedit, atau dihapus.' },
                  { id: 4, label: 'Study Field', desc: 'Kelola daftar paket layanan dalam kategori ini. Setiap paket dapat ditambah, diedit, atau dihapus.' },
                  { id: 5, label: 'Birthday Party', desc: 'Kelola daftar paket layanan dalam kategori ini. Setiap paket dapat ditambah, diedit, atau dihapus.' },
                  { id: 6, label: 'Gathering', desc: 'Kelola daftar paket layanan dalam kategori ini. Setiap paket dapat ditambah, diedit, atau dihapus.' }
                ];
                const cat = categoryList.find(c => c.id === currentCatId) || categoryList[0];
                return (
                  <>
                    <h1>Paket Layanan – {cat.label}</h1>
                    <p>{cat.desc}</p>
                  </>
                );
              })()}
            </header>

            {/* Actions Area */}
            <div className="zy-category-actions-panel">
              <button className="zy-btn-close" onClick={() => setActiveTab('dashboard')}>
                ← Kembali
              </button>
              <button className="zy-filter-btn" onClick={handleOpenAddModal}>
                + Tambah Paket
              </button>
            </div>

            {/* Category Sub-Tabs Nav Bar */}
            <div className="zy-category-tabs-bar">
              {(() => {
                const currentCatId = parseInt(activeTab.replace('kategori-', '')) || 1;
                if (categories.length > 0) {
                  return categories.map(cat => (
                    <button
                      key={cat.id_kategori}
                      className={`zy-category-tab-btn ${cat.id_kategori === currentCatId ? 'active' : ''}`}
                      onClick={() => setActiveTab(`kategori-${cat.id_kategori}`)}
                    >
                      {cat.nama_kategori}
                    </button>
                  ));
                }
                const categoryList = [
                  { id: 1, label: 'Wedding Event', path: 'kategori-1' },
                  { id: 2, label: 'Outbound', path: 'kategori-2' },
                  { id: 3, label: 'Launching Product', path: 'kategori-3' },
                  { id: 4, label: 'Study Field', path: 'kategori-4' },
                  { id: 5, label: 'Birthday Party', path: 'kategori-5' },
                  { id: 6, label: 'Gathering', path: 'kategori-6' }
                ];
                return categoryList.map(cat => (
                  <button
                    key={cat.id}
                    className={`zy-category-tab-btn ${cat.id === currentCatId ? 'active' : ''}`}
                    onClick={() => setActiveTab(cat.path)}
                  >
                    {cat.label}
                  </button>
                ));
              })()}
            </div>

            {/* Package Cards List Area */}
            <section className="zy-section-card" style={{ marginTop: '1.5rem' }}>
              {(() => {
                const currentCatId = parseInt(activeTab.replace('kategori-', '')) || 1;
                if (categories.length > 0) {
                  const found = categories.find(c => c.id_kategori === currentCatId);
                  if (found) {
                    return (
                      <>
                        <h2 className="zy-section-card-title">Daftar Paket – {found.nama_kategori}</h2>
                        <p className="zy-section-card-desc">Gunakan tombol Edit atau Hapus untuk mengelola paket, atau tambah paket baru.</p>
                      </>
                    );
                  }
                }
                const categoryList = [
                  { id: 1, label: 'Wedding Event' },
                  { id: 2, label: 'Outbound' },
                  { id: 3, label: 'Launching Product' },
                  { id: 4, label: 'Study Field' },
                  { id: 5, label: 'Birthday Party' },
                  { id: 6, label: 'Gathering' }
                ];
                const catLabel = (categoryList.find(c => c.id === currentCatId) || categoryList[0]).label;
                return (
                  <>
                    <h2 className="zy-section-card-title">Daftar Paket – {catLabel}</h2>
                    <p className="zy-section-card-desc">Gunakan tombol Edit atau Hapus untuk mengelola paket, atau tambah paket baru.</p>
                  </>
                );
              })()}

              {isLoadingPackages ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="zy-package-card skeleton-card" style={{ height: '380px' }}>
                      <div className="zy-skeleton-line" style={{ height: '180px', borderRadius: '8px 8px 0 0' }} />
                      <div style={{ padding: '1.25rem' }}>
                        <div className="zy-skeleton-line skeleton-title" style={{ width: '40%' }} />
                        <div className="zy-skeleton-line skeleton-text" style={{ width: '80%' }} />
                        <div className="zy-skeleton-line skeleton-text" style={{ width: '60%' }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="zy-packages-grid">
                  {packages.map((pkg) => {
                    const badge = (() => {
                      const lower = pkg.nama_paket.toLowerCase();
                      if (lower.includes('bronze')) return { label: 'BRONZE', className: 'badge-bronze' };
                      if (lower.includes('silver')) return { label: 'SILVER', className: 'badge-silver' };
                      if (lower.includes('gold')) return { label: 'GOLD', className: 'badge-gold' };
                      // Fallbacks based on category seeds
                      if (lower.includes('sakinah') || lower.includes('basic') || lower.includes('regular') || lower.includes('team building')) {
                        return { label: 'BRONZE', className: 'badge-bronze' };
                      }
                      if (lower.includes('mawaddah') || lower.includes('exclusive') || lower.includes('adventure')) {
                        return { label: 'SILVER', className: 'badge-silver' };
                      }
                      if (lower.includes('warahmah') || lower.includes('premium') || lower.includes('executive') || lower.includes('grand')) {
                        return { label: 'GOLD', className: 'badge-gold' };
                      }
                      return { label: 'REGULAR', className: 'badge-regular' };
                    })();

                    return (
                      <div key={pkg.id_paket} className={`zy-package-card ${pkg.status_paket === 'nonaktif' ? 'package-inactive' : ''}`}>
                        <div className="zy-package-image-container">
                          {pkg.foto ? (
                            <img src={pkg.foto} alt={pkg.nama_paket} className="zy-package-img" />
                          ) : (
                            <div className="zy-package-no-image">
                              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="zy-package-placeholder-svg">
                                <line x1="0" y1="0" x2="100" y2="100" stroke="#CCCCCC" strokeWidth="1.5" />
                                <line x1="100" y1="0" x2="0" y2="100" stroke="#CCCCCC" strokeWidth="1.5" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="zy-package-content">
                          <span className={`zy-package-badge ${badge.className}`}>{badge.label}</span>
                          <h3 className="zy-package-title">{pkg.nama_paket}</h3>
                          <div className="zy-package-price">{formatRupiah(pkg.harga)}</div>
                          <p className="zy-package-desc">{pkg.deskripsi || 'Tidak ada deskripsi paket.'}</p>
                          <div className="zy-package-actions">
                            <button className="zy-btn-close" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }} onClick={() => handleOpenEditModal(pkg)}>
                              Edit
                            </button>
                            <button className="zy-btn-submit" style={{ backgroundColor: '#FFF0F0', color: '#C92A2A', border: '1px solid #FFC9C9', padding: '0.4rem 1rem', fontSize: '0.85rem', minWidth: 'auto', height: 'auto' }} onClick={() => handleDeletePackage(pkg.id_paket)}>
                              Hapus
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Add New Package Card */}
                  <div className="zy-package-card zy-package-card-add" onClick={handleOpenAddModal}>
                    <div className="zy-package-card-add-content">
                      <span className="zy-package-card-add-icon">+</span>
                      <span className="zy-package-card-add-text">Tambah Paket Baru</span>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </>
        ) : activeTab.startsWith('fasilitas-') ? (
          /* FASILITAS LAYANAN VIEW */
          <>
            {/* Breadcrumb */}
            <div className="zy-breadcrumb">
              <div className="zy-breadcrumb-item">
                <a onClick={() => setActiveTab('dashboard')}>Dashboard</a>
              </div>
              <div className="zy-breadcrumb-item">/</div>
              <div className="zy-breadcrumb-item">Fasilitas Layanan</div>
              <div className="zy-breadcrumb-item">/</div>
              <div className="zy-breadcrumb-item active">
                {(() => {
                  const currentCatId = parseInt(activeTab.replace('fasilitas-', '')) || 1;
                  if (categories.length > 0) {
                    const found = categories.find(c => c.id_kategori === currentCatId);
                    if (found) return found.nama_kategori;
                  }
                  const categoryList = [
                    { id: 1, label: 'Wedding Event' },
                    { id: 2, label: 'Outbound' },
                    { id: 3, label: 'Launching Product' },
                    { id: 4, label: 'Study Field' },
                    { id: 5, label: 'Birthday Party' },
                    { id: 6, label: 'Gathering' }
                  ];
                  return (categoryList.find(c => c.id === currentCatId) || categoryList[0]).label;
                })()}
              </div>
            </div>

            {/* Header Banner */}
            <header className="zy-dashboard-header">
              {(() => {
                const currentCatId = parseInt(activeTab.replace('fasilitas-', '')) || 1;
                if (categories.length > 0) {
                  const found = categories.find(c => c.id_kategori === currentCatId);
                  if (found) {
                    return (
                      <>
                        <h1>Fasilitas Layanan – {found.nama_kategori}</h1>
                        <p>{found.deskripsi || 'Kelola daftar fasilitas layanan dalam kategori ini. Setiap fasilitas dapat ditambah, diedit, atau dihapus.'}</p>
                      </>
                    );
                  }
                }
                const categoryList = [
                  { id: 1, label: 'Wedding Event', desc: 'Kelola daftar fasilitas layanan dalam kategori ini. Setiap fasilitas dapat ditambah, diedit, atau dihapus.' },
                  { id: 2, label: 'Outbound', desc: 'Kelola daftar fasilitas layanan dalam kategori ini. Setiap fasilitas dapat ditambah, diedit, atau dihapus.' },
                  { id: 3, label: 'Launching Product', desc: 'Kelola daftar fasilitas layanan dalam kategori ini. Setiap fasilitas dapat ditambah, diedit, atau dihapus.' },
                  { id: 4, label: 'Study Field', desc: 'Kelola daftar fasilitas layanan dalam kategori ini. Setiap fasilitas dapat ditambah, diedit, atau dihapus.' },
                  { id: 5, label: 'Birthday Party', desc: 'Kelola daftar fasilitas layanan dalam kategori ini. Setiap fasilitas dapat ditambah, diedit, atau dihapus.' },
                  { id: 6, label: 'Gathering', desc: 'Kelola daftar fasilitas layanan dalam kategori ini. Setiap fasilitas dapat ditambah, diedit, atau dihapus.' }
                ];
                const cat = categoryList.find(c => c.id === currentCatId) || categoryList[0];
                return (
                  <>
                    <h1>Fasilitas Layanan – {cat.label}</h1>
                    <p>{cat.desc}</p>
                  </>
                );
              })()}
            </header>

            {/* Actions Area */}
            <div className="zy-category-actions-panel">
              <button className="zy-btn-close" onClick={() => setActiveTab('dashboard')}>
                ← Kembali
              </button>
              <button className="zy-filter-btn" onClick={handleOpenAddFacility}>
                + Tambah Fasilitas
              </button>
            </div>

            {/* Category Sub-Tabs Nav Bar */}
            <div className="zy-category-tabs-bar">
              {(() => {
                const currentCatId = parseInt(activeTab.replace('fasilitas-', '')) || 1;
                if (categories.length > 0) {
                  return categories.map(cat => (
                    <button
                      key={cat.id_kategori}
                      className={`zy-category-tab-btn ${cat.id_kategori === currentCatId ? 'active' : ''}`}
                      onClick={() => setActiveTab(`fasilitas-${cat.id_kategori}`)}
                    >
                      {cat.nama_kategori}
                    </button>
                  ));
                }
                const categoryList = [
                  { id: 1, label: 'Wedding Event', path: 'fasilitas-1' },
                  { id: 2, label: 'Outbound', path: 'fasilitas-2' },
                  { id: 3, label: 'Launching Product', path: 'fasilitas-3' },
                  { id: 4, label: 'Study Field', path: 'fasilitas-4' },
                  { id: 5, label: 'Birthday Party', path: 'fasilitas-5' },
                  { id: 6, label: 'Gathering', path: 'fasilitas-6' }
                ];
                return categoryList.map(cat => (
                  <button
                    key={cat.id}
                    className={`zy-category-tab-btn ${cat.id === currentCatId ? 'active' : ''}`}
                    onClick={() => setActiveTab(cat.path)}
                  >
                    {cat.label}
                  </button>
                ));
              })()}
            </div>

            {/* Main Table Card */}
            <section className="zy-section-card" style={{ marginTop: '1.5rem' }}>
              <h2 className="zy-section-card-title">Daftar Fasilitas</h2>
              <p className="zy-section-card-desc">Berikut adalah daftar fasilitas layanan yang tersedia untuk kategori event ini.</p>

              {isLoadingFacilities ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div className="zy-skeleton-line skeleton-row" />
                  <div className="zy-skeleton-line skeleton-row" />
                  <div className="zy-skeleton-line skeleton-row" />
                </div>
              ) : facilities.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                  Belum ada fasilitas layanan yang ditambahkan untuk kategori ini.
                </p>
              ) : (
                <div className="zy-table-wrapper">
                  <table className="zy-table">
                    <thead>
                      <tr>
                        <th style={{ width: '80px' }}>No</th>
                        <th>Nama Fasilitas</th>
                        <th>Deskripsi</th>
                        <th style={{ width: '200px', textAlign: 'center' }}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {facilities.map((fac, index) => (
                        <tr key={fac.id_fasilitas}>
                          <td>{index + 1}</td>
                          <td style={{ fontWeight: 'bold' }}>{fac.nama_fasilitas}</td>
                          <td>{fac.deskripsi || '-'}</td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                              <button
                                className="zy-btn-detail"
                                style={{ backgroundColor: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)' }}
                                onClick={() => handleOpenEditFacility(fac)}
                              >
                                Edit
                              </button>
                              <button
                                className="zy-btn-submit"
                                style={{ backgroundColor: '#FFF0F0', color: '#C92A2A', border: '1px solid #FFC9C9', padding: '0.4rem 1rem', fontSize: '0.85rem', minWidth: 'auto', height: 'auto' }}
                                onClick={() => handleDeleteFacility(fac.id_fasilitas)}
                              >
                                Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        ) : activeTab === 'galeri-event' ? (
          /* GALERI EVENT VIEW */
          <>
            {/* Breadcrumb */}
            <div className="zy-breadcrumb">
              <div className="zy-breadcrumb-item">
                <a onClick={() => setActiveTab('dashboard')}>Dashboard</a>
              </div>
              <div className="zy-breadcrumb-item">/</div>
              <div className="zy-breadcrumb-item active">Galeri Event</div>
            </div>

            {/* Header Banner */}
            <header className="zy-dashboard-header">
              <h1>Galeri Event</h1>
              <p>Kelola dokumentasi portofolio event ZY Production untuk memukau calon client dengan hasil kerja nyata kami.</p>
            </header>

            {/* Actions Area */}
            <div className="zy-category-actions-panel">
              <button className="zy-btn-close" onClick={() => setActiveTab('dashboard')}>
                ← Kembali
              </button>
              <button className="zy-filter-btn" onClick={handleOpenAddGallery}>
                + Tambah Galeri
              </button>
            </div>

            {/* Gallery Grid Area */}
            <section className="zy-section-card" style={{ marginTop: '1.5rem' }}>
              <h2 className="zy-section-card-title">Daftar Dokumentasi Galeri</h2>
              <p className="zy-section-card-desc">Berikut adalah daftar foto event portofolio yang ditampilkan kepada publik.</p>

              {isLoadingGallery ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="zy-package-card skeleton-card" style={{ height: '380px' }}>
                      <div className="zy-skeleton-line" style={{ height: '180px', borderRadius: '8px 8px 0 0' }} />
                      <div style={{ padding: '1.25rem' }}>
                        <div className="zy-skeleton-line skeleton-title" style={{ width: '40%' }} />
                        <div className="zy-skeleton-line skeleton-text" style={{ width: '80%' }} />
                        <div className="zy-skeleton-line skeleton-text" style={{ width: '60%' }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : galleryItems.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                  Belum ada item galeri event yang ditambahkan.
                </p>
              ) : (
                <div className="zy-gallery-grid">
                  {galleryItems.map((item) => (
                    <div key={item.id_galeri} className="zy-gallery-card">
                      <div className="zy-gallery-image-container">
                        {item.foto ? (
                          <img src={item.foto.startsWith('http') ? item.foto : `/storage/${item.foto}`} alt={item.judul} className="zy-gallery-img" />
                        ) : (
                          <div className="zy-gallery-no-image">
                            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="zy-gallery-placeholder-svg">
                              <line x1="0" y1="0" x2="100" y2="100" stroke="#CCCCCC" strokeWidth="1.5" />
                              <line x1="100" y1="0" x2="0" y2="100" stroke="#CCCCCC" strokeWidth="1.5" />
                            </svg>
                          </div>
                        )}
                        <span className="zy-gallery-date-badge">
                          {formatIndoDate(item.tanggal || item.created_at)}
                        </span>
                      </div>
                      <div className="zy-gallery-content">
                        <h3 className="zy-gallery-title">{item.judul}</h3>
                        <p className="zy-gallery-desc">{item.deskripsi || 'Tidak ada deskripsi.'}</p>
                        <div className="zy-gallery-actions">
                          <button className="zy-btn-close" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }} onClick={() => handleOpenEditGallery(item)}>
                            Edit
                          </button>
                          <button className="zy-btn-submit" style={{ backgroundColor: '#FFF0F0', color: '#C92A2A', border: '1px solid #FFC9C9', padding: '0.4rem 1rem', fontSize: '0.85rem', minWidth: 'auto', height: 'auto' }} onClick={() => handleDeleteGallery(item.id_galeri)}>
                            Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : activeTab === 'profil-admin' ? (
          /* PROFIL ADMIN VIEW */
          <>
            {/* Breadcrumb */}
            <div className="zy-breadcrumb">
              <div className="zy-breadcrumb-item">
                <a onClick={() => setActiveTab('dashboard')}>Dashboard</a>
              </div>
              <div className="zy-breadcrumb-item">/</div>
              <div className="zy-breadcrumb-item active">Profil Admin</div>
            </div>

            {/* Header Banner */}
            <header className="zy-dashboard-header">
              <h1>Profil Admin</h1>
              <p>Kelola data profil pribadi Anda, informasi kontak, serta perbarui kata sandi secara berkala untuk keamanan akun.</p>
            </header>

            {/* Profile Grid Container */}
            <div className="zy-profile-grid-container">
              {/* Left Side: Profile Card */}
              <div className="zy-profile-card">
                <div
                  className="zy-profile-avatar-container"
                  onClick={() => document.getElementById('profile_foto_input')?.click()}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="zy-profile-avatar-large" style={{ overflow: 'hidden', position: 'relative' }}>
                    {profileFotoPreview ? (
                      <img src={profileFotoPreview} alt="Preview Avatar" className="zy-profile-avatar-large-img" />
                    ) : user && user.foto ? (
                      <img src={user.foto.startsWith('http') ? user.foto : `/storage/${user.foto}`} alt="Profile Avatar" className="zy-profile-avatar-large-img" />
                    ) : (
                      profileNama ? profileNama.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'AD'
                    )}
                  </div>
                  <div className="zy-avatar-overlay">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <circle cx="12" cy="13" r="3" />
                    </svg>
                    <span>Ubah Foto</span>
                  </div>
                </div>
                <input
                  type="file"
                  id="profile_foto_input"
                  style={{ display: 'none' }}
                  accept="image/*"
                  onChange={handleProfileFotoChange}
                />
                <h3 className="zy-profile-name">{profileNama || 'Administrator'}</h3>
                <span className="zy-profile-role-badge">
                  {user ? (user.role === 'admin' ? 'SUPER ADMIN' : user.role.toUpperCase()) : 'SUPER ADMIN'}
                </span>

                <button
                  type="button"
                  className="zy-btn-detail"
                  style={{ marginBottom: '1.5rem', fontSize: '0.85rem', padding: '0.35rem 0.75rem' }}
                  onClick={() => document.getElementById('profile_foto_input')?.click()}
                >
                  Pilih Foto
                </button>

                <div className="zy-profile-meta-info">
                  <div className="zy-profile-meta-item">
                    <span className="zy-meta-label">ID Pengguna</span>
                    <span className="zy-meta-value">#USR-{String(user?.id_user || 0).padStart(3, '0')}</span>
                  </div>
                  <div className="zy-profile-meta-item">
                    <span className="zy-meta-label">Status Akun</span>
                    <span className="zy-status-badge status-diproses" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', backgroundColor: '#E6FCF5', color: '#099268', border: '1px solid #C3FAE8' }}>Aktif</span>
                  </div>
                  <div className="zy-profile-meta-item">
                    <span className="zy-meta-label">Terdaftar Sejak</span>
                    <span className="zy-meta-value">{user?.created_at ? new Date(user.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}</span>
                  </div>
                </div>
              </div>

              {/* Right Side: Form Inputs */}
              <div className="zy-profile-form-card">
                <h2 className="zy-section-card-title">Informasi Akun</h2>
                <p className="zy-section-card-desc" style={{ marginBottom: '1.5rem' }}>Perbarui data diri dan alamat email Anda di bawah ini.</p>

                {profileSuccessMsg && (
                  <div className="zy-alert zy-alert-success" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', padding: '1rem', borderRadius: '8px', backgroundColor: '#E6FCF5', color: '#099268', border: '1px solid #C3FAE8', fontSize: '0.9rem' }}>
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{profileSuccessMsg}</span>
                  </div>
                )}

                {profileErrorMsg && (
                  <div className="zy-alert zy-alert-error" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', padding: '1rem', borderRadius: '8px', backgroundColor: '#FFF5F5', color: '#C92A2A', border: '1px solid #FFD8D8', fontSize: '0.9rem' }}>
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>{profileErrorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleUpdateProfile} className="zy-profile-form">
                  <div className="zy-form-row">
                    <div className="zy-form-group">
                      <label className="zy-form-label" htmlFor="profile_nama">Nama Lengkap</label>
                      <input
                        type="text"
                        id="profile_nama"
                        className="zy-form-input"
                        value={profileNama}
                        onChange={(e) => setProfileNama(e.target.value)}
                        required
                        placeholder="Nama Lengkap"
                      />
                    </div>
                    <div className="zy-form-group">
                      <label className="zy-form-label" htmlFor="profile_email">Alamat Email</label>
                      <input
                        type="email"
                        id="profile_email"
                        className="zy-form-input"
                        value={profileEmail}
                        onChange={(e) => setProfileEmail(e.target.value)}
                        required
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>

                  <div className="zy-form-group" style={{ maxWidth: 'calc(50% - 0.75rem)' }}>
                    <label className="zy-form-label" htmlFor="profile_nohp">No. Telepon / HP</label>
                    <input
                      type="text"
                      id="profile_nohp"
                      className="zy-form-input"
                      value={profileNoHp}
                      onChange={(e) => setProfileNoHp(e.target.value)}
                      required
                      placeholder="08xxxxxxxxxx"
                    />
                  </div>

                  <hr className="zy-form-divider" />

                  <h2 className="zy-section-card-title">Keamanan & Kata Sandi</h2>
                  <p className="zy-section-card-desc" style={{ marginBottom: '1.5rem' }}>Kosongkan jika Anda tidak ingin mengubah kata sandi.</p>

                  <div className="zy-form-row">
                    <div className="zy-form-group">
                      <label className="zy-form-label" htmlFor="profile_password">Kata Sandi Baru</label>
                      <input
                        type="password"
                        id="profile_password"
                        className="zy-form-input"
                        value={profilePassword}
                        onChange={(e) => setProfilePassword(e.target.value)}
                        placeholder="Min. 8 karakter"
                      />
                    </div>
                    <div className="zy-form-group">
                      <label className="zy-form-label" htmlFor="profile_password_confirm">Konfirmasi Kata Sandi Baru</label>
                      <input
                        type="password"
                        id="profile_password_confirm"
                        className="zy-form-input"
                        value={profilePasswordConfirm}
                        onChange={(e) => setProfilePasswordConfirm(e.target.value)}
                        placeholder="Ulangi kata sandi baru"
                      />
                    </div>
                  </div>

                  <div className="zy-profile-form-actions">
                    <button
                      type="submit"
                      className="zy-btn-submit"
                      disabled={isSavingProfile}
                      style={{ padding: '0.75rem 2rem', fontSize: '1rem', height: 'auto', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      {isSavingProfile ? (
                        <>
                          <span className="zy-spinner" />
                          Menyimpan...
                        </>
                      ) : (
                        'Simpan Perubahan'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </>
        ) : (
          /* PLACEHOLDER VIEWS FOR DEVELOPMENT */
          <div className="zy-placeholder-container">
            <svg
              className="zy-placeholder-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <h1 className="zy-placeholder-title">{getTabLabel(activeTab)}</h1>
            <p className="zy-placeholder-desc">
              Fitur pengelolaan halaman "{getTabLabel(activeTab)}" sedang dalam tahap pengembangan sistem untuk menyempurnakan fitur-fitur administratif di ZY Production.
            </p>
            <button className="zy-placeholder-btn" onClick={() => setActiveTab('dashboard')}>
              Kembali ke Dashboard
            </button>
          </div>
        )}
      </main>

      {/* Detail Modal Overlay */}
      {selectedOrder && (
        <div className="zy-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="zy-modal" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="zy-modal-header">
              <h3>Detail Pemesanan: {selectedOrder.kode_pemesanan}</h3>
              <button className="zy-modal-close-btn" onClick={() => setSelectedOrder(null)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="zy-modal-body">
              {/* Section 1: Informasi Client */}
              <div className="zy-modal-section">
                <h4 className="zy-modal-section-title">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{color: 'var(--primary)', marginRight: '8px'}}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Informasi Client
                </h4>
                <div className="zy-modal-grid">
                  <div className="zy-modal-field">
                    <span className="zy-field-label">Nama Lengkap</span>
                    <span className="zy-field-val">{selectedOrder.user?.nama || '-'}</span>
                  </div>
                  <div className="zy-modal-field">
                    <span className="zy-field-label">Email</span>
                    <span className="zy-field-val">{selectedOrder.user?.email || '-'}</span>
                  </div>
                  <div className="zy-modal-field">
                    <span className="zy-field-label">No. Telepon / HP</span>
                    <span className="zy-field-val">{selectedOrder.user?.no_hp || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Section 2: Detail Paket Layanan */}
              <div className="zy-modal-section">
                <h4 className="zy-modal-section-title">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{color: 'var(--primary)', marginRight: '8px'}}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Paket Layanan
                </h4>
                <div className="zy-modal-grid">
                  <div className="zy-modal-field">
                    <span className="zy-field-label">Nama Paket</span>
                    <span className="zy-field-val" style={{fontWeight: 'bold', color: 'var(--primary)'}}>
                      {selectedOrder.paket?.nama_paket || 'Custom Paket'}
                    </span>
                  </div>
                  <div className="zy-modal-field">
                    <span className="zy-field-label">Kategori Event</span>
                    <span className="zy-field-val">{selectedOrder.paket?.kategori || '-'}</span>
                  </div>
                  <div className="zy-modal-field">
                    <span className="zy-field-label">Harga Paket</span>
                    <span className="zy-field-val">{formatRupiah(selectedOrder.paket?.harga)}</span>
                  </div>
                </div>
              </div>

              {/* Status Midtrans Pembayaran */}
              <div className="zy-modal-section" style={{ backgroundColor: selectedOrder.payment_status === 'paid' ? '#f0fdf4' : '#fffbeb', padding: '1rem', borderRadius: '8px', border: `1px solid ${selectedOrder.payment_status === 'paid' ? '#bbf7d0' : '#fef08a'}`, marginBottom: '1.5rem' }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', color: selectedOrder.payment_status === 'paid' ? '#166534' : '#854d0e', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {selectedOrder.payment_status === 'paid' ? '✅ Pembayaran Midtrans: Lunas' : '⏳ Pembayaran Midtrans: Belum Lunas / Pending'}
                </h4>
              </div>

              {/* Section 3: Detail Event / Acara */}
              <div className="zy-modal-section">
                <h4 className="zy-modal-section-title">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{color: 'var(--primary)', marginRight: '8px'}}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Detail Event
                </h4>
                <div className="zy-modal-grid">
                  <div className="zy-modal-field">
                    <span className="zy-field-label">Tanggal Pelaksanaan</span>
                    <span className="zy-field-val">{formatIndoDate(selectedOrder.tanggal_acara)}</span>
                  </div>
                  <div className="zy-modal-field">
                    <span className="zy-field-label">Lokasi Acara</span>
                    <span className="zy-field-val">{selectedOrder.lokasi_acara || '-'}</span>
                  </div>
                  <div className="zy-modal-field" style={{ gridColumn: 'span 2' }}>
                    <span className="zy-field-label">Catatan Tambahan</span>
                    <span className="zy-field-val" style={{ whiteSpace: 'pre-line' }}>{selectedOrder.catatan || 'Tidak ada catatan khusus.'}</span>
                  </div>
                </div>
              </div>

              {/* Section 4: Informasi Pembayaran */}
              <div className="zy-modal-section">
                <h4 className="zy-modal-section-title">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{color: 'var(--primary)', marginRight: '8px'}}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Status & Riwayat Pembayaran
                </h4>
                {selectedOrder.pembayaran && selectedOrder.pembayaran.length > 0 ? (
                  <div className="zy-table-wrapper" style={{ marginTop: '0.5rem' }}>
                    <table className="zy-table" style={{ fontSize: '0.85rem' }}>
                      <thead>
                        <tr>
                          <th>Tanggal Bayar</th>
                          <th>Jumlah</th>
                          <th>Status</th>
                          <th>Bukti</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.pembayaran.map((pay) => (
                          <tr key={pay.id_pembayaran}>
                            <td>{formatIndoDate(pay.tanggal_bayar)}</td>
                            <td>{formatRupiah(pay.jumlah_bayar)}</td>
                            <td>
                              <span className={`zy-status-badge ${
                                pay.status_konfirmasi === 'dikonfirmasi' ? 'status-diproses' :
                                pay.status_konfirmasi === 'ditolak' ? 'status-dibatalkan' : 'status-menunggu-verifikasi'
                              }`} style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}>
                                {pay.status_konfirmasi === 'dikonfirmasi' ? 'Dikonfirmasi' :
                                 pay.status_konfirmasi === 'ditolak' ? 'Ditolak' : 'Menunggu Verifikasi'}
                              </span>
                            </td>
                            <td>
                              {pay.bukti_pembayaran ? (
                                <a
                                  href={`/storage/${pay.bukti_pembayaran}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'underline' }}
                                >
                                  Lihat Bukti
                                </a>
                              ) : (
                                '-'
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    Belum ada riwayat pembayaran yang tercatat untuk pemesanan ini.
                  </p>
                )}
              </div>
            </div>

            {/* Modal Footer / Status Updater */}
            <div className="zy-modal-footer">
              <form onSubmit={handleUpdateStatus} className="zy-status-form status-form-normal" style={{ width: '100%' }}>
                <div className="zy-form-group">
                  <label className="zy-form-label" htmlFor="status_pemesanan">Ubah Status Pemesanan:</label>
                  <select
                    id="status_pemesanan"
                    className="zy-form-select"
                    value={selectedOrderStatus}
                    onChange={(e) => setSelectedOrderStatus(e.target.value)}
                  >
                    <option value="menunggu">Menunggu Verifikasi</option>
                    <option value="dikonfirmasi">Dikonfirmasi</option>
                    <option value="selesai">Selesai</option>
                    <option value="dibatalkan">Dibatalkan</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="zy-btn-submit"
                  disabled={isSubmittingStatus || selectedOrderStatus === selectedOrder.status_pemesanan}
                >
                  {isSubmittingStatus ? (
                    <>
                      <span className="zy-spinner" />
                      Menyimpan...
                    </>
                  ) : (
                    'Simpan Perubahan'
                  )}
                </button>
                <button
                  type="button"
                  className="zy-btn-detail"
                  onClick={() => setMouModalTarget({ tipe: 'pemesanan', id: selectedOrder.id_pemesanan, idMou: selectedOrder.mou?.id_mou || null })}
                >
                  Kelola MOU
                </button>
                <button
                  type="button"
                  className="zy-btn-close"
                  onClick={() => setSelectedOrder(null)}
                >
                  Tutup
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Custom Request Detail Modal Overlay */}
      {selectedCustomRequest && (
        <div className="zy-modal-overlay" onClick={() => setSelectedCustomRequest(null)}>
          <div className="zy-modal" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="zy-modal-header">
              <h3>Detail Request Custom: REQ-{String(selectedCustomRequest.id_request).padStart(3, '0')}</h3>
              <button className="zy-modal-close-btn" onClick={() => setSelectedCustomRequest(null)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="zy-modal-body">
              {/* Section 1: Informasi Client */}
              <div className="zy-modal-section">
                <h4 className="zy-modal-section-title">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{color: 'var(--primary)', marginRight: '8px'}}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Informasi Client
                </h4>
                <div className="zy-modal-grid">
                  <div className="zy-modal-field">
                    <span className="zy-field-label">Nama Lengkap</span>
                    <span className="zy-field-val">{selectedCustomRequest.user?.nama || '-'}</span>
                  </div>
                  <div className="zy-modal-field">
                    <span className="zy-field-label">Email</span>
                    <span className="zy-field-val">{selectedCustomRequest.user?.email || '-'}</span>
                  </div>
                  <div className="zy-modal-field">
                    <span className="zy-field-label">No. Telepon / HP</span>
                    <span className="zy-field-val">{selectedCustomRequest.user?.no_hp || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Section 2: Detail Request Event */}
              <div className="zy-modal-section">
                <h4 className="zy-modal-section-title">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{color: 'var(--primary)', marginRight: '8px'}}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Detail Event & Anggaran
                </h4>
                <div className="zy-modal-grid">
                  <div className="zy-modal-field">
                    <span className="zy-field-label">Kategori Event</span>
                    <span className="zy-field-val">
                      {selectedCustomRequest.kategori_event?.nama_kategori || selectedCustomRequest.kategoriEvent?.nama_kategori || (selectedCustomRequest.id_kategori === 1 ? 'Wedding Event' : selectedCustomRequest.id_kategori === 2 ? 'Outbound' : selectedCustomRequest.id_kategori === 3 ? 'Launching Product' : selectedCustomRequest.id_kategori === 4 ? 'Study Field' : selectedCustomRequest.id_kategori === 5 ? 'Birthday Party' : selectedCustomRequest.id_kategori === 6 ? 'Gathering' : '-')}
                    </span>
                  </div>
                  <div className="zy-modal-field">
                    <span className="zy-field-label">Tanggal Pelaksanaan</span>
                    <span className="zy-field-val">{formatIndoDate(selectedCustomRequest.tanggal_acara)}</span>
                  </div>
                  <div className="zy-modal-field">
                    <span className="zy-field-label">Lokasi Acara</span>
                    <span className="zy-field-val">{selectedCustomRequest.lokasi_acara || '-'}</span>
                  </div>
                  <div className="zy-modal-field">
                    <span className="zy-field-label">Jumlah Tamu</span>
                    <span className="zy-field-val">{selectedCustomRequest.jumlah_tamu ? `${selectedCustomRequest.jumlah_tamu} Orang` : '-'}</span>
                  </div>
                  <div className="zy-modal-field">
                    <span className="zy-field-label">Estimasi Budget</span>
                    <span className="zy-field-val" style={{fontWeight: 'bold', color: 'var(--primary)'}}>
                      {formatRupiah(selectedCustomRequest.budget_acara)}
                    </span>
                  </div>
                  <div className="zy-modal-field" style={{ gridColumn: 'span 2' }}>
                    <span className="zy-field-label">Catatan Tambahan Client</span>
                    <span className="zy-field-val" style={{ whiteSpace: 'pre-line' }}>{selectedCustomRequest.catatan || 'Tidak ada catatan khusus.'}</span>
                  </div>
                </div>
              </div>

              {/* Section 3: Daftar Fasilitas Layanan yang Dipilih */}
              <div className="zy-modal-section">
                <h4 className="zy-modal-section-title">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{color: 'var(--primary)', marginRight: '8px'}}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Fasilitas Layanan yang Diminta
                </h4>
                {(selectedCustomRequest.detail_request_custom || selectedCustomRequest.detailRequestCustom) && (selectedCustomRequest.detail_request_custom || selectedCustomRequest.detailRequestCustom).length > 0 ? (
                  <ul className="zy-custom-facilities-list">
                    {(selectedCustomRequest.detail_request_custom || selectedCustomRequest.detailRequestCustom).map((detail) => {
                      const facility = detail.fasilitas_layanan || detail.fasilitasLayanan || detail.fasilitas || {};
                      return (
                        <li key={detail.id_detail_request} className="zy-custom-facilities-item">
                          <span className="zy-facility-bullet">✓</span>
                          <div className="zy-facility-info">
                            <span className="zy-facility-name">{facility.nama_fasilitas || `Fasilitas #${detail.id_fasilitas}`}</span>
                            {detail.keterangan && (
                              <span className="zy-facility-note">Keterangan: {detail.keterangan}</span>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    Tidak ada fasilitas khusus yang dipilih.
                  </p>
                )}
              </div>

              {/* Section 4: Penawaran Harga yang Dikirim */}
              <div className="zy-modal-section">
                <h4 className="zy-modal-section-title">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{color: 'var(--primary)', marginRight: '8px'}}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Proposal Penawaran Harga
                </h4>
                {(selectedCustomRequest.penawaran_custom || selectedCustomRequest.penawaranCustom) && (selectedCustomRequest.penawaran_custom || selectedCustomRequest.penawaranCustom).length > 0 ? (
                  <div className="zy-penawaran-history">
                    {(selectedCustomRequest.penawaran_custom || selectedCustomRequest.penawaranCustom).map((penawaran) => (
                      <div key={penawaran.id_penawaran} className="zy-penawaran-card">
                        <div className="zy-penawaran-header">
                          <span className="zy-penawaran-date">Tanggal Penawaran: {formatIndoDate(penawaran.tanggal_penawaran || penawaran.created_at)}</span>
                          <span className={`zy-status-badge ${
                            penawaran.status_penawaran === 'diterima' ? 'status-selesai-dicek' :
                            penawaran.status_penawaran === 'ditolak' ? 'status-dibatalkan' : 'status-menunggu-verifikasi'
                          }`}>
                            {penawaran.status_penawaran === 'diterima' ? 'Diterima Client' :
                             penawaran.status_penawaran === 'ditolak' ? 'Ditolak Client' : 'Menunggu Review Client'}
                          </span>
                        </div>
                        <div className="zy-penawaran-body-grid">
                          <div className="zy-penawaran-field">
                            <span className="zy-field-label">Total Penawaran</span>
                            <span className="zy-field-val" style={{fontWeight: 'bold', color: 'var(--primary)'}}>{formatRupiah(penawaran.total_penawaran)}</span>
                          </div>
                          <div className="zy-penawaran-field">
                            <span className="zy-field-label">Minimal DP Awal</span>
                            <span className="zy-field-val">{formatRupiah(penawaran.dp_awal)}</span>
                          </div>
                          <div className="zy-penawaran-field" style={{ gridColumn: 'span 2' }}>
                            <span className="zy-field-label">Catatan Admin</span>
                            <span className="zy-field-val" style={{ whiteSpace: 'pre-line' }}>{penawaran.catatan_admin || 'Tidak ada catatan.'}</span>
                          </div>
                        </div>
                        {/* Status Midtrans Pembayaran untuk Penawaran Custom */}
                        <div style={{ marginTop: '1rem', backgroundColor: penawaran.payment_status === 'paid' ? '#f0fdf4' : '#fffbeb', padding: '0.75rem 1rem', borderRadius: '6px', border: `1px solid ${penawaran.payment_status === 'paid' ? '#bbf7d0' : '#fef08a'}` }}>
                          <h5 style={{ margin: 0, fontSize: '0.85rem', color: penawaran.payment_status === 'paid' ? '#166534' : '#854d0e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {penawaran.payment_status === 'paid' ? '✅ Pembayaran DP Midtrans: Lunas' : '⏳ Pembayaran DP Midtrans: Belum Lunas / Pending'}
                          </h5>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '1rem' }}>
                    Belum ada proposal penawaran harga yang diajukan untuk request custom ini.
                  </p>
                )}

                {/* Penawaran Form (Jika belum ada penawaran atau status request adalah diproses / direvisi / menunggu review) */}
                {(!selectedCustomRequest.penawaran_custom || selectedCustomRequest.penawaran_custom.length === 0 || selectedCustomRequest.status_request === 'diproses' || selectedCustomRequest.status_request === 'menunggu') && (
                  <form onSubmit={handleSubmitPenawaran} className="zy-penawaran-form">
                    <h5 className="zy-penawaran-form-title">Buat Proposal Penawaran Baru</h5>
                    <div className="zy-penawaran-form-grid">
                      <div className="zy-form-group">
                        <label className="zy-form-label" htmlFor="total_penawaran">Total Penawaran Harga (Rp):</label>
                        <input
                          type="number"
                          id="total_penawaran"
                          className="zy-filter-input"
                          style={{ padding: '0.65rem 1rem' }}
                          placeholder="Contoh: 15000000"
                          value={totalPenawaran}
                          onChange={(e) => setTotalPenawaran(e.target.value)}
                          required
                          min="0"
                        />
                      </div>
                      <div className="zy-form-group">
                        <label className="zy-form-label" htmlFor="dp_awal">Minimal DP Awal (Rp):</label>
                        <input
                          type="number"
                          id="dp_awal"
                          className="zy-filter-input"
                          style={{ padding: '0.65rem 1rem' }}
                          placeholder="Contoh: 5000000"
                          value={dpAwal}
                          onChange={(e) => setDpAwal(e.target.value)}
                          min="0"
                        />
                      </div>
                      <div className="zy-form-group" style={{ gridColumn: 'span 2' }}>
                        <label className="zy-form-label" htmlFor="catatan_admin">Catatan Admin / Proposal Rincian:</label>
                        <textarea
                          id="catatan_admin"
                          className="zy-filter-input"
                          style={{ padding: '0.65rem 1rem', minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' }}
                          placeholder="Tuliskan rincian fasilitas yang ditawarkan atau catatan penting lainnya..."
                          value={catatanAdmin}
                          onChange={(e) => setCatatanAdmin(e.target.value)}
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="zy-btn-submit"
                      style={{ marginTop: '1rem', width: '100%' }}
                      disabled={isSubmittingPenawaran}
                    >
                      {isSubmittingPenawaran ? (
                        <>
                          <span className="zy-spinner" />
                          Mengirim Penawaran...
                        </>
                      ) : (
                        'Kirim Proposal Penawaran Harga'
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Modal Footer / Status Updater */}
            <div className="zy-modal-footer">
              <form onSubmit={handleUpdateCustomStatus} className="zy-status-form status-form-normal" style={{ width: '100%' }}>
                <div className="zy-form-group">
                  <label className="zy-form-label" htmlFor="status_request">Ubah Status Request Custom:</label>
                  <select
                    id="status_request"
                    className="zy-form-select"
                    value={selectedCustomStatus}
                    onChange={(e) => setSelectedCustomStatus(e.target.value)}
                  >
                    {/* Selalu tampilkan status saat ini agar dropdown tidak blank */}
                    {['menunggu', 'diproses', 'ditawarkan'].includes(selectedCustomRequest.status_request) && (
                      <option value={selectedCustomRequest.status_request}>
                        {selectedCustomRequest.status_request === 'menunggu' ? 'Menunggu Review' :
                         selectedCustomRequest.status_request === 'diproses' ? 'Diproses' : 'Menunggu Penawaran'}
                      </option>
                    )}
                    <option value="diterima">Siap Ditinjau</option>
                    <option value="selesai">Selesai</option>
                    <option value="ditolak">Ditolak</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="zy-btn-submit"
                  disabled={isSubmittingCustomStatus || selectedCustomStatus === selectedCustomRequest.status_request}
                >
                  {isSubmittingCustomStatus ? (
                    <>
                      <span className="zy-spinner" />
                      Menyimpan...
                    </>
                  ) : (
                    'Simpan Perubahan'
                  )}
                </button>
                <button
                  type="button"
                  className="zy-btn-detail"
                  onClick={() => setMouModalTarget({ tipe: 'custom', id: selectedCustomRequest.id_request, idMou: (selectedCustomRequest.dokumenMou || selectedCustomRequest.dokumen_mou)?.id_mou || null })}
                >
                  Kelola MOU
                </button>
                <button
                  type="button"
                  className="zy-btn-close"
                  onClick={() => setSelectedCustomRequest(null)}
                >
                  Tutup
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Package Add/Edit Modal Overlay */}
      {showPackageModal && (
        <div className="zy-modal-overlay" onClick={() => setShowPackageModal(false)}>
          <form
            className="zy-modal"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSavePackage}
          >
            <div className="zy-modal-header">
              <h3>{selectedPackage ? 'Edit Paket Layanan' : 'Tambah Paket Layanan Baru'}</h3>
              <button
                type="button"
                className="zy-modal-close-btn"
                onClick={() => setShowPackageModal(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {selectedPackage && (
              <div style={{ display: 'flex', gap: '0.5rem', padding: '0 1.5rem', borderBottom: '1px solid var(--neutral-light)' }}>
                <button
                  type="button"
                  onClick={() => setPackageModalTab('info')}
                  style={{
                    padding: '0.75rem 0.25rem', background: 'none', border: 'none', cursor: 'pointer',
                    fontWeight: 700, fontSize: '0.9rem',
                    color: packageModalTab === 'info' ? 'var(--primary)' : 'var(--text-muted)',
                    borderBottom: packageModalTab === 'info' ? '2px solid var(--primary)' : '2px solid transparent',
                  }}
                >
                  Info Dasar
                </button>
                <button
                  type="button"
                  onClick={handleOpenPackageFacilitiesTab}
                  style={{
                    padding: '0.75rem 0.25rem', background: 'none', border: 'none', cursor: 'pointer',
                    fontWeight: 700, fontSize: '0.9rem',
                    color: packageModalTab === 'fasilitas' ? 'var(--primary)' : 'var(--text-muted)',
                    borderBottom: packageModalTab === 'fasilitas' ? '2px solid var(--primary)' : '2px solid transparent',
                  }}
                >
                  Fasilitas
                </button>
              </div>
            )}

            <div className="zy-modal-body">
              {packageModalTab === 'info' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="zy-form-group" style={{ minWidth: 'auto' }}>
                  <label className="zy-form-label" htmlFor="nama_paket">Nama Paket *</label>
                  <input
                    type="text"
                    id="nama_paket"
                    className="zy-filter-input"
                    style={{ padding: '0.65rem 1rem' }}
                    placeholder="Contoh: Paket Wedding Bronze"
                    value={packageName}
                    onChange={(e) => setPackageName(e.target.value)}
                    required
                  />
                </div>

                <div className="zy-form-group" style={{ minWidth: 'auto' }}>
                  <label className="zy-form-label" htmlFor="harga">Harga Paket (Rp) *</label>
                  <input
                    type="number"
                    id="harga"
                    className="zy-filter-input"
                    style={{ padding: '0.65rem 1rem' }}
                    placeholder="Contoh: 8000000"
                    value={packagePrice}
                    onChange={(e) => setPackagePrice(e.target.value)}
                    required
                    min="0"
                  />
                </div>

                <div className="zy-form-group" style={{ minWidth: 'auto' }}>
                  <label className="zy-form-label" htmlFor="deskripsi">Deskripsi Paket</label>
                  <textarea
                    id="deskripsi"
                    className="zy-filter-input"
                    style={{ padding: '0.65rem 1rem', minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' }}
                    placeholder="Tuliskan rincian layanan paket (misal: catering, dekorasi, dokumentasi)..."
                    value={packageDesc}
                    onChange={(e) => setPackageDesc(e.target.value)}
                  />
                </div>

                <div className="zy-form-group" style={{ minWidth: 'auto' }}>
                  <label className="zy-form-label" htmlFor="status_paket">Status Paket</label>
                  <select
                    id="status_paket"
                    className="zy-form-select"
                    value={packageStatus}
                    onChange={(e) => setPackageStatus(e.target.value)}
                  >
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Nonaktif</option>
                  </select>
                </div>

                <div className="zy-form-group" style={{ minWidth: 'auto' }}>
                  <label className="zy-form-label" htmlFor="package_foto">Foto Paket (Format: JPG/PNG/WebP, Max 5MB)</label>
                  <input
                    type="file"
                    id="package_foto"
                    className="zy-filter-input"
                    style={{ padding: '0.5rem 1rem' }}
                    accept="image/*"
                    onChange={(e) => setPackageFoto(e.target.files[0] || null)}
                  />
                  {selectedPackage && selectedPackage.foto && !packageFoto && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Foto saat ini: <a href={selectedPackage.foto} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Lihat Foto</a>
                    </div>
                  )}
                </div>
              </div>
              )}

              {packageModalTab === 'fasilitas' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {isLoadingPackageFacilities ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div className="zy-skeleton-line skeleton-row" />
                      <div className="zy-skeleton-line skeleton-row" />
                      <div className="zy-skeleton-line skeleton-row" />
                    </div>
                  ) : packageFacilities.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem 0' }}>
                      Belum ada fasilitas terdaftar untuk kategori ini. Tambahkan fasilitas dulu di menu Kelola Fasilitas.
                    </p>
                  ) : (
                    packageFacilities.map(fac => {
                      const current = selectedPackageFasilitas.find(f => f.id_fasilitas === fac.id_fasilitas);
                      const isChecked = !!current;
                      return (
                        <div
                          key={fac.id_fasilitas}
                          style={{
                            border: `1px solid ${isChecked ? 'var(--primary)' : 'var(--neutral-light)'}`,
                            borderRadius: '8px', padding: '0.85rem 1rem',
                            background: isChecked ? 'rgba(226,154,0,0.05)' : 'transparent',
                          }}
                        >
                          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleTogglePackageFasilitas(fac.id_fasilitas)}
                              style={{ marginTop: '3px' }}
                            />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 700 }}>{fac.nama_fasilitas}</div>
                              {fac.deskripsi && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{fac.deskripsi}</div>}
                            </div>
                          </label>
                          {isChecked && (
                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', paddingLeft: '2rem' }}>
                              <div style={{ width: '90px' }}>
                                <label className="zy-form-label" style={{ fontSize: '0.75rem' }}>Qty</label>
                                <input
                                  type="number"
                                  className="zy-filter-input"
                                  style={{ padding: '0.4rem 0.6rem' }}
                                  min="1"
                                  value={current.qty}
                                  onChange={(e) => handlePackageFasilitasFieldChange(fac.id_fasilitas, 'qty', e.target.value)}
                                  onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                                />
                              </div>
                              <div style={{ flex: 1 }}>
                                <label className="zy-form-label" style={{ fontSize: '0.75rem' }}>Keterangan (opsional)</label>
                                <input
                                  type="text"
                                  className="zy-filter-input"
                                  style={{ padding: '0.4rem 0.6rem' }}
                                  placeholder="Contoh: kapasitas 10 meja"
                                  value={current.keterangan}
                                  onChange={(e) => handlePackageFasilitasFieldChange(fac.id_fasilitas, 'keterangan', e.target.value)}
                                  onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            <div className="zy-modal-footer">
              {packageModalTab === 'info' ? (
                <>
                  <button
                    type="submit"
                    className="zy-btn-submit"
                    disabled={isSubmittingPackage}
                  >
                    {isSubmittingPackage ? (
                      <>
                        <span className="zy-spinner" />
                        Menyimpan...
                      </>
                    ) : (
                      'Simpan'
                    )}
                  </button>
                  <button
                    type="button"
                    className="zy-btn-close"
                    onClick={() => setShowPackageModal(false)}
                  >
                    Batal
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="zy-btn-submit"
                    disabled={isSubmittingPackageFacilities || isLoadingPackageFacilities}
                    onClick={handleSaveFasilitasPaket}
                  >
                    {isSubmittingPackageFacilities ? (
                      <>
                        <span className="zy-spinner" />
                        Menyimpan...
                      </>
                    ) : (
                      'Simpan Fasilitas'
                    )}
                  </button>
                  <button
                    type="button"
                    className="zy-btn-close"
                    onClick={() => setShowPackageModal(false)}
                  >
                    Tutup
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Category Add/Edit Modal Overlay */}
      {showCategoryModal && (
        <div className="zy-modal-overlay" onClick={() => setShowCategoryModal(false)}>
          <form
            className="zy-modal"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSaveCategory}
          >
            <div className="zy-modal-header">
              <h3>{selectedCategory ? 'Edit Kategori Event' : 'Tambah Kategori Event Baru'}</h3>
              <button
                type="button"
                className="zy-modal-close-btn"
                onClick={() => setShowCategoryModal(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="zy-modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="zy-form-group" style={{ minWidth: 'auto' }}>
                  <label className="zy-form-label" htmlFor="nama_kategori">Nama Kategori *</label>
                  <input
                    type="text"
                    id="nama_kategori"
                    className="zy-filter-input"
                    style={{ padding: '0.65rem 1rem' }}
                    placeholder="Contoh: Gathering"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    required
                  />
                </div>

                <div className="zy-form-group" style={{ minWidth: 'auto' }}>
                  <label className="zy-form-label" htmlFor="deskripsi_kategori">Deskripsi Kategori</label>
                  <textarea
                    id="deskripsi_kategori"
                    className="zy-filter-input"
                    style={{ padding: '0.65rem 1rem', minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' }}
                    placeholder="Tuliskan rincian deskripsi kategori event..."
                    value={categoryDesc}
                    onChange={(e) => setCategoryDesc(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="zy-modal-footer">
              <button
                type="submit"
                className="zy-btn-submit"
                disabled={isSubmittingCategory}
              >
                {isSubmittingCategory ? (
                  <>
                    <span className="zy-spinner" />
                    Menyimpan...
                  </>
                ) : (
                  'Simpan'
                )}
              </button>
              <button
                type="button"
                className="zy-btn-close"
                onClick={() => setShowCategoryModal(false)}
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Facility Add/Edit Modal Overlay */}
      {showFacilityModal && (
        <div className="zy-modal-overlay" onClick={() => setShowFacilityModal(false)}>
          <form
            className="zy-modal"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSaveFacility}
          >
            <div className="zy-modal-header">
              <h3>{selectedFacility ? 'Edit Fasilitas Layanan' : 'Tambah Fasilitas Layanan Baru'}</h3>
              <button
                type="button"
                className="zy-modal-close-btn"
                onClick={() => setShowFacilityModal(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="zy-modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="zy-form-group" style={{ minWidth: 'auto' }}>
                  <label className="zy-form-label" htmlFor="nama_fasilitas">Nama Fasilitas *</label>
                  <input
                    type="text"
                    id="nama_fasilitas"
                    className="zy-filter-input"
                    style={{ padding: '0.65rem 1rem' }}
                    placeholder="Contoh: Sound System 5000W"
                    value={facilityName}
                    onChange={(e) => setFacilityName(e.target.value)}
                    required
                  />
                </div>

                <div className="zy-form-group" style={{ minWidth: 'auto' }}>
                  <label className="zy-form-label" htmlFor="deskripsi_fasilitas">Deskripsi Fasilitas</label>
                  <textarea
                    id="deskripsi_fasilitas"
                    className="zy-filter-input"
                    style={{ padding: '0.65rem 1rem', minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' }}
                    placeholder="Tuliskan rincian deskripsi fasilitas..."
                    value={facilityDesc}
                    onChange={(e) => setFacilityDesc(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="zy-modal-footer">
              <button
                type="submit"
                className="zy-btn-submit"
                disabled={isSubmittingFacility}
              >
                {isSubmittingFacility ? (
                  <>
                    <span className="zy-spinner" />
                    Menyimpan...
                  </>
                ) : (
                  'Simpan'
                )}
              </button>
              <button
                type="button"
                className="zy-btn-close"
                onClick={() => setShowFacilityModal(false)}
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Gallery Add/Edit Modal Overlay */}
      {showGalleryModal && (
        <div className="zy-modal-overlay" onClick={() => setShowGalleryModal(false)}>
          <form
            className="zy-modal"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSaveGallery}
          >
            <div className="zy-modal-header">
              <h3>{selectedGallery ? 'Edit Galeri Event' : 'Tambah Galeri Event Baru'}</h3>
              <button
                type="button"
                className="zy-modal-close-btn"
                onClick={() => setShowGalleryModal(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="zy-modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="zy-form-group" style={{ minWidth: 'auto' }}>
                  <label className="zy-form-label" htmlFor="gallery_judul">Judul Galeri *</label>
                  <input
                    type="text"
                    id="gallery_judul"
                    className="zy-filter-input"
                    style={{ padding: '0.65rem 1rem' }}
                    placeholder="Contoh: Wedding Event Luxury"
                    value={galleryTitle}
                    onChange={(e) => setGalleryTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="zy-form-group" style={{ minWidth: 'auto' }}>
                  <label className="zy-form-label" htmlFor="gallery_deskripsi">Deskripsi Galeri</label>
                  <textarea
                    id="gallery_deskripsi"
                    className="zy-filter-input"
                    style={{ padding: '0.65rem 1rem', minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' }}
                    placeholder="Tuliskan rincian dokumentasi event..."
                    value={galleryDesc}
                    onChange={(e) => setGalleryDesc(e.target.value)}
                  />
                </div>

                <div className="zy-form-group" style={{ minWidth: 'auto' }}>
                  <label className="zy-form-label" htmlFor="gallery_urutan">Urutan Tampil</label>
                  <input
                    type="number"
                    id="gallery_urutan"
                    className="zy-filter-input"
                    style={{ padding: '0.65rem 1rem' }}
                    placeholder="Contoh: 1"
                    value={galleryOrder}
                    onChange={(e) => setGalleryOrder(e.target.value)}
                    min="0"
                  />
                </div>

                <div className="zy-form-group" style={{ minWidth: 'auto' }}>
                  <label className="zy-form-label" htmlFor="gallery_tanggal">Tanggal Event *</label>
                  <input
                    type="date"
                    id="gallery_tanggal"
                    className="zy-filter-input"
                    style={{ padding: '0.65rem 1rem' }}
                    value={galleryTanggal}
                    onChange={(e) => setGalleryTanggal(e.target.value)}
                    required
                  />
                </div>

                <div className="zy-form-group" style={{ minWidth: 'auto' }}>
                  <label className="zy-form-label" htmlFor="gallery_foto">Foto Galeri (Format: JPG/PNG/WebP, Max 5MB)</label>
                  <input
                    type="file"
                    id="gallery_foto"
                    className="zy-filter-input"
                    style={{ padding: '0.5rem 1rem' }}
                    accept="image/*"
                    onChange={(e) => setGalleryFoto(e.target.files[0] || null)}
                    required={!selectedGallery}
                  />
                  {selectedGallery && selectedGallery.foto && !galleryFoto && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Foto saat ini: <a href={selectedGallery.foto.startsWith('http') ? selectedGallery.foto : `/storage/${selectedGallery.foto}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Lihat Foto</a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="zy-modal-footer">
              <button
                type="submit"
                className="zy-btn-submit"
                disabled={isSubmittingGallery}
              >
                {isSubmittingGallery ? (
                  <>
                    <span className="zy-spinner" />
                    Menyimpan...
                  </>
                ) : (
                  'Simpan'
                )}
              </button>
              <button
                type="button"
                className="zy-btn-close"
                onClick={() => setShowGalleryModal(false)}
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {mouModalTarget && (
        <MouManageModal
          tipe={mouModalTarget.tipe}
          id={mouModalTarget.id}
          idMou={mouModalTarget.idMou}
          onClose={() => setMouModalTarget(null)}
          onChanged={() => {
            if (mouModalTarget.tipe === 'pemesanan') {
              handleShowDetail(mouModalTarget.id);
              fetchOrders(orderSearch, orderStatusFilter);
            } else {
              handleShowCustomDetail(mouModalTarget.id);
              fetchCustomRequests(customSearch, customStatusFilter);
            }
          }}
        />
      )}
    </div>
  );
}
