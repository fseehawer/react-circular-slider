import { CircularSliderElement, registerCircularSlider } from '@fiojs/wc-circular-slider';
import { CircularSliderElement as RegisteredCircularSlider, registerCircularSlider as registerAgain } from '@fiojs/wc-circular-slider/register';

const canonicalConstructor: typeof CircularSliderElement = RegisteredCircularSlider;
const canonicalRegistration: typeof registerCircularSlider = registerAgain;
const element: CircularSliderElement = document.createElement('fio-circular-slider');
const registeredElement: RegisteredCircularSlider = element;

void [canonicalConstructor, canonicalRegistration, registeredElement];
