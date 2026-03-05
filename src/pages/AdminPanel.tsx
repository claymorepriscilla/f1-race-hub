import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Shield, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

interface RequestRow {
  id: string;
  user_id: string;
  kpi_type_id: string;
  description: string;
  evidence_url: string | null;
  status: string;
  admin_comment: string | null;
  points_awarded: number;
  created_at: string;
  profiles: { username: string; constructor_id: string } | null;
}

const AdminPanel = () => {
  const { profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [kpiTypes, setKpiTypes] = useState<Record<string, number>>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [declineComment, setDeclineComment] = useState<Record<string, string>>({});
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 15;

  useEffect(() => {
    if (!authLoading && (!profile || !profile.is_admin)) {
      navigate('/');
    }
  }, [profile, authLoading, navigate]);

  useEffect(() => {
    fetchRequests();
    fetchKpiTypes();
  }, []);

  const fetchRequests = async () => {
    const { data } = await supabase
      .from('request_transaction')
      .select('*, profiles(username, constructor_id)')
      .order('created_at', { ascending: false });
    if (data) setRequests(data as any);
  };

  const fetchKpiTypes = async () => {
    const { data } = await supabase.from('master_data').select('value, default_points').eq('type', 'kpi_type');
    if (data) {
      const map: Record<string, number> = {};
      data.forEach(d => { map[d.value] = d.default_points; });
      setKpiTypes(map);
    }
  };

  const approveRequest = async (req: RequestRow) => {
    const points = kpiTypes[req.kpi_type_id] || 0;

    // Update request
    await supabase.from('request_transaction').update({
      status: 'approved',
      points_awarded: points,
    }).eq('id', req.id);

    // Update driver points
    const { data: currentProfile } = await supabase.from('profiles').select('total_points').eq('id', req.user_id).single();
    if (currentProfile) {
      await supabase.from('profiles').update({
        total_points: currentProfile.total_points + points,
        last_point_earned_at: new Date().toISOString(),
      }).eq('id', req.user_id);
    }

    // Audit log
    await supabase.from('point_history').insert({
      user_id: req.user_id,
      points_change: points,
      reason: `Approved: ${req.kpi_type_id}`,
      request_id: req.id,
      admin_id: profile?.id,
    });

    toast.success(`Approved! +${points} pts`);
    fetchRequests();
  };

  const declineRequest = async (req: RequestRow) => {
    const comment = declineComment[req.id];
    if (!comment?.trim()) {
      toast.error('Admin comment is mandatory when declining');
      return;
    }
    await supabase.from('request_transaction').update({
      status: 'declined',
      admin_comment: comment,
    }).eq('id', req.id);
    toast.success('Request declined');
    fetchRequests();
  };

  const bulkApprove = async () => {
    const pending = requests.filter(r => selectedIds.has(r.id) && r.status === 'pending');
    for (const req of pending) {
      await approveRequest(req);
    }
    setSelectedIds(new Set());
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const paginatedPending = pendingRequests.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(pendingRequests.length / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between py-3 px-4">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-secondary" />
            <h1 className="font-racing text-lg tracking-wider text-secondary">RACE CONTROL</h1>
          </div>
          <Button size="sm" variant="outline" onClick={() => navigate('/')} className="font-racing text-xs">
            <ArrowLeft className="w-4 h-4 mr-1" /> STANDINGS
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-lg p-4 text-center">
            <p className="font-racing text-3xl text-primary">{pendingRequests.length}</p>
            <p className="text-xs text-muted-foreground font-racing tracking-wider">PENDING</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 text-center">
            <p className="font-racing text-3xl text-accent">{requests.filter(r => r.status === 'approved').length}</p>
            <p className="text-xs text-muted-foreground font-racing tracking-wider">APPROVED</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 text-center">
            <p className="font-racing text-3xl text-primary">{requests.filter(r => r.status === 'declined').length}</p>
            <p className="text-xs text-muted-foreground font-racing tracking-wider">DECLINED</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 text-center">
            <p className="font-racing text-3xl text-foreground">{requests.length}</p>
            <p className="text-xs text-muted-foreground font-racing tracking-wider">TOTAL</p>
          </div>
        </div>

        {/* Bulk actions */}
        {selectedIds.size > 0 && (
          <div className="bg-secondary/10 border border-secondary/30 rounded-lg p-4 flex items-center justify-between">
            <p className="font-racing text-sm text-secondary">{selectedIds.size} SELECTED</p>
            <Button size="sm" onClick={bulkApprove} className="gradient-racing font-racing text-xs">
              MASS APPROVE
            </Button>
          </div>
        )}

        {/* Pending requests */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="font-racing text-lg tracking-wider mb-4">PENDING VERDICTS</h2>
          <div className="space-y-3">
            {paginatedPending.length === 0 && (
              <p className="text-muted-foreground text-center py-8 font-racing text-sm">ALL CLEAR — NO PENDING REQUESTS</p>
            )}
            {paginatedPending.map((req) => (
              <div key={req.id} className="border border-border rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={selectedIds.has(req.id)}
                    onCheckedChange={() => toggleSelect(req.id)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{req.profiles?.username || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">{req.profiles?.constructor_id} · {req.kpi_type_id} · {kpiTypes[req.kpi_type_id] || 0} pts</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{new Date(req.created_at).toLocaleDateString()}</p>
                    </div>
                    <p className="text-sm mt-2">{req.description}</p>
                    {req.evidence_url && (
                      <a href={req.evidence_url} target="_blank" rel="noopener noreferrer" className="text-xs text-secondary hover:underline">
                        View Evidence →
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 pl-7">
                  <Button size="sm" onClick={() => approveRequest(req)} className="bg-accent/80 hover:bg-accent text-accent-foreground font-racing text-xs">
                    <CheckCircle className="w-4 h-4 mr-1" /> APPROVE
                  </Button>
                  <div className="flex-1 flex gap-2">
                    <Textarea
                      placeholder="Decline reason (mandatory)..."
                      value={declineComment[req.id] || ''}
                      onChange={(e) => setDeclineComment(prev => ({ ...prev, [req.id]: e.target.value }))}
                      className="bg-muted border-border text-xs min-h-[36px] h-9"
                    />
                    <Button size="sm" variant="destructive" onClick={() => declineRequest(req)} className="font-racing text-xs">
                      <XCircle className="w-4 h-4 mr-1" /> DECLINE
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage(p => p - 1)} className="font-racing text-xs">PREV</Button>
              <span className="flex items-center text-sm text-muted-foreground font-racing">LAP {page + 1}/{totalPages}</span>
              <Button size="sm" variant="outline" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="font-racing text-xs">NEXT</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
