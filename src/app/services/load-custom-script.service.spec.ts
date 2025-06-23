import { TestBed } from '@angular/core/testing';

import { LoadCustomScriptService } from './load-custom-script.service';

describe('LoadCustomScriptService', () => {
  let service: LoadCustomScriptService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadCustomScriptService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
