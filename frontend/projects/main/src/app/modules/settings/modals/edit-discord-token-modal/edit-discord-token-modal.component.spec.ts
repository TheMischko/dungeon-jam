import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditDiscordTokenModalComponent } from './edit-discord-token-modal.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

describe('EditDiscordTokenModalComponent', () => {
  let component: EditDiscordTokenModalComponent;
  let fixture: ComponentFixture<EditDiscordTokenModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditDiscordTokenModalComponent],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: { name: 'Test Token', apiKey: 'test-key' } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditDiscordTokenModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

