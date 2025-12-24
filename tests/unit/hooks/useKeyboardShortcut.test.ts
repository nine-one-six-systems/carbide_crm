import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';

describe('useKeyboardShortcut', () => {
  let addEventListenerSpy: ReturnType<typeof vi.spyOn>;
  let removeEventListenerSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    addEventListenerSpy = vi.spyOn(document, 'addEventListener');
    removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
  });

  afterEach(() => {
    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  it('registers keyboard event listener on mount', () => {
    const callback = vi.fn();
    renderHook(() => useKeyboardShortcut({ key: 'k', metaKey: true }, callback));

    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  it('removes keyboard event listener on unmount', () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => 
      useKeyboardShortcut({ key: 'k', metaKey: true }, callback)
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  it('calls callback when correct key combination is pressed', () => {
    const callback = vi.fn();
    renderHook(() => useKeyboardShortcut({ key: 'k', metaKey: true }, callback));

    // Get the event handler that was registered
    const eventHandler = addEventListenerSpy.mock.calls[0][1] as EventListener;

    // Simulate the key press
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
      bubbles: true,
    });

    act(() => {
      eventHandler(event);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('does not call callback when wrong key is pressed', () => {
    const callback = vi.fn();
    renderHook(() => useKeyboardShortcut({ key: 'k', metaKey: true }, callback));

    const eventHandler = addEventListenerSpy.mock.calls[0][1] as EventListener;

    const event = new KeyboardEvent('keydown', {
      key: 'j',
      metaKey: true,
      bubbles: true,
    });

    act(() => {
      eventHandler(event);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('does not call callback when modifier key is missing', () => {
    const callback = vi.fn();
    renderHook(() => useKeyboardShortcut({ key: 'k', metaKey: true }, callback));

    const eventHandler = addEventListenerSpy.mock.calls[0][1] as EventListener;

    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: false,
      bubbles: true,
    });

    act(() => {
      eventHandler(event);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('handles ctrl key modifier', () => {
    const callback = vi.fn();
    renderHook(() => useKeyboardShortcut({ key: 's', ctrlKey: true }, callback));

    const eventHandler = addEventListenerSpy.mock.calls[0][1] as EventListener;

    const event = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
      bubbles: true,
    });

    act(() => {
      eventHandler(event);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('handles shift key modifier', () => {
    const callback = vi.fn();
    renderHook(() => useKeyboardShortcut({ key: 'n', shiftKey: true }, callback));

    const eventHandler = addEventListenerSpy.mock.calls[0][1] as EventListener;

    const event = new KeyboardEvent('keydown', {
      key: 'n',
      shiftKey: true,
      bubbles: true,
    });

    act(() => {
      eventHandler(event);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('handles multiple modifier keys', () => {
    const callback = vi.fn();
    renderHook(() => 
      useKeyboardShortcut({ key: 's', ctrlKey: true, shiftKey: true }, callback)
    );

    const eventHandler = addEventListenerSpy.mock.calls[0][1] as EventListener;

    const event = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
      shiftKey: true,
      bubbles: true,
    });

    act(() => {
      eventHandler(event);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });
});

