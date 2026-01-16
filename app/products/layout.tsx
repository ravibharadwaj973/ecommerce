import UserHeader from '../components/UserHeader';

export default function ProductsLayout({ children }) {
  return (
    <>
      <UserHeader />
      {children}
    </>
  );
}