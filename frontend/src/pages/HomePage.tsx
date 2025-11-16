/**
 * ホームページコンポーネント
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAnnouncements, suggestStation } from '@/utils/api';
import type { Announcement } from '@/types/api';

interface Station {
  code: string;
  Name: string;
  Yomi: string;
  Type: string;
  Prefecture: {
    code: string;
    Name: string;
  };
}

export function HomePage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [stationName, setStationName] = useState('');
  const [suggestions, setSuggestions] = useState<Station[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // お知らせ取得
  useEffect(() => {
    fetchAnnouncements()
      .then((res) => setAnnouncements(res.announcements))
      .catch(() => {
        // お知らせ取得失敗は無視
      });
  }, []);

  // 駅名入力変更時
  const handleStationNameChange = (value: string) => {
    setStationName(value);
    setSelectedIndex(-1);

    // デバウンス処理（500ms待機）
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (value.trim().length > 0) {
      debounceTimer.current = setTimeout(() => {
        suggestStation(value.trim())
          .then((res) => {
            setSuggestions(res.stations);
            setShowSuggestions(true);
          })
          .catch(() => {
            setSuggestions([]);
            setShowSuggestions(false);
          });
      }, 500);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // 候補選択
  const handleSelectSuggestion = (station: Station) => {
    setStationName(station.Name);
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  // キーボード操作
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        handleSelectSuggestion(suggestions[selectedIndex]);
      } else {
        handleStartJourney();
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  // 駅名入力でランダム旅行開始
  const handleStartJourney = () => {
    if (!stationName.trim()) {
      setError('駅名を入力してください');
      return;
    }
    setError(null);
    setShowSuggestions(false);
    navigate('/random', { state: { departureStation: stationName.trim() } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-sky-100/50 to-transparent" />
        <div className="container relative mx-auto px-4 py-16 sm:py-24 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 px-4 py-1.5 text-sm sm:text-base text-white font-medium">
              <span className="text-xl">✨</span>
              <span>青春18切符でもっと自由に</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-sky-600 via-emerald-600 to-orange-500 bg-clip-text text-transparent leading-tight">
              行き先は運命に任せて、
              <br />
              青春18切符でランダム旅行
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
              思いがけない出会いと発見があなたを待っています
            </p>
            <div className="flex flex-wrap gap-4 justify-center items-center text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span className="text-xl">🚃</span>
                <span>全国のJR線が乗り放題</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">✨</span>
                <span>ランダムで新しい発見</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Announcements */}
      {announcements.length > 0 && (
        <section className="container mx-auto px-4 -mt-8 mb-12">
          <div className="mx-auto max-w-5xl">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 shadow-lg">
              <h3 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <span className="text-base">📢</span>
                お知らせ
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
          </div>
        </section>
      )}

      {/* Main Input Section */}
      <section className="container mx-auto px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-2xl">
          <div className="border-2 border-emerald-200 hover:border-emerald-300 rounded-xl transition-all duration-300 shadow-xl bg-white">
            <div className="p-8 sm:p-12 space-y-8">
              <div className="text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg text-4xl">
                  🎲
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">ランダム旅行を始める</h2>
                <p className="text-lg text-gray-600">
                  出発駅を入力して、AIがランダムな目的地を提案します
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">⚠️</span>
                    <p className="text-red-800 flex-1">{error}</p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="駅名を入力（例：東京、新宿、大阪）"
                    value={stationName}
                    onChange={(e) => handleStationNameChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    className="w-full px-6 py-4 border-2 border-gray-200 focus:border-emerald-500 rounded-lg outline-none transition-colors text-lg"
                  />
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {suggestions.map((station, index) => (
                        <div
                          key={station.code}
                          onClick={() => handleSelectSuggestion(station)}
                          className={`px-4 py-3 cursor-pointer transition-colors ${
                            index === selectedIndex
                              ? 'bg-emerald-50 border-l-4 border-emerald-500'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="font-semibold text-gray-900">{station.Name}</div>
                          <div className="text-sm text-gray-600">
                            {station.Prefecture.Name} • {station.Yomi}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500 text-center">
                  💡 JR線の駅名で検索してください
                </p>
                <button
                  onClick={handleStartJourney}
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-5 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-lg"
                >
                  🚃 ランダム旅行を始める
                  <span className="text-2xl">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How to Use Section */}
      <section className="container mx-auto px-4 py-12 sm:py-16 bg-gradient-to-br from-white to-sky-50/30">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
            使い方はとってもシンプル
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-sky-600 text-white text-2xl font-bold shadow-lg">
                1
              </div>
              <h3 className="text-xl font-semibold">出発駅を入力</h3>
              <p className="text-gray-600">
                あなたの最寄り駅や旅の起点となる駅名を入力
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white text-2xl font-bold shadow-lg">
                2
              </div>
              <h3 className="text-xl font-semibold">AIが目的地を選定</h3>
              <p className="text-gray-600">
                青春18切符で行けるランダムな目的地を自動生成
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white text-2xl font-bold shadow-lg">
                3
              </div>
              <h3 className="text-xl font-semibold">旅に出発</h3>
              <p className="text-gray-600">
                提案された旅程を確認して、冒険の始まりです！
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Seishun 18 Kippu */}
      <section className="container mx-auto px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <div className="border-2 border-sky-200 bg-gradient-to-br from-white to-sky-50/50 rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 text-white text-2xl">
                  ℹ️
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">青春18切符とは？</h2>
                  <p className="text-gray-600">
                    JR全線の普通列車・快速列車が乗り放題になるお得な切符です
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sky-700">料金</h4>
                    <p className="text-sm text-gray-600">
                      5回分で12,050円（1回あたり2,410円）
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-emerald-700">利用期間</h4>
                    <p className="text-sm text-gray-600">
                      春・夏・冬の学校休み期間
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-orange-600">乗り放題の仕組み</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    1日（日付が変わるまで）JR全線の普通・快速列車が乗り放題。新幹線や特急は利用不可。
                  </p>
                </div>
                <a
                  href="https://www.jreast.co.jp/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 border-2 border-sky-500 text-sky-700 hover:bg-sky-50 rounded-lg font-semibold transition-colors"
                >
                  JR公式サイトで詳細を見る
                  <span>→</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-5xl">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
              <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
                <button className="hover:text-gray-900 transition-colors">利用規約</button>
                <button className="hover:text-gray-900 transition-colors">プライバシーポリシー</button>
                <button className="hover:text-gray-900 transition-colors">お問い合わせ</button>
              </div>
              <div className="flex gap-4">
                <button className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-semibold">
                  Twitter
                </button>
                <button className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-semibold">
                  LINE
                </button>
              </div>
            </div>
            <div className="mt-6 text-center text-sm text-gray-600">
              © 2025 青春18切符ランダム旅行. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
