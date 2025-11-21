export interface UserProfile {
  id: number;
  name: string;
  email: string;
  apellido_paterno: string;
  apellido_materno: string;
  telefono: string;
  activo: boolean;
  ultimo_login?: string;
  profile?: {
    id: string;
    display_name: string;
    role: 'jefe' | 'profesor';
    organization: {
      id: string;
      name: string;
    };
  };
}