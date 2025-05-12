
import { SignUpForm } from '@/components/auth/signup-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up | The Treasured Collective',
  description: 'Create your The Treasured Collective account.',
};

export default function SignUpPage() {
  return <SignUpForm />;
}
