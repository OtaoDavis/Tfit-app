import { LoginForm } from '@/components/auth/login-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login | The Treasured Collective',
  description: 'Sign in to your The Treasured Collective account.',
};

export default function LoginPage() {
  return <LoginForm />;
}
