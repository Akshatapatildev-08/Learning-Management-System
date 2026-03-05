import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';

export default function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

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
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="auth-wrap">
      <h1>{mode === 'login' ? 'Login' : 'Signup'}</h1>
      <form onSubmit={submit} className="card form">
        {mode === 'signup' && (
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
        )}
        <input
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          required
        />
        <input
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          required
        />
        {error ? <p className="error">{error}</p> : null}
        <button className="btn" type="submit">{mode === 'login' ? 'Login' : 'Create Account'}</button>
      </form>
      <button className="link-btn" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
        {mode === 'login' ? 'Need an account? Signup' : 'Already have an account? Login'}
      </button>
      <p className="demo-text">Demo student: bob@lms.com / student123</p>
    </section>
  );
}
