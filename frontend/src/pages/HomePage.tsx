/**
 * ホームページコンポーネント
 */

import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { suggestStation } from '@/utils/api';
import type { Station } from '@/types/api';

export function HomePage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [stationName, setStationName] = useState('');
  const [suggestions, setSuggestions] = useState<Station[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

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
    setStationName(station.name);
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
        <div className="container relative mx-auto px-4 pb-6 pt-12 sm:py-24 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-4 sm:mb-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 px-4 py-1.5 text-sm sm:text-base text-white font-medium">
              <span className="text-xl">✨</span>
              <span>青春18きっぷをもっと楽しく</span>
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold bg-gradient-to-r from-sky-600 via-emerald-600 to-orange-500 bg-clip-text text-transparent leading-tight">
              行き先は運命に任せて、
              <br />
              青春18きっぷでランダム旅行
            </h1>
          </div>
        </div>
      </section>

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
                  出発駅を入力して、ランダムな目的地を提案します
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
                          key={`${station.name}-${index}`}
                          onClick={() => handleSelectSuggestion(station)}
                          className={`px-4 py-3 cursor-pointer transition-colors ${
                            index === selectedIndex
                              ? 'bg-emerald-50 border-l-4 border-emerald-500'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="font-semibold text-gray-900">{station.name}</div>
                          <div className="text-sm text-gray-600">
                            {station.prefecture} • {station.line}
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
                <button
                  onClick={() => {
                    setStationName('東京');
                    navigate('/random', { state: { departureStation: '東京' } });
                  }}
                  className="w-full border-2 border-emerald-500 text-emerald-700 hover:bg-emerald-50 font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  🗼 東京駅で試してみる
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
              <h3 className="text-xl font-semibold">目的地を自動選定</h3>
              <p className="text-gray-600">
                青春18きっぷで行けるランダムな目的地を自動生成
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
                  ✨
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">青春18きっぷとは？</h2>
                  <p className="text-gray-600">
                    JR 全線の 普通列車・快速列車（普通車自由席） が乗り放題になるお得なきっぷです。
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sky-700">料金</h4>
                    <p className="text-sm text-gray-600">
                      5回分で 12,050円（1回あたり 2,410円）
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-emerald-700">利用期間</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      春・夏・冬の各シーズンに設定された期間のみ使用可<br />
                      （例：春季 3/1〜4/10、夏季 7/20〜9/10、冬季 12/10〜1/10）
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-orange-600">乗り放題の仕組み</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    1回（1日・日付が変わるまで）＝JR全線の普通・快速列車が乗り放題<br />
                    新幹線・特急・急行・グリーン車は利用不可（別途特急券等が必要）
                  </p>
                </div>
                <div className="text-xs text-gray-500 mt-4">
                  ※ 2025年時点の情報です
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
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
              <a href="/terms" className="hover:text-gray-900 transition-colors">利用規約</a>
              <a href="/privacy" className="hover:text-gray-900 transition-colors">プライバシーポリシー</a>
              <a
                href="mailto:tsukuda@a-t-r-k.com?subject=【青春18きっぷランダム旅行】お問い合わせ&body=■お問い合わせ内容%0D%0A（こちらにお問い合わせ内容をご記入ください）%0D%0A%0D%0A----%0D%0A※本メールは青春18きっぷランダム旅行サイトからのお問い合わせです"
                className="hover:text-gray-900 transition-colors"
              >
                お問い合わせ
              </a>
            </div>
            <div className="mt-6 text-center text-sm text-gray-600">
              © 2025 青春18きっぷランダム旅行. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
