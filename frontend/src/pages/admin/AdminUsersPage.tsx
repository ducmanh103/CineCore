import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../api/axios';
import { Skeleton } from '../../components/ui/Skeleton';
import { useUiStore, toast } from '../../store/uiStore';
import { Lock, Unlock, Search } from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  const { confirm } = useUiStore();

  const fetchUsers = () => {
    setLoading(true);
    api
      .get<any, any[]>('/admin/users')
      .then((res) => setUsers(Array.isArray(res) ? res : []))
      .catch((err) => toast.error('Không thể tải danh sách tài khoản', err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          u.username?.toLowerCase().includes(q) ||
          u.fullName?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [users, roleFilter, search]);

  const handleToggleStatus = async (user: any) => {
    const isLocking = user.status === 'ACTIVE';
    const newStatus = isLocking ? 'LOCKED' : 'ACTIVE';

    const ok = await confirm({
      title: isLocking ? `Khóa tài khoản ${user.username}?` : `Mở khóa tài khoản ${user.username}?`,
      message: isLocking
        ? `Tài khoản "${user.fullName}" sẽ tạm ngừng quyền đăng nhập và giao dịch đặt vé trên hệ thống.`
        : `Khôi phục quyền đăng nhập và đặt vé bình thường cho tài khoản "${user.fullName}"?`,
      confirmText: isLocking ? 'Khóa tài khoản' : 'Mở khóa',
      cancelText: 'Hủy bỏ',
      variant: isLocking ? 'danger' : 'primary',
    });

    if (!ok) return;

    try {
      await api.patch(`/admin/users/${user.id}/status`, { status: newStatus });
      toast.success(
        isLocking ? 'Đã khóa tài khoản thành viên' : 'Đã mở khóa tài khoản',
        user.fullName || user.username,
      );
      fetchUsers();
    } catch (err: any) {
      toast.error('Cập nhật trạng thái thất bại', err.message);
    }
  };

  const roleLabels: Record<string, string> = {
    ALL: `Tất cả (${users.length})`,
    ADMIN: 'Ban quản trị',
    STAFF: 'Nhân viên rạp',
    CUSTOMER: 'Hội viên',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-black text-slate-50 tracking-tight">
          Quản Lý Tài Khoản Hội Viên & Nhân Sự
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Tra cứu thông tin hội viên, nhân viên quầy vé và quản lý trạng thái hoạt động tài khoản
        </p>
      </div>

      {/* Filter & Search */}
      <div className="cinema-card rounded-3xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/[0.04] border border-white/10 w-fit overflow-x-auto no-scrollbar">
          {(['ALL', 'ADMIN', 'STAFF', 'CUSTOMER'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRoleFilter(r)}
              className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                roleFilter === r
                  ? 'btn-ncc-primary text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {roleLabels[r]}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search
            className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên tài khoản, họ tên, email..."
            aria-label="Tìm người dùng"
            className="w-full pl-9 pr-3 py-2 rounded-xl cinema-input text-xs font-medium"
          />
        </div>
      </div>

      {loading ? (
        <Skeleton className="h-80 rounded-3xl" />
      ) : (
        <div className="cinema-card rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0B0D13] text-slate-400 uppercase text-[11px] font-bold border-b border-white/[0.08]">
                <tr>
                  <th className="py-3.5 px-5">Tên đăng nhập</th>
                  <th className="py-3.5 px-5">Họ và tên</th>
                  <th className="py-3.5 px-5">Email liên hệ</th>
                  <th className="py-3.5 px-5">Nhóm tài khoản</th>
                  <th className="py-3.5 px-5">Trạng thái</th>
                  <th className="py-3.5 px-5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-3.5 px-5 font-mono font-bold text-slate-100">
                      {u.username}
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-slate-100">
                      {u.fullName}
                    </td>
                    <td className="py-3.5 px-5 text-slate-400">{u.email}</td>
                    <td className="py-3.5 px-5">
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${
                          u.role === 'ADMIN'
                            ? 'bg-indigo-500/15 text-indigo-300 border-indigo-400/30'
                            : u.role === 'STAFF'
                            ? 'bg-amber-500/15 text-amber-300 border-amber-400/30'
                            : 'bg-white/[0.06] text-slate-300 border-white/10'
                        }`}
                      >
                        {u.role === 'ADMIN'
                          ? 'Ban quản trị'
                          : u.role === 'STAFF'
                          ? 'Nhân viên'
                          : 'Hội viên'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                          u.status === 'ACTIVE'
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30'
                            : 'bg-rose-500/15 text-rose-300 border-rose-400/30'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            u.status === 'ACTIVE' ? 'bg-emerald-400' : 'bg-rose-400'
                          }`}
                        />
                        {u.status === 'ACTIVE' ? 'Đang hoạt động' : 'Tạm khóa'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(u)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer ${
                          u.status === 'ACTIVE'
                            ? 'bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 border border-rose-400/30'
                            : 'bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-400/30'
                        }`}
                      >
                        {u.status === 'ACTIVE' ? (
                          <>
                            <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Khóa</span>
                          </>
                        ) : (
                          <>
                            <Unlock className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Mở khóa</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
