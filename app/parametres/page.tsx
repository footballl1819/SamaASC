'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import AppShell from '@/components/app-shell';
import { useTeam } from '@/contexts/team-context';
import { Palette, Upload, Save, X, Check } from 'lucide-react';

export default function ParametresPage() {
  const router = useRouter();
  const { team, user, loading: contextLoading } = useTeam();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#020617');
  const [secondaryColor, setSecondaryColor] = useState('#e0f2fe');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [teamPhotoFile, setTeamPhotoFile] = useState<File | null>(null);
  const [teamPhotoPreview, setTeamPhotoPreview] = useState<string | null>(null);

  const COLORS = [
    '#22c55e', '#16a34a', '#15803d', '#3b82f6', '#2563eb', '#1d4ed8',
    '#8b5cf6', '#7c3aed', '#6d28d9', '#f59e0b', '#d97706', '#b45309',
    '#ef4444', '#dc2626', '#b91c1c', '#06b6d4', '#0891b2', '#0e7490',
    '#0ea5e9', '#0284c7', '#0369a1', '#ec4899', '#db2777', '#be185d'
  ];

  useEffect(() => {
    // Check authentication
    if (!contextLoading) {
      if (!team) {
        router.push('/login');
        return;
      }
      if (!user) {
        router.push('/user-login');
        return;
      }
      // Check if user is admin
      if (user.role !== 'admin') {
        router.push('/');
        return;
      }
    }
  }, [team, user, contextLoading, router]);

  useEffect(() => {
    if (team) {
      setName(team.name);
      setSlug(team.slug);
      setDescription(team.description || '');
      setPrimaryColor(team.primary_color || '#020617');
      setSecondaryColor(team.secondary_color || '#e0f2fe');
      setLogoPreview(team.logo_url);
      setTeamPhotoPreview(team.team_photo_url);
      setLoading(false);
    }
  }, [team]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTeamPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTeamPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setTeamPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!team) return;
    
    setSaving(true);
    setSuccess(false);

    try {
      let logoUrl = team.logo_url;
      let teamPhotoUrl = team.team_photo_url;

      // Upload logo if changed
      if (logoFile && supabase) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `${team.id}-${Date.now()}.${fileExt}`;
        const filePath = `team-logos/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('team-assets')
          .upload(filePath, logoFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('team-assets')
          .getPublicUrl(filePath);

        logoUrl = publicUrl;
      }

      // Upload team photo if changed
      if (teamPhotoFile && supabase) {
        const fileExt = teamPhotoFile.name.split('.').pop();
        const fileName = `${team.id}-photo-${Date.now()}.${fileExt}`;
        const filePath = `team-photos/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('team-assets')
          .upload(filePath, teamPhotoFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('team-assets')
          .getPublicUrl(filePath);

        teamPhotoUrl = publicUrl;
      }

      // Update team via API route
      const response = await fetch('/api/admin/team', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: team.id,
          name,
          slug,
          description,
          primary_color: primaryColor,
          secondary_color: secondaryColor,
          accent_color: primaryColor,
          nav_color: primaryColor,
          logo_url: logoUrl,
          team_photo_url: teamPhotoUrl,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update team');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
      // Reload team data to reflect changes
      window.location.reload();
    } catch (error) {
      console.error('Error saving team settings:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading || contextLoading) {
    return (
      <AppShell>
        <div className="space-y-4 pt-4">
          <div className="h-64 rounded-2xl bg-gray-100 animate-pulse" />
          <div className="h-20 rounded-xl bg-gray-100 animate-pulse" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-5 pt-4">
        {/* Page Header with Icon */}
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg icon-hover relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #e0f2fe 0%, #0ea5e9 50%, #0284c7 100%)',
              boxShadow: '0 4px 30px -4px rgba(14, 165, 233, 0.3)'
            }}
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#0ea5e9]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-14 h-14 bg-[#0284c7]/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
            <div className="relative z-10">
              <Palette size={24} className="text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-black drop-shadow-md">Paramètres</h1>
            <p className="text-sm text-gray-800 drop-shadow-sm">Personnalisation de l'équipe</p>
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div></div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #e0f2fe 0%, #020617 50%, #e0f2fe 100%)',
              borderColor: '#0ea5e9',
              boxShadow: '0 4px 30px -4px rgba(14, 165, 233, 0.3)'
            }}
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sauvegarde...
              </>
            ) : (
              <>
                <Save size={18} />
                Sauvegarder
              </>
            )}
          </button>
        </div>

        {/* Success message */}
        {success && (
          <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-xl">
            <Check size={20} className="text-green-600" />
            <span className="text-green-700 font-medium">Paramètres sauvegardés avec succès</span>
          </div>
        )}

        {/* Logo Upload */}
        <div className="rounded-2xl bg-white shadow-lg p-5">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Palette size={20} className="text-green-600" />
            Logo de l'équipe
          </h2>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Upload size={32} className="text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <input
                type="file"
                id="logo-upload"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
              />
              <label
                htmlFor="logo-upload"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors cursor-pointer"
              >
                <Upload size={18} />
                Choisir un logo
              </label>
              <p className="text-xs text-gray-500 mt-2">
                Formats acceptés: JPG, PNG, GIF (max 5MB)
              </p>
            </div>
          </div>
        </div>

        {/* Team Photo Upload */}
        <div className="rounded-2xl bg-white shadow-lg p-5">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Palette size={20} className="text-green-600" />
            Photo de l'équipe
          </h2>
          <div className="flex items-center gap-4">
            <div className="w-32 h-48 rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300">
              {teamPhotoPreview ? (
                <img src={teamPhotoPreview} alt="Photo de l'équipe" className="w-full h-full object-cover" />
              ) : (
                <Upload size={32} className="text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <input
                type="file"
                id="team-photo-upload"
                accept="image/*"
                onChange={handleTeamPhotoChange}
                className="hidden"
              />
              <label
                htmlFor="team-photo-upload"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors cursor-pointer"
              >
                <Upload size={18} />
                Choisir une photo
              </label>
              <p className="text-xs text-gray-500 mt-2">
                Formats acceptés: JPG, PNG, GIF (max 5MB)
              </p>
            </div>
          </div>
        </div>

        {/* Team Info */}
        <div className="rounded-2xl bg-white shadow-lg p-5">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Palette size={20} className="text-green-600" />
            Informations de l'équipe
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom de l'ASC
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm input-shadow focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
                placeholder="Ex: ASC Diambars"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug (identifiant unique)
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm input-shadow focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
                placeholder="Ex: asc-diambars"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm input-shadow focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 resize-none"
                placeholder="Décrivez votre équipe..."
              />
            </div>
          </div>
        </div>

        {/* Colors */}
        <div className="rounded-2xl bg-white shadow-lg p-5">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Palette size={20} className="text-green-600" />
            Couleurs de l'équipe
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Couleur Premium (dégradé foncé)
              </label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setPrimaryColor(color)}
                    className={`w-10 h-10 rounded-lg border-2 transition-all ${
                      primaryColor === color ? 'border-green-500 scale-110 shadow-lg' : 'border-gray-200 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Couleur Bleu Clair (dégradé clair)
              </label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSecondaryColor(color)}
                    className={`w-10 h-10 rounded-lg border-2 transition-all ${
                      secondaryColor === color ? 'border-green-500 scale-110 shadow-lg' : 'border-gray-200 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Color Preview */}
          <div className="mt-6 p-4 rounded-xl border border-gray-200">
            <p className="text-xs font-medium text-gray-500 mb-3">Aperçu</p>
            <div className="flex gap-2">
              <div
                className="w-16 h-16 rounded-lg shadow-md"
                style={{ backgroundColor: primaryColor }}
              />
              <div
                className="w-16 h-16 rounded-lg shadow-md"
                style={{ backgroundColor: secondaryColor }}
              />
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
