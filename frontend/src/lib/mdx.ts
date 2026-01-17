import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { ResourceMetadata } from '@/types/resource';

const CONTENT_PATH = path.join(process.cwd(), 'content/resources');

export async function getResourceBySlug(slug: string): Promise<{ metadata: ResourceMetadata; content: string } | null> {
    try {
        const filePath = path.join(CONTENT_PATH, `${slug}.mdx`);
        if (!fs.existsSync(filePath)) return null;

        const fileContent = fs.readFileSync(filePath, 'utf8');
        const { data, content } = matter(fileContent);

        return {
            metadata: {
                ...data,
                slug,
            } as ResourceMetadata,
            content,
        };
    } catch (error) {
        console.error(`Error loading resource ${slug}:`, error);
        return null;
    }
}

export async function getAllResources(): Promise<ResourceMetadata[]> {
    if (!fs.existsSync(CONTENT_PATH)) {
        return [];
    }

    const files = fs.readdirSync(CONTENT_PATH).filter((file) => file.endsWith('.mdx'));

    const resources = files
        .map((file) => {
            const slug = file.replace(/\.mdx$/, '');
            const filePath = path.join(CONTENT_PATH, file);
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const { data } = matter(fileContent);

            return {
                ...data,
                slug,
            } as ResourceMetadata;
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return resources;
}
