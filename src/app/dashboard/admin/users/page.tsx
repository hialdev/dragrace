"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import pb, { COLLECTIONS, ROLES } from "@/lib/pb";

const createUserSchema = z.object({
  full_name: z.string().min(3, "Nama minimal 3 karakter"),
  email: z.string().email("Email tidak valid"),
  phone: z.string().optional(),
  role: z.enum(["team_manager", "race_manager", "content", "superadmin"]),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

type CreateUserForm = z.infer<typeof createUserSchema>;

const ROLE_LABELS: Record<string, { label: string; cls: string }> = {
  team_manager:  { label: "Team Manager",  cls: "bg-white/8 text-white/60 border-white/10" },
  race_manager:  { label: "Race Manager",  cls: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  content:       { label: "Content",        cls: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  superadmin:    { label: "Superadmin",     cls: "bg-[#b80014]/10 text-[#b80014] border-[#b80014]/20" },
};

function inputClass(hasError?: boolean) {
  return `w-full px-3 py-2.5 rounded-xl bg-white/5 border text-white placeholder-white/20 text-sm outline-none transition-all focus:ring-2 focus:ring-[#b80014]/40 ${hasError ? "border-red-500/50" : "border-white/10"}`;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [serverError, setServerError] = useState("");
  const [createdOk, setCreatedOk] = useState("");
  const [changingRoleId, setChangingRoleId] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState("");

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { role: "race_manager" },
  });

  const loadUsers = async () => {
    const filter = filterRole ? `role = "${filterRole}"` : "";
    const res = await pb.collection(COLLECTIONS.USERS).getFullList({
      sort: "-created",
      filter,
    }).catch(() => []);
    setUsers(res);
    setLoading(false);
  };

  useEffect(() => { loadUsers(); }, [filterRole]);

  const onSubmit = async (data: CreateUserForm) => {
    setCreating(true);
    setServerError("");
    try {
      await pb.collection(COLLECTIONS.USERS).create({
        ...data,
        passwordConfirm: data.password,
        emailVisibility: true,
        verified: true, // admin-created users are auto-verified
        is_active: true,
      });
      setCreatedOk(`✓ Akun "${data.full_name}" berhasil dibuat.`);
      reset();
      setShowForm(false);
      await loadUsers();
    } catch (err: any) {
      const d = err?.response?.data;
      if (d?.email?.message?.includes("unique")) {
        setServerError("Email sudah terdaftar.");
      } else {
        setServerError(err?.response?.message ?? "Gagal membuat akun.");
      }
    } finally {
      setCreating(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setChangingRoleId(userId);
    try {
      await pb.collection(COLLECTIONS.USERS).update(userId, { role: newRole });
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole } : u));
    } catch { alert("Gagal mengubah role."); }
    finally { setChangingRoleId(null); }
  };

  const handleToggleActive = async (userId: string, current: boolean) => {
    try {
      await pb.collection(COLLECTIONS.USERS).update(userId, { is_active: !current });
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, is_active: !current } : u));
    } catch { alert("Gagal mengubah status."); }
  };

  const tabRoles = [
    { val: "", label: "Semua" },
    { val: "team_manager", label: "Team Manager" },
    { val: "race_manager", label: "Race Manager" },
    { val: "content", label: "Content" },
    { val: "superadmin", label: "Superadmin" },
  ];

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link href="/dashboard/admin"
              className="p-1.5 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            </Link>
            <h1 className="text-2xl font-headline font-semibold text-white">Manajemen Pengguna</h1>
          </div>
          <p className="text-white/40 text-sm ml-9">{users.length} pengguna ditemukan</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setServerError(""); setCreatedOk(""); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#b80014] hover:bg-[#e21b23] text-white font-semibold text-sm rounded-xl transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">{showForm ? "close" : "person_add"}</span>
          {showForm ? "Batal" : "Buat Akun Baru"}
        </button>
      </div>

      {/* Success banner */}
      {createdOk && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/30">
          <p className="text-sm text-green-400">{createdOk}</p>
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <div className="bg-white/5 border border-white/8 rounded-2xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-5">Buat Akun Baru</h2>

          {/* Role info cards */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {[
              { role: "team_manager",  icon: "person",             desc: "Peserta balapan — daftar via halaman publik" },
              { role: "race_manager",  icon: "flag",               desc: "Verifikasi pembayaran & data peserta" },
              { role: "content",       icon: "edit_note",          desc: "Kelola konten website" },
              { role: "superadmin",    icon: "admin_panel_settings", desc: "Akses penuh ke sistem" },
            ].map((r) => {
              const badge = ROLE_LABELS[r.role];
              return (
                <div key={r.role} className={`p-3 rounded-xl border bg-white/3 ${badge.cls}`}>
                  <span className={`material-symbols-outlined text-[20px] mb-1 block ${badge.cls.split(" ")[1]}`}>{r.icon}</span>
                  <p className="text-xs font-semibold">{badge.label}</p>
                  <p className="text-[10px] opacity-60 mt-0.5 leading-relaxed">{r.desc}</p>
                </div>
              );
            })}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-white/50 mb-1.5">Nama Lengkap *</label>
                <input className={inputClass(!!errors.full_name)} placeholder="Nama lengkap" {...register("full_name")} />
                {errors.full_name && <p className="mt-1 text-xs text-red-400">{errors.full_name.message}</p>}
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1.5">Role *</label>
                <select className={inputClass(!!errors.role)} {...register("role")}>
                  <option value="race_manager">Race Manager</option>
                  <option value="content">Content</option>
                  <option value="team_manager">Team Manager</option>
                  <option value="superadmin">Superadmin</option>
                </select>
                {errors.role && <p className="mt-1 text-xs text-red-400">{errors.role.message}</p>}
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1.5">Email *</label>
                <input type="email" className={inputClass(!!errors.email)} placeholder="email@domain.com" {...register("email")} />
                {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1.5">No. HP</label>
                <input className={inputClass()} placeholder="08xxxxxxxxxx" {...register("phone")} />
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1.5">Password Awal *</label>
                <input type="password" className={inputClass(!!errors.password)} placeholder="Min. 8 karakter" {...register("password")} />
                {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
              </div>
            </div>

            {serverError && (
              <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30">
                <p className="text-sm text-red-400">{serverError}</p>
              </div>
            )}

            <div className="bg-yellow-500/5 border border-yellow-500/15 rounded-xl px-4 py-3">
              <p className="text-yellow-400/80 text-xs flex items-start gap-2">
                <span className="material-symbols-outlined text-[14px] mt-px">info</span>
                Akun yang dibuat melalui admin akan otomatis terverifikasi. Berikan password kepada pengguna dan minta mereka untuk menggantinya setelah login pertama.
              </p>
            </div>

            <button
              id="btn-create-user"
              type="submit"
              disabled={creating}
              className="w-full py-3 bg-[#b80014] hover:bg-[#e21b23] disabled:opacity-60 text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {creating && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {creating ? "Membuat Akun..." : "Buat Akun"}
            </button>
          </form>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {tabRoles.map((t) => (
          <button key={t.val} onClick={() => setFilterRole(t.val)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filterRole === t.val
                ? "bg-[#b80014]/15 text-[#b80014] border border-[#b80014]/20"
                : "text-white/40 hover:text-white border border-white/8 hover:border-white/15"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Users table */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <span className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white/5 border border-white/8 rounded-2xl p-12 text-center">
          <span className="material-symbols-outlined text-white/20 text-[48px] mb-4 block">manage_accounts</span>
          <p className="text-white/40 text-sm">Tidak ada pengguna ditemukan.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {users.map((u) => {
            const roleMeta = ROLE_LABELS[u.role] ?? ROLE_LABELS.team_manager;
            return (
              <div key={u.id} className="flex items-center gap-4 bg-white/5 border border-white/8 rounded-xl p-4 hover:bg-white/8 transition-colors">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-white/50 font-semibold text-sm">
                    {u.full_name?.[0]?.toUpperCase() ?? "?"}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-medium text-sm">{u.full_name}</p>
                    {!u.is_active && (
                      <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded">Non-aktif</span>
                    )}
                    {!u.verified && (
                      <span className="text-[10px] bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-1.5 py-0.5 rounded">Belum verif</span>
                    )}
                  </div>
                  <p className="text-white/40 text-xs">{u.email} {u.phone ? `· ${u.phone}` : ""}</p>
                </div>

                {/* Role selector */}
                <div className="flex-shrink-0">
                  {changingRoleId === u.id ? (
                    <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin block" />
                  ) : (
                    <select
                      value={u.role ?? "team_manager"}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg border outline-none cursor-pointer bg-transparent transition-colors ${roleMeta.cls}`}
                    >
                      <option value="team_manager">Team Manager</option>
                      <option value="race_manager">Race Manager</option>
                      <option value="content">Content</option>
                      <option value="superadmin">Superadmin</option>
                    </select>
                  )}
                </div>

                {/* Active toggle */}
                <button
                  onClick={() => handleToggleActive(u.id, u.is_active)}
                  title={u.is_active ? "Nonaktifkan" : "Aktifkan"}
                  className={`p-2 rounded-lg transition-colors ${
                    u.is_active
                      ? "text-white/30 hover:text-red-400 hover:bg-red-500/5"
                      : "text-white/30 hover:text-green-400 hover:bg-green-500/5"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {u.is_active ? "person_off" : "person_check"}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
