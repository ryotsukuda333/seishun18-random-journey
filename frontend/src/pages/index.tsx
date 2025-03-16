import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function Home() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleRandomJourney = async () => {
        setLoading(true);
        try {
            // 実際のAPIが実装されたら、ここでAPIを呼び出す
            // const response = await fetch('/api/random-destination');
            // const data = await response.json();

            // 仮のデータ
            setTimeout(() => {
                router.push('/destination/tokyo');
                setLoading(false);
            }, 1000);
        } catch (error) {
            console.error('Error fetching random destination:', error);
            setLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>Seishun18 Random Journey</title>
                <meta name="description" content="ランダムな旅行先を提案するアプリ" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-blue-50 to-blue-100">
                <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
                    <h1 className="text-3xl font-bold text-blue-600 mb-6">Seishun18 Random Journey</h1>
                    <p className="text-gray-600 mb-8">
                        ボタンを押すだけで、ランダムな旅行先が提案されます。
                        青春18きっぷで行ける範囲の旅行先を探索しましょう！
                    </p>
                    <button
                        onClick={handleRandomJourney}
                        disabled={loading}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? '検索中...' : 'ランダム旅行先を探す'}
                    </button>
                </div>
            </main>
        </>
    );
} 