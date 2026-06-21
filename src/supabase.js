import { createClient } from "@supabase/supabase-js"
import { servicesList, staffList, galleryItems, getStoredData, setStoredData } from "./data"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ""
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ""

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null

if (!supabase) {
  console.warn("Supabase client could not be initialized. Falling back to local storage.")
}

const useSupabase = () => {
  return !!supabase
}

// -------------------------------------------------------------
// SERVICES (CRUD)
// -------------------------------------------------------------

// Helper to apply tenant filter to a Supabase query
function withTenant(query, tenantId) {
  if (tenantId) return query.eq('tenant_id', tenantId);
  return query;
}

export async function getServices(tenantId = null) {
  if (useSupabase()) {
    try {
      let _q = supabase .from("services") .select("*")
      if (tenantId) _q = _q.eq('tenant_id', tenantId)
      const { data, error } = await _q .order("created_at", { ascending: true })
      if (error) throw error
      if (data && data.length > 0) return data.map(s => ({
        ...s,
        image_url: s.image_url || null
      }))
    } catch (e) {
      console.error("Error fetching services from Supabase, falling back:", e)
    }
  }
  return getStoredData("custom_services", servicesList)
}

export async function addService(service, tenantId = null) {
  if (useSupabase()) {
    try {
      const { data, error } = await supabase
        .from("services")
        .insert([{ ...service, ...(tenantId ? { tenant_id: tenantId } : {}) }])
        .select()
      if (error) throw error
      return data[0]
    } catch (e) {
      console.error("Error adding service to Supabase, falling back:", e)
    }
  }
  const services = getStoredData("custom_services", servicesList)
  services.push(service)
  setStoredData("custom_services", services)
  return service
}

export async function updateService(id, serviceUpdates) {
  if (useSupabase()) {
    try {
      const { data, error } = await supabase
        .from("services")
        .update(serviceUpdates)
        .eq("id", id)
        .select()
      if (error) throw error
      return data[0]
    } catch (e) {
      console.error("Error updating service in Supabase, falling back:", e)
    }
  }
  const services = getStoredData("custom_services", servicesList)
  const updated = services.map(s => s.id === id ? { ...s, ...serviceUpdates } : s)
  setStoredData("custom_services", updated)
  return { id, ...serviceUpdates }
}

export async function deleteService(id) {
  if (useSupabase()) {
    try {
      const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", id)
      if (error) throw error
      return true
    } catch (e) {
      console.error("Error deleting service from Supabase, falling back:", e)
    }
  }
  const services = getStoredData("custom_services", servicesList)
  const filtered = services.filter(s => s.id !== id)
  setStoredData("custom_services", filtered)
  return true
}

// -------------------------------------------------------------
// STAFF / PRATICIENS (CRUD)
// -------------------------------------------------------------
export async function getStaff(tenantId = null) {
  if (useSupabase()) {
    try {
      let _q = supabase .from("staff") .select("*")
      if (tenantId) _q = _q.eq('tenant_id', tenantId)
      const { data, error } = await _q .order("created_at", { ascending: true })
      if (error) throw error
      if (data && data.length > 0) return data
    } catch (e) {
      console.error("Error fetching staff from Supabase, falling back:", e)
    }
  }
  return getStoredData("custom_staff", staffList)
}

export async function addStaff(member) {
  if (useSupabase()) {
    try {
      const { data, error } = await supabase
        .from("staff")
        .insert([member])
        .select()
      if (error) throw error
      return data[0]
    } catch (e) {
      console.error("Error adding staff to Supabase, falling back:", e)
    }
  }
  const staff = getStoredData("custom_staff", staffList)
  staff.push(member)
  setStoredData("custom_staff", staff)
  return member
}

export async function updateStaff(id, staffUpdates) {
  if (useSupabase()) {
    try {
      const { data, error } = await supabase
        .from("staff")
        .update(staffUpdates)
        .eq("id", id)
        .select()
      if (error) throw error
      return data[0]
    } catch (e) {
      console.error("Error updating staff in Supabase, falling back:", e)
    }
  }
  const staff = getStoredData("custom_staff", staffList)
  const updated = staff.map(s => s.id === id ? { ...s, ...staffUpdates } : s)
  setStoredData("custom_staff", updated)
  return { id, ...staffUpdates }
}

export async function deleteStaff(id) {
  if (useSupabase()) {
    try {
      const { error } = await supabase
        .from("staff")
        .delete()
        .eq("id", id)
      if (error) throw error
      return true
    } catch (e) {
      console.error("Error deleting staff from Supabase, falling back:", e)
    }
  }
  const staff = getStoredData("custom_staff", staffList)
  const filtered = staff.filter(s => s.id !== id)
  setStoredData("custom_staff", filtered)
  return true
}

// -------------------------------------------------------------
// APPOINTMENTS / RENDEZ-VOUS
// -------------------------------------------------------------
export async function getAppointments(tenantId = null) {
  if (useSupabase()) {
    try {
      let _q = supabase .from("appointments") .select("*")
      if (tenantId) _q = _q.eq('tenant_id', tenantId)
      const { data, error } = await _q .order("created_at", { ascending: false })
      if (error) throw error
      return data.map(app => ({
        id: app.id,
        clientName: app.client_name,
        clientEmail: app.client_email,
        clientPhone: app.client_phone,
        serviceId: app.service_id,
        serviceName: app.service_name,
        staffId: app.staff_id,
        staffName: app.staff_name,
        date: app.date,
        time: app.time,
        price: Number(app.price),
        status: app.status,
        referralUsed: app.referral_used,
        rescheduled: app.rescheduled,
        createdAt: app.created_at,
        promoCodeUsed: app.promo_code_used || null
      }))
    } catch (e) {
      console.error("Error fetching appointments from Supabase, falling back:", e)
    }
  }
  return getStoredData("appointments", [])
}

export async function createAppointment(app) {
  if (useSupabase()) {
    try {
      const dbApp = {
        id: app.id,
        client_name: app.clientName,
        client_email: app.clientEmail,
        client_phone: app.clientPhone,
        service_id: app.serviceId,
        service_name: app.serviceName,
        staff_id: app.staffId,
        staff_name: app.staffName,
        date: app.date,
        time: app.time,
        price: app.price,
        status: app.status || "En attente",
        referral_used: app.referralUsed || false,
        rescheduled: app.rescheduled || false,
        promo_code_used: app.promoCodeUsed || null
      }
      const { data, error } = await supabase
        .from("appointments")
        .insert([dbApp])
        .select()
      if (error) throw error
      return app
    } catch (e) {
      console.error("Error creating appointment in Supabase, falling back:", e)
    }
  }
  const appointments = getStoredData("appointments", [])
  appointments.push(app)
  setStoredData("appointments", appointments)
  return app
}

export async function updateAppointmentStatus(id, status) {
  if (useSupabase()) {
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status })
        .eq("id", id)
      if (error) throw error
      return true
    } catch (e) {
      console.error("Error updating appointment status in Supabase, falling back:", e)
    }
  }
  const appointments = getStoredData("appointments", [])
  const updated = appointments.map(app => app.id === id ? { ...app, status } : app)
  setStoredData("appointments", updated)
  return true
}

export async function rescheduleAppointment(id, date, time) {
  if (useSupabase()) {
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ date, time, rescheduled: true })
        .eq("id", id)
      if (error) throw error
      return true
    } catch (e) {
      console.error("Error rescheduling appointment in Supabase, falling back:", e)
    }
  }
  const appointments = getStoredData("appointments", [])
  const updated = appointments.map(app => app.id === id ? { ...app, date, time, rescheduled: true } : app)
  setStoredData("appointments", updated)
  return true
}

export async function deleteAppointment(id) {
  if (useSupabase()) {
    try {
      const { error } = await supabase
        .from("appointments")
        .delete()
        .eq("id", id)
      if (error) throw error
      return true
    } catch (e) {
      console.error("Error deleting appointment from Supabase, falling back:", e)
    }
  }
  const appointments = getStoredData("appointments", [])
  const filtered = appointments.filter(app => app.id !== id)
  setStoredData("appointments", filtered)
  return true
}

// -------------------------------------------------------------
// AFFILIATES / PARRAINAGES
// -------------------------------------------------------------
export async function getAffiliates(tenantId = null) {
  if (useSupabase()) {
    try {
      let _q = supabase .from("affiliates") .select("*")
      if (tenantId) _q = _q.eq('tenant_id', tenantId)
      const { data, error } = await _q
      if (error) throw error
      return data.map(aff => ({
        code: aff.code,
        clientEmail: aff.client_email,
        pointsEarned: aff.points_earned,
        totalReferrals: aff.total_referrals
      }))
    } catch (e) {
      console.error("Error fetching affiliates from Supabase:", e)
    }
  }
  return getStoredData("affiliates", [])
}

export async function getAffiliateByEmail(email) {
  if (useSupabase()) {
    try {
      const { data, error } = await supabase
        .from("affiliates")
        .select("*")
        .eq("client_email", email)
        .maybeSingle()
      if (error) throw error
      if (data) {
        return {
          code: data.code,
          clientEmail: data.client_email,
          pointsEarned: data.points_earned,
          totalReferrals: data.total_referrals
        }
      }
    } catch (e) {
      console.error("Error getting affiliate by email:", e)
    }
  }
  const affiliates = getStoredData("affiliates", [])
  return affiliates.find(aff => aff.clientEmail.toLowerCase() === email.toLowerCase())
}

export async function saveAffiliate(aff) {
  if (useSupabase()) {
    try {
      const dbAff = {
        code: aff.code,
        client_email: aff.clientEmail,
        points_earned: aff.pointsEarned,
        total_referrals: aff.totalReferrals
      }
      const { error } = await supabase
        .from("affiliates")
        .upsert(dbAff, { onConflict: "client_email" })
      if (error) throw error
      return aff
    } catch (e) {
      console.error("Error saving affiliate to Supabase:", e)
    }
  }
  const affiliates = getStoredData("affiliates", [])
  const idx = affiliates.findIndex(a => a.clientEmail.toLowerCase() === aff.clientEmail.toLowerCase())
  if (idx !== -1) {
    affiliates[idx] = aff
  } else {
    affiliates.push(aff)
  }
  setStoredData("affiliates", affiliates)
  return aff
}

// -------------------------------------------------------------
// REVIEWS / AVIS
// -------------------------------------------------------------
export async function getReviews(tenantId = null) {
  if (useSupabase()) {
    try {
      let _q = supabase .from("reviews") .select("*")
      if (tenantId) _q = _q.eq('tenant_id', tenantId)
      const { data, error } = await _q .order("created_at", { ascending: false })
      if (error) throw error
      return data.map(rev => ({
        appointmentId: rev.appointment_id,
        rating: rev.rating,
        comment: rev.comment,
        date: rev.date
      }))
    } catch (e) {
      console.error("Error fetching reviews from Supabase:", e)
    }
  }
  return getStoredData("reviews", [])
}

export async function createReview(review) {
  if (useSupabase()) {
    try {
      const dbRev = {
        appointment_id: review.appointmentId,
        rating: review.rating,
        comment: review.comment,
        date: review.date
      }
      const { error } = await supabase
        .from("reviews")
        .insert([dbRev])
      if (error) throw error
      return review
    } catch (e) {
      console.error("Error creating review in Supabase:", e)
    }
  }
  const reviews = getStoredData("reviews", [])
  reviews.push(review)
  setStoredData("reviews", reviews)
  return review
}

// -------------------------------------------------------------
// PROMO CODES / CODES PROMO (CRUD)
// -------------------------------------------------------------
export async function getPromoCodes(tenantId = null) {
  if (useSupabase()) {
    try {
      let _q = supabase .from("promo_codes") .select("*")
      if (tenantId) _q = _q.eq('tenant_id', tenantId)
      const { data, error } = await _q .order("created_at", { ascending: false })
      if (error) throw error
      return data.map(promo => ({
        code: promo.code,
        clientName: promo.client_name,
        discountPercent: promo.discount_percent,
        maxUses: promo.max_uses,
        currentUses: promo.current_uses,
        isActive: promo.is_active,
        createdAt: promo.created_at
      }))
    } catch (e) {
      console.error("Error fetching promo codes from Supabase, falling back:", e)
    }
  }
  return getStoredData("promo_codes", [])
}

export async function createPromoCode(promo) {
  if (useSupabase()) {
    try {
      const dbPromo = {
        code: promo.code,
        client_name: promo.clientName,
        discount_percent: promo.discountPercent,
        max_uses: promo.maxUses,
        current_uses: promo.currentUses || 0,
        is_active: promo.isActive !== undefined ? promo.isActive : true
      }
      const { data, error } = await supabase
        .from("promo_codes")
        .insert([dbPromo])
        .select()
      if (error) throw error
      return promo
    } catch (e) {
      console.error("Error creating promo code in Supabase, falling back:", e)
    }
  }
  const promos = getStoredData("promo_codes", [])
  promos.push(promo);
  setStoredData("promo_codes", promos);
  return promo;
}

export async function updatePromoCode(code, updates) {
  if (useSupabase()) {
    try {
      const dbUpdates = {}
      if (updates.clientName !== undefined) dbUpdates.client_name = updates.clientName
      if (updates.discountPercent !== undefined) dbUpdates.discount_percent = updates.discountPercent
      if (updates.maxUses !== undefined) dbUpdates.max_uses = updates.maxUses
      if (updates.currentUses !== undefined) dbUpdates.current_uses = updates.currentUses
      if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive

      const { data, error } = await supabase
        .from("promo_codes")
        .update(dbUpdates)
        .eq("code", code)
        .select()
      if (error) throw error
      return { code, ...updates }
    } catch (e) {
      console.error("Error updating promo code in Supabase, falling back:", e)
    }
  }
  const promos = getStoredData("promo_codes", [])
  const updated = promos.map(p => p.code === code ? { ...p, ...updates } : p)
  setStoredData("promo_codes", updated)
  return { code, ...updates }
}

export async function deletePromoCode(code) {
  if (useSupabase()) {
    try {
      const { error } = await supabase
        .from("promo_codes")
        .delete()
        .eq("code", code)
      if (error) throw error
      return true
    } catch (e) {
      console.error("Error deleting promo code from Supabase, falling back:", e)
    }
  }
  const promos = getStoredData("promo_codes", [])
  const filtered = promos.filter(p => p.code !== code)
  setStoredData("promo_codes", filtered)
  return true
}

export async function incrementPromoCodeUses(code) {
  if (useSupabase()) {
    try {
      const { data, error } = await supabase
        .from("promo_codes")
        .select("current_uses")
        .eq("code", code)
        .single()
      if (error) throw error
      
      const newUses = (data.current_uses || 0) + 1
      const { error: updateError } = await supabase
        .from("promo_codes")
        .update({ current_uses: newUses })
        .eq("code", code)
      if (updateError) throw updateError
      return true
    } catch (e) {
      console.error("Error incrementing promo code uses in Supabase, falling back:", e)
    }
  }
  const promos = getStoredData("promo_codes", [])
  const updated = promos.map(p => p.code === code ? { ...p, currentUses: (p.currentUses || 0) + 1 } : p)
  setStoredData("promo_codes", updated)
  return true;
}

// -------------------------------------------------------------
// IMAGE UPLOAD (Supabase Storage)
// -------------------------------------------------------------
export async function uploadImage(file, bucket = "gallery") {
  if (!useSupabase()) {
    console.warn("Supabase not available for image upload")
    // Fallback: create object URL for local preview
    return URL.createObjectURL(file)
  }
  try {
    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, { cacheControl: "3600", upsert: false })
    if (error) throw error

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName)

    return urlData?.publicUrl || null
  } catch (e) {
    console.error(`Error uploading image to ${bucket}:`, e)
    return null
  }
}

export async function deleteStorageFile(url, bucket = "gallery") {
  if (!useSupabase() || !url) return false
  try {
    const parts = url.split(`/storage/v1/object/public/${bucket}/`)
    if (parts.length < 2) return false
    const filePath = parts[1]
    const { error } = await supabase.storage.from(bucket).remove([filePath])
    if (error) throw error
    return true
  } catch (e) {
    console.error("Error deleting storage file:", e)
    return false
  }
}

// -------------------------------------------------------------
// GALLERY IMAGES (CRUD)
// -------------------------------------------------------------
export async function getGalleryImages(tenantId = null) {
  if (useSupabase()) {
    try {
      let _q = supabase .from("gallery_images") .select("*")
      if (tenantId) _q = _q.eq('tenant_id', tenantId)
      const { data, error } = await _q .order("created_at", { ascending: false })
      if (error) throw error
      return data.map(img => ({
        id: img.id,
        group_id: img.group_id || img.id,
        title: img.title,
        description: img.description || "",
        category: img.category || "Salon",
        subcategory_id: img.subcategory_id || null,
        image_url: img.image_url,
        image: img.image_url,
        created_at: img.created_at
      }))
    } catch (e) {
      console.error("Error fetching gallery images:", e)
    }
  }
  const localData = getStoredData("gallery_images", galleryItems);
  const hasNewImages = localData.some(img => img.image && img.image.startsWith('/gallery/'));
  if (!hasNewImages && galleryItems.length > 0) {
    const merged = [...galleryItems, ...localData.filter(img => !galleryItems.some(gi => gi.id === img.id))];
    setStoredData("gallery_images", merged);
    return merged;
  }
  return localData;
}

export async function addGalleryImage(image) {
  if (useSupabase()) {
    try {
      const { data, error } = await supabase
        .from("gallery_images")
        .insert([{
          title: image.title,
          description: image.description || "",
          category: image.category || "Salon",
          image_url: image.image_url,
          group_id: image.group_id || null,
          subcategory_id: image.subcategory_id || null
        }])
        .select()
      if (error) throw error
      return { ...data[0], image: data[0].image_url }
    } catch (e) {
      console.error("Error adding gallery image:", e)
    }
  }
  const images = getStoredData("gallery_images", galleryItems)
  const newImg = { ...image, id: Date.now().toString(), image: image.image_url, created_at: new Date().toISOString() }
  images.unshift(newImg)
  setStoredData("gallery_images", images)
  return newImg
}

export async function updateGalleryImage(id, data) {
  if (useSupabase()) {
    try {
      const { data: updated, error } = await supabase
        .from('gallery_images')
        .update(data)
        .eq('id', id)
        .select();
      if (error) throw error;
      return updated[0];
    } catch (e) {
      console.error('Error updating gallery image:', e);
    }
  }
  return null;
}

export async function deleteGalleryImage(id, imageUrl) {
  if (imageUrl) {
    await deleteStorageFile(imageUrl, "gallery")
  }
  if (useSupabase()) {
    try {
      const { error } = await supabase
        .from("gallery_images")
        .delete()
        .eq("id", id)
      if (error) throw error
      return true
    } catch (e) {
      console.error("Error deleting gallery image:", e)
    }
  }
  const images = getStoredData("gallery_images", galleryItems)
  const filtered = images.filter(img => img.id !== id)
  setStoredData("gallery_images", filtered)
  return true
}
// -------------------------------------------------------------
// SITE SETTINGS
// -------------------------------------------------------------
export async function getSiteSettings(tenantId = null) {
  if (useSupabase()) {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 'main')
        .single();
      if (error) throw error;
      return data;
    } catch (e) {
      console.error('Error fetching site settings:', e);
    }
  }
  return getStoredData('site_settings', {
    id: 'main',
    site_name: 'The Alpha Beauty',
    address: 'Alibadeng, Gabon',
    phone: '+241 077 00 40 73',
    whatsapp: '+241077004073',
    logo_url: null,
    favicon_url: null,
    promo_banner: '',
    allow_specialist_selection: true
  });
}

export async function updateSiteSettings(updates) {
  if (useSupabase()) {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .upsert({ id: 'main', ...updates, updated_at: new Date().toISOString() })
        .select();
      if (error) throw error;
      return data[0];
    } catch (e) {
      console.error('Error updating site settings:', e);
    }
  }
  const current = getStoredData('site_settings', {});
  const updated = { ...current, ...updates };
  setStoredData('site_settings', updated);
  return updated;
}

// -------------------------------------------------------------
// PRODUCTS (BOUTIQUE)
// -------------------------------------------------------------
export async function getProducts(tenantId = null) {
  if (useSupabase()) {
    try {
      let _q = supabase .from('products') .select('*')
      if (tenantId) _q = _q.eq('tenant_id', tenantId)
      const { data, error } = await _q .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    } catch (e) {
      console.error('Error fetching products:', e);
    }
  }
  return getStoredData('products', []);
}

export async function addProduct(product, tenantId = null) {
  if (useSupabase()) {
    try {
      const { name, description, price, category, image_url, images, in_stock, payable_with_credits, credit_discount_pct, stock_quantity, stock_alert_threshold, stock_enabled } = product;
      const { data, error } = await supabase
        .from('products')
        .insert([{ name, description, price: Number(price), category, image_url, images: images || [], in_stock, payable_with_credits: payable_with_credits || false, credit_discount_pct: credit_discount_pct || 20, stock_quantity: stock_quantity || 0, stock_alert_threshold: stock_alert_threshold || 5, stock_enabled: stock_enabled || false }])
        .select();
      if (error) throw error;
      return data[0];
    } catch (e) {
      console.error('Error adding product:', e);
    }
  }
  const products = getStoredData('products', []);
  const newProd = { ...product, id: Date.now().toString(), created_at: new Date().toISOString() };
  products.unshift(newProd);
  setStoredData('products', products);
  return newProd;
}

export async function updateProduct(id, updates) {
  if (useSupabase()) {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select();
      if (error) throw error;
      return data[0];
    } catch (e) {
      console.error('Error updating product:', e);
    }
  }
  const products = getStoredData('products', []);
  const updated = products.map(p => p.id === id ? { ...p, ...updates } : p);
  setStoredData('products', updated);
  return { id, ...updates };
}

export async function deleteProduct(id) {
  if (useSupabase()) {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      return true;
    } catch (e) {
      console.error('Error deleting product:', e);
    }
  }
  const products = getStoredData('products', []);
  setStoredData('products', products.filter(p => p.id !== id));
  return true;
}


// ===================== GALLERY CATEGORIES =====================
export async function getGalleryCategories(tenantId = null) {
  if (useSupabase()) {
    try {
      let _q = supabase .from('gallery_categories') .select('*')
      if (tenantId) _q = _q.eq('tenant_id', tenantId)
      const { data, error } = await _q .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error('Error fetching gallery categories:', e);
    }
  }
  return getStoredData('gallery_categories', []);
}

export async function addGalleryCategory(cat) {
  if (useSupabase()) {
    try {
      const { data, error } = await supabase
        .from('gallery_categories')
        .insert([{ name: cat.name, parent_id: cat.parent_id || null }])
        .select();
      if (error) throw error;
      return data[0];
    } catch (e) {
      console.error('Error adding gallery category:', e);
    }
  }
  const cats = getStoredData('gallery_categories', []);
  const newCat = { id: 'cat_' + Date.now(), name: cat.name, parent_id: cat.parent_id || null, created_at: new Date().toISOString() };
  cats.push(newCat);
  setStoredData('gallery_categories', cats);
  return newCat;
}

export async function deleteGalleryCategory(id) {
  if (useSupabase()) {
    try {
      const { error } = await supabase.from('gallery_categories').delete().eq('id', id);
      if (error) throw error;
      return true;
    } catch (e) {
      console.error('Error deleting gallery category:', e);
    }
  }
  const cats = getStoredData('gallery_categories', []);
  setStoredData('gallery_categories', cats.filter(c => c.id !== id && c.parent_id !== id));
  return true;
}

// ???????????????????????????????????????
// HERO BANNERS (Carousel Accueil)
// ???????????????????????????????????????

export async function getHeroBanners(tenantId = null) {
  if (useSupabase()) {
    try {
      let _q = supabase .from('gallery_images') .select('*')
      if (tenantId) _q = _q.eq('tenant_id', tenantId)
      const { data, error } = await _q .eq('category', 'HERO_BANNER') .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error('Error fetching hero banners:', e);
    }
  }
  return getStoredData('hero_banners', []);
}

export async function addHeroBanner(banner) {
  if (useSupabase()) {
    try {
      const { data, error } = await supabase
        .from('gallery_images')
        .insert([{
          image_url: banner.image_url,
          title: banner.title || "",
          category: 'HERO_BANNER'
        }])
        .select();
      if (error) throw error;
      return data?.[0];
    } catch (e) {
      console.error('Error adding hero banner:', e);
    }
  }
  const banners = getStoredData('hero_banners', []);
  const newB = { id: 'hb_' + Date.now(), ...banner };
  banners.push(newB);
  setStoredData('hero_banners', banners);
  return newB;
}

export async function deleteHeroBanner(id, image_url) {
  if (useSupabase()) {
    try {
      const { error } = await supabase.from('gallery_images').delete().eq('id', id);
      if (error) throw error;
      // Try to delete from storage too
      if (image_url) {
        const path = image_url.split('/storage/v1/object/public/')[1];
        if (path) {
          try { await supabase.storage.from(path.split('/')[0]).remove([path.split('/').slice(1).join('/')]); } catch(e) {}
        }
      }
      return true;
    } catch (e) {
      console.error('Error deleting hero banner:', e);
    }
  }
  const banners = getStoredData('hero_banners', []);
  setStoredData('hero_banners', banners.filter(b => b.id !== id));
  return true;
}

export async function updateHeroBannerOrder(banners) {
  if (useSupabase()) {
    try {
      // sort_order not natively in gallery_images
      return true;
    } catch (e) {
      console.error('Error updating banner order:', e);
    }
  }
  setStoredData('hero_banners', banners);
  return true;
}

// =====================================================================
// MULTI-TENANT FUNCTIONS
// =====================================================================


// Abaia Cosmetique default theme (injected if no DB theme found)
const ABAIA_DEFAULT_THEME = {
  "--bg-color": "#FDF6EC",
  "--panel-bg": "rgba(255, 252, 245, 0.95)",
  "--panel-border": "rgba(197, 165, 90, 0.18)",
  "--primary-gold": "#B8860B",
  "--light-gold": "#E8D5A3",
  "--dark-gold": "#7B5A00",
  "--text-primary": "#1C1C1C",
  "--text-secondary": "#5A5040",
  "--accent-red": "#8B4513",
  "--gold-grad": "linear-gradient(135deg, #B8860B 0%, #E8D5A3 35%, #8B6914 70%, #E8D5A3 85%, #B8860B 100%)",
  "--gold-text-grad": "linear-gradient(135deg, #B8860B 0%, #D4A017 50%, #7B5A00 100%)",
  "--font-serif": "'Cormorant Garamond', 'Georgia', serif",
  "--font-sans": "'Poppins', system-ui, sans-serif",
  "--transition-smooth": "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
};

const TENANT_DEFAULT_THEMES = {
  'abaia-local': ABAIA_DEFAULT_THEME,
  'abaia': ABAIA_DEFAULT_THEME,
};

// ─── Demo tenants (fallback when Supabase table does not exist) ───────────────
const DEFAULT_TENANTS = [
  {
    id: 'alpha-beauty-local',
    slug: 'alpha-beauty',
    name: 'The Alpha Beauty',
    template: 'beauty_salon',
    logo_url: null,
    favicon_url: null,
    owner_email: 'admin@alpha.com',
    active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'abaia-local',
    slug: 'abaia',
    name: 'Abaia Cosmetique',
    template: 'cosmetics',
    logo_url: null,
    favicon_url: null,
    owner_email: 'contact@abaia.com',
    active: true,
    created_at: new Date().toISOString()
  }
]

// ─── Default themes per tenant slug (fallback when DB not migrated) ──────────

export async function getTenantBySlug(slug) {
  if (useSupabase()) {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('slug', slug)
        .eq('active', true)
        .single();
      if (error) throw error;
      return data;
    } catch (e) {
      console.warn('getTenantBySlug fallback:', e.message);
    }
  }
  const storedTenants = getStoredData('tenants', DEFAULT_TENANTS);
  return storedTenants.find(t => t.slug === slug) || null;
}

export async function getTenantTheme(tenantId) {
  if (useSupabase()) {
    try {
      const { data, error } = await supabase
        .from('tenant_themes')
        .select('*')
        .eq('tenant_id', tenantId)
        .single();
      if (error) throw error;
      return data;
    } catch (e) {
      console.warn('getTenantTheme fallback:', e.message);
    }
  }
  const defaultTheme = TENANT_DEFAULT_THEMES[tenantId] || null;
  const stored = getStoredData('theme_' + tenantId, null);
  if (stored) return stored;
  if (defaultTheme) return { tenant_id: tenantId, theme_data: defaultTheme, mode: 'light' };
  return null;
}

export async function updateTenantTheme(tenantId, themeData) {
  if (useSupabase()) {
    try {
      const { data, error } = await supabase
        .from('tenant_themes')
        .upsert({ tenant_id: tenantId, theme_data: themeData, updated_at: new Date().toISOString() })
        .select();
      if (error) throw error;
      return data?.[0];
    } catch (e) {
      console.error('updateTenantTheme error:', e);
    }
  }
  setStoredData('theme_' + tenantId, { tenant_id: tenantId, theme_data: themeData });
  return { tenant_id: tenantId, theme_data: themeData };
}

export async function listAllTenants() {
  if (useSupabase()) {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('*, tenant_themes(*)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error('listAllTenants error:', e);
    }
  }
  return getStoredData('tenants', [
    { id: 'alpha-beauty-local', slug: 'alpha-beauty', name: 'The Alpha Beauty', template: 'beauty_salon', logo_url: null, active: true, created_at: new Date().toISOString() }
  ]);
}

export async function createTenant(config) {
  if (useSupabase()) {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .insert([{
          slug: config.slug,
          name: config.name,
          template: config.template || 'beauty_salon',
          owner_email: config.owner_email || null,
          logo_url: config.logo_url || null,
          favicon_url: config.favicon_url || null,
          domain: config.domain || null,
          active: true
        }])
        .select();
      if (error) throw error;
      // Create default theme
      if (data?.[0]) {
        await supabase.from('tenant_themes').insert([{
          tenant_id: data[0].id,
          theme_data: config.theme_data || {},
          mode: config.mode || 'dark'
        }]);
      }
      return data?.[0];
    } catch (e) {
      console.error('createTenant error:', e);
    }
  }
  const tenants = getStoredData('tenants', []);
  const newT = { id: 'tenant_' + Date.now(), ...config, active: true, created_at: new Date().toISOString() };
  tenants.push(newT);
  setStoredData('tenants', tenants);
  return newT;
}

export async function updateTenant(id, updates) {
  if (useSupabase()) {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select();
      if (error) throw error;
      return data?.[0];
    } catch (e) {
      console.error('updateTenant error:', e);
    }
  }
  const tenants = getStoredData('tenants', []);
  const updated = tenants.map(t => t.id === id ? { ...t, ...updates } : t);
  setStoredData('tenants', updated);
  return updated.find(t => t.id === id);
}

export async function deleteTenant(id) {
  if (useSupabase()) {
    try {
      const { error } = await supabase.from('tenants').delete().eq('id', id);
      if (error) throw error;
      return true;
    } catch (e) {
      console.error('deleteTenant error:', e);
    }
  }
  const tenants = getStoredData('tenants', []);
  setStoredData('tenants', tenants.filter(t => t.id !== id));
  return true;
}

export async function getTenantStats(tenantId) {
  if (useSupabase()) {
    try {
      const [svcs, appts, prods, imgs] = await Promise.all([
        supabase.from('services').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId),
        supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId),
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId),
        supabase.from('gallery_images').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId)
      ]);
      return {
        services: svcs.count || 0,
        appointments: appts.count || 0,
        products: prods.count || 0,
        images: imgs.count || 0
      };
    } catch (e) {
      console.error('getTenantStats error:', e);
    }
  }
  return { services: 0, appointments: 0, products: 0, images: 0 };
}

export async function getSuperAdminProfile(userId) {
  if (useSupabase()) {
    try {
      const { data, error } = await supabase
        .from('superadmin_users')
        .select('*')
        .eq('user_id', userId)
        .single();
      if (error) throw error;
      return data;
    } catch (e) {
      return null;
    }
  }
  return null;
}



