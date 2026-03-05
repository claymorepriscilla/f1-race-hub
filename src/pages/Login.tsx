import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Racing stripe background */}
      <div className="absolute inset-0 racing-stripe opacity-30" />
      <div className="absolute top-0 left-0 w-full h-1 gradient-racing" />
      
      <div className="w-full max-w-md p-8 space-y-8 relative z-10">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-racing tracking-wider text-glow-red">
            F1 <span className="text-primary">GRAND PRIX</span>
          </h1>
          <p className="text-sm text-muted-foreground font-body tracking-widest uppercase">
            KPI Standings
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 space-y-6 box-glow-red">
          <div className="space-y-1">
            <h2 className="text-xl font-racing tracking-wide">PIT LANE ACCESS</h2>
            <p className="text-sm text-muted-foreground">Sign in to your driver account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-racing text-xs tracking-wider">EMAIL</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="driver@team.com"
                className="bg-muted border-border focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="font-racing text-xs tracking-wider">PASSWORD</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-muted border-border focus:border-primary"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full gradient-racing font-racing tracking-wider">
              {loading ? 'CONNECTING...' : 'START ENGINE'}
            </Button>
          </form>

          <div className="flex justify-between text-sm">
            <Link to="/register" className="text-secondary hover:text-secondary/80 font-racing text-xs tracking-wider">
              NEW DRIVER
            </Link>
            <Link to="/forgot-password" className="text-muted-foreground hover:text-foreground text-xs">
              Forgot password?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
