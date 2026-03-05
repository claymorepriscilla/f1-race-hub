import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
      toast.success('Recovery email sent!');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative">
      <div className="absolute top-0 left-0 w-full h-1 gradient-racing" />
      <div className="w-full max-w-md p-8 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-racing tracking-wider">SAFETY CAR</h1>
          <p className="text-sm text-muted-foreground">Password Recovery</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6 space-y-6">
          {sent ? (
            <div className="text-center space-y-4">
              <p className="text-secondary font-racing">CHECK YOUR EMAIL</p>
              <p className="text-sm text-muted-foreground">Recovery link has been dispatched to your pit crew.</p>
              <Link to="/login">
                <Button variant="outline" className="font-racing text-xs tracking-wider">BACK TO PIT LANE</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="font-racing text-xs tracking-wider">EMAIL</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="driver@team.com" className="bg-muted border-border" />
              </div>
              <Button type="submit" disabled={loading} className="w-full gradient-racing font-racing tracking-wider">
                {loading ? 'DEPLOYING...' : 'DEPLOY SAFETY CAR'}
              </Button>
              <Link to="/login" className="block text-center text-sm text-muted-foreground hover:text-foreground">
                Back to login
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
