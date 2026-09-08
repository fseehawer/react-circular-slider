<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue';
import { CircularSlider } from '@fiojs/vue-circular-slider';
import { Check, ChevronDown, Copy, Power, RotateCcw } from 'lucide-vue-next';
import hljs from 'highlight.js/lib/core';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';

hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('xml', xml);

const tabs = ['Range', 'Arc Gauge', 'Custom Data', 'Forms', 'Templates'] as const;
const active = ref<(typeof tabs)[number]>('Range');
const value = ref(42);
const speed = ref(80);
const size = ref('M');
const sizeIndex = ref(2);
const charge = ref(65);
const settings = reactive({ min: 0, max: 100, step: 1, direction: 1 as 1 | -1, trackDraggable: true, readonly: false, disabled: false });
const dragging = ref(false);
const speedColors = ['#22c55e', '#eab308', '#ef4444'];
const sizes = ['XS', 'S', 'M', 'L', 'XL'];
const volume = ref(55);
const formBaseline = ref(55);
const formDisabled = ref(false);
const formTouched = ref(false);
const formDirty = computed(() => volume.value !== formBaseline.value);
const formStatus = computed(() => formDisabled.value ? 'DISABLED' : volume.value >= 0 && volume.value <= 100 ? 'VALID' : 'INVALID');
const showCode = ref(false);
const copied = ref('Copy code');
const palette = { labelColor: '#202326', knobColor: '#15805c', progressColorFrom: '#6ee7b7', progressColorTo: '#15805c', trackColor: '#e5e7eb' };
const example = computed(() => {
  switch (active.value) {
    case 'Arc Gauge': return { title: 'Speed gauge', props: ['arcStart', 'arcEnd', 'trackColor', 'progressGradient'] };
    case 'Custom Data': return { title: 'Custom values', props: ['data', 'v-model', 'dataIndex', 'trackDraggable'] };
    case 'Forms': return { title: 'Form state', props: ['v-model', 'touched', 'disabled'] };
    case 'Templates': return { title: 'Custom templates', props: ['#label', '#knob', 'v-model'] };
    default: return { title: 'Numeric range', props: ['v-model', 'min / max', 'step', 'direction', 'trackDraggable'] };
  }
});

function selectTab(tab: (typeof tabs)[number]) {
  active.value = tab;
  copied.value = 'Copy code';
  showCode.value = false;
  dragging.value = false;
}

async function tabKey(event: KeyboardEvent, index: number) {
  let next: number;
  switch (event.key) {
    case 'ArrowRight': next = (index + 1) % tabs.length; break;
    case 'ArrowLeft': next = (index + tabs.length - 1) % tabs.length; break;
    case 'Home': next = 0; break;
    case 'End': next = tabs.length - 1; break;
    default: return;
  }
  event.preventDefault();
  selectTab(tabs[next]);
  await nextTick();
  document.getElementById(`tab-${next}`)?.focus();
}

function resetForm() {
  volume.value = 40;
  formBaseline.value = 40;
  formTouched.value = false;
}

async function copyCode() {
  try { await navigator.clipboard.writeText(code.value); copied.value = 'Copied'; }
  catch { copied.value = 'Copy failed'; }
}

watch(size, selected => { sizeIndex.value = sizes.indexOf(selected); });

const code = computed(() => {
  const imports = `import { ref${active.value === 'Forms' ? ', computed' : ''} } from 'vue';\nimport { CircularSlider } from '@fiojs/vue-circular-slider';\nimport '@fiojs/vue-circular-slider/style.css';`;
  let setup: string;
  let template: string;
  let styles = '';
  switch (active.value) {
    case 'Arc Gauge':
      setup = 'const speed = ref(80);';
      template = `<CircularSlider\n  v-model="speed"\n  :max="160"\n  :arc-start="225"\n  :arc-end="135"\n  track-color="#e5e7eb"\n  :progress-gradient="['#22c55e', '#eab308', '#ef4444']"\n  :track-draggable="true"\n  label="Speed"\n  append-to-value=" km/h"\n/>`;
      break;
    case 'Custom Data':
      setup = "const size = ref('M');\nconst sizeIndex = ref(2);\nconst sizes = ['XS', 'S', 'M', 'L', 'XL'];";
      template = `<CircularSlider\n  v-model="size"\n  v-model:data-index="sizeIndex"\n  :data="sizes"\n  label="Size"\n  :track-draggable="true"\n/>`;
      break;
    case 'Forms':
      setup = `const volume = ref(55);\nconst baseline = ref(55);\nconst touched = ref(false);\nconst disabled = ref(false);\nconst dirty = computed(() => volume.value !== baseline.value);\n\nfunction reset() {\n  volume.value = baseline.value = 40;\n  touched.value = false;\n}`;
      template = `<form @reset.prevent="reset">\n  <CircularSlider\n    v-model="volume"\n    :max="100"\n    :disabled="disabled"\n    label="Volume"\n    append-to-value="%"\n    :track-draggable="true"\n    @touched="touched = true"\n  />\n  <input type="hidden" name="volume" :value="volume" :disabled="disabled">\n  <output>{{ dirty ? 'Changed' : 'Unchanged' }}</output>\n  <button type="reset">Reset to 40</button>\n  <button type="button" @click="disabled = !disabled">\n    {{ disabled ? 'Enable' : 'Disable' }}\n  </button>\n</form>`;
      break;
    case 'Templates':
      setup = 'const charge = ref(65);';
      template = `<CircularSlider
  v-model="charge"
  :max="100"
  label="Battery"
  append-to-value="%"
  :track-draggable="true"
  label-color="#202326"
  track-color="#e5e7eb"
  knob-color="#16a34a"
  progress-color-from="#86efac"
  progress-color-to="#16a34a"
>
  <template #label="{ value, label }">
    <div class="battery-label">
      <span class="battery-value" data-slider-value>{{ value }}</span>
      <span class="battery-unit">%</span>
      <span class="battery-caption">{{ label }}</span>
    </div>
  </template>
  <template #knob="{ value }">
    <small>{{ value }}</small>
  </template>
</CircularSlider>`;
      styles = `

<style scoped>
.battery-label { position: relative; width: max-content; flex: none; line-height: 1; }
.battery-value { display: block; font-size: 32px; font-weight: 600; line-height: 1; font-variant-numeric: tabular-nums; }
.battery-unit { position: absolute; left: calc(100% + .15em); top: 50%; transform: translateY(-50%); font-size: 16px; line-height: 1; }
.battery-caption { position: absolute; top: calc(100% + .5rem); left: 50%; transform: translateX(-50%); white-space: nowrap; font-size: 16px; line-height: 1.15; }
</style>`;
      break;
    default:
      setup = 'const value = ref(42);';
      template = `<CircularSlider\n  v-model="value"\n  :min="${settings.min}"\n  :max="${settings.max}"\n  :step="${settings.step}"\n  :direction="${settings.direction}"\n  :track-draggable="${settings.trackDraggable}"\n  :disabled="${settings.disabled}"\n  :readonly="${settings.readonly}"\n  label="Value"\n/>`;
  }
  return `<script setup lang="ts">\n${imports}\n\n${setup}\n<` + `/script>\n\n<template>\n${template.split('\n').map(line => `  ${line}`).join('\n')}\n</template>${styles}`;
});
const codeLines = computed(() => {
  let inScript = false;
  return code.value.split('\n').map(line => {
    if (line.startsWith('<script')) { inScript = true; return hljs.highlight(line, { language: 'xml' }).value; }
    if (line.startsWith('</script')) inScript = false;
    return hljs.highlight(line, { language: inScript ? 'typescript' : 'xml' }).value;
  });
});
watch(code, () => { copied.value = 'Copy code'; });
</script>

<template>
  <div class="page"><main>
    <header>
      <h1>Vue Circular Slider</h1>
      <p class="intro">@fiojs/vue-circular-slider</p>
      <pre class="install">npm install @fiojs/vue-circular-slider</pre>
    </header>
    <nav class="tabs" role="tablist" aria-label="Examples">
      <button v-for="(tab, index) in tabs" :id="`tab-${index}`" :key="tab" type="button" role="tab"
        :aria-selected="active === tab" :tabindex="active === tab ? 0 : -1" aria-controls="example"
        @click="selectTab(tab)" @keydown="tabKey($event, index)">{{ tab }}</button>
    </nav>
    <section id="example" role="tabpanel" :aria-labelledby="`tab-${tabs.indexOf(active)}`" tabindex="0">
      <div class="example-header">
        <h2>{{ example.title }}</h2>
        <div class="chips" aria-label="Highlighted inputs"><code v-for="prop in example.props" :key="prop">{{ prop }}</code></div>
      </div>
      <div class="workspace">
        <div class="preview">
          <CircularSlider v-if="active === 'Range'" v-model="value" v-bind="{ ...palette, ...settings }"
            label="Value" @dragging-change="dragging = $event" />
          <CircularSlider v-else-if="active === 'Arc Gauge'" v-model="speed" :max="160" :arc-start="225" :arc-end="135"
            track-color="#e5e7eb" :progress-gradient="speedColors" :track-draggable="true"
            label="Speed" append-to-value=" km/h" label-color="#202326" knob-color="#202326" />
          <CircularSlider v-else-if="active === 'Custom Data'" v-model="size" v-model:data-index="sizeIndex"
            :data="sizes" label="Size" :track-draggable="true" label-color="#202326" track-color="#e5e7eb"
            knob-color="#c026d3" progress-color-from="#f472b6" progress-color-to="#c026d3" />
          <form v-else-if="active === 'Forms'" id="volume-form" class="volume-form" @submit.prevent @reset.prevent="resetForm">
            <CircularSlider v-model="volume" :max="100" :disabled="formDisabled" v-bind="palette" label="Volume"
              append-to-value="%" :track-draggable="true" @touched="formTouched = true" />
            <input type="hidden" name="volume" :value="volume" :disabled="formDisabled">
          </form>
          <CircularSlider v-else v-model="charge" :max="100" :track-draggable="true" label="Battery" append-to-value="%"
            label-color="#202326" track-color="#e5e7eb" knob-color="#16a34a" progress-color-from="#86efac" progress-color-to="#16a34a">
            <template #label="{ value: selected, label }">
              <div class="battery-label">
                <span class="battery-value" data-slider-value>{{ selected }}</span>
                <span class="battery-unit">%</span>
                <span class="battery-caption">{{ label }}</span>
              </div>
            </template>
            <template #knob="{ value: selected }"><small>{{ selected }}</small></template>
          </CircularSlider>
        </div>
        <div class="settings">
          <template v-if="active === 'Range'">
            <div class="fields">
              <label>Minimum<input v-model.number="settings.min" type="number"></label>
              <label>Maximum<input v-model.number="settings.max" type="number"></label>
              <label>Step<input v-model.number="settings.step" type="number" min="0.01" step="0.1"></label>
              <label>Direction<select v-model.number="settings.direction"><option :value="1">Clockwise</option><option :value="-1">Counterclockwise</option></select></label>
            </div>
            <div class="checks">
              <label class="check"><input v-model="settings.trackDraggable" type="checkbox">Track dragging</label>
              <label class="check"><input v-model="settings.readonly" type="checkbox">Read only</label>
              <label class="check"><input v-model="settings.disabled" type="checkbox">Disabled</label>
            </div>
            <output data-testid="range-value">{{ value }}</output><span class="status" data-testid="drag-state">{{ dragging ? 'Dragging' : 'Selected value' }}</span>
          </template>
          <template v-else-if="active === 'Arc Gauge'">
            <dl><dt>Range</dt><dd>0 - 160 km/h</dd><dt>Start</dt><dd>225 degrees</dd><dt>End</dt><dd>135 degrees</dd><dt>Colors</dt><dd class="swatches" aria-label="Green, yellow, red"><i v-for="color in speedColors" :key="color" :style="{ background: color }"></i></dd></dl>
            <label>Speed<input v-model.number="speed" aria-label="Set speed" type="number" min="0" max="160"></label>
          </template>
          <template v-else-if="active === 'Custom Data'">
            <label>Size<select v-model="size"><option v-for="item in sizes" :key="item" :value="item">{{ item }}</option></select></label>
            <output data-testid="data-value">{{ size }}</output><span class="status">Index <span data-testid="data-index">{{ sizeIndex }}</span></span>
          </template>
          <template v-else-if="active === 'Forms'">
            <dl><dt>Value</dt><dd data-testid="form-value">{{ volume }}</dd><dt>Touched</dt><dd data-testid="form-touched">{{ formTouched }}</dd><dt>Dirty</dt><dd data-testid="form-dirty">{{ formDirty }}</dd><dt>Status</dt><dd data-testid="form-status">{{ formStatus }}</dd></dl>
            <div class="actions"><button type="reset" form="volume-form"><RotateCcw :size="15" aria-hidden="true" />Reset to 40</button><button type="button" :aria-pressed="formDisabled" @click="formDisabled = !formDisabled"><Power :size="15" aria-hidden="true" />{{ formDisabled ? 'Enable' : 'Disable' }}</button></div>
          </template>
          <template v-else>
            <label>Charge<input v-model.number="charge" type="number" min="0" max="100"></label>
            <output>{{ charge }}%</output>
          </template>
        </div>
      </div>
      <div class="code-actions"><button type="button" :aria-expanded="showCode" aria-controls="code-sample" @click="showCode = !showCode">{{ showCode ? 'Hide Code Sample' : 'View Code Sample' }}<ChevronDown :size="15" :class="{ rotated: showCode }" aria-hidden="true" /></button></div>
      <div id="code-sample" class="code-sample" :class="{ 'is-open': showCode }">
        <div class="code-heading"><span>Vue + TypeScript</span><button type="button" :aria-label="copied" :title="copied" :class="{ copied: copied === 'Copied' }" aria-live="polite" @click="copyCode"><Check v-if="copied === 'Copied'" :size="15" aria-hidden="true" /><Copy v-else :size="15" aria-hidden="true" />{{ copied === 'Copy code' ? 'Copy' : copied }}</button></div>
        <pre class="code"><code><span v-for="(line, index) in codeLines" :key="index" class="code-line"><span class="line-number" aria-hidden="true">{{ index + 1 }}</span><span class="line-content" v-html="line || ' '"></span></span></code></pre>
      </div>
    </section>
    <footer><p>&copy; 2026 Vue Circular Slider</p><nav aria-label="Project"><a href="https://github.com/fseehawer/react-circular-slider/tree/master/vue">Documentation</a><a href="https://www.npmjs.com/package/@fiojs/vue-circular-slider">npm</a><a href="https://github.com/fseehawer/react-circular-slider">GitHub</a></nav><a class="support" href="https://www.paypal.com/donate?hosted_button_id=GGLRKKGFPTXJW" target="_blank" rel="noreferrer">Support maintenance</a></footer>
  </main></div>
</template>
