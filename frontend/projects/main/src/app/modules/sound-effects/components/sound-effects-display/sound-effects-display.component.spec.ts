import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SoundEffectsDisplayComponent } from './sound-effects-display.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { SoundEffect } from '@shared/models/sound-effect.model';

const mockSoundEffect: SoundEffect = {
  id: 'se-1',
  name: 'Explosion',
  duration: 5,
  url: 'http://example.com/explosion.mp3',
  volume: 0.8,
  looping: false,
  tags: [],
};

describe('SoundEffectsDisplayComponent', () => {
  let component: SoundEffectsDisplayComponent;
  let fixture: ComponentFixture<SoundEffectsDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SoundEffectsDisplayComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideAnimationsAsync(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SoundEffectsDisplayComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('soundEffects', [mockSoundEffect]);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default to grid view mode', () => {
    expect(component.activeViewMode()).toBe('grid');
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-sound-effect-card-grid')).toBeTruthy();
    expect(compiled.querySelector('app-sound-effect-table')).toBeNull();
  });

  it('should render table when viewMode is table', () => {
    fixture.componentRef.setInput('viewMode', 'table');
    fixture.detectChanges();

    expect(component.activeViewMode()).toBe('table');
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-sound-effect-table')).toBeTruthy();
    expect(compiled.querySelector('app-sound-effect-card-grid')).toBeNull();
  });

  it('should hide mode switcher when hideToggle is true', () => {
    fixture.componentRef.setInput('hideToggle', true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(
      compiled.querySelector('app-sound-effect-display-mode-switch')
    ).toBeNull();
  });

  it('should show mode switcher when hideToggle is false', () => {
    fixture.componentRef.setInput('hideToggle', false);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(
      compiled.querySelector('app-sound-effect-display-mode-switch')
    ).toBeTruthy();
  });

  it('should switch mode and emit modeChange on onModeChange', () => {
    const modeChangeSpy = vi.fn();
    component.modeChange.subscribe(modeChangeSpy);

    (component as any).onModeChange('table');
    fixture.detectChanges();

    expect(component.activeViewMode()).toBe('table');
    expect(modeChangeSpy).toHaveBeenCalledWith('table');
  });

  it('should forward search event', () => {
    const searchSpy = vi.fn();
    component.search.subscribe(searchSpy);

    component.search.emit('test search');
    expect(searchSpy).toHaveBeenCalledWith('test search');
  });
});
