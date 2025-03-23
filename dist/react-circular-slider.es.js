import yr, { useRef as Ce, useEffect as Te, useState as ir, useReducer as vr, useCallback as Ue } from "react";
var Ve = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function ur(r) {
  return r && r.__esModule && Object.prototype.hasOwnProperty.call(r, "default") ? r.default : r;
}
var Pe = { exports: {} }, Oe = {};
/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Be;
function br() {
  if (Be) return Oe;
  Be = 1;
  var r = Symbol.for("react.transitional.element"), p = Symbol.for("react.fragment");
  function f(u, y, d) {
    var h = null;
    if (d !== void 0 && (h = "" + d), y.key !== void 0 && (h = "" + y.key), "key" in y) {
      d = {};
      for (var v in y)
        v !== "key" && (d[v] = y[v]);
    } else d = y;
    return y = d.ref, {
      $$typeof: r,
      type: u,
      key: h,
      ref: y !== void 0 ? y : null,
      props: d
    };
  }
  return Oe.Fragment = p, Oe.jsx = f, Oe.jsxs = f, Oe;
}
var Re = {};
/**
 * @license React
 * react-jsx-runtime.development.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var ze;
function gr() {
  return ze || (ze = 1, process.env.NODE_ENV !== "production" && function() {
    function r(e) {
      if (e == null) return null;
      if (typeof e == "function")
        return e.$$typeof === ye ? null : e.displayName || e.name || null;
      if (typeof e == "string") return e;
      switch (e) {
        case G:
          return "Fragment";
        case s:
          return "Portal";
        case le:
          return "Profiler";
        case ce:
          return "StrictMode";
        case oe:
          return "Suspense";
        case Q:
          return "SuspenseList";
      }
      if (typeof e == "object")
        switch (typeof e.tag == "number" && console.error(
          "Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."
        ), e.$$typeof) {
          case ne:
            return (e.displayName || "Context") + ".Provider";
          case fe:
            return (e._context.displayName || "Context") + ".Consumer";
          case Z:
            var l = e.render;
            return e = e.displayName, e || (e = l.displayName || l.name || "", e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef"), e;
          case ae:
            return l = e.displayName || null, l !== null ? l : r(e.type) || "Memo";
          case pe:
            l = e._payload, e = e._init;
            try {
              return r(e(l));
            } catch {
            }
        }
      return null;
    }
    function p(e) {
      return "" + e;
    }
    function f(e) {
      try {
        p(e);
        var l = !1;
      } catch {
        l = !0;
      }
      if (l) {
        l = console;
        var i = l.error, w = typeof Symbol == "function" && Symbol.toStringTag && e[Symbol.toStringTag] || e.constructor.name || "Object";
        return i.call(
          l,
          "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.",
          w
        ), p(e);
      }
    }
    function u() {
    }
    function y() {
      if (n === 0) {
        E = console.log, T = console.info, x = console.warn, _ = console.error, j = console.group, P = console.groupCollapsed, X = console.groupEnd;
        var e = {
          configurable: !0,
          enumerable: !0,
          value: u,
          writable: !0
        };
        Object.defineProperties(console, {
          info: e,
          log: e,
          warn: e,
          error: e,
          group: e,
          groupCollapsed: e,
          groupEnd: e
        });
      }
      n++;
    }
    function d() {
      if (n--, n === 0) {
        var e = { configurable: !0, enumerable: !0, writable: !0 };
        Object.defineProperties(console, {
          log: o({}, e, { value: E }),
          info: o({}, e, { value: T }),
          warn: o({}, e, { value: x }),
          error: o({}, e, { value: _ }),
          group: o({}, e, { value: j }),
          groupCollapsed: o({}, e, { value: P }),
          groupEnd: o({}, e, { value: X })
        });
      }
      0 > n && console.error(
        "disabledDepth fell below zero. This is a bug in React. Please file an issue."
      );
    }
    function h(e) {
      if (a === void 0)
        try {
          throw Error();
        } catch (i) {
          var l = i.stack.trim().match(/\n( *(at )?)/);
          a = l && l[1] || "", J = -1 < i.stack.indexOf(`
    at`) ? " (<anonymous>)" : -1 < i.stack.indexOf("@") ? "@unknown:0:0" : "";
        }
      return `
` + a + e + J;
    }
    function v(e, l) {
      if (!e || ue) return "";
      var i = ve.get(e);
      if (i !== void 0) return i;
      ue = !0, i = Error.prepareStackTrace, Error.prepareStackTrace = void 0;
      var w = null;
      w = V.H, V.H = null, y();
      try {
        var B = {
          DetermineComponentFrameRoot: function() {
            try {
              if (l) {
                var he = function() {
                  throw Error();
                };
                if (Object.defineProperty(he.prototype, "props", {
                  set: function() {
                    throw Error();
                  }
                }), typeof Reflect == "object" && Reflect.construct) {
                  try {
                    Reflect.construct(he, []);
                  } catch (be) {
                    var Se = be;
                  }
                  Reflect.construct(e, [], he);
                } else {
                  try {
                    he.call();
                  } catch (be) {
                    Se = be;
                  }
                  e.call(he.prototype);
                }
              } else {
                try {
                  throw Error();
                } catch (be) {
                  Se = be;
                }
                (he = e()) && typeof he.catch == "function" && he.catch(function() {
                });
              }
            } catch (be) {
              if (be && Se && typeof be.stack == "string")
                return [be.stack, Se.stack];
            }
            return [null, null];
          }
        };
        B.DetermineComponentFrameRoot.displayName = "DetermineComponentFrameRoot";
        var Y = Object.getOwnPropertyDescriptor(
          B.DetermineComponentFrameRoot,
          "name"
        );
        Y && Y.configurable && Object.defineProperty(
          B.DetermineComponentFrameRoot,
          "name",
          { value: "DetermineComponentFrameRoot" }
        );
        var m = B.DetermineComponentFrameRoot(), H = m[0], me = m[1];
        if (H && me) {
          var K = H.split(`
`), Ee = me.split(`
`);
          for (m = Y = 0; Y < K.length && !K[Y].includes(
            "DetermineComponentFrameRoot"
          ); )
            Y++;
          for (; m < Ee.length && !Ee[m].includes(
            "DetermineComponentFrameRoot"
          ); )
            m++;
          if (Y === K.length || m === Ee.length)
            for (Y = K.length - 1, m = Ee.length - 1; 1 <= Y && 0 <= m && K[Y] !== Ee[m]; )
              m--;
          for (; 1 <= Y && 0 <= m; Y--, m--)
            if (K[Y] !== Ee[m]) {
              if (Y !== 1 || m !== 1)
                do
                  if (Y--, m--, 0 > m || K[Y] !== Ee[m]) {
                    var xe = `
` + K[Y].replace(
                      " at new ",
                      " at "
                    );
                    return e.displayName && xe.includes("<anonymous>") && (xe = xe.replace("<anonymous>", e.displayName)), typeof e == "function" && ve.set(e, xe), xe;
                  }
                while (1 <= Y && 0 <= m);
              break;
            }
        }
      } finally {
        ue = !1, V.H = w, d(), Error.prepareStackTrace = i;
      }
      return K = (K = e ? e.displayName || e.name : "") ? h(K) : "", typeof e == "function" && ve.set(e, K), K;
    }
    function C(e) {
      if (e == null) return "";
      if (typeof e == "function") {
        var l = e.prototype;
        return v(
          e,
          !(!l || !l.isReactComponent)
        );
      }
      if (typeof e == "string") return h(e);
      switch (e) {
        case oe:
          return h("Suspense");
        case Q:
          return h("SuspenseList");
      }
      if (typeof e == "object")
        switch (e.$$typeof) {
          case Z:
            return e = v(e.render, !1), e;
          case ae:
            return C(e.type);
          case pe:
            l = e._payload, e = e._init;
            try {
              return C(e(l));
            } catch {
            }
        }
      return "";
    }
    function O() {
      var e = V.A;
      return e === null ? null : e.getOwner();
    }
    function b(e) {
      if (t.call(e, "key")) {
        var l = Object.getOwnPropertyDescriptor(e, "key").get;
        if (l && l.isReactWarning) return !1;
      }
      return e.key !== void 0;
    }
    function A(e, l) {
      function i() {
        F || (F = !0, console.error(
          "%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)",
          l
        ));
      }
      i.isReactWarning = !0, Object.defineProperty(e, "key", {
        get: i,
        configurable: !0
      });
    }
    function D() {
      var e = r(this.type);
      return I[e] || (I[e] = !0, console.error(
        "Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."
      )), e = this.props.ref, e !== void 0 ? e : null;
    }
    function W(e, l, i, w, B, Y) {
      return i = Y.ref, e = {
        $$typeof: S,
        type: e,
        key: l,
        props: Y,
        _owner: B
      }, (i !== void 0 ? i : null) !== null ? Object.defineProperty(e, "ref", {
        enumerable: !1,
        get: D
      }) : Object.defineProperty(e, "ref", { enumerable: !1, value: null }), e._store = {}, Object.defineProperty(e._store, "validated", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: 0
      }), Object.defineProperty(e, "_debugInfo", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: null
      }), Object.freeze && (Object.freeze(e.props), Object.freeze(e)), e;
    }
    function z(e, l, i, w, B, Y) {
      if (typeof e == "string" || typeof e == "function" || e === G || e === le || e === ce || e === oe || e === Q || e === ee || typeof e == "object" && e !== null && (e.$$typeof === pe || e.$$typeof === ae || e.$$typeof === ne || e.$$typeof === fe || e.$$typeof === Z || e.$$typeof === R || e.getModuleId !== void 0)) {
        var m = l.children;
        if (m !== void 0)
          if (w)
            if (g(m)) {
              for (w = 0; w < m.length; w++)
                M(m[w], e);
              Object.freeze && Object.freeze(m);
            } else
              console.error(
                "React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead."
              );
          else M(m, e);
      } else
        m = "", (e === void 0 || typeof e == "object" && e !== null && Object.keys(e).length === 0) && (m += " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports."), e === null ? w = "null" : g(e) ? w = "array" : e !== void 0 && e.$$typeof === S ? (w = "<" + (r(e.type) || "Unknown") + " />", m = " Did you accidentally export a JSX literal instead of a component?") : w = typeof e, console.error(
          "React.jsx: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s",
          w,
          m
        );
      if (t.call(l, "key")) {
        m = r(e);
        var H = Object.keys(l).filter(function(K) {
          return K !== "key";
        });
        w = 0 < H.length ? "{key: someKey, " + H.join(": ..., ") + ": ...}" : "{key: someKey}", se[m + w] || (H = 0 < H.length ? "{" + H.join(": ..., ") + ": ...}" : "{}", console.error(
          `A props object containing a "key" prop is being spread into JSX:
  let props = %s;
  <%s {...props} />
React keys must be passed directly to JSX without using spread:
  let props = %s;
  <%s key={someKey} {...props} />`,
          w,
          m,
          H,
          m
        ), se[m + w] = !0);
      }
      if (m = null, i !== void 0 && (f(i), m = "" + i), b(l) && (f(l.key), m = "" + l.key), "key" in l) {
        i = {};
        for (var me in l)
          me !== "key" && (i[me] = l[me]);
      } else i = l;
      return m && A(
        i,
        typeof e == "function" ? e.displayName || e.name || "Unknown" : e
      ), W(e, m, Y, B, O(), i);
    }
    function M(e, l) {
      if (typeof e == "object" && e && e.$$typeof !== ke) {
        if (g(e))
          for (var i = 0; i < e.length; i++) {
            var w = e[i];
            L(w) && N(w, l);
          }
        else if (L(e))
          e._store && (e._store.validated = 1);
        else if (e === null || typeof e != "object" ? i = null : (i = re && e[re] || e["@@iterator"], i = typeof i == "function" ? i : null), typeof i == "function" && i !== e.entries && (i = i.call(e), i !== e))
          for (; !(e = i.next()).done; )
            L(e.value) && N(e.value, l);
      }
    }
    function L(e) {
      return typeof e == "object" && e !== null && e.$$typeof === S;
    }
    function N(e, l) {
      if (e._store && !e._store.validated && e.key == null && (e._store.validated = 1, l = ie(l), !te[l])) {
        te[l] = !0;
        var i = "";
        e && e._owner != null && e._owner !== O() && (i = null, typeof e._owner.tag == "number" ? i = r(e._owner.type) : typeof e._owner.name == "string" && (i = e._owner.name), i = " It was passed a child from " + i + ".");
        var w = V.getCurrentStack;
        V.getCurrentStack = function() {
          var B = C(e.type);
          return w && (B += w() || ""), B;
        }, console.error(
          'Each child in a list should have a unique "key" prop.%s%s See https://react.dev/link/warning-keys for more information.',
          l,
          i
        ), V.getCurrentStack = w;
      }
    }
    function ie(e) {
      var l = "", i = O();
      return i && (i = r(i.type)) && (l = `

Check the render method of \`` + i + "`."), l || (e = r(e)) && (l = `

Check the top-level render call using <` + e + ">."), l;
    }
    var U = yr, S = Symbol.for("react.transitional.element"), s = Symbol.for("react.portal"), G = Symbol.for("react.fragment"), ce = Symbol.for("react.strict_mode"), le = Symbol.for("react.profiler"), fe = Symbol.for("react.consumer"), ne = Symbol.for("react.context"), Z = Symbol.for("react.forward_ref"), oe = Symbol.for("react.suspense"), Q = Symbol.for("react.suspense_list"), ae = Symbol.for("react.memo"), pe = Symbol.for("react.lazy"), ee = Symbol.for("react.offscreen"), re = Symbol.iterator, ye = Symbol.for("react.client.reference"), V = U.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, t = Object.prototype.hasOwnProperty, o = Object.assign, R = Symbol.for("react.client.reference"), g = Array.isArray, n = 0, E, T, x, _, j, P, X;
    u.__reactDisabledLog = !0;
    var a, J, ue = !1, ve = new (typeof WeakMap == "function" ? WeakMap : Map)(), ke = Symbol.for("react.client.reference"), F, I = {}, se = {}, te = {};
    Re.Fragment = G, Re.jsx = function(e, l, i, w, B) {
      return z(e, l, i, !1, w, B);
    }, Re.jsxs = function(e, l, i, w, B) {
      return z(e, l, i, !0, w, B);
    };
  }()), Re;
}
var Xe;
function mr() {
  return Xe || (Xe = 1, process.env.NODE_ENV === "production" ? Pe.exports = br() : Pe.exports = gr()), Pe.exports;
}
var q = mr(), $e, Ke;
function hr() {
  if (Ke) return $e;
  Ke = 1;
  var r;
  return typeof window < "u" ? r = window : typeof Ve < "u" ? r = Ve : typeof self < "u" ? r = self : r = {}, $e = r, $e;
}
var Er = hr();
const de = /* @__PURE__ */ ur(Er);
var we = { exports: {} }, je = { exports: {} }, k = {};
/** @license React v16.13.1
 * react-is.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Je;
function Tr() {
  if (Je) return k;
  Je = 1;
  var r = typeof Symbol == "function" && Symbol.for, p = r ? Symbol.for("react.element") : 60103, f = r ? Symbol.for("react.portal") : 60106, u = r ? Symbol.for("react.fragment") : 60107, y = r ? Symbol.for("react.strict_mode") : 60108, d = r ? Symbol.for("react.profiler") : 60114, h = r ? Symbol.for("react.provider") : 60109, v = r ? Symbol.for("react.context") : 60110, C = r ? Symbol.for("react.async_mode") : 60111, O = r ? Symbol.for("react.concurrent_mode") : 60111, b = r ? Symbol.for("react.forward_ref") : 60112, A = r ? Symbol.for("react.suspense") : 60113, D = r ? Symbol.for("react.suspense_list") : 60120, W = r ? Symbol.for("react.memo") : 60115, z = r ? Symbol.for("react.lazy") : 60116, M = r ? Symbol.for("react.block") : 60121, L = r ? Symbol.for("react.fundamental") : 60117, N = r ? Symbol.for("react.responder") : 60118, ie = r ? Symbol.for("react.scope") : 60119;
  function U(s) {
    if (typeof s == "object" && s !== null) {
      var G = s.$$typeof;
      switch (G) {
        case p:
          switch (s = s.type, s) {
            case C:
            case O:
            case u:
            case d:
            case y:
            case A:
              return s;
            default:
              switch (s = s && s.$$typeof, s) {
                case v:
                case b:
                case z:
                case W:
                case h:
                  return s;
                default:
                  return G;
              }
          }
        case f:
          return G;
      }
    }
  }
  function S(s) {
    return U(s) === O;
  }
  return k.AsyncMode = C, k.ConcurrentMode = O, k.ContextConsumer = v, k.ContextProvider = h, k.Element = p, k.ForwardRef = b, k.Fragment = u, k.Lazy = z, k.Memo = W, k.Portal = f, k.Profiler = d, k.StrictMode = y, k.Suspense = A, k.isAsyncMode = function(s) {
    return S(s) || U(s) === C;
  }, k.isConcurrentMode = S, k.isContextConsumer = function(s) {
    return U(s) === v;
  }, k.isContextProvider = function(s) {
    return U(s) === h;
  }, k.isElement = function(s) {
    return typeof s == "object" && s !== null && s.$$typeof === p;
  }, k.isForwardRef = function(s) {
    return U(s) === b;
  }, k.isFragment = function(s) {
    return U(s) === u;
  }, k.isLazy = function(s) {
    return U(s) === z;
  }, k.isMemo = function(s) {
    return U(s) === W;
  }, k.isPortal = function(s) {
    return U(s) === f;
  }, k.isProfiler = function(s) {
    return U(s) === d;
  }, k.isStrictMode = function(s) {
    return U(s) === y;
  }, k.isSuspense = function(s) {
    return U(s) === A;
  }, k.isValidElementType = function(s) {
    return typeof s == "string" || typeof s == "function" || s === u || s === O || s === d || s === y || s === A || s === D || typeof s == "object" && s !== null && (s.$$typeof === z || s.$$typeof === W || s.$$typeof === h || s.$$typeof === v || s.$$typeof === b || s.$$typeof === L || s.$$typeof === N || s.$$typeof === ie || s.$$typeof === M);
  }, k.typeOf = U, k;
}
var $ = {};
/** @license React v16.13.1
 * react-is.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Ge;
function xr() {
  return Ge || (Ge = 1, process.env.NODE_ENV !== "production" && function() {
    var r = typeof Symbol == "function" && Symbol.for, p = r ? Symbol.for("react.element") : 60103, f = r ? Symbol.for("react.portal") : 60106, u = r ? Symbol.for("react.fragment") : 60107, y = r ? Symbol.for("react.strict_mode") : 60108, d = r ? Symbol.for("react.profiler") : 60114, h = r ? Symbol.for("react.provider") : 60109, v = r ? Symbol.for("react.context") : 60110, C = r ? Symbol.for("react.async_mode") : 60111, O = r ? Symbol.for("react.concurrent_mode") : 60111, b = r ? Symbol.for("react.forward_ref") : 60112, A = r ? Symbol.for("react.suspense") : 60113, D = r ? Symbol.for("react.suspense_list") : 60120, W = r ? Symbol.for("react.memo") : 60115, z = r ? Symbol.for("react.lazy") : 60116, M = r ? Symbol.for("react.block") : 60121, L = r ? Symbol.for("react.fundamental") : 60117, N = r ? Symbol.for("react.responder") : 60118, ie = r ? Symbol.for("react.scope") : 60119;
    function U(a) {
      return typeof a == "string" || typeof a == "function" || // Note: its typeof might be other than 'symbol' or 'number' if it's a polyfill.
      a === u || a === O || a === d || a === y || a === A || a === D || typeof a == "object" && a !== null && (a.$$typeof === z || a.$$typeof === W || a.$$typeof === h || a.$$typeof === v || a.$$typeof === b || a.$$typeof === L || a.$$typeof === N || a.$$typeof === ie || a.$$typeof === M);
    }
    function S(a) {
      if (typeof a == "object" && a !== null) {
        var J = a.$$typeof;
        switch (J) {
          case p:
            var ue = a.type;
            switch (ue) {
              case C:
              case O:
              case u:
              case d:
              case y:
              case A:
                return ue;
              default:
                var ve = ue && ue.$$typeof;
                switch (ve) {
                  case v:
                  case b:
                  case z:
                  case W:
                  case h:
                    return ve;
                  default:
                    return J;
                }
            }
          case f:
            return J;
        }
      }
    }
    var s = C, G = O, ce = v, le = h, fe = p, ne = b, Z = u, oe = z, Q = W, ae = f, pe = d, ee = y, re = A, ye = !1;
    function V(a) {
      return ye || (ye = !0, console.warn("The ReactIs.isAsyncMode() alias has been deprecated, and will be removed in React 17+. Update your code to use ReactIs.isConcurrentMode() instead. It has the exact same API.")), t(a) || S(a) === C;
    }
    function t(a) {
      return S(a) === O;
    }
    function o(a) {
      return S(a) === v;
    }
    function R(a) {
      return S(a) === h;
    }
    function g(a) {
      return typeof a == "object" && a !== null && a.$$typeof === p;
    }
    function n(a) {
      return S(a) === b;
    }
    function E(a) {
      return S(a) === u;
    }
    function T(a) {
      return S(a) === z;
    }
    function x(a) {
      return S(a) === W;
    }
    function _(a) {
      return S(a) === f;
    }
    function j(a) {
      return S(a) === d;
    }
    function P(a) {
      return S(a) === y;
    }
    function X(a) {
      return S(a) === A;
    }
    $.AsyncMode = s, $.ConcurrentMode = G, $.ContextConsumer = ce, $.ContextProvider = le, $.Element = fe, $.ForwardRef = ne, $.Fragment = Z, $.Lazy = oe, $.Memo = Q, $.Portal = ae, $.Profiler = pe, $.StrictMode = ee, $.Suspense = re, $.isAsyncMode = V, $.isConcurrentMode = t, $.isContextConsumer = o, $.isContextProvider = R, $.isElement = g, $.isForwardRef = n, $.isFragment = E, $.isLazy = T, $.isMemo = x, $.isPortal = _, $.isProfiler = j, $.isStrictMode = P, $.isSuspense = X, $.isValidElementType = U, $.typeOf = S;
  }()), $;
}
var He;
function cr() {
  return He || (He = 1, process.env.NODE_ENV === "production" ? je.exports = Tr() : je.exports = xr()), je.exports;
}
/*
object-assign
(c) Sindre Sorhus
@license MIT
*/
var Fe, Ze;
function Or() {
  if (Ze) return Fe;
  Ze = 1;
  var r = Object.getOwnPropertySymbols, p = Object.prototype.hasOwnProperty, f = Object.prototype.propertyIsEnumerable;
  function u(d) {
    if (d == null)
      throw new TypeError("Object.assign cannot be called with null or undefined");
    return Object(d);
  }
  function y() {
    try {
      if (!Object.assign)
        return !1;
      var d = new String("abc");
      if (d[5] = "de", Object.getOwnPropertyNames(d)[0] === "5")
        return !1;
      for (var h = {}, v = 0; v < 10; v++)
        h["_" + String.fromCharCode(v)] = v;
      var C = Object.getOwnPropertyNames(h).map(function(b) {
        return h[b];
      });
      if (C.join("") !== "0123456789")
        return !1;
      var O = {};
      return "abcdefghijklmnopqrst".split("").forEach(function(b) {
        O[b] = b;
      }), Object.keys(Object.assign({}, O)).join("") === "abcdefghijklmnopqrst";
    } catch {
      return !1;
    }
  }
  return Fe = y() ? Object.assign : function(d, h) {
    for (var v, C = u(d), O, b = 1; b < arguments.length; b++) {
      v = Object(arguments[b]);
      for (var A in v)
        p.call(v, A) && (C[A] = v[A]);
      if (r) {
        O = r(v);
        for (var D = 0; D < O.length; D++)
          f.call(v, O[D]) && (C[O[D]] = v[O[D]]);
      }
    }
    return C;
  }, Fe;
}
var Ie, Qe;
function Le() {
  if (Qe) return Ie;
  Qe = 1;
  var r = "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED";
  return Ie = r, Ie;
}
var Ye, er;
function lr() {
  return er || (er = 1, Ye = Function.call.bind(Object.prototype.hasOwnProperty)), Ye;
}
var Ne, rr;
function Rr() {
  if (rr) return Ne;
  rr = 1;
  var r = function() {
  };
  if (process.env.NODE_ENV !== "production") {
    var p = /* @__PURE__ */ Le(), f = {}, u = /* @__PURE__ */ lr();
    r = function(d) {
      var h = "Warning: " + d;
      typeof console < "u" && console.error(h);
      try {
        throw new Error(h);
      } catch {
      }
    };
  }
  function y(d, h, v, C, O) {
    if (process.env.NODE_ENV !== "production") {
      for (var b in d)
        if (u(d, b)) {
          var A;
          try {
            if (typeof d[b] != "function") {
              var D = Error(
                (C || "React class") + ": " + v + " type `" + b + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof d[b] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`."
              );
              throw D.name = "Invariant Violation", D;
            }
            A = d[b](h, b, C, v, null, p);
          } catch (z) {
            A = z;
          }
          if (A && !(A instanceof Error) && r(
            (C || "React class") + ": type specification of " + v + " `" + b + "` is invalid; the type checker function must return `null` or an `Error` but returned a " + typeof A + ". You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument)."
          ), A instanceof Error && !(A.message in f)) {
            f[A.message] = !0;
            var W = O ? O() : "";
            r(
              "Failed " + v + " type: " + A.message + (W ?? "")
            );
          }
        }
    }
  }
  return y.resetWarningCache = function() {
    process.env.NODE_ENV !== "production" && (f = {});
  }, Ne = y, Ne;
}
var qe, tr;
function _r() {
  if (tr) return qe;
  tr = 1;
  var r = cr(), p = Or(), f = /* @__PURE__ */ Le(), u = /* @__PURE__ */ lr(), y = /* @__PURE__ */ Rr(), d = function() {
  };
  process.env.NODE_ENV !== "production" && (d = function(v) {
    var C = "Warning: " + v;
    typeof console < "u" && console.error(C);
    try {
      throw new Error(C);
    } catch {
    }
  });
  function h() {
    return null;
  }
  return qe = function(v, C) {
    var O = typeof Symbol == "function" && Symbol.iterator, b = "@@iterator";
    function A(t) {
      var o = t && (O && t[O] || t[b]);
      if (typeof o == "function")
        return o;
    }
    var D = "<<anonymous>>", W = {
      array: N("array"),
      bigint: N("bigint"),
      bool: N("boolean"),
      func: N("function"),
      number: N("number"),
      object: N("object"),
      string: N("string"),
      symbol: N("symbol"),
      any: ie(),
      arrayOf: U,
      element: S(),
      elementType: s(),
      instanceOf: G,
      node: ne(),
      objectOf: le,
      oneOf: ce,
      oneOfType: fe,
      shape: oe,
      exact: Q
    };
    function z(t, o) {
      return t === o ? t !== 0 || 1 / t === 1 / o : t !== t && o !== o;
    }
    function M(t, o) {
      this.message = t, this.data = o && typeof o == "object" ? o : {}, this.stack = "";
    }
    M.prototype = Error.prototype;
    function L(t) {
      if (process.env.NODE_ENV !== "production")
        var o = {}, R = 0;
      function g(E, T, x, _, j, P, X) {
        if (_ = _ || D, P = P || x, X !== f) {
          if (C) {
            var a = new Error(
              "Calling PropTypes validators directly is not supported by the `prop-types` package. Use `PropTypes.checkPropTypes()` to call them. Read more at http://fb.me/use-check-prop-types"
            );
            throw a.name = "Invariant Violation", a;
          } else if (process.env.NODE_ENV !== "production" && typeof console < "u") {
            var J = _ + ":" + x;
            !o[J] && // Avoid spamming the console because they are often not actionable except for lib authors
            R < 3 && (d(
              "You are manually calling a React.PropTypes validation function for the `" + P + "` prop on `" + _ + "`. This is deprecated and will throw in the standalone `prop-types` package. You may be seeing this warning due to a third-party PropTypes library. See https://fb.me/react-warning-dont-call-proptypes for details."
            ), o[J] = !0, R++);
          }
        }
        return T[x] == null ? E ? T[x] === null ? new M("The " + j + " `" + P + "` is marked as required " + ("in `" + _ + "`, but its value is `null`.")) : new M("The " + j + " `" + P + "` is marked as required in " + ("`" + _ + "`, but its value is `undefined`.")) : null : t(T, x, _, j, P);
      }
      var n = g.bind(null, !1);
      return n.isRequired = g.bind(null, !0), n;
    }
    function N(t) {
      function o(R, g, n, E, T, x) {
        var _ = R[g], j = ee(_);
        if (j !== t) {
          var P = re(_);
          return new M(
            "Invalid " + E + " `" + T + "` of type " + ("`" + P + "` supplied to `" + n + "`, expected ") + ("`" + t + "`."),
            { expectedType: t }
          );
        }
        return null;
      }
      return L(o);
    }
    function ie() {
      return L(h);
    }
    function U(t) {
      function o(R, g, n, E, T) {
        if (typeof t != "function")
          return new M("Property `" + T + "` of component `" + n + "` has invalid PropType notation inside arrayOf.");
        var x = R[g];
        if (!Array.isArray(x)) {
          var _ = ee(x);
          return new M("Invalid " + E + " `" + T + "` of type " + ("`" + _ + "` supplied to `" + n + "`, expected an array."));
        }
        for (var j = 0; j < x.length; j++) {
          var P = t(x, j, n, E, T + "[" + j + "]", f);
          if (P instanceof Error)
            return P;
        }
        return null;
      }
      return L(o);
    }
    function S() {
      function t(o, R, g, n, E) {
        var T = o[R];
        if (!v(T)) {
          var x = ee(T);
          return new M("Invalid " + n + " `" + E + "` of type " + ("`" + x + "` supplied to `" + g + "`, expected a single ReactElement."));
        }
        return null;
      }
      return L(t);
    }
    function s() {
      function t(o, R, g, n, E) {
        var T = o[R];
        if (!r.isValidElementType(T)) {
          var x = ee(T);
          return new M("Invalid " + n + " `" + E + "` of type " + ("`" + x + "` supplied to `" + g + "`, expected a single ReactElement type."));
        }
        return null;
      }
      return L(t);
    }
    function G(t) {
      function o(R, g, n, E, T) {
        if (!(R[g] instanceof t)) {
          var x = t.name || D, _ = V(R[g]);
          return new M("Invalid " + E + " `" + T + "` of type " + ("`" + _ + "` supplied to `" + n + "`, expected ") + ("instance of `" + x + "`."));
        }
        return null;
      }
      return L(o);
    }
    function ce(t) {
      if (!Array.isArray(t))
        return process.env.NODE_ENV !== "production" && (arguments.length > 1 ? d(
          "Invalid arguments supplied to oneOf, expected an array, got " + arguments.length + " arguments. A common mistake is to write oneOf(x, y, z) instead of oneOf([x, y, z])."
        ) : d("Invalid argument supplied to oneOf, expected an array.")), h;
      function o(R, g, n, E, T) {
        for (var x = R[g], _ = 0; _ < t.length; _++)
          if (z(x, t[_]))
            return null;
        var j = JSON.stringify(t, function(X, a) {
          var J = re(a);
          return J === "symbol" ? String(a) : a;
        });
        return new M("Invalid " + E + " `" + T + "` of value `" + String(x) + "` " + ("supplied to `" + n + "`, expected one of " + j + "."));
      }
      return L(o);
    }
    function le(t) {
      function o(R, g, n, E, T) {
        if (typeof t != "function")
          return new M("Property `" + T + "` of component `" + n + "` has invalid PropType notation inside objectOf.");
        var x = R[g], _ = ee(x);
        if (_ !== "object")
          return new M("Invalid " + E + " `" + T + "` of type " + ("`" + _ + "` supplied to `" + n + "`, expected an object."));
        for (var j in x)
          if (u(x, j)) {
            var P = t(x, j, n, E, T + "." + j, f);
            if (P instanceof Error)
              return P;
          }
        return null;
      }
      return L(o);
    }
    function fe(t) {
      if (!Array.isArray(t))
        return process.env.NODE_ENV !== "production" && d("Invalid argument supplied to oneOfType, expected an instance of array."), h;
      for (var o = 0; o < t.length; o++) {
        var R = t[o];
        if (typeof R != "function")
          return d(
            "Invalid argument supplied to oneOfType. Expected an array of check functions, but received " + ye(R) + " at index " + o + "."
          ), h;
      }
      function g(n, E, T, x, _) {
        for (var j = [], P = 0; P < t.length; P++) {
          var X = t[P], a = X(n, E, T, x, _, f);
          if (a == null)
            return null;
          a.data && u(a.data, "expectedType") && j.push(a.data.expectedType);
        }
        var J = j.length > 0 ? ", expected one of type [" + j.join(", ") + "]" : "";
        return new M("Invalid " + x + " `" + _ + "` supplied to " + ("`" + T + "`" + J + "."));
      }
      return L(g);
    }
    function ne() {
      function t(o, R, g, n, E) {
        return ae(o[R]) ? null : new M("Invalid " + n + " `" + E + "` supplied to " + ("`" + g + "`, expected a ReactNode."));
      }
      return L(t);
    }
    function Z(t, o, R, g, n) {
      return new M(
        (t || "React class") + ": " + o + " type `" + R + "." + g + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + n + "`."
      );
    }
    function oe(t) {
      function o(R, g, n, E, T) {
        var x = R[g], _ = ee(x);
        if (_ !== "object")
          return new M("Invalid " + E + " `" + T + "` of type `" + _ + "` " + ("supplied to `" + n + "`, expected `object`."));
        for (var j in t) {
          var P = t[j];
          if (typeof P != "function")
            return Z(n, E, T, j, re(P));
          var X = P(x, j, n, E, T + "." + j, f);
          if (X)
            return X;
        }
        return null;
      }
      return L(o);
    }
    function Q(t) {
      function o(R, g, n, E, T) {
        var x = R[g], _ = ee(x);
        if (_ !== "object")
          return new M("Invalid " + E + " `" + T + "` of type `" + _ + "` " + ("supplied to `" + n + "`, expected `object`."));
        var j = p({}, R[g], t);
        for (var P in j) {
          var X = t[P];
          if (u(t, P) && typeof X != "function")
            return Z(n, E, T, P, re(X));
          if (!X)
            return new M(
              "Invalid " + E + " `" + T + "` key `" + P + "` supplied to `" + n + "`.\nBad object: " + JSON.stringify(R[g], null, "  ") + `
Valid keys: ` + JSON.stringify(Object.keys(t), null, "  ")
            );
          var a = X(x, P, n, E, T + "." + P, f);
          if (a)
            return a;
        }
        return null;
      }
      return L(o);
    }
    function ae(t) {
      switch (typeof t) {
        case "number":
        case "string":
        case "undefined":
          return !0;
        case "boolean":
          return !t;
        case "object":
          if (Array.isArray(t))
            return t.every(ae);
          if (t === null || v(t))
            return !0;
          var o = A(t);
          if (o) {
            var R = o.call(t), g;
            if (o !== t.entries) {
              for (; !(g = R.next()).done; )
                if (!ae(g.value))
                  return !1;
            } else
              for (; !(g = R.next()).done; ) {
                var n = g.value;
                if (n && !ae(n[1]))
                  return !1;
              }
          } else
            return !1;
          return !0;
        default:
          return !1;
      }
    }
    function pe(t, o) {
      return t === "symbol" ? !0 : o ? o["@@toStringTag"] === "Symbol" || typeof Symbol == "function" && o instanceof Symbol : !1;
    }
    function ee(t) {
      var o = typeof t;
      return Array.isArray(t) ? "array" : t instanceof RegExp ? "object" : pe(o, t) ? "symbol" : o;
    }
    function re(t) {
      if (typeof t > "u" || t === null)
        return "" + t;
      var o = ee(t);
      if (o === "object") {
        if (t instanceof Date)
          return "date";
        if (t instanceof RegExp)
          return "regexp";
      }
      return o;
    }
    function ye(t) {
      var o = re(t);
      switch (o) {
        case "array":
        case "object":
          return "an " + o;
        case "boolean":
        case "date":
        case "regexp":
          return "a " + o;
        default:
          return o;
      }
    }
    function V(t) {
      return !t.constructor || !t.constructor.name ? D : t.constructor.name;
    }
    return W.checkPropTypes = y, W.resetWarningCache = y.resetWarningCache, W.PropTypes = W, W;
  }, qe;
}
var De, nr;
function Cr() {
  if (nr) return De;
  nr = 1;
  var r = /* @__PURE__ */ Le();
  function p() {
  }
  function f() {
  }
  return f.resetWarningCache = p, De = function() {
    function u(h, v, C, O, b, A) {
      if (A !== r) {
        var D = new Error(
          "Calling PropTypes validators directly is not supported by the `prop-types` package. Use PropTypes.checkPropTypes() to call them. Read more at http://fb.me/use-check-prop-types"
        );
        throw D.name = "Invariant Violation", D;
      }
    }
    u.isRequired = u;
    function y() {
      return u;
    }
    var d = {
      array: u,
      bigint: u,
      bool: u,
      func: u,
      number: u,
      object: u,
      string: u,
      symbol: u,
      any: u,
      arrayOf: y,
      element: u,
      elementType: u,
      instanceOf: y,
      node: u,
      objectOf: y,
      oneOf: y,
      oneOfType: y,
      shape: y,
      exact: y,
      checkPropTypes: f,
      resetWarningCache: p
    };
    return d.PropTypes = d, d;
  }, De;
}
var or;
function Sr() {
  if (or) return we.exports;
  if (or = 1, process.env.NODE_ENV !== "production") {
    var r = cr(), p = !0;
    we.exports = /* @__PURE__ */ _r()(r.isElement, p);
  } else
    we.exports = /* @__PURE__ */ Cr()();
  return we.exports;
}
var Pr = /* @__PURE__ */ Sr();
const c = /* @__PURE__ */ ur(Pr), wr = (r, p) => {
  switch (p.type) {
    case "init":
      return {
        ...r,
        ...p.payload
      };
    case "setKnobPosition":
      return {
        ...r,
        ...p.payload
      };
    case "onMouseDown":
    case "onMouseUp":
      return {
        ...r,
        ...p.payload
      };
    case "setInitialKnobPosition":
      return {
        ...r,
        ...p.payload
      };
    default:
      throw new Error();
  }
}, Ae = (r, p) => {
  const f = Ce(null);
  Te(() => {
    f.current = p;
  }, [p]), Te(
    () => {
      if (typeof de < "u") {
        const u = (y) => f.current(y);
        return de.addEventListener(r, u, { passive: !1 }), () => {
          de.removeEventListener(r, u);
        };
      }
    },
    [r]
  );
}, jr = () => {
  const [r, p] = ir(!0);
  return Te(() => {
    p(!1);
  }, []), r;
}, fr = ({
  isDragging: r,
  knobPosition: p,
  knobColor: f,
  knobSize: u,
  hideKnob: y,
  hideKnobRing: d,
  knobDraggable: h,
  onMouseDown: v,
  trackSize: C,
  children: O
}) => {
  const b = {
    knob: {
      position: "absolute",
      left: `-${u / 2 - C / 2}px`,
      top: `-${u / 2 - C / 2}px`,
      cursor: "grab",
      zIndex: 3
    },
    dragging: {
      cursor: "grabbing"
    },
    pause: {
      animationPlayState: "paused"
    },
    animation: {
      transformOrigin: "50% 50%",
      animationTimingFunction: "ease-out",
      animationDuration: "1500ms",
      animationIterationCount: "infinite",
      animationName: "pulse"
    },
    hide: {
      opacity: 0
    },
    normalCursor: {
      cursor: "auto"
    }
  };
  return /* @__PURE__ */ q.jsx(
    "div",
    {
      style: {
        transform: `translate(${p.x}px, ${p.y}px)`,
        ...b.knob,
        ...r && b.dragging,
        ...y && b.hide,
        ...!h && b.normalCursor
      },
      onMouseDown: v,
      onTouchStart: v,
      children: /* @__PURE__ */ q.jsxs(
        "svg",
        {
          width: `${u}px`,
          height: `${u}px`,
          viewBox: `0 0 ${u} ${u}`,
          children: [
            !d && /* @__PURE__ */ q.jsx(
              "circle",
              {
                style: { ...b.animation, ...r && b.pause },
                fill: f,
                fillOpacity: "0.2",
                stroke: "none",
                cx: u / 2,
                cy: u / 2,
                r: u / 2
              }
            ),
            /* @__PURE__ */ q.jsx(
              "circle",
              {
                fill: f,
                stroke: "none",
                cx: u / 2,
                cy: u / 2,
                r: u * 2 / 3 / 2
              }
            ),
            O ?? /* @__PURE__ */ q.jsxs(
              "svg",
              {
                width: `${u}px`,
                height: `${u}px`,
                viewBox: "0 0 36 36",
                children: [
                  /* @__PURE__ */ q.jsx("rect", { fill: "#FFFFFF", x: "14", y: "14", width: "8", height: "1" }),
                  /* @__PURE__ */ q.jsx("rect", { fill: "#FFFFFF", x: "14", y: "17", width: "8", height: "1" }),
                  /* @__PURE__ */ q.jsx("rect", { fill: "#FFFFFF", x: "14", y: "20", width: "8", height: "1" })
                ]
              }
            )
          ]
        }
      )
    }
  );
};
fr.propTypes = {
  isDragging: c.bool,
  knobPosition: c.object,
  knobColor: c.string,
  knobRadius: c.number,
  knobSize: c.number,
  hideKnob: c.bool,
  knobDraggable: c.bool,
  trackSize: c.number,
  children: c.element,
  onMouseDown: c.func
};
const dr = ({
  labelColor: r,
  labelBottom: p,
  labelFontSize: f,
  valueFontSize: u,
  appendToValue: y,
  prependToValue: d,
  verticalOffset: h,
  hideLabelValue: v,
  label: C,
  value: O
}) => {
  const b = {
    labels: {
      position: "absolute",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      color: `${r}`,
      userSelect: "none",
      zIndex: 1
    },
    value: {
      fontSize: `${u}`,
      position: "relative"
    },
    bottomMargin: {
      marginBottom: `calc(${h})`
    },
    appended: {
      position: "absolute",
      right: "0",
      top: "0",
      transform: "translate(100%, 0)"
    },
    prepended: {
      position: "absolute",
      left: "0",
      top: "0",
      transform: "translate(-100%, 0)"
    },
    hide: {
      display: "none"
    }
  };
  return /* @__PURE__ */ q.jsxs("div", { style: { ...b.labels, ...v && b.hide }, children: [
    p || /* @__PURE__ */ q.jsx("div", { style: { fontSize: f }, children: C }),
    /* @__PURE__ */ q.jsx(
      "div",
      {
        style: { ...b.value, ...!p && b.bottomMargin },
        children: /* @__PURE__ */ q.jsxs("code", { children: [
          /* @__PURE__ */ q.jsx("span", { style: b.prepended, children: d }),
          O,
          /* @__PURE__ */ q.jsx("span", { style: b.appended, children: y })
        ] })
      }
    ),
    p && /* @__PURE__ */ q.jsx("div", { style: { fontSize: f }, children: C })
  ] });
};
dr.propTypes = {
  label: c.string.isRequired,
  value: c.string.isRequired,
  labelColor: c.string,
  labelBottom: c.bool,
  labelFontSize: c.string,
  valueFontSize: c.string,
  appendToValue: c.string,
  prependToValue: c.string,
  verticalOffset: c.string,
  hideLabelValue: c.bool
};
const pr = ({
  width: r,
  label: p,
  direction: f,
  strokeDasharray: u,
  strokeDashoffset: y,
  progressColorFrom: d,
  progressColorTo: h,
  trackColor: v,
  progressSize: C,
  trackSize: O,
  svgFullPath: b,
  radiansOffset: A,
  progressLineCap: D,
  onMouseDown: W,
  isDragging: z
}) => {
  const M = Ce(null), L = {
    svg: {
      position: "relative",
      zIndex: 2
    },
    path: {
      transform: `rotate(${A}rad) ${f === -1 ? "scale(-1, 1)" : "scale(1, 1)"}`,
      transformOrigin: "center center"
    }
  }, N = O / 2, ie = r / 2 - N, U = (S) => {
    var oe, Q;
    if (!W) return;
    const s = M.current.getBoundingClientRect(), G = (S == null ? void 0 : S.clientX) || ((oe = S == null ? void 0 : S.touches[0]) == null ? void 0 : oe.clientX), ce = S.clientY || ((Q = S == null ? void 0 : S.touches[0]) == null ? void 0 : Q.clientY), le = s.left + s.width / 2, fe = s.top + s.height / 2, ne = Math.sqrt(
      Math.pow(G - le, 2) + Math.pow(ce - fe, 2)
    ), Z = (s.width / z ? 4 : 2) - O;
    ne < Z || W();
  };
  return /* @__PURE__ */ q.jsxs(
    "svg",
    {
      width: `${r}px`,
      height: `${r}px`,
      viewBox: `0 0 ${r} ${r}`,
      overflow: "visible",
      style: L.svg,
      onMouseDown: U,
      onTouchStart: U,
      children: [
        /* @__PURE__ */ q.jsx("defs", { children: /* @__PURE__ */ q.jsxs("linearGradient", { id: p, x1: "100%", x2: "0%", children: [
          /* @__PURE__ */ q.jsx("stop", { offset: "0%", stopColor: d }),
          /* @__PURE__ */ q.jsx("stop", { offset: "100%", stopColor: h })
        ] }) }),
        /* @__PURE__ */ q.jsx(
          "circle",
          {
            ref: M,
            strokeWidth: O,
            fill: "none",
            stroke: v,
            cx: r / 2,
            cy: r / 2,
            r: ie
          }
        ),
        /* @__PURE__ */ q.jsx(
          "path",
          {
            style: L.path,
            ref: b,
            strokeDasharray: u,
            strokeDashoffset: y,
            strokeWidth: C,
            strokeLinecap: D !== "round" ? "butt" : "round",
            fill: "none",
            stroke: `url(#${p})`,
            d: `
                        M ${r / 2}, ${r / 2}
                        m 0, -${r / 2 - N}
                        a ${r / 2 - N},${r / 2 - N} 0 0,1 0,${r - N * 2}
                        a -${r / 2 - N},-${r / 2 - N} 0 0,1 0,-${r - N * 2}
                    `
          }
        )
      ]
    }
  );
};
pr.propTypes = {
  width: c.number,
  label: c.string,
  direction: c.number,
  svgFullPath: c.object,
  strokeDasharray: c.number,
  strokeDashoffset: c.number,
  progressColorFrom: c.string,
  progressColorTo: c.string,
  progressLineCap: c.string,
  progressSize: c.number,
  trackColor: c.string,
  trackSize: c.number,
  radiansOffset: c.number
};
const _e = 360, We = {
  top: Math.PI / 2,
  right: 0,
  bottom: -Math.PI / 2,
  left: -Math.PI
}, ge = (r) => r < 0 ? -1 : 1, Me = (r) => r * Math.PI / 180, Ar = (r, p) => {
  let f = [];
  for (let u = r; u <= p; u++)
    f.push(u);
  return f;
}, ar = (r) => r in We ? We[r] : Me(r), sr = {
  circularSlider: {
    position: "relative",
    display: "inline-block",
    opacity: 0,
    transition: "opacity 1s ease-in"
  },
  mounted: {
    opacity: 1
  }
}, Mr = ({
  label: r = "ANGLE",
  width: p = 280,
  direction: f = 1,
  min: u = 0,
  max: y = 360,
  initialValue: d = 0,
  value: h = null,
  knobColor: v = "#4e63ea",
  knobSize: C = 36,
  knobPosition: O = "top",
  labelColor: b = "#272b77",
  labelBottom: A = !1,
  labelFontSize: D = "1rem",
  valueFontSize: W = "3rem",
  appendToValue: z = "",
  prependToValue: M = "",
  verticalOffset: L = "1.5rem",
  hideLabelValue: N = !1,
  hideKnob: ie = !1,
  hideKnobRing: U = !1,
  knobDraggable: S = !0,
  progressColorFrom: s = "#80C3F3",
  progressColorTo: G = "#4990E2",
  useMouseAdditionalToTouch: ce = !1,
  progressSize: le = 8,
  trackColor: fe = "#DDDEFB",
  trackSize: ne = 8,
  trackDraggable: Z = !1,
  data: oe = [],
  dataIndex: Q = 0,
  progressLineCap: ae = "round",
  renderLabelValue: pe = null,
  children: ee,
  onChange: re = (t) => {
  },
  isDragging: ye = (t) => {
  },
  // When continuous is enabled the wheel will go round infinitely up to
  // the max and down to the min values
  continuous: V = {
    enabled: !1,
    clicks: 120,
    interval: 1
  }
}) => {
  const t = Ce(-1), o = V.clicks || Math.floor((y - u) / 3), R = {
    mounted: !1,
    isDragging: !1,
    width: p,
    radius: p / 2,
    knobOffset: ar(O),
    label: d || 0,
    data: V.enabled ? Array.from(Array(o).keys()) : oe,
    radians: 0,
    offset: 0,
    knob: {
      x: 0,
      y: 0
    },
    dashFullArray: 0,
    dashFullOffset: 0
  }, g = jr(), [n, E] = vr(wr, R), T = Ce(null), x = Ce(null), _ = !g && "ontouchstart" in de, j = !_ || _ && ce, [P, X] = ir(), a = Ue((F) => {
    const I = n.radius - ne / 2, se = F + ar(O);
    let te = (se > 0 ? se : 2 * Math.PI + se) * (_e / (2 * Math.PI));
    const e = te / _e * n.dashFullArray;
    te = ge(f) === -1 ? _e - te : te;
    const l = (n.data.length - 1) / _e, i = Math.round(te * l);
    if ((V == null ? void 0 : V.enabled) ?? !1) {
      if (t.current === -1) {
        t.current = i;
        return;
      }
      if (t.current === i) {
        E({
          type: "setKnobPosition",
          payload: {
            dashFullOffset: ge(f) === -1 ? e : n.dashFullArray - e,
            label: Number(n.label),
            knob: {
              x: I * Math.cos(F) + I,
              y: I * Math.sin(F) + I
            }
          }
        }), t.current = i;
        return;
      }
      const w = (i - t.current + o) % o, B = (t.current - i + o) % o, Y = w <= Math.max(1, o * 0.02), m = B <= Math.max(1, o * 0.02);
      if (!Y && !m) {
        E({
          type: "setKnobPosition",
          payload: {
            dashFullOffset: ge(f) === -1 ? e : n.dashFullArray - e,
            label: Number(n.label),
            knob: {
              x: I * Math.cos(F) + I,
              y: I * Math.sin(F) + I
            }
          }
        }), t.current = i;
        return;
      }
      const H = (V == null ? void 0 : V.interval) ?? 1, me = Y ? H * w : -H * B;
      t.current = i;
      const K = Math.min(y, Math.max(u, Number(n.label) + me));
      re(K), E({
        type: "setKnobPosition",
        payload: {
          dashFullOffset: ge(f) === -1 ? e : n.dashFullArray - e,
          label: K,
          knob: {
            x: I * Math.cos(F) + I,
            y: I * Math.sin(F) + I
          }
        }
      });
      return;
    } else
      n.data[i] !== n.label && re(n.data[i]), E({
        type: "setKnobPosition",
        payload: {
          dashFullOffset: ge(f) === -1 ? e : n.dashFullArray - e,
          label: n.data[i],
          knob: {
            x: I * Math.cos(F) + I,
            y: I * Math.sin(F) + I
          }
        }
      });
  }, [n.dashFullArray, n.radius, n.data, n.label, O, ne, f, re, V.enabled]), J = () => {
    ye(!0), E({
      type: "onMouseDown",
      payload: {
        isDragging: !0
      }
    });
  }, ue = () => {
    ((V == null ? void 0 : V.enabled) ?? !1) && (t.current = -1), n.isDragging && ye(!1), E({
      type: "onMouseUp",
      payload: {
        isDragging: !1
      }
    });
  }, ve = Ue((F) => {
    if (!n.isDragging || !S && !Z || F.type === "mousemove" && !j) return;
    F.preventDefault();
    let I;
    F.type === "touchmove" && (I = F.changedTouches[0]);
    const se = (i) => {
      var m, H;
      const w = i.current.getBoundingClientRect(), B = !g && (((de == null ? void 0 : de.pageXOffset) ?? 0) || (((m = document == null ? void 0 : document.documentElement) == null ? void 0 : m.scrollLeft) ?? 0)), Y = !g && (((de == null ? void 0 : de.pageYOffset) ?? 0) || (((H = document == null ? void 0 : document.documentElement) == null ? void 0 : H.scrollTop) ?? 0));
      return { top: w.top + Y, left: w.left + B };
    }, te = (F.type === "touchmove" ? I.pageX : F.pageX) - (se(T).left + n.radius), e = (F.type === "touchmove" ? I.pageY : F.pageY) - (se(T).top + n.radius), l = Math.atan2(e, te);
    a(l);
  }, [n.isDragging, n.radius, a, S, Z, g]);
  Te(() => {
    E({
      type: "init",
      payload: {
        mounted: !0,
        data: n.data.length ? [...n.data] : [...Ar(u, y)],
        dashFullArray: x.current.getTotalLength ? x.current.getTotalLength() : 0
      }
    });
  }, [y, u]), Te(() => {
    const F = n.data.length, I = Q > F - 1 ? F - 1 : Q;
    if (F) {
      const se = _e / F, te = Me(se) / 2;
      if (E({
        type: "setInitialKnobPosition",
        payload: {
          radians: Math.PI / 2 - n.knobOffset,
          offset: te
        }
      }), I) {
        const e = ge(f) * I * se, l = Me(e) - n.knobOffset;
        return a(l + te * ge(f));
      }
      a(-n.knobOffset + te * ge(f));
    }
  }, [n.dashFullArray, n.knobOffset, n.data.length, Q, f]), Te(() => {
    X(h);
    const F = Me(h), I = -n.knobOffset + F * ge(f);
    a(I);
  }, [f, n.knobOffset, h]), Ae("touchend", ue), Ae("mouseup", ue), Ae("touchmove", ve), Ae("mousemove", ve);
  const ke = r.replace(/[\W_]/g, "_");
  return /* @__PURE__ */ q.jsxs("div", { style: { ...sr.circularSlider, ...n.mounted && sr.mounted }, ref: T, children: [
    /* @__PURE__ */ q.jsx(
      pr,
      {
        width: p,
        label: ke,
        direction: f,
        strokeDasharray: n.dashFullArray,
        strokeDashoffset: n.dashFullOffset,
        svgFullPath: x,
        progressSize: le,
        progressColorFrom: s,
        progressColorTo: G,
        progressLineCap: ae,
        trackColor: fe,
        trackSize: ne,
        radiansOffset: n.radians,
        onMouseDown: Z ? J : null,
        isDragging: n.isDragging
      }
    ),
    /* @__PURE__ */ q.jsx(
      fr,
      {
        isDragging: n.isDragging,
        knobPosition: { x: n.knob.x, y: n.knob.y },
        knobSize: C,
        knobColor: v,
        trackSize: ne,
        hideKnob: ie,
        hideKnobRing: U,
        knobDraggable: S,
        onMouseDown: J,
        children: ee
      }
    ),
    pe || /* @__PURE__ */ q.jsx(
      dr,
      {
        label: r,
        labelColor: b,
        labelBottom: A,
        labelFontSize: D,
        verticalOffset: L,
        valueFontSize: W,
        appendToValue: z,
        prependToValue: M,
        hideLabelValue: N,
        value: `${P ?? n.label}`
      }
    )
  ] });
};
Mr.propTypes = {
  label: c.string,
  width: c.number,
  direction: c.number,
  min: c.number,
  max: c.number,
  value: c.number,
  knobColor: c.string,
  knobPosition: c.oneOfType([
    c.oneOf(Object.keys(We)),
    c.number
  ]),
  hideKnob: c.bool,
  knobDraggable: c.bool,
  labelColor: c.string,
  labelBottom: c.bool,
  labelFontSize: c.string,
  valueFontSize: c.string,
  appendToValue: c.string,
  renderLabelValue: c.element,
  prependToValue: c.string,
  verticalOffset: c.string,
  hideLabelValue: c.bool,
  progressLineCap: c.string,
  progressColorFrom: c.string,
  progressColorTo: c.string,
  useMouseAdditionalToTouch: c.bool,
  progressSize: c.number,
  trackDraggable: c.bool,
  trackColor: c.string,
  trackSize: c.number,
  data: c.array,
  dataIndex: c.number,
  onChange: c.func,
  isDragging: c.func
};
export {
  Mr as default
};
