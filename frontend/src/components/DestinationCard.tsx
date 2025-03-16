import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface DestinationCardProps {
    id: string;
    name: string;
    prefecture: string;
    description: string;
    imageUrl: string;
}

const DestinationCard: React.FC<DestinationCardProps> = ({
    id,
    name,
    prefecture,
    description,
    imageUrl,
}) => {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-xl hover:scale-105">
            <div className="relative h-48 w-full">
                <Image
                    src={imageUrl}
                    alt={`${name}の写真`}
                    fill
                    style={{ objectFit: 'cover' }}
                />
            </div>
            <div className="p-4">
                <div className="text-xs font-semibold text-blue-500 mb-1">{prefecture}</div>
                <h3 className="text-xl font-bold mb-2">{name}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{description}</p>
                <Link href={`/destination/${id}`} className="text-blue-600 hover:text-blue-800 font-medium text-sm inline-flex items-center">
                    詳細を見る
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </Link>
            </div>
        </div>
    );
};

export default DestinationCard; 