import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '../api/axiosInstance';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import AppLayout from '../components/AppLayout';

export default function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [passwordTooShort, setPasswordTooShort] = useState(false);

  const navigate = useNavigate();

  // パスワード長の即時バリデーション
  useEffect(() => {
    setPasswordTooShort(password.length > 0 && password.length < 8);
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    if (password !== passwordConfirm) {
      setErrors({ password_confirmation: ['Passwords do not match.'] });
      setLoading(false);
      return;
    }

    try {
      // CSRF + Cookie（Sanctum）
      await axiosInstance.get('/sanctum/csrf-cookie', { withCredentials: true });
      const res = await axiosInstance.post(
        '/api/register',
        {
          name: name.trim(),
          email: email.trim(),
          password,
          password_confirmation: passwordConfirm,
        },
        { withCredentials: true }
      );
      setMessage(res?.data?.message || 'Registered successfully. Verification email sent.');
    } catch (err) {
      const apiErrors = err?.response?.data?.errors;
      if (apiErrors) setErrors(apiErrors);
      else alert('Registration failed. Please try again.');
      console.error('Registration failed:', err?.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  // 成功後にトップ（またはメール確認ページ）へ誘導
  useEffect(() => {
    if (message) {
      const t = setTimeout(() => navigate('/'), 1800);
      return () => clearTimeout(t);
    }
  }, [message, navigate]);

  return (
    <AppLayout>
      <Card className="max-w-xl mx-auto mt-20 shadow-md">
        <CardContent className="p-8 space-y-6">
          <h1 className="text-2xl font-bold text-center text-blue-900">Create your account</h1>

          <form onSubmit={handleSubmit} className="space-y-4" aria-label="registration form">
            {/* Username */}
            <div>
              <Label htmlFor="name">Username <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Taro Yamada"
                required
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name[0]}</p>}
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. example@mail.com"
                required
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email[0]}</p>}
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                autoCapitalize="none"
                spellCheck={false}
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
              />
              {passwordTooShort && (
                <p className="text-red-500 text-sm mt-1">Password must be at least 8 characters long.</p>
              )}
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password[0]}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <Label htmlFor="passwordConfirm">Confirm Password <span className="text-red-500">*</span></Label>
              <Input
                id="passwordConfirm"
                name="password_confirmation"
                type="password"
                autoComplete="new-password"
                autoCapitalize="none"
                spellCheck={false}
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="Re-enter your password"
                required
              />
              {errors.password_confirmation && (
                <p className="text-red-500 text-sm mt-1">{errors.password_confirmation[0]}</p>
              )}
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </Button>
          </form>

          {message && (
            <p className="text-green-600 text-center font-medium mt-4" aria-live="polite">{message}</p>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
