import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ScenesGridSmartComponent } from './scenes-grid-smart.component';
import { RedirectService } from '@general';
import { RedirectPath } from '@shared/models/redirect.model';
import { Scene } from '@shared/models/scene.model';

describe('ScenesGridSmartComponent', () => {
  let component: ScenesGridSmartComponent;
  let fixture: ComponentFixture<ScenesGridSmartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScenesGridSmartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ScenesGridSmartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect to the selected scene', () => {
    const redirectService = TestBed.inject(RedirectService);
    vi.spyOn(redirectService, 'triggerRedirect');
    const scene = {
      id: 'scene-1',
      name: 'Test Scene',
    } as Scene;

    component.navigateToDetail(scene);

    expect(redirectService.triggerRedirect).toHaveBeenCalledWith({
      path: RedirectPath.SCENES,
      params: { sceneId: scene.id },
    });
  });
});
