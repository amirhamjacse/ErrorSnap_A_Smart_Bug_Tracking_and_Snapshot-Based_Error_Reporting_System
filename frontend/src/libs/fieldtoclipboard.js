/* eslint-disable */

/* Select (and copy) Form Element Script v1.1
 * Author: Dynamic Drive at http://www.dynamicdrive.com/
 * Visit http://www.dynamicdrive.com/ for full source code
 */

var fieldToClipboard = {
  supported:
    document.queryCommandSupported && document.queryCommandSupported("copy"),
  tooltipobj: null,
  hidetooltiptimer: null,
  createtooltip: function () {
    var t = document.createElement("div");
    (t.style.cssText =
      "position:absolute; background:black; color:white; padding:4px;z-index:10000;border-radius:3px; font-size:12px;box-shadow:3px 3px 3px rgba(0,0,0,.4);opacity:0;transition:opacity 0.3s"),
      (t.innerHTML = "Copied!"),
      (this.tooltipobj = t),
      document.body.appendChild(t);
  },
  showtooltip: function (t) {
    var e = t || event;
    clearTimeout(this.hidetooltiptimer),
      (this.tooltipobj.style.left = e.pageX - 10 + "px"),
      (this.tooltipobj.style.top = e.pageY + 15 + "px"),
      (this.tooltipobj.style.opacity = 1),
      (this.hidetooltiptimer = setTimeout(function () {
        fieldToClipboard.tooltipobj.style.opacity = 0;
      }, 700));
  },
  selectelement: function (t) {
    var e = document.createRange();
    e.selectNodeContents(t);
    var o = window.getSelection();
    o.removeAllRanges(), o.addRange(e);
  },
  copyfield: function (t, e, o) {
    var callbackref;
    var i = "string" == typeof e ? document.getElementById(e) : e;
    (callbackref = o || function () {}),
      /(textarea)|(input)/i.test(i) && i.setSelectionRange
        ? (i.focus(), i.setSelectionRange(0, i.value.length))
        : i && document.createRange
        ? this.selectelement(i)
        : null == i && (i = { value: null });
    var n;
    try {
      n = document.execCommand("copy");
    } catch (t) {
      n = !1;
    }
    return (
      n &&
        (t && this.showtooltip(t),
        callbackref(i.value || window.getSelection().toString())),
      !1
    );
  },
  init: function () {
    /*this.createtooltip()*/
  },
};
fieldToClipboard.init();
export default fieldToClipboard;
