export interface ResourceMetadata {
    title: string;
    category: 'Regulation' | 'Insights' | 'Tech';
    date: string;
    author?: string;
    imageSrc: string;
    excerpt: string;
    tags?: string[];
    readingTime?: number;
    slug: string;
    externalUrl?: string;
}

export interface ResourceContent {
    metadata: ResourceMetadata;
    content: string;
}
