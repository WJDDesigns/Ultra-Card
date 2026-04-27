/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from 'vitest';
import { logicService } from './logic-service';

describe('LogicService consumer ref-count (multi-card)', () => {
  beforeEach(() => {
    logicService.cleanup();
    expect(logicService.activeConsumerCount).toBe(0);
  });

  it('increments and decrements activeConsumerCount', () => {
    logicService.registerConsumer();
    logicService.registerConsumer();
    expect(logicService.activeConsumerCount).toBe(2);
    logicService.unregisterConsumer();
    expect(logicService.activeConsumerCount).toBe(1);
    logicService.unregisterConsumer();
    expect(logicService.activeConsumerCount).toBe(0);
  });

  it('unregisterConsumer is safe when count is already zero', () => {
    logicService.unregisterConsumer();
    logicService.unregisterConsumer();
    expect(logicService.activeConsumerCount).toBe(0);
  });

  it('cleanup resets consumer count', () => {
    logicService.registerConsumer();
    logicService.registerConsumer();
    logicService.cleanup();
    expect(logicService.activeConsumerCount).toBe(0);
  });
});
