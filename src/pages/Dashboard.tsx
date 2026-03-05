import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import Podium from '@/components/Podium';
import TierBadge from '@/components/TierBadge';
import Speedometer from '@/components/Speedometer';
import SubmitKpiModal from '@/components/SubmitKpiModal';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flag, Flame, Trophy, Gauge, LogOut, Shield, User } from 'lucide-react';

interface Profile {
  id: string;
  username: string;
  email: string;
  role: string;
  constructor_id: string;
  avatar_url: string;
  rank_tier: string;
  total_points: number;
  last_point_earned_at: string;
  is_admin: boolean;
  is_active: boolean;
}

const Dashboard = () => {
  const { user, profile, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState<Profile[]>([]);
  const [filtered, setFiltered] = useState<Profile[]>([]);
  const [filterConstructor, setFilterConstructor] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [showKpiModal, setShowKpiModal] = useState(false);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;

  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    fetchDrivers();
    if (user) fetchMyRequests();

    // Real-time subscription
    const channel = supabase
      .channel('profiles-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchDrivers();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const fetchDrivers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('is_active', true)
      .order('total_points', { ascending: false })
      .order('last_point_earned_at', { ascending: true });
    if (data) {
      setDrivers(data);
      setFiltered(data);
    }
  };

  const fetchMyRequests = async () => {
    const { data } = await supabase
      .from('request_transaction')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    if (data) setMyRequests(data);
  };

  useEffect(() => {
    let result = drivers;
    if (filterConstructor !== 'all') result = result.filter(d => d.constructor_id === filterConstructor);
    if (filterRole !== 'all') result = result.filter(d => d.role === filterRole);
    setFiltered(result);
    setPage(0);
  }, [filterConstructor, filterRole, drivers]);

  const paginatedDrivers = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const top3 = filtered.slice(0, 3);

  // Calculate hot streak (has earned points in last 7 days)
  const isHotStreak = (lastEarned: string) => {
    if (!lastEarned) return false;
    const diff = Date.now() - new Date(lastEarned).getTime();
    return diff < 7 * 24 * 60 * 60 * 1000;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="font-racing text-primary animate-pulse-glow text-2xl">LOADING GRID...</div>
      </div>
    );
  }

  const statusColor = (s: string) => s === 'approved' ? 'text-accent' : s === 'declined' ? 'text-primary' : 'text-gold';

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between py-3 px-4">
          <div className="flex items-center gap-3">
            <Flag className="w-5 h-5 text-primary" />
            <h1 className="font-racing text-lg tracking-wider">
              F1 <span className="text-primary">STANDINGS</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button size="sm" onClick={() => setShowKpiModal(true)} className="gradient-racing font-racing text-xs tracking-wider">
              <Gauge className="w-4 h-4 mr-1" /> RACE REPORT
            </Button>
            {profile?.is_admin && (
              <Button size="sm" variant="outline" onClick={() => navigate('/admin')} className="font-racing text-xs tracking-wider border-secondary text-secondary">
                <Shield className="w-4 h-4 mr-1" /> RACE CONTROL
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={() => navigate('/profile')} className="font-racing text-xs">
              <User className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={signOut} className="text-muted-foreground">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Podium */}
        {top3.length >= 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-gold" />
              <h2 className="font-racing text-lg tracking-wider">THE PODIUM</h2>
            </div>
            <Podium drivers={top3} />
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Standings Table */}
          <div className="lg:col-span-2 bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <h2 className="font-racing text-lg tracking-wider flex items-center gap-2">
                <Flag className="w-5 h-5 text-primary" /> LIVE STANDINGS
              </h2>
              <div className="flex gap-2">
                <Select value={filterConstructor} onValueChange={setFilterConstructor}>
                  <SelectTrigger className="w-36 bg-muted border-border text-xs font-racing">
                    <SelectValue placeholder="Constructor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Teams</SelectItem>
                    <SelectItem value="Alpha">Alpha</SelectItem>
                    <SelectItem value="Bravo">Bravo</SelectItem>
                    <SelectItem value="Charlie">Charlie</SelectItem>
                    <SelectItem value="Delta">Delta</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger className="w-28 bg-muted border-border text-xs font-racing">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="Dev">Dev</SelectItem>
                    <SelectItem value="QA">QA</SelectItem>
                    <SelectItem value="DevOps">DevOps</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-racing text-xs tracking-wider">
                    <th className="text-left py-3 px-2">POS</th>
                    <th className="text-left py-3 px-2">DRIVER</th>
                    <th className="text-left py-3 px-2">TEAM</th>
                    <th className="text-right py-3 px-2">PTS</th>
                    <th className="text-center py-3 px-2">TIER</th>
                    <th className="text-center py-3 px-2">🔥</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedDrivers.map((driver, idx) => (
                    <motion.tr
                      key={driver.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${
                        driver.id === user?.id ? 'bg-primary/5' : ''
                      }`}
                    >
                      <td className="py-3 px-2 font-racing text-lg">
                        {page * PAGE_SIZE + idx + 1}
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <img src={driver.avatar_url} alt="" className="w-8 h-8 rounded-full border border-border" />
                          <div>
                            <p className="font-medium">{driver.username}</p>
                            <p className="text-xs text-muted-foreground">{driver.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-muted-foreground text-xs font-racing tracking-wider">
                        {driver.constructor_id}
                      </td>
                      <td className="py-3 px-2 text-right font-racing text-primary text-lg">
                        {driver.total_points}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <TierBadge tier={driver.rank_tier} />
                      </td>
                      <td className="py-3 px-2 text-center text-lg">
                        {isHotStreak(driver.last_point_earned_at) && <Flame className="w-5 h-5 text-primary inline" />}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage(p => p - 1)} className="font-racing text-xs">
                  PREV
                </Button>
                <span className="flex items-center text-sm text-muted-foreground font-racing">
                  LAP {page + 1}/{totalPages}
                </span>
                <Button size="sm" variant="outline" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="font-racing text-xs">
                  NEXT
                </Button>
              </div>
            )}
          </div>

          {/* Pit Stop Panel */}
          <div className="space-y-6">
            {profile && (
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-racing text-sm tracking-wider mb-4 flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-secondary" /> PIT STOP
                </h3>
                <div className="flex justify-center mb-4">
                  <Speedometer value={profile.total_points} max={Math.max(drivers[0]?.total_points || 100, 100)} label="POINTS" />
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Current Position</p>
                  <p className="font-racing text-3xl text-primary">
                    P{(drivers.findIndex(d => d.id === profile.id) + 1) || '—'}
                  </p>
                </div>
              </div>
            )}

            {/* Race Control Verdicts */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-racing text-sm tracking-wider mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-secondary" /> RACE CONTROL VERDICTS
              </h3>
              <div className="space-y-3">
                {myRequests.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">No race reports submitted yet</p>
                )}
                {myRequests.map((req) => (
                  <div key={req.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <div>
                      <p className="text-sm truncate max-w-[150px]">{req.description}</p>
                      <p className="text-xs text-muted-foreground">{req.kpi_type_id}</p>
                    </div>
                    <span className={`font-racing text-xs tracking-wider uppercase ${statusColor(req.status)}`}>
                      {req.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showKpiModal && <SubmitKpiModal onClose={() => { setShowKpiModal(false); fetchMyRequests(); }} />}
    </div>
  );
};

export default Dashboard;
