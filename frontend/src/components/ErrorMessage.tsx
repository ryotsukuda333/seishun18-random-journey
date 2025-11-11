/**
 * エラーメッセージコンポーネント
 */

interface ErrorMessageProps {
  message: string;
  suggestion?: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, suggestion, onRetry }: ErrorMessageProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <svg
            className="h-6 w-6 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800">エラー</h3>
          <p className="mt-1 text-sm text-red-700">{message}</p>
          {suggestion && (
            <p className="mt-2 text-sm text-red-600">💡 {suggestion}</p>
          )}
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              再試行
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
