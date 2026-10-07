import React, { useState } from 'react';
import {
  Settings,
  MessageCircle,
  Save,
  Phone,
  X,
  CheckCircle2,
  Globe,
  Lock,
  Key,
  Database,
  Info,
} from 'lucide-react';
import { saveSettings } from '../api/cloudflare';

export function AdminPanel({ settings, onClose, onSettingsSaved }) {
  const [adminKey, setAdminKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [whatsapp, setWhatsapp] = useState(settings?.whatsapp_number || '');
  const [companyName, setCompanyName] = useState(settings?.company_name || '');
  const [tagline, setTagline] = useState(settings?.agency_tagline || '');
  const [email, setEmail] = useState(settings?.contact_email || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const ADMIN_KEY = 'dmp_admin_2026'; // Matches VARS in wrangler.toml

  const handleAuthenticate = () => {
    if (adminKey === ADMIN_KEY) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Clé d\'administration incorrecte.');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const newSettings = {
      whatsapp_number: whatsapp,
      company_name: companyName,
      agency_tagline: tagline,
      contact_email: email,
    };
    await saveSettings(newSettings);
    setSaving(false);
    setSaved(true);
    onSettingsSaved?.(newSettings);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#111624] border border-white/15 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-gradient-to-r from-[#111624] to-[#0d121c]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <Settings className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">Administration</h3>
              <p className="text-xs text-gray-400">DIGITAL MARK PRO · Config Cloudflare</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!isAuthenticated ? (
          /* Lock Screen */
          <div className="p-8 space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-amber-400" />
              </div>
              <h4 className="text-lg font-bold text-white">Accès Administrateur</h4>
              <p className="text-xs text-gray-400 mt-1">Entrez la clé d'administration pour configurer le site.</p>
            </div>

            <div className="space-y-3">
              <input
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAuthenticate()}
                placeholder="Clé d'administration..."
                className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-400 transition-colors"
              />
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <button
                onClick={handleAuthenticate}
                className="btn-primary w-full py-3 rounded-xl text-sm font-bold"
              >
                <Key className="w-4 h-4 mr-2" />
                Déverrouiller le panneau
              </button>
            </div>
          </div>
        ) : (
          /* Config Panel */
          <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            {/* WhatsApp Number (CRITICAL) */}
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
              <label className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-2 flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5" />
                Numéro WhatsApp Admin (OBLIGATOIRE)
              </label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="Ex: 24177000000 (sans + ni espaces)"
                className="w-full bg-black/30 border border-emerald-500/30 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-400 font-mono"
              />
              <p className="text-[11px] text-emerald-300/70 mt-1.5">
                Tous les clics "WhatsApp" du site enverront vers ce numéro. Format: indicatif + numéro sans +
              </p>
            </div>

            {/* Company Name */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-300 block mb-1.5">
                Nom de l'agence / entreprise
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="DIGITAL MARK PRO"
                className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Tagline */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-300 block mb-1.5">
                Slogan / Tagline de l'agence
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Studio Créatif Vidéo & Graphisme Publicitaire"
                className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-300 block mb-1.5">
                Email de contact
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@digitalmarkpro.com"
                className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Cloudflare Infra Info */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 space-y-2">
              <h5 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" />
                Infrastructure Cloudflare Active
              </h5>
              <div className="text-[11px] text-gray-400 space-y-1 font-mono">
                <div>🗄️ D1 Database: <span className="text-blue-300">digitalmarkpro-db</span></div>
                <div>💾 R2 Storage: <span className="text-blue-300">digitalmarkpro-assets</span></div>
                <div>⚡ Worker: <span className="text-blue-300">digital-mark-pro</span></div>
                <div>🌐 Account: <span className="text-blue-300">charlyingenu@gmail.com</span></div>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary w-full py-3.5 rounded-xl text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-black" />
              ) : saved ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Sauvegardé avec succès !
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Sauvegarder sur Cloudflare D1
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
