import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { defaultAvatars } from '@/lib/avatars';
import { toast } from 'sonner';
import { ArrowLeft, User } from 'lucide-react';

const ProfilePage = () => {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [selectedAvatar, setSelectedAvatar] = useState(profile?.avatar_url || '');
  const [constructorId, setConstructorId] = useState(profile?.constructor_id || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({
      avatar_url: selectedAvatar || profile.avatar_url,
      constructor_id: constructorId || profile.constructor_id,
    }).eq('id', profile.id);
    setSaving(false);

    if (error) toast.error(error.message);
    else {
      toast.success('Profile updated!');
      await refreshProfile();
    }
  };

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/50 sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between py-3 px-4">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-secondary" />
            <h1 className="font-racing text-lg tracking-wider">DRIVER PROFILE</h1>
          </div>
          <Button size="sm" variant="outline" onClick={() => navigate('/')} className="font-racing text-xs">
            <ArrowLeft className="w-4 h-4 mr-1" /> STANDINGS
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-lg space-y-6">
        <div className="bg-card border border-border rounded-lg p-6 text-center space-y-4">
          <img src={profile.avatar_url} alt="" className="w-24 h-24 rounded-full border-2 border-primary mx-auto box-glow-red" />
          <div>
            <h2 className="font-racing text-xl">{profile.username}</h2>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
            <p className="text-xs text-muted-foreground mt-1">{profile.role} · {profile.constructor_id}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
            <div>
              <p className="font-racing text-2xl text-primary">{profile.total_points}</p>
              <p className="text-xs text-muted-foreground">TOTAL POINTS</p>
            </div>
            <div>
              <p className="font-racing text-2xl text-secondary">{profile.rank_tier}</p>
              <p className="text-xs text-muted-foreground">RANK TIER</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h3 className="font-racing text-sm tracking-wider">UPDATE HELMET</h3>
          <div className="grid grid-cols-5 gap-2">
            {defaultAvatars.map((avatar, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedAvatar(avatar)}
                className={`aspect-square rounded-lg border-2 overflow-hidden transition-all ${
                  selectedAvatar === avatar ? 'border-primary box-glow-red scale-105' : 'border-border hover:border-muted-foreground'
                }`}
              >
                <img src={avatar} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <Label className="font-racing text-xs tracking-wider">CONSTRUCTOR</Label>
            <Select value={constructorId} onValueChange={setConstructorId}>
              <SelectTrigger className="bg-muted border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Alpha">Team Alpha</SelectItem>
                <SelectItem value="Bravo">Team Bravo</SelectItem>
                <SelectItem value="Charlie">Team Charlie</SelectItem>
                <SelectItem value="Delta">Team Delta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full gradient-racing font-racing tracking-wider">
            {saving ? 'SAVING...' : 'SAVE CHANGES'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
