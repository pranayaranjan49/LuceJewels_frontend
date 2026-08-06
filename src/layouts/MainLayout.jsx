import { Outlet } from 'react-router-dom';
import Navbar from '../components/shop/Navbar';
import Footer from '../components/shop/Footer';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-surface-base">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
