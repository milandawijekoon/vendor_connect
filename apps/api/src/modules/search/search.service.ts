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

const RECONNECT_COOLDOWN_MS = 30_000;

@Injectable()
export class SearchService implements OnModuleInit {
  private readonly logger = new Logger(SearchService.name);
  private client: MeiliSearch | null = null;
  private ready = false;
  private lastConnectAttempt = 0;

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    await this.connect();
  }

  /**
   * (Re)establish the Meilisearch connection and ensure index settings.
   * Safe to call repeatedly — throttled so a down Meilisearch doesn't hammer the network
   * on every request. Lets the service self-heal after a startup race or a Meili restart.
   */
  private async connect(): Promise<void> {
    const host = this.config.get<string>('meilisearch.host');
    if (!host) return;

    const now = Date.now();
    if (this.ready || now - this.lastConnectAttempt < RECONNECT_COOLDOWN_MS) return;
    this.lastConnectAttempt = now;

    const apiKey = this.config.get<string>('meilisearch.apiKey');
    this.client ??= new MeiliSearch({ host, apiKey: apiKey ?? undefined });

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
      this.ready = false;
      this.logger.warn('Meilisearch unavailable — falling back to MySQL search');
    }
  }

  get isAvailable() {
    return this.ready && this.client !== null;
  }

  /** True when Meilisearch is reachable but the vendor index holds no documents. */
  async isIndexEmpty(): Promise<boolean> {
    if (!this.isAvailable) return false;
    try {
      const { numberOfDocuments } = await this.client!.index(INDEX).getStats();
      return numberOfDocuments === 0;
    } catch (err) {
      this.logger.error('Failed to read index stats', err);
      return false;
    }
  }

  async indexVendor(doc: VendorDocument): Promise<void> {
    if (!this.isAvailable) await this.connect();
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

  /**
   * Returns matching vendor IDs in relevance order, or `null` when the caller should
   * fall back to a SQL search — i.e. Meilisearch is unreachable OR its index is empty
   * (e.g. never reindexed after a deploy/reseed). An empty array means "connected,
   * index populated, genuinely no matches".
   */
  async searchIds(q: string): Promise<string[] | null> {
    if (!this.isAvailable) await this.connect();
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
      const ids = result.hits.map((h) => h['id'] as string);

      // No hits could mean "genuinely nothing matches" or "the index was never
      // populated" (e.g. reseeded/redeployed without a reindex). Only in the first
      // case should we short-circuit; otherwise signal a SQL fallback with null.
      if (ids.length === 0 && (await this.isIndexEmpty())) {
        this.logger.warn('Vendor index is empty — falling back to MySQL search (run `pnpm reindex`)');
        return null;
      }
      return ids;
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
