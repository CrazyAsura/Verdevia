'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Shield, 
  Save, 
  X,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { decryptParam } from '@/lib/crypto';
import { showToast } from '@/lib/toast';
import AdminsService from '@/services/admins.service';

interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
  lastSeen?: string;
}

export default function EditAdminPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const uidEncoded = searchParams.get('uid');
  
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');

  useEffect(() => {
    if (!uidEncoded) {
      router.push('/superadmin/admins');
      return;
    }

    const decryptedId = decryptParam(uidEncoded);
    async function fetchAdmin() {
      try {
        const found = await AdminsService.getAdmin(decryptedId);
        setAdmin(found);
        setName(found.name);
        setEmail(found.email);
        setRole(found.role);
      } catch {
        showToast('Administrador não encontrado.', 'error');
        router.push('/superadmin/admins');
        return;
      }
      setLoading(false);
    }
    fetchAdmin();
  }, [uidEncoded, router]);

  const handleSave = async () => {
    if (!admin) return;
    try {
      await AdminsService.updateAdmin(admin.id, { name, email, role });
      showToast('Alterações salvas com sucesso.', 'success');
      router.push('/superadmin/admins');
    } catch (err) {
      console.error('Error saving admin:', err);
      showToast('Não foi possível salvar as alterações.', 'error');
    }
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-primary font-mono tracking-widest">DECRYPTING_CREDENTIALS...</div>;

  return (
    <DashboardLayout title="Editar Credenciais" role="super-admin">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="flex items-center justify-between">
           <div className="flex items-center gap-6">
              <Link href="/superadmin/admins" className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 transition-all">
                 <ArrowLeft size={24} />
              </Link>
              <div>
                 <h2 className="text-3xl font-black uppercase tracking-tighter">Perfil do <span className="text-primary">Administrador</span></h2>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">ID Decriptografado: {admin?.id}</p>
              </div>
           </div>
        </header>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#080808] border border-white/5 rounded-[2.5rem] p-12 shadow-3xl relative overflow-hidden"
        >
           {/* Security Background Pattern */}
           <div className="absolute top-0 right-0 p-8 opacity-5">
              <Shield size={200} />
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Nome Completo</label>
                    <Input 
                      value={name} 
                      onChange={e => setName(e.target.value)}
                      className="h-14 bg-white/5 border-white/10 rounded-xl focus:border-primary transition-all font-bold"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">E-mail Corporativo</label>
                    <Input 
                      value={email} 
                      onChange={e => setEmail(e.target.value)}
                      className="h-14 bg-white/5 border-white/10 rounded-xl focus:border-primary transition-all font-bold"
                    />
                 </div>
              </div>

              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Nível de Acesso</label>
                    <select 
                      value={role}
                      onChange={e => setRole(e.target.value)}
                      className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold focus:border-primary transition-all outline-none"
                    >
                       <option value="super_admin">Super Admin</option>
                       <option value="admin">Admin</option>
                       <option value="contractor">Prestador</option>
                       <option value="super_contractor">Super Prestador</option>
                    </select>
                 </div>
                 <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex items-start gap-4">
                    <AlertCircle className="text-amber-500 shrink-0" size={20} />
                    <p className="text-[10px] text-amber-500/80 font-bold uppercase tracking-widest leading-relaxed">
                       A alteração de privilégios requer autenticação de dois fatores do Super-Admin em exercício.
                    </p>
                 </div>
              </div>
           </div>

           <div className="flex items-center justify-end gap-4 mt-16 pt-8 border-t border-white/5">
              <Button 
                variant="ghost" 
                onClick={() => router.push('/superadmin/admins')}
                className="h-14 px-8 text-slate-500 hover:text-white font-black uppercase tracking-widest text-xs"
              >
                 <X size={18} className="mr-2" /> Cancelar
              </Button>
              <Button 
                onClick={handleSave}
                className="h-14 px-10 bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-primary/20"
              >
                 <Save size={18} className="mr-2" /> Salvar Alterações
              </Button>
           </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
