"use client";

import { useState } from "react";
import {
  Users as UsersIcon,
  Search,
  Eye,
  Trash2,
  Shield,
  UserCheck,
  User as UserIcon,
  ShoppingBag,
  Mail,
  Phone,
  ChevronDown,
  Calendar,
  MapPin,
} from "lucide-react";
import UserModal from "./UserModal";

interface UsersTabProps {
  users: any[];
  orders?: any[];
  onEditUser: (user: any) => void;
  onDeleteUser: (id: number) => void;
}

export default function UsersTab({ users, orders = [], onEditUser, onDeleteUser }: UsersTabProps) {
  const [selectedUserForDetail, setSelectedUserForDetail] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 20;

  // Filter users based on search query & selected role
  const filteredUsers = users.filter((u) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      u.name?.toLowerCase().includes(query) ||
      u.email?.toLowerCase().includes(query) ||
      u.username?.toLowerCase().includes(query) ||
      u.phone?.toLowerCase().includes(query) ||
      u.address?.toLowerCase().includes(query);

    const matchesRole =
      selectedRole === "ALL" ||
      (selectedRole === "ADMIN" && String(u.role).toUpperCase() === "ADMIN") ||
      (selectedRole === "USER" && String(u.role).toUpperCase() !== "ADMIN");

    return matchesSearch && matchesRole;
  });

  const totalRows = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
  const displayedUsers = filteredUsers.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  if (selectedUserForDetail) {
    return (
      <UserModal
        initialData={selectedUserForDetail}
        allOrders={orders}
        onClose={() => setSelectedUserForDetail(null)}
        onSuccess={(updated: any) => {
          onEditUser(updated);
          setSelectedUserForDetail(updated);
        }}
      />
    );
  }

  return (
    <div className="space-y-4 font-sans">
      {/* Header Bar & Search / Role Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
            <UsersIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm">Manajemen & Setelan Pengguna</h3>
            <p className="text-xs text-gray-500 font-medium">
              Total {users.length} pengguna terdaftar di sistem
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, email, HP, alamat..."
              className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-purple-500 rounded-xl pl-9 pr-3 py-1.5 text-xs font-semibold text-gray-900 focus:outline-none"
            />
          </div>

          {/* Role Filter Select */}
          <div className="relative">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="bg-gray-50 border border-gray-200 hover:border-gray-300 text-gray-700 text-xs py-1.5 pl-3 pr-8 rounded-xl appearance-none focus:outline-none focus:border-purple-500 cursor-pointer font-semibold shadow-xs"
            >
              <option value="ALL">Semua Role</option>
              <option value="USER">USER (Pembeli Terdaftar)</option>
              <option value="ADMIN">ADMIN (Administrator)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Users Table Card */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">#</th>
                <th className="px-4 py-3.5">Pengguna</th>
                <th className="px-4 py-3.5">Kontak</th>
                <th className="px-4 py-3.5">Role Akses</th>
                <th className="px-4 py-3.5">Pesanan</th>
                <th className="px-4 py-3.5">Terdaftar</th>
                <th className="px-4 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {displayedUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    Tidak ada pengguna yang sesuai pencarian/filter.
                  </td>
                </tr>
              ) : (
                displayedUsers.map((u, index) => {
                  const rowIndex = (currentPage - 1) * rowsPerPage + index + 1;
                  const roleStr = String(u.role || "USER").trim().toUpperCase();

                  return (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3.5 text-gray-400 font-mono">{rowIndex}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          {u.avatar ? (
                            <img
                              src={u.avatar}
                              alt={u.name}
                              className="w-9 h-9 rounded-full object-cover border border-purple-200 shrink-0 bg-gray-100"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-purple-100 border border-purple-200 text-purple-700 font-bold flex items-center justify-center text-sm shrink-0 uppercase">
                              {u.name ? u.name.charAt(0) : "U"}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-gray-900 text-xs">{u.name}</div>
                            {u.username && (
                              <div className="text-gray-400 text-[10px] font-medium">
                                @{u.username}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-gray-800 font-medium text-[11px]">
                            <Mail className="w-3 h-3 text-gray-400 shrink-0" />
                            <span>{u.email}</span>
                          </div>
                          {u.phone && (
                            <div className="flex items-center gap-1.5 text-gray-500 text-[10px]">
                              <Phone className="w-3 h-3 text-gray-400 shrink-0" />
                              <span>{u.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        {roleStr === "ADMIN" ? (
                          <span className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 text-[10px] rounded-full font-extrabold flex items-center gap-1 w-fit">
                            <Shield className="w-3 h-3 text-red-600" />
                            <span>ADMINISTRATOR</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 text-[10px] rounded-full font-extrabold flex items-center gap-1 w-fit">
                            <UserIcon className="w-3 h-3 text-purple-600" />
                            <span>PEMBELI (USER)</span>
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-gray-100 text-gray-800 rounded-md font-extrabold text-[11px]">
                          <ShoppingBag className="w-3 h-3 text-gray-500" />
                          <span>{u._count?.orders || 0} Trx</span>
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-gray-500 text-[11px]">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span>{formatDate(u.createdAt)}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedUserForDetail(u)}
                            className="p-1.5 text-gray-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                            title="Preview / Edit Profil & Akses User"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onDeleteUser(u.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Akun User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
