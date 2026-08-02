import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorAlertProps {
  title?: string;
  detail?: string;
  onRetry?: () => void;
}

export function ErrorAlert({
  title = 'Đã xảy ra lỗi kết nối',
  detail = 'Không thể tải dữ liệu từ hệ thống. Vui lòng thử lại sau ít phút.',
  onRetry,
}: ErrorAlertProps) {
  return (
    <div className="p-5 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600 shrink-0 mt-0.5">
        <AlertTriangle size={20} />
      </div>
      <div className="flex-1 space-y-1">
        <h4 className="font-bold text-sm text-red-900">{title}</h4>
        <p className="text-xs text-red-700 leading-relaxed">{detail}</p>
        {onRetry && (
          <div className="pt-2">
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-xs shadow-sm transition"
            >
              <RefreshCw size={14} /> Thử lại ngay
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
