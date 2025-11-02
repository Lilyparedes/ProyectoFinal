import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifyComponent } from './modify';

describe('Modify', () => {
  let component: ModifyComponent;
  let fixture: ComponentFixture<ModifyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModifyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModifyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
