#!/usr/bin/env node
/**
 * Scripture Import Script
 *
 * Downloads, verifies, and imports the official World English Bible (engwebp)
 * from eBible.org into the local SQLite database.
 *
 * Uses better-sqlite3 with parameterized queries for safe database operations.
 *
 * Usage: npx tsx scripts/import-scripture.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as https from 'https';
import * as child_process from 'child_process';
import Database from 'better-sqlite3';
import { parseUSFMFile } from '../src/infrastructure/scripture/usfmParser';
import {
  SCHEMA_INIT_SQL,
  FTS5_TABLE_SQL,
  SCHEMA_VERSION,
  CANONICAL_BOOKS,
} from '../src/infrastructure/scripture/schema';

// Official corpus details
const CORPUS_URL = 'https://eBible.org/Scriptures/engwebp_usfm.zip';
const EXPECTED_SHA256 = '2d2dc7b443a4cf398dfe05d1001195887c74a80b388003358ccc8a6bfc1c5c07';
const TEMP_DIR = '/tmp/rooted_bible_import';
const ARCHIVE_PATH = path.join(TEMP_DIR, 'engwebp_usfm.zip');
const DB_PATH = path.join(__dirname, '../assets/bible.db');

console.log('');
console.log('═══════════════════════════════════════════════════════════');
console.log('  Plumb Line - Official Scripture Import');
console.log('  Translation: World English Bible (WEB)');
console.log('  Edition: engwebp (2020 stable text)');
console.log('═══════════════════════════════════════════════════════════');
console.log('');

function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);

    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode}`));
          return;
        }
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      })
      .on('error', reject);
  });
}

function computeSHA256(filePath: string): string {
  const hash = crypto.createHash('sha256');
  hash.update(fs.readFileSync(filePath));
  return hash.digest('hex');
}

function extractZip(zipPath: string, destDir: string): void {
  child_process.execSync(`unzip -q "${zipPath}" -d "${destDir}"`);
}

async function main() {
  try {
    // Setup
    console.log('[1/7] Setting up...');
    if (!fs.existsSync(TEMP_DIR)) {
      fs.mkdirSync(TEMP_DIR, { recursive: true });
    }

    // Download
    console.log('[2/7] Downloading...');
    if (!fs.existsSync(ARCHIVE_PATH)) {
      await downloadFile(CORPUS_URL, ARCHIVE_PATH);
      console.log(
        `      Downloaded: ${(fs.statSync(ARCHIVE_PATH).size / 1024 / 1024).toFixed(2)} MB`
      );
    } else {
      console.log('      (Using cached)');
    }

    // Verify
    console.log('[3/7] Verifying...');
    const actualSHA256 = computeSHA256(ARCHIVE_PATH);
    if (actualSHA256 !== EXPECTED_SHA256) {
      throw new Error('Checksum mismatch!');
    }
    console.log('      ✓ Verified');

    // Extract
    console.log('[4/7] Extracting...');
    const extractDir = path.join(TEMP_DIR, 'extracted');
    if (!fs.existsSync(extractDir)) {
      fs.mkdirSync(extractDir, { recursive: true });
      extractZip(ARCHIVE_PATH, extractDir);
    }
    const files = fs
      .readdirSync(extractDir)
      .filter((f) => f.endsWith('.usfm') && /^\d{2}-/.test(f));
    console.log(`      Found ${files.length} USFM files`);

    // Parse
    console.log('[5/7] Parsing USFM...');
    const books: {
      usfmId: string;
      name: string;
      order: number;
      chapters: { number: number; verses: { number: number; text: string }[] }[];
    }[] = [];

    for (const file of files) {
      const content = fs.readFileSync(path.join(extractDir, file), 'utf-8');
      const parsed = parseUSFMFile(content, file);

      if (parsed && CANONICAL_BOOKS.find((b) => b.usfmId === parsed.id)) {
        const canonical = CANONICAL_BOOKS.find((b) => b.usfmId === parsed.id)!;
        books.push({
          usfmId: parsed.id,
          name: parsed.name,
          order: canonical.order,
          chapters: parsed.chapters,
        });
      }
    }

    books.sort((a, b) => a.order - b.order);
    console.log(`      Parsed ${books.length} books`);

    // Create database
    console.log('[6/7] Creating database...');
    if (fs.existsSync(DB_PATH)) {
      fs.unlinkSync(DB_PATH);
    }

    const assetsDir = path.dirname(DB_PATH);
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
    }

    const db = new Database(DB_PATH);

    // Schema
    db.exec(SCHEMA_INIT_SQL);
    db.prepare(`INSERT INTO schema_version (version) VALUES (?)`).run(SCHEMA_VERSION);

    // Metadata
    const metadata = {
      translation_name: 'World English Bible',
      translation_code: 'WEB',
      edition: 'engwebp',
      edition_description: '2020 stable text edition',
      canon: '66-book Protestant',
      source_url: CORPUS_URL,
      source_sha256: EXPECTED_SHA256,
      source_date: '2026-08-26',
      import_date: new Date().toISOString().split('T')[0],
      books: books.length.toString(),
      verses: '0',
    };

    const insertMeta = db.prepare(
      `INSERT OR REPLACE INTO translation_metadata (key, value) VALUES (?, ?)`
    );
    for (const [key, value] of Object.entries(metadata)) {
      insertMeta.run(key, value);
    }

    // Books
    const insertBook = db.prepare(
      `INSERT INTO books (id, usfm_id, name, canonical_order, testament) VALUES (?, ?, ?, ?, ?)`
    );
    for (const book of books) {
      const canonical = CANONICAL_BOOKS.find((b) => b.usfmId === book.usfmId)!;
      insertBook.run(book.order, book.usfmId, book.name, book.order, canonical.testament);
    }

    // Verses (using prepared statement for safety)
    const insertVerse = db.prepare(
      `INSERT INTO verses (book_id, chapter, verse, text) VALUES (?, ?, ?, ?)`
    );

    let totalVerses = 0;
    for (const book of books) {
      for (const chapter of book.chapters) {
        for (const verse of chapter.verses) {
          insertVerse.run(book.order, chapter.number, verse.number, verse.text);
          totalVerses++;
        }
      }
    }

    // Update verse count
    db.prepare(`UPDATE translation_metadata SET value = ? WHERE key = 'verses'`).run(
      totalVerses.toString()
    );

    // Try FTS5
    try {
      db.exec(FTS5_TABLE_SQL);
      console.log('      ✓ FTS5 enabled');
    } catch {
      console.log('      ⚠ FTS5 not available');
    }

    db.close();

    // Validate
    console.log('[7/7] Validating...');
    const dbCheck = new Database(DB_PATH, { readonly: true });
    const verseCount = dbCheck.prepare('SELECT COUNT(*) as count FROM verses').get() as {
      count: number;
    };
    const bookCount = dbCheck.prepare('SELECT COUNT(*) as count FROM books').get() as {
      count: number;
    };
    const chapterCount = dbCheck
      .prepare("SELECT COUNT(DISTINCT book_id || '-' || chapter) as count FROM verses")
      .get() as { count: number };
    dbCheck.close();

    console.log(`      Books: ${bookCount.count} (expected: 66)`);
    console.log(`      Chapters: ${chapterCount.count} (expected: 1,189)`);
    console.log(`      Verses: ${verseCount.count} (expected: 31,098)`);

    if (bookCount.count !== 66 || chapterCount.count !== 1189 || verseCount.count !== 31098) {
      throw new Error('Validation failed');
    }

    console.log('');
    console.log('✓ Import complete');
    console.log(
      `Database: ${DB_PATH} (${(fs.statSync(DB_PATH).size / 1024 / 1024).toFixed(2)} MB)`
    );
    console.log('');
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

main();
