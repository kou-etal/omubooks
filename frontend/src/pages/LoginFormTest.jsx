import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '../api/axiosInstance';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import AppLayout from '../components/AppLayout';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      // Sanctum CSRF
      await axiosInstance.get('/sanctum/csrf-cookie', { withCredentials: true });
      await axiosInstance.post(
        '/login',
        { email: email.trim(), password },
        { withCredentials: true }
      );
      navigate('/');
    } catch (err) {
      const data = err?.response?.data;
      if (data?.errors) {
        setErrors(data.errors);
      } else if (data?.message) {
        setErrors({ general: [data.message] });
      } else {
        setErrors({ general: ['Invalid login credentials.'] });
      }
      console.error('Login failed', data || err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <Card className="max-w-xl mx-auto mt-16 md:mt-20 shadow-md">
        <CardContent className="p-8 space-y-6">
          <h1 className="text-2xl font-bold text-center text-blue-900">Log in</h1>

          <form onSubmit={handleSubmit} className="space-y-4" aria-label="Login form">
            {/* Email */}
            <div>
              <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
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
                autoComplete="current-password"
                autoCapitalize="none"
                spellCheck={false}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password[0]}</p>}
            </div>

            {/* エラー全般 */}
            {errors.general && (
              <p className="text-red-600 text-sm text-center">{errors.general[0]}</p>
            )}

            <Button
              type="submit"
              className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Log in'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
