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
  const [backgroundColor, setBackgroundColor] = useState('#22c55e');
  const [buttonColor, setButtonColor] = useState('#15803d');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

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
      setBackgroundColor(team.primary_color || '#22c55e');
      setButtonColor(team.secondary_color || '#15803d');
      setLogoPreview(team.logo_url);
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

  const handleSave = async () => {
    if (!team) return;
    
    setSaving(true);
    setSuccess(false);

    try {
      let logoUrl = team.logo_url;

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

      // Update team via API route
      const response = await fetch('/api/admin/team', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: team.id,
          name,
          slug,
          description,
          primary_color: backgroundColor,
          secondary_color: buttonColor,
          accent_color: buttonColor,
          logo_url: logoUrl,
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
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg icon-hover"
            style={{ 
              background: team?.accent_color ? team.accent_color : '#15803d'
            }}
          >
            <Palette size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
            <p className="text-sm text-gray-500">Personnalisation de l'équipe</p>
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div></div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed btn-shadow"
            style={{ backgroundColor: team?.secondary_color || '#22c55e' }}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Couleur de fond
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-12 h-12 rounded-lg border-2 border-gray-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-sm input-shadow focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Couleur des boutons et champs
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={buttonColor}
                  onChange={(e) => setButtonColor(e.target.value)}
                  className="w-12 h-12 rounded-lg border-2 border-gray-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={buttonColor}
                  onChange={(e) => setButtonColor(e.target.value)}
                  className="flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-sm input-shadow focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
                />
              </div>
            </div>
          </div>

          {/* Color Preview */}
          <div className="mt-6 p-4 rounded-xl border border-gray-200">
            <p className="text-xs font-medium text-gray-500 mb-3">Aperçu</p>
            <div className="flex gap-2">
              <div
                className="w-16 h-16 rounded-lg shadow-md"
                style={{ backgroundColor: backgroundColor }}
              />
              <div
                className="w-16 h-16 rounded-lg shadow-md"
                style={{ backgroundColor: buttonColor }}
              />
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
