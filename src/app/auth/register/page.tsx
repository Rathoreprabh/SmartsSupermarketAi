import RegisterForm from '@/components/auth/RegisterForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register - Smart Supermarket',
  description: 'Create a new Smart Supermarket account and start shopping today.',
};

export default function RegisterPage() {
  return <RegisterForm />;
}