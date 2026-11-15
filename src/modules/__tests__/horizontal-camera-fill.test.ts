/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { UltraHorizontalModule } from '../horizontal-module';
import { mockHass } from '../../editor/tabs/__tests__/layout-tab-harness';

describe('cameras inside a Horizontal layout', () => {
  const h = new UltraHorizontalModule() as any;
  const handler = () => h;
  const camera = (design: Record<string, unknown>) =>
    ({ id: 'cam', type: 'camera', entity: 'camera.front', design }) as any;

  it('drops the stock 500px max width so two cameras can fill a wide row', () => {
    const released = handler().releaseStockCameraMaxWidth(
      camera({ width: '100%', max_width: '500px' })
    );
    expect(released.design.max_width).toBe('');
    expect(released.design.width).toBe('100%');
    expect(handler().getFluidMediaFlex(released)).toContain('max-width: 100%');
  });

  it('keeps a max width the user chose and leaves the original config alone', () => {
    const original = camera({ width: '100%', max_width: '300px' });
    expect(handler().releaseStockCameraMaxWidth(original)).toBe(original);

    const stock = camera({ width: '100%', max_width: '500px' });
    handler().releaseStockCameraMaxWidth(stock);
    expect(stock.design.max_width).toBe('500px');
  });

  it('ignores other module types', () => {
    const map = { id: 'm', type: 'map', design: { max_width: '500px' } } as any;
    expect(handler().releaseStockCameraMaxWidth(map)).toBe(map);
  });

  it('renders without errors', () => {
    expect(() =>
      handler().renderPreview(
        { id: 'h', type: 'horizontal', modules: [camera({ max_width: '500px' })] },
        mockHass,
        { type: 'custom:ultra-card', layout: { rows: [] } },
        'live'
      )
    ).not.toThrow();
  });
});
