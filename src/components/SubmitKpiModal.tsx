import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { z } from 'zod';

const kpiSchema = z.object({
  kpiType: z.string().min(1, 'Select a KPI type'),
  description: z.string().trim().min(5, 'Description too short').max(500),
  evidenceUrl: z.string().url('Invalid URL').or(z.string().length(0)).optional(),
});

interface KpiType {
  value: string;
  label: string;
  default_points: number;
}

const SubmitKpiModal = ({ onClose }: { onClose: () => void }) => {
  const { user } = useAuth();
  const [kpiTypes, setKpiTypes] = useState<KpiType[]>([]);
  const [kpiType, setKpiType] = useState('');
  const [description, setDescription] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase
      .from('master_data')
      .select('value, label, default_points')
      .eq('type', 'kpi_type')
      .then(({ data }) => {
        if (data) setKpiTypes(data);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = kpiSchema.safeParse({ kpiType, description, evidenceUrl });
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }
    if (!user) return;

    setSubmitting(true);
    const { error } = await supabase.from('request_transaction').insert({
      user_id: user.id,
      kpi_type_id: kpiType,
      description,
      evidence_url: evidenceUrl || null,
    });
    setSubmitting(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Race report submitted for review!');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md space-y-4 box-glow-cyan relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>

        <div>
          <h2 className="font-racing text-xl tracking-wider">RACE REPORT</h2>
          <p className="text-sm text-muted-foreground">Submit your KPI achievement for review</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="font-racing text-xs tracking-wider">KPI TYPE</Label>
            <Select value={kpiType} onValueChange={setKpiType}>
              <SelectTrigger className="bg-muted border-border">
                <SelectValue placeholder="Select KPI type" />
              </SelectTrigger>
              <SelectContent>
                {kpiTypes.map((k) => (
                  <SelectItem key={k.value} value={k.value}>
                    {k.label} ({k.default_points} pts)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="font-racing text-xs tracking-wider">DESCRIPTION</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your achievement..."
              className="bg-muted border-border min-h-[80px]"
              maxLength={500}
            />
          </div>

          <div className="space-y-2">
            <Label className="font-racing text-xs tracking-wider">EVIDENCE URL</Label>
            <Input
              value={evidenceUrl}
              onChange={(e) => setEvidenceUrl(e.target.value)}
              placeholder="https://jira.example.com/TICKET-123"
              className="bg-muted border-border"
            />
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full gradient-racing font-racing tracking-wider"
          >
            {submitting ? 'TRANSMITTING...' : 'SUBMIT REPORT'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SubmitKpiModal;
