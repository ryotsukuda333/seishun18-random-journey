/**
 * ホームページコンポーネント
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import { fetchNearestStation, fetchAnnouncements } from '@/utils/api';
import type { Announcement } from '@/types/api';

export function HomePage() {
  const navigate = useNavigate();
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [manualInput, setManualInput] = useState(false);
  const [stationName, setStationName] = useState('');

  // お知らせ取得
  useEffect(() => {
    fetchAnnouncements()
      .then((res) => setAnnouncements(res.announcements))
      .catch(() => {
        // お知らせ取得失敗は無視
      });
  }, []);

  // 位置情報取得とランダム旅行開始
  const handleStartWithLocation = async () => {
    setIsLocating(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('お使いのブラウザは位置情報に対応していません');
      setIsLocating(false);
      setManualInput(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const result = await fetchNearestStation(latitude, longitude);

          if (result.stations.length > 0) {
            const station = result.stations[0];
            navigate('/random', { state: { departureStation: station.name } });
          } else {
            setError('近くに駅が見つかりませんでした');
            setManualInput(true);
          }
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : '駅情報の取得に失敗しました'
          );
          setManualInput(true);
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setError('位置情報の利用が拒否されました');
        } else {
          setError('位置情報の取得に失敗しました');
        }
        setIsLocating(false);
        setManualInput(true);
      }
    );
  };

  // 駅名手入力でランダム旅行開始
  const handleStartWithManualInput = () => {
    if (!stationName.trim()) {
      setError('駅名を入力してください');
      return;
    }
    navigate('/random', { state: { departureStation: stationName.trim() } });
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-bold text-gray-900">
            🎲 ランダムな目的地へ、冒険の旅に出よう
          </h2>
          <p className="text-lg text-gray-600">
            青春18切符で行けるランダムな駅を提案します。
            <br />
            決断疲れなし、即興の旅を楽しもう!
          </p>
        </div>

        {/* お知らせ */}
        {announcements.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">
              📢 お知らせ
            </h3>
            <div className="space-y-2">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="text-sm text-blue-800">
                  <strong>{announcement.title}</strong>
                  <p className="text-blue-700">{announcement.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* エラーメッセージ */}
        {error && (
          <ErrorMessage
            message={error}
            suggestion={
              manualInput ? '駅名を入力してください' : '再試行してください'
            }
            onRetry={() => {
              setError(null);
              setManualInput(false);
            }}
          />
        )}

        {/* メインアクション */}
        {!manualInput ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center space-y-6">
            <div className="text-6xl">🚃</div>
            {isLocating ? (
              <LoadingSpinner />
            ) : (
              <>
                <button
                  onClick={handleStartWithLocation}
                  className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-bold py-4 px-8 rounded-lg text-xl shadow-lg transition-all transform hover:scale-105"
                >
                  📍 現在地からランダム旅行を開始
                </button>
                <button
                  onClick={() => setManualInput(true)}
                  className="text-blue-600 hover:underline text-sm"
                >
                  駅名を手入力する
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
            <h3 className="text-xl font-bold text-gray-900">
              出発駅を入力してください
            </h3>
            <input
              type="text"
              value={stationName}
              onChange={(e) => setStationName(e.target.value)}
              placeholder="例: 東京"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleStartWithManualInput();
                }
              }}
            />
            <div className="flex gap-3">
              <button
                onClick={handleStartWithManualInput}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                ランダム旅行を開始
              </button>
              <button
                onClick={() => {
                  setManualInput(false);
                  setStationName('');
                  setError(null);
                }}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        )}

        {/* 使い方 */}
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-4">
          <h3 className="text-xl font-bold text-gray-900">🎯 使い方</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>「現在地からランダム旅行を開始」ボタンを押す</li>
            <li>位置情報の利用を許可する</li>
            <li>ランダムに選ばれた目的地駅を確認</li>
            <li>ジョルダンで経路を確認して、出発!</li>
          </ol>
        </div>
      </div>
    </Layout>
  );
}
