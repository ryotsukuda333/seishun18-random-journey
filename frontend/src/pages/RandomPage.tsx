/**
 * ランダム旅行ページコンポーネント
 */

import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import { fetchRandomJourney } from '@/utils/api';
import type { Journey } from '@/types/api';

export function RandomPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [journey, setJourney] = useState<Journey | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const departureStation =
    (location.state as { departureStation?: string })?.departureStation || '';

  useEffect(() => {
    if (!departureStation) {
      navigate('/');
      return;
    }

    generateRandomJourney();
  }, [departureStation]);

  const generateRandomJourney = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const result = await fetchRandomJourney({
        departureStation,
      });
      setJourney(result);
      setRetryCount(0);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'ランダムな目的地の生成に失敗しました';
      setError(errorMessage);

      if (retryCount < 3) {
        setRetryCount(retryCount + 1);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    if (!journey) return;

    const shareData = {
      title: '青春18切符ランダム旅行',
      text: `${journey.departure.name}から${journey.destination.name}へランダム旅行!`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // Share cancelled or failed
      }
    } else {
      // Fallback: Copy to clipboard
      const text = `${shareData.text}\n${shareData.url}`;
      navigator.clipboard.writeText(text);
      alert('クリップボードにコピーしました!');
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        {isGenerating && (
          <div className="bg-white rounded-xl shadow-lg p-12">
            <LoadingSpinner />
            <p className="text-center text-gray-600 mt-4">
              ランダムな目的地を生成中...
            </p>
          </div>
        )}

        {error && (
          <ErrorMessage
            message={error}
            suggestion={
              retryCount < 3
                ? '自動で再試行します...'
                : 'ホームに戻って最初からやり直してください'
            }
            onRetry={retryCount >= 3 ? () => navigate('/') : undefined}
          />
        )}

        {journey && !isGenerating && (
          <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
            <h2 className="text-3xl font-bold text-center text-gray-900">
              🎉 目的地が決まりました!
            </h2>

            {/* 出発駅 */}
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="text-sm text-blue-600 font-semibold mb-1">
                出発駅
              </div>
              <div className="text-2xl font-bold text-blue-900">
                {journey.departure.name}
              </div>
              <div className="text-sm text-blue-700 mt-1">
                {journey.departure.prefecture}
              </div>
            </div>

            {/* 矢印 */}
            <div className="text-center text-4xl">⬇️</div>

            {/* 目的地駅 */}
            <div className="bg-green-50 rounded-lg p-6">
              <div className="text-sm text-green-600 font-semibold mb-1">
                目的地駅
              </div>
              <div className="text-2xl font-bold text-green-900">
                {journey.destination.name}
              </div>
              <div className="text-sm text-green-700 mt-1">
                {journey.destination.prefecture}
              </div>
            </div>

            {/* アクションボタン */}
            <div className="space-y-3">
              <a
                href={journey.jorudanLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg text-center transition-colors"
              >
                🚃 ジョルダンで経路を確認
              </a>

              <button
                onClick={handleShare}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition-colors"
              >
                📤 結果をシェア
              </button>

              <button
                onClick={generateRandomJourney}
                className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-4 px-6 rounded-lg transition-colors"
              >
                🎲 もう一度ランダム生成
              </button>

              <button
                onClick={() => navigate('/')}
                className="w-full text-blue-600 hover:underline py-2"
              >
                ホームに戻る
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
