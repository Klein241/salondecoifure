import React, { useState, useEffect } from "react"
import { 
  LayoutDashboard, Calendar, Users, Scissors, Award, Settings, 
  Check, X, Trash2, Search, Download, Plus, Edit, RefreshCw, BarChart2, Eye, User, Tag, Image, Gem,
  Package, ShoppingBag
} from "lucide-react"
import AdminFidelite from "./AdminFidelite"
import { useConfirm } from "./ConfirmModal"
import { getOrdersAdmin } from "../fidelite"
import StockManager from "./StockManager"
import { QRCodeSection } from "./QRCodeGenerator"
import TresorerieWidget from "./TresorerieWidget"
import { 
  getAppointments, updateAppointmentStatus, deleteAppointment,
  getServices, addService, updateService, deleteService,
  getStaff, addStaff, deleteStaff,
  getAffiliates, saveAffiliate, supabase,
  getPromoCodes, createPromoCode, updatePromoCode, deletePromoCode,
  uploadImage, addGalleryImage, deleteGalleryImage, getGalleryImages,
  getProducts, addProduct, updateProduct, deleteProduct,
  getSiteSettings, updateSiteSettings
} from "../supabase"

export default function Admin({ currentUser, onLogout }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [affiliates, setAffiliates] = useState([]);
  const [promoCodes, setPromoCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const confirm = useConfirm();
  const [message, setMessage] = useState({ text: "", type: "" });

  // Filter & Search states
  const [appSearch, setAppSearch] = useState("");
  const [appFilter, setAppFilter] = useState("Tous");
  const [clientSearch, setClientSearch] = useState("");
  const [serviceSearch, setServiceSearch] = useState("");
  const [affSearch, setAffSearch] = useState("");
  const [promoSearch, setPromoSearch] = useState("");

  const [showPromoForm, setShowPromoForm] = useState(false);
  const [promoForm, setPromoForm] = useState({ code: "", clientName: "", discountPercent: 20, maxUses: 1, promoType: "unique" });

  // Modals / Forms states
  const [selectedClient, setSelectedClient] = useState(null);
  const [showClientModal, setShowClientModal] = useState(false);
  
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceForm, setServiceForm] = useState({ id: "", name: "", price: "", duration: "", category: "Visage & Corps", description: "", benefits: "" });

  const [showStaffForm, setShowStaffForm] = useState(false);
  const [staffForm, setStaffForm] = useState({ id: "", name: "", role: "", avatar: "" });

  // Calendar toggle
  const [isCalendarView, setIsCalendarView] = useState(false);

  // Gallery states
  const [galleryImages, setGalleryImages] = useState([]);
  const [showGalleryForm, setShowGalleryForm] = useState(false);
  const [galleryForm, setGalleryForm] = useState({ title: "", description: "", category: "Salon" });
  const [galleryUploadFiles, setGalleryUploadFiles] = useState([]);
  const [galleryUploadPreviews, setGalleryUploadPreviews] = useState([]);
  const [galleryUploading, setGalleryUploading] = useState(false);


  // Products (boutique) states
  const [products, setProducts] = useState([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({ name: '', description: '', price: '', category: 'Soin', image_url: '', in_stock: true, payable_with_credits: false, credit_discount_pct: 20 });
  const [productImageFile, setProductImageFile] = useState(null);
  const [productImagePreview, setProductImagePreview] = useState('');
  const [productUploading, setProductUploading] = useState(false);

  // Site settings state
  const [siteSettings, setSiteSettings] = useState({ site_name: 'The Alpha Beauty', address: 'Alibadeng, Gabon', phone: '+241 077 00 40 73', whatsapp: '+241077004073', logo_url: '', favicon_url: '', allow_specialist_selection: true, promo_banner: '', promo_banner_active: true });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [faviconFile, setFaviconFile] = useState(null);

  // Service image upload states
  const [serviceImageFile, setServiceImageFile] = useState(null);
  const [serviceImagePreview, setServiceImagePreview] = useState("");

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const apps = await getAppointments();
      setAppointments(apps || []);

      const affs = await getAffiliates();
      setAffiliates(affs || []);

      const servs = await getServices();
      setServices(servs || []);

      const stf = await getStaff();
      setStaff(stf || []);

      const promos = await getPromoCodes();
      setPromoCodes(promos || []);

      // Load gallery images
      const gallery = await getGalleryImages();
      setGalleryImages(gallery || []);

      // Load products (boutique)
      const prods = await getProducts();
      setProducts(prods || []);

      // Load site settings
      const settings = await getSiteSettings();
      if (settings) {
        setSiteSettings(settings);
      }

      // Load clients from profiles table in Supabase
      if (supabase) {
        const { data: profiles, error } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false });
        if (!error && profiles) {
          setClients(profiles);
        }
      } else {
        // Local fallback clients from local appointments or mock
        const uniqueClients = [];
        const seen = new Set();
        apps.forEach(app => {
          if (!seen.has(app.clientEmail.toLowerCase())) {
            seen.add(app.clientEmail.toLowerCase());
            uniqueClients.push({
              name: app.clientName,
              email: app.clientEmail,
              phone: app.clientPhone,
              role: "client"
            });
          }
        });
        setClients(uniqueClients);
      }
    } catch (e) {
      console.error("Error loading data:", e);
      setMessage({ text: "Erreur de chargement des données.", type: "error" });
    }
    setLoading(false);
  };

  const handleConfirmApp = async (id) => {
    await updateAppointmentStatus(id, "Confirmé");
    setMessage({ text: "Rendez-vous confirmé !", type: "success" });
    loadAllData();
  };

  const handleCancelApp = async (id) => {
    await updateAppointmentStatus(id, "Annulé");
    setMessage({ text: "Rendez-vous annulé.", type: "success" });
    loadAllData();
  };

  const handleDeleteApp = async (id) => {
    const ok = await confirm({ title: "Supprimer ce rendez-vous", message: "Cette action est irréversible.", confirmLabel: "Supprimer", danger: true });
    if (!ok) return;
    await deleteAppointment(id);
    setMessage({ text: "Rendez-vous supprimé.", type: "success" });
    loadAllData();
  };

  const handlePromoteClient = async (id, newRole) => {
    const ok = await confirm({ title: "Changer le role", message: `Attribuer le role "${newRole}" a ce client ?`, confirmLabel: "Confirmer", danger: false });
    if (!ok) return;
    if (supabase) {
      const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", id);
      if (error) {
        setMessage({ text: "Erreur de mise é jour du réle.", type: "error" });
        return;
      }
    }
    setMessage({ text: `Le client a maintenant le réle ${newRole}.`, type: "success" });
    loadAllData();
  };

  const handleDeleteClient = async (id, email) => {
    const ok = await confirm({ title: "Supprimer ce client", message: "Le profil sera definitivement supprime.", confirmLabel: "Supprimer", danger: true });
    if (!ok) return;
    if (supabase) {
      const { error } = await supabase.from("profiles").delete().eq("id", id);
      if (error) {
        setMessage({ text: "Erreur de suppression du profil.", type: "error" });
        return;
      }
    }
    setMessage({ text: "Client supprimé avec succés.", type: "success" });
    loadAllData();
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    let image_url = serviceForm.image_url || null;
    if (serviceImageFile) {
      setMessage({ text: "Upload image en cours...", type: "info" });
      const uploaded = await uploadImage(serviceImageFile, "service-images");
      if (uploaded) image_url = uploaded;
    }
    const formatted = {
      ...serviceForm,
      price: Number(serviceForm.price),
      benefits: serviceForm.benefits.split(",").map(b => b.trim()).filter(Boolean),
      image_url
    };
    if (editingService) {
      await updateService(editingService.id, formatted);
      setMessage({ text: "Soin mis é jour avec succés !", type: "success" });
    } else {
      const id = formatted.name.toLowerCase().replace(/\s+/g, "-") + "-" + Math.floor(100 + Math.random() * 900);
      await addService({ ...formatted, id });
      setMessage({ text: "Soin ajouté avec succés !", type: "success" });
    }
    setShowServiceForm(false);
    setEditingService(null);
    setServiceForm({ id: "", name: "", price: "", duration: "", category: "Visage & Corps", description: "", benefits: "", image_url: "" });
    setServiceImageFile(null);
    setServiceImagePreview("");
    loadAllData();
  };

  const handleEditService = (service) => {
    setEditingService(service);
    setServiceForm({
      id: service.id,
      name: service.name,
      price: service.price,
      duration: service.duration,
      category: service.category,
      description: service.description,
      benefits: Array.isArray(service.benefits) ? service.benefits.join(", ") : (service.benefits || ""),
      image_url: service.image_url || ""
    });
    setServiceImagePreview(service.image_url || "");
    setServiceImageFile(null);
    setShowServiceForm(true);
  };

  const handleDeleteService = async (id) => {
    const ok = await confirm({ title: "Supprimer ce soin", message: "Ce soin sera supprimé définitivement du catalogue.", confirmLabel: "Supprimer", danger: true });
    if (!ok) return;
    await deleteService(id);
    setMessage({ text: "Soin supprimé.", type: "success" });
    loadAllData();
  };

  const handleSaveStaff = async (e) => {
    e.preventDefault();
    const id = staffForm.name.toLowerCase().replace(/\s+/g, "-") + "-" + Math.floor(100 + Math.random() * 900);
    const member = {
      id,
      name: staffForm.name,
      role: staffForm.role,
      rating: 5.0,
      avatar: staffForm.avatar || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150"
    };
    await addStaff(member);
    setMessage({ text: "Praticien ajouté !", type: "success" });
    setShowStaffForm(false);
    setStaffForm({ id: "", name: "", role: "", avatar: "" });
    loadAllData();
  };

  const handleDeleteStaff = async (id) => {
    const ok = await confirm({ title: "Supprimer ce praticien", message: "Ce praticien sera supprimé définitivement.", confirmLabel: "Supprimer", danger: true });
    if (!ok) return;
    await deleteStaff(id);
    setMessage({ text: "Praticien supprimé.", type: "success" });
    loadAllData();
  };

  const handleAdjustPoints = async (email, currentPoints) => {
    const amountStr = window.prompt("Saisissez le nouveau solde de points pour cet affilié :", currentPoints);
    if (amountStr === null) return;
    const amount = parseInt(amountStr, 10);
    if (isNaN(amount)) {
      alert("Veuillez saisir un nombre valide.");
      return;
    }

    const match = affiliates.find(a => a.clientEmail.toLowerCase() === email.toLowerCase());
    if (match) {
      const updated = { ...match, pointsEarned: amount };
      await saveAffiliate(updated);
      setMessage({ text: "Points mis é jour !", type: "success" });
      loadAllData();
    }
  };

  const handleExportCSV = () => {
    let csv = "ID,Client,Email,Soin,Praticien,Date,Heure,Prix,Statut\n";
    appointments.forEach(app => {
      csv += `"${app.id}","${app.clientName}","${app.clientEmail}","${app.serviceName}","${app.staffName}","${app.date}","${app.time}",${app.price},"${app.status}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `alpha_beauty_reservations_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setMessage({ text: "Exportation CSV réussie !", type: "success" });
  };

  const handleResetDb = async () => {
    const ok = await confirm({ title: "Reinitialiser les donnees", message: "Toutes les donnees de test seront supprimees. Action irreversible.", confirmLabel: "Reinitialiser", danger: true });
    if (!ok) return;
    localStorage.clear();
    if (supabase) {
      await supabase.from("appointments").delete().neq("id", "none");
      await supabase.from("affiliates").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("promo_codes").delete().neq("code", "none");
    }
    setMessage({ text: "Base de données réinitialisée !", type: "success" });
    loadAllData();
  };

  const handleSavePromo = async (e) => {
    e.preventDefault();
    if (!promoForm.code || !promoForm.clientName) {
      setMessage({ text: "Veuillez remplir tous les champs.", type: "error" });
      return;
    }
    const newPromo = {
      code: promoForm.code.toUpperCase(),
      clientName: promoForm.clientName,
      discountPercent: promoForm.discountPercent,
      maxUses: promoForm.maxUses,
      currentUses: 0,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    await createPromoCode(newPromo);
    setMessage({ text: "Code promo généré avec succés !", type: "success" });
    setShowPromoForm(false);
    setPromoForm({ code: "", clientName: "", discountPercent: 20, maxUses: 1, promoType: "unique" });
    loadAllData();
  };

  // Stat calculations
  const confirmedApps = appointments.filter(app => app.status === "Confirmé" || app.status === "En attente");
  const totalCA = confirmedApps.reduce((sum, curr) => sum + curr.price, 0);
  const activeReferralsCount = affiliates.reduce((sum, curr) => sum + (curr.totalReferrals || 0), 0);

  // SVG Chart calculation for last 7 days
  const getRevenueForLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const rev = appointments
        .filter(app => app.date === dateStr && (app.status === "Confirmé" || app.status === "En attente"))
        .reduce((sum, curr) => sum + curr.price, 0);
      
      const options = { weekday: "short", day: "numeric" };
      days.push({
        label: d.toLocaleDateString("fr-FR", options),
        value: rev
      });
    }
    return days;
  };

  const chartData = getRevenueForLast7Days();
  const maxChartValue = Math.max(...chartData.map(d => d.value), 50000);

  // Filters logic
  const filteredAppointments = appointments.filter(app => {
    const matchStatus = appFilter === "Tous" || app.status === appFilter;
    const matchSearch = 
      app.clientName.toLowerCase().includes(appSearch.toLowerCase()) ||
      app.serviceName.toLowerCase().includes(appSearch.toLowerCase()) ||
      app.id.toLowerCase().includes(appSearch.toLowerCase());
    return matchStatus && matchSearch;
  });

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
    c.email.toLowerCase().includes(clientSearch.toLowerCase())
  );


  // ---------- GALLERY HANDLERS ----------
  const handleGalleryFilesChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 8);
    setGalleryUploadFiles(files);
    const previews = [];
    files.forEach(f => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        previews.push(ev.target.result);
        if (previews.length === files.length) setGalleryUploadPreviews([...previews]);
      };
      reader.readAsDataURL(f);
    });
    if (files.length === 0) setGalleryUploadPreviews([]);
  };

  const handleServiceImageChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setServiceImageFile(f);
      const reader = new FileReader();
      reader.onload = (ev) => setServiceImagePreview(ev.target.result);
      reader.readAsDataURL(f);
    }
  };

  const handleAddGalleryImage = async (e) => {
    e.preventDefault();
    if (galleryUploadFiles.length === 0) {
      setMessage({ text: "Veuillez choisir au moins une image.", type: "error" });
      return;
    }
    setGalleryUploading(true);
    let successCount = 0;
    for (let i = 0; i < galleryUploadFiles.length; i++) {
      const file = galleryUploadFiles[i];
      setMessage({ text: `Upload ${i + 1}/${galleryUploadFiles.length}...`, type: "info" });
      const uploaded = await uploadImage(file, "gallery");
      if (uploaded) {
        const angle = galleryUploadFiles.length > 1 ? " (vue " + (i + 1) + "/" + galleryUploadFiles.length + ")" : "";
        await addGalleryImage({
          title: galleryForm.title + angle,
          description: galleryForm.description,
          category: galleryForm.category,
          image_url: uploaded
        });
        successCount++;
      }
    }
    if (successCount > 0) {
      setMessage({ text: successCount + " image(s) publiee(s) dans la galerie !", type: "success" });
    } else {
      setMessage({ text: "Echec de upload. Verifiez les politiques Supabase Storage.", type: "error" });
    }
    setGalleryForm({ title: "", description: "", category: "Salon" });
    setGalleryUploadFiles([]);
    setGalleryUploadPreviews([]);
    setShowGalleryForm(false);
    setGalleryUploading(false);
    loadAllData();
  };

    const handleProductImageChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setProductImageFile(f);
      const reader = new FileReader();
      reader.onload = (ev) => setProductImagePreview(ev.target.result);
      reader.readAsDataURL(f);
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setProductUploading(true);
    let image_url = productForm.image_url || null;
    if (productImageFile) {
      setMessage({ text: 'Upload image produit...', type: 'info' });
      const uploaded = await uploadImage(productImageFile, 'product-images');
      if (uploaded) image_url = uploaded;
    }
    const formatted = { ...productForm, price: Number(productForm.price), image_url };
    if (editingProduct) {
      const result = await updateProduct(editingProduct.id, formatted);
      if (result) setMessage({ text: 'Produit mis a jour !', type: 'success' });
      else setMessage({ text: 'Erreur lors de la mise a jour.', type: 'error' });
    } else {
      const result = await addProduct(formatted);
      if (result) setMessage({ text: 'Produit ajoute !', type: 'success' });
      else setMessage({ text: 'Erreur lors de l\'ajout.', type: 'error' });
    }
    setShowProductForm(false);
    setEditingProduct(null);
    setProductForm({ name: '', description: '', price: '', category: 'Soin', image_url: '', in_stock: true, payable_with_credits: false, credit_discount_pct: 20 });
    setProductImageFile(null);
    setProductImagePreview('');
    setProductUploading(false);
    loadAllData();
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      category: product.category || 'Soin',
      image_url: product.image_url || '',
      in_stock: product.in_stock !== false,
      payable_with_credits: product.payable_with_credits || false,
      credit_discount_pct: product.credit_discount_pct || 20
    });
    setProductImagePreview(product.image_url || '');
    setProductImageFile(null);
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (id) => {
    const ok = await confirm({ title: "Supprimer ce produit", message: "Ce produit sera retiré de la boutique.", confirmLabel: "Supprimer", danger: true });
    if (!ok) return;
    await deleteProduct(id);
    setMessage({ text: 'Produit supprime.', type: 'success' });
    loadAllData();
  };

  const handleSaveSiteSettings = async (e) => {
    e.preventDefault();
    setSettingsSaving(true);
    let updates = { ...siteSettings };
    if (logoFile) {
      setMessage({ text: 'Upload logo...', type: 'info' });
      const url = await uploadImage(logoFile, 'site-assets');
      if (url) updates.logo_url = url;
    }
    if (faviconFile) {
      setMessage({ text: 'Upload favicon...', type: 'info' });
      const url = await uploadImage(faviconFile, 'site-assets');
      if (url) updates.favicon_url = url;
    }
    const result = await updateSiteSettings(updates);
    if (result) {
      setMessage({ text: 'Parametres du site sauvegardes !', type: 'success' });
      setSiteSettings({ ...siteSettings, ...updates });
    } else {
      setMessage({ text: 'Erreur lors de la sauvegarde.', type: 'error' });
    }
    setLogoFile(null);
    setFaviconFile(null);
    setSettingsSaving(false);
  };

  const handleDeleteGalleryImage = async (id, image_url) => {
    const ok = await confirm({ title: "Supprimer cette image", message: "Cette image sera supprimée de la galerie et du stockage.", confirmLabel: "Supprimer", danger: true });
    if (!ok) return;
    await deleteGalleryImage(id, image_url);
    setMessage({ text: "Image supprimee.", type: "success" });
    loadAllData();
  };

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(serviceSearch.toLowerCase()) ||
    s.category.toLowerCase().includes(serviceSearch.toLowerCase())
  );

  const filteredAffiliates = affiliates.filter(a => 
    a.clientEmail.toLowerCase().includes(affSearch.toLowerCase()) ||
    a.code.toLowerCase().includes(affSearch.toLowerCase())
  );

  const filteredPromoCodes = promoCodes.filter(p => 
    p.code.toLowerCase().includes(promoSearch.toLowerCase()) ||
    p.clientName.toLowerCase().includes(promoSearch.toLowerCase())
  );

  // Date grouping for Calendar view
  const getGroupedAppointments = () => {
    const groups = {};
    filteredAppointments.forEach(app => {
      if (!groups[app.date]) groups[app.date] = [];
      groups[app.date].push(app);
    });
    return Object.entries(groups).sort((a, b) => new Date(a[0]) - new Date(b[0]));
  };

  return (
    <section id="admin" style={{ padding: "100px 24px", background: "#0b0b0b", minHeight: "100vh" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* Banner */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "35px", flexWrap: "wrap", gap: "20px" }}>
          <div>
            <span style={{ fontSize: "0.8rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--primary-gold)", fontWeight: "600" }}>
              CONSOLE ADMINISTRATIVE (Supabase)
            </span>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", marginTop: "4px" }}>Tableau de Bord & Gestion</h2>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={loadAllData} className="btn-outline" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", padding: "8px 14px" }}>
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> {loading ? "Mise é jour..." : "Rafraéchir"}
            </button>
            {onLogout && (
              <button onClick={onLogout} className="btn-outline" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", padding: "8px 14px", border: "1px solid rgba(255, 69, 0, 0.3)", color: "#ff6b6b" }}>
                <X size={14} /> Déconnexion
              </button>
            )}
          </div>
        </div>

        {message.text && (
          <div className="glass-panel" style={{ padding: "12px", borderLeft: "4px solid var(--primary-gold)", marginBottom: "25px", color: message.type === "error" ? "#FF4500" : "#228B22" }}>
            {message.text}
          </div>
        )}

        {/* Tab Navigation */}
        <div style={{ 
          display: "flex", 
          borderBottom: "1px solid rgba(255,255,255,0.08)", 
          marginBottom: "35px", 
          overflowX: "auto", 
          gap: "8px", 
          position: "sticky", 
          top: "80px", 
          background: "#0b0b0b", 
          zIndex: 100,
          paddingBottom: "8px"
        }}>
          {[
            { id: "dashboard", label: "Tableau de Bord", icon: LayoutDashboard },
            { id: "appointments", label: "Rendez-vous", icon: Calendar },
            { id: "clients", label: "Clients", icon: Users },
            { id: "services", label: "Services (CRUD)", icon: Scissors },
            { id: "boutique", label: "Boutique", icon: ShoppingBag },
            { id: "stock", label: "Stock", icon: Package },
            { id: "gallery", label: "Galerie", icon: Image },
            { id: "promo_codes", label: "Codes Promo", icon: Tag },
            { id: "affiliates", label: "Affiliés", icon: Award },
            { id: "fidelite", label: "Fidélité", icon: Gem },
            { id: "settings", label: "Paramètres", icon: Settings }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 20px",
                border: "none",
                background: activeTab === tab.id ? "rgba(212,175,55,0.12)" : "transparent",
                color: activeTab === tab.id ? "var(--primary-gold)" : "var(--text-secondary)",
                borderRadius: "4px",
                fontSize: "0.85rem",
                fontWeight: "600",
                cursor: "pointer",
                borderBottom: activeTab === tab.id ? "2px solid var(--primary-gold)" : "none",
                whiteSpace: "nowrap",
                transition: "all 0.3s ease"
              }}
            >
              <tab.icon size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: DASHBOARD */}
        {activeTab === "dashboard" && (
          <div>
            {/* Stats Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "40px" }}>
              <div className="glass-panel" style={{ padding: "24px", border: "1px solid rgba(212,175,55,0.12)" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase" }}>Chiffre d'Affaires</span>
                <h3 style={{ fontSize: "2rem", color: "var(--primary-gold)", marginTop: "8px" }}>{totalCA.toLocaleString("fr-FR")} F</h3>
                <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginTop: "4px" }}>Total des rendez-vous confirmés ou en attente</p>
              </div>
              <div className="glass-panel" style={{ padding: "24px", border: "1px solid rgba(212,175,55,0.12)" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase" }}>Rendez-vous Actifs</span>
                <h3 style={{ fontSize: "2rem", marginTop: "8px" }}>{confirmedApps.length}</h3>
                <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginTop: "4px" }}>Rendez-vous en cours et non annulés</p>
              </div>
              <div className="glass-panel" style={{ padding: "24px", border: "1px solid rgba(212,175,55,0.12)" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase" }}>Clients Enregistrés</span>
                <h3 style={{ fontSize: "2rem", marginTop: "8px" }}>{clients.length}</h3>
                <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginTop: "4px" }}>Profils uniques en base de données</p>
              </div>
              <div className="glass-panel" style={{ padding: "24px", border: "1px solid rgba(212,175,55,0.12)" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase" }}>Parrainages Totaux</span>
                <h3 style={{ fontSize: "2rem", color: "var(--primary-gold)", marginTop: "8px" }}>{activeReferralsCount}</h3>
                <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginTop: "4px" }}>Codes de parrainage appliqués</p>
              </div>
            </div>

            {/* Dashboard Graphs & Recents Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "30px", flexWrap: "wrap" }}>
              {/* SVG Revenue Chart */}
              <div className="glass-panel" style={{ padding: "30px", border: "1px solid rgba(255,255,255,0.06)" }}>
                <h3 style={{ fontSize: "1.2rem", marginBottom: "24px" }} className="gold-text">Chiffre d'affaires des 7 derniers jours</h3>
                
                {/* SVG pure representation */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", height: "200px", paddingBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                  {chartData.map((d, index) => {
                    const pct = (d.value / maxChartValue) * 100;
                    return (
                      <div key={`slot-${index}`} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "12%", height: "100%", justifyContent: "flex-end" }}>
                        <div style={{ fontSize: "0.7rem", color: "var(--primary-gold)", marginBottom: "4px", fontWeight: "700" }}>
                          {d.value > 0 ? `${(d.value / 1000)}k` : ""}
                        </div>
                        <div style={{
                          width: "100%",
                          height: `${pct}%`,
                          background: "var(--gold-grad)",
                          borderRadius: "4px 4px 0 0",
                          transition: "height 0.8s ease",
                          boxShadow: "0 0 15px rgba(212,175,55,0.3)"
                        }} />
                        <span style={{ fontSize: "0.68rem", color: "var(--text-secondary)", marginTop: "8px", textAlign: "center", whiteSpace: "nowrap" }}>
                          {d.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Popular services or practitioner rankings */}
              <div className="glass-panel" style={{ padding: "30px", border: "1px solid rgba(255,255,255,0.06)" }}>
                <h3 style={{ fontSize: "1.2rem", marginBottom: "20px" }} className="gold-text">Popularité des Soins</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {services.slice(0, 4).map(s => {
                    const count = appointments.filter(app => app.serviceId === s.id).length;
                    const totalCount = appointments.length || 1;
                    const pct = (count / totalCount) * 100;
                    return (
                      <div key={s.id}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "6px" }}>
                          <span>{s.name}</span>
                          <span style={{ color: "var(--primary-gold)", fontWeight: "700" }}>{count} rdv ({Math.round(pct)}%)</span>
                        </div>
                        <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "3px" }}>
                          <div style={{ width: `${pct}%`, height: "100%", background: "var(--gold-grad)", borderRadius: "3px" }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: APPOINTMENTS */}
        {activeTab === "appointments" && (
          <div>
            {/* Toolbar */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
              <div style={{ display: "flex", gap: "8px" }}>
                {["Tous", "En attente", "Confirmé", "Annulé"].map(status => (
                  <button
                    key={status}
                    onClick={() => setAppFilter(status)}
                    style={{
                      padding: "6px 12px",
                      background: appFilter === status ? "var(--primary-gold)" : "rgba(255,255,255,0.04)",
                      color: appFilter === status ? "#121212" : "var(--text-primary)",
                      border: "none",
                      borderRadius: "4px",
                      fontSize: "0.75rem",
                      fontWeight: "600",
                      cursor: "pointer"
                    }}
                  >
                    {status}
                  </button>
                ))}
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button 
                  onClick={() => setIsCalendarView(!isCalendarView)} 
                  className="btn-outline"
                  style={{ fontSize: "0.75rem", padding: "8px 12px" }}
                >
                  {isCalendarView ? "Vue Tableau" : "Vue Agenda/Calendrier"}
                </button>
                <input
                  type="text"
                  placeholder="Rechercher client..."
                  value={appSearch}
                  onChange={e => setAppSearch(e.target.value)}
                  style={{
                    padding: "8px 12px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "4px",
                    color: "var(--text-primary)",
                    fontSize: "0.8rem",
                    outline: "none"
                  }}
                />
              </div>
            </div>

            {/* Calendar Agenda View */}
            {isCalendarView ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {getGroupedAppointments().length === 0 ? (
                  <div className="glass-panel" style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary)" }}>
                    Aucun rendez-vous planifié.
                  </div>
                ) : (
                  getGroupedAppointments().map(([dateStr, apps]) => (
                    <div key={dateStr} className="glass-panel" style={{ padding: "20px", border: "1px solid rgba(212,175,55,0.15)" }}>
                      <h4 style={{ color: "var(--primary-gold)", borderBottom: "1px solid rgba(212,175,55,0.1)", paddingBottom: "6px", marginBottom: "16px" }}>
                        {new Date(dateStr).toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                      </h4>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
                        {apps.map(app => (
                          <div key={app.id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", padding: "16px", borderRadius: "6px", display: "flex", flexDirection: "column", gap: "10px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <span style={{ fontWeight: "700" }}>{app.time}</span>
                              <span style={{ 
                                color: app.status === "Confirmé" ? "#228B22" : app.status === "Annulé" ? "#FF4500" : "var(--primary-gold)", 
                                fontSize: "0.7rem", 
                                fontWeight: "700" 
                              }}>{app.status}</span>
                            </div>
                            <div>
                              <div style={{ fontSize: "0.9rem", fontWeight: "600" }}>{app.clientName}</div>
                              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{app.serviceName} é {app.staffName}</div>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "8px" }}>
                              <span style={{ fontWeight: "700", color: "var(--primary-gold)" }}>{app.price.toLocaleString("fr-FR")} F</span>
                              <div style={{ display: "flex", gap: "4px" }}>
                                {app.status === "En attente" && (
                                  <button onClick={() => handleConfirmApp(app.id)} style={{ background: "#228B22", border: "none", color: "#121212", borderRadius: "50%", width: "24px", height: "24px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Check size={12} /></button>
                                )}
                                {app.status !== "Annulé" && (
                                  <button onClick={() => handleCancelApp(app.id)} style={{ background: "#FF4500", border: "none", color: "#121212", borderRadius: "50%", width: "24px", height: "24px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={12} /></button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              /* Regular Table View */
              <div className="glass-panel" style={{ overflowX: "auto", border: "1px solid rgba(255,255,255,0.06)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", color: "var(--text-secondary)" }}>
                      <th style={{ padding: "16px" }}>ID</th>
                      <th style={{ padding: "16px" }}>Client</th>
                      <th style={{ padding: "16px" }}>Soin / Praticien</th>
                      <th style={{ padding: "16px" }}>Date & Créneau</th>
                      <th style={{ padding: "16px" }}>Tarif</th>
                      <th style={{ padding: "16px" }}>Statut</th>
                      <th style={{ padding: "16px", textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppointments.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ padding: "30px", textAlign: "center", color: "var(--text-secondary)" }}>Aucun rendez-vous trouvé.</td>
                      </tr>
                    ) : (
                      filteredAppointments.map(app => (
                        <tr key={app.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                          <td style={{ padding: "16px", fontWeight: "600", color: "var(--primary-gold)" }}>{app.id}</td>
                          <td style={{ padding: "16px" }}>
                            <div>{app.clientName}</div>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{app.clientPhone}</div>
                          </td>
                          <td style={{ padding: "16px" }}>
                            <div>{app.serviceName}</div>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>par {app.staffName}</div>
                          </td>
                          <td style={{ padding: "16px" }}>{app.date} é {app.time}</td>
                          <td style={{ padding: "16px", fontWeight: "700" }}>
                            <div>{app.price.toLocaleString("fr-FR")} F</div>
                            {app.promoCodeUsed && (
                              <div style={{ fontSize: "0.68rem", color: "#228B22", fontWeight: "600", marginTop: "4px" }}>
                                Code: {app.promoCodeUsed}
                              </div>
                            )}
                            {app.referralUsed && !app.promoCodeUsed && (
                              <div style={{ fontSize: "0.68rem", color: "#228B22", fontWeight: "600", marginTop: "4px" }}>
                                Parrainage
                              </div>
                            )}
                          </td>
                          <td style={{ padding: "16px" }}>
                            <span style={{
                              padding: "4px 8px",
                              borderRadius: "12px",
                              fontSize: "0.7rem",
                              fontWeight: "700",
                              background: app.status === "Confirmé" ? "rgba(34,139,34,0.15)" : app.status === "Annulé" ? "rgba(178,34,34,0.15)" : "rgba(212,175,55,0.15)",
                              color: app.status === "Confirmé" ? "#228B22" : app.status === "Annulé" ? "#FF4500" : "var(--primary-gold)"
                            }}>
                              {app.status}
                            </span>
                          </td>
                          <td style={{ padding: "16px", textAlign: "right" }}>
                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                              {app.status === "En attente" && (
                                <button onClick={() => handleConfirmApp(app.id)} style={{ padding: "6px", background: "rgba(34,139,34,0.1)", border: "none", color: "#228B22", cursor: "pointer", borderRadius: "4px" }}><Check size={14} /></button>
                              )}
                              {app.status !== "Annulé" && (
                                <button onClick={() => handleCancelApp(app.id)} style={{ padding: "6px", background: "rgba(178,34,34,0.1)", border: "none", color: "#FF4500", cursor: "pointer", borderRadius: "4px" }}><X size={14} /></button>
                              )}
                              <button onClick={() => handleDeleteApp(app.id)} style={{ padding: "6px", background: "rgba(255,255,255,0.04)", border: "none", color: "var(--text-secondary)", cursor: "pointer", borderRadius: "4px" }}><Trash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CLIENTS */}
        {activeTab === "clients" && (
          <div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
              <input
                type="text"
                placeholder="Rechercher client..."
                value={clientSearch}
                onChange={e => setClientSearch(e.target.value)}
                style={{
                  padding: "8px 12px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "4px",
                  color: "var(--text-primary)",
                  fontSize: "0.8rem",
                  width: "250px",
                  outline: "none"
                }}
              />
            </div>

            <div className="glass-panel" style={{ overflowX: "auto", border: "1px solid rgba(255,255,255,0.06)" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", color: "var(--text-secondary)" }}>
                    <th style={{ padding: "16px" }}>Nom</th>
                    <th style={{ padding: "16px" }}>Email</th>
                    <th style={{ padding: "16px" }}>Téléphone</th>
                    <th style={{ padding: "16px" }}>Réle</th>
                    <th style={{ padding: "16px" }}>Rendez-vous</th>
                    <th style={{ padding: "16px", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ padding: "30px", textAlign: "center", color: "var(--text-secondary)" }}>Aucun client trouvé.</td>
                    </tr>
                  ) : (
                    filteredClients.map(c => {
                      const clientApps = appointments.filter(a => a.clientEmail.toLowerCase() === c.email.toLowerCase());
                      return (
                        <tr key={c.email} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                          <td style={{ padding: "16px", fontWeight: "600" }}>{c.name}</td>
                          <td style={{ padding: "16px" }}>{c.email}</td>
                          <td style={{ padding: "16px" }}>{c.phone || "Non spécifié"}</td>
                          <td style={{ padding: "16px", textTransform: "capitalize" }}>{c.role}</td>
                          <td style={{ padding: "16px" }}>{clientApps.length} rdv</td>
                          <td style={{ padding: "16px", textAlign: "right" }}>
                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                              <button 
                                onClick={() => {
                                  setSelectedClient({ ...c, appointments: clientApps });
                                  setShowClientModal(true);
                                }} 
                                style={{ padding: "6px", background: "rgba(212,175,55,0.1)", border: "none", color: "var(--primary-gold)", cursor: "pointer", borderRadius: "4px" }}
                                title="Voir détails"
                              >
                                <Eye size={14} />
                              </button>
                              <button onClick={() => handleDeleteClient(c.id, c.email)} style={{ padding: "6px", background: "rgba(255,255,255,0.04)", border: "none", color: "#FF4500", cursor: "pointer", borderRadius: "4px" }}><Trash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Client Detail Modal */}
            {showClientModal && selectedClient && (
              <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
                <div className="glass-panel" style={{ maxWidth: "600px", width: "100%", padding: "30px", border: "1px solid var(--primary-gold)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <h3 className="gold-text">{selectedClient.name}</h3>
                    <button onClick={() => setShowClientModal(false)} style={{ background: "none", border: "none", color: "var(--primary-gold)", cursor: "pointer" }}><X size={20} /></button>
                  </div>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "16px" }}>
                    Email : {selectedClient.email} é Mobile : {selectedClient.phone || "Aucun"}
                  </p>
                  <h4 style={{ marginBottom: "12px", fontSize: "0.95rem" }}>Historique des rendez-vous ({selectedClient.appointments.length}) :</h4>
                  <div style={{ maxHeight: "250px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
                    {selectedClient.appointments.length === 0 ? (
                      <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Aucun historique disponible.</p>
                    ) : (
                      selectedClient.appointments.map(a => (
                        <div key={a.id} style={{ padding: "12px", background: "rgba(255,255,255,0.02)", borderRadius: "4px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem" }}>
                          <div>
                            <div style={{ fontWeight: "600" }}>{a.serviceName}</div>
                            <div style={{ color: "var(--text-secondary)" }}>{a.date} é {a.time} - {a.staffName}</div>
                          </div>
                          <span style={{ color: "var(--primary-gold)", fontWeight: "700" }}>{a.price.toLocaleString("fr-FR")} F</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: STOCK */}
        {activeTab === "stock" && (
          <StockManager currentUser={currentUser} />
        )}

        {/* TAB 4: SERVICES (CRUD) */}
        {activeTab === "services" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
              <button onClick={() => { setEditingService(null); setShowServiceForm(true); }} className="btn-gold" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Plus size={16} /> Ajouter un Soin
              </button>
              <input
                type="text"
                placeholder="Rechercher soin..."
                value={serviceSearch}
                onChange={e => setServiceSearch(e.target.value)}
                style={{
                  padding: "8px 12px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "4px",
                  color: "var(--text-primary)",
                  fontSize: "0.8rem",
                  width: "250px",
                  outline: "none"
                }}
              />
            </div>

            {/* Service Form Overlay */}
            {showServiceForm && (
              <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
                <form onSubmit={handleSaveService} className="glass-panel" style={{ maxWidth: "500px", width: "100%", padding: "30px", border: "1px solid var(--primary-gold)", display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 className="gold-text">{editingService ? "Modifier le Soin" : "Ajouter un Soin"}</h3>
                    <button type="button" onClick={() => setShowServiceForm(false)} style={{ background: "none", border: "none", color: "var(--primary-gold)", cursor: "pointer" }}><X size={20} /></button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Nom du soin :</label>
                    <input type="text" required value={serviceForm.name} onChange={e => setServiceForm({ ...serviceForm, name: e.target.value })} style={{ padding: "8px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "var(--text-primary)", borderRadius: "4px", outline: "none" }} />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Tarif (F CFA) :</label>
                      <input type="number" required value={serviceForm.price} onChange={e => setServiceForm({ ...serviceForm, price: e.target.value })} style={{ padding: "8px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "var(--text-primary)", borderRadius: "4px", outline: "none" }} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Durée :</label>
                      <input type="text" required placeholder="ex: 45 min" value={serviceForm.duration} onChange={e => setServiceForm({ ...serviceForm, duration: e.target.value })} style={{ padding: "8px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "var(--text-primary)", borderRadius: "4px", outline: "none" }} />
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Catégorie :</label>
                    <select value={serviceForm.category} onChange={e => setServiceForm({ ...serviceForm, category: e.target.value })} style={{ padding: "8px", background: "#121212", border: "1px solid rgba(255,255,255,0.08)", color: "var(--text-primary)", borderRadius: "4px", outline: "none" }}>
                      <optgroup label="Soins">
                        <option value="Visage & Corps">Visage & Corps</option>
                        <option value="Teint & éclat">Teint & éclat</option>
                        <option value="Soins Spécifiques">Soins Spécifiques</option>
                        <option value="Massages">Massages</option>
                      </optgroup>
                      <optgroup label="Coiffure">
                        <option value="Coiffure Homme">Coiffure Homme</option>
                        <option value="Coiffure Femme">Coiffure Femme</option>
                      </optgroup>
                    </select>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Description :</label>
                    <textarea rows="3" required value={serviceForm.description} onChange={e => setServiceForm({ ...serviceForm, description: e.target.value })} style={{ padding: "8px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "var(--text-primary)", borderRadius: "4px", resize: "none", outline: "none" }} />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Bénéfices (séparés par des virgules) :</label>
                    <input type="text" placeholder="ex: Hydrate la peau, Clarifie le teint" value={serviceForm.benefits} onChange={e => setServiceForm({ ...serviceForm, benefits: e.target.value })} style={{ padding: "8px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "var(--text-primary)", borderRadius: "4px", outline: "none" }} />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Image du soin (optionnel) :</label>
                    <input type="file" accept="image/*" onChange={handleServiceImageChange} style={{ fontSize: "0.8rem", color: "var(--text-secondary)", padding: "4px" }} />
                    {(serviceImagePreview || serviceForm.image_url) && (
                      <img src={serviceImagePreview || serviceForm.image_url} alt="preview" style={{ width: "100%", height: "150px", objectFit: "cover", borderRadius: "6px", border: "1px solid rgba(212,175,55,0.3)" }} />
                    )}
                  </div>

                  <button type="submit" className="btn-gold" style={{ marginTop: "10px" }}>Enregistrer le soin</button>
                </form>
              </div>
            )}

            {/* Services Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
              {filteredServices.map(s => (
                <div key={s.id} className="glass-panel" style={{ padding: "0", display: "flex", flexDirection: "column", justifyContent: "space-between", border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden", borderRadius: "10px" }}>
                  {s.image_url && (
                    <div style={{ height: "160px", overflow: "hidden", position: "relative" }}>
                      <img src={s.image_url} alt={s.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)" }} />
                    </div>
                  )}
                  <div style={{ padding: "16px", gap: "8px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                    <span style={{ fontSize: "0.7rem", color: "var(--primary-gold)", textTransform: "uppercase" }}>{s.category}</span>
                    <h4 style={{ fontSize: "1.05rem", margin: "4px 0" }}>{s.name}</h4>
                    <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>{s.description}</p>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "10px", marginTop: "auto", padding: "0 16px 14px" }}>
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{s.duration} é </span>
                      <span style={{ fontWeight: "700", color: "var(--primary-gold)", fontSize: "0.9rem" }}>{Number(s.price).toLocaleString("fr-FR")} F</span>
                    </div>
                    <div style={{ display: "flex", gap: "4px" }}>
                      <button onClick={() => handleEditService(s)} style={{ padding: "6px", background: "none", border: "none", color: "var(--primary-gold)", cursor: "pointer" }}><Edit size={14} /></button>
                      <button onClick={() => handleDeleteService(s.id)} style={{ padding: "6px", background: "none", border: "none", color: "#FF4500", cursor: "pointer" }}><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: PROMO CODES */}
        {activeTab === "promo_codes" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
              <button 
                onClick={() => {
                  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
                  let code = "";
                  for (let i = 0; i < 8; i++) {
                    code += chars.charAt(Math.floor(Math.random() * chars.length));
                  }
                  setPromoForm({ code, clientName: "", discountPercent: 20, maxUses: 1 });
                  setShowPromoForm(true);
                }} 
                className="btn-gold" 
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <Plus size={16} /> Générer un Code Promo
              </button>
              <input
                type="text"
                placeholder="Rechercher code ou client..."
                value={promoSearch}
                onChange={e => setPromoSearch(e.target.value)}
                style={{
                  padding: "8px 12px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "4px",
                  color: "var(--text-primary)",
                  fontSize: "0.8rem",
                  width: "250px",
                  outline: "none"
                }}
              />
            </div>

            {/* Promo Code Form Overlay */}
            {showPromoForm && (
              <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
                <form onSubmit={handleSavePromo} className="glass-panel" style={{ maxWidth: "450px", width: "100%", padding: "30px", border: "1px solid var(--primary-gold)", display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 className="gold-text">Générer un Code Promo</h3>
                    <button type="button" onClick={() => setShowPromoForm(false)} style={{ background: "none", border: "none", color: "var(--primary-gold)", cursor: "pointer" }}><X size={20} /></button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Code de réduction (8 caractéres) :</label>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <input 
                        type="text" 
                        required 
                        maxLength={8}
                        value={promoForm.code} 
                        onChange={e => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })} 
                        style={{ flex: 1, padding: "8px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "var(--text-primary)", borderRadius: "4px", outline: "none", fontFamily: "monospace", letterSpacing: "0.08em", fontSize: "1.1rem" }} 
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
                          let code = "";
                          for (let i = 0; i < 8; i++) {
                            code += chars.charAt(Math.floor(Math.random() * chars.length));
                          }
                          setPromoForm({ ...promoForm, code });
                        }}
                        className="btn-outline"
                        style={{ fontSize: "0.75rem", padding: "8px 12px" }}
                      >
                        Régénérer
                      </button>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Nom de la cliente détendue :</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Ex: Marie-Claire"
                      value={promoForm.clientName} 
                      onChange={e => setPromoForm({ ...promoForm, clientName: e.target.value })} 
                      style={{ padding: "8px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "var(--text-primary)", borderRadius: "4px", outline: "none" }} 
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Remise (%) :</label>
                      <input 
                        type="number" 
                        required 
                        min={1}
                        max={100}
                        value={promoForm.discountPercent} 
                        onChange={e => setPromoForm({ ...promoForm, discountPercent: parseInt(e.target.value, 10) })} 
                        style={{ padding: "8px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "var(--text-primary)", borderRadius: "4px", outline: "none" }} 
                      />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Utilisations max :</label>
                      <input 
                        type="number" 
                        required 
                        min={1}
                        value={promoForm.maxUses} 
                        onChange={e => setPromoForm({ ...promoForm, maxUses: parseInt(e.target.value, 10) })} 
                        style={{ padding: "8px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "var(--text-primary)", borderRadius: "4px", outline: "none" }} 
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn-gold" style={{ marginTop: "10px" }}>Créer le code de réduction</button>
                </form>
              </div>
            )}

            {/* Promo Codes Table */}
            <div className="glass-panel" style={{ overflowX: "auto", border: "1px solid rgba(255,255,255,0.06)" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", color: "var(--text-secondary)" }}>
                    <th style={{ padding: "16px" }}>Code</th>
                    <th style={{ padding: "16px" }}>Cliente</th>
                    <th style={{ padding: "16px" }}>Réduction</th>
                    <th style={{ padding: "16px" }}>Utilisations</th>
                    <th style={{ padding: "16px" }}>Statut</th>
                    <th style={{ padding: "16px", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPromoCodes.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ padding: "30px", textAlign: "center", color: "var(--text-secondary)" }}>Aucun code promo généré.</td>
                    </tr>
                  ) : (
                    filteredPromoCodes.map(promo => (
                      <tr key={promo.code} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                        <td style={{ padding: "16px", color: "var(--primary-gold)", fontWeight: "700", fontFamily: "monospace", letterSpacing: "0.05em", fontSize: "1rem" }}>{promo.code}</td>
                        <td style={{ padding: "16px", fontWeight: "600" }}>{promo.clientName}</td>
                        <td style={{ padding: "16px", color: "#228B22", fontWeight: "700" }}>-{promo.discountPercent}%</td>
                        <td style={{ padding: "16px" }}>{promo.currentUses} / {promo.maxUses}</td>
                        <td style={{ padding: "16px" }}>
                          <span style={{
                            padding: "4px 8px",
                            borderRadius: "12px",
                            fontSize: "0.7rem",
                            fontWeight: "700",
                            background: promo.isActive && promo.currentUses < promo.maxUses ? "rgba(34,139,34,0.15)" : "rgba(178,34,34,0.15)",
                            color: promo.isActive && promo.currentUses < promo.maxUses ? "#228B22" : "#FF4500"
                          }}>
                            {promo.isActive && promo.currentUses < promo.maxUses ? "Actif" : "Inactif"}
                          </span>
                        </td>
                        <td style={{ padding: "16px", textAlign: "right" }}>
                          <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                            <button 
                              onClick={async () => {
                                await updatePromoCode(promo.code, { isActive: !promo.isActive });
                                loadAllData();
                              }}
                              className="btn-outline" 
                              style={{ fontSize: "0.7rem", padding: "4px 8px" }}
                            >
                              {promo.isActive ? "Désactiver" : "Activer"}
                            </button>
                            <button 
                              onClick={async () => {
                                const okPromo = await confirm({ title: "Supprimer ce code promo", message: "Ce code promo sera définitivement supprimé.", confirmLabel: "Supprimer", danger: true });
                                if (okPromo) {
                                  await deletePromoCode(promo.code);
                                  loadAllData();
                                }
                              }}
                              style={{ padding: "6px", background: "none", border: "none", color: "#FF4500", cursor: "pointer" }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}


        {/* TAB: BOUTIQUE */}
        {activeTab === "boutique" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 className="gold-text" style={{ fontSize: "1.4rem", marginBottom: "4px" }}>Gestion de la Boutique</h3>
                <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>{products.length} produit{products.length !== 1 ? "s" : ""} dans la boutique</p>
              </div>
              <button onClick={() => { setEditingProduct(null); setProductForm({ name: '', description: '', price: '', category: 'Soin', image_url: '', in_stock: true, payable_with_credits: false, credit_discount_pct: 20 }); setProductImageFile(null); setProductImagePreview(''); setShowProductForm(true); }} className="btn-gold" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Plus size={16} /> Ajouter un Produit
              </button>
            </div>

            {/* Product Form Modal */}
            {showProductForm && (
              <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
                <form onSubmit={handleSaveProduct} className="glass-panel" style={{ maxWidth: "520px", width: "100%", padding: "32px", border: "1px solid var(--primary-gold)", display: "flex", flexDirection: "column", gap: "16px", maxHeight: "90vh", overflowY: "auto" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 className="gold-text">{editingProduct ? "Modifier le produit" : "Nouveau Produit"}</h3>
                    <button type="button" onClick={() => setShowProductForm(false)} style={{ background: "none", border: "none", color: "var(--primary-gold)", cursor: "pointer" }}><X size={20} /></button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Nom du produit * :</label>
                    <input required value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} placeholder="ex: Serum Eclat Or" style={{ padding: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-primary)", borderRadius: "6px", outline: "none" }} />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Description :</label>
                    <textarea value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} rows="3" placeholder="Decrivez ce produit..." style={{ padding: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-primary)", borderRadius: "6px", outline: "none", resize: "vertical" }} />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Prix (FCFA) * :</label>
                      <input required type="number" min="0" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} placeholder="15000" style={{ padding: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-primary)", borderRadius: "6px", outline: "none" }} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Categorie :</label>
                      <select value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })} style={{ padding: "10px", background: "#121212", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-primary)", borderRadius: "6px", outline: "none" }}>
                        {["Soin", "Maquillage", "Parfum", "Cheveux", "Corps", "Accessoire"].map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Image du produit :</label>
                    <input type="file" accept="image/*" onChange={handleProductImageChange} style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }} />
                    {productImagePreview && <img src={productImagePreview} alt="preview" style={{ width: "100%", height: "160px", objectFit: "cover", borderRadius: "8px", border: "1px solid rgba(212,175,55,0.4)" }} />}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>é OU é URL de l'image :</label>
                    <input type="url" value={productForm.image_url} onChange={e => setProductForm({ ...productForm, image_url: e.target.value })} placeholder="https://example.com/produit.jpg" style={{ padding: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-primary)", borderRadius: "6px", outline: "none" }} />
                  </div>

                  <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "0.9rem" }}>
                    <input type="checkbox" checked={productForm.in_stock} onChange={e => setProductForm({ ...productForm, in_stock: e.target.checked })} />
                    <span style={{ color: productForm.in_stock ? "#228B22" : "#FF4500" }}>{productForm.in_stock ? "En stock" : "Hors stock"}</span>
                  </label>

                  <button type="submit" className="btn-gold" disabled={productUploading} style={{ marginTop: "8px", opacity: productUploading ? 0.7 : 1 }}>
                    {productUploading ? "Sauvegarde en cours..." : editingProduct ? "Mettre a jour" : "Ajouter le produit"}
                  </button>
                </form>
              </div>
            )}

            {/* Products Grid */}
            {products.length === 0 ? (
              <div className="glass-panel" style={{ padding: "60px", textAlign: "center", border: "1px dashed rgba(212,175,55,0.2)" }}>
                <Package size={40} style={{ color: "rgba(212,175,55,0.2)", marginBottom: "12px" }} />
                <p style={{ color: "var(--text-secondary)" }}>Aucun produit dans la boutique. Ajoutez votre premier produit.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" }}>
                {products.map(product => (
                  <div key={product.id} className="glass-panel" style={{ padding: 0, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px" }}>
                    <div style={{ height: "180px", overflow: "hidden", background: "rgba(212,175,55,0.04)", position: "relative" }}>
                      {product.image_url
                        ? <img src={product.image_url} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><Package size={40} style={{ color: "rgba(212,175,55,0.2)" }} /></div>
                      }
                      <span style={{ position: "absolute", top: "10px", left: "10px", background: product.in_stock !== false ? "rgba(34,139,34,0.85)" : "rgba(178,34,34,0.85)", color: "#fff", padding: "3px 8px", borderRadius: "12px", fontSize: "0.68rem", fontWeight: "700" }}>
                        {product.in_stock !== false ? "En stock" : "Hors stock"}
                      </span>
                    </div>
                    <div style={{ padding: "16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                        <div>
                          <h4 style={{ fontWeight: "600", fontSize: "0.95rem", marginBottom: "2px" }}>{product.name}</h4>
                          <span style={{ fontSize: "0.7rem", color: "var(--primary-gold)", textTransform: "uppercase" }}>{product.category}</span>
                        </div>
                        <span style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--primary-gold)", whiteSpace: "nowrap" }}>{Number(product.price).toLocaleString("fr-FR")} F</span>
                      </div>
                      {product.description && <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "14px", lineHeight: "1.4" }}>{product.description.substring(0, 80)}{product.description.length > 80 ? "..." : ""}</p>}
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={() => handleEditProduct(product)} className="btn-outline" style={{ flex: 1, fontSize: "0.75rem", padding: "6px 10px", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                          <Edit size={13} /> Modifier
                        </button>
                        <button onClick={() => handleDeleteProduct(product.id)} style={{ padding: "6px 10px", background: "none", border: "1px solid rgba(255,69,0,0.3)", borderRadius: "4px", color: "#FF4500", cursor: "pointer" }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: AFFILIATES */}
        {activeTab === "affiliates" && (
          <div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
              <input
                type="text"
                placeholder="Rechercher code ou email..."
                value={affSearch}
                onChange={e => setAffSearch(e.target.value)}
                style={{
                  padding: "8px 12px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "4px",
                  color: "var(--text-primary)",
                  fontSize: "0.8rem",
                  width: "250px",
                  outline: "none"
                }}
              />
            </div>

            <div className="glass-panel" style={{ overflowX: "auto", border: "1px solid rgba(255,255,255,0.06)" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", color: "var(--text-secondary)" }}>
                    <th style={{ padding: "16px" }}>Client (Email)</th>
                    <th style={{ padding: "16px" }}>Code Affilié</th>
                    <th style={{ padding: "16px" }}>Points Cumulés</th>
                    <th style={{ padding: "16px" }}>Nombre Parrainages</th>
                    <th style={{ padding: "16px", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAffiliates.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ padding: "30px", textAlign: "center", color: "var(--text-secondary)" }}>Aucun affilié trouvé.</td>
                    </tr>
                  ) : (
                    filteredAffiliates.map(aff => (
                      <tr key={aff.clientEmail} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                        <td style={{ padding: "16px", fontWeight: "600" }}>{aff.clientEmail}</td>
                        <td style={{ padding: "16px", color: "var(--primary-gold)", fontWeight: "700" }}>{aff.code}</td>
                        <td style={{ padding: "16px" }}>{aff.pointsEarned} pts</td>
                        <td style={{ padding: "16px" }}>{aff.totalReferrals} parrainages</td>
                        <td style={{ padding: "16px", textAlign: "right" }}>
                          <button 
                            onClick={() => handleAdjustPoints(aff.clientEmail, aff.pointsEarned)}
                            className="btn-outline" 
                            style={{ fontSize: "0.75rem", padding: "6px 12px" }}
                          >
                            Ajuster Points
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: GALERIE */}
        {activeTab === "gallery" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 className="gold-text" style={{ fontSize: "1.4rem", marginBottom: "4px" }}>Galerie de l\'Institut</h3>
                <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>{galleryImages.length} image{galleryImages.length !== 1 ? "s" : ""} publiee{galleryImages.length !== 1 ? "s" : ""}</p>
              </div>
              <button
                onClick={() => setShowGalleryForm(true)}
                className="btn-gold"
                style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem" }}
              >
                <Plus size={16} /> Ajouter une image
              </button>
            </div>

            {/* Add Image Form Modal */}
            {showGalleryForm && (
              <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
                <form onSubmit={handleAddGalleryImage} className="glass-panel" style={{ maxWidth: "520px", width: "100%", padding: "32px", border: "1px solid var(--primary-gold)", display: "flex", flexDirection: "column", gap: "16px", maxHeight: "90vh", overflowY: "auto" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 className="gold-text">Ajouter une photo</h3>
                    <button type="button" onClick={() => { setShowGalleryForm(false); setGalleryUploadPreviews([]); setGalleryUploadFiles([]); }} style={{ background: "none", border: "none", color: "var(--primary-gold)", cursor: "pointer" }}><X size={20} /></button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Titre :</label>
                    <input required value={galleryForm.title} onChange={e => setGalleryForm({ ...galleryForm, title: e.target.value })} placeholder="ex: Soin visage eclat" style={{ padding: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-primary)", borderRadius: "6px", outline: "none" }} />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Description (optionnel) :</label>
                    <textarea value={galleryForm.description} onChange={e => setGalleryForm({ ...galleryForm, description: e.target.value })} rows="2" placeholder="Description courte..." style={{ padding: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-primary)", borderRadius: "6px", outline: "none", resize: "none" }} />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Categorie :</label>
                    <select value={galleryForm.category} onChange={e => setGalleryForm({ ...galleryForm, category: e.target.value })} style={{ padding: "10px", background: "#121212", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-primary)", borderRadius: "6px", outline: "none" }}>
                      <option value="Salon">Salon</option>
                      <option value="Visage">Visage</option>
                      <option value="Corps">Corps</option>
                      <option value="Coiffure">Coiffure</option>
                      <option value="Massages">Massages</option>
                    </select>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Images (choisir un ou plusieurs fichiers) :</label>
                    <input type="file" accept="image/*" multiple onChange={handleGalleryFilesChange} style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }} />
                    {galleryUploadPreviews.length > 0 && (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "8px", marginTop: "8px" }}>
                        {galleryUploadPreviews.map((src, i) => (
                          <img key={i} src={src} alt={`preview-${i}`} style={{ width: "100%", height: "100px", objectFit: "cover", borderRadius: "6px", border: "1px solid rgba(212,175,55,0.4)" }} />
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>é OU é URL directe de l\'image :</label>
                    <input type="url" value={galleryForm.image_url} onChange={e => setGalleryForm({ ...galleryForm, image_url: e.target.value })} placeholder="https://example.com/image.jpg" style={{ padding: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-primary)", borderRadius: "6px", outline: "none" }} />
                  </div>

                  <button type="submit" className="btn-gold" disabled={galleryUploading} style={{ marginTop: "8px", opacity: galleryUploading ? 0.7 : 1 }}>
                    {galleryUploading ? "Upload en cours..." : "Publier dans la galerie"}
                  </button>
                </form>
              </div>
            )}

            {/* Gallery Grid */}
            {galleryImages.length === 0 ? (
              <div className="glass-panel" style={{ padding: "60px", textAlign: "center", border: "1px dashed rgba(212,175,55,0.2)" }}>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Aucune image dans la galerie. Cliquez sur "Ajouter une image" pour commencer.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "20px" }}>
                {galleryImages.map(img => (
                  <div key={img.id} className="glass-panel" style={{ padding: 0, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", position: "relative" }}>
                    <div style={{ height: "200px", overflow: "hidden" }}>
                      <img
                        src={img.image_url || img.image}
                        alt={img.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={e => { e.target.style.display = "none"; }}
                      />
                    </div>
                    <div style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <p style={{ fontWeight: "600", fontSize: "0.9rem", marginBottom: "2px" }}>{img.title}</p>
                          <span style={{ fontSize: "0.7rem", color: "var(--primary-gold)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{img.category}</span>
                          {img.description && <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: "6px" }}>{img.description}</p>}
                        </div>
                        <button
                          onClick={() => handleDeleteGalleryImage(img.id, img.image_url || img.image)}
                          style={{ background: "none", border: "none", color: "#FF4500", cursor: "pointer", flexShrink: 0, marginLeft: "8px" }}
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 6: SETTINGS (Staff CRUD & Backups) */}
        {activeTab === "settings" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
            
            {/* Site Settings Section */}
            <div className="glass-panel" style={{ padding: "30px", border: "1px solid rgba(255,255,255,0.06)" }}>
              <h3 className="gold-text" style={{ marginBottom: "20px" }}>Paramètres du Site</h3>
              <form onSubmit={handleSaveSiteSettings} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Nom du site :</label>
                    <input
                      type="text"
                      value={siteSettings.site_name || ""}
                      onChange={e => setSiteSettings({ ...siteSettings, site_name: e.target.value })}
                      style={{ padding: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-primary)", borderRadius: "6px", outline: "none" }}
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Adresse :</label>
                    <input
                      type="text"
                      value={siteSettings.address || ""}
                      onChange={e => setSiteSettings({ ...siteSettings, address: e.target.value })}
                      style={{ padding: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-primary)", borderRadius: "6px", outline: "none" }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Téléphone :</label>
                    <input
                      type="text"
                      value={siteSettings.phone || ""}
                      onChange={e => setSiteSettings({ ...siteSettings, phone: e.target.value })}
                      style={{ padding: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-primary)", borderRadius: "6px", outline: "none" }}
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>WhatsApp (Format International, ex: +241077004073) :</label>
                    <input
                      type="text"
                      value={siteSettings.whatsapp || ""}
                      onChange={e => setSiteSettings({ ...siteSettings, whatsapp: e.target.value })}
                      style={{ padding: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-primary)", borderRadius: "6px", outline: "none" }}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Bandeau Promotionnel (Texte défilant en haut du site) :</label>
                  <input
                    type="text"
                    placeholder="PROGRAMME FIDéLITé : Accumulez des points é chaque visite..."
                    value={siteSettings.promo_banner || ""}
                    onChange={e => setSiteSettings({ ...siteSettings, promo_banner: e.target.value })}
                    style={{ padding: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-primary)", borderRadius: "6px", outline: "none" }}
                  />
                </div>

                {/* Toggle ON/OFF bande d'annonce */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", background: siteSettings.promo_banner_active !== false ? "rgba(34,139,34,0.08)" : "rgba(255,69,0,0.06)", borderRadius: "8px", border: siteSettings.promo_banner_active !== false ? "1px solid rgba(34,139,34,0.2)" : "1px solid rgba(255,69,0,0.15)" }}>
                  <div style={{ position: "relative", width: "48px", height: "26px", cursor: "pointer" }} onClick={() => setSiteSettings({ ...siteSettings, promo_banner_active: !siteSettings.promo_banner_active })}>
                    <div style={{ position: "absolute", inset: 0, borderRadius: "13px", background: siteSettings.promo_banner_active !== false ? "var(--primary-gold)" : "rgba(255,255,255,0.15)", transition: "background 0.3s ease" }} />
                    <div style={{ position: "absolute", top: "3px", left: siteSettings.promo_banner_active !== false ? "25px" : "3px", width: "20px", height: "20px", borderRadius: "50%", background: "#fff", transition: "left 0.3s ease", boxShadow: "0 2px 4px rgba(0,0,0,0.3)" }} />
                  </div>
                  <div>
                    <div style={{ fontSize: "0.9rem", fontWeight: "600", color: siteSettings.promo_banner_active !== false ? "#4CAF50" : "#FF5722" }}>
                      {siteSettings.promo_banner_active !== false ? "Active é visible sur le site" : "Desactivee é masquee pour les visiteurs"}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "2px" }}>Cliquer pour basculer</div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Logo (Fichier image) :</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => setLogoFile(e.target.files[0])}
                      style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}
                    />
                    {siteSettings.logo_url && (
                      <img src={siteSettings.logo_url} alt="Logo" style={{ height: "40px", objectFit: "contain", alignSelf: "flex-start", marginTop: "8px", border: "1px solid rgba(255,255,255,0.1)", padding: "4px", borderRadius: "4px" }} />
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Favicon (Fichier image) :</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => setFaviconFile(e.target.files[0])}
                      style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}
                    />
                    {siteSettings.favicon_url && (
                      <img src={siteSettings.favicon_url} alt="Favicon" style={{ height: "32px", width: "32px", objectFit: "contain", alignSelf: "flex-start", marginTop: "8px", border: "1px solid rgba(255,255,255,0.1)", padding: "4px", borderRadius: "4px" }} />
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "8px" }}>
                  <input
                    type="checkbox"
                    id="allow_specialist"
                    checked={siteSettings.allow_specialist_selection !== false}
                    onChange={e => setSiteSettings({ ...siteSettings, allow_specialist_selection: e.target.checked })}
                    style={{ cursor: "pointer" }}
                  />
                  <label htmlFor="allow_specialist" style={{ fontSize: "0.9rem", color: "var(--text-primary)", cursor: "pointer" }}>
                    Autoriser les clients é choisir un praticien lors de la réservation
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={settingsSaving}
                  className="btn-gold"
                  style={{ width: "fit-content", padding: "10px 24px", marginTop: "10px", alignSelf: "flex-start" }}
                >
                  {settingsSaving ? "Sauvegarde..." : "Enregistrer les Paramètres"}
                </button>
              </form>
            </div>

            {/* Staff Management Section */}
            <div className="glass-panel" style={{ padding: "30px", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 className="gold-text">Gestion de l'équipe (Staff)</h3>
                <button onClick={() => setShowStaffForm(true)} className="btn-gold" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", padding: "8px 14px" }}>
                  <Plus size={14} /> Ajouter un Praticien
                </button>
              </div>

              {/* Staff Form Overlay */}
              {showStaffForm && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
                  <form onSubmit={handleSaveStaff} className="glass-panel" style={{ maxWidth: "400px", width: "100%", padding: "30px", border: "1px solid var(--primary-gold)", display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h3 className="gold-text">Ajouter un Praticien</h3>
                      <button type="button" onClick={() => setShowStaffForm(false)} style={{ background: "none", border: "none", color: "var(--primary-gold)", cursor: "pointer" }}><X size={20} /></button>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Nom :</label>
                      <input type="text" required value={staffForm.name} onChange={e => setStaffForm({ ...staffForm, name: e.target.value })} style={{ padding: "8px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "var(--text-primary)", borderRadius: "4px", outline: "none" }} />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Rôle :</label>
                      <input type="text" required placeholder="ex: Massothérapeute" value={staffForm.role} onChange={e => setStaffForm({ ...staffForm, role: e.target.value })} style={{ padding: "8px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "var(--text-primary)", borderRadius: "4px", outline: "none" }} />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Lien de la photo d'avatar (Optionnel) :</label>
                      <input type="text" placeholder="https://..." value={staffForm.avatar} onChange={e => setStaffForm({ ...staffForm, avatar: e.target.value })} style={{ padding: "8px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "var(--text-primary)", borderRadius: "4px", outline: "none" }} />
                    </div>

                    <button type="submit" className="btn-gold" style={{ marginTop: "10px" }}>Ajouter le praticien</button>
                  </form>
                </div>
              )}

              {/* Staff List Table */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "16px" }}>
                {staff.map(member => (
                  <div key={member.id} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "16px", background: "rgba(255,255,255,0.02)", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.04)", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <img src={member.avatar} alt={member.name} style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }} />
                      <div>
                        <div style={{ fontWeight: "600", fontSize: "0.85rem" }}>{member.name}</div>
                        <div style={{ color: "var(--text-secondary)", fontSize: "0.75rem" }}>{member.role}</div>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteStaff(member.id)} style={{ background: "none", border: "none", color: "#FF4500", cursor: "pointer" }}><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
            </div>

            {/* QR Codes Section */}
            <div className="glass-panel" style={{ padding: "30px", border: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", gap: "18px" }}>
              <QRCodeSection siteUrl={window.location.origin} />
            </div>

            {/* Backups & Actions Section */}
            <div className="glass-panel" style={{ padding: "30px", border: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", gap: "18px" }}>
              <h3 className="gold-text">Opérations Système & Exportations</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Gérez les sauvegardes globales et la maintenance de la base de données de The Alpha Beauty.</p>
              
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <button onClick={handleExportCSV} className="btn-gold" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Download size={16} /> Exporter les Rendez-vous (CSV)
                </button>
                <button onClick={handleResetDb} className="btn-outline" style={{ borderColor: "#B22222", color: "#FF4500" }}>
                  Réinitialiser la Base de Données
                </button>
              </div>
            </div>

          </div>
        )}

        {/* TAB FIDÉLITÉ */}
        {activeTab === "fidelite" && (
          <div>
            <AdminFidelite currentUser={currentUser} />
          </div>
        )}

      </div>
    </section>
  );
}






