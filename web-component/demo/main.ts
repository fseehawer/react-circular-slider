import { html, render, type TemplateResult } from 'lit';
import { keyed } from 'lit/directives/keyed.js';
import { CircularSliderElement, registerCircularSlider } from '../dist/index.js';
import hljs from 'highlight.js/lib/core';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import { createElement, Copy, Check, ChevronDown, RotateCcw, BatteryFull } from 'lucide';
import './styles.css';

registerCircularSlider();
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('xml', xml);
const tabs = ['Range', 'Arc Gauge', 'Custom Data', 'Forms', 'Templates'] as const;
type Tab = typeof tabs[number];
let active: Tab = 'Range';
let value = 42, speed = 80, charge = 65, volume = 40;
let size = 'M';
let min = 0, max = 100, step = 1, direction: 1 | -1 = 1;
let trackDraggable = true, readonly = false, disabled = false, dragging = false;
let formDisabled = false, formDirty = false, formTouched = false;
let showCode = false, copied = 'Copy code', formData = '{"volume":"40"}';
const sizes = ['XS', 'S', 'M', 'L', 'XL'];
const speedColors = ['#22c55e', '#eab308', '#ef4444'];
const titles: Record<Tab, string> = { Range: 'Numeric range', 'Arc Gauge': 'Speed gauge', 'Custom Data': 'Custom values', Forms: 'Native form', Templates: 'Custom templates' };
const props: Record<Tab, string[]> = {
  Range: ['value', 'min / max', 'step', 'direction', 'trackDraggable'],
  'Arc Gauge': ['arcStart', 'arcEnd', 'trackColor', 'progressGradient'],
  'Custom Data': ['data', 'value', 'label', 'trackDraggable'],
  Forms: ['name', 'FormData', 'required', 'disabled'], Templates: ['slot="label"', 'slot="knob"', 'value'],
};
const app = document.querySelector<HTMLDivElement>('#app')!;
const icon = (data: typeof Copy) => createElement([data[0], { ...data[1], width: '15', height: '15', 'aria-hidden': 'true' }, data[2]]);
const number = (event: Event) => (event.target as HTMLInputElement).valueAsNumber;
const checked = (event: Event) => (event.target as HTMLInputElement).checked;
const selectValue = (event: Event) => (event.target as HTMLSelectElement).value;
const sliderValue = (event: Event) => (event.target as CircularSliderElement).value;
function update() { copied = 'Copy code'; paint(); }

function selectTab(tab: Tab) {
  active = tab;
  showCode = false;
  dragging = false;
  update();
  if (tab === 'Forms') queueMicrotask(readForm);
}

function tabsKey(event: KeyboardEvent) {
  let index = tabs.indexOf(active);
  if (event.key === 'ArrowRight') index = (index + 1) % tabs.length;
  else if (event.key === 'ArrowLeft') index = (index + tabs.length - 1) % tabs.length;
  else if (event.key === 'Home') index = 0;
  else if (event.key === 'End') index = tabs.length - 1;
  else return;
  event.preventDefault(); selectTab(tabs[index]);
  document.querySelector<HTMLButtonElement>(`#tab-${index}`)?.focus();
}

function readForm() {
  const form = document.querySelector<HTMLFormElement>('#volume-form');
  if (!form) return;
  const slider = form.querySelector('fio-circular-slider')!;
  volume = Number(slider.value);
  formData = JSON.stringify(Object.fromEntries(new FormData(form)));
  paint();
}

function resetForm() {
  formDirty = false; formTouched = false;
  queueMicrotask(readForm);
}

function example(): TemplateResult {
  switch (active) {
    case 'Arc Gauge': return html`<div class="workspace"><div class="preview">
      <fio-circular-slider .value=${speed} .max=${160} .arcStart=${225} .arcEnd=${135} .progressGradient=${speedColors}
        track-color="#e5e7eb" track-draggable label="Speed" append-to-value=" km/h" knob-color="#202326"
        @input=${(event: Event) => { speed = Number(sliderValue(event)); paint(); }}></fio-circular-slider>
      </div><div class="settings"><dl><dt>Range</dt><dd>0 - 160 km/h</dd><dt>Start</dt><dd>225 degrees</dd><dt>End</dt><dd>135 degrees</dd>
      <dt>Colors</dt><dd class="swatches"><i style="background:#22c55e"></i><i style="background:#eab308"></i><i style="background:#ef4444"></i></dd></dl>
      <label>Speed<input aria-label="Set speed" type="number" min="0" max="160" .value=${String(speed)} @input=${(event: Event) => { speed = number(event); update(); }}></label></div></div>`;
    case 'Custom Data': return html`<div class="workspace"><div class="preview">
      <fio-circular-slider .data=${sizes} .value=${size} label="Size" track-draggable knob-color="#c026d3" progress-color-from="#f472b6" progress-color-to="#c026d3"
        @input=${(event: Event) => { size = String(sliderValue(event)); paint(); }}></fio-circular-slider>
      </div><div class="settings"><label>Size<select .value=${size} @change=${(event: Event) => { size = selectValue(event); update(); }}>
      ${sizes.map(item => html`<option value=${item} .selected=${item === size}>${item}</option>`)}</select></label><output data-testid="data-value">${size}</output></div></div>`;
    case 'Forms': return html`<form id="volume-form" class="native-form" @submit=${(event: SubmitEvent) => { event.preventDefault(); readForm(); }} @reset=${resetForm}>
      <div class="workspace"><fieldset class="preview" .disabled=${formDisabled}>
        <fio-circular-slider name="volume" value="40" max="100" required label="Volume" append-to-value="%" track-draggable
          @input=${() => { formDirty = true; readForm(); }} @blur=${() => { formTouched = true; paint(); }}></fio-circular-slider>
      </fieldset><div class="settings"><dl><dt>Value</dt><dd data-testid="form-value">${volume}</dd><dt>Touched</dt><dd data-testid="form-touched">${String(formTouched)}</dd>
      <dt>Dirty</dt><dd data-testid="form-dirty">${String(formDirty)}</dd><dt>Status</dt><dd>${formDisabled ? 'DISABLED' : 'VALID'}</dd></dl>
      <div class="actions"><button type="reset">${icon(RotateCcw)} Reset to 40</button>
      <button type="button" @click=${() => { formDisabled = !formDisabled; paint(); queueMicrotask(readForm); }}>${formDisabled ? 'Enable' : 'Disable'}</button>
      <button type="submit">Submit</button></div><output class="form-data" data-testid="form-data" aria-label="FormData">${formData}</output></div></div></form>`;
    case 'Templates': return html`<div class="workspace"><div class="preview">
      <fio-circular-slider .value=${charge} .max=${100} label="Battery" track-draggable knob-color="#16a34a" progress-color-from="#86efac" progress-color-to="#16a34a"
        @input=${(event: Event) => { charge = Number(sliderValue(event)); paint(); }}>
        <div slot="label" class="battery-label">
          ${icon(BatteryFull)}
          <span class="battery-value" data-slider-value>${charge}</span>
          <span class="battery-unit">%</span>
          <span class="battery-caption">Battery</span>
        </div>
        <small slot="knob">${charge}</small>
      </fio-circular-slider></div><div class="settings"><label>Charge<input type="number" min="0" max="100" .value=${String(charge)}
        @input=${(event: Event) => { charge = number(event); update(); }}></label><output>${charge}%</output></div></div>`;
    default: return html`<div class="workspace"><div class="preview">
      <fio-circular-slider .value=${value} .min=${min} .max=${max} .step=${step} .direction=${direction} .trackDraggable=${trackDraggable}
        .readonly=${readonly} .disabled=${disabled} label="Value"
        @input=${(event: Event) => { value = Number(sliderValue(event)); dragging = (event.target as CircularSliderElement).dragging; paint(); }}
        @pointerdown=${() => { queueMicrotask(() => { dragging = document.querySelector('fio-circular-slider')?.dragging ?? false; paint(); }); }}
        @pointerup=${() => { dragging = false; paint(); }} @pointercancel=${() => { dragging = false; paint(); }}
        @lostpointercapture=${() => { dragging = false; paint(); }}></fio-circular-slider>
      </div><div class="settings"><div class="fields">
        <label>Minimum<input type="number" .value=${String(min)} @input=${(event: Event) => { min = number(event); update(); readRange(); }}></label>
        <label>Maximum<input type="number" .value=${String(max)} @input=${(event: Event) => { max = number(event); update(); readRange(); }}></label>
        <label>Step<input type="number" step="0.1" min="0.01" .value=${String(step)} @input=${(event: Event) => { step = number(event); update(); readRange(); }}></label>
        <label>Direction<select .value=${String(direction)} @change=${(event: Event) => { direction = selectValue(event) === '-1' ? -1 : 1; update(); }}>
          <option value="1">Clockwise</option><option value="-1">Counterclockwise</option></select></label>
      </div><div class="checks"><label class="check"><input type="checkbox" .checked=${trackDraggable} @change=${(event: Event) => { trackDraggable = checked(event); update(); }}>Track dragging</label>
      <label class="check"><input type="checkbox" .checked=${readonly} @change=${(event: Event) => { readonly = checked(event); update(); }}>Read only</label>
      <label class="check"><input type="checkbox" .checked=${disabled} @change=${(event: Event) => { disabled = checked(event); update(); }}>Disabled</label></div>
      <output data-testid="range-value">${value}</output><span class="status">${dragging ? 'Dragging' : 'Selected value'}</span></div></div>`;
  }
}

function readRange() { value = Number(document.querySelector('fio-circular-slider')!.value); paint(); }

function code(): string {
  const moduleScript = (body: string) => `<script type="module">\n  import { registerCircularSlider } from '@fiojs/wc-circular-slider';\n  registerCircularSlider();\n\n${body.split('\n').map(line => line ? `  ${line}` : '').join('\n')}\n</script>`;
  switch (active) {
    case 'Arc Gauge': return `<fio-circular-slider id="speed" value="80" max="160"\n  arc-start="225" arc-end="135" track-draggable\n  track-color="#e5e7eb" label="Speed" append-to-value=" km/h">\n</fio-circular-slider>\n\n` + moduleScript(`document.querySelector('#speed').progressGradient =\n  ['#22c55e', '#eab308', '#ef4444'];`);
    case 'Custom Data': return `<fio-circular-slider id="size" label="Size" track-draggable>\n</fio-circular-slider>\n\n` + moduleScript(`const slider = document.querySelector('#size');\nslider.data = ['XS', 'S', 'M', 'L', 'XL'];\nslider.value = 'M';`);
    case 'Forms': return `<form id="volume-form">\n  <fieldset>\n    <fio-circular-slider name="volume" value="40"\n      max="100" label="Volume" required track-draggable>\n    </fio-circular-slider>\n  </fieldset>\n  <button type="reset">Reset to 40</button>\n</form>\n\n` + moduleScript(`const form = document.querySelector('#volume-form');\nform.addEventListener('input', () => {\n  console.log(Object.fromEntries(new FormData(form)));\n});`);
    case 'Templates': return `<fio-circular-slider id="battery" value="65" max="100"
  label="Battery" track-draggable knob-color="#16a34a"
  progress-color-from="#86efac" progress-color-to="#16a34a">
  <div slot="label" class="battery-label">
    <span class="battery-value" data-slider-value>65</span>
    <span class="battery-unit">%</span>
    <span class="battery-caption">Battery</span>
  </div>
  <small slot="knob">65</small>
</fio-circular-slider>

<style>
.battery-label { position: relative; width: max-content; flex: none; line-height: 1; }
.battery-label > svg { position: absolute; bottom: calc(100% + .5rem); left: 50%; transform: translateX(-50%); width: 15px; height: 15px; color: #16a34a; }
.battery-value { display: block; font-size: 32px; font-weight: 600; line-height: 1; font-variant-numeric: tabular-nums; }
.battery-unit { position: absolute; left: calc(100% + .15em); top: 50%; transform: translateY(-50%); font-size: 16px; line-height: 1; }
.battery-caption { position: absolute; top: calc(100% + .5rem); left: 50%; transform: translateX(-50%); white-space: nowrap; font-size: 16px; line-height: 1.15; }
</style>

` + moduleScript(`import { createElement, BatteryFull } from 'lucide';

const battery = document.querySelector('#battery');
const batteryIcon = createElement(BatteryFull);
batteryIcon.setAttribute('aria-hidden', 'true');
battery.querySelector('.battery-label').prepend(batteryIcon);
battery.addEventListener('input', () => {
  battery.querySelector('.battery-value').textContent = String(battery.value);
  battery.querySelector('small').textContent = String(battery.value);
});`);
    default: return `<fio-circular-slider value="42" label="Value"\n  min="${min}" max="${max}" step="${step}" direction="${direction}"\n  track-draggable="${trackDraggable}"${readonly ? '\n  readonly' : ''}${disabled ? '\n  disabled' : ''}>\n</fio-circular-slider>\n\n` + moduleScript(`const slider = document.querySelector('fio-circular-slider');\nslider.addEventListener('input', () => console.log(slider.value));`);
  }
}

// Convert highlight.js output into text and allowlisted span templates, never raw HTML.
function highlight(line: string): unknown[] {
  const parsed = new DOMParser().parseFromString(`<pre>${hljs.highlightAuto(line, ['typescript', 'xml']).value}</pre>`, 'text/html');
  const token = (node: Node): unknown => node.nodeType === Node.TEXT_NODE ? node.textContent
    : node instanceof Element && node.tagName === 'SPAN' ? html`<span class=${Array.from(node.classList).filter(name => /^hljs-[\w-]+$/.test(name)).join(' ')}>${Array.from(node.childNodes).map(token)}</span>` : node.textContent;
  return Array.from(parsed.body.firstElementChild!.childNodes).map(token);
}
let cachedCode = '', cachedLines: unknown[][] = [];
function codeLines() {
  const source = code();
  if (source !== cachedCode) { cachedCode = source; cachedLines = source.split('\n').map(line => highlight(line || ' ')); copied = 'Copy code'; }
  return cachedLines;
}
async function copyCode() {
  try { await navigator.clipboard.writeText(code()); copied = 'Copied'; }
  catch { copied = 'Copy failed'; }
  paint();
}

function paint() {
  const lines = codeLines();
  render(html`<div class="page"><main><header><h1>Web Component Circular Slider</h1><p class="intro">@fiojs/wc-circular-slider</p>
    <pre class="install">npm install @fiojs/wc-circular-slider</pre></header>
    <nav class="tabs" role="tablist" aria-label="Examples" @keydown=${tabsKey}>${tabs.map((tab, index) => html`
      <button type="button" role="tab" id=${`tab-${index}`} aria-controls="example" aria-selected=${active === tab} tabindex=${active === tab ? 0 : -1} @click=${() => selectTab(tab)}>${tab}</button>`)}</nav>
    <section id="example" role="tabpanel" aria-labelledby=${`tab-${tabs.indexOf(active)}`}>
      <div class="example-header"><h2>${titles[active]}</h2><div class="chips" aria-label="Highlighted properties">${props[active].map(prop => html`<code>${prop}</code>`)}</div></div>
      ${keyed(active, example())}
      <div class="code-actions"><button type="button" aria-controls="code-sample" aria-expanded=${showCode} @click=${() => { showCode = !showCode; paint(); }}>${showCode ? 'Hide Code Sample' : 'View Code Sample'}<span class=${showCode ? 'rotated' : ''}>${icon(ChevronDown)}</span></button></div>
      <div id="code-sample" class=${`code-sample${showCode ? ' is-open' : ''}`}><div class="code-heading"><span>Web Component</span>
      <button type="button" aria-label=${copied} title=${copied} class=${copied === 'Copied' ? 'copied' : ''} @click=${copyCode}>${icon(copied === 'Copied' ? Check : Copy)}</button></div>
      <pre class="code"><code>${lines.map((line, index) => html`<span class="code-line"><span class="line-number" aria-hidden="true">${index + 1}</span><span class="line-content">${line}</span></span>`)}</code></pre></div>
    </section><footer><p>&copy; 2026 Web Component Circular Slider</p><nav aria-label="Project">
      <a href="https://github.com/fseehawer/react-circular-slider/tree/master/web-component">Documentation</a>
      <a href="https://www.npmjs.com/package/@fiojs/wc-circular-slider">npm</a><a href="https://github.com/fseehawer/react-circular-slider">GitHub</a></nav>
      <a href="https://www.paypal.com/donate?hosted_button_id=GGLRKKGFPTXJW" target="_blank" rel="noreferrer">Donate</a></footer></main></div>`, app);
}
paint();
