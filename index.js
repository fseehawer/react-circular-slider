"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _aphrodite = require("aphrodite");

var _Knob = _interopRequireDefault(require("../Knob"));

var _Labels = _interopRequireDefault(require("../Labels"));

var _Svg = _interopRequireDefault(require("../Svg"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; if (obj != null) { var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var touchSupported = 'ontouchstart' in window;
var SLIDER_EVENT = {
  DOWN: touchSupported ? 'touchstart' : 'mousedown',
  UP: touchSupported ? 'touchend' : 'mouseup',
  MOVE: touchSupported ? 'touchmove' : 'mousemove'
};

var CircularSlider = function CircularSlider(props) {
  var _props$label = props.label,
      label = _props$label === void 0 ? 'Degrees°' : _props$label,
      _props$width = props.width,
      width = _props$width === void 0 ? 280 : _props$width,
      _props$knobColor = props.knobColor,
      knobColor = _props$knobColor === void 0 ? '#4e63ea' : _props$knobColor,
      _props$labelColor = props.labelColor,
      labelColor = _props$labelColor === void 0 ? '#272b77' : _props$labelColor,
      _props$progressColors = props.progressColors,
      progressColors = _props$progressColors === void 0 ? {
    from: '#80C3F3',
    to: '#4990E2'
  } : _props$progressColors,
      _props$trackColor = props.trackColor,
      trackColor = _props$trackColor === void 0 ? '#DDDEFB' : _props$trackColor,
      _props$progressSize = props.progressSize,
      progressSize = _props$progressSize === void 0 ? 6 : _props$progressSize,
      _props$trackSize = props.trackSize,
      trackSize = _props$trackSize === void 0 ? 6 : _props$trackSize,
      onChange = props.onChange;

  var _useState = (0, _react.useState)({
    mounted: false,
    isDragging: false,
    width: width,
    radius: width / 2,
    degrees: 0,
    knob: {
      radians: 0,
      x: 0,
      y: 0
    },
    dashFullArray: 0,
    dashFullOffset: 0
  }),
      _useState2 = _slicedToArray(_useState, 2),
      state = _useState2[0],
      setState = _useState2[1];

  var circularSlider = (0, _react.useRef)(null);
  var svgFullPath = (0, _react.useRef)(null);
  var offsetRelativeToDocument = (0, _react.useCallback)(function () {
    var rect = circularSlider.current.getBoundingClientRect();
    var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    return {
      top: rect.top + scrollTop,
      left: rect.left + scrollLeft
    };
  }, []);
  var knobPosition = (0, _react.useCallback)(function (radians) {
    var radius = state.radius;
    var offsetRadians = radians + 1.5708; // offset by 90 degrees

    var degrees = (offsetRadians > 0 ? offsetRadians : 2 * Math.PI + offsetRadians) * (360 / (2 * Math.PI));
    var dashOffset = state.dashFullArray - degrees / 360 * state.dashFullArray; // props callback for parent

    onChange(Math.round(degrees));
    setState(function (prevState) {
      return _objectSpread({}, prevState, {
        dashFullOffset: dashOffset,
        degrees: Math.round(degrees),
        knob: {
          radians: radians,
          x: radius * Math.cos(radians) + radius,
          y: radius * Math.sin(radians) + radius
        }
      });
    });
  }, [state.dashFullArray, state.radius, onChange]);
  var onMouseDown = (0, _react.useCallback)(function (event) {
    setState(function (prevState) {
      return _objectSpread({}, prevState, {
        isDragging: true
      });
    });
  }, []);
  var onMouseMove = (0, _react.useCallback)(function (event) {
    event.preventDefault();
    if (!state.isDragging) return;
    var touch;

    if (event.type === 'touchmove') {
      touch = event.changedTouches[0];
    }

    var mouseXFromCenter = (event.type === 'touchmove' ? touch.pageX : event.pageX) - (offsetRelativeToDocument().left + state.radius);
    var mouseYFromCenter = (event.type === 'touchmove' ? touch.pageY : event.pageY) - (offsetRelativeToDocument().top + state.radius);
    var radians = Math.atan2(mouseYFromCenter, mouseXFromCenter);
    knobPosition(radians);
  }, [state.isDragging, state.radius, knobPosition, offsetRelativeToDocument]);

  var onMouseUp = function onMouseUp(event) {
    setState(function (prevState) {
      return _objectSpread({}, prevState, {
        isDragging: false
      });
    });
  };

  (0, _react.useEffect)(function () {
    var pathLength = svgFullPath.current.getTotalLength();
    setState(function (prevState) {
      return _objectSpread({}, prevState, {
        mounted: true,
        dashFullArray: pathLength,
        dashFullOffset: pathLength,
        radius: state.radius,
        knob: {
          radians: 0,
          x: state.radius,
          y: 0
        }
      });
    });
  }, [offsetRelativeToDocument, state.radius]);
  (0, _react.useEffect)(function () {
    if (state.isDragging) {
      window.addEventListener(SLIDER_EVENT.MOVE, onMouseMove, {
        passive: false
      });
      window.addEventListener(SLIDER_EVENT.UP, onMouseUp, {
        passive: false
      });
      return function () {
        window.removeEventListener(SLIDER_EVENT.MOVE, onMouseMove);
        window.removeEventListener(SLIDER_EVENT.UP, onMouseUp);
      };
    }
  }, [state.isDragging, onMouseMove]);

  var styles = _aphrodite.StyleSheet.create({
    circularSlider: {
      position: 'relative',
      display: 'inline-block',
      opacity: 0,
      transition: 'opacity 1s ease-in'
    },
    mounted: {
      opacity: 1
    }
  });

  return _react.default.createElement("div", {
    className: (0, _aphrodite.css)(styles.circularSlider, state.mounted && styles.mounted),
    ref: circularSlider
  }, _react.default.createElement(_Svg.default, {
    width: width,
    strokeDasharray: state.dashFullArray,
    strokeDashoffset: state.dashFullOffset,
    progressColors: progressColors,
    trackColor: trackColor,
    progressSize: progressSize,
    trackSize: trackSize,
    svgFullPath: svgFullPath
  }), _react.default.createElement(_Knob.default, {
    isDragging: state.isDragging,
    knobPosition: {
      x: state.knob.x,
      y: state.knob.y
    },
    knobColor: knobColor,
    onMouseDown: onMouseDown
  }), _react.default.createElement(_Labels.default, {
    labelColor: labelColor,
    label: label,
    value: "".concat(state.degrees)
  }));
};

var _default = CircularSlider;
exports.default = _default;
