import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiKitComponent } from './ui-kit.component';

describe('UiKitComponent', () => {
  let component: UiKitComponent;
  let fixture: ComponentFixture<UiKitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiKitComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UiKitComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
