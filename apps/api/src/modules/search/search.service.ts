import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MeiliSearch } from 'meilisearch';

const INDEX = 'vendors';

export interface VendorDocument {
  id: string;
  businessName: string;
  description: string;
  city: string;
  categoryNames: string[];
  priceMin: number | null;
  priceMax: number | null;
  avgRating: number;
  status: string;
  slug: string;
}

@Injectable()
export class SearchService implements OnModuleInit {
  private readonly logger = new Logger(SearchService.name);
  private client: MeiliSearch | null = null;
  private ready = false;

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    const host = this.config.get<string>('meilisearch.host');
    const apiKey = this.config.get<string>('meilisearch.apiKey');
    if (!host) return;

    this.client = new MeiliSearch({ host, apiKey: apiKey ?? undefined });

    try {
      await this.client.health();
      await this.client.index(INDEX).updateSettings({
        // Structured fields (name, category, city) ranked above free-form description text —
        // otherwise an incidental word in marketing copy (e.g. a photographer's description
        // mentioning "venues") outranks or pollutes results for unrelated vendors.
        searchableAttributes: ['businessName', 'categoryNames', 'city', 'description'],
        rankingRules: ['words', 'typo', 'attribute', 'proximity', 'exactness', 'sort'],
        filterableAttributes: ['status'],
        sortableAttributes: ['avgRating', 'priceMin'],
      });
      this.ready = true;
      this.logger.log('Connected and index configured');
    } catch {
      this.logger.warn('Meilisearch unavailable — falling back to MySQL search');
    }
  }

  get isAvailable() {
    return this.ready && this.client !== null;
  }

  async indexVendor(doc: VendorDocument): Promise<void> {
    if (!this.isAvailable) return;
    try {
      await this.client!.index(INDEX).addDocuments([doc]);
    } catch (err) {
      this.logger.error('Failed to index vendor', err);
    }
  }

  async removeVendor(id: string): Promise<void> {
    if (!this.isAvailable) return;
    try {
      await this.client!.index(INDEX).deleteDocument(id);
    } catch (err) {
      this.logger.error('Failed to remove vendor from index', err);
    }
  }

  /** Returns matching IDs in relevance order, or null when Meilisearch is unavailable. */
  async searchIds(q: string): Promise<string[] | null> {
    if (!this.isAvailable) return null;
    try {
      const result = await this.client!.index(INDEX).search(q, {
        limit: 1000,
        filter: `status = 'APPROVED'`,
        attributesToRetrieve: ['id'],
        // Drops incidental single-word matches buried in description text (score ~0.5-0.6)
        // while keeping genuine name/category/city matches (score ~0.85+).
        rankingScoreThreshold: 0.65,
      });
      return result.hits.map((h) => h['id'] as string);
    } catch (err) {
      this.logger.error('Search failed', err);
      return null;
    }
  }

  async reindexAll(docs: VendorDocument[]): Promise<void> {
    if (!this.isAvailable) {
      this.logger.warn('Meilisearch not ready — skipping reindex (check MEILISEARCH_HOST and MEILISEARCH_API_KEY)');
      return;
    }
    try {
      await this.client!.index(INDEX).deleteAllDocuments();
      if (docs.length > 0) {
        await this.client!.index(INDEX).addDocuments(docs);
      }
      this.logger.log(`Reindexed ${docs.length} vendors`);
    } catch (err) {
      this.logger.error('Reindex failed', err);
    }
  }
}
