// import { useState } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { motion, AnimatePresence } from 'framer-motion';
// import toast from 'react-hot-toast';
// import { sendOtp, verifyOtp } from '../api/endpoints';
// import { useAuth } from '../context/AuthContext';
// import FloatingBlobs from '../components/ui/FloatingBlobs';

// // All OTP logic below is UNCHANGED from before - only the visual wrapper
// // (background blobs + card) is new. See the return() statement for what
// // changed.

// export default function Login() {
//   const [channel, setChannel] = useState('email'); // 'email' | 'phone'
//   const [step, setStep] = useState('identify'); // 'identify' | 'otp'
//   const [email, setEmail] = useState('');
//   const [phone, setPhone] = useState('');
//   const [name, setNameField] = useState('');
//   const [code, setCode] = useState('');
//   const [isNewUser, setIsNewUser] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { login } = useAuth();

//   const redirectTo = location.state?.from?.pathname || '/';

//   const handleSendOtp = async (e) => {
//     e.preventDefault();
//     if (channel === 'email' && !email) return toast.error('Enter your email');
//     if (channel === 'phone' && !phone) return toast.error('Enter your phone number');

//     setLoading(true);
//     try {
//       await sendOtp({ channel, email: channel === 'email' ? email : undefined, phone: channel === 'phone' ? phone : undefined });
//       if (channel === 'email') {
//         toast.success('Check your email for the code — please also check your spam/junk folder.', { duration: 6000 });
//       } else {
//         toast.success('OTP sent to your phone');
//       }
//       setStep('otp');
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Failed to send OTP');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleVerify = async (e) => {
//     e.preventDefault();
//     if (!code) return toast.error('Enter the OTP');
//     if (isNewUser && (!name || (channel === 'email' ? !phone : !email))) {
//       return toast.error('Please complete your details');
//     }

//     setLoading(true);
//     try {
//       const payload = { channel, code, email, phone };
//       if (isNewUser) payload.name = name;

//       const res = await verifyOtp(payload);
//       login(res.data.token, res.data.user);
//       toast.success('Welcome to Luxe Jewels');
//       navigate(redirectTo, { replace: true });
//     } catch (err) {
//       const msg = err.response?.data?.message || 'Verification failed';
//       toast.error(msg);
//       if (msg.toLowerCase().includes('required to complete registration')) {
//         setIsNewUser(true);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     // NEW: relative + overflow-hidden wrapper so the floating blobs below
//     // can be absolutely positioned and clipped to this section only.
//     <div className="relative flex min-h-[85vh] items-center justify-center overflow-hidden px-4 py-16 sm:px-6">
//       <FloatingBlobs />

//       {/* NEW: the form is now wrapped in an actual card - bordered, shadowed,
//           translucent-blurred surface - with an entrance animation, instead
//           of sitting directly on the page background. */}
//       <motion.div
//         initial={{ opacity: 0, y: 24, scale: 0.97 }}
//         animate={{ opacity: 1, y: 0, scale: 1 }}
//         transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
//         className="card-surface relative z-10 w-full max-w-md bg-surface-base/80 p-7 backdrop-blur-md sm:p-9"
//       >
//         <p className="eyebrow text-center">Welcome</p>
//         <h1 className="mt-2 text-center font-display text-3xl text-ink-primary">Sign in to Luxe Jewels</h1>
//         <p className="mt-2 text-center text-sm text-ink-inverse">
//           New here? An account is created automatically on your first sign-in.
//         </p>

//         <div className="mt-8 flex rounded-sm border border-ink-primary/15 p-1">
//           {['email', 'phone'].map((c) => (
//             <button
//               key={c}
//               onClick={() => {
//                 setChannel(c);
//                 setStep('identify');
//                 setIsNewUser(false);
//               }}
//               className={`flex-1 rounded-sm py-2.5 text-sm capitalize transition-colors ${
//                 channel === c ? 'bg-gold-400 text-ink-primary font-semibold' : 'text-ink-secondary'
//               }`}
//             >
//               {c}
//             </button>
//           ))}
//         </div>

//         <AnimatePresence mode="wait">
//           {step === 'identify' ? (
//             <motion.form
//               key="identify"
//               initial={{ opacity: 0, x: 16 }}
//               animate={{ opacity: 1, x: 0 }}
//               exit={{ opacity: 0, x: -16 }}
//               transition={{ duration: 0.25 }}
//               onSubmit={handleSendOtp}
//               className="mt-8 space-y-4"
//             >
//               {channel === 'email' ? (
//                 <input
//                   type="email"
//                   required
//                   placeholder="you@example.com"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   className="input-field"
//                 />
//               ) : (
//                 <input
//                   type="tel"
//                   required
//                   placeholder="+91 98765 43210"
//                   value={phone}
//                   onChange={(e) => setPhone(e.target.value)}
//                   className="input-field"
//                 />
//               )}
//               <button type="submit" disabled={loading} className="btn-primary w-full">
//                 {loading ? 'Sending…' : 'Send OTP'}
//               </button>
//             </motion.form>
//           ) : (
//             <motion.form
//               key="otp"
//               initial={{ opacity: 0, x: 16 }}
//               animate={{ opacity: 1, x: 0 }}
//               exit={{ opacity: 0, x: -16 }}
//               transition={{ duration: 0.25 }}
//               onSubmit={handleVerify}
//               className="mt-8 space-y-4"
//             >
//               {channel === 'email' && (
//                 <p className="rounded-xs bg-surface-muted px-4 py-3 text-xs text-ink-secondary">
//                   We've sent a 6-digit code to <span className="text-ink-primary">{email}</span>. Check your inbox
//                   and, if you don't see it within a minute, your <span className="text-ink-primary">spam or junk folder</span>.
//                 </p>
//               )}
//               <input
//                 type="text"
//                 inputMode="numeric"
//                 maxLength={6}
//                 required
//                 placeholder="6-digit code"
//                 value={code}
//                 onChange={(e) => setCode(e.target.value)}
//                 className="input-field text-center tracking-[0.5em]"
//               />

//               {isNewUser && (
//                 <>
//                   <input
//                     type="text"
//                     required
//                     placeholder="Your full name"
//                     value={name}
//                     onChange={(e) => setNameField(e.target.value)}
//                     className="input-field"
//                   />
//                   {channel === 'email' ? (
//                     <input
//                       type="tel"
//                       required
//                       placeholder="Phone number (for order updates)"
//                       value={phone}
//                       onChange={(e) => setPhone(e.target.value)}
//                       className="input-field"
//                     />
//                   ) : (
//                     <input
//                       type="email"
//                       required
//                       placeholder="Email (for order updates)"
//                       value={email}
//                       onChange={(e) => setEmail(e.target.value)}
//                       className="input-field"
//                     />
//                   )}
//                 </>
//               )}

//               <button type="submit" disabled={loading} className="btn-primary w-full">
//                 {loading ? 'Verifying…' : 'Verify & Continue'}
//               </button>
//               <button
//                 type="button"
//                 onClick={() => setStep('identify')}
//                 className="btn-ghost w-full text-sm"
//               >
//                 Use a different {channel === 'email' ? 'email' : 'number'}
//               </button>
//             </motion.form>
//           )}
//         </AnimatePresence>
//       </motion.div>
//     </div>
//   );
// }




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