import { TestBed } from '@angular/core/testing';

import { SeatsService } from './seats';

describe('Seats', () => {
  let service: SeatsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SeatsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
