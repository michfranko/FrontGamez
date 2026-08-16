import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { VideogamesAddComponent } from './videogames-add.component';
import { GameService } from '../core/services/game.service';
import { GameSearchService } from '../core/services/game-search.service';
import { ToastService } from '../core/services/toast.service';

describe('VideogamesAddComponent', () => {
  let fixture: ComponentFixture<VideogamesAddComponent>;
  let component: VideogamesAddComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideogamesAddComponent],
      providers: [
        {
          provide: GameService,
          useValue: {
            addGame: jasmine.createSpy('addGame').and.returnValue(Promise.resolve('id-1'))
          }
        },
        {
          provide: GameSearchService,
          useValue: {
            searchGames: jasmine.createSpy('searchGames').and.returnValue(Promise.resolve([]))
          }
        },
        {
          provide: ToastService,
          useValue: {
            success: jasmine.createSpy('success')
          }
        },
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate').and.returnValue(Promise.resolve(true))
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(VideogamesAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should not show API mode controls or year field in manual-only form', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).not.toContain('Buscar con API');
    expect(compiled.textContent).not.toContain('Modo Manual');
    expect(compiled.textContent).not.toContain('Buscar datos del juego');
    expect(compiled.textContent).not.toContain('Año de lanzamiento');
  });

  it('should render a broad genre selector with common game categories', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const options = Array.from(compiled.querySelectorAll('option')).map(option => option.textContent?.trim());

    expect(options).toContain('Acción');
    expect(options).toContain('Aventura');
    expect(options).toContain('Terror');
    expect(options).toContain('Shooter');
    expect(options).toContain('RPG');
    expect(options).toContain('RPG de acción');
    expect(options).toContain('Estrategia');
    expect(options).toContain('Simulación');
    expect(options).toContain('Deportes');
    expect(options).toContain('Carreras');
    expect(options).toContain('Plataformas');
    expect(options).toContain('Puzzle');
    expect(options).toContain('Metroidvania');
    expect(options).toContain('Bullet Hell');
    expect(options).toContain('Beat ’em up');
    expect(options).toContain('Fighting');
    expect(options).toContain('Sandbox');
    expect(options).toContain('Survival');
    expect(options).toContain('Roguelike'); 
    expect(options).toContain('Stealth');
    expect(options).toContain('Cooperativo');
    expect(options).toContain('Multijugador');
    expect(options).toContain('Arcade');
    expect(options).toContain('Casual');
    expect(options).toContain('Mundo abierto');
    expect(options).toContain('Narrativo');
    expect(options).toContain('Visual Novel');
    expect(options).toContain('Indie');
  });
});
