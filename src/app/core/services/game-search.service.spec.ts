import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { GameSearchService } from './game-search.service';

describe('GameSearchService', () => {
  let service: GameSearchService;
  let httpClient: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    httpClient = jasmine.createSpyObj('HttpClient', ['get']);
    httpClient.get.and.returnValue(of({ data: { games: [] } }));

    TestBed.configureTestingModule({
      providers: [
        GameSearchService,
        { provide: HttpClient, useValue: httpClient }
      ]
    });

    service = TestBed.inject(GameSearchService);
  });

  it('should find results for different game searches', async () => {
    const queries = ['zelda', 'red dead', 'minecraft', 'persona', 'portal'];

    for (const query of queries) {
      const results = await service.searchGames(query);
      expect(results.length).toBeGreaterThan(0);
    }
  });

  it('should match names that include roman numerals or alternate wordings', async () => {
    const results = await service.searchGames('zelda 2');
    expect(results.length).toBeGreaterThan(0);
  });
});
