import LoginForm from '@/components/auth/LoginForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login - Smart Supermarket',
  description: 'Sign in to your Smart Supermarket account to shop, track orders, and more.',
};

export default function LoginPage() {
  return <LoginForm />;
}
