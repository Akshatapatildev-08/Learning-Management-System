import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';

export default function LoginPage({ initialMode = 'login' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    setMode(initialMode);
    setError('');
    setForm({ name: '', email: '', password: '' });
  }, [initialMode]);

  useEffect(() => {
    setError('');
    setForm({ name: '', email: '', password: '' });
  }, [location.pathname]);

  useEffect(() => {
    if (localStorage.getItem('lms_token')) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const resetForm = () => {
      setError('');
      setForm({ name: '', email: '', password: '' });
    };
    window.addEventListener('lms:logout', resetForm);
    return () => window.removeEventListener('lms:logout', resetForm);
  }, []);

  useEffect(() => {
    if (location.state?.resetForm) {
      setError('');
      setForm({ name: '', email: '', password: '' });
    }
  }, [location.state]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const payload =
        mode === 'login'
          ? { email: form.email, password: form.password }
          : { name: form.name, email: form.email, password: form.password, role: 'student' };
      const result = mode === 'login' ? await api.login(payload) : await api.signup(payload);
      localStorage.setItem('lms_token', result.token);
      localStorage.setItem('lms_user', JSON.stringify(result.user));
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="auth-wrap">
      <h1>{mode === 'login' ? 'Login' : 'Signup'}</h1>
      <form onSubmit={submit} className="card form" autoComplete="off">
        {mode === 'signup' && (
          <input
            placeholder="Name"
            autoComplete="off"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
        )}
        <input
          placeholder="Email"
          type="email"
          autoComplete="off"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          required
        />
        <input
          placeholder="Password"
          type="password"
          autoComplete="new-password"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          required
        />
        {error ? <p className="error">{error}</p> : null}
        <button className="btn" type="submit">{mode === 'login' ? 'Login' : 'Create Account'}</button>
      </form>
      <Link className="link-btn" to={mode === 'login' ? '/signup' : '/login'}>
        {mode === 'login' ? 'Need an account? Signup' : 'Already have an account? Login'}
      </Link>
      <p className="demo-text">Demo student: bob@lms.com / student123</p>
    </section>
  );
}
