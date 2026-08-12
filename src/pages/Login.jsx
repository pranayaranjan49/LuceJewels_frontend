import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { simpleLogin } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import FloatingBlobs from '../components/ui/FloatingBlobs';

// Simple login/signup - no OTP, no email/SMS verification. Just name, email,
// and phone, straight into an account. The OTP flow (sendOtp/verifyOtp) is
// still fully intact on the backend and in api/endpoints.js - nothing was
// deleted, this page just doesn't call it right now. To bring email/OTP
// login back later, this is the only file that needs to change.

export default function Login() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const redirectTo = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !phone) return toast.error('Enter your email and phone number');

    setLoading(true);
    try {
      const res = await simpleLogin({ name, email, phone });
      login(res.data.token, res.data.user);
      toast.success('Welcome to Luxe Jewels');
      navigate(redirectTo, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-[85vh] items-center justify-center overflow-hidden px-4 py-16 sm:px-6">
      <FloatingBlobs />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="card-surface relative z-10 w-full max-w-md bg-surface-base/80 p-7 backdrop-blur-md sm:p-9"
      >
        <p className="eyebrow text-center">Welcome</p>
        <h1 className="mt-2 text-center font-display text-3xl text-ink-primary">Sign in to Luxe Jewels</h1>
        <p className="mt-2 text-center text-sm text-ink-inverse">
          New here? An account is created automatically — just fill in your details below.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field"
          />
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
          />
          <input
            type="tel"
            required
            placeholder="+91 98765 43210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="input-field"
          />
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Signing in…' : 'Continue'}
          </button>
          <p className="text-center text-xs text-ink-inverse">
            First time here? Fill in all three fields. Returning? Name is optional.
          </p>
        </form>
      </motion.div>
    </div>
  );
}
