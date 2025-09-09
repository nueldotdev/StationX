import fs from 'fs';
import path from 'path';

type EnvStore = Record<string, string>;

/**
 * Env is a simple environment variable loader and accessor.
 * 
 * It loads key-value pairs from a `.env`-style file into an internal store,
 * allowing you to retrieve and check for environment variables in your application.
 * 
 * Lines starting with `#` or `//` are treated as comments and ignored.
 * 
 * Example `.env` file:
 * ```
 * # This is a comment
 * API_KEY=abcdef12345
 * PORT=8080
 * // Another comment
 * DEBUG=true
 * ```
 * 
 * Example usage:
 * ```typescript
 * import { sxEnv } from './env';
 * 
 * sxEnv.load(); // Loads from .env in the current working directory
 * sxEnv.load('.env.production'); // Loads from .env.production
 * sxEnv.loadEnvByMode('production'); // Loads from .env.production
 * 
 * const apiKey = sxEnv.get('API_KEY'); // 'abcdef12345'
 * const hasPort = sxEnv.has('PORT');   // true
 * const missing = sxEnv.get('NOT_SET'); // undefined
 * ```
 */
class Env {
    private store: EnvStore = {};

    /**
     * Loads environment variables from a file into the internal store.
     * @param file The filename to load (default: '.env')
     * @throws If the file does not exist.
     */
    load(file: string = '.env') {
        const envPath = path.join(process.cwd(), file);
        if (!fs.existsSync(envPath)) {
            throw new Error(`Env file ${file} not found`);
        }
        const content = fs.readFileSync(envPath, 'utf8');
        const lines = content.split('\n');
        lines.forEach(line => {
            const trimmedLine = line.trim();
            if (!trimmedLine || trimmedLine.startsWith('#') || trimmedLine.startsWith('//')) return;
            const [key, ...rest] = trimmedLine.split('=');
            if (!key) return;
            this.store[key] = rest.join('=').trim();
        });
    }

    /**
     * Loads environment variables from a file based on the given mode.
     * For example, mode 'production' will load from '.env.production'.
     * If the file does not exist, it will throw an error.
     * @param mode The environment mode (e.g., 'production', 'dev', 'test')
     */
    loadEnvByMode(mode: string) {
        const file = `.env.${mode}`;
        this.load(file);
    }

    /**
     * Loads environment variables based on the NODE_ENV environment variable.
     * If NODE_ENV is not set, falls back to '.env'.
     * If the corresponding file does not exist, throws an error.
     */
    loadByNodeEnv() {
        const nodeEnv = process.env.NODE_ENV;
        if (nodeEnv) {
            this.loadEnvByMode(nodeEnv);
        } else {
            this.load('.env');
        }
    }

    /**
     * Retrieves the value for a given environment variable key.
     * @param key The environment variable name.
     * @returns The value as a string, or undefined if not set.
     */
    get(key: string) {
        return this.store[key];
    }

    /**
     * Checks if a given environment variable key exists in the store.
     * @param key The environment variable name.
     * @returns True if the key exists, false otherwise.
     */
    has(key: string) {
        return this.store[key] !== undefined;
    }
}

/**
 * Singleton instance of Env for use throughout the application.
 */
export const sxEnv = new Env();