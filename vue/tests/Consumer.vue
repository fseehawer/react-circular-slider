<script setup lang="ts">
import { ref } from 'vue';
import CircularSlider, { CircularSlider as NamedSlider } from '@fiojs/vue-circular-slider';
import type { CircularSliderProps, CircularSliderSlotProps } from '@fiojs/vue-circular-slider';
import '@fiojs/vue-circular-slider/style.css';

const volume = ref(40);
const size = ref('M');
const index = ref(1);
const numericProps: CircularSliderProps<number> = { min: 0, max: 100 };
const slot: CircularSliderSlotProps<string> = { value: 'M', index: 1, label: 'Size' };
</script>

<template>
  <CircularSlider v-model="volume" v-bind="numericProps" @change="volume = $event">
    <template #label="{ value }">{{ value.toFixed(0) }}</template>
  </CircularSlider>
  <NamedSlider v-model="size" v-model:data-index="index" :data="['S', 'M', 'L']" @change="size = $event">
    <template #knob="{ value }">{{ value.toLowerCase() }}</template>
  </NamedSlider>
  <span>{{ slot.value }}</span>
</template>
