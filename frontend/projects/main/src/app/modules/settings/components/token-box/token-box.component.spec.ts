import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TokenBoxComponent } from './token-box.component';

describe('TokenBoxComponent', () => {
  let component: TokenBoxComponent;
  let fixture: ComponentFixture<TokenBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TokenBoxComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TokenBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
