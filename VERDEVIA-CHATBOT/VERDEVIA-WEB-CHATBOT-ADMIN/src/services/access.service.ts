import api from '@/services/api';

export type AdminRole = 'admin' | 'super_admin';
export type AdminAccount = { id: string; name: string; email: string; role: AdminRole; active: boolean; createdAt: string; updatedAt: string };
export type AdminInput = { name: string; email: string; role: AdminRole; active: boolean; password?: string };
export type DocumentPermission = { id: string; documentId: string; filename: string; minimumRole: AdminRole; explanationAllowed: boolean; blockReason?: string };

export async function listAdminAccounts() { return (await api.get<AdminAccount[]>('/admin/accounts')).data; }
export async function createAdminAccount(input: AdminInput & { password: string }) { return (await api.post<AdminAccount>('/admin/accounts', input)).data; }
export async function updateAdminAccount(id: string, input: Partial<AdminInput>) { return (await api.patch<AdminAccount>(`/admin/accounts/${id}`, input)).data; }
export async function deleteAdminAccount(id: string) { await api.delete(`/admin/accounts/${id}`); }
export async function listDocumentPermissions() { return (await api.get<DocumentPermission[]>('/admin/document-permissions')).data; }
export async function setDocumentPermission(input: Omit<DocumentPermission, 'id'>) { return (await api.put<DocumentPermission>('/admin/document-permissions', input)).data; }
