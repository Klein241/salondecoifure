import React, { useState } from 'react';
import {
  X,
  User,
  Lock,
  Phone,
  MapPin,
  Globe,
  KeyRound,
  CheckCircle2,
  ArrowRight,
  MessageCircle,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { COUNTRY_CONFIGS, CAMEROON_CITIES } from './marketplaceConstants';

export default function MemberRegisterModal({
  isOpen,
  onClose,
  isLight,
  initialMode = 'register', // 'login' | 'register' | 'reset'
  countryConfig = {},
  availableCities = CAMEROON_CITIES,
  officialWhatsapp,
  onLoginSuccess,
  onRegisterSuccess
}) {
  const [authMode, setAuthMode] = useState(initialMode); // 'login' | 'register' | 'reset'
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Synchronisation du mode lors de l'ouverture du modal
  React.useEffect(() => {
    if (isOpen) {
      setAuthMode(initialMode || 'register');
      setErrorMessage('');
      setSuccessMessage('');
    }
  }, [initialMode, isOpen]);

  // 1. FORMULAIRE D'INSCRIPTION (CHAMPS STRICTS AVEC DOUBLE SAISIE DU MOT DE PASSE)
  const [registerData, setRegisterData] = useState({
    name: '',
    gender: 'Homme', // 'Homme' | 'Femme'
    city: availableCities[0] || 'Douala',
    country: countryConfig.name || 'Cameroun',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  // 2. FORMULAIRE DE CONNEXION (2 CHAMPS)
  const [loginData, setLoginData] = useState({
    phone: '',
    password: ''
  });

  // 3. FORMULAIRE DE RÉINITIALISATION DU MOT DE PASSE
  const [resetData, setResetData] = useState({
    phone: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  // Validation de sécurité du mot de passe (min 8 car., 1 majuscule, 1 caractère spécial)
  const validatePasswordStrength = (pwd) => {
    const hasMinLen = (pwd || '').length >= 8;
    const hasUpper = /[A-Z]/.test(pwd || '');
    const hasSpecial = /[^a-zA-Z0-9]/.test(pwd || '');
    return {
      hasMinLen,
      hasUpper,
      hasSpecial,
      isValid: hasMinLen && hasUpper && hasSpecial
    };
  };

  if (!isOpen) return null;

  // Villes dynamiques selon le pays sélectionné
  const currentSelectedCountryConfig =
    Object.values(COUNTRY_CONFIGS).find((c) => c.name === registerData.country) || countryConfig;
  const citiesForSelectedCountry =
    currentSelectedCountryConfig?.cities && currentSelectedCountryConfig.cities.length > 0
      ? currentSelectedCountryConfig.cities
      : availableCities;

  // SOUMISSION DE L'INSCRIPTION
  const handleRegister = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!registerData.name.trim()) {
      setErrorMessage('Veuillez renseigner votre nom et prénom.');
      return;
    }
    if (!registerData.phone.trim()) {
      setErrorMessage('Veuillez renseigner votre numéro WhatsApp.');
      return;
    }

    const pwdCheck = validatePasswordStrength(registerData.password);
    if (!pwdCheck.hasMinLen) {
      setErrorMessage('Le mot de passe doit comporter au moins 8 caractères.');
      return;
    }
    if (!pwdCheck.hasUpper) {
      setErrorMessage('Le mot de passe doit contenir au moins une lettre majuscule (A-Z).');
      return;
    }
    if (!pwdCheck.hasSpecial) {
      setErrorMessage('Le mot de passe doit contenir au moins un caractère spécial (ex: @, #, $, !, %, etc.).');
      return;
    }
    if (registerData.password !== registerData.confirmPassword) {
      setErrorMessage('Les deux mots de passe ne correspondent pas. Veuillez les ressaisir à l\'identique.');
      return;
    }

    const city = registerData.city || 'Douala';
    const memberId = `${currentSelectedCountryConfig.codePrefix || 'CMR'}-${Math.floor(100000 + Math.random() * 900000)}`;

    const newAccount = {
      id: 'usr-' + Date.now(),
      name: registerData.name.trim(),
      gender: registerData.gender || 'Homme',
      city,
      country: registerData.country,
      phone: registerData.phone.trim(),
      password: registerData.password,
      memberId,
      createdAt: new Date().toISOString()
    };

    // 1. Sauvegarde dans la base locale des utilisateurs
    try {
      const existing = localStorage.getItem('ktfa_registered_users');
      const usersList = existing ? JSON.parse(existing) : [];
      // Remplacement si numéro déjà existant, ou ajout
      const filtered = usersList.filter(u => u.phone !== newAccount.phone);
      filtered.push(newAccount);
      localStorage.setItem('ktfa_registered_users', JSON.stringify(filtered));

      // 2. Sauvegarde de la session active
      const sessionProfile = { ...newAccount };
      delete sessionProfile.password;
      localStorage.setItem('ktfa_user_profile', JSON.stringify(sessionProfile));

      if (onRegisterSuccess) {
        onRegisterSuccess(sessionProfile);
      }
    } catch (err) {
      console.warn('[Register save error]:', err);
    }

    setSuccessMessage(`Compte créé avec succès ! Bienvenue ${newAccount.name}.`);
    setTimeout(() => {
      onClose();
      setSuccessMessage('');
    }, 1500);
  };

  // SOUMISSION DE LA CONNEXION
  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!loginData.phone.trim()) {
      setErrorMessage('Veuillez renseigner votre numéro WhatsApp.');
      return;
    }
    if (!loginData.password) {
      setErrorMessage('Veuillez renseigner votre mot de passe.');
      return;
    }

    try {
      const existing = localStorage.getItem('ktfa_registered_users');
      const usersList = existing ? JSON.parse(existing) : [];
      const cleanPhone = loginData.phone.trim().replace(/\s+/g, '');

      // Chercher l'utilisateur par téléphone
      const user = usersList.find(u => u.phone.replace(/\s+/g, '') === cleanPhone);

      if (user) {
        if (user.password === loginData.password) {
          const sessionProfile = { ...user };
          delete sessionProfile.password;
          localStorage.setItem('ktfa_user_profile', JSON.stringify(sessionProfile));
          if (onLoginSuccess) {
            onLoginSuccess(sessionProfile);
          }
          setSuccessMessage(`Ravi de vous revoir, ${user.name} !`);
          setTimeout(() => {
            onClose();
            setSuccessMessage('');
          }, 1200);
          return;
        } else {
          setErrorMessage('Mot de passe incorrect. Cliquez sur "Mot de passe oublié" pour le réinitialiser.');
          return;
        }
      }

      // Si l'utilisateur n'est pas trouvé dans la base locale, vérifions la session actuelle ou créons une session instantanée
      const activeSaved = localStorage.getItem('ktfa_user_profile');
      if (activeSaved) {
        const activeObj = JSON.parse(activeSaved);
        if (activeObj.phone && activeObj.phone.replace(/\s+/g, '') === cleanPhone) {
          if (onLoginSuccess) onLoginSuccess(activeObj);
          setSuccessMessage(`Connexion réussie !`);
          setTimeout(() => {
            onClose();
            setSuccessMessage('');
          }, 1200);
          return;
        }
      }

      // Proposer la création ou connexion automatique
      const fallbackAccount = {
        name: 'Client KTFA',
        phone: loginData.phone.trim(),
        city: countryConfig.primaryCity || 'Douala',
        country: countryConfig.name || 'Cameroun',
        memberId: `${countryConfig.codePrefix || 'CMR'}-${Math.floor(100000 + Math.random() * 900000)}`,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('ktfa_user_profile', JSON.stringify(fallbackAccount));
      if (onLoginSuccess) onLoginSuccess(fallbackAccount);
      setSuccessMessage('Connexion validée !');
      setTimeout(() => {
        onClose();
        setSuccessMessage('');
      }, 1200);

    } catch (err) {
      setErrorMessage('Erreur lors de la connexion. Veuillez réessayer.');
    }
  };

  // RÉINITIALISATION DU MOT DE PASSE (SÉCURITÉ STRICTE 8 CARACTÈRES & DOUBLE SAISIE)
  const handleResetPassword = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!resetData.phone.trim() || !resetData.newPassword.trim()) {
      setErrorMessage('Veuillez renseigner votre téléphone et votre nouveau mot de passe.');
      return;
    }

    const resetPwdCheck = validatePasswordStrength(resetData.newPassword);
    if (!resetPwdCheck.hasMinLen) {
      setErrorMessage('Le nouveau mot de passe doit comporter au moins 8 caractères.');
      return;
    }
    if (!resetPwdCheck.hasUpper) {
      setErrorMessage('Le nouveau mot de passe doit contenir au moins une lettre majuscule (A-Z).');
      return;
    }
    if (!resetPwdCheck.hasSpecial) {
      setErrorMessage('Le nouveau mot de passe doit contenir au moins un caractère spécial (ex: @, #, $, !, %, etc.).');
      return;
    }
    if (resetData.newPassword !== resetData.confirmNewPassword) {
      setErrorMessage('Les deux nouveaux mots de passe ne correspondent pas. Veuillez les retaper à l\'identique.');
      return;
    }

    try {
      const existing = localStorage.getItem('ktfa_registered_users');
      let usersList = existing ? JSON.parse(existing) : [];
      const cleanPhone = resetData.phone.trim().replace(/\s+/g, '');

      let userFound = false;
      usersList = usersList.map(u => {
        if (u.phone.replace(/\s+/g, '') === cleanPhone) {
          userFound = true;
          return { ...u, password: resetData.newPassword.trim() };
        }
        return u;
      });

      if (userFound) {
        localStorage.setItem('ktfa_registered_users', JSON.stringify(usersList));
        setSuccessMessage('Votre mot de passe a été mis à jour avec succès ! Vous pouvez maintenant vous connecter.');
        setTimeout(() => {
          setAuthMode('login');
          setSuccessMessage('');
        }, 1800);
      } else {
        // Enregistrer le nouveau compte avec ce mot de passe
        const newAcc = {
          name: 'Client KTFA',
          phone: resetData.phone.trim(),
          city: countryConfig.primaryCity || 'Douala',
          country: countryConfig.name || 'Cameroun',
          password: resetData.newPassword.trim(),
          memberId: `${countryConfig.codePrefix || 'CMR'}-${Math.floor(100000 + Math.random() * 900000)}`,
          createdAt: new Date().toISOString()
        };
        usersList.push(newAcc);
        localStorage.setItem('ktfa_registered_users', JSON.stringify(usersList));
        setSuccessMessage('Nouveau mot de passe enregistré ! Connexion...');
        setTimeout(() => {
          setAuthMode('login');
          setSuccessMessage('');
        }, 1500);
      }
    } catch (err) {
      setErrorMessage('Impossible de réinitialiser pour l\'instant.');
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-md max-h-[92vh] overflow-y-auto rounded-[32px] border-2 p-5 sm:p-7 shadow-2xl scrollbar-none transition-all ${
          isLight
            ? 'bg-gradient-to-b from-[#FFFFFF] via-[#FFFDF9] to-[#FAF5EE] border-amber-300 text-[#2C221D] shadow-[0_25px_60px_rgba(200,150,110,0.22),inset_0_2px_4px_rgba(255,255,255,1)]'
            : 'bg-slate-950 border-emerald-500/50 text-white shadow-[0_30px_70px_rgba(0,0,0,0.95)]'
        }`}
      >
        {/* LISERÉ DORÉ LUMINESCENT SUPÉRIEUR */}
        {isLight && (
          <div className="absolute top-0 inset-x-8 h-[2px] bg-gradient-to-r from-transparent via-amber-300/80 to-transparent pointer-events-none rounded-full" />
        )}

        {/* BOUTON FERMER */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 w-8 h-8 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${
            isLight ? 'bg-white hover:bg-amber-50 border-amber-200 text-[#6C584C] shadow-sm' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <X className="w-4 h-4" />
        </button>

        {/* EN-TÊTE : LOGO & ONGLET BASCULE (SE CONNECTER / CRÉER UN COMPTE) */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#D97706] to-[#F59E0B] text-white font-black mb-2 shadow-md">
            {authMode === 'login' ? <KeyRound className="w-6 h-6" /> : <User className="w-6 h-6" />}
          </div>
          <h2 className={`text-base sm:text-lg font-black ${isLight ? 'text-[#2C221D]' : 'text-white'}`}>
            {authMode === 'login' && 'Connexion à Mon Espace'}
            {authMode === 'register' && 'Créer un Compte KTFA FLEX'}
            {authMode === 'reset' && 'Réinitialiser mon Mot de Passe'}
          </h2>
          <p className={`text-[11px] mt-0.5 ${isLight ? 'text-[#8C7D73]' : 'text-slate-400'}`}>
            {authMode === 'login' && 'Accédez à votre historique d\'achats et suivi de tranches'}
            {authMode === 'register' && 'Remplissez ces 5 champs pour activer votre accès'}
            {authMode === 'reset' && 'Définissez votre nouveau mot de passe en 1 clic'}
          </p>

          {/* SÉLECTEUR D'ONGLETS 3D */}
          {authMode !== 'reset' && (
            <div className={`grid grid-cols-2 p-1 rounded-2xl border mt-3 ${
              isLight ? 'bg-amber-50/70 border-amber-200' : 'bg-slate-900 border-slate-800'
            }`}>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  authMode === 'login'
                    ? isLight
                      ? 'bg-white text-amber-900 shadow-md border border-amber-200'
                      : 'bg-emerald-600 text-white shadow-md'
                    : isLight ? 'text-[#6C584C] hover:text-[#2C221D]' : 'text-slate-400 hover:text-white'
                }`}
              >
                Se connecter
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  authMode === 'register'
                    ? isLight
                      ? 'bg-gradient-to-tr from-[#D97706] to-[#F59E0B] text-white shadow-md'
                      : 'bg-emerald-600 text-white shadow-md'
                    : isLight ? 'text-[#6C584C] hover:text-[#2C221D]' : 'text-slate-400 hover:text-white'
                }`}
              >
                Créer un compte
              </button>
            </div>
          )}
        </div>

        {/* MESSAGES D'ERREUR OU DE SUCCÈS */}
        {errorMessage && (
          <div className="mb-3.5 p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold text-center animate-in fade-in">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mb-3.5 p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold text-center flex items-center justify-center gap-1.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {successMessage}
          </div>
        )}

        {/* ======================================================== */}
        {/* 1. FORMULAIRE D'INSCRIPTION : LES 5 CHAMPS DEMANDÉS      */}
        {/* ======================================================== */}
        {authMode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3">
            {/* SÉLECTION DU SEXE (CIVILITÉ) */}
            <div>
              <label className={`block text-[11px] font-black uppercase tracking-wider mb-1 ${isLight ? 'text-[#4A3B32]' : 'text-slate-300'}`}>
                Sexe (Civilité)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRegisterData({ ...registerData, gender: 'Homme' })}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    registerData.gender === 'Homme'
                      ? isLight
                        ? 'bg-amber-100 border-amber-400 text-amber-950 font-black shadow-xs'
                        : 'bg-emerald-600/30 border-emerald-500 text-white font-black'
                      : isLight
                      ? 'bg-white border-amber-200/80 text-[#6C584C] hover:bg-amber-50'
                      : 'bg-slate-900 border-slate-700 text-slate-300'
                  }`}
                >
                  <span className="text-sm">👨</span>
                  <span>Homme</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRegisterData({ ...registerData, gender: 'Femme' })}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    registerData.gender === 'Femme'
                      ? isLight
                        ? 'bg-amber-100 border-amber-400 text-amber-950 font-black shadow-xs'
                        : 'bg-emerald-600/30 border-emerald-500 text-white font-black'
                      : isLight
                      ? 'bg-white border-amber-200/80 text-[#6C584C] hover:bg-amber-50'
                      : 'bg-slate-900 border-slate-700 text-slate-300'
                  }`}
                >
                  <span className="text-sm">👩</span>
                  <span>Femme</span>
                </button>
              </div>
            </div>

            {/* 1. NOM ET PRÉNOM */}
            <div>
              <label className={`block text-[11px] font-black uppercase tracking-wider mb-1 ${isLight ? 'text-[#4A3B32]' : 'text-slate-300'}`}>
                1. Nom et Prénom
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-amber-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="Ex: Jean-Luc Ewane"
                  value={registerData.name}
                  onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs font-medium focus:outline-none transition-all ${
                    isLight
                      ? 'bg-white border-amber-200 focus:border-amber-400 text-[#2C221D] shadow-xs'
                      : 'bg-slate-900 border-slate-700 focus:border-emerald-500 text-white'
                  }`}
                />
              </div>
            </div>

            {/* 2. VILLE DE RÉSIDENCE */}
            <div>
              <label className={`block text-[11px] font-black uppercase tracking-wider mb-1 ${isLight ? 'text-[#4A3B32]' : 'text-slate-300'}`}>
                2. Ville de résidence
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-amber-500 absolute left-3.5 top-3" />
                <select
                  value={registerData.city}
                  onChange={(e) => setRegisterData({ ...registerData, city: e.target.value })}
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs font-bold focus:outline-none transition-all cursor-pointer ${
                    isLight
                      ? 'bg-white border-amber-200 focus:border-amber-400 text-[#2C221D]'
                      : 'bg-slate-900 border-slate-700 focus:border-emerald-500 text-white'
                  }`}
                >
                  {citiesForSelectedCountry.map((c, i) => (
                    <option key={i} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 3. PAYS */}
            <div>
              <label className={`block text-[11px] font-black uppercase tracking-wider mb-1 ${isLight ? 'text-[#4A3B32]' : 'text-slate-300'}`}>
                3. Pays
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-amber-500 absolute left-3.5 top-3" />
                <select
                  value={registerData.country}
                  onChange={(e) => {
                    const countryName = e.target.value;
                    const conf = Object.values(COUNTRY_CONFIGS).find((c) => c.name === countryName);
                    const firstCity = conf?.cities?.[0] || 'Douala';
                    setRegisterData({
                      ...registerData,
                      country: countryName,
                      city: firstCity
                    });
                  }}
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs font-bold focus:outline-none transition-all cursor-pointer ${
                    isLight
                      ? 'bg-white border-amber-200 focus:border-amber-400 text-[#2C221D]'
                      : 'bg-slate-900 border-slate-700 focus:border-emerald-500 text-white'
                  }`}
                >
                  {Object.values(COUNTRY_CONFIGS).map((co) => (
                    <option key={co.id || co.codePrefix || co.name} value={co.name}>
                      {co.flag} {co.name} ({co.primaryCity})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 4. NUMÉRO WHATSAPP */}
            <div>
              <label className={`block text-[11px] font-black uppercase tracking-wider mb-1 ${isLight ? 'text-[#4A3B32]' : 'text-slate-300'}`}>
                4. Numéro WhatsApp
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-emerald-500 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  required
                  placeholder="Ex: 699 00 11 22 ou +237..."
                  value={registerData.phone}
                  onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs font-medium focus:outline-none transition-all ${
                    isLight
                      ? 'bg-white border-amber-200 focus:border-amber-400 text-[#2C221D] shadow-xs'
                      : 'bg-slate-900 border-slate-700 focus:border-emerald-500 text-white'
                  }`}
                />
              </div>
            </div>

            {/* 5. MOT DE PASSE (MIN. 8 CAR., MAJUSCULE & SPÉCIAL) */}
            <div>
              <label className={`block text-[11px] font-black uppercase tracking-wider mb-1 ${isLight ? 'text-[#4A3B32]' : 'text-slate-300'}`}>
                5. Mot de Passe
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-amber-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder="Min. 8 car. avec 1 majuscule et 1 symbole"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs font-medium focus:outline-none transition-all ${
                    isLight
                      ? 'bg-white border-amber-200 focus:border-amber-400 text-[#2C221D] shadow-xs'
                      : 'bg-slate-900 border-slate-700 focus:border-emerald-500 text-white'
                  }`}
                />
              </div>

              {/* RÈGLES DE SÉCURITÉ DU MOT DE PASSE EN TEMPS RÉEL */}
              {registerData.password && (
                <div className="mt-2 p-2 rounded-xl bg-black/5 dark:bg-white/5 text-[10px] space-y-1">
                  <div className={`flex items-center gap-1.5 ${registerData.password.length >= 8 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'}`}>
                    <span>{registerData.password.length >= 8 ? '✓' : '○'}</span>
                    <span>Au moins 8 caractères ({registerData.password.length}/8)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${/[A-Z]/.test(registerData.password) ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'}`}>
                    <span>{/[A-Z]/.test(registerData.password) ? '✓' : '○'}</span>
                    <span>Au moins une lettre majuscule (A-Z)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${/[^a-zA-Z0-9]/.test(registerData.password) ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'}`}>
                    <span>{/[^a-zA-Z0-9]/.test(registerData.password) ? '✓' : '○'}</span>
                    <span>Au moins un caractère spécial (@, #, $, !, %, etc.)</span>
                  </div>
                </div>
              )}
            </div>

            {/* 6. CONFIRMER LE MOT DE PASSE (SAISIR 2 FOIS AVANT VALIDATION) */}
            <div>
              <label className={`block text-[11px] font-black uppercase tracking-wider mb-1 ${isLight ? 'text-[#4A3B32]' : 'text-slate-300'}`}>
                6. Confirmer le Mot de Passe
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-emerald-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder="Retapez à l'identique votre mot de passe"
                  value={registerData.confirmPassword}
                  onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs font-medium focus:outline-none transition-all ${
                    registerData.confirmPassword && registerData.confirmPassword === registerData.password
                      ? 'border-emerald-500 focus:border-emerald-500'
                      : registerData.confirmPassword
                      ? 'border-red-400 focus:border-red-400'
                      : isLight
                      ? 'bg-white border-amber-200 focus:border-amber-400 text-[#2C221D] shadow-xs'
                      : 'bg-slate-900 border-slate-700 focus:border-emerald-500 text-white'
                  }`}
                />
              </div>

              {registerData.confirmPassword && (
                <div className="mt-1 text-[10px] font-bold">
                  {registerData.confirmPassword === registerData.password ? (
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      ✓ Mots de passe parfaitement identiques
                    </span>
                  ) : (
                    <span className="text-red-500 flex items-center gap-1">
                      ✗ Les mots de passe ne correspondent pas encore
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* BOUTON CRÉER MON COMPTE */}
            <button
              type="submit"
              className={`w-full py-3 rounded-2xl font-black text-xs transition-all shadow-md active:scale-95 cursor-pointer mt-4 flex items-center justify-center gap-2 ${
                isLight
                  ? 'bg-gradient-to-tr from-[#D97706] via-[#E58F4A] to-[#F59E0B] text-white shadow-[0_8px_20px_rgba(217,119,6,0.35),inset_0_2px_3px_rgba(255,255,255,0.4)]'
                  : 'bg-gradient-to-b from-emerald-400 to-emerald-600 text-slate-950 shadow-[0_8px_20px_rgba(16,185,129,0.5),inset_0_2px_3px_rgba(255,255,255,0.4)]'
              }`}
            >
              <span>Créer mon compte</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className={`text-xs font-bold transition-colors cursor-pointer ${
                  isLight ? 'text-amber-800 hover:text-amber-950 underline' : 'text-emerald-400 hover:text-emerald-300 underline'
                }`}
              >
                Déjà un compte ? Connectez-vous ici
              </button>
            </div>
          </form>
        )}

        {/* ======================================================== */}
        {/* 2. FORMULAIRE DE CONNEXION : TÉLÉPHONE + MOT DE PASSE    */}
        {/* ======================================================== */}
        {authMode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-3.5">
            {/* TÉLÉPHONE WHATSAPP */}
            <div>
              <label className={`block text-[11px] font-black uppercase tracking-wider mb-1 ${isLight ? 'text-[#4A3B32]' : 'text-slate-300'}`}>
                Numéro de Téléphone / WhatsApp
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-emerald-500 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  required
                  placeholder="Numéro utilisé lors de votre inscription"
                  value={loginData.phone}
                  onChange={(e) => setLoginData({ ...loginData, phone: e.target.value })}
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs font-medium focus:outline-none transition-all ${
                    isLight
                      ? 'bg-white border-amber-200 focus:border-amber-400 text-[#2C221D] shadow-xs'
                      : 'bg-slate-900 border-slate-700 focus:border-emerald-500 text-white'
                  }`}
                />
              </div>
            </div>

            {/* MOT DE PASSE */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className={`text-[11px] font-black uppercase tracking-wider ${isLight ? 'text-[#4A3B32]' : 'text-slate-300'}`}>
                  Mot de Passe
                </label>
                <button
                  type="button"
                  onClick={() => setAuthMode('reset')}
                  className={`text-[10px] font-bold cursor-pointer transition-colors ${
                    isLight ? 'text-amber-700 hover:text-amber-900 underline' : 'text-emerald-400 hover:text-emerald-300 underline'
                  }`}
                >
                  Mot de passe oublié ?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-amber-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder="Votre mot de passe"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs font-medium focus:outline-none transition-all ${
                    isLight
                      ? 'bg-white border-amber-200 focus:border-amber-400 text-[#2C221D] shadow-xs'
                      : 'bg-slate-900 border-slate-700 focus:border-emerald-500 text-white'
                  }`}
                />
              </div>
            </div>

            {/* BOUTON SE CONNECTER */}
            <button
              type="submit"
              className={`w-full py-3 rounded-2xl font-black text-xs transition-all shadow-md active:scale-95 cursor-pointer mt-4 flex items-center justify-center gap-2 ${
                isLight
                  ? 'bg-gradient-to-tr from-[#D97706] via-[#E58F4A] to-[#F59E0B] text-white shadow-[0_8px_20px_rgba(217,119,6,0.35),inset_0_2px_3px_rgba(255,255,255,0.4)]'
                  : 'bg-gradient-to-b from-emerald-400 to-emerald-600 text-slate-950 shadow-[0_8px_20px_rgba(16,185,129,0.5),inset_0_2px_3px_rgba(255,255,255,0.4)]'
              }`}
            >
              <span>Se connecter</span>
              <KeyRound className="w-4 h-4" />
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className={`text-xs font-bold transition-colors cursor-pointer ${
                  isLight ? 'text-amber-800 hover:text-amber-950 underline' : 'text-emerald-400 hover:text-emerald-300 underline'
                }`}
              >
                Pas encore de compte ? Créer un compte en 10 secondes
              </button>
            </div>
          </form>
        )}

        {/* ======================================================== */}
        {/* 3. RÉINITIALISATION DU MOT DE PASSE                     */}
        {/* ======================================================== */}
        {authMode === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-3.5">
            <div>
              <label className={`block text-[11px] font-black uppercase tracking-wider mb-1 ${isLight ? 'text-[#4A3B32]' : 'text-slate-300'}`}>
                Votre Numéro WhatsApp
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-emerald-500 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  required
                  placeholder="Numéro WhatsApp lié à votre compte"
                  value={resetData.phone}
                  onChange={(e) => setResetData({ ...resetData, phone: e.target.value })}
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs font-medium focus:outline-none transition-all ${
                    isLight
                      ? 'bg-white border-amber-200 focus:border-amber-400 text-[#2C221D]'
                      : 'bg-slate-900 border-slate-700 focus:border-emerald-500 text-white'
                  }`}
                />
              </div>
            </div>

            {/* NOUVEAU MOT DE PASSE */}
            <div>
              <label className={`block text-[11px] font-black uppercase tracking-wider mb-1 ${isLight ? 'text-[#4A3B32]' : 'text-slate-300'}`}>
                Nouveau Mot de Passe (Min. 8 car., 1 majuscule, 1 symbole)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-amber-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder="Min. 8 car. avec 1 majuscule et 1 symbole"
                  value={resetData.newPassword}
                  onChange={(e) => setResetData({ ...resetData, newPassword: e.target.value })}
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs font-medium focus:outline-none transition-all ${
                    isLight
                      ? 'bg-white border-amber-200 focus:border-amber-400 text-[#2C221D]'
                      : 'bg-slate-900 border-slate-700 focus:border-emerald-500 text-white'
                  }`}
                />
              </div>

              {/* RÈGLES VISUELLES */}
              {resetData.newPassword && (
                <div className="mt-1.5 p-2 rounded-xl bg-black/5 dark:bg-white/5 text-[10px] space-y-0.5">
                  <div className={`flex items-center gap-1 ${resetData.newPassword.length >= 8 ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                    <span>{resetData.newPassword.length >= 8 ? '✓' : '○'}</span>
                    <span>Au moins 8 caractères ({resetData.newPassword.length}/8)</span>
                  </div>
                  <div className={`flex items-center gap-1 ${/[A-Z]/.test(resetData.newPassword) ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                    <span>{/[A-Z]/.test(resetData.newPassword) ? '✓' : '○'}</span>
                    <span>Au moins 1 majuscule (A-Z)</span>
                  </div>
                  <div className={`flex items-center gap-1 ${/[^a-zA-Z0-9]/.test(resetData.newPassword) ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                    <span>{/[^a-zA-Z0-9]/.test(resetData.newPassword) ? '✓' : '○'}</span>
                    <span>Au moins 1 caractère spécial</span>
                  </div>
                </div>
              )}
            </div>

            {/* CONFIRMER NOUVEAU MOT DE PASSE */}
            <div>
              <label className={`block text-[11px] font-black uppercase tracking-wider mb-1 ${isLight ? 'text-[#4A3B32]' : 'text-slate-300'}`}>
                Confirmer le Nouveau Mot de Passe
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-emerald-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder="Retapez à l'identique votre nouveau mot de passe"
                  value={resetData.confirmNewPassword}
                  onChange={(e) => setResetData({ ...resetData, confirmNewPassword: e.target.value })}
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs font-medium focus:outline-none transition-all ${
                    resetData.confirmNewPassword && resetData.confirmNewPassword === resetData.newPassword
                      ? 'border-emerald-500 focus:border-emerald-500'
                      : resetData.confirmNewPassword
                      ? 'border-red-400 focus:border-red-400'
                      : isLight
                      ? 'bg-white border-amber-200 focus:border-amber-400 text-[#2C221D]'
                      : 'bg-slate-900 border-slate-700 focus:border-emerald-500 text-white'
                  }`}
                />
              </div>
              {resetData.confirmNewPassword && (
                <div className="mt-1 text-[10px] font-bold">
                  {resetData.confirmNewPassword === resetData.newPassword ? (
                    <span className="text-emerald-600 dark:text-emerald-400">✓ Mots de passe identiques</span>
                  ) : (
                    <span className="text-red-500">✗ Les mots de passe ne correspondent pas</span>
                  )}
                </div>
              )}
            </div>

            <button
              type="submit"
              className={`w-full py-3 rounded-2xl font-black text-xs transition-all shadow-md active:scale-95 cursor-pointer mt-3 flex items-center justify-center gap-2 ${
                isLight
                  ? 'bg-gradient-to-tr from-[#D97706] via-[#E58F4A] to-[#F59E0B] text-white shadow-md'
                  : 'bg-emerald-600 text-white shadow-md'
              }`}
            >
              <span>Valider mon nouveau mot de passe</span>
            </button>

            {officialWhatsapp && (
              <a
                href={`https://wa.me/${officialWhatsapp}?text=${encodeURIComponent(`Bonjour KTFA FLEX, j'ai oublié mon mot de passe pour mon compte lié au numéro ${resetData.phone || ''}. Pouvez-vous m'aider ?`)}`}
                target="_blank"
                rel="noreferrer"
                className={`w-full py-2.5 rounded-2xl font-bold text-xs border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isLight
                    ? 'bg-white hover:bg-emerald-50 border-emerald-300 text-emerald-700 shadow-xs'
                    : 'bg-slate-900 hover:bg-slate-850 border-emerald-500/40 text-emerald-300'
                }`}
              >
                <MessageCircle className="w-4 h-4 text-emerald-500" />
                <span>Assistance directe sur WhatsApp</span>
              </a>
            )}

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className={`text-xs font-bold transition-colors cursor-pointer ${
                  isLight ? 'text-amber-800 hover:text-amber-950 underline' : 'text-emerald-400 hover:text-emerald-300 underline'
                }`}
              >
                Retour à la connexion
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
