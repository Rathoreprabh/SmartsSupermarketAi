// Mock database - shared between login and register
export interface MockUser {
  id: string;
  email: string;
  password: string;
  fullName: string;
}

// Initialize with admin user
export let MOCK_USERS_DB: MockUser[] = [
  {
    id: 'admin-001',
    email: 'admin@example.com',
    password: 'Password123!',
    fullName: 'Admin User',
  },
];

/**
 * Find user by email
 */
export function findUserByEmail(email: string): MockUser | undefined {
  return MOCK_USERS_DB.find(u => u.email === email);
}

/**
 * Create new user
 */
export function createUser(email: string, password: string, fullName: string): MockUser {
  const newUser: MockUser = {
    id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    email,
    password,
    fullName,
  };
  MOCK_USERS_DB.push(newUser);
  return newUser;
}

/**
 * Get all users
 */
export function getAllUsers(): MockUser[] {
  return MOCK_USERS_DB;
}

/**
 * Debug: View all users
 */
export function debugPrintUsers() {
  console.log('Current users in database:', MOCK_USERS_DB);
}