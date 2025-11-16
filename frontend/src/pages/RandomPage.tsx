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
  const [isRolling, setIsRolling] = useState(false);
  const [displayedDestination, setDisplayedDestination] = useState('');
  const [showPrefecture, setShowPrefecture] = useState(false);

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
    // 状態を完全にリセット
    setJourney(null);
    setIsGenerating(true);
    setError(null);
    setIsRolling(false);
    setShowPrefecture(false);
    setDisplayedDestination('');

    try {
      const result = await fetchRandomJourney({
        departureStation,
      });

      // API呼び出し完了後、journeyをセット
      setJourney(result);
      setRetryCount(0);
      setIsGenerating(false);

      // スロット演出開始（isGeneratingがfalseになった後）
      await performSlotAnimation(result.destination.name);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'ランダムな目的地の生成に失敗しました';
      setError(errorMessage);
      setIsGenerating(false);

      if (retryCount < 3) {
        setRetryCount(retryCount + 1);
      }
    }
  };

  const performSlotAnimation = async (destinationName: string) => {
    setIsRolling(true);
    const chars = destinationName.split('');

    // ランダム文字候補（日本語の駅名によく使われる文字）
    const randomChars = '東西南北新大小上下中前後本町市田川山海島港橋'.split('');

    for (let i = 0; i < chars.length; i++) {
      // 各文字をロールする（10回ランダム文字を表示）
      for (let j = 0; j < 10; j++) {
        const randomChar = randomChars[Math.floor(Math.random() * randomChars.length)];
        setDisplayedDestination(
          chars.slice(0, i).join('') + randomChar + '　'.repeat(chars.length - i - 1)
        );
        await new Promise(resolve => setTimeout(resolve, 30));
      }

      // 確定した文字を表示
      setDisplayedDestination(chars.slice(0, i + 1).join('') + '　'.repeat(chars.length - i - 1));
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // 全文字確定後、都道府県を表示
    setDisplayedDestination(destinationName);
    setIsRolling(false);
    await new Promise(resolve => setTimeout(resolve, 300));
    setShowPrefecture(true);
  };

  const handleShare = async () => {
    if (!journey) return;

    const shareText =
      `🚃 青春18きっぷランダム旅行\n\n` +
      `📍 出発駅: ${journey.departure.name} (${journey.departure.prefecture})\n` +
      `🎯 目的地: ${journey.destination.name} (${journey.destination.prefecture})\n\n` +
      `経路を確認: ${journey.jorudanLink}`;

    const shareData = {
      title: '青春18きっぷランダム旅行',
      text: shareText,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // Share cancelled or failed
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(shareText);
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
              <div className="text-sm text-blue-600 font-semibold mb-1 text-center">
                出発駅
              </div>
              <div className="text-2xl font-bold text-blue-900 flex items-center justify-center">
                {journey.departure.name}
              </div>
              {journey.departure.yomi && (
                <div className="text-sm text-blue-600 mt-1 text-center">
                  ({journey.departure.yomi})
                </div>
              )}
              <div className="text-sm text-blue-700 mt-1 text-center">
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
              <div className="text-2xl font-bold text-green-900 min-h-[2.5rem] flex items-center justify-center">
                {displayedDestination || journey.destination.name}
              </div>
              {showPrefecture && (
                <>
                  {journey.destination.yomi && (
                    <div className="text-sm text-green-600 mt-1 animate-fadeIn text-center">
                      ({journey.destination.yomi})
                    </div>
                  )}
                  <div className="text-sm text-green-700 mt-1 animate-fadeIn text-center">
                    {journey.destination.prefecture}
                  </div>
                </>
              )}
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

              {/* 地図表示 (アニメーション完了後) */}
              {showPrefecture && journey.destination.latitude && journey.destination.longitude && (
                <div className="animate-fadeIn">
                  <div className="text-sm text-gray-600 font-semibold mb-2 text-center">
                    📍 目的地の位置
                  </div>
                  <div className="w-full h-[300px] rounded-lg overflow-hidden shadow-md">
                    <iframe
                      src={`https://www.google.com/maps?&q=${encodeURIComponent(journey.destination.name)}&z=15&ll=${journey.destination.latitude},${journey.destination.longitude}&output=embed`}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="目的地の地図"
                    ></iframe>
                  </div>
                </div>
              )}

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
