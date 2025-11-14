import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TagListSmartComponent } from './tag-list-smart.component';

describe('TagListSmartComponent', () => {
  let component: TagListSmartComponent;
  let fixture: ComponentFixture<TagListSmartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TagListSmartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TagListSmartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
