import { FilterByTextPipe, OrderByPipe, ReversePipe, FilterInByArray } from './filters.pipe';

describe('FilterByTextPipe', () => {
  it('create an instance', () => {
    const pipe = new FilterByTextPipe();
    expect(pipe).toBeTruthy();
  });
});

describe('OrderByPipe', () => {
  it('create an instance', () => {
    const pipe = new OrderByPipe();
    expect(pipe).toBeTruthy();
  });
});

describe('ReversePipe', () => {
  it('create an instance', () => {
    const pipe = new ReversePipe();
    expect(pipe).toBeTruthy();
  });
});

describe('FilterInByArray', () => {
  it('create an instance', () => {
    const pipe = new FilterInByArray();
    expect(pipe).toBeTruthy();
  });
});
