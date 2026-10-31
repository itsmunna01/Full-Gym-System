import { useEffect, useMemo, useState, type FormEvent } from "react";
import "./admin-panel.css";

type Membership = "Open Gym" | "All Access";
type MemberStatus = "Active" | "Paused";

type Trainer = {
  id: string;
  name: string;
  specialty: string;
  email: string;
  phone: string;
  monthlyFee: number;
};

type Member = {
  id: string;
  name: string;
  email: string;
  phone: string;
  membership: Membership;
  status: MemberStatus;
  joined: string;
  termMonths?: number;
  trainerId?: string;
  trainerFee?: number;
};

const STORAGE_KEY = "fitness-care-admin-members-v1";
const TRAINERS_STORAGE_KEY = "fitness-care-admin-trainers-v1";
const AUTH_KEY = "fitness-care-admin-session";
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";
const monthlyPrices: Record<Membership, number> = { "Open Gym": 1200, "All Access": 2000 };
const termDiscounts: Record<number, number> = { 1: 0, 3: 0.1, 6: 0.15, 12: 0.2 };
const demoMembers: Member[] = [
  { id: "FC-1048", name: "Ayesha Rahman", email: "ayesha.rahman@example.com", phone: "+880 1712-345678", membership: "All Access", status: "Active", joined: "2026-08-12" },
  { id: "FC-1047", name: "Mahmud Hasan", email: "mahmud.hasan@example.com", phone: "+880 1813-456789", membership: "Open Gym", status: "Active", joined: "2026-08-08" },
  { id: "FC-1046", name: "Nusrat Jahan", email: "nusrat.jahan@example.com", phone: "+880 1914-567890", membership: "All Access", status: "Paused", joined: "2026-07-27" },
  { id: "FC-1045", name: "Sajid Ahmed", email: "sajid.ahmed@example.com", phone: "+880 1615-678901", membership: "Open Gym", status: "Active", joined: "2026-07-19" },
  { id: "FC-1044", name: "Farhana Akter", email: "farhana.akter@example.com", phone: "+880 1516-789012", membership: "All Access", status: "Active", joined: "2026-07-05" },
  { id: "FC-1043", name: "Tanvir Islam", email: "tanvir.islam@example.com", phone: "+880 1317-890123", membership: "Open Gym", status: "Active", joined: "2026-06-23" },
];

const formatDate = (date: string) => new Intl.DateTimeFormat("en-BD", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${date}T12:00:00`));
const formatMoney = (amount: number) => `৳${amount.toLocaleString("en-BD")}`;

function readMembers(): Member[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return demoMembers;
    const parsed: unknown = JSON.parse(saved);
    return Array.isArray(parsed) ? (parsed as Member[]).map((member) => ({
      ...member,
      termMonths: member.termMonths || 1,
      trainerId: member.trainerId || "",
      trainerFee: member.trainerFee || 0,
    })) : demoMembers;
  } catch {
    return demoMembers;
  }
}

function readTrainers(): Trainer[] {
  try {
    const saved = localStorage.getItem(TRAINERS_STORAGE_KEY);
    const parsed: unknown = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed as Trainer[] : [];
  } catch {
    return [];
  }
}

function MemberForm({ member, trainers, onSave, onCancel }: { member: Member | null; trainers: Trainer[]; onSave: (member: Member) => void; onCancel: () => void }) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const phone = String(form.get("phone") || "").trim();
    if (!name || !email || !phone) return;
    const trainerId = String(form.get("trainerId") || "");
    const trainer = trainers.find((item) => item.id === trainerId);
    onSave({
      id: member?.id || `FC-${Date.now().toString().slice(-6)}`,
      name,
      email,
      phone,
      membership: String(form.get("membership")) as Membership,
      status: String(form.get("status")) as MemberStatus,
      joined: String(form.get("joined")),
      termMonths: Number(form.get("termMonths")) || 1,
      trainerId,
      trainerFee: trainer?.monthlyFee || 0,
    });
  };

  return (
    <div className="admin-modal-scrim" onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel(); }}>
      <section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="member-form-title">
        <button className="admin-modal-close" type="button" onClick={onCancel} aria-label="Close form">×</button>
        <span className="admin-eyebrow">Member record</span>
        <h2 id="member-form-title">{member ? "Edit member" : "Add a member"}</h2>
        <p>Keep membership and contact details up to date.</p>
        <form className="member-form" onSubmit={handleSubmit}>
          <label>Full name<input name="name" required defaultValue={member?.name || ""} placeholder="Member name" /></label>
          <label>Email address<input name="email" type="email" required defaultValue={member?.email || ""} placeholder="name@example.com" /></label>
          <label>Phone number<input name="phone" type="tel" required defaultValue={member?.phone || ""} placeholder="+880 1XXX-XXXXXX" /></label>
          <div className="admin-form-row">
            <label>Membership<select name="membership" defaultValue={member?.membership || "Open Gym"}><option>Open Gym</option><option>All Access</option></select></label>
            <label>Status<select name="status" defaultValue={member?.status || "Active"}><option>Active</option><option>Paused</option></select></label>
          </div>
          <div className="admin-form-row">
            <label>Subscription term<select name="termMonths" defaultValue={member?.termMonths || 1}><option value="1">1 month · no discount</option><option value="3">3 months · 10% off</option><option value="6">6 months · 15% off</option><option value="12">12 months · 20% off</option></select></label>
            <label>Personal trainer<select name="trainerId" defaultValue={member?.trainerId || ""}><option value="">No trainer add-on</option>{trainers.map((trainer) => <option key={trainer.id} value={trainer.id}>{trainer.name} (+{formatMoney(trainer.monthlyFee)}/mo)</option>)}</select></label>
          </div>
          <label>Join date<input name="joined" type="date" required defaultValue={member?.joined || new Date().toISOString().slice(0, 10)} /></label>
          <div className="admin-form-actions"><button type="button" className="admin-button admin-button-muted" onClick={onCancel}>Cancel</button><button type="submit" className="admin-button admin-button-primary">{member ? "Save changes" : "Add member"}</button></div>
        </form>
      </section>
    </div>
  );
}

function TrainerForm({ trainer, onSave, onCancel }: { trainer: Trainer | null; onSave: (trainer: Trainer) => void; onCancel: () => void }) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    const specialty = String(form.get("specialty") || "").trim();
    const email = String(form.get("email") || "").trim();
    const phone = String(form.get("phone") || "").trim();
    const monthlyFee = Number(form.get("monthlyFee"));
    if (!name || !specialty || !email || !phone || !Number.isFinite(monthlyFee) || monthlyFee < 0) return;
    onSave({ id: trainer?.id || `TR-${Date.now().toString().slice(-6)}`, name, specialty, email, phone, monthlyFee });
  };

  return (
    <div className="admin-modal-scrim" onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel(); }}>
      <section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="trainer-form-title">
        <button className="admin-modal-close" type="button" onClick={onCancel} aria-label="Close form">×</button>
        <span className="admin-eyebrow">Trainer profile</span>
        <h2 id="trainer-form-title">{trainer ? "Edit trainer" : "Add a trainer"}</h2>
        <p>Set a monthly personal-training add-on fee for members.</p>
        <form className="member-form" onSubmit={handleSubmit}>
          <label>Full name<input name="name" required defaultValue={trainer?.name || ""} placeholder="Trainer name" /></label>
          <label>Specialty<input name="specialty" required defaultValue={trainer?.specialty || ""} placeholder="e.g. Strength & conditioning" /></label>
          <label>Email address<input name="email" type="email" required defaultValue={trainer?.email || ""} placeholder="trainer@example.com" /></label>
          <label>Phone number<input name="phone" type="tel" required defaultValue={trainer?.phone || ""} placeholder="+880 1XXX-XXXXXX" /></label>
          <label>Extra charge per month (৳)<input name="monthlyFee" type="number" min="0" step="50" required defaultValue={trainer?.monthlyFee ?? ""} placeholder="Enter trainer add-on fee" /></label>
          <div className="admin-form-actions"><button type="button" className="admin-button admin-button-muted" onClick={onCancel}>Cancel</button><button type="submit" className="admin-button admin-button-primary">{trainer ? "Save changes" : "Add trainer"}</button></div>
        </form>
      </section>
    </div>
  );
}

function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (username.trim() !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      setError("That username and password don't match. Try again.");
      return;
    }
    try { sessionStorage.setItem(AUTH_KEY, "authenticated"); } catch { /* Keep this demo session in memory if storage is unavailable. */ }
    onLogin();
  };

  return (
    <main className="admin-login-screen">
      <a className="admin-login-back" href="/">← Back to Fitness Care</a>
      <section className="admin-login-card" aria-labelledby="admin-login-title">
        <a className="admin-login-brand" href="/" aria-label="Fitness Care home"><span>F<span>.</span></span><strong>FITNESS<br />CARE</strong></a>
        <div className="admin-login-kicker"><i /> SECURE AREA</div>
        <h1 id="admin-login-title">Admin sign in<span>.</span></h1>
        <p>Sign in to manage Fitness Care member records.</p>
        <form className="admin-login-form" onSubmit={handleLogin}>
          <label>Username<input autoComplete="username" name="username" value={username} onChange={(event) => { setUsername(event.target.value); setError(""); }} placeholder="Enter your username" required /></label>
          <label>Password<input autoComplete="current-password" name="password" type="password" value={password} onChange={(event) => { setPassword(event.target.value); setError(""); }} placeholder="Enter your password" required /></label>
          {error && <p className="admin-login-error" role="alert">{error}</p>}
          <button className="admin-login-submit" type="submit">Sign in <span>→</span></button>
        </form>
        <p className="admin-login-warning">Temporary demo sign-in only. It is client-side and is not secure for a live admin system.</p>
      </section>
      <span className="admin-login-footer">FITNESS CARE · ADMIN WORKSPACE</span>
    </main>
  );
}

export default function AdminPanel() {
  const [authenticated, setAuthenticated] = useState(() => {
    try { return sessionStorage.getItem(AUTH_KEY) === "authenticated"; } catch { return false; }
  });
  const [members, setMembers] = useState<Member[]>(readMembers);
  const [trainers, setTrainers] = useState<Trainer[]>(readTrainers);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All members");
  const [editing, setEditing] = useState<Member | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null);
  const [trainerFormOpen, setTrainerFormOpen] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
  }, [members]);
  useEffect(() => {
    localStorage.setItem(TRAINERS_STORAGE_KEY, JSON.stringify(trainers));
  }, [trainers]);

  const filteredMembers = useMemo(() => members.filter((member) => {
    const search = query.trim().toLowerCase();
    const matchesQuery = !search || [member.name, member.email, member.phone, member.id, member.membership].some((value) => value.toLowerCase().includes(search));
    const matchesStatus = statusFilter === "All members" || member.status === statusFilter;
    return matchesQuery && matchesStatus;
  }), [members, query, statusFilter]);

  const activeCount = members.filter((member) => member.status === "Active").length;
  const monthlyRevenue = members.reduce((total, member) => {
    if (member.status !== "Active") return total;
    const term = member.termMonths || 1;
    const baseMonthly = monthlyPrices[member.membership] * (1 - (termDiscounts[term] || 0));
    return total + baseMonthly + (member.trainerFee || 0);
  }, 0);
  const todayLabel = new Intl.DateTimeFormat("en-BD", { weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(new Date()).toUpperCase();

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };

  const saveMember = (member: Member) => {
    setMembers((current) => {
      const exists = current.some((item) => item.id === member.id);
      return exists ? current.map((item) => item.id === member.id ? member : item) : [member, ...current];
    });
    setFormOpen(false);
    setEditing(null);
    notify(editing ? "Member details updated" : "Member added");
  };

  const deleteMember = (member: Member) => {
    if (!window.confirm(`Remove ${member.name} from the member list?`)) return;
    setMembers((current) => current.filter((item) => item.id !== member.id));
    notify("Member removed");
  };

  const saveTrainer = (trainer: Trainer) => {
    setTrainers((current) => current.some((item) => item.id === trainer.id)
      ? current.map((item) => item.id === trainer.id ? trainer : item)
      : [trainer, ...current]);
    setMembers((current) => current.map((member) => member.trainerId === trainer.id ? { ...member, trainerFee: trainer.monthlyFee } : member));
    setTrainerFormOpen(false);
    setEditingTrainer(null);
    notify(editingTrainer ? "Trainer details updated" : "Trainer added");
  };

  const deleteTrainer = (trainer: Trainer) => {
    if (!window.confirm(`Remove ${trainer.name}? Members assigned to this trainer will lose the trainer add-on.`)) return;
    setTrainers((current) => current.filter((item) => item.id !== trainer.id));
    setMembers((current) => current.map((member) => member.trainerId === trainer.id ? { ...member, trainerId: "", trainerFee: 0 } : member));
    notify("Trainer removed");
  };

  const exportCsv = () => {
    const columns: (keyof Member)[] = ["id", "name", "email", "phone", "membership", "termMonths", "trainerId", "trainerFee", "status", "joined"];
    const csv = [columns.join(","), ...filteredMembers.map((member) => columns.map((column) => `"${String(member[column]).replace(/"/g, '""')}"`).join(","))].join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    link.download = "fitness-care-members.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const logout = () => {
    try { sessionStorage.removeItem(AUTH_KEY); } catch { /* Nothing to clear in memory mode. */ }
    setAuthenticated(false);
  };

  if (!authenticated) return <AdminLogin onLogin={() => setAuthenticated(true)} />;

  return (
    <div className="admin-app">
      <aside className="admin-sidebar">
        <a className="admin-brand" href="/" aria-label="Fitness Care website"><span className="admin-brand-mark">F<span>.</span></span><span>FITNESS<br />CARE</span></a>
        <div className="admin-sidebar-caption">WORKSPACE</div>
        <a className="admin-nav-link" href="#overview"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="8" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="11" width="7" height="10" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>Overview</a>
        <a className="admin-nav-link is-active" href="#members"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3.5"/><path d="M2.8 20c.4-3.5 2.5-5.4 6.2-5.4s5.8 1.9 6.2 5.4M16 5.1a3.5 3.5 0 0 1 0 6.8m1.2 3c2.3.7 3.6 2.4 4 5.1"/></svg>Members<span className="admin-nav-count">{members.length}</span></a>
        <a className="admin-nav-link" href="#trainers"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="7.5" r="3.5"/><path d="M4.5 20c.5-4.1 3-6.2 7.5-6.2s7 2.1 7.5 6.2M18.5 4.5l2 2m-2 2 2-2"/></svg>Trainers<span className="admin-nav-count">{trainers.length}</span></a>
        <div className="admin-sidebar-bottom"><div className="admin-avatar">FC</div><div><strong>Gym admin</strong><span>Admin workspace</span></div><a href="/" aria-label="Return to website">↗</a></div>
      </aside>

      <main className="admin-main" id="overview">
        <header className="admin-topbar"><div><span className="admin-topbar-kicker">FITNESS CARE / MANAGEMENT</span><a className="admin-view-site" href="/">View website <span>↗</span></a></div><div className="admin-topbar-right"><span className="admin-live-dot" /> Admin session <div className="admin-top-avatar">FC</div><button className="admin-logout" type="button" onClick={logout}>Log out</button></div></header>
        <div className="admin-content">
          <div className="admin-page-heading"><div><div className="admin-eyebrow">{todayLabel}</div><h1>Members<span>.</span></h1><p>Manage your gym community and keep member records current.</p></div><button className="admin-button admin-button-primary" type="button" onClick={() => { setEditing(null); setFormOpen(true); }}><span className="admin-plus">+</span> Add member</button></div>

          <section className="admin-stats" aria-label="Membership summary">
            <article className="admin-stat-card"><div className="admin-stat-top"><span>Total members</span><span className="admin-stat-icon">↗</span></div><strong>{members.length.toString().padStart(2, "0")}</strong><small>Member records in this workspace</small></article>
            <article className="admin-stat-card"><div className="admin-stat-top"><span>Active members</span><span className="admin-stat-icon admin-stat-icon-green">●</span></div><strong>{activeCount.toString().padStart(2, "0")}</strong><small>{members.length ? Math.round(activeCount / members.length * 100) : 0}% of all members</small></article>
            <article className="admin-stat-card"><div className="admin-stat-top"><span>Paused</span><span className="admin-stat-icon admin-stat-icon-warm">Ⅱ</span></div><strong>{(members.length - activeCount).toString().padStart(2, "0")}</strong><small>Memberships currently on hold</small></article>
            <article className="admin-stat-card admin-stat-revenue"><div className="admin-stat-top"><span>Monthly recurring</span><span className="admin-stat-icon">৳</span></div><strong>{formatMoney(monthlyRevenue)}</strong><small>Active plans, estimated monthly</small></article>
          </section>

          <section className="admin-members-panel" id="members">
            <div className="admin-members-heading"><div><span className="admin-eyebrow">YOUR COMMUNITY</span><h2>All members <span>{members.length}</span></h2></div><button className="admin-export-button" type="button" onClick={exportCsv}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v4h16v-4"/></svg>Export CSV</button></div>
            <div className="admin-table-controls"><label className="admin-search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></svg><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, email, phone..." aria-label="Search members" /></label><label className="admin-filter-label"><span>Status</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option>All members</option><option>Active</option><option>Paused</option></select></label></div>
            <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Member</th><th>Phone</th><th>Membership</th><th>Term</th><th>Trainer add-on</th><th>Status</th><th>Joined</th><th><span className="admin-sr-only">Actions</span></th></tr></thead><tbody>
              {filteredMembers.map((member, index) => <tr key={member.id}><td><div className="admin-member-cell"><span className={`admin-member-avatar avatar-${index % 5}`}>{member.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase()}</span><span><strong>{member.name}</strong><small>{member.email}</small></span></div></td><td className="admin-phone-cell">{member.phone}</td><td><span className="admin-plan-pill">{member.membership}</span></td><td>{member.termMonths || 1} mo</td><td className="admin-trainer-cell">{member.trainerId ? <>{trainers.find((trainer) => trainer.id === member.trainerId)?.name || "Trainer"}<small>+{formatMoney(member.trainerFee || 0)}/mo</small></> : "—"}</td><td><span className={`admin-status-pill ${member.status === "Active" ? "status-active" : "status-paused"}`}><i />{member.status}</span></td><td className="admin-date-cell">{formatDate(member.joined)}</td><td><div className="admin-row-actions"><button type="button" onClick={() => { setEditing(member); setFormOpen(true); }} aria-label={`Edit ${member.name}`}>Edit</button><button type="button" className="admin-delete-action" onClick={() => deleteMember(member)} aria-label={`Delete ${member.name}`}>Delete</button></div></td></tr>)}
              {!filteredMembers.length && <tr><td className="admin-empty" colSpan={8}><span>Nothing found</span><small>Try another search or change the status filter.</small></td></tr>}
            </tbody></table></div>
            <div className="admin-table-footer"><span>Showing <strong>{filteredMembers.length}</strong> of <strong>{members.length}</strong> members</span></div>
          </section>

          <section className="admin-members-panel admin-trainers-panel" id="trainers">
            <div className="admin-members-heading"><div><span className="admin-eyebrow">COACHING TEAM</span><h2>Trainers <span>{trainers.length}</span></h2></div><button className="admin-button admin-button-primary" type="button" onClick={() => { setEditingTrainer(null); setTrainerFormOpen(true); }}><span className="admin-plus">+</span> Add trainer</button></div>
            {trainers.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Trainer</th><th>Contact</th><th>Extra monthly fee</th><th><span className="admin-sr-only">Actions</span></th></tr></thead><tbody>
              {trainers.map((trainer, index) => <tr key={trainer.id}><td><div className="admin-member-cell"><span className={`admin-member-avatar avatar-${index % 5}`}>{trainer.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase()}</span><span><strong>{trainer.name}</strong><small>{trainer.specialty}</small></span></div></td><td><span className="admin-trainer-contact">{trainer.email}<small>{trainer.phone}</small></span></td><td><strong className="admin-fee-value">{formatMoney(trainer.monthlyFee)}<small>/month per assigned member</small></strong></td><td><div className="admin-row-actions"><button type="button" onClick={() => { setEditingTrainer(trainer); setTrainerFormOpen(true); }} aria-label={`Edit ${trainer.name}`}>Edit</button><button type="button" className="admin-delete-action" onClick={() => deleteTrainer(trainer)} aria-label={`Delete ${trainer.name}`}>Delete</button></div></td></tr>)}
            </tbody></table></div> : <div className="admin-trainers-empty"><span className="admin-empty-icon">✳</span><strong>No trainers added yet</strong><p>Add trainer profiles and set each personal-training monthly add-on fee.</p><button className="admin-button admin-button-muted" type="button" onClick={() => { setEditingTrainer(null); setTrainerFormOpen(true); }}>Add your first trainer</button></div>}
          </section>
        </div>
      </main>
      {toast && <div className="admin-toast" role="status">✓ &nbsp;{toast}</div>}
      {formOpen && <MemberForm key={editing?.id || "new-member"} member={editing} trainers={trainers} onSave={saveMember} onCancel={() => { setFormOpen(false); setEditing(null); }} />}
      {trainerFormOpen && <TrainerForm key={editingTrainer?.id || "new-trainer"} trainer={editingTrainer} onSave={saveTrainer} onCancel={() => { setTrainerFormOpen(false); setEditingTrainer(null); }} />}
    </div>
  );
}
