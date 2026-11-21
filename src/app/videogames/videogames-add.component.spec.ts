import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { VideogamesAddComponent } from './videogames-add.component';
import { GameService } from '../core/services/game.service';
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
            addGame: jasmine.createSpy('addGame').and.returnValue(Promise.resolve('id-1')),
            checkDuplicate: jasmine.createSpy('checkDuplicate').and.returnValue(undefined)
          }
        },
        {
          provide: ToastService,
          useValue: {
            success: jasmine.createSpy('success'),
            showSuccess: jasmine.createSpy('showSuccess'),
            showError: jasmine.createSpy('showError')
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

  it('should create component', () => {
    expect(component).toBeTruthy();
  });
});
