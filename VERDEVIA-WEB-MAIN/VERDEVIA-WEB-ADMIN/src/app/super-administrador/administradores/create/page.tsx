'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminsService, { AdminRole } from '@/services/admins.service';
import { showToast } from '@/lib/toast';

export default function CreateAdminPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '' as AdminRole | '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Validation
    const newErrors: Record<string, string> = {};
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }
    const adminPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{15,}$/;
    if (!adminPasswordRegex.test(formData.password)) {
      newErrors.password = 'A senha administrativa deve ter mais de 14 caracteres, com letras maiusculas, minusculas e numeros, usando apenas caracteres alfanumericos';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      await AdminsService.createAdmin({
        name: formData.name,
        email: formData.email,
        role: formData.role as AdminRole,
        password: formData.password,
      });
      showToast('Administrador criado com sucesso.', 'success');
      setLoading(false);
      router.push('/super-administrador/administradores');
    } catch (error: any) {
      setLoading(false);
      showToast(error?.response?.data?.message || 'Não foi possível criar o administrador.', 'error');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <DashboardLayout title="Criar Novo Admin" role="super-admin">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link href="/super-administrador/administradores" className="inline-flex items-center text-slate-400 hover:text-white transition-colors mb-4">
              <ArrowLeft size={16} className="mr-2" />
              <span className="text-xs font-black uppercase tracking-widest">Voltar à Gestão</span>
            </Link>
            <h1 className="text-3xl font-black uppercase italic tracking-tighter">Criar <span className="text-primary text-glow">Administrador</span></h1>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Adicione novo usuário administrativo</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
          {/* Basic Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#080808] border border-white/5 rounded-3xl p-8"
          >
            <h3 className="text-lg font-black uppercase tracking-tight mb-6">Informações <span className="text-primary">Pessoais</span></h3>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Nome Completo</label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ex: João Silva"
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">E-mail</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Ex: joao@VERDEVIA.br"
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Função</label>
                <select
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary"
                  required
                >
                  <option value="" className="bg-[#080808]">Selecione uma função</option>
                  <option value="super_admin" className="bg-[#080808]">Super Admin</option>
                  <option value="admin" className="bg-[#080808]">Admin</option>
                  <option value="contractor" className="bg-[#080808]">Prestador</option>
                  <option value="super_contractor" className="bg-[#080808]">Super Prestador</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Security */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#080808] border border-white/5 rounded-3xl p-8"
          >
            <h3 className="text-lg font-black uppercase tracking-tight mb-6">Credenciais de <span className="text-primary">Acesso</span></h3>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Senha</label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Ex: VERDEVIAAdmin2026Seguro"
                  className={`bg-white/5 border-white/10 text-white placeholder:text-slate-500 ${errors.password ? 'border-red-500' : ''}`}
                  required
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Confirmar Senha</label>
                <Input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Repita a senha"
                  className={`bg-white/5 border-white/10 text-white placeholder:text-slate-500 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  required
                />
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex gap-4 justify-end"
          >
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/super-administrador/administradores')}
              className="border-white/10 text-slate-400 hover:text-white px-8"
            >
              <X size={16} className="mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-widest px-8"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
                  Criando...
                </div>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Criar Administrador
                </>
              )}
            </Button>
          </motion.div>
        </form>
      </div>
    </DashboardLayout>
  );
}
