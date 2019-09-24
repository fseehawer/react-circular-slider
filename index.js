"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _aphrodite = require("aphrodite");

var _CircularSlider = _interopRequireDefault(require("./CircularSlider"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var App = function App() {
  var styles = _aphrodite.StyleSheet.create({
    wrapper: {
      marginTop: '4rem',
      textAlign: 'center'
    }
  });

  var onChange = function onChange(deg) {
    console.log(deg);
  };

  return _react.default.createElement("div", {
    className: (0, _aphrodite.css)(styles.wrapper)
  }, _react.default.createElement(_CircularSlider.default, {
    onChange: onChange
  }));
};

var _default = App;
exports.default = _default;
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
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _aphrodite = require("aphrodite");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Knob = function Knob(props) {
  var isDragging = props.isDragging,
      knobPosition = props.knobPosition,
      knobColor = props.knobColor,
      _props$knobRadius = props.knobRadius,
      knobRadius = _props$knobRadius === void 0 ? 12 : _props$knobRadius,
      _props$knobSize = props.knobSize,
      knobSize = _props$knobSize === void 0 ? 36 : _props$knobSize,
      onMouseDown = props.onMouseDown;
  var pulse_animation = {
    "0%": {
      transform: "scale(1)"
    },
    "50%": {
      transform: "scale(0.8)"
    },
    "100%": {
      transform: "scale(1)"
    }
  };

  var styles = _aphrodite.StyleSheet.create({
    knob: {
      position: 'absolute',
      left: "-".concat(knobSize / 2, "px"),
      top: "-".concat(knobSize / 2, "px"),
      cursor: 'grab',
      zIndex: 3
    },
    dragging: {
      cursor: 'grabbing'
    },
    pause: {
      animationPlayState: 'paused'
    },
    animation: {
      animationDuration: '1500ms',
      transformOrigin: '50% 50%',
      animationIterationCount: 'infinite',
      animationTimingFunction: 'ease-out',
      animationName: [pulse_animation]
    }
  });

  return _react.default.createElement("div", {
    style: {
      transform: "translate(".concat(knobPosition.x, "px, ").concat(knobPosition.y, "px)")
    },
    className: (0, _aphrodite.css)(styles.knob, isDragging && styles.dragging),
    onMouseDown: onMouseDown,
    onTouchStart: onMouseDown
  }, _react.default.createElement("svg", {
    width: "".concat(knobSize, "px"),
    height: "".concat(knobSize, "px"),
    viewBox: "0 0 ".concat(knobSize, " ").concat(knobSize)
  }, _react.default.createElement("circle", {
    className: (0, _aphrodite.css)(styles.animation, isDragging && styles.pause),
    fill: knobColor,
    fillOpacity: "0.2",
    stroke: "none",
    cx: knobSize / 2,
    cy: knobSize / 2,
    r: knobSize / 2
  }), _react.default.createElement("circle", {
    fill: knobColor,
    stroke: "none",
    cx: knobSize / 2,
    cy: knobSize / 2,
    r: knobRadius
  }), _react.default.createElement("rect", {
    fill: "#FFFFFF",
    x: "14",
    y: "14",
    width: "8",
    height: "1"
  }), _react.default.createElement("rect", {
    fill: "#FFFFFF",
    x: "14",
    y: "17",
    width: "8",
    height: "1"
  }), _react.default.createElement("rect", {
    fill: "#FFFFFF",
    x: "14",
    y: "20",
    width: "8",
    height: "1"
  })));
};

var _default = Knob;
exports.default = _default;
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _aphrodite = require("aphrodite");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Labels = function Labels(props) {
  var labelColor = props.labelColor,
      label = props.label,
      value = props.value;

  var styles = _aphrodite.StyleSheet.create({
    labels: {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      color: "".concat(labelColor),
      zIndex: 1
    },
    value: {
      fontSize: '4rem',
      marginBottom: '2rem'
    },
    description: {
      fontSize: '1rem',
      textTransform: 'uppercase'
    }
  });

  return _react.default.createElement("div", {
    className: (0, _aphrodite.css)(styles.labels)
  }, _react.default.createElement("div", {
    className: (0, _aphrodite.css)(styles.description)
  }, label), _react.default.createElement("div", {
    className: (0, _aphrodite.css)(styles.value)
  }, _react.default.createElement("code", null, value)));
};

var _default = Labels;
exports.default = _default;
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _aphrodite = require("aphrodite");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Svg = function Svg(props) {
  var width = props.width,
      strokeDasharray = props.strokeDasharray,
      strokeDashoffset = props.strokeDashoffset,
      progressColors = props.progressColors,
      trackColor = props.trackColor,
      progressSize = props.progressSize,
      trackSize = props.trackSize,
      svgFullPath = props.svgFullPath;

  var styles = _aphrodite.StyleSheet.create({
    svg: {
      position: 'relative',
      zIndex: 2
    }
  });

  return _react.default.createElement("svg", {
    width: "".concat(width, "px"),
    height: "".concat(width, "px"),
    viewBox: "0 0 ".concat(width, " ").concat(width),
    overflow: "visible",
    className: (0, _aphrodite.css)(styles.svg)
  }, _react.default.createElement("defs", null, _react.default.createElement("linearGradient", {
    id: "gradient",
    x1: "100%",
    x2: "0%"
  }, _react.default.createElement("stop", {
    offset: "0%",
    stopColor: progressColors.from
  }), _react.default.createElement("stop", {
    offset: "100%",
    stopColor: progressColors.to
  }))), _react.default.createElement("circle", {
    strokeWidth: trackSize,
    fill: "none",
    stroke: trackColor,
    cx: width / 2,
    cy: width / 2,
    r: width / 2
  }), _react.default.createElement("path", {
    ref: svgFullPath,
    strokeDasharray: strokeDasharray,
    strokeDashoffset: strokeDashoffset,
    strokeWidth: progressSize,
    strokeLinecap: "round",
    fill: "none",
    stroke: "url(#gradient)",
    d: "\n                        M ".concat(width / 2, ", ").concat(width / 2, "\n                        m 0, -").concat(width / 2, "\n                        a ").concat(width / 2, ",").concat(width / 2, " 0 0,1 0,").concat(width, "\n                        a -").concat(width / 2, ",-").concat(width / 2, " 0 0,1 0,-").concat(width, "\n                    ")
  }));
};

var _default = Svg;
exports.default = _default;
"use strict";

var _react = _interopRequireDefault(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

require("./index.css");

var _App = _interopRequireDefault(require("./App"));

var serviceWorker = _interopRequireWildcard(require("./serviceWorker"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; if (obj != null) { var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_reactDom.default.render(_react.default.createElement(_App.default, null), document.getElementById('root')); // If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA


serviceWorker.unregister();
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.register = register;
exports.unregister = unregister;
// This optional code is used to register a service worker.
// register() is not called by default.
// This lets the app load faster on subsequent visits in production, and gives
// it offline capabilities. However, it also means that developers (and users)
// will only see deployed updates on subsequent visits to a page, after all the
// existing tabs open on the page have been closed, since previously cached
// resources are updated in the background.
// To learn more about the benefits of this model and instructions on how to
// opt-in, read https://bit.ly/CRA-PWA
var isLocalhost = Boolean(window.location.hostname === 'localhost' || // [::1] is the IPv6 localhost address.
window.location.hostname === '[::1]' || // 127.0.0.1/8 is considered localhost for IPv4.
window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));

function register(config) {
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    // The URL constructor is available in all browsers that support SW.
    var publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);

    if (publicUrl.origin !== window.location.origin) {
      // Our service worker won't work if PUBLIC_URL is on a different origin
      // from what our page is served on. This might happen if a CDN is used to
      // serve assets; see https://github.com/facebook/create-react-app/issues/2374
      return;
    }

    window.addEventListener('load', function () {
      var swUrl = "".concat(process.env.PUBLIC_URL, "/service-worker.js");

      if (isLocalhost) {
        // This is running on localhost. Let's check if a service worker still exists or not.
        checkValidServiceWorker(swUrl, config); // Add some additional logging to localhost, pointing developers to the
        // service worker/PWA documentation.

        navigator.serviceWorker.ready.then(function () {
          console.log('This web app is being served cache-first by a service ' + 'worker. To learn more, visit https://bit.ly/CRA-PWA');
        });
      } else {
        // Is not localhost. Just register service worker
        registerValidSW(swUrl, config);
      }
    });
  }
}

function registerValidSW(swUrl, config) {
  navigator.serviceWorker.register(swUrl).then(function (registration) {
    registration.onupdatefound = function () {
      var installingWorker = registration.installing;

      if (installingWorker == null) {
        return;
      }

      installingWorker.onstatechange = function () {
        if (installingWorker.state === 'installed') {
          if (navigator.serviceWorker.controller) {
            // At this point, the updated precached content has been fetched,
            // but the previous service worker will still serve the older
            // content until all client tabs are closed.
            console.log('New content is available and will be used when all ' + 'tabs for this page are closed. See https://bit.ly/CRA-PWA.'); // Execute callback

            if (config && config.onUpdate) {
              config.onUpdate(registration);
            }
          } else {
            // At this point, everything has been precached.
            // It's the perfect time to display a
            // "Content is cached for offline use." message.
            console.log('Content is cached for offline use.'); // Execute callback

            if (config && config.onSuccess) {
              config.onSuccess(registration);
            }
          }
        }
      };
    };
  }).catch(function (error) {
    console.error('Error during service worker registration:', error);
  });
}

function checkValidServiceWorker(swUrl, config) {
  // Check if the service worker can be found. If it can't reload the page.
  fetch(swUrl).then(function (response) {
    // Ensure service worker exists, and that we really are getting a JS file.
    var contentType = response.headers.get('content-type');

    if (response.status === 404 || contentType != null && contentType.indexOf('javascript') === -1) {
      // No service worker found. Probably a different app. Reload the page.
      navigator.serviceWorker.ready.then(function (registration) {
        registration.unregister().then(function () {
          window.location.reload();
        });
      });
    } else {
      // Service worker found. Proceed as normal.
      registerValidSW(swUrl, config);
    }
  }).catch(function () {
    console.log('No internet connection found. App is running in offline mode.');
  });
}

function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(function (registration) {
      registration.unregister();
    });
  }
}
