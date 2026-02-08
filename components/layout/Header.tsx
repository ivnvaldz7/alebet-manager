"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
/* eslint-disable @next/next/no-img-element */
import { Bell, LogOut, Settings, User as UserIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { NotificacionesPanel } from "./NotificacionesPanel";
import { useNotificaciones } from "@/hooks/useNotificaciones";
import type { AdminContext } from "@/types";
import toast from "react-hot-toast";

const contextoLabels: Record<AdminContext, string> = {
  admin: "⚙️ Admin",
  vendedor: "💼 Vendedor",
  armador: "🎯 Armador",
};

const contextMenuItems: { key: AdminContext; emoji: string; label: string }[] =
  [
    { key: "admin", emoji: "⚙️", label: "Administrador" },
    { key: "vendedor", emoji: "💼", label: "Vendedor" },
    { key: "armador", emoji: "🎯", label: "Armador" },
  ];

export function Header() {
  const { user, cambiarContexto } = useAuth();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [showNotificaciones, setShowNotificaciones] = useState(false);

  const {
    notificaciones,
    noLeidas,
    isLoading: notifLoading,
    markAsRead,
    markAllAsRead,
    requestPushPermission,
    timeAgo,
  } = useNotificaciones();

  useEffect(() => {
    requestPushPermission();
  }, [requestPushPermission]);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  const handleCambiarContexto = async (nuevoContexto: AdminContext) => {
    try {
      await cambiarContexto(nuevoContexto);
      toast.success(`Cambiado a modo ${nuevoContexto}`);
      setShowContextMenu(false);
    } catch {
      toast.error("Error al cambiar contexto");
    }
  };

  const contexto = (user?.contexto || "admin") as AdminContext;

  const rolLabel =
    user?.role === "admin"
      ? "Administrador"
      : user?.role === "vendedor"
        ? "Vendedor"
        : "Armador";

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-secondary-200 safe-area-top">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => router.push("/inicio")}
            className="hover:opacity-90 transition-opacity"
          >
            <img
              src="/logo-completo.png"
              alt="Ale-Bet Manager"
              className="h-10 sm:h-14 w-auto"
            />
          </button>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Context Switcher (solo admin) */}
            {user?.role === "admin" && (
              <div className="relative">
                <button
                  onClick={() => setShowContextMenu(!showContextMenu)}
                  className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-primary-50 border border-primary-200 hover:bg-primary-100 active:bg-primary-200 transition-colors"
                >
                  <span className="text-sm font-medium text-primary-700">
                    <span className="sm:hidden">
                      {contextoLabels[contexto].split(" ")[0]}
                    </span>
                    <span className="hidden sm:inline">
                      {contextoLabels[contexto]}
                    </span>
                  </span>
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {showContextMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40 bg-black/20"
                      onClick={() => setShowContextMenu(false)}
                    />
                    {/* Mobile: bottom sheet */}
                    <div className="md:hidden fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-2xl border-t border-secondary-200 pb-6">
                      <div className="w-8 h-1 bg-secondary-300 rounded-full mx-auto mt-3 mb-4" />
                      <p className="px-5 pb-2 text-xs font-semibold text-secondary-500 uppercase tracking-wider">
                        Modo de vista
                      </p>
                      {contextMenuItems.map((item) => (
                        <button
                          key={item.key}
                          onClick={() => handleCambiarContexto(item.key)}
                          className="w-full px-5 py-3.5 text-left hover:bg-secondary-50 active:bg-secondary-100 flex items-center gap-3"
                        >
                          <span className="text-xl">{item.emoji}</span>
                          <span className="text-base text-secondary-800">
                            {item.label}
                          </span>
                        </button>
                      ))}
                    </div>
                    {/* Desktop: dropdown */}
                    <div className="hidden md:block absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-secondary-200 py-2 z-50">
                      {contextMenuItems.map((item) => (
                        <button
                          key={item.key}
                          onClick={() => handleCambiarContexto(item.key)}
                          className="w-full px-4 py-2 text-left hover:bg-secondary-50 flex items-center gap-2"
                        >
                          <span>{item.emoji}</span>
                          <span className="text-sm">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotificaciones(!showNotificaciones)}
                className="relative p-2 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 active:bg-secondary-200 rounded-lg transition-colors"
              >
                <Bell className="h-5 w-5" />
                {noLeidas > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                )}
              </button>

              {showNotificaciones && (
                <NotificacionesPanel
                  onClose={() => setShowNotificaciones(false)}
                  notificaciones={notificaciones}
                  noLeidas={noLeidas}
                  isLoading={notifLoading}
                  markAsRead={markAsRead}
                  markAllAsRead={markAllAsRead}
                  timeAgo={timeAgo}
                />
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="p-2 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 active:bg-secondary-200 rounded-lg transition-colors"
              >
                <UserIcon className="h-5 w-5" />
              </button>

              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40 bg-black/20"
                    onClick={() => setShowUserMenu(false)}
                  />
                  {/* Mobile: bottom sheet */}
                  <div className="md:hidden fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-2xl border-t border-secondary-200 pb-6">
                    <div className="w-8 h-1 bg-secondary-300 rounded-full mx-auto mt-3 mb-2" />
                    <div className="px-5 py-3 border-b border-secondary-100">
                      <p className="text-base font-semibold text-secondary-900">
                        {user?.name}
                      </p>
                      <p className="text-sm text-secondary-500 mt-0.5">
                        {user?.email}
                      </p>
                      <Badge variant="secondary" className="mt-2 text-xs">
                        {rolLabel}
                      </Badge>
                    </div>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        router.push("/perfil");
                      }}
                      className="w-full px-5 py-3.5 text-left hover:bg-secondary-50 active:bg-secondary-100 flex items-center gap-3"
                    >
                      <UserIcon className="h-5 w-5 text-secondary-500" />
                      <span className="text-base text-secondary-800">
                        Mi Perfil
                      </span>
                    </button>
                    {user?.role === "admin" && (
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          router.push("/admin/usuarios");
                        }}
                        className="w-full px-5 py-3.5 text-left hover:bg-secondary-50 active:bg-secondary-100 flex items-center gap-3"
                      >
                        <Settings className="h-5 w-5 text-secondary-500" />
                        <span className="text-base text-secondary-800">
                          Gestión Admin
                        </span>
                      </button>
                    )}
                    <div className="border-t border-secondary-100 mt-2">
                      <button
                        onClick={handleLogout}
                        className="w-full px-5 py-3.5 text-left hover:bg-red-50 active:bg-red-100 flex items-center gap-3"
                      >
                        <LogOut className="h-5 w-5 text-red-500" />
                        <span className="text-base text-red-600">
                          Cerrar Sesión
                        </span>
                      </button>
                    </div>
                  </div>
                  {/* Desktop: dropdown */}
                  <div className="hidden md:block absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-secondary-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-secondary-200">
                      <p className="text-sm font-medium text-secondary-900">
                        {user?.name}
                      </p>
                      <p className="text-xs text-secondary-500">{user?.email}</p>
                      <Badge variant="secondary" className="mt-2 text-xs">
                        {rolLabel}
                      </Badge>
                    </div>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        router.push("/perfil");
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-secondary-50 flex items-center gap-2 text-sm text-secondary-700"
                    >
                      <UserIcon className="h-4 w-4" />
                      Mi Perfil
                    </button>
                    {user?.role === "admin" && (
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          router.push("/admin/usuarios");
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-secondary-50 flex items-center gap-2 text-sm text-secondary-700"
                      >
                        <Settings className="h-4 w-4" />
                        Gestión Admin
                      </button>
                    )}
                    <div className="border-t border-secondary-200 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-2 text-sm text-red-600"
                      >
                        <LogOut className="h-4 w-4" />
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
