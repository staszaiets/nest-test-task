import { Region, UserRole } from '@prisma/client';

export type AuthUser = {
  id: string;
  email: string;
  region: Region;
  role: UserRole;
};

