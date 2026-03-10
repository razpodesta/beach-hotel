import { render } from '@testing-library/react';

import MetasharkCmsUi from './ui';

describe('MetasharkCmsUi', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<MetasharkCmsUi />);
    expect(baseElement).toBeTruthy();
  });
});
