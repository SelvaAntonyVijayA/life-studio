import { SafePipe } from './ili-security.pipe';

describe('IliSecurityPipe', () => {
  it('create an instance', () => {
    const pipe = new SafePipe();
    expect(pipe).toBeTruthy();
  });
});
