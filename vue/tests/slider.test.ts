import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import CircularSlider, { CircularSlider as NamedSlider } from '../dist/index.js';

const wrappers: ReturnType<typeof mount>[] = [];
function slider(props: Record<string, unknown> = {}) {
  const wrapper = mount(CircularSlider, { props: { max: 100, ...props }, attachTo: document.body });
  wrappers.push(wrapper);
  const root = wrapper.element as HTMLElement;
  vi.spyOn(root, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0, width: 280, height: 280, right: 280, bottom: 280, x: 0, y: 0, toJSON() {} });
  Object.assign(root, {
    setPointerCapture: vi.fn(), hasPointerCapture: vi.fn(() => true), releasePointerCapture: vi.fn(),
  });
  return wrapper;
}
afterEach(() => { for (const wrapper of wrappers.splice(0)) wrapper.unmount(); });

describe('published Vue component', () => {
  it('exports named and default components', () => { expect(CircularSlider).toBe(NamedSlider); });

  it('accepts programmatic values without re-emitting user changes', async () => {
    const wrapper = slider({ modelValue: 42 });
    expect(wrapper.attributes('aria-valuenow')).toBe('42');
    await wrapper.setProps({ modelValue: 80 });
    expect(wrapper.attributes('aria-valuenow')).toBe('80');
    await wrapper.setProps({ max: 60 });
    expect(wrapper.attributes('aria-valuenow')).toBe('60');
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    expect(wrapper.emitted('change')).toBeUndefined();
    expect(wrapper.emitted('update:dataIndex')).toBeUndefined();
  });

  it('preserves the current selection when bounds, steps, or unrelated props change', async () => {
    const wrapper = slider({ modelValue: 42 });
    await wrapper.trigger('keydown', { key: 'ArrowUp' });
    await wrapper.setProps({ max: 200, label: 'Edited' });
    expect(wrapper.attributes('aria-valuenow')).toBe('43');
    await wrapper.setProps({ step: 5 });
    expect(wrapper.attributes('aria-valuenow')).toBe('45');
    expect(wrapper.emitted('update:modelValue')).toEqual([[43]]);
  });

  it('handles keyboard arrows, Page, Home and End, including a partial final step', async () => {
    const wrapper = slider({ min: -1, max: 10, step: 3, modelValue: 2, direction: -1 });
    for (const [key, expected] of [['ArrowUp', '5'], ['ArrowRight', '8'], ['End', '10'], ['ArrowLeft', '8'], ['Home', '-1'], ['PageUp', '10'], ['PageDown', '-1'], ['ArrowDown', '-1']]) {
      await wrapper.trigger('keydown', { key });
      expect(wrapper.attributes('aria-valuenow')).toBe(expected);
    }
    expect(wrapper.emitted('change')).toHaveLength(7);
  });

  it('keeps custom values, index output, reordered data, and programmatic index changes in sync', async () => {
    const wrapper = slider({ data: ['XS', 'S', 'M', 'L', 'XL'], modelValue: 'M' });
    expect(wrapper.attributes('aria-valuenow')).toBe('2');
    expect(wrapper.attributes('aria-valuetext')).toBe('M');
    await wrapper.trigger('keydown', { key: 'ArrowRight' });
    expect(wrapper.emitted('update:modelValue')).toEqual([['L']]);
    expect(wrapper.emitted('update:dataIndex')).toEqual([[3]]);
    expect(wrapper.emitted('dataIndexChange')).toEqual([[3]]);
    await wrapper.setProps({ data: ['L', 'M', 'S'] });
    expect(wrapper.attributes('aria-valuenow')).toBe('0');
    expect(wrapper.attributes('aria-valuetext')).toBe('L');
    await wrapper.setProps({ dataIndex: 2 });
    expect(wrapper.attributes('aria-valuetext')).toBe('S');
    expect(wrapper.emitted('change')).toEqual([['L']]);
    await wrapper.setProps({ data: ['M'] });
    expect(wrapper.attributes('aria-valuetext')).toBe('M');
  });

  it('supports index-only input, empty data and non-finite numeric configuration', async () => {
    const wrapper = slider({ data: ['S', 'M', 'L'], dataIndex: 1 });
    expect(wrapper.attributes('aria-valuetext')).toBe('M');
    await wrapper.setProps({ data: [], min: Number.NaN, max: Number.NaN, step: 0 });
    expect(wrapper.attributes('aria-valuenow')).toBe('0');
    expect(wrapper.attributes('aria-valuemax')).toBe('360');
    await wrapper.trigger('keydown', { key: 'ArrowUp' });
    expect(wrapper.attributes('aria-valuenow')).toBe('1');
  });

  it('ignores keyboard and pointer edits for readonly and disabled sliders', async () => {
    for (const mode of ['readonly', 'disabled']) {
      const wrapper = slider({ modelValue: 42, [mode]: true, trackDraggable: true });
      await wrapper.trigger('keydown', { key: 'End' });
      await wrapper.get('[data-track]').trigger('pointerdown', { button: 0, isPrimary: true, pointerId: 1, clientX: 260, clientY: 140 });
      expect(wrapper.attributes('aria-valuenow')).toBe('42');
      expect(wrapper.emitted('change')).toBeUndefined();
      expect(wrapper.emitted('draggingChange')).toBeUndefined();
      expect(wrapper.attributes('tabindex')).toBe(mode === 'disabled' ? '-1' : '0');
    }
  });

  it.each(['mouse', 'touch', 'pen'])('captures a %s pointer, clamps circular boundaries and releases on cancel', async (pointerType) => {
    const wrapper = slider({ modelValue: 98, trackDraggable: true });
    await wrapper.get('[data-knob]').trigger('pointerdown', { button: 0, isPrimary: true, pointerId: 7, pointerType });
    expect((wrapper.element as HTMLElement).setPointerCapture).toHaveBeenCalledWith(7);
    await wrapper.trigger('pointermove', { pointerId: 9, clientX: 260, clientY: 140 });
    expect(wrapper.attributes('aria-valuenow')).toBe('98');
    await wrapper.trigger('pointermove', { pointerId: 7, clientX: 147, clientY: 20 });
    expect(wrapper.attributes('aria-valuenow')).toBe('100');
    await wrapper.trigger('pointercancel', { pointerId: 7 });
    expect(wrapper.emitted('draggingChange')).toEqual([[true], [false]]);
    expect((wrapper.element as HTMLElement).releasePointerCapture).toHaveBeenCalledWith(7);
    expect(wrapper.emitted('touched')).toEqual([[]]);
  });

  it('clamps the lower circular boundary and can opt into wrapping', async () => {
    const wrapper = slider({ modelValue: 1 });
    await wrapper.get('[data-knob]').trigger('pointerdown', { button: 0, isPrimary: true, pointerId: 1 });
    await wrapper.trigger('pointermove', { pointerId: 1, clientX: 133, clientY: 20 });
    expect(wrapper.attributes('aria-valuenow')).toBe('0');
    await wrapper.setProps({ limitDragRange: false });
    await wrapper.trigger('pointermove', { pointerId: 1, clientX: 133, clientY: 20 });
    expect(wrapper.attributes('aria-valuenow')).toBe('99');
    await wrapper.setProps({ disabled: true });
    expect(wrapper.emitted('draggingChange')).toEqual([[true], [false]]);
  });

  it('uses track hits only when enabled and leaves middle content noninteractive', async () => {
    const wrapper = slider();
    await wrapper.get('[data-track]').trigger('pointerdown', { button: 0, isPrimary: true, pointerId: 1, clientX: 260, clientY: 140 });
    expect(wrapper.emitted('change')).toBeUndefined();
    await wrapper.setProps({ trackDraggable: true });
    await wrapper.get('.fio-cs-labels').trigger('pointerdown', { button: 0, isPrimary: true, pointerId: 1, clientX: 260, clientY: 140 });
    expect(wrapper.emitted('change')).toBeUndefined();
    await wrapper.get('[data-track]').trigger('pointerdown', { button: 0, isPrimary: true, pointerId: 1, clientX: 260, clientY: 140 });
    expect(wrapper.attributes('aria-valuenow')).toBe('25');
    await wrapper.trigger('lostpointercapture', { pointerId: 1 });
    expect(wrapper.emitted('draggingChange')).toEqual([[true], [false]]);
  });

  it('masks partial arc progress without coloring the unfilled neutral track', async () => {
    const wrapper = slider({ modelValue: 80, max: 160, arcStart: 225, arcEnd: 135, progressGradient: ['green', 'yellow', 'red'], trackColor: '#e5e7eb' });
    expect(wrapper.get('mask path').attributes('stroke-dashoffset')).toBe('50');
    expect(wrapper.get('path.progress').attributes('mask')).toContain('-mask)');
    expect(wrapper.get('.fio-cs-track').attributes('stroke')).toBe('#e5e7eb');
    expect(wrapper.findAll('linearGradient')[0].findAll('stop')).toHaveLength(3);
    await wrapper.setProps({ modelValue: 0 });
    expect(wrapper.get('mask path').attributes('opacity')).toBe('0');
    expect(wrapper.emitted('change')).toBeUndefined();
  });

  it('renders label and knob scoped slots with selected values', () => {
    const wrapper = mount(CircularSlider, {
      props: { modelValue: 65, max: 100, label: 'Battery' },
      slots: { label: ({ value, label, index }) => h('strong', `${label} ${value}% (${index})`), knob: ({ value }) => h('small', `${value}`) },
    });
    wrappers.push(wrapper);
    expect(wrapper.get('strong').text()).toBe('Battery 65% (65)');
    expect(wrapper.get('.fio-cs-knob-content small').text()).toBe('65');
  });

  it('renders stable request-local, unique SVG IDs in SSR', async () => {
    const render = () => renderToString(createSSRApp({ render: () => h('main', [h(CircularSlider, { modelValue: 42 }), h(CircularSlider, { modelValue: 80 })]) }));
    const first = await render();
    expect(first).toBe(await render());
    const ids = [...first.matchAll(/ id="([^"]+)"/g)].map(match => match[1]);
    expect(ids).toHaveLength(6);
    expect(new Set(ids).size).toBe(ids.length);
    expect(first).toContain('aria-valuenow="42"');
    expect(first).not.toContain('NaN');
  });
});
