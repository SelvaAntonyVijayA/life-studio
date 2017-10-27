import { FilterByTextPipe, OrderByPipe } from './filters.pipe';

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

