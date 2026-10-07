export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export const DEFAULT_PAGE_SIZE = 12;

export const CACHE_TAGS = {
  farms: 'farms',
  plots: 'plots',
  cropTypes: 'crop-types',
  campaigns: 'campaigns',
  users: 'users',
  targets: 'targets',
  reports: 'reports',
} as const;

export const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const;

export const ACCEPTED_IMAGE_EXTENSIONS = '.png,.jpg,.jpeg,.webp';

export const MAX_IMAGE_FILES = 10;

export const ROUTES = {
  login: '/login',
  dashboard: '/dashboard',
  farms: '/farms',
  plots: '/plots',
  cropTypes: '/crop-types',
  assignments: '/assignments',
  campaigns: '/campaigns',
  production: '/production',
  reports: '/reports',
  admin: '/admin',
} as const;

export const MESSAGES = {
  invalidCredentials: 'Credenciales inválidas',
  noConnection: 'Sin conexión con la API.',
  farmNameMin: 'El nombre del fundo debe tener al menos 3 caracteres.',
  plotNameMin: 'El nombre de la parcela debe tener al menos 3 caracteres.',
  cropTypeNameMin: 'El nombre del cultivo debe tener al menos 3 caracteres.',
  campaignNameMin: 'El nombre de la campaña debe tener al menos 3 caracteres.',
  descriptionMax: 'La descripción debe tener como máximo 500 caracteres.',
  usernameMin: 'El nombre de usuario debe tener al menos 4 caracteres.',
  passwordMin: 'La contraseña debe tener al menos 5 caracteres.',
  invalidId: 'Registro inválido.',
} as const;
