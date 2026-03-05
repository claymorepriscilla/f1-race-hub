import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { defaultAvatars, getRandomAvatar } from '@/lib/avatars';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().trim().email('Invalid email'),
  password: z.string().min(6, 'Min 6 characters'),
  username: z.string().trim().min(2, 'Min 2 characters').max(30),
  role: z.string().min(1, 'Select a role'),
  constructor_id: z.string().min(1, 'Select a constructor'),
});

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');
  const [constructorId, setConstructorId] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = registerSchema.safeParse({ email, password, username, role, constructor_id: constructorId });
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }
    setLoading(true);
    const avatarUrl = selectedAvatar || getRandomAvatar();
    const { error } = await signUp(email, password, {
      username,
      role,
      constructor_id: constructorId,
      avatar_url: avatarUrl,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Registration successful! Check your email to confirm.');
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute inset-0 racing-stripe opacity-30" />
      <div className="absolute top-0 left-0 w-full h-1 gradient-racing" />

      <div className="w-full max-w-lg p-8 space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-racing tracking-wider text-glow-red">
            DRIVER <span className="text-primary">REGISTRATION</span>
          </h1>
          <p className="text-sm text-muted-foreground tracking-widest uppercase">Join the grid</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-racing text-xs tracking-wider">USERNAME</Label>
                <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Max_V" className="bg-muted border-border" />
              </div>
              <div className="space-y-2">
                <Label className="font-racing text-xs tracking-wider">EMAIL</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="driver@team.com" className="bg-muted border-border" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-racing text-xs tracking-wider">PASSWORD</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="bg-muted border-border" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-racing text-xs tracking-wider">ROLE</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="bg-muted border-border">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dev">Developer</SelectItem>
                    <SelectItem value="QA">QA Engineer</SelectItem>
                    <SelectItem value="DevOps">DevOps</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-racing text-xs tracking-wider">CONSTRUCTOR</Label>
                <Select value={constructorId} onValueChange={setConstructorId}>
                  <SelectTrigger className="bg-muted border-border">
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Alpha">Team Alpha</SelectItem>
                    <SelectItem value="Bravo">Team Bravo</SelectItem>
                    <SelectItem value="Charlie">Team Charlie</SelectItem>
                    <SelectItem value="Delta">Team Delta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Avatar Selection */}
            <div className="space-y-2">
              <Label className="font-racing text-xs tracking-wider">SELECT HELMET</Label>
              <div className="grid grid-cols-5 gap-2">
                {defaultAvatars.map((avatar, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedAvatar(avatar)}
                    className={`w-full aspect-square rounded-lg border-2 overflow-hidden transition-all ${
                      selectedAvatar === avatar
                        ? 'border-primary box-glow-red scale-105'
                        : 'border-border hover:border-muted-foreground'
                    }`}
                  >
                    <img src={avatar} alt={`Avatar ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Random helmet assigned if none selected</p>
            </div>

            <Button type="submit" disabled={loading} className="w-full gradient-racing font-racing tracking-wider">
              {loading ? 'REGISTERING...' : 'JOIN THE GRID'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already registered?{' '}
            <Link to="/login" className="text-secondary hover:text-secondary/80 font-racing text-xs tracking-wider">
              PIT LANE ACCESS
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
