import { redirect } from 'next/navigation';

export default function LegacyCreateAdminRedirectPage() {
  redirect('/super-administrador/administradores/create');
}
