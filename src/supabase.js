import { createClient } from "@supabase/supabase-js"
import { servicesList, staffList, getStoredData, setStoredData } from "./data"

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
export async function getServices() {
  if (useSupabase()) {
    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("created_at", { ascending: true })
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

export async function addService(service) {
  if (useSupabase()) {
    try {
      const { data, error } = await supabase
        .from("services")
        .insert([service])
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
export async function getStaff() {
  if (useSupabase()) {
    try {
      const { data, error } = await supabase
        .from("staff")
        .select("*")
        .order("created_at", { ascending: true })
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
export async function getAppointments() {
  if (useSupabase()) {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .order("created_at", { ascending: false })
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
export async function getAffiliates() {
  if (useSupabase()) {
    try {
      const { data, error } = await supabase
        .from("affiliates")
        .select("*")
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
export async function getReviews() {
  if (useSupabase()) {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false })
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
export async function getPromoCodes() {
  if (useSupabase()) {
    try {
      const { data, error } = await supabase
        .from("promo_codes")
        .select("*")
        .order("created_at", { ascending: false })
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
export async function getGalleryImages() {
  if (useSupabase()) {
    try {
      const { data, error } = await supabase
        .from("gallery_images")
        .select("*")
        .order("created_at", { ascending: false })
      if (error) throw error
      return data.map(img => ({
        id: img.id,
        title: img.title,
        description: img.description || "",
        category: img.category || "Salon",
        image_url: img.image_url,
        image: img.image_url,
        created_at: img.created_at
      }))
    } catch (e) {
      console.error("Error fetching gallery images:", e)
    }
  }
  return getStoredData("gallery_images", [])
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
          image_url: image.image_url
        }])
        .select()
      if (error) throw error
      return { ...data[0], image: data[0].image_url }
    } catch (e) {
      console.error("Error adding gallery image:", e)
    }
  }
  const images = getStoredData("gallery_images", [])
  const newImg = { ...image, id: Date.now().toString(), image: image.image_url, created_at: new Date().toISOString() }
  images.unshift(newImg)
  setStoredData("gallery_images", images)
  return newImg
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
  const images = getStoredData("gallery_images", [])
  const filtered = images.filter(img => img.id !== id)
  setStoredData("gallery_images", filtered)
  return true
}