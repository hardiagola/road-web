import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut, AlertTriangle, Wrench, Users, ClipboardList, MapPin, DollarSign,
  Eye, PackageCheck, Clock, CheckCircle2, XCircle, Loader2, Shield, Briefcase
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Report {
  id: string; title: string; description: string; damage_type: string; status: string;
  is_urgent: boolean; urgency_reason: string | null; city: string; latitude: number | null;
  longitude: number | null; image_url: string; confidence_score: number;
  estimated_completion: string | null; created_at: string; additional_info: string | null;
  user_id: string; reporter_name: string | null; reporter_phone: string | null; reporter_email: string | null;
}
interface Worker { id: string; name: string; phone: string; email: string; specialization: string; is_available: boolean; user_id: string | null; pay_rate: number | null; }
interface Assignment {
  id: string; report_id: string; worker_id: string; estimated_hours: number | null;
  cost_per_hour: number | null; total_cost: number | null; is_completed: boolean;
  assigned_at: string; is_accepted: boolean | null; materials_submitted: boolean;
  materials_approved: boolean; pay_change_requested: number | null;
  time_change_requested: number | null; change_request_note: string | null;
  change_request_status: string | null;
}
interface WorkRequest {
  id: string; report_id: string; worker_id: string; estimated_hours: number;
  estimated_cost: number; proposed_completion_date: string; notes: string | null;
  status: string; created_at: string;
  worker: {
    name: string; specialization: string; pay_rate: number | null;
  };
}

const ALL_STATUSES = ['Reported', 'Verified', 'Assigned', 'Accepted', 'Materials Submitted', 'Materials Approved', 'In Progress', 'Almost Done', 'Completed'];

export default function AdminDashboard() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [workRequests, setWorkRequests] = useState<WorkRequest[]>([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterUrgent, setFilterUrgent] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [materialsForReview, setMaterialsForReview] = useState<any[]>([]);
  const [reviewAssignmentId, setReviewAssignmentId] = useState<string | null>(null);
  const [aiRecommendations, setAiRecommendations] = useState<{[key: string]: any}>({});

  const [newWorkerName, setNewWorkerName] = useState('');
  const [newWorkerEmail, setNewWorkerEmail] = useState('');
  const [newWorkerPhone, setNewWorkerPhone] = useState('');
  const [newWorkerSpec, setNewWorkerSpec] = useState('');
  const [newWorkerPayRate, setNewWorkerPayRate] = useState('500');
  const [workerError, setWorkerError] = useState('');

  const [assignWorkerId, setAssignWorkerId] = useState('');
  const [assignHours, setAssignHours] = useState('');
  const [assignRate, setAssignRate] = useState('500');

  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [r, w, a, wr] = await Promise.all([
        supabase.from('reports').select('*').order('is_urgent', { ascending: false }).order('created_at', { ascending: false }),
        supabase.from('workers').select('*').order('name'),
        supabase.from('worker_assignments').select('*'),
        supabase.from('work_requests' as any).select('*, worker:workers(*)').order('created_at', { ascending: false }),
      ]);
      setReports(r.data as any[] || []);
      setWorkers(w.data as any[] || []);
      setAssignments(a.data as any[] || []);
      setWorkRequests(wr.data as any[] || []);
      
      // Generate AI recommendations for reports with multiple requests
      await generateAIRecommendations(wr.data as any[] || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setReports([]);
      setWorkers([]);
      setAssignments([]);
      setWorkRequests([]);
      setLoading(false);
    }
  };

  const generateAIRecommendations = async (requests: WorkRequest[]) => {
    const recommendations: {[key: string]: any} = {};
    
    // Group requests by report
    const requestsByReport = requests.reduce((acc, req) => {
      if (!acc[req.report_id]) acc[req.report_id] = [];
      acc[req.report_id].push(req);
      return acc;
    }, {} as {[key: string]: WorkRequest[]});
    
    // Generate recommendations for reports with multiple requests
    for (const [reportId, reportRequests] of Object.entries(requestsByReport)) {
      if (reportRequests.length > 1) {
        // Calculate profit scores (cost - estimated labor cost)
        const scored = reportRequests.map(req => {
          const laborCost = (req.worker.pay_rate || 500) * req.estimated_hours;
          const profit = req.estimated_cost - laborCost;
          const profitMargin = (profit / req.estimated_cost) * 100;
          
          return {
            ...req,
            profit,
            profitMargin,
            score: profitMargin * 0.6 + (req.estimated_hours < 24 ? 40 : 20) // Prefer faster completion
          };
        });
        
        // Sort by score and pick top recommendation
        scored.sort((a, b) => b.score - a.score);
        recommendations[reportId] = {
          recommended: scored[0],
          alternatives: scored.slice(1, 3),
          reasoning: `Best profit margin (${scored[0].profitMargin.toFixed(1)}%) with reasonable completion time`
        };
      }
    }
    
    setAiRecommendations(recommendations);
  };

  const approveWorkRequest = async (requestId: string) => {
    const request = workRequests.find(r => r.id === requestId);
    if (!request) return;
    
    // Create assignment from approved request
    await supabase.from('worker_assignments' as any).insert({
      report_id: request.report_id,
      worker_id: request.worker_id,
      estimated_hours: request.estimated_hours,
      cost_per_hour: request.estimated_cost / request.estimated_hours,
      total_cost: request.estimated_cost,
    } as any);
    
    // Update request status
    await supabase.from('work_requests' as any).update({ status: 'approved' } as any).eq('id', requestId);
    
    // Reject other requests for this report
    const otherRequests = workRequests.filter(r => r.report_id === request.report_id && r.id !== requestId);
    for (const other of otherRequests) {
      await supabase.from('work_requests' as any).update({ status: 'rejected' } as any).eq('id', other.id);
    }
    
    // Update report status
    await supabase.from('reports').update({ status: 'Assigned' } as any).eq('id', request.report_id);
    
    toast({ title: '✅ Work request approved and assigned!' });
    fetchAll();
  };

  const addWorker = async () => {
    setWorkerError('');
    if (!newWorkerName || !newWorkerEmail) { setWorkerError('Name and email required'); return; }
    const { data: profile } = await supabase.from('profiles').select('id').eq('email', newWorkerEmail).maybeSingle();
    const { error } = await supabase.from('workers').insert({
      name: newWorkerName, email: newWorkerEmail, phone: newWorkerPhone,
      specialization: newWorkerSpec, user_id: profile?.id || null,
      pay_rate: parseFloat(newWorkerPayRate) || 500,
    } as any);
    if (error) { setWorkerError(error.message); return; }
    if (profile?.id) {
      await supabase.from('user_roles').upsert({ user_id: profile.id, role: 'worker' } as any, { onConflict: 'user_id,role' });
    }
    setNewWorkerName(''); setNewWorkerEmail(''); setNewWorkerPhone(''); setNewWorkerSpec(''); setNewWorkerPayRate('500');
    toast({ title: 'Worker added' });
    fetchAll();
  };

  const notifyUser = async (reportId: string, message: string) => {
    const report = reports.find(r => r.id === reportId);
    if (report?.user_id) {
      await supabase.from('notifications').insert({
        user_id: report.user_id, report_id: reportId, message, type: 'status_change',
      } as any);
    }
  };

  const assignWorker = async (reportId: string) => {
    if (!assignWorkerId) return;
    const hours = parseFloat(assignHours) || 0;
    const rate = parseFloat(assignRate) || 500;
    await supabase.from('worker_assignments').insert({
      report_id: reportId, worker_id: assignWorkerId,
      estimated_hours: hours, cost_per_hour: rate, total_cost: hours * rate,
    } as any);
    await supabase.from('reports').update({ status: 'Assigned' } as any).eq('id', reportId);
    await notifyUser(reportId, `Your report has been assigned to a worker.`);
    setAssignWorkerId(''); setAssignHours(''); setAssignRate('500');
    toast({ title: 'Worker assigned' });
    fetchAll();
    setDetailOpen(false);
  };

  const updateStatus = async (reportId: string, status: string) => {
    await supabase.from('reports').update({ status } as any).eq('id', reportId);
    await notifyUser(reportId, `Your report status updated to "${status}".`);
    toast({ title: `Status: ${status}` });
    fetchAll();
  };

  const updateEstimation = async (reportId: string, date: string) => {
    await supabase.from('reports').update({ estimated_completion: date } as any).eq('id', reportId);
    fetchAll();
  };

  const toggleUrgent = async (reportId: string, current: boolean) => {
    await supabase.from('reports').update({ is_urgent: !current } as any).eq('id', reportId);
    fetchAll();
  };

  const openMaterialsReview = async (assignmentId: string) => {
    const { data } = await supabase.from('work_materials').select('*').eq('assignment_id', assignmentId);
    setMaterialsForReview(data || []);
    setReviewAssignmentId(assignmentId);
  };

  const approveMaterials = async () => {
    if (!reviewAssignmentId) return;
    const assignment = assignments.find(a => a.id === reviewAssignmentId);
    await supabase.from('worker_assignments').update({ materials_approved: true } as any).eq('id', reviewAssignmentId);
    if (assignment) {
      await supabase.from('reports').update({ status: 'Materials Approved' } as any).eq('id', assignment.report_id);
      await notifyUser(assignment.report_id, 'Materials approved! Worker can proceed.');
    }
    toast({ title: 'Materials approved' });
    setReviewAssignmentId(null);
    fetchAll();
  };

  const approveChangeRequest = async (assignmentId: string) => {
    const a = assignments.find(x => x.id === assignmentId);
    if (!a) return;
    const updates: any = { change_request_status: 'approved' };
    if (a.pay_change_requested) updates.cost_per_hour = a.pay_change_requested;
    if (a.time_change_requested) updates.estimated_hours = a.time_change_requested;
    if (a.pay_change_requested || a.time_change_requested) {
      updates.total_cost = (a.time_change_requested || a.estimated_hours || 0) * (a.pay_change_requested || a.cost_per_hour || 0);
    }
    await supabase.from('worker_assignments').update(updates).eq('id', assignmentId);
    toast({ title: 'Change request approved' });
    fetchAll();
  };

  const rejectChangeRequest = async (assignmentId: string) => {
    await supabase.from('worker_assignments').update({ change_request_status: 'rejected' } as any).eq('id', assignmentId);
    toast({ title: 'Change request rejected' });
    fetchAll();
  };

  const filtered = reports.filter(r => {
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    if (filterUrgent && !r.is_urgent) return false;
    return true;
  });

  const getAssignment = (reportId: string) => assignments.find(a => a.report_id === reportId);
  const getWorker = (workerId: string) => workers.find(w => w.id === workerId);

  const pendingMaterials = assignments.filter(a => a.materials_submitted && !a.materials_approved);
  const pendingChangeRequests = assignments.filter(a => a.change_request_status === 'pending');

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen hero-gradient">
      <header className="sticky top-0 z-50 border-b border-border/40 bg-card/60 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Shield className="h-4 w-4 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-bold text-foreground">Admin Dashboard</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={() => { signOut(); navigate('/login'); }} className="gap-1.5">
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {/* Stats row */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Reports', value: reports.length, icon: ClipboardList },
            { label: 'Workers', value: workers.length, icon: Users },
            { label: 'Pending Approvals', value: pendingMaterials.length + pendingChangeRequests.length, icon: PackageCheck },
            { label: 'Completed', value: reports.filter(r => r.status === 'Completed').length, icon: CheckCircle2 },
          ].map((s, i) => (
            <Card key={i} className="glass-card">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        <Tabs defaultValue="reports">
          <TabsList className="mb-6">
            <TabsTrigger value="reports" className="gap-1.5"><ClipboardList className="h-3.5 w-3.5" /> Reports</TabsTrigger>
            <TabsTrigger value="approvals" className="gap-1.5 relative">
              <PackageCheck className="h-3.5 w-3.5" /> Approvals
              {(pendingMaterials.length + pendingChangeRequests.length) > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[9px] text-destructive-foreground flex items-center justify-center font-bold">
                  {pendingMaterials.length + pendingChangeRequests.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="workers" className="gap-1.5"><Users className="h-3.5 w-3.5" /> Workers</TabsTrigger>
            <TabsTrigger value="requests" className="gap-1.5 relative">
              <Briefcase className="h-3.5 w-3.5" /> Work Requests
              {workRequests.filter(r => r.status === 'pending').length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-warning text-[9px] text-warning-foreground flex items-center justify-center font-bold">
                  {workRequests.filter(r => r.status === 'pending').length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {ALL_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button variant={filterUrgent ? 'default' : 'outline'} size="sm" onClick={() => setFilterUrgent(!filterUrgent)} className="gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" /> Urgent Only
              </Button>
            </div>

            {filtered.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No reports match filters.</p>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {filtered.map((r, i) => {
                    const assignment = getAssignment(r.id);
                    const worker = assignment ? getWorker(assignment.worker_id) : null;
                    return (
                      <motion.div key={r.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                        <Card className={`glass-card overflow-hidden transition-all hover:border-primary/30 ${r.is_urgent ? 'border-destructive/40' : ''}`}>
                          <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-semibold text-foreground">{r.title}</span>
                                  {r.is_urgent && <Badge variant="destructive" className="text-[10px]">URGENT</Badge>}
                                  <Badge variant="outline" className="text-[10px]">{r.damage_type}</Badge>
                                  <Badge className={
                                    r.status === 'Completed' ? 'bg-success/20 text-success' :
                                    r.status.includes('Progress') || r.status === 'Accepted' ? 'bg-warning/20 text-warning' :
                                    r.status.includes('Material') ? 'bg-primary/20 text-primary' :
                                    'bg-muted text-muted-foreground'
                                  }>{r.status}</Badge>
                                </div>
                                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                  {r.city && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{r.city}</span>}
                                  <span>{Math.round(r.confidence_score * 100)}% AI</span>
                                  <span>{new Date(r.created_at).toLocaleDateString()}</span>
                                  {worker && <span className="flex items-center gap-1"><Wrench className="h-3 w-3" />{worker.name}</span>}
                                  {assignment?.total_cost != null && (
                                    <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />₹{assignment.total_cost}</span>
                                  )}
                                </div>
                              </div>
                              <Dialog open={detailOpen && selectedReport?.id === r.id} onOpenChange={open => { setDetailOpen(open); if (open) setSelectedReport(r); }}>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="gap-1.5"><Eye className="h-3.5 w-3.5" /> Details</Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
                                  <DialogHeader><DialogTitle>{r.title}</DialogTitle></DialogHeader>
                                  <div className="space-y-4">
                                    {r.image_url && <img src={r.image_url} alt="Damage" className="rounded-lg max-h-48 w-full object-cover" />}
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                      <div><span className="text-muted-foreground">Damage:</span> <span className="font-medium">{r.damage_type}</span></div>
                                      <div><span className="text-muted-foreground">Confidence:</span> <span className="font-medium">{Math.round(r.confidence_score * 100)}%</span></div>
                                      <div><span className="text-muted-foreground">Status:</span> <span className="font-medium">{r.status}</span></div>
                                      <div><span className="text-muted-foreground">Urgent:</span> <span className="font-medium">{r.is_urgent ? 'Yes' : 'No'}</span></div>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{r.description}</p>
                                    {r.additional_info && <p className="text-sm text-muted-foreground italic">Additional: {r.additional_info}</p>}

                                    {r.latitude && r.longitude && (
                                      <a href={`https://www.google.com/maps?q=${r.latitude},${r.longitude}`} target="_blank" rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                                        <MapPin className="h-3 w-3" /> View on Google Maps
                                      </a>
                                    )}

                                    <Button variant="outline" size="sm" onClick={() => toggleUrgent(r.id, r.is_urgent)} className="gap-1.5">
                                      <AlertTriangle className="h-3.5 w-3.5" /> {r.is_urgent ? 'Remove Urgent' : 'Mark Urgent'}
                                    </Button>

                                    <div className="space-y-2">
                                      <Label className="text-sm font-medium">Update Status</Label>
                                      <Select value={r.status} onValueChange={v => updateStatus(r.id, v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                          {ALL_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    <div className="space-y-2">
                                      <Label className="text-sm font-medium">Estimated Completion</Label>
                                      <Input type="datetime-local" value={r.estimated_completion?.slice(0, 16) || ''} onChange={e => updateEstimation(r.id, e.target.value)} />
                                    </div>

                                    {!assignment && (
                                      <div className="space-y-3 border-t border-border/50 pt-3">
                                        <Label className="text-sm font-medium">Assign Worker</Label>
                                        <Select value={assignWorkerId} onValueChange={setAssignWorkerId}>
                                          <SelectTrigger><SelectValue placeholder="Select worker" /></SelectTrigger>
                                          <SelectContent>
                                            {workers.filter(w => w.is_available).map(w =>
                                              <SelectItem key={w.id} value={w.id}>{w.name} ({w.specialization}) - ₹{w.pay_rate || 500}/hr</SelectItem>
                                            )}
                                          </SelectContent>
                                        </Select>
                                        <div className="grid grid-cols-2 gap-2">
                                          <div className="space-y-1">
                                            <Label className="text-xs">Est. Hours</Label>
                                            <Input type="number" value={assignHours} onChange={e => setAssignHours(e.target.value)} />
                                          </div>
                                          <div className="space-y-1">
                                            <Label className="text-xs">₹/Hour</Label>
                                            <Input type="number" value={assignRate} onChange={e => setAssignRate(e.target.value)} />
                                          </div>
                                        </div>
                                        {assignHours && assignRate && (
                                          <p className="text-sm text-primary font-medium">Total: ₹{(parseFloat(assignHours) * parseFloat(assignRate)).toLocaleString()}</p>
                                        )}
                                        <Button size="sm" onClick={() => assignWorker(r.id)} disabled={!assignWorkerId} className="gap-1.5">
                                          <Wrench className="h-3.5 w-3.5" /> Assign & Start
                                        </Button>
                                      </div>
                                    )}

                                    {assignment && (
                                      <div className="border-t border-border/50 pt-3 space-y-2 text-sm">
                                        <p><span className="text-muted-foreground">Worker:</span> <span className="font-medium">{worker?.name}</span></p>
                                        <p><span className="text-muted-foreground">Hours:</span> {assignment.estimated_hours}h × ₹{assignment.cost_per_hour}/h</p>
                                        <p><span className="text-muted-foreground">Total:</span> <span className="font-medium text-primary">₹{assignment.total_cost?.toLocaleString()}</span></p>
                                        <p><span className="text-muted-foreground">Accepted:</span> {assignment.is_accepted === null ? 'Pending' : assignment.is_accepted ? 'Yes' : 'Rejected'}</p>
                                        <p><span className="text-muted-foreground">Materials:</span> {assignment.materials_approved ? 'Approved' : assignment.materials_submitted ? 'Submitted' : 'Not yet'}</p>
                                      </div>
                                    )}
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>

          {/* Approvals Tab */}
          <TabsContent value="approvals" className="space-y-6">
            {/* Material Approvals */}
            <div className="space-y-3">
              <h3 className="text-base font-semibold flex items-center gap-2">
                <PackageCheck className="h-4 w-4 text-primary" /> Material Approvals ({pendingMaterials.length})
              </h3>
              {pendingMaterials.length === 0 ? (
                <p className="text-muted-foreground text-sm py-4">No pending material approvals.</p>
              ) : pendingMaterials.map(a => {
                const report = reports.find(r => r.id === a.report_id);
                const worker = getWorker(a.worker_id);
                return (
                  <Card key={a.id} className="glass-card">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{report?.title}</p>
                          <p className="text-xs text-muted-foreground">Worker: {worker?.name}</p>
                        </div>
                        <Badge className="bg-warning/20 text-warning">Pending Approval</Badge>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => openMaterialsReview(a.id)} className="gap-1.5">
                        <Eye className="h-3.5 w-3.5" /> Review Materials
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Separator />

            {/* Change Requests */}
            <div className="space-y-3">
              <h3 className="text-base font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" /> Change Requests ({pendingChangeRequests.length})
              </h3>
              {pendingChangeRequests.length === 0 ? (
                <p className="text-muted-foreground text-sm py-4">No pending change requests.</p>
              ) : pendingChangeRequests.map(a => {
                const report = reports.find(r => r.id === a.report_id);
                const worker = getWorker(a.worker_id);
                return (
                  <Card key={a.id} className="glass-card">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{report?.title}</p>
                          <p className="text-xs text-muted-foreground">Worker: {worker?.name}</p>
                        </div>
                        <Badge className="bg-warning/20 text-warning">Change Request</Badge>
                      </div>
                      <div className="text-sm space-y-1">
                        {a.pay_change_requested && <p>Requested Pay: <span className="text-primary font-medium">₹{a.pay_change_requested}/hr</span> (current: ₹{a.cost_per_hour})</p>}
                        {a.time_change_requested && <p>Requested Time: <span className="text-primary font-medium">{a.time_change_requested}h</span> (current: {a.estimated_hours}h)</p>}
                        {a.change_request_note && <p className="text-muted-foreground italic">"{a.change_request_note}"</p>}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="gap-1.5 bg-success hover:bg-success/90" onClick={() => approveChangeRequest(a.id)}>
                          <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                        </Button>
                        <Button variant="destructive" size="sm" className="gap-1.5" onClick={() => rejectChangeRequest(a.id)}>
                          <XCircle className="h-3.5 w-3.5" /> Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Workers Tab */}
          <TabsContent value="workers" className="space-y-6">
            <Card className="glass-card">
              <CardHeader><CardTitle className="text-base">Add New Worker</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {workerError && <p className="text-sm text-destructive">{workerError}</p>}
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input placeholder="Worker Name" value={newWorkerName} onChange={e => setNewWorkerName(e.target.value)} />
                  <Input placeholder="Email" type="email" value={newWorkerEmail} onChange={e => setNewWorkerEmail(e.target.value)} />
                  <Input placeholder="Phone" value={newWorkerPhone} onChange={e => setNewWorkerPhone(e.target.value)} />
                  <Input placeholder="Specialization" value={newWorkerSpec} onChange={e => setNewWorkerSpec(e.target.value)} />
                  <Input placeholder="Pay Rate (₹/hr)" type="number" value={newWorkerPayRate} onChange={e => setNewWorkerPayRate(e.target.value)} />
                </div>
                <Button onClick={addWorker} size="sm" className="gap-1.5"><Users className="h-3.5 w-3.5" /> Add Worker</Button>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <AnimatePresence>
                {workers.map((w, i) => (
                  <motion.div key={w.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                    <Card className="glass-card">
                      <CardContent className="flex items-center justify-between p-4">
                        <div>
                          <p className="font-medium text-foreground">{w.name}</p>
                          <p className="text-xs text-muted-foreground">{w.email} • {w.phone} • {w.specialization}</p>
                          <p className="text-xs text-primary font-medium mt-1">₹{w.pay_rate || 500}/hr</p>
                        </div>
                        <Badge variant={w.is_available ? 'default' : 'secondary'}>
                          {w.is_available ? 'Available' : 'Busy'}
                        </Badge>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Materials Review Dialog */}
      <Dialog open={!!reviewAssignmentId} onOpenChange={o => { if (!o) setReviewAssignmentId(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Review Materials</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {materialsForReview.map((m: any) => (
              <div key={m.id} className="flex justify-between text-sm bg-secondary/50 rounded-md px-3 py-2">
                <span>{m.item_name} × {m.quantity}</span>
                <span className="text-primary font-medium">₹{m.total_cost}</span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span className="text-primary">₹{materialsForReview.reduce((s: number, m: any) => s + (m.total_cost || 0), 0).toLocaleString()}</span>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1 gap-1.5 bg-success hover:bg-success/90" onClick={approveMaterials}>
                <CheckCircle2 className="h-3.5 w-3.5" /> Approve
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setReviewAssignmentId(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Work Requests Tab */}
      <TabsContent value="requests" className="space-y-4">
        {workRequests.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 space-y-3">
            <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              <Briefcase className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No work requests submitted yet.</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {Object.entries(
              workRequests.reduce((acc, req) => {
                if (!acc[req.report_id]) acc[req.report_id] = [];
                acc[req.report_id].push(req);
                return acc;
              }, {} as {[key: string]: WorkRequest[]})
            ).map(([reportId, requests]) => {
              const report = reports.find(r => r.id === reportId);
              const recommendation = aiRecommendations[reportId];
              
              return (
                <Card key={reportId} className="glass-card">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground">{report?.title || `Report #${reportId}`}</h3>
                      {recommendation && (
                        <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground text-xs">
                          AI Recommended
                        </Badge>
                      )}
                    </div>
                    
                    {recommendation && (
                      <div className="rounded-lg bg-primary/10 p-3 border border-primary/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm text-primary">AI Recommendation</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{recommendation.reasoning}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{recommendation.recommended.worker.name}</span>
                          <span className="text-sm text-primary">₹{recommendation.recommended.estimated_cost.toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      {requests.map((request, i) => (
                        <div key={request.id} className={`rounded-lg border p-3 ${
                          recommendation?.recommended.id === request.id 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border/40 bg-secondary/20'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{request.worker.name}</span>
                                <Badge variant="outline" className="text-xs">{request.worker.specialization}</Badge>
                                {recommendation?.recommended.id === request.id && (
                                  <Badge className="bg-primary/20 text-primary text-xs">Recommended</Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                                <span>₹{request.estimated_cost.toLocaleString()}</span>
                                <span>{request.estimated_hours}h</span>
                                <span>{new Date(request.proposed_completion_date).toLocaleDateString()}</span>
                              </div>
                              {request.notes && (
                                <p className="text-xs text-muted-foreground mt-1 italic">"{request.notes}"</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={
                                request.status === 'pending' ? 'bg-warning/20 text-warning' :
                                request.status === 'approved' ? 'bg-success/20 text-success' :
                                'bg-destructive/20 text-destructive'
                              }>{request.status}</Badge>
                              {request.status === 'pending' && (
                                <Button size="sm" onClick={() => approveWorkRequest(request.id)} className="gap-1">
                                  <CheckCircle2 className="h-3 w-3" /> Approve
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </TabsContent>
    </div>
  );
}
