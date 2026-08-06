import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { sendOtp, verifyOtp } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [channel, setChannel] = useState('email'); // 'email' | 'phone'
  const [step, setStep] = useState('identify'); // 'identify' | 'otp'
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setNameField] = useState('');
  const [code, setCode] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const redirectTo = location.state?.from?.pathname || '/';

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (channel === 'email' && !email) return toast.error('Enter your email');
    if (channel === 'phone' && !phone) return toast.error('Enter your phone number');

    setLoading(true);
    try {
      await sendOtp({ channel, email: channel === 'email' ? email : undefined, phone: channel === 'phone' ? phone : undefined });
      toast.success(`OTP sent to your ${channel}`);
      setStep('otp');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!code) return toast.error('Enter the OTP');
    if (isNewUser && (!name || (channel === 'email' ? !phone : !email))) {
      return toast.error('Please complete your details');
    }

    setLoading(true);
    try {
      const payload = { channel, code, email, phone };
      if (isNewUser) payload.name = name;

      const res = await verifyOtp(payload);
      login(res.data.token, res.data.user);
      toast.success('Welcome to Amara');
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Verification failed';
      toast.error(msg);
      // If backend says extra details are needed, reveal the registration fields
      if (msg.toLowerCase().includes('required to complete registration')) {
        setIsNewUser(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-6 py-16">
      <p className="eyebrow text-center">Welcome</p>
      <h1 className="mt-2 text-center font-display text-3xl text-ink-primary">Sign in to Amara</h1>
      <p className="mt-2 text-center text-sm text-ink-inverse">
        New here? An account is created automatically on your first sign-in.
      </p>

      <div className="mt-8 flex rounded-sm border border-ink-primary/15 p-1">
        {['email', 'phone'].map((c) => (
          <button
            key={c}
            onClick={() => {
              setChannel(c);
              setStep('identify');
              setIsNewUser(false);
            }}
            className={`flex-1 rounded-sm py-2.5 text-sm capitalize transition-colors ${
              channel === c ? 'bg-gold-400 text-surface-base font-semibold' : 'text-ink-secondary'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 'identify' ? (
          <motion.form
            key="identify"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25 }}
            onSubmit={handleSendOtp}
            className="mt-8 space-y-4"
          >
            {channel === 'email' ? (
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
              />
            ) : (
              <input
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-field"
              />
            )}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Sending…' : 'Send OTP'}
            </button>
          </motion.form>
        ) : (
          <motion.form
            key="otp"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25 }}
            onSubmit={handleVerify}
            className="mt-8 space-y-4"
          >
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              required
              placeholder="6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="input-field text-center tracking-[0.5em]"
            />

            {isNewUser && (
              <>
                <input
                  type="text"
                  required
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setNameField(e.target.value)}
                  className="input-field"
                />
                {channel === 'email' ? (
                  <input
                    type="tel"
                    required
                    placeholder="Phone number (for order updates)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input-field"
                  />
                ) : (
                  <input
                    type="email"
                    required
                    placeholder="Email (for order updates)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field"
                  />
                )}
              </>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Verifying…' : 'Verify & Continue'}
            </button>
            <button
              type="button"
              onClick={() => setStep('identify')}
              className="btn-ghost w-full text-sm"
            >
              Use a different {channel === 'email' ? 'email' : 'number'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
