import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface GameSearchResult {
  id: number;
  name: string;
  released: string | null;
  genres: string[];
  platforms: string[];
  image: string | null;
  rating: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class GameSearchService {
  private readonly apiUrl = environment.gameApiBaseUrl;
  private readonly apiKey = environment.gameApiKey;

  private readonly fallbackGames: GameSearchResult[] = [
    {
      id: 1,
      name: 'The Legend of Zelda: Breath of the Wild',
      released: '2017-03-03',
      genres: ['Action', 'Adventure'],
      platforms: ['Nintendo Switch', 'Wii U'],
      image: null,
      rating: 9.5
    },
    {
      id: 2,
      name: 'God of War',
      released: '2018-04-20',
      genres: ['Action', 'Adventure'],
      platforms: ['PlayStation'],
      image: null,
      rating: 9.4
    },
    {
      id: 3,
      name: 'Minecraft',
      released: '2011-11-18',
      genres: ['Sandbox', 'Survival'],
      platforms: ['PC', 'Xbox', 'PlayStation', 'Nintendo Switch', 'Móvil'],
      image: null,
      rating: 9.0
    },
    {
      id: 4,
      name: 'Cyberpunk 2077',
      released: '2020-12-10',
      genres: ['RPG', 'Action'],
      platforms: ['PC', 'Xbox', 'PlayStation'],
      image: null,
      rating: 7.5
    },
    {
      id: 5,
      name: 'Hollow Knight',
      released: '2017-02-24',
      genres: ['Metroidvania', 'Platformer'],
      platforms: ['PC', 'Nintendo Switch', 'Xbox', 'PlayStation'],
      image: null,
      rating: 9.0
    },
    {
      id: 6,
      name: 'Elden Ring',
      released: '2022-02-25',
      genres: ['RPG', 'Action'],
      platforms: ['PC', 'PlayStation', 'Xbox'],
      image: null,
      rating: 9.6
    },
    {
      id: 7,
      name: 'The Witcher 3: Wild Hunt',
      released: '2015-05-19',
      genres: ['RPG', 'Action'],
      platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch'],
      image: null,
      rating: 9.4
    },
    {
      id: 8,
      name: 'Mario Kart 8 Deluxe',
      released: '2017-04-28',
      genres: ['Racing', 'Arcade'],
      platforms: ['Nintendo Switch'],
      image: null,
      rating: 9.1
    },
    {
      id: 9,
      name: 'Red Dead Redemption 2',
      released: '2018-10-26',
      genres: ['Action', 'Adventure'],
      platforms: ['PC', 'PlayStation', 'Xbox'],
      image: null,
      rating: 9.7
    },
    {
      id: 10,
      name: 'Grand Theft Auto V',
      released: '2013-09-17',
      genres: ['Action', 'Adventure'],
      platforms: ['PC', 'PlayStation', 'Xbox'],
      image: null,
      rating: 9.4
    },
    {
      id: 11,
      name: 'Portal 2',
      released: '2011-04-19',
      genres: ['Puzzle', 'Adventure'],
      platforms: ['PC', 'PlayStation', 'Xbox'],
      image: null,
      rating: 9.2
    },
    {
      id: 12,
      name: 'The Elder Scrolls V: Skyrim',
      released: '2011-11-11',
      genres: ['RPG', 'Action'],
      platforms: ['PC', 'PlayStation', 'Xbox'],
      image: null,
      rating: 9.3
    },
    {
      id: 13,
      name: 'Stardew Valley',
      released: '2016-02-26',
      genres: ['Simulation', 'RPG'],
      platforms: ['PC', 'Nintendo Switch', 'PlayStation', 'Xbox'],
      image: null,
      rating: 9.2
    },
    {
      id: 14,
      name: 'Undertale',
      released: '2015-09-15',
      genres: ['RPG', 'Indie'],
      platforms: ['PC', 'Nintendo Switch', 'PlayStation', 'Xbox'],
      image: null,
      rating: 9.1
    },
    {
      id: 15,
      name: 'Celeste',
      released: '2018-01-25',
      genres: ['Platformer', 'Indie'],
      platforms: ['PC', 'Nintendo Switch', 'PlayStation', 'Xbox'],
      image: null,
      rating: 9.0
    },
    {
      id: 16,
      name: 'Resident Evil 4',
      released: '2023-03-24',
      genres: ['Action', 'Horror'],
      platforms: ['PC', 'PlayStation', 'Xbox'],
      image: null,
      rating: 9.2
    },
    {
      id: 17,
      name: 'Halo Infinite',
      released: '2021-12-08',
      genres: ['Shooter', 'Action'],
      platforms: ['PC', 'Xbox'],
      image: null,
      rating: 8.8
    },
    {
      id: 18,
      name: 'Persona 5 Royal',
      released: '2022-10-21',
      genres: ['RPG', 'Social'],
      platforms: ['PlayStation', 'PC', 'Xbox'],
      image: null,
      rating: 9.4
    }
  ];

  private genreCache: Record<string, string> = {};
  private genresLoaded = false;

  constructor(private http: HttpClient) {}

  async searchGames(query: string): Promise<GameSearchResult[]> {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      return [];
    }

    const fallbackResults = this.searchFallback(trimmedQuery);

    if (!this.apiUrl || !this.apiKey) {
      console.warn('TheGamesDB no está configurado por completo; usando dataset local de fallback.');
      return fallbackResults;
    }

    // Try to fetch multiple pages from the API (up to a reasonable limit)
    const url = `${this.apiUrl}/Games/ByGameName`;
    const maxPages = 5;
    let allApiItems: any[] = [];

    try {
      let platformData: Record<string, any> = {};
      for (let page = 1; page <= maxPages; page++) {
        const params = new HttpParams()
          .set('apikey', this.apiKey)
          .set('name', trimmedQuery)
          .set('include', 'platform')
          .set('page', String(page));

        const response = await firstValueFrom(this.http.get<any>(url, { params }));
        const games = this.extractGames(response);
        if (!games || games.length === 0) {
          break; // no more results
        }

        // Merge platform include data when present so we can resolve platform names later
        const pagePlatformData = this.extractPlatformData(response) || {};
        platformData = { ...platformData, ...pagePlatformData };

        allApiItems = allApiItems.concat(games);

        // If the response includes pagination info and we are at the last page, break early
        const totalPages = response?.data?.page_count || response?.page_count || response?.meta?.total_pages;
        if (totalPages && page >= totalPages) break;
      }

      if (!allApiItems.length) {
        return fallbackResults;
      }

      const genreMap = await this.loadGenres();

      const apiResults = allApiItems.map((item: any) => {
        const platformIds = Array.isArray(item.platform) ? item.platform : [item.platform].filter(Boolean);
        const platforms = platformIds
          .map((platformId: any) => platformData[String(platformId)]?.name)
          .filter(Boolean);

        const genres = Array.isArray(item.genres)
          ? item.genres
              .map((genreId: any) => genreMap[String(genreId)])
              .filter(Boolean)
          : [];

        const rating = typeof item.rating === 'number'
          ? item.rating
          : !isNaN(Number(item.rating))
          ? Number(item.rating)
          : null;

        return {
          id: item.id,
          name: item.game_title || item.name || '',
          released: item.release_date || item.original_release_date || null,
          genres,
          platforms,
          image: null,
          rating
        };
      });

      // Merge API results with fallback but keep all distinct API entries
      return this.mergeResults(apiResults, fallbackResults);
    } catch (err) {
      console.warn('TheGamesDB API falló, usando dataset local de fallback.', err);
      return fallbackResults;
    }
  }

  private extractGames(response: any): any[] {
    const data = response?.data;
    if (Array.isArray(data)) {
      return data;
    }
    if (Array.isArray(data?.games)) {
      return data.games;
    }
    if (Array.isArray(response?.games)) {
      return response.games;
    }
    if (Array.isArray(response?.data?.games)) {
      return response.data.games;
    }
    return [];
  }

  private extractPlatformData(response: any): Record<string, any> {
    return response?.include?.platform?.data || response?.include?.platforms?.data || response?.data?.platforms || {};
  }

  private normalizeText(value: string): string {
    const romanMap: Record<string, string> = {
      i: '1',
      ii: '2',
      iii: '3',
      iv: '4',
      v: '5',
      vi: '6',
      vii: '7',
      viii: '8',
      ix: '9',
      x: '10'
    };

    return value
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .map((token) => romanMap[token] ?? token)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private mergeResults(apiResults: GameSearchResult[], fallbackResults: GameSearchResult[]): GameSearchResult[] {
    const merged = new Map<string, GameSearchResult>();

    [...apiResults, ...fallbackResults].forEach((game) => {
      const key = String(game.id || this.normalizeText(game.name));
      if (!merged.has(key)) {
        merged.set(key, game);
      }
    });

    return Array.from(merged.values());
  }

  private async loadGenres(): Promise<Record<string, string>> {
    if (this.genresLoaded) {
      return this.genreCache;
    }

    if (!this.apiUrl || !this.apiKey) {
      return {};
    }

    try {
      const url = `${this.apiUrl}/Genres`;
      const response = await firstValueFrom(this.http.get<any>(url, {
        params: new HttpParams().set('apikey', this.apiKey)
      }));
      const genres = response?.data?.genres || {};
      this.genreCache = Object.keys(genres).reduce((acc: Record<string, string>, key) => {
        const genre = genres[key];
        if (genre?.name) {
          acc[key] = genre.name;
        }
        return acc;
      }, {});
      this.genresLoaded = true;
      return this.genreCache;
    } catch (err) {
      console.warn('No se pudo cargar la lista de géneros TheGamesDB.', err);
      return {};
    }
  }

  private searchFallback(query: string): GameSearchResult[] {
    const normalizedQuery = this.normalizeText(query);
    const queryTokens = normalizedQuery.split(/\s+/).filter(Boolean);
    const ignoredTokens = new Set(['the', 'of', 'and', 'a', 'to', 'for', 'in']);

    return this.fallbackGames.filter((game) => {
      const haystack = this.normalizeText(
        [game.name, game.genres.join(' '), game.platforms.join(' ')].join(' ')
      );

      if (haystack.includes(normalizedQuery)) {
        return true;
      }

      const meaningfulTokens = queryTokens.filter((token) => !ignoredTokens.has(token));
      if (meaningfulTokens.length === 0) {
        return false;
      }

      return meaningfulTokens.some((token) => haystack.includes(token))
        || meaningfulTokens.every((token) => haystack.includes(token));
    });
  }
}
