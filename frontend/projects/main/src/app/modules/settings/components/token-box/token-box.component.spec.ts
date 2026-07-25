import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DiscordTokenData } from '@shared/models/discord.model';

import { TokenBoxComponent } from './token-box.component';

const mockToken: DiscordTokenData = {
  id: 'token-1',
  apiKey: 'api-key',
  name: 'Test Token',
  updatedAt: new Date(0),
  lastUsedAt: new Date(0),
  active: false,
};

describe('TokenBoxComponent', () => {
  let component: TokenBoxComponent;
  let fixture: ComponentFixture<TokenBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TokenBoxComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TokenBoxComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('token', mockToken);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
