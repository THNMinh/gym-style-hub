import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, RefreshCw, Filter, RotateCcw, Calendar, ShieldAlert, Globe, Info, AlertTriangle, UserCheck, ChevronRight } from "lucide-react";
import { getSystemLogsApi, getSystemLogByIdApi } from "@/entities/admin/services";
import type { SystemLogDto } from "@/entities/admin/types";
import { formatDateTime } from "@/shared/lib/format";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminPagination } from "./admin-pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function LogLevelBadge({ level }: { level: string }) {
  const normalized = level.toLowerCase();
  switch (normalized) {
    case "information":
    case "info":
      return (
        <Badge variant="outline" className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30 gap-1 font-bold">
          <Info className="size-3 text-blue-500" /> INFO
        </Badge>
      );
    case "warning":
    case "warn":
      return (
        <Badge variant="outline" className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 gap-1 font-bold">
          <AlertTriangle className="size-3 text-amber-500" /> WARN
        </Badge>
      );
    case "error":
      return (
        <Badge variant="outline" className="bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30 gap-1 font-bold">
          <ShieldAlert className="size-3 text-rose-500" /> ERROR
        </Badge>
      );
    default:
      return <Badge variant="secondary">{level}</Badge>;
  }
}

export function SystemLogsFeature() {
  const [actionFilter, setActionFilter] = useState("");
  const [logLevelFilter, setLogLevelFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);

  // Selected Log Detail Modal
  const [selectedLog, setSelectedLog] = useState<SystemLogDto | null>(null);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  // Fetch Full Log Detail with userEmail from GetById API
  const logDetailQuery = useQuery({
    queryKey: ["admin-system-log-detail", selectedLogId],
    queryFn: () => (selectedLogId ? getSystemLogByIdApi(selectedLogId) : Promise.resolve(null)),
    enabled: !!selectedLogId,
  });

  const logDetail = logDetailQuery.data || selectedLog;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-system-logs", actionFilter, logLevelFilter, fromDate, toDate, page],
    queryFn: () =>
      getSystemLogsApi({
        action: actionFilter || undefined,
        logLevel: logLevelFilter || undefined,
        fromDate: fromDate ? new Date(fromDate).toISOString() : undefined,
        toDate: toDate ? new Date(`${toDate}T23:59:59`).toISOString() : undefined,
        page,
        pageSize: 15,
      }),
  });

  const handleReset = () => {
    setActionFilter("");
    setLogLevelFilter("");
    setFromDate("");
    setToDate("");
    setPage(1);
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ShieldAlert className="size-6 text-primary" /> Nhật ký Thao tác Hệ thống (System Audit Logs)
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Ghi nhận toàn bộ vết kiểm toán thao tác hệ thống, địa chỉ IP client, User-Agent và nhật ký cảnh báo/lỗi.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2 text-xs">
          <RefreshCw className="size-3.5" /> Làm mới
        </Button>
      </div>

      {/* Filter Card */}
      <Card className="border border-border/80 shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Filter className="size-3.5 text-primary" /> Bộ lọc Audit Logs
            </span>
            {(actionFilter || logLevelFilter || fromDate || toDate) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="h-6 text-[11px] text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="size-3 mr-1" /> Xóa bộ lọc
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Action Filter */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Lọc Action (VD: UpdateOrderStatus)..."
                value={actionFilter}
                onChange={(e) => {
                  setActionFilter(e.target.value);
                  setPage(1);
                }}
                className="pl-8 text-xs h-9"
              />
            </div>

            {/* LogLevel Filter */}
            <div>
              <select
                value={logLevelFilter}
                onChange={(e) => {
                  setLogLevelFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full h-9 px-3 rounded-md border border-input bg-background text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
              >
                <option value="">-- Tất cả Log Level --</option>
                <option value="Information">ℹ️ Information (Info)</option>
                <option value="Warning">⚠️ Warning (Cảnh báo)</option>
                <option value="Error">🔴 Error (Lỗi hệ thống)</option>
              </select>
            </div>

            {/* From Date */}
            <div className="relative">
              <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                type="date"
                placeholder="Từ ngày"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setPage(1);
                }}
                className="pl-8 text-xs h-9"
              />
            </div>

            {/* To Date */}
            <div className="relative">
              <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                type="date"
                placeholder="Đến ngày"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setPage(1);
                }}
                className="pl-8 text-xs h-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card className="border border-border/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/60 border-b border-border text-[11px] uppercase font-bold text-muted-foreground tracking-wider">
              <tr>
                <th className="py-3 px-4">Thời gian</th>
                <th className="py-3 px-4">Level</th>
                <th className="py-3 px-4">Hành động (Action)</th>
                <th className="py-3 px-4">Diễn giải (Message)</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4">Trình duyệt / Agent</th>
                <th className="py-3 px-4 text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-muted-foreground">
                    Đang tải nhật ký hệ thống...
                  </td>
                </tr>
              ) : !data?.items || data.items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-muted-foreground">
                    Không tìm thấy nhật ký hệ thống nào khớp với bộ lọc.
                  </td>
                </tr>
              ) : (
                data.items.map((log: SystemLogDto) => {
                  const dateFormatted = new Date(log.createdAt).toLocaleString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  });

                  return (
                    <tr key={log.logId} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3.5 px-4 text-xs font-medium text-muted-foreground whitespace-nowrap">
                        {dateFormatted}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <LogLevelBadge level={log.logLevel} />
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-xs text-primary whitespace-nowrap">
                        {log.action}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-foreground max-w-md truncate">
                        {log.message}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-mono text-muted-foreground whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 bg-muted px-2 py-0.5 rounded">
                          <Globe className="size-3 text-muted-foreground" />
                          {log.ipAddress || "::1"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-muted-foreground max-w-xs truncate" title={log.userAgent || ""}>
                        {log.userAgent ? (
                          log.userAgent.includes("Chrome") ? "Chrome" : log.userAgent.includes("Firefox") ? "Firefox" : log.userAgent.includes("Safari") ? "Safari" : "Browser"
                        ) : (
                          "System Job"
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedLog(log);
                            setSelectedLogId(log.logId);
                          }}
                          className="h-7 px-2 text-xs text-primary hover:text-primary/80"
                        >
                          Xem <ChevronRight className="size-3 ml-0.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <AdminPagination
          page={page}
          pageSize={15}
          totalCount={data?.totalCount || 0}
          totalPages={data?.totalPages || 1}
          onPageChange={setPage}
        />
      </Card>

      {/* Log Detail Dialog */}
      <Dialog
        open={selectedLog !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedLog(null);
            setSelectedLogId(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <LogLevelBadge level={logDetail?.logLevel || "Info"} />
              <span>Chi tiết System Audit Log: {logDetail?.action}</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Mã Log ID: <code className="font-mono text-foreground">{logDetail?.logId}</code>
            </DialogDescription>
          </DialogHeader>

          {logDetailQuery.isLoading ? (
            <div className="py-8 text-center text-xs text-muted-foreground">Đang tải thông tin chi tiết nhật ký...</div>
          ) : logDetail ? (
            <div className="space-y-4 py-2 text-xs">
              <div className="rounded-md bg-muted p-4 space-y-2">
                <p className="font-bold text-foreground">Nội dung Diễn giải (Message):</p>
                <p className="font-mono text-sm leading-relaxed text-foreground bg-background p-3 rounded border border-border whitespace-pre-wrap">
                  {logDetail.message}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border pt-3">
                <div>
                  <p className="text-muted-foreground font-semibold">Tài khoản thực hiện (Email):</p>
                  <p className="font-bold text-primary flex items-center gap-1.5 mt-0.5 text-sm">
                    <UserCheck className="size-4 text-emerald-500 shrink-0" />
                    {"userEmail" in logDetail && logDetail.userEmail ? logDetail.userEmail : "Hệ thống (System Job / Guest)"}
                  </p>
                  {logDetail.userId && (
                    <p className="font-mono text-[11px] text-muted-foreground mt-1">
                      User ID: {logDetail.userId}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-muted-foreground font-semibold">Thời điểm phát sinh:</p>
                  <p className="font-bold text-foreground font-mono mt-0.5 text-sm">
                    {formatDateTime(logDetail.createdAt)}
                  </p>
                  <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                    ISO: {new Date(logDetail.createdAt).toISOString()}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 border-t border-border pt-3">
                <p className="text-muted-foreground font-semibold">Client IP & User Agent:</p>
                <div className="space-y-1 bg-muted/50 p-2.5 rounded font-mono text-[11px] text-foreground">
                  <p><strong>IP Address:</strong> {logDetail.ipAddress || "::1"}</p>
                  <p className="break-all"><strong>User-Agent:</strong> {logDetail.userAgent || "N/A"}</p>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
