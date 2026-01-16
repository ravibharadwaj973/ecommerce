// app/login/page.jsx
import LoginForm from '../components/LoginForm';
import { Suspense } from 'react';

export const metadata = {
  title: 'Login - Your App Name',
  description: 'Sign in to your account',
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}