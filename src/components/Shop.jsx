import React, { useState, useEffect } from "react"
import { ShoppingBag, ShoppingCart, X, Plus, Minus, MessageCircle, Package, Trash2, Search, Eye, Star, Zap, Check, Gem } from "lucide-react"
import { getProducts, getSiteSettings } from "../supabase"
import { useToast } from "./Toast.jsx"
import { useConfirm } from "./ConfirmModal"
import { getFideliteSettings, getWallet, payerBoutique, createOrder } from "../fidelite"

export default function Shop({ currentUser, isTab = false }) {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [checkoutModal, setCheckoutModal] = useState(false);
  const [settings, setSettings] = useState({ whatsapp: '+241077004073', site_name: 'The Alpha Beauty' });
  const [fideliteSettings, setFideliteSettings] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productModalImgIdx, setProductModalImgIdx] = useState(0);
  const [addedFeedback, setAddedFeedback] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const { showToast } = useToast();
  const confirm = useConfirm();

  useEffect(() => {
    async function load() {
      setLoading(true);
      const prods = await getProducts();
      setProducts(prods || []);
      const s = await getSiteSettings();
      if (s) setSettings(s);
      
      const fSettings = await getFideliteSettings();
      setFideliteSettings(fSettings);
      
      if (currentUser?.id) {
        const w = await getWallet(currentUser.id);
        setWallet(w);
      }
      setLoading(false);
    }
    load();
  }, [currentUser]);

  // Reset image index when product changes
  React.useEffect(() => { setProductModalImgIdx(0); }, [selectedProduct]);

  const categories = ['Tous', ...new Set((products || []).map(p => p.category).filter(Boolean))];

  const filtered = products.filter(p => {
    const matchCat = selectedCategory === 'Tous' || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  const addToCart = (product) => {
    if (product.in_stock === false) return;
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...product, qty: 1 }];
    });
    setAddedFeedback(product.id);
    setTimeout(() => setAddedFeedback(null), 1200);
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));
  const updateQty = (id, delta) => {
    setCart(prev => prev.map(i => {
      if (i.id !== id) return i;
      const newQty = i.qty + delta;
      if (newQty <= 0) return null;
      return { ...i, qty: newQty };
    }).filter(Boolean));
  };

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);

  const getWhatsAppUrl = (items, total, extraMsg = '') => {
    const wa = (settings.whatsapp || '+241077004073').replace(/\D/g, '');
    const lines = items.map(i => `  • ${i.name} x${i.qty} = ${(i.price * i.qty).toLocaleString('fr-FR')} FCFA`);
    const msg = encodeURIComponent(
      `Bonjour ${settings.site_name} !\n\nJe souhaite commander :\n${lines.join('\n')}\n\nTotal initial : ${total.toLocaleString('fr-FR')} FCFA${extraMsg}\n\nMerci de confirmer ma commande. 🙏`
    );
    return `https://wa.me/${wa}?text=${msg}`;
  };

  const handleOrder = () => {
    if (cart.length === 0) return;
    setCheckoutModal(true);
  };

  const handleConfirmOrder = () => {
    window.open(getWhatsAppUrl(cart, cartTotal), '_blank');
    setCart([]);
    setCheckoutModal(false);
    setShowCart(false);
  };

  const handleDirectOrder = (product) => {
    if (product.in_stock === false) return;
    const wa = (settings.whatsapp || "+241077004073").replace(/\D/g, "");
    const imgUrl = product.image_url || (product.images && product.images[0]);
    const imgLine = imgUrl ? `\n\n📸 Photo du produit :\n${imgUrl}` : "";
    const msg = encodeURIComponent(
      `Bonjour ${settings.site_name} !\n\nJe souhaite commander :\n  • ${product.name} x1 = ${Number(product.price).toLocaleString("fr-FR")} FCFA${imgLine}\n\nTotal : ${Number(product.price).toLocaleString("fr-FR")} FCFA\n\nMerci de confirmer ma commande. 🙏`
    );
    window.open(`https://wa.me/${wa}?text=${msg}`, "_blank");
  };

  const handlePayWithCredits = async (product) => {
    if (!currentUser) {
      showToast("Veuillez vous connecter pour utiliser vos crédits.", "error");
      return;
    }
    if (!wallet || !fideliteSettings) {
      showToast("Impossible de charger votre portefeuille.", "error");
      return;
    }
    const solde = (wallet.points_achetes || 0) + (wallet.points_gagnes || 0);
    const vpf = Math.max(0.1, Number(fideliteSettings.valeur_point_fcfa) || 10);
    const reductionMaxFcfa = product.price * ((product.credit_discount_pct || 20) / 100);
    const pointsNecessaires = Math.floor(reductionMaxFcfa / vpf);

    if (solde < pointsNecessaires) {
      showToast(`Solde insuffisant. Vous avez ${solde} pts, il vous faut ${pointsNecessaires} pts.`, "error");
      return;
    }

    const okPay = await confirm({ title: "Payer avec vos points", message: `Utiliser ${pointsNecessaires} pts pour une réduction de ${reductionMaxFcfa} FCFA sur "${product.name}". Le reste sera payé en boutique ou WhatsApp.`, confirmLabel: "Confirmer le paiement", danger: false });
    if (!okPay) {
      return;
    }

    setProcessingPayment(true);
    try {
      // 1. Create order
      const orderData = {
        user_id: currentUser.id,
        client_name: currentUser.name,
        client_phone: currentUser.phone,
        items: [{ ...product, qty: 1 }],
        total_fcfa: product.price,
        discount_fcfa: reductionMaxFcfa,
        payment_method: 'credits',
        points_used: pointsNecessaires,
        status: 'pending',
        notes: 'Achat via crédits (points)'
      };
      
      const newOrder = await createOrder(orderData);
      if (!newOrder) {
        showToast("Erreur lors de la création de la commande.", "error");
        setProcessingPayment(false);
        return;
      }

      // 2. Deduct points
      const result = await payerBoutique(currentUser.id, newOrder.id, product.price, pointsNecessaires, currentUser.id);
      
      if (result.success) {
        const extra = `\nRéduction par points : -${reductionMaxFcfa} FCFA\nReste à payer : ${result.prixCash} FCFA`;
        showToast("Paiement validé ! Redirection vers WhatsApp...", "success");
        const items = [{ ...product, qty: 1 }];
        window.open(getWhatsAppUrl(items, product.price, extra), '_blank');
        
        // Update local wallet visually
        const ptsGagnesDelta = -Math.min(pointsNecessaires, wallet.points_gagnes || 0);
        const ptsAchetesDelta = -(pointsNecessaires + ptsGagnesDelta);
        setWallet({
          ...wallet,
          points_achetes: Math.max(0, (wallet.points_achetes || 0) + ptsAchetesDelta),
          points_gagnes: Math.max(0, (wallet.points_gagnes || 0) + ptsGagnesDelta)
        });
        setSelectedProduct(null);
      } else {
        showToast("Erreur de paiement : " + result.error, "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Une erreur est survenue. Veuillez réessayer.", "error");
    }
    setProcessingPayment(false);
  };

  const C = {
    gold: "#d4af37", goldDark: "#aa771c", bg: "#0b0b0b", card: "#111",
    border: "#1a1a1a", green: "#25D366", text: "#e0e0e0", muted: "#666"
  };

  return (
    <section id="boutique" style={{ padding: isTab ? '20px 0 60px' : '100px 24px 60px', background: isTab ? 'transparent' : '#0d0d0d', minHeight: isTab ? 'auto' : '100vh', position: 'relative', fontFamily: "'Inter', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <span style={{ fontSize: '0.85rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: C.gold, fontWeight: '600', display: 'block', marginBottom: '8px' }}>
            NOTRE BOUTIQUE
          </span>
          <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', marginBottom: '12px', color: '#fff' }}>
            Produits <span style={{ background: `linear-gradient(135deg, ${C.gold}, ${C.goldDark})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Premium</span>
          </h2>
          <div style={{ width: '60px', height: '2px', background: `linear-gradient(90deg, ${C.goldDark}, ${C.gold})`, margin: '0 auto 16px' }} />
          <p style={{ color: C.muted, maxWidth: '500px', margin: '0 auto', fontSize: '0.9rem', lineHeight: '1.6' }}>
            Découvrez notre sélection de produits de beauté premium. Commandez directement via WhatsApp ou utilisez vos Crédits (Points).
          </p>
        </div>

        {/* Filters & Search */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '20px',
                  border: selectedCategory === cat ? `1px solid ${C.gold}` : '1px solid rgba(255,255,255,0.1)',
                  background: selectedCategory === cat ? 'rgba(212,175,55,0.12)' : 'transparent',
                  color: selectedCategory === cat ? C.gold : C.muted,
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  transition: 'all 0.2s ease'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: C.muted }} />
            <input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Rechercher un produit..."
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#fff',
                padding: '10px 16px 10px 36px',
                fontSize: '0.85rem',
                outline: 'none',
                width: '220px'
              }}
            />
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '80px', color: C.muted }}>
            <Package size={40} style={{ opacity: 0.3, marginBottom: '16px' }} />
            <p>Chargement des produits...</p>
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px', color: C.muted }}>
            <Package size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
            <p style={{ fontSize: '1.1rem' }}>Aucun produit disponible pour le moment.</p>
            <p style={{ fontSize: '0.85rem', marginTop: '8px' }}>Revenez bientôt !</p>
          </div>
        )}

        {/* Products Grid */}
        {!loading && filtered.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
            {filtered.map(product => {
              const inCart = cart.find(i => i.id === product.id);
              const outOfStock = product.in_stock === false;
              const justAdded = addedFeedback === product.id;

              return (
                <div
                  key={product.id}
                  style={{
                    background: C.card,
                    border: `1px solid ${outOfStock ? 'rgba(255,255,255,0.04)' : 'rgba(212,175,55,0.1)'}`,
                    borderRadius: '16px',
                    overflow: 'hidden',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    opacity: outOfStock ? 0.5 : 1,
                    filter: outOfStock ? 'grayscale(0.6)' : 'none',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                  onMouseEnter={e => { if (!outOfStock) { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.35)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)'; }}}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = outOfStock ? 'rgba(255,255,255,0.04)' : 'rgba(212,175,55,0.1)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  {/* Added feedback overlay */}
                  {justAdded && (
                    <div style={{
                      position: 'absolute', inset: 0, zIndex: 5,
                      background: 'rgba(37,211,102,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      borderRadius: '16px',
                      animation: 'fadeOut 1.2s forwards'
                    }}>
                      <div style={{ background: C.green, borderRadius: '50%', padding: 12, boxShadow: `0 0 30px ${C.green}55` }}>
                        <Check size={24} color="#fff" />
                      </div>
                    </div>
                  )}

                  {/* Out of stock badge */}
                  {outOfStock && (
                    <div style={{
                      position: 'absolute', top: 0, left: 0, right: 0,
                      background: 'rgba(0,0,0,0.75)', zIndex: 4,
                      padding: '8px', textAlign: 'center',
                      color: '#ff6b6b', fontSize: '0.75rem', fontWeight: '700',
                      letterSpacing: '0.1em', textTransform: 'uppercase'
                    }}>
                      Rupture de stock
                    </div>
                  )}

                  {/* Image */}
                  <div
                    style={{ height: '220px', background: 'rgba(212,175,55,0.04)', position: 'relative', overflow: 'hidden', cursor: outOfStock ? 'default' : 'pointer' }}
                    onClick={() => !outOfStock && setSelectedProduct(product)}
                  >
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
                        onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                        onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Package size={48} style={{ color: 'rgba(212,175,55,0.2)' }} />
                      </div>
                    )}
                    {product.category && (
                      <div style={{
                        position: 'absolute', top: '12px', right: '12px',
                        background: `linear-gradient(135deg, ${C.goldDark}, ${C.gold})`, color: '#000',
                        padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '700'
                      }}>
                        {product.category}
                      </div>
                    )}
                    {/* Quick view overlay */}
                    {!outOfStock && (
                      <div style={{
                        position: 'absolute', inset: 0,
                        background: 'rgba(0,0,0,0.4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        opacity: 0, transition: 'opacity 0.3s'
                      }}
                        onMouseEnter={e => e.currentTarget.style.opacity = 1}
                        onMouseLeave={e => e.currentTarget.style.opacity = 0}
                      >
                        <div style={{
                          background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)',
                          borderRadius: 12, padding: '10px 18px',
                          color: '#fff', fontSize: '0.82rem', fontWeight: 600,
                          display: 'flex', alignItems: 'center', gap: 6,
                          border: '1px solid rgba(255,255,255,0.2)'
                        }}>
                          <Eye size={14} /> Voir le détail
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <h3 style={{ fontSize: '1.05rem', marginBottom: '8px', fontWeight: '600', color: '#fff' }}>{product.name}</h3>
                    {product.description && (
                      <p style={{ fontSize: '0.82rem', color: C.muted, lineHeight: '1.5', marginBottom: '16px', flex: 1 }}>
                        {product.description.length > 100 ? product.description.substring(0, 100) + '...' : product.description}
                      </p>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', marginTop: 'auto' }}>
                      <span style={{ fontSize: '1.3rem', fontWeight: '700', color: C.gold }}>
                        {Number(product.price).toLocaleString('fr-FR')} F
                      </span>
                      {!outOfStock && (
                        inCart ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <button onClick={() => updateQty(product.id, -1)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Minus size={12} />
                            </button>
                            <span style={{ fontWeight: '700', color: C.gold }}>{inCart.qty}</span>
                            <button onClick={() => updateQty(product.id, 1)} style={{ background: `rgba(212,175,55,0.15)`, border: `1px solid ${C.gold}`, color: C.gold, width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Plus size={12} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(product)}
                            style={{
                              background: `linear-gradient(135deg, ${C.goldDark}, ${C.gold})`,
                              border: 'none', borderRadius: '10px',
                              color: '#000', fontWeight: '700',
                              fontSize: '0.78rem', padding: '8px 16px',
                              display: 'flex', alignItems: 'center', gap: '6px',
                              cursor: 'pointer', transition: 'transform 0.2s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                          >
                            <Plus size={14} /> Ajouter
                          </button>
                        )
                      )}
                    </div>

                    {/* Direct WhatsApp order button */}
                    {!outOfStock && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <button
                          onClick={() => handleDirectOrder(product)}
                          style={{
                            width: '100%',
                            background: 'rgba(37,211,102,0.08)',
                            border: `1px solid rgba(37,211,102,0.25)`,
                            borderRadius: '10px',
                            color: C.green,
                            padding: '10px',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            fontWeight: '600', fontSize: '0.8rem',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(37,211,102,0.15)'; e.currentTarget.style.borderColor = 'rgba(37,211,102,0.4)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(37,211,102,0.08)'; e.currentTarget.style.borderColor = 'rgba(37,211,102,0.25)'; }}
                        >
                          <MessageCircle size={15} />
                          Commander directement
                        </button>
                        
                        {product.payable_with_credits && (
                          <button
                            onClick={() => handlePayWithCredits(product)}
                            disabled={processingPayment}
                            style={{
                              width: '100%',
                              background: 'rgba(212,175,55,0.08)',
                              border: `1px solid rgba(212,175,55,0.25)`,
                              borderRadius: '10px',
                              color: C.gold,
                              padding: '10px',
                              cursor: processingPayment ? 'not-allowed' : 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                              fontWeight: '600', fontSize: '0.8rem',
                              transition: 'all 0.2s',
                              opacity: processingPayment ? 0.6 : 1
                            }}
                            onMouseEnter={e => { if(!processingPayment) { e.currentTarget.style.background = 'rgba(212,175,55,0.15)'; e.currentTarget.style.borderColor = 'rgba(212,175,55,0.4)'; } }}
                            onMouseLeave={e => { if(!processingPayment) { e.currentTarget.style.background = 'rgba(212,175,55,0.08)'; e.currentTarget.style.borderColor = 'rgba(212,175,55,0.25)'; } }}
                          >
                            <Gem size={15} />
                            Payer avec mes Crédits (-{product.credit_discount_pct || 20}%)
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Floating Cart Button */}
        {cartCount > 0 && (
          <button
            onClick={() => setShowCart(true)}
            style={{
              position: 'fixed', bottom: '90px', right: '24px',
              background: `linear-gradient(135deg, ${C.gold} 0%, ${C.goldDark} 100%)`,
              color: '#000', border: 'none', borderRadius: '50px',
              padding: '14px 22px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '10px',
              boxShadow: `0 8px 24px rgba(212,175,55,0.4)`,
              zIndex: 999, fontWeight: '700', fontSize: '0.9rem',
              animation: 'cartPulse 2s infinite'
            }}
          >
            <ShoppingCart size={18} />
            Panier ({cartCount}) — {cartTotal.toLocaleString('fr-FR')} F
          </button>
        )}
      </div>

      {/* ═══ Product Detail Modal ═══ */}
      {selectedProduct && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000 }}>
          <div onClick={() => setSelectedProduct(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)' }} />
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            background: '#111', borderRadius: '24px', overflow: 'hidden',
            width: '92%', maxWidth: '700px', maxHeight: '90vh',
            border: `1px solid rgba(212,175,55,0.2)`,
            boxShadow: '0 40px 80px rgba(0,0,0,0.7)',
            display: 'flex', flexDirection: 'column'
          }}>
            {/* Close */}
            <button onClick={() => setSelectedProduct(null)} style={{
              position: 'absolute', top: 16, right: 16, zIndex: 10,
              background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%',
              width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#fff'
            }}>
              <X size={18} />
            </button>

            {/* Image Gallery */}
            {(() => {
              const allImgs = [
                ...(selectedProduct.image_url ? [selectedProduct.image_url] : []),
                ...((selectedProduct.images || []).filter(u => u && u !== selectedProduct.image_url))
              ];
              const cur = allImgs[productModalImgIdx] || null;
              return (
                <div style={{ flexShrink: 0 }}>
                  {/* Main image */}
                  <div style={{ height: '280px', background: 'rgba(212,175,55,0.04)', overflow: 'hidden', position: 'relative' }}>
                    {cur ? (
                      <img src={cur} alt={selectedProduct.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Package size={64} style={{ color: 'rgba(212,175,55,0.15)' }} />
                      </div>
                    )}
                    {allImgs.length > 1 && (
                      <>
                        <button onClick={() => setProductModalImgIdx(i => (i - 1 + allImgs.length) % allImgs.length)} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: 34, height: 34, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
                        <button onClick={() => setProductModalImgIdx(i => (i + 1) % allImgs.length)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: 34, height: 34, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
                        <div style={{ position: 'absolute', bottom: 8, right: 12, background: 'rgba(0,0,0,0.6)', borderRadius: 20, padding: '2px 10px', fontSize: '0.72rem', color: '#fff' }}>{productModalImgIdx + 1}/{allImgs.length}</div>
                      </>
                    )}
                  </div>
                  {/* Thumbnails */}
                  {allImgs.length > 1 && (
                    <div style={{ display: 'flex', gap: 6, padding: '8px 16px', overflowX: 'auto', background: 'rgba(0,0,0,0.3)' }}>
                      {allImgs.map((src, i) => (
                        <img key={i} src={src} alt={'img-' + i} onClick={() => setProductModalImgIdx(i)}
                          style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 6, cursor: 'pointer', flexShrink: 0, border: productModalImgIdx === i ? '2px solid #d4af37' : '2px solid transparent', opacity: productModalImgIdx === i ? 1 : 0.55, transition: 'all 0.2s' }} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Details */}
            <div style={{ padding: '28px', overflowY: 'auto', flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
                <div>
                  {selectedProduct.category && (
                    <span style={{
                      display: 'inline-block', fontSize: '0.7rem', fontWeight: 700,
                      background: `linear-gradient(135deg, ${C.goldDark}, ${C.gold})`,
                      color: '#000', padding: '3px 10px', borderRadius: 20, marginBottom: 10
                    }}>
                      {selectedProduct.category}
                    </span>
                  )}
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', margin: '4px 0' }}>{selectedProduct.name}</h2>
                </div>
                <span style={{ fontSize: '1.6rem', fontWeight: 800, color: C.gold, whiteSpace: 'nowrap' }}>
                  {Number(selectedProduct.price).toLocaleString('fr-FR')} F
                </span>
              </div>

              {selectedProduct.description && (
                <p style={{ fontSize: '0.92rem', color: C.text, lineHeight: '1.7', marginBottom: 24 }}>
                  {selectedProduct.description}
                </p>
              )}

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button
                  onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}
                  style={{
                    flex: 1, minWidth: '180px',
                    background: `linear-gradient(135deg, ${C.goldDark}, ${C.gold})`,
                    border: 'none', borderRadius: 12,
                    color: '#000', fontWeight: 700,
                    padding: '14px 20px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    fontSize: '0.92rem', transition: 'transform 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <ShoppingCart size={16} />
                  Ajouter au panier
                </button>
                <button
                  onClick={() => { handleDirectOrder(selectedProduct); setSelectedProduct(null); }}
                  style={{
                    flex: 1, minWidth: '180px',
                    background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                    border: 'none', borderRadius: 12,
                    color: '#fff', fontWeight: 700,
                    padding: '14px 20px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    fontSize: '0.92rem', boxShadow: '0 4px 16px rgba(37,211,102,0.3)',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <MessageCircle size={16} />
                  WhatsApp
                </button>
                
                {selectedProduct.payable_with_credits && (
                  <button
                    onClick={() => { handlePayWithCredits(selectedProduct); }}
                    style={{
                      flex: 1, minWidth: '100%',
                      background: 'rgba(212,175,55,0.08)',
                      border: `1px solid rgba(212,175,55,0.25)`,
                      borderRadius: '12px',
                      color: C.gold, fontWeight: 700,
                      padding: '14px 20px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      fontSize: '0.92rem', transition: 'transform 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <Gem size={16} />
                    Payer avec mes Crédits (-{selectedProduct.credit_discount_pct || 20}%)
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Cart Drawer ═══ */}
      {showCart && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000 }}>
          <div onClick={() => setShowCart(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)' }} />
          <div style={{
            position: 'absolute', right: 0, top: 0, bottom: 0, width: '420px', maxWidth: '95vw',
            background: '#121212', borderLeft: `1px solid rgba(212,175,55,0.15)`,
            display: 'flex', flexDirection: 'column', padding: '24px',
            boxShadow: '-20px 0 60px rgba(0,0,0,0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px', color: '#fff' }}>
                <ShoppingCart size={20} style={{ color: C.gold }} />
                Mon Panier
              </h3>
              <button onClick={() => setShowCart(false)} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {cart.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px', color: C.muted }}>
                <ShoppingBag size={48} style={{ opacity: 0.2 }} />
                <p>Votre panier est vide</p>
              </div>
            ) : (
              <>
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {cart.map(item => (
                    <div key={item.id} style={{ display: 'flex', gap: '14px', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ width: '56px', height: '56px', borderRadius: '10px', overflow: 'hidden', background: 'rgba(212,175,55,0.08)', flexShrink: 0 }}>
                        {item.image_url
                          ? <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={20} style={{ color: 'rgba(212,175,55,0.3)' }} /></div>
                        }
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '4px', color: '#fff' }}>{item.name}</p>
                        <p style={{ fontSize: '0.8rem', color: C.gold }}>{Number(item.price).toLocaleString('fr-FR')} F</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button onClick={() => updateQty(item.id, -1)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', width: '26px', height: '26px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Minus size={11} />
                        </button>
                        <span style={{ fontWeight: '700', minWidth: '20px', textAlign: 'center', color: '#fff' }}>{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)} style={{ background: `rgba(212,175,55,0.15)`, border: `1px solid ${C.gold}`, color: C.gold, width: '26px', height: '26px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Plus size={11} />
                        </button>
                        <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', marginLeft: '4px' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total & Order */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px', marginTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '1.1rem', fontWeight: '700', color: '#fff' }}>
                    <span>Total</span>
                    <span style={{ color: C.gold }}>{cartTotal.toLocaleString('fr-FR')} F</span>
                  </div>
                  <button
                    onClick={handleOrder}
                    style={{
                      width: '100%',
                      background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                      color: '#fff', border: 'none', borderRadius: '12px',
                      padding: '16px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      gap: '10px', fontWeight: '700', fontSize: '1rem',
                      boxShadow: '0 4px 16px rgba(37,211,102,0.3)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <MessageCircle size={20} />
                    Commander via WhatsApp
                  </button>
                  <p style={{ fontSize: '0.75rem', color: C.muted, textAlign: 'center', marginTop: '10px' }}>
                    Vous serez redirigé vers WhatsApp avec votre commande pré-remplie
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}


      {/* ═══ Checkout Confirmation Modal ═══ */}
      {checkoutModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={() => setCheckoutModal(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)' }} />
          <div style={{
            position: 'relative', background: '#111', borderRadius: '24px', overflow: 'hidden',
            width: '92%', maxWidth: '500px', border: `1px solid ${C.gold}`,
            boxShadow: '0 40px 80px rgba(0,0,0,0.7)', display: 'flex', flexDirection: 'column',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.2rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ShoppingCart size={20} color={C.gold} />
                  Confirmer la commande
                </h3>
                <button onClick={() => setCheckoutModal(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>
            </div>
            <div style={{ padding: '24px', overflowY: 'auto', maxHeight: '50vh' }}>
              <p style={{ color: C.muted, fontSize: '0.9rem', marginBottom: '16px' }}>Voici le récapitulatif de votre panier :</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0' }}>
                {cart.map(item => (
                  <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.9rem', color: '#fff' }}>
                    <span>{item.qty}x {item.name}</span>
                    <span style={{ color: C.gold }}>{(item.price * item.qty).toLocaleString('fr-FR')} F</span>
                  </li>
                ))}
              </ul>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.1rem', color: '#fff' }}>
                <span>TOTAL</span>
                <span style={{ color: C.gold }}>{cartTotal.toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>
            <div style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setCheckoutModal(false)}
                style={{
                  flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)',
                  background: 'transparent', color: '#fff', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmOrder}
                style={{
                  flex: 1, padding: '14px', borderRadius: '12px', border: 'none',
                  background: `linear-gradient(135deg, ${C.goldDark}, ${C.gold})`, color: '#000',
                  fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: `0 4px 15px rgba(212,175,55,0.3)`, transition: 'transform 0.2s'
                }}
              >
                <Check size={18} />
                Valider l'achat
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes cartPulse {
          0%, 100% { box-shadow: 0 8px 24px rgba(212,175,55,0.4); }
          50% { box-shadow: 0 8px 36px rgba(212,175,55,0.7); }
        }
        @keyframes fadeOut {
          0% { opacity: 1; }
          70% { opacity: 1; }
          100% { opacity: 0; pointer-events: none; }
        }
      `}</style>
    </section>
  );
}

