import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-6 py-32 text-center">
      <p className="font-display text-6xl text-gold-400">404</p>
      <h1 className="mt-4 font-display text-2xl text-ink-primary">This page doesn't exist.</h1>
      <Link to="/" className="btn-primary mt-8 inline-flex">Back Home</Link>
    </div>
  );
}
