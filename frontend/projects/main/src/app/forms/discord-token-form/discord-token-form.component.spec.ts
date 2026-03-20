import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscordTokenFormComponent } from './discord-token-form.component';

describe('DiscordTokenFormComponent', () => {
  let component: DiscordTokenFormComponent;
  let fixture: ComponentFixture<DiscordTokenFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiscordTokenFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiscordTokenFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

