import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TagPillComponent } from './tag-pill.component';
import { TagData } from '@shared/models/tag.model';

describe('TagPillComponent', () => {
  let component: TagPillComponent;
  let fixture: ComponentFixture<TagPillComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TagPillComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TagPillComponent);
    component = fixture.componentInstance;
    const mockTag: TagData = {
      id: 'tag-1',
      title: 'Test Tag',
      color: '#ff0000',
    };
    fixture.componentRef.setInput('tag', mockTag);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
