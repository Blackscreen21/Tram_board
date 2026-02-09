import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeparturesComponent } from './departures';

describe('Departures', () => {
  let component: DeparturesComponent;
  let fixture: ComponentFixture<DeparturesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeparturesComponent],
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeparturesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
