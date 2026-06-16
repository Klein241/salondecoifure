/**
 * fidelite.js — Logique métier complète du système de fidélité
 * Adapté pour Vite/React + Supabase (sans API Routes Next.js)
 * Respecte le skill thealphabeauty-fidelite v1.0
 */

import { supabase } from "./supabase"

const TENANT_ID = "default"

// ──────────────────────────────────────────────────────────────
// SETTINGS
// ──────────────────────────────────────────────────────────────

export function deriverParametres(settings) {
  const R = Number(settings?.reduction_max_acceptable_pct) || 40;
  return {
    ...settings,
    reduction_max_acceptable_pct: R,
    plafond_deduction_pct: settings?.plafond_deduction_pct_override ?? Math.floor(R * 0.8),
    reduction_boutique_max_pct: Math.floor(R * 0.9),
    taux_cashback_pct: settings?.taux_cashback_pct_override ?? Math.floor(R * 0.1),
  };
}

export async function getFideliteSettings() {
  if (!supabase) return deriverParametres(getDefaultSettings())
  try {
    const { data, error } = await supabase
      .from("fidelite_settings")
      .select("*")
      .eq("tenant_id", TENANT_ID)
      .single()
    if (error) throw error
    return deriverParametres(data)
  } catch (e) {
    console.error("getFideliteSettings:", e)
    return deriverParametres(getDefaultSettings())
  }
}

export async function updateFideliteSettings(updates) {
  if (!supabase) return null
  try {
    const { data, error } = await supabase
      .from("fidelite_settings")
      .upsert({ tenant_id: TENANT_ID, ...updates, updated_at: new Date().toISOString() })
      .select()
      .single()
    if (error) throw error
    return deriverParametres(data)
  } catch (e) {
    console.error("updateFideliteSettings:", e)
    return null
  }
}

function getDefaultSettings() {
  return {
    tenant_id: TENANT_ID,
    reduction_max_acceptable_pct: 40,
    valeur_point_fcfa: 10,
    taux_cashback_pct: 5,
    expiration_points_gagnes_jours: 60,
    plafond_deduction_pct: 10,
    montant_avance_resa: 2500,
    taux_reduction_resa_pct: 5,
    cumul_resa_points_interdit: true,
    points_parrainage_parrain: 100,
    reduction_parrainage_filleul_pct: 10,
    points_min_pour_utiliser: 50,
    cashback_sur_pack_actif: false
  }
}

// Guard — empêche toute division par zéro
function safeValeurPoint(settings) {
  return Math.max(0.1, Number(settings?.valeur_point_fcfa) || 10)
}

// ──────────────────────────────────────────────────────────────
// PACKS
// ──────────────────────────────────────────────────────────────

export async function getPacks() {
  if (!supabase) return []
  try {
    const { data, error } = await supabase
      .from("packs")
      .select("*")
      .eq("tenant_id", TENANT_ID)
      .eq("actif", true)
      .order("ordre", { ascending: true })
    if (error) throw error
    return data || []
  } catch (e) {
    console.error("getPacks:", e)
    return []
  }
}

export async function getAllPacks() {
  if (!supabase) return []
  try {
    const { data, error } = await supabase
      .from("packs")
      .select("*")
      .eq("tenant_id", TENANT_ID)
      .order("ordre", { ascending: true })
    if (error) throw error
    return data || []
  } catch (e) {
    console.error("getAllPacks:", e)
    return []
  }
}

export async function createPack(pack) {
  if (!supabase) return null
  try {
    const { data, error } = await supabase
      .from("packs")
      .insert([{ tenant_id: TENANT_ID, ...pack }])
      .select()
      .single()
    if (error) throw error
    return data
  } catch (e) {
    console.error("createPack:", e)
    return null
  }
}

export async function updatePack(id, updates) {
  if (!supabase) return null
  try {
    const { data, error } = await supabase
      .from("packs")
      .update(updates)
      .eq("id", id)
      .select()
      .single()
    if (error) throw error
    return data
  } catch (e) {
    console.error("updatePack:", e)
    return null
  }
}

export async function deletePack(id) {
  if (!supabase) return false
  try {
    const { error } = await supabase
      .from("packs")
      .update({ actif: false })
      .eq("id", id)
    if (error) throw error
    return true
  } catch (e) {
    console.error("deletePack:", e)
    return false
  }
}

// ──────────────────────────────────────────────────────────────
// WALLET (portefeuille)
// ──────────────────────────────────────────────────────────────

export async function getWallet(userId) {
  if (!supabase || !userId) return null
  try {
    const { data, error } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", userId)
      .eq("tenant_id", TENANT_ID)
      .maybeSingle()
    if (error) throw error
    return data
  } catch (e) {
    console.error("getWallet:", e)
    return null
  }
}

export async function getAllWallets() {
  if (!supabase) return []
  try {
    const { data, error } = await supabase
      .from("wallets")
      .select("*, profiles(nom, prenom, email, telephone)")
      .eq("tenant_id", TENANT_ID)
      .order("updated_at", { ascending: false })
    if (error) throw error
    return data || []
  } catch (e) {
    console.error("getAllWallets:", e)
    return []
  }
}

// Crée ou récupère le wallet d'un client
async function getOrCreateWallet(userId) {
  if (!supabase || !userId) return null
  try {
    const { data, error } = await supabase
      .from("wallets")
      .upsert(
        { user_id: userId, tenant_id: TENANT_ID },
        { onConflict: "user_id,tenant_id" }
      )
      .select()
      .single()
    if (error) throw error
    return data
  } catch (e) {
    console.error("getOrCreateWallet:", e)
    return null
  }
}

// Recalcule le wallet depuis les transactions (source de vérité)
async function recalculerWallet(walletId) {
  if (!supabase) return null
  try {
    const { data: txs, error } = await supabase
      .from("fidelite_transactions")
      .select("points_achetes_delta, points_gagnes_delta")
      .eq("wallet_id", walletId)
    if (error) throw error

    const points_achetes = Math.max(0, txs.reduce((s, t) => s + (t.points_achetes_delta || 0), 0))
    const points_gagnes = Math.max(0, txs.reduce((s, t) => s + (t.points_gagnes_delta || 0), 0))

    const { data, error: err2 } = await supabase
      .from("wallets")
      .update({ points_achetes, points_gagnes, updated_at: new Date().toISOString() })
      .eq("id", walletId)
      .select()
      .single()
    if (err2) throw err2
    return data
  } catch (e) {
    console.error("recalculerWallet:", e)
    return null
  }
}

// ──────────────────────────────────────────────────────────────
// TRANSACTIONS
// ──────────────────────────────────────────────────────────────

export async function getTransactions(userId) {
  if (!supabase || !userId) return []
  try {
    // D'abord récupérer le wallet
    const wallet = await getWallet(userId)
    if (!wallet) return []

    const { data, error } = await supabase
      .from("fidelite_transactions")
      .select("*")
      .eq("wallet_id", wallet.id)
      .order("created_at", { ascending: false })
      .limit(50)
    if (error) throw error
    return data || []
  } catch (e) {
    console.error("getTransactions:", e)
    return []
  }
}

export async function getAllTransactions() {
  if (!supabase) return []
  try {
    const { data, error } = await supabase
      .from("fidelite_transactions")
      .select("*, wallets(user_id, profiles(nom, prenom))")
      .eq("tenant_id", TENANT_ID)
      .order("created_at", { ascending: false })
      .limit(200)
    if (error) throw error
    return data || []
  } catch (e) {
    console.error("getAllTransactions:", e)
    return []
  }
}

// ──────────────────────────────────────────────────────────────
// ACHAT D'UN PACK — règle métier complète
// ──────────────────────────────────────────────────────────────

export async function acheterPack(userId, packId, createdBy) {
  if (!supabase) return { success: false, error: "Supabase non disponible" }

  try {
    const settings = await getFideliteSettings()

    // 1. Récupérer le pack
    const { data: pack, error: packErr } = await supabase
      .from("packs")
      .select("*")
      .eq("id", packId)
      .eq("actif", true)
      .single()
    if (packErr || !pack) return { success: false, error: "Pack introuvable" }

    // 2. Récupérer ou créer le wallet
    const wallet = await getOrCreateWallet(userId)
    if (!wallet) return { success: false, error: "Impossible de créer le portefeuille" }

    // 3. Calculer expiration des points bonus
    const expires_at = new Date()
    expires_at.setDate(expires_at.getDate() + settings.expiration_points_gagnes_jours)

    // 4. Créer la transaction
    const { data: tx, error: txErr } = await supabase
      .from("fidelite_transactions")
      .insert([{
        wallet_id: wallet.id,
        tenant_id: TENANT_ID,
        type: "achat_pack",
        points_achetes_delta: pack.points_base,
        points_gagnes_delta: pack.points_bonus,
        montant_fcfa: pack.prix_fcfa,
        expires_at: pack.points_bonus > 0 ? expires_at.toISOString() : null,
        note: `Achat pack: ${pack.nom}`,
        created_by: createdBy || userId
      }])
      .select()
      .single()
    if (txErr) throw txErr

    // 5. Cashback sur pack (si activé par l'admin)
    let cashbackPts = 0
    if (settings.cashback_sur_pack_actif) {
      const vpf = safeValeurPoint(settings)
      cashbackPts = Math.floor(pack.prix_fcfa * (settings.taux_cashback_pct / 100) / vpf)
      if (cashbackPts > 0) {
        const cbExpires = new Date()
        cbExpires.setDate(cbExpires.getDate() + settings.expiration_points_gagnes_jours)
        await supabase.from("fidelite_transactions").insert([{
          wallet_id: wallet.id,
          tenant_id: TENANT_ID,
          type: "cashback",
          points_achetes_delta: 0,
          points_gagnes_delta: cashbackPts,
          montant_fcfa: pack.prix_fcfa,
          expires_at: cbExpires.toISOString(),
          note: `Cashback achat pack: ${pack.nom}`,
          created_by: createdBy || userId
        }])
      }
    }

    // 6. Mettre à jour le wallet
    const { error: walletErr } = await supabase
      .from("wallets")
      .update({
        points_achetes: wallet.points_achetes + pack.points_base,
        points_gagnes: wallet.points_gagnes + pack.points_bonus + cashbackPts,
        updated_at: new Date().toISOString()
      })
      .eq("id", wallet.id)
    if (walletErr) throw walletErr

    // 7. Logger dans audit
    await logAudit(createdBy || userId, "achat_pack", {
      pack_nom: pack.nom,
      pack_prix: pack.prix_fcfa,
      points_base: pack.points_base,
      points_bonus: pack.points_bonus,
      cashback: cashbackPts,
      client_id: userId
    })

    return {
      success: true,
      transaction: tx,
      pack,
      nouveaux_points: {
        achetes: wallet.points_achetes + pack.points_base,
        gagnes: wallet.points_gagnes + pack.points_bonus + cashbackPts
      }
    }
  } catch (e) {
    console.error("acheterPack:", e)
    return { success: false, error: e.message }
  }
}

// ──────────────────────────────────────────────────────────────
// PAIEMENT SERVICE (déduction points) — règle métier complète
// Points gagnés consommés EN PREMIER, puis points achetés
// ──────────────────────────────────────────────────────────────

export async function payerAvecPoints(userId, serviceNom, prixService, pointsAUtiliser, createdBy) {
  if (!supabase) return { success: false, error: "Supabase non disponible" }

  try {
    const settings = await getFideliteSettings()
    const wallet = await getWallet(userId)
    if (!wallet) return { success: false, error: "Portefeuille introuvable" }

    const vpf = safeValeurPoint(settings)
    const soldeTotalPts = wallet.points_achetes + wallet.points_gagnes

    // Seuil minimum de points pour activer la déduction
    const seuil = Number(settings.points_min_pour_utiliser) || 0
    if (soldeTotalPts < seuil) {
      return {
        success: false,
        error: `Seuil non atteint. Vous avez ${soldeTotalPts} pts, minimum requis : ${seuil} pts.`
      }
    }

    // Calcul du plafond de déduction
    const plafond = Math.floor(
      prixService * (settings.plafond_deduction_pct / 100) / vpf
    )
    const pointsValides = Math.min(pointsAUtiliser, plafond, soldeTotalPts)

    // Vérification solde
    if (pointsAUtiliser > soldeTotalPts) {
      return {
        success: false,
        error: `Solde insuffisant. Vous avez ${soldeTotalPts} pts, vous demandez ${pointsAUtiliser} pts.`
      }
    }

    const reductionFcfa = pointsValides * vpf
    const prixCash = prixService - reductionFcfa

    // Consommer points_gagnes EN PREMIER (règle absolue)
    const pointsGagnesDelta = -Math.min(pointsValides, wallet.points_gagnes)
    const pointsAchetesDelta = -(pointsValides + pointsGagnesDelta)

    // Cashback sur la partie payée en cash
    const cashbackPts = Math.floor(
      prixCash * (settings.taux_cashback_pct / 100) / vpf
    )
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + settings.expiration_points_gagnes_jours)

    // Transaction déduction
    const { error: txErr1 } = await supabase
      .from("fidelite_transactions")
      .insert([{
        wallet_id: wallet.id,
        tenant_id: TENANT_ID,
        type: "deduction_service",
        points_achetes_delta: pointsAchetesDelta,
        points_gagnes_delta: pointsGagnesDelta,
        montant_fcfa: -reductionFcfa,
        note: `Déduction service: ${serviceNom}`,
        created_by: createdBy || userId
      }])
    if (txErr1) throw txErr1

    // Transaction cashback
    let cashbackTxId = null
    if (cashbackPts > 0) {
      const { data: cbTx, error: txErr2 } = await supabase
        .from("fidelite_transactions")
        .insert([{
          wallet_id: wallet.id,
          tenant_id: TENANT_ID,
          type: "cashback",
          points_achetes_delta: 0,
          points_gagnes_delta: cashbackPts,
          montant_fcfa: prixCash,
          expires_at: expiresAt.toISOString(),
          note: `Cashback service: ${serviceNom}`,
          created_by: createdBy || userId
        }])
        .select()
        .single()
      if (txErr2) throw txErr2
      cashbackTxId = cbTx?.id
    }

    // Mettre à jour le wallet
    const { error: walletErr } = await supabase
      .from("wallets")
      .update({
        points_achetes: Math.max(0, wallet.points_achetes + pointsAchetesDelta),
        points_gagnes: Math.max(0, wallet.points_gagnes + pointsGagnesDelta + cashbackPts),
        updated_at: new Date().toISOString()
      })
      .eq("id", wallet.id)
    if (walletErr) throw walletErr

    // Logger dans audit
    await logAudit(createdBy, "paiement_service", {
      service: serviceNom,
      prix_service: prixService,
      points_utilises: pointsValides,
      reduction_fcfa: reductionFcfa,
      prix_cash: prixCash,
      cashback_obtenu: cashbackPts,
      client_id: userId
    })

    return {
      success: true,
      prixCash,
      reductionFcfa,
      pointsUtilises: pointsValides,
      cashbackPts,
      expiresAt: expiresAt.toISOString()
    }
  } catch (e) {
    console.error("payerAvecPoints:", e)
    return { success: false, error: e.message }
  }
}

// ──────────────────────────────────────────────────────────────
// OCTROI MANUEL DE POINTS (admin/gérant)
// ──────────────────────────────────────────────────────────────

export async function octroierPointsAdmin(userId, type, pointsAchetes, pointsGagnes, note, adminId) {
  if (!supabase) return { success: false, error: "Supabase non disponible" }

  try {
    const settings = await getFideliteSettings()
    const wallet = await getOrCreateWallet(userId)
    if (!wallet) return { success: false, error: "Portefeuille introuvable" }

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + settings.expiration_points_gagnes_jours)

    const { error: txErr } = await supabase
      .from("fidelite_transactions")
      .insert([{
        wallet_id: wallet.id,
        tenant_id: TENANT_ID,
        type: "ajustement_admin",
        points_achetes_delta: pointsAchetes || 0,
        points_gagnes_delta: pointsGagnes || 0,
        expires_at: pointsGagnes > 0 ? expiresAt.toISOString() : null,
        note: note || "Ajustement manuel",
        created_by: adminId
      }])
    if (txErr) throw txErr

    const { error: walletErr } = await supabase
      .from("wallets")
      .update({
        points_achetes: Math.max(0, wallet.points_achetes + (pointsAchetes || 0)),
        points_gagnes: Math.max(0, wallet.points_gagnes + (pointsGagnes || 0)),
        updated_at: new Date().toISOString()
      })
      .eq("id", wallet.id)
    if (walletErr) throw walletErr

    await logAudit(adminId, "ajustement_admin", {
      client_id: userId,
      points_achetes: pointsAchetes,
      points_gagnes: pointsGagnes,
      note
    })

    return { success: true }
  } catch (e) {
    console.error("octroierPointsAdmin:", e)
    return { success: false, error: e.message }
  }
}

// ──────────────────────────────────────────────────────────────
// EXPIRATION AUTOMATIQUE DES POINTS GAGNÉS
// À déclencher manuellement ou via cron
// ──────────────────────────────────────────────────────────────

export async function expirerPointsPasses() {
  if (!supabase) return { success: false, expired: 0 }

  try {
    const now = new Date().toISOString()

    // Récupérer toutes les transactions de cashback expirées
    const { data: expirees, error } = await supabase
      .from("fidelite_transactions")
      .select("*, wallets(*)")
      .lt("expires_at", now)
      .gt("points_gagnes_delta", 0)
      .in("type", ["cashback", "achat_pack", "bonus_parrainage", "ajustement_admin"])
    if (error) throw error

    let compteur = 0
    for (const tx of expirees || []) {
      // Vérifier si cette transaction a déjà été expirée
      const { data: existing } = await supabase
        .from("fidelite_transactions")
        .select("id")
        .eq("type", "expiration")
        .like("note", `%${tx.id}%`)
        .maybeSingle()

      if (existing) continue // déjà expirée, idempotent

      const wallet = tx.wallets
      const pointsAExpirer = Math.min(tx.points_gagnes_delta, wallet?.points_gagnes || 0)
      if (pointsAExpirer <= 0) continue

      await supabase.from("fidelite_transactions").insert([{
        wallet_id: tx.wallet_id,
        tenant_id: TENANT_ID,
        type: "expiration",
        points_achetes_delta: 0,
        points_gagnes_delta: -pointsAExpirer,
        montant_fcfa: 0,
        note: `Expiration auto — tx origine: ${tx.id}`
      }])

      await supabase.from("wallets").update({
        points_gagnes: Math.max(0, (wallet?.points_gagnes || 0) - pointsAExpirer),
        updated_at: new Date().toISOString()
      }).eq("id", tx.wallet_id)

      compteur++
    }

    return { success: true, expired: compteur }
  } catch (e) {
    console.error("expirerPointsPasses:", e)
    return { success: false, error: e.message }
  }
}

// ──────────────────────────────────────────────────────────────
// RÉSERVATION ANTICIPÉE
// ──────────────────────────────────────────────────────────────

export async function creerReservationAnticipee(userId, serviceNom, prixService, dateRdv, noteClient) {
  if (!supabase) return { success: false, error: "Supabase non disponible" }

  try {
    const settings = await getFideliteSettings()

    const { data: resa, error } = await supabase
      .from("fidelite_reservations")
      .insert([{
        client_id: userId,
        tenant_id: TENANT_ID,
        service_nom: serviceNom,
        prix_service: prixService,
        date_rdv: dateRdv,
        statut: "en_attente",
        avance_payee: true,
        montant_avance: settings.montant_avance_resa,
        note_client: noteClient || null
      }])
      .select()
      .single()
    if (error) throw error

    return {
      success: true,
      reservation: resa,
      montant_avance: settings.montant_avance_resa,
      taux_reduction: settings.taux_reduction_resa_pct
    }
  } catch (e) {
    console.error("creerReservationAnticipee:", e)
    return { success: false, error: e.message }
  }
}

export async function honorerReservation(reservationId) {
  if (!supabase) return { success: false, error: "Supabase non disponible" }

  try {
    const settings = await getFideliteSettings()

    const { data: resa, error } = await supabase
      .from("fidelite_reservations")
      .select("*")
      .eq("id", reservationId)
      .single()
    if (error || !resa) return { success: false, error: "Réservation introuvable" }

    const reduction = (resa.prix_service * settings.taux_reduction_resa_pct / 100) + resa.montant_avance
    const prixFinal = Math.max(0, resa.prix_service - reduction)

    const { error: updErr } = await supabase
      .from("fidelite_reservations")
      .update({
        statut: "honoree",
        reduction_appliquee: reduction,
        prix_final_cash: prixFinal
      })
      .eq("id", reservationId)
    if (updErr) throw updErr

    return { success: true, prixFinal, reduction }
  } catch (e) {
    console.error("honorerReservation:", e)
    return { success: false, error: e.message }
  }
}

export async function getReservationsClient(userId) {
  if (!supabase || !userId) return []
  try {
    const { data, error } = await supabase
      .from("fidelite_reservations")
      .select("*")
      .eq("client_id", userId)
      .order("created_at", { ascending: false })
    if (error) throw error
    return data || []
  } catch (e) {
    console.error("getReservationsClient:", e)
    return []
  }
}

export async function getAllReservations() {
  if (!supabase) return []
  try {
    const { data, error } = await supabase
      .from("fidelite_reservations")
      .select("*, profiles(nom, prenom, telephone)")
      .eq("tenant_id", TENANT_ID)
      .order("date_rdv", { ascending: true })
    if (error) throw error
    return data || []
  } catch (e) {
    console.error("getAllReservations:", e)
    return []
  }
}

// ──────────────────────────────────────────────────────────────
// PARRAINAGE (intégration fidélité)
// ──────────────────────────────────────────────────────────────

export async function crediterPointsParrainage(parrainId, filleulId) {
  if (!supabase) return { success: false }
  try {
    const settings = await getFideliteSettings()
    const result = await octroierPointsAdmin(
      parrainId,
      "bonus_parrainage",
      0,
      settings.points_parrainage_parrain,
      `Parrainage filleul: ${filleulId}`,
      parrainId
    )
    return result
  } catch (e) {
    console.error("crediterPointsParrainage:", e)
    return { success: false }
  }
}

// ──────────────────────────────────────────────────────────────
// CALCULS UTILITAIRES — toutes les formules passent par settings
// Aucune valeur hardcodée — 100% piloté par l'admin
// ──────────────────────────────────────────────────────────────

export function calculerValeurWallet(wallet, settings) {
  if (!wallet || !settings) return { totalPts: 0, valeurFcfa: 0 }
  const vpf = safeValeurPoint(settings)
  const totalPts = (wallet.points_achetes || 0) + (wallet.points_gagnes || 0)
  const valeurFcfa = totalPts * vpf
  return { totalPts, valeurFcfa }
}

export function calculerPlafondDeduction(prixService, settings) {
  const vpf = safeValeurPoint(settings)
  return Math.floor(prixService * (settings.plafond_deduction_pct / 100) / vpf)
}

export function calculerCashback(prixCash, settings) {
  const vpf = safeValeurPoint(settings)
  return Math.floor(prixCash * (settings.taux_cashback_pct / 100) / vpf)
}

export function formatPoints(pts) {
  return Number(pts || 0).toLocaleString("fr-FR")
}

export function formatFcfa(montant) {
  return Number(montant || 0).toLocaleString("fr-FR") + " F"
}

// ──────────────────────────────────────────────────────────────
// FONCTIONS PURES DE SIMULATION — pour preview UI côté client
// Aucun appel Supabase — calculs instantanés
// ──────────────────────────────────────────────────────────────

/**
 * Simule un paiement de service avec points.
 * @param {number} prixService - prix du service en FCFA
 * @param {object} wallet - { points_achetes, points_gagnes }
 * @param {object} settings - fidelite_settings complet
 * @param {number} pointsDemandes - combien de points la cliente veut utiliser
 * @returns {object} résultat de la simulation
 */
export function simulerPaiement(prixService, wallet, settings, pointsDemandes) {
  const vpf = safeValeurPoint(settings)
  const soldeTotalPts = (wallet?.points_achetes || 0) + (wallet?.points_gagnes || 0)
  const seuil = Number(settings.points_min_pour_utiliser) || 0

  if (soldeTotalPts < seuil) {
    return {
      eligible: false,
      raison: `Seuil non atteint (${soldeTotalPts}/${seuil} pts)`,
      prixCash: prixService,
      reductionFcfa: 0,
      pointsUtilises: 0,
      cashbackPts: 0
    }
  }

  const plafond = Math.floor(prixService * (settings.plafond_deduction_pct / 100) / vpf)
  const pointsValides = Math.min(pointsDemandes || plafond, plafond, soldeTotalPts)
  const reductionFcfa = pointsValides * vpf
  const prixCash = Math.max(0, prixService - reductionFcfa)
  const cashbackPts = Math.floor(prixCash * (settings.taux_cashback_pct / 100) / vpf)

  // Détail de la consommation (gagnes d'abord)
  const ptsGagnesUtilises = Math.min(pointsValides, wallet?.points_gagnes || 0)
  const ptsAchetesUtilises = pointsValides - ptsGagnesUtilises

  return {
    eligible: true,
    prixCash,
    reductionFcfa,
    pointsUtilises: pointsValides,
    plafondPts: plafond,
    plafondFcfa: plafond * vpf,
    cashbackPts,
    cashbackValeurFcfa: cashbackPts * vpf,
    ptsGagnesUtilises,
    ptsAchetesUtilises,
    valeurPointFcfa: vpf
  }
}

/**
 * Simule l'achat d'un pack — preview pour le client
 * @param {object} pack - { prix_fcfa, points_base, points_bonus }
 * @param {object} settings - fidelite_settings complet
 * @returns {object} résultat de la simulation
 */
export function simulerAchatPack(pack, settings) {
  const vpf = safeValeurPoint(settings)
  const totalPoints = (pack?.points_base || 0) + (pack?.points_bonus || 0)
  const valeurPercue = totalPoints * vpf
  const economie = valeurPercue - (pack?.prix_fcfa || 0)
  const pourcentageGain = pack?.prix_fcfa > 0 ? Math.round((economie / pack.prix_fcfa) * 100) : 0

  // Cashback sur achat de pack (si activé par l'admin)
  let cashbackPts = 0
  if (settings.cashback_sur_pack_actif) {
    cashbackPts = Math.floor(pack.prix_fcfa * (settings.taux_cashback_pct / 100) / vpf)
  }

  return {
    totalPoints,
    valeurPercue,
    economie,
    pourcentageGain,
    cashbackPts,
    expirationJours: settings.expiration_points_gagnes_jours,
    valeurPointFcfa: vpf
  }
}

/**
 * Simule une réservation anticipée
 * @param {number} prixService
 * @param {object} settings
 * @returns {object}
 */
export function simulerReservation(prixService, settings) {
  const avance = Number(settings.montant_avance_resa) || 0
  const reduction = prixService * (settings.taux_reduction_resa_pct / 100)
  const prixFinal = Math.max(0, prixService - reduction - avance)
  return {
    avance,
    reductionFcfa: reduction,
    prixFinal,
    tauxReduction: settings.taux_reduction_resa_pct
  }
}

// ──────────────────────────────────────────────────────────────
// AUDIT LOG
// ──────────────────────────────────────────────────────────────

async function logAudit(userId, action, details) {
  if (!supabase) return
  try {
    await supabase.from("fidelite_audit_logs").insert([{
      tenant_id: TENANT_ID,
      user_id: userId,
      action,
      details
    }])
  } catch (e) {
    // Ne pas bloquer si audit échoue
    console.warn("logAudit failed:", e)
  }
}

export async function getAuditLogs(limit = 100) {
  if (!supabase) return []
  try {
    const { data, error } = await supabase
      .from("fidelite_audit_logs")
      .select("*, profiles(nom, prenom)")
      .eq("tenant_id", TENANT_ID)
      .order("created_at", { ascending: false })
      .limit(limit)
    if (error) throw error
    return data || []
  } catch (e) {
    console.error("getAuditLogs:", e)
    return []
  }
}

// ──────────────────────────────────────────────────────────────
// REALTIME — écoute des mises à jour du wallet
// ──────────────────────────────────────────────────────────────

export function subscribeWallet(userId, tenantId, onUpdate) {
  if (!supabase || !userId) return null
  const channel = supabase
    .channel(`wallet:${userId}:${tenantId || TENANT_ID}`)
    .on("postgres_changes", {
      event: "UPDATE",
      schema: "public",
      table: "wallets",
      filter: `user_id=eq.${userId}`
    }, (payload) => {
      onUpdate(payload.new)
    })
    .subscribe()
  return channel
}

export function unsubscribeWallet(channel) {
  if (supabase && channel) {
    supabase.removeChannel(channel)
  }
}

// ──────────────────────────────────────────────────────────────
// GESTION BOUTIQUE & STOCK
// ──────────────────────────────────────────────────────────────

export async function payerBoutique(userId, orderId, montantFcfa, pointsAUtiliser, createdBy) {
  if (!supabase) return { success: false, error: "Supabase non disponible" }

  try {
    const settings = await getFideliteSettings()
    const wallet = await getWallet(userId)
    if (!wallet) return { success: false, error: "Portefeuille introuvable" }

    const vpf = safeValeurPoint(settings)
    const soldeTotalPts = (wallet.points_achetes || 0) + (wallet.points_gagnes || 0)

    const seuil = Number(settings.points_min_pour_utiliser) || 0
    if (soldeTotalPts < seuil) {
      return { success: false, error: `Seuil non atteint (${soldeTotalPts}/${seuil} pts)` }
    }

    if (pointsAUtiliser > soldeTotalPts) {
      return { success: false, error: "Solde insuffisant." }
    }

    const reductionFcfa = pointsAUtiliser * vpf
    const prixCash = montantFcfa - reductionFcfa

    const pointsGagnesDelta = -Math.min(pointsAUtiliser, wallet.points_gagnes || 0)
    const pointsAchetesDelta = -(pointsAUtiliser + pointsGagnesDelta)

    const { error: txErr } = await supabase
      .from("fidelite_transactions")
      .insert([{
        wallet_id: wallet.id,
        tenant_id: TENANT_ID,
        type: "deduction_boutique",
        points_achetes_delta: pointsAchetesDelta,
        points_gagnes_delta: pointsGagnesDelta,
        montant_fcfa: -reductionFcfa,
        note: `Paiement boutique commande: ${orderId}`,
        created_by: createdBy || userId
      }])
    if (txErr) throw txErr

    const { error: walletErr } = await supabase
      .from("wallets")
      .update({
        points_achetes: Math.max(0, (wallet.points_achetes || 0) + pointsAchetesDelta),
        points_gagnes: Math.max(0, (wallet.points_gagnes || 0) + pointsGagnesDelta),
        updated_at: new Date().toISOString()
      })
      .eq("id", wallet.id)
    if (walletErr) throw walletErr

    await logAudit(createdBy || userId, "paiement_boutique", {
      order_id: orderId,
      montant_total: montantFcfa,
      points_utilises: pointsAUtiliser,
      reduction_fcfa: reductionFcfa,
      prix_cash: prixCash
    })

    return { success: true, prixCash, reductionFcfa, pointsUtilises: pointsAUtiliser }
  } catch (e) {
    console.error("payerBoutique:", e)
    return { success: false, error: e.message }
  }
}

export async function getOrdersAdmin() {
  if (!supabase) return []
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("tenant_id", TENANT_ID)
      .order("created_at", { ascending: false })
    if (error) throw error
    return data || []
  } catch (e) {
    console.error("getOrdersAdmin:", e)
    return []
  }
}

export async function createOrder(orderData) {
  if (!supabase) return null
  try {
    const { data, error } = await supabase
      .from("orders")
      .insert([{ tenant_id: TENANT_ID, ...orderData }])
      .select()
      .single()
    if (error) throw error
    return data
  } catch (e) {
    console.error("createOrder:", e)
    return null
  }
}

export async function getStockMovements(productId = null) {
  if (!supabase) return []
  try {
    let query = supabase.from("stock_movements")
      .select("*, profiles(nom, prenom)")
      .eq("tenant_id", TENANT_ID)
      .order("created_at", { ascending: false })
    if (productId) query = query.eq("product_id", productId)
    
    const { data, error } = await query
    if (error) throw error
    return data || []
  } catch (e) {
    console.error("getStockMovements:", e)
    return []
  }
}

export async function adjustStock(productId, productName, qty, movementType, note, adminId) {
  if (!supabase) return { success: false }
  try {
    const { data: prod, error: err1 } = await supabase.from("products").select("stock_quantity").eq("id", productId).single()
    if (err1) throw err1
    
    let currentQty = prod.stock_quantity || 0
    let delta = 0
    if (movementType === "entree" || movementType === "correction") delta = qty
    else if (movementType === "sortie_vente" || movementType === "sortie_ajustement") delta = -qty
    
    let newQty = currentQty + delta

    const { error: err2 } = await supabase.from("stock_movements").insert([{
      tenant_id: TENANT_ID,
      product_id: productId,
      product_name: productName,
      movement_type: movementType,
      quantity: Math.abs(qty),
      quantity_before: currentQty,
      quantity_after: newQty,
      note,
      created_by: adminId
    }])
    if (err2) throw err2

    const { error: err3 } = await supabase.from("products").update({ stock_quantity: newQty }).eq("id", productId)
    if (err3) throw err3

    return { success: true, newQty }
  } catch (e) {
    console.error("adjustStock:", e)
    return { success: false, error: e.message }
  }
}

