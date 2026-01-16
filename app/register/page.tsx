// app/register/page.jsx
import RegisterForm from '../components/RegisterForm';
import { Suspense } from 'react';

export const metadata = {
  title: 'Register - Your App Name',
  description: 'Create a new account',
};

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}