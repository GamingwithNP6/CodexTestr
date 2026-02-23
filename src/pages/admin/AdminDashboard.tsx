import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Loader2, Trash2, Archive, Eye, X } from "lucide-react";

const STATUSES = ["New", "Triaged", "In Progress", "Waiting on User", "Blocked", "Done", "Closed"];
const IMPORTANCES = ["Low", "Medium", "High", "Critical"];

const AdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [labels, setLabels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [importanceFilter, setImportanceFilter] = useState("all");
  const [hideArchived, setHideArchived] = useState(true);
  const [sortBy, setSortBy] = useState("newest");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState("");
  const [bulkImportance, setBulkImportance] = useState("");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  const fetchData = async () => {
    const [{ data: subs }, { data: lbls }] = await Promise.all([
      supabase.from("contact_submissions").select("*").order("created_at", { ascending: false }),
      supabase.from("labels").select("*").order("name"),
    ]);
    setSubmissions(subs || []);
    setLabels(lbls || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = useMemo(() => {
    let result = [...submissions];
    if (hideArchived) result = result.filter((s) => !s.archived);
    if (statusFilter !== "all") result = result.filter((s) => s.status === statusFilter);
    if (importanceFilter !== "all") result = result.filter((s) => s.importance === importanceFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((s) => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));
    }
    if (sortBy === "importance") {
      const order = { Critical: 0, High: 1, Medium: 2, Low: 3 };
      result.sort((a, b) => (order[a.importance as keyof typeof order] ?? 2) - (order[b.importance as keyof typeof order] ?? 2));
    }
    return result;
  }, [submissions, hideArchived, statusFilter, importanceFilter, search, sortBy]);

  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const logAudit = async (action: string, entityType: string, entityId: string, before: any, after: any) => {
    await supabase.from("audit_logs").insert({ admin_id: user!.id, action_type: action, entity_type: entityType, entity_id: entityId, before_data: before, after_data: after });
  };

  const toggleSelect = (id: string) => {
    const n = new Set(selected);
    n.has(id) ? n.delete(id) : n.add(id);
    setSelected(n);
  };

  const toggleAll = () => {
    if (selected.size === paged.length) setSelected(new Set());
    else setSelected(new Set(paged.map((s) => s.id)));
  };

  const bulkUpdate = async (field: string, value: any) => {
    for (const id of selected) {
      const sub = submissions.find((s) => s.id === id);
      await supabase.from("contact_submissions").update({ [field]: value, updated_at: new Date().toISOString(), updated_by: user!.id }).eq("id", id);
      await logAudit(`bulk_${field}`, "submission", id, { [field]: sub?.[field] }, { [field]: value });
    }
    setSelected(new Set());
    toast({ title: `Updated ${selected.size} submissions` });
    fetchData();
  };

  const toggleArchiveSingle = async (id: string) => {
    const sub = submissions.find((s) => s.id === id);
    if (!sub) return;

    const nextArchived = !sub.archived;
    await supabase
      .from("contact_submissions")
      .update({ archived: nextArchived, updated_at: new Date().toISOString(), updated_by: user!.id })
      .eq("id", id);
    await logAudit(nextArchived ? "archive" : "unarchive", "submission", id, { archived: sub.archived }, { archived: nextArchived });
    toast({ title: nextArchived ? "Archived" : "Unarchived" });
    fetchData();
  };

  const deleteSingle = async (id: string) => {
    if (!confirm("Delete this submission permanently?")) return;
    await logAudit("delete", "submission", id, null, null);
    await supabase.from("contact_submissions").delete().eq("id", id);
    toast({ title: "Deleted" });
    fetchData();
  };

  const clearFilters = () => { setSearch(""); setStatusFilter("all"); setImportanceFilter("all"); setHideArchived(true); setSortBy("newest"); setPage(0); };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h1 className="font-heading text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <div className="flex gap-2">
              <Link to="/admin/labels"><Button variant="outline" size="sm">Labels</Button></Link>
              <Link to="/admin/users"><Button variant="outline" size="sm">Users</Button></Link>
              <Link to="/admin/activity"><Button variant="outline" size="sm">Activity</Button></Link>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-card rounded-xl p-4 shadow-card mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-3">
              <Input placeholder="Search name, email, content…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} />
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={importanceFilter} onValueChange={(v) => { setImportanceFilter(v); setPage(0); }}>
                <SelectTrigger><SelectValue placeholder="Importance" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Importances</SelectItem>
                  {IMPORTANCES.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="importance">Importance ↓</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Checkbox checked={hideArchived} onCheckedChange={(c) => setHideArchived(!!c)} id="hide-archived" />
                <label htmlFor="hide-archived" className="text-sm text-muted-foreground cursor-pointer">Hide archived</label>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={clearFilters}><X className="w-3 h-3 mr-1" /> Clear filters</Button>
          </div>

          {/* Bulk actions */}
          {selected.size > 0 && (
            <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-3 mb-4 flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium">{selected.size} selected</span>
              <Select value={bulkStatus} onValueChange={(v) => { setBulkStatus(v); bulkUpdate("status", v); }}>
                <SelectTrigger className="w-40"><SelectValue placeholder="Set status" /></SelectTrigger>
                <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={bulkImportance} onValueChange={(v) => { setBulkImportance(v); bulkUpdate("importance", v); }}>
                <SelectTrigger className="w-40"><SelectValue placeholder="Set importance" /></SelectTrigger>
                <SelectContent>{IMPORTANCES.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={() => bulkUpdate("archived", true)}>
                <Archive className="w-3 h-3 mr-1" /> Archive
              </Button>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
          ) : filtered.length === 0 ? (
            <p className="text-center py-12 text-muted-foreground">No submissions found.</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="p-3"><Checkbox checked={selected.size === paged.length && paged.length > 0} onCheckedChange={toggleAll} /></th>
                      <th className="p-3">Preview</th>
                      <th className="p-3">Submitted By</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Importance</th>
                      <th className="p-3">Archived</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((s) => (
                      <tr key={s.id} className="border-b border-border hover:bg-muted/30">
                        <td className="p-3"><Checkbox checked={selected.has(s.id)} onCheckedChange={() => toggleSelect(s.id)} /></td>
                        <td className="p-3 max-w-[200px] truncate">{s.description.substring(0, 60)}</td>
                        <td className="p-3"><span className="block">{s.name}</span><span className="text-xs text-muted-foreground">{s.email}</span></td>
                        <td className="p-3 whitespace-nowrap">{new Date(s.created_at).toLocaleDateString()}</td>
                        <td className="p-3"><Badge variant="outline">{s.status}</Badge></td>
                        <td className="p-3"><Badge variant="outline">{s.importance}</Badge></td>
                        <td className="p-3">{s.archived ? "Yes" : "No"}</td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            <Link to={`/admin/submissions/${s.id}`}><Button variant="ghost" size="icon"><Eye className="w-4 h-4" /></Button></Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleArchiveSingle(s.id)}
                              title={s.archived ? "Unarchive" : "Archive"}
                            >
                              <Archive className={`w-4 h-4 ${s.archived ? "text-secondary" : ""}`} />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => deleteSingle(s.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</Button>
                  <span className="text-sm text-muted-foreground self-center">Page {page + 1} of {totalPages}</span>
                  <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>Next</Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default AdminDashboard;
