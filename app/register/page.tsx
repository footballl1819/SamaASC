'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User, ArrowRight, Check } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    setSlug(value);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!supabase) {
        setError('Erreur de connexion');
        setLoading(false);
        return;
      }
      // Check if slug already exists
      const { data: existingTeam } = await supabase
        .from('teams')
        .select('id')
        .eq('slug', slug)
        .single();

      if (existingTeam) {
        setError('Cet identifiant est déjà utilisé');
        setLoading(false);
        return;
      }

      // Create team
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .insert({
          name,
          slug,
          primary_color: '#3b82f6',
          secondary_color: '#1e40af',
          accent_color: '#f59e0b',
        })
        .select()
        .single();

      if (teamError) throw teamError;

      // Create custom user record for admin (without Supabase Auth)
      const adminEmail = `admin@${slug}.com`;
      const adminPassword = 'admin123';
      
      const { hashPassword } = await import('@/lib/auth-utils');
      const hashedPassword = await hashPassword(adminPassword);

      await supabase.from('users').insert({
        id: crypto.randomUUID(),
        team_id: team.id,
        username: 'admin',
        password: hashedPassword,
        name: 'Admin',
        role: 'admin',
      });

      setSuccess(true);
      
      // Redirect to user login with team slug
      setTimeout(() => {
        router.push(`/user-login?team=${slug}`);
      }, 1500);
    } catch (err) {
      console.error('Erreur lors de la création de l\'équipe:', err);
      setError('Erreur lors de la création de l\'équipe: ' + (err as Error).message);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Check size={40} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Équipe créée avec succès !</h2>
          <p className="text-gray-600">Un compte admin a été créé automatiquement (admin/admin123)</p>
          <p className="text-gray-500 text-sm mt-2">Redirection vers la connexion...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-4xl">⚽</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Sama ASC</h1>
          <p className="text-green-200">Créez votre équipe</p>
        </div>

        {/* Register Form */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de l'ASC
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
                  placeholder="Ex: ASC Diambars"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Identifiant (Slug)
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={slug}
                  onChange={handleSlugChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
                  placeholder="Ex: asc-diambars"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Utilisé pour l'URL de votre équipe
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  Créer mon équipe
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Déjà une équipe ?{' '}
              <button
                onClick={() => router.push('/login')}
                className="text-green-600 font-medium hover:underline"
              >
                Se connecter
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
