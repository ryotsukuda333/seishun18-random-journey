// 旅行先の型定義
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

// すべての旅行先を取得する
export async function getDestinations(db: D1Database): Promise<Destination[]> {
    try {
        const { results } = await db.prepare('SELECT * FROM destinations').all();
        return results as Destination[];
    } catch (error) {
        // 開発中はモックデータを返す
        console.warn('Using mock data for destinations');
        return getMockDestinations();
    }
}

// IDで特定の旅行先を取得する
export async function getDestinationById(db: D1Database, id: string): Promise<Destination | null> {
    try {
        const result = await db.prepare('SELECT * FROM destinations WHERE id = ?').bind(id).first();
        return result as Destination || null;
    } catch (error) {
        // 開発中はモックデータから検索
        console.warn(`Using mock data for destination with id: ${id}`);
        const mockDestinations = getMockDestinations();
        return mockDestinations.find(dest => dest.id === id) || null;
    }
}

// ランダムな旅行先を取得する
export async function getRandomDestination(db: D1Database): Promise<Destination | null> {
    try {
        const { results } = await db.prepare('SELECT * FROM destinations ORDER BY RANDOM() LIMIT 1').all();
        return (results.length > 0) ? results[0] as Destination : null;
    } catch (error) {
        // 開発中はモックデータからランダムに選択
        console.warn('Using mock data for random destination');
        const mockDestinations = getMockDestinations();
        if (mockDestinations.length === 0) return null;

        const randomIndex = Math.floor(Math.random() * mockDestinations.length);
        return mockDestinations[randomIndex];
    }
}

// モックデータ（開発用）
function getMockDestinations(): Destination[] {
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
        {
            id: 'sendai',
            name: '仙台',
            prefecture: '宮城県',
            description: '東北地方最大の都市。「杜の都」と呼ばれる緑豊かな街で、伊達政宗ゆかりの地。',
            imageUrl: 'https://images.unsplash.com/photo-1578637387939-43c525550085?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2VuZGFpfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
            attractions: ['仙台城跡', '瑞鳳殿', '秋保大滝'],
            accessInfo: 'JR仙台駅から市バスや地下鉄で各観光地へアクセス',
            travelTime: 90,
        }
    ];
} 