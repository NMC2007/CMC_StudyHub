/**
 * SystemHealthCard.jsx
 * Widget hiển thị tình trạng tài nguyên hệ thống (RAM, CPU Load, DB status, Uptime) real-time.
 */
import React from "react";
import { Activity, Database, Cpu, HardDrive, Clock, RefreshCw } from "lucide-react";
import { useSystemHealth } from "#/hooks/useAdmin";
import Skeleton from "#/components/ui/Skeleton";

function formatUptime(seconds) {
  if (!seconds || isNaN(seconds)) return "0s";
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
  return parts.join(" ");
}

export default function SystemHealthCard() {
  const { data: health, isLoading, isError, refetch, isRefetching } = useSystemHealth();

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl p-6 border border-border shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-48 rounded-lg" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !health) {
    return (
      <div className="bg-red-50/50 rounded-2xl p-6 border border-red-200 flex items-center justify-between">
        <div className="flex items-center gap-3 text-red-700">
          <Activity className="w-6 h-6 shrink-0 text-red-600" />
          <div>
            <h3 className="font-bold text-sm">Không thể kết nối giám sát hệ thống</h3>
            <p className="text-xs text-red-600/80">Máy chủ có thể đang bận hoặc gián đoạn kết nối.</p>
          </div>
        </div>
        <button
          onClick={() => refetch()}
          className="px-3 py-1.5 text-xs font-semibold bg-white border border-red-200 text-red-700 rounded-lg hover:bg-red-100/50 cursor-pointer transition-colors"
        >
          Thử lại
        </button>
      </div>
    );
  }

  const isUp = health.status === "UP";
  const dbConnected = health.database === "Connected";

  const totalRam = health.memory?.total_mb || 1;
  const usedRam = health.memory?.heap_used_mb || 0;
  const ramPercent = Math.min(100, Math.round((usedRam / totalRam) * 100));

  return (
    <div className="bg-card rounded-2xl p-6 border border-border shadow-2xs relative overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-admin/10 flex items-center justify-center text-brand-admin shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-text-primary tracking-tight flex items-center gap-2">
              Giám sát Sức khỏe Hệ thống (Real-time)
            </h3>
            <p className="text-xs text-text-secondary">
              Tự động cập nhật định kỳ mỗi 30 giây
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer disabled:opacity-50"
            title="Làm mới thông số"
          >
            <RefreshCw className={`w-4 h-4 ${isRefetching ? "animate-spin text-brand-admin" : ""}`} />
          </button>

          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              isUp
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                : "bg-red-50 text-red-700 border border-red-200/60"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isUp ? "bg-emerald-500 animate-pulse" : "bg-red-500"
              }`}
            />
            {isUp ? "SYSTEM UP" : "SYSTEM DOWN"}
          </span>
        </div>
      </div>

      {/* 4 Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Database */}
        <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Database Status</span>
            <Database className="w-4 h-4 text-brand-admin" />
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-lg font-bold ${
                dbConnected ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {health.database || "Unknown"}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1">PostgreSQL + TypeORM Pool</span>
        </div>

        {/* Metric 2: Memory (RAM) */}
        <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Heap Memory Usage</span>
            <HardDrive className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-bold text-text-primary">
                {usedRam} <span className="text-xs font-normal text-slate-500">MB</span>
              </span>
              <span className="text-xs font-semibold text-blue-600">{ramPercent}%</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${ramPercent}%` }}
              />
            </div>
          </div>
          <span className="text-[11px] text-slate-400 mt-1">
            Total Allocated: {totalRam} MB
          </span>
        </div>

        {/* Metric 3: CPU Load */}
        <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">CPU Avg Load (1m/5m)</span>
            <Cpu className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-text-primary">
              {health.cpu_load?.load_1m?.toFixed(2) ?? "0.00"}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              / {health.cpu_load?.load_5m?.toFixed(2) ?? "0.00"}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1">
            15m Load: {health.cpu_load?.load_15m?.toFixed(2) ?? "0.00"}
          </span>
        </div>

        {/* Metric 4: Uptime */}
        <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Process Uptime</span>
            <Clock className="w-4 h-4 text-purple-500" />
          </div>
          <div className="flex items-baseline">
            <span className="text-lg font-bold text-text-primary">
              {formatUptime(health.uptime_seconds)}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1">Node.js Express Backend</span>
        </div>
      </div>
    </div>
  );
}
