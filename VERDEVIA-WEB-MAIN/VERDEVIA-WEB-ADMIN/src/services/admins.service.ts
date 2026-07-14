import { getApolloClient } from '@/lib/apollo-client';
import { GET_USER, GET_USERS } from '@/graphql/queries/users';
import { REGISTER_USER, REMOVE_USER, UPDATE_USER } from '@/graphql/mutations/users';

export type AdminRole = 'super_admin' | 'admin' | 'contractor' | 'super_contractor';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole | string;
  lastSeen: string;
}

export interface CreateAdminInput {
  name: string;
  email: string;
  role: AdminRole;
  password: string;
}

export interface UpdateAdminInput {
  name: string;
  email: string;
  role: AdminRole | string;
}

const ADMIN_ROLES = new Set(['super_admin', 'admin', 'contractor', 'super_contractor']);

const roleLabels: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  contractor: 'Prestador',
  super_contractor: 'Super Prestador',
};

function normalizeAdmin(user: any): AdminUser {
  return {
    id: user.id,
    name: user.profile?.realName ?? user.realName ?? user.name ?? user.email,
    email: user.email,
    role: user.role,
    lastSeen: user.updatedAt
      ? new Date(user.updatedAt).toLocaleDateString('pt-BR')
      : 'Sem registro',
  };
}

function toUserRoleEnum(role: AdminRole | string) {
  return role.replace(/-/g, '_').toUpperCase();
}

const AdminsService = {
  getAdmins: async (): Promise<AdminUser[]> => {
    const { data } = await getApolloClient().query({
      query: GET_USERS,
      fetchPolicy: 'network-only',
    });
    return (data as any).users
      .filter((user: any) => ADMIN_ROLES.has(user.role))
      .map(normalizeAdmin);
  },

  getAdmin: async (id: string): Promise<AdminUser> => {
    const { data } = await getApolloClient().query({
      query: GET_USER,
      variables: { id },
      fetchPolicy: 'network-only',
    });
    return normalizeAdmin((data as any).user);
  },

  createAdmin: async (input: CreateAdminInput): Promise<AdminUser> => {
    const { data } = await getApolloClient().mutate({
      mutation: REGISTER_USER,
      variables: {
        input: {
      email: input.email,
      password: input.password,
      realName: input.name,
      role: toUserRoleEnum(input.role),
      identity: `ADMIN-${Date.now()}`,
      gender: 'NAO_INFORMAR',
      ethnicity: 'PARDA',
      birthDate: '1990-01-01',
      address: {
        zipCode: '00000-000',
        street: 'VERDEVIA',
        city: 'Operacional',
        state: 'BR',
        district: roleLabels[input.role] ?? 'Administração',
        country: 'Brasil',
        number: 'S/N',
      },
      phones: [
        {
          ddi: '55',
          ddd: '00',
          number: '000000000',
        },
      ],
        },
      },
    });
    return normalizeAdmin((data as any).registerUser);
  },

  updateAdmin: async (id: string, input: UpdateAdminInput): Promise<AdminUser> => {
    const { data } = await getApolloClient().mutate({
      mutation: UPDATE_USER,
      variables: {
        id,
        input: {
      email: input.email,
      realName: input.name,
      role: toUserRoleEnum(input.role),
        },
      },
    });
    return normalizeAdmin((data as any).updateUser);
  },

  deleteAdmin: async (id: string): Promise<void> => {
    await getApolloClient().mutate({
      mutation: REMOVE_USER,
      variables: { id },
    });
  },
};

export default AdminsService;
