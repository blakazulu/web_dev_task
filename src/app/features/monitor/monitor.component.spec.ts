import {ComponentFixture, TestBed} from '@angular/core/testing';

import {MonitorComponent} from './monitor.component';

describe('MonitorComponent', () => {
  let component: MonitorComponent;
  let fixture: ComponentFixture<MonitorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonitorComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(MonitorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
