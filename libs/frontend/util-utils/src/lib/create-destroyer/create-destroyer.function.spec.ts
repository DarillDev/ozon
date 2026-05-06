import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';

import {createDestroyer} from './create-destroyer.function';

@Component({
  selector: 'test-component-1',
  template: '',
  standalone: true,
})
class Test1Component {
  public destroyer = createDestroyer();
}

describe('createDestroyer', () => {
  let testComponent1: Test1Component;
  let fixture1: ComponentFixture<Test1Component>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Test1Component],
    });

    fixture1 = TestBed.createComponent(Test1Component);
    testComponent1 = fixture1.componentInstance;
  });

  describe('createDestroyer()', () => {
    it('should init destroyer inside component', () => {
      expect(testComponent1.destroyer).toBeInstanceOf(Function);
      expect(testComponent1.destroyer()).toBeInstanceOf(Function);
    });

    it('should throw error if used outside of constructor', () => {
      expect(() => createDestroyer()).toThrow();
    });
  });
});
