import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShuffleButtonComponent } from './shuffle-button.component';

describe('ShuffleButtonComponent', () => {
  let component: ShuffleButtonComponent;
  let fixture: ComponentFixture<ShuffleButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShuffleButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShuffleButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
