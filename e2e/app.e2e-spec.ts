import { IliPage } from './app.po';

describe('ili App', () => {
  let page: IliPage;

  beforeEach(() => {
    page = new IliPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});
