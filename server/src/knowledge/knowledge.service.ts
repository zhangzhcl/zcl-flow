import { Injectable, Logger, NotFoundException, PayloadTooLargeException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash } from 'crypto';
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'fs';
import { join, isAbsolute, dirname, extname } from 'path';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { KnowledgeBaseEntity } from './knowledge-base.entity';
import { KnowledgeChunkEntity } from './knowledge-chunk.entity';
import { KnowledgeAssetEntity } from './knowledge-asset.entity';
import { ModelConfigEntity } from '../models/model-config.entity';
import { AddDocumentDto, CreateKnowledgeBaseDto } from './knowledge.dto';

export interface RetrievedChunk {
  id: string;
  content: string;
  score: number;
  sourceTitle: string;
  metadata: Record<string, unknown>;
}

export interface DocumentImage {
  path: string;
  data: string;
  mimeType: string;
}

/** Image refs in chunk content are rewritten to this canonical URL form. */
export const ASSET_URL_PREFIX = '/api/knowledge/assets/';
const ALLOWED_IMAGE_MIME = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_IMAGES_PER_DOC = 40;

@Injectable()
export class KnowledgeService {
  private readonly logger = new Logger(KnowledgeService.name);

  constructor(
    @InjectRepository(KnowledgeBaseEntity)
    private readonly kbRepo: Repository<KnowledgeBaseEntity>,
    @InjectRepository(KnowledgeChunkEntity)
    private readonly chunkRepo: Repository<KnowledgeChunkEntity>,
    @InjectRepository(KnowledgeAssetEntity)
    private readonly assetRepo: Repository<KnowledgeAssetEntity>,
    @InjectRepository(ModelConfigEntity)
    private readonly modelRepo: Repository<ModelConfigEntity>,
    private readonly config: ConfigService,
  ) {}

  /** Directory holding asset bytes; created lazily like the sqlite data dir. */
  private uploadsDir(): string {
    const raw = this.config.get<string>('UPLOAD_DIR', 'data/uploads');
    const dir = isAbsolute(raw) ? raw : join(process.cwd(), raw);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    return dir;
  }

  // ------------------------------------------------------------------ //
  // Knowledge-base CRUD
  // ------------------------------------------------------------------ //

  async list() {
    const bases = await this.kbRepo.find({ order: { createdAt: 'ASC' } });
    const counts = await Promise.all(
      bases.map((b) => this.chunkRepo.count({ where: { knowledgeBaseId: b.id } })),
    );
    return bases.map((b, i) => ({ ...b, chunkCount: counts[i] }));
  }

  async findOne(id: string) {
    const kb = await this.kbRepo.findOneBy({ id });
    if (!kb) throw new NotFoundException(`Knowledge base ${id} not found`);
    const chunkCount = await this.chunkRepo.count({ where: { knowledgeBaseId: id } });
    return { ...kb, chunkCount };
  }

  async create(dto: CreateKnowledgeBaseDto) {
    const kb = this.kbRepo.create({
      name: dto.name,
      description: dto.description ?? '',
      embeddingModelConfigId: dto.embeddingModelConfigId ?? null,
      chunkSeparator: dto.chunkSeparator ?? '\\n',
      chunkSize: dto.chunkSize ?? 1024,
      chunkOverlap: dto.chunkOverlap ?? 50,
      preprocessWhitespace: dto.preprocessWhitespace ?? true,
      preprocessUrls: dto.preprocessUrls ?? false,
      searchMode: dto.searchMode ?? 'hybrid',
      topK: dto.topK ?? 5,
      scoreThreshold: dto.scoreThreshold ?? 0.0,
    });
    return this.kbRepo.save(kb);
  }

  async remove(id: string) {
    const kb = await this.kbRepo.findOneBy({ id });
    if (!kb) throw new NotFoundException(`Knowledge base ${id} not found`);
    const assets = await this.assetRepo.find({ where: { knowledgeBaseId: id } });
    for (const asset of assets) this.deleteAssetFile(asset);
    await this.assetRepo.delete({ knowledgeBaseId: id });
    await this.chunkRepo.delete({ knowledgeBaseId: id });
    await this.kbRepo.remove(kb);
  }

  // ------------------------------------------------------------------ //
  // Document ingestion
  // ------------------------------------------------------------------ //

  async addDocument(knowledgeBaseId: string, dto: AddDocumentDto) {
    const kb = await this.kbRepo.findOneBy({ id: knowledgeBaseId });
    if (!kb) throw new NotFoundException(`Knowledge base ${knowledgeBaseId} not found`);

    const { content: rewritten, images: savedImages } = await this.resolveDocumentImages(
      knowledgeBaseId,
      dto.content,
      dto.images ?? [],
    );
    const processed = this.preprocess(
      rewritten,
      kb.preprocessWhitespace && !dto.images?.length,
      kb.preprocessUrls,
    );
    const rawChunks = this.chunkText(processed, kb.chunkSeparator, kb.chunkSize, kb.chunkOverlap);
    const modelConfig = kb.embeddingModelConfigId
      ? await this.modelRepo.findOneBy({ id: kb.embeddingModelConfigId })
      : null;

    const chunks: KnowledgeChunkEntity[] = [];
    for (const text of rawChunks) {
      const embedding = modelConfig ? await this.embed(text, modelConfig) : null;
      const chunk = this.chunkRepo.create({
        knowledgeBaseId,
        content: text,
        embedding: embedding ? JSON.stringify(embedding) : null,
        sourceTitle: dto.sourceTitle ?? '',
        metadata: dto.metadata ?? '{}',
      });
      chunks.push(chunk);
    }
    await this.chunkRepo.save(chunks);
    return { added: chunks.length, images: savedImages };
  }

  /**
   * Stores uploaded images and rewrites every markdown/`<img>` reference in
   * the document content to the canonical asset URL. Reference paths are
   * matched after URL-decoding and whitespace stripping, since editors emit
   * percent-encoded or spaced forms.
   */
  private async resolveDocumentImages(
    knowledgeBaseId: string,
    content: string,
    images: DocumentImage[],
  ): Promise<{ content: string; images: KnowledgeAssetEntity[] }> {
    if (!images.length) return { content, images: [] };
    if (images.length > MAX_IMAGES_PER_DOC) {
      throw new PayloadTooLargeException(
        `Too many images for one document: ${images.length} > ${MAX_IMAGES_PER_DOC}`,
      );
    }

    const saved = new Map<string, KnowledgeAssetEntity>();
    for (const image of images) {
      if (!ALLOWED_IMAGE_MIME.has(image.mimeType)) continue;
      const bytes = Buffer.from(image.data, 'base64');
      if (!bytes.length) continue;
      if (bytes.length > MAX_IMAGE_BYTES) {
        throw new PayloadTooLargeException(
          `Image too large: ${image.path} (${(bytes.length / 1024 / 1024).toFixed(1)}MB > 10MB)`,
        );
      }
      saved.set(this.normalizeRef(image.path), await this.saveAsset(knowledgeBaseId, bytes, image.mimeType, image.path));
    }

    if (!saved.size) return { content, images: [] };
    const rewritten = content.replace(
      /(!\[[^\]]*\]\(|<img[^>]+src=["'])([^)"']+)([)"'])/g,
      (whole, head: string, ref: string, tail: string) => {
        const asset = saved.get(this.normalizeRef(ref));
        return asset ? `${head}${ASSET_URL_PREFIX}${asset.id}/file${tail}` : whole;
      },
    );
    return { content: rewritten, images: [...new Set(saved.values())] };
  }

  /** Decodes percent-encoding and trims so different spellings map to one key. */
  private normalizeRef(ref: string): string {
    try {
      return decodeURIComponent(ref.trim());
    } catch {
      return ref.trim();
    }
  }

  /** sha1-deduplicated save: bytes on disk, metadata row in sqlite. */
  async saveAsset(
    knowledgeBaseId: string,
    bytes: Buffer,
    mimeType: string,
    fileName = '',
  ): Promise<KnowledgeAssetEntity> {
    if (!ALLOWED_IMAGE_MIME.has(mimeType)) {
      throw new Error(`Unsupported image type: ${mimeType}`);
    }
    const sha1 = createHash('sha1').update(bytes).digest('hex');
    const existing = await this.assetRepo.findOneBy({ knowledgeBaseId, sha1 });
    if (existing) return existing;

    const asset = await this.assetRepo.save(
      this.assetRepo.create({
        knowledgeBaseId,
        sha1,
        fileName,
        mimeType,
        size: bytes.length,
      }),
    );
    const ext = extname(fileName || '') || this.extForMime(mimeType);
    writeFileSync(join(this.uploadsDir(), asset.id + ext), bytes);
    return asset;
  }

  async getAssetFile(assetId: string): Promise<{ bytes: Buffer; mimeType: string } | null> {
    const asset = await this.assetRepo.findOneBy({ id: assetId });
    if (!asset) return null;
    const dir = this.uploadsDir();
    const candidates = [asset.id + extname(asset.fileName || ''), asset.id].filter((name) =>
      name.startsWith(asset.id),
    );
    for (const name of candidates) {
      const file = join(dir, name);
      if (existsSync(file)) return { bytes: readFileSync(file), mimeType: asset.mimeType };
    }
    return null;
  }

  /** Reads an asset as a data URL for vision LLM calls (provider pulls no URL). */
  async readAssetDataUrl(assetId: string): Promise<string | null> {
    const file = await this.getAssetFile(assetId);
    if (!file) return null;
    return `data:${file.mimeType};base64,${file.bytes.toString('base64')}`;
  }

  private deleteAssetFile(asset: KnowledgeAssetEntity): void {
    const ext = extname(asset.fileName || '');
    const file = join(this.uploadsDir(), asset.id + ext);
    if (existsSync(file)) {
      try {
        unlinkSync(file);
      } catch (err: any) {
        this.logger.warn(`Failed to delete asset file ${asset.id}: ${err?.message}`);
      }
    }
  }

  private extForMime(mimeType: string): string {
    switch (mimeType) {
      case 'image/png':
        return '.png';
      case 'image/jpeg':
        return '.jpg';
      case 'image/webp':
        return '.webp';
      case 'image/gif':
        return '.gif';
      default:
        return '';
    }
  }

  async listChunks(knowledgeBaseId: string) {
    return this.chunkRepo.find({
      where: { knowledgeBaseId },
      order: { createdAt: 'ASC' },
      select: ['id', 'content', 'sourceTitle', 'metadata', 'createdAt'],
    });
  }

  async clearChunks(knowledgeBaseId: string) {
    await this.chunkRepo.delete({ knowledgeBaseId });
  }

  async deleteChunk(chunkId: string) {
    await this.chunkRepo.delete({ id: chunkId });
  }

  // ------------------------------------------------------------------ //
  // Retrieval
  // ------------------------------------------------------------------ //

  async retrieve(
    knowledgeBaseId: string,
    query: string,
    topK = 5,
    scoreThreshold = 0.0,
  ): Promise<RetrievedChunk[]> {
    const kb = await this.kbRepo.findOneBy({ id: knowledgeBaseId });
    if (!kb) return [];

    const modelConfig = kb.embeddingModelConfigId
      ? await this.modelRepo.findOneBy({ id: kb.embeddingModelConfigId })
      : null;

    if (!modelConfig) {
      // No embedding model — fall back to simple keyword matching
      return this.keywordSearch(knowledgeBaseId, query, topK);
    }

    const queryVec = await this.embed(query, modelConfig);
    if (!queryVec.length) return this.keywordSearch(knowledgeBaseId, query, topK);

    const allChunks = await this.chunkRepo.find({ where: { knowledgeBaseId } });
    const scored: RetrievedChunk[] = [];
    for (const chunk of allChunks) {
      if (!chunk.embedding) continue;
      try {
        const vec: number[] = JSON.parse(chunk.embedding);
        const score = this.cosineSimilarity(queryVec, vec);
        if (score >= scoreThreshold) {
          scored.push({
            id: chunk.id,
            content: chunk.content,
            score,
            sourceTitle: chunk.sourceTitle,
            metadata: JSON.parse(chunk.metadata || '{}'),
          });
        }
      } catch {
        // skip malformed embedding
      }
    }
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
  }

  // ------------------------------------------------------------------ //
  // Internals
  // ------------------------------------------------------------------ //

  private async embed(text: string, config: ModelConfigEntity): Promise<number[]> {
    const baseUrl = config.baseUrl.replace(/\/$/, '');
    try {
      const response = await fetch(`${baseUrl}/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({ model: config.model, input: text }),
      });
      if (!response.ok) {
        const body = await response.text();
        this.logger.warn(`Embedding request failed ${response.status}: ${body.slice(0, 200)}`);
        return [];
      }
      const data: any = await response.json();
      return data?.data?.[0]?.embedding ?? [];
    } catch (err: any) {
      this.logger.warn(`Embedding error: ${err?.message}`);
      return [];
    }
  }

  private preprocess(text: string, trimWhitespace: boolean, removeUrls: boolean): string {
    let t = text;
    if (trimWhitespace) {
      t = t.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
    }
    if (removeUrls) {
      t = t
        .replace(/https?:\/\/\S+/g, '')
        .replace(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g, '')
        .replace(/[ \t]+/g, ' ')
        .trim();
    }
    return t;
  }

  private chunkText(text: string, separator: string, chunkSize: number, overlap: number): string[] {
    // Resolve escape sequences in the separator
    const sep = separator.replace(/\\n/g, '\n').replace(/\\t/g, '\t');

    // Split by separator first, then merge small segments up to chunkSize, then split oversized ones
    const segments = sep ? text.split(sep).map((s) => s.trim()).filter(Boolean) : [text];

    const chunks: string[] = [];
    let current = '';

    for (const seg of segments) {
      const joined = current ? current + '\n' + seg : seg;
      if (joined.length <= chunkSize) {
        current = joined;
      } else {
        if (current) chunks.push(current);
        if (seg.length <= chunkSize) {
          current = seg;
        } else {
          // Oversized segment — split by size with overlap
          let i = 0;
          while (i < seg.length) {
            chunks.push(seg.slice(i, i + chunkSize));
            if (i + chunkSize >= seg.length) break;
            i += chunkSize - overlap;
          }
          current = '';
        }
      }
    }
    if (current) chunks.push(current);
    return chunks.filter((c) => c.trim());
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length || !a.length) return 0;
    let dot = 0, magA = 0, magB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      magA += a[i] * a[i];
      magB += b[i] * b[i];
    }
    return magA && magB ? dot / (Math.sqrt(magA) * Math.sqrt(magB)) : 0;
  }

  private async keywordSearch(
    knowledgeBaseId: string,
    query: string,
    topK: number,
  ): Promise<RetrievedChunk[]> {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    const allChunks = await this.chunkRepo.find({ where: { knowledgeBaseId } });
    const scored = allChunks
      .map((chunk) => {
        const lower = chunk.content.toLowerCase();
        const hits = terms.filter((t) => lower.includes(t)).length;
        return {
          id: chunk.id,
          content: chunk.content,
          score: hits / terms.length,
          sourceTitle: chunk.sourceTitle,
          metadata: JSON.parse(chunk.metadata || '{}'),
        };
      })
      .filter((c) => c.score > 0);
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
  }
}
