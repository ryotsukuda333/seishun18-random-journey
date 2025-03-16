import useSWR from 'swr';

export interface Destination {
    id: string;
    name: string;
    prefecture: string;
    description: string;
    imageUrl: string;
    attractions: string[];
    accessInfo: string;
    travelTime: number; // 東京駅からの所要時間（分）
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useDestinations() {
    const { data, error, isLoading } = useSWR<Destination[]>('/api/destinations', fetcher);

    return {
        destinations: data || [],
        isLoading,
        isError: error,
    };
}

export function useDestination(id: string | undefined) {
    const { data, error, isLoading } = useSWR<Destination>(
        id ? `/api/destinations/${id}` : null,
        fetcher
    );

    return {
        destination: data,
        isLoading,
        isError: error,
    };
}

// モックデータを返す関数（APIが実装されるまでの仮実装）
export function getMockDestinations(): Destination[] {
    return [
        {
            id: 'tokyo',
            name: '東京',
            prefecture: '東京都',
            description: '日本の首都であり、最も人口の多い都市。現代的な高層ビルと伝統的な寺社が共存する。',
            imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8dG9reW98ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60',
            attractions: ['東京スカイツリー', '浅草寺', '渋谷スクランブル交差点'],
            accessInfo: 'JR東京駅が主要ターミナル',
            travelTime: 0,
        },
        {
            id: 'kyoto',
            name: '京都',
            prefecture: '京都府',
            description: '1000年以上の歴史を持つ古都。多くの寺院、神社、庭園がある日本文化の中心地。',
            imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8a3lvdG98ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60',
            attractions: ['金閣寺', '伏見稲荷大社', '清水寺'],
            accessInfo: 'JR京都駅から市バスやタクシーで各観光地へアクセス',
            travelTime: 160,
        },
    ];
} 