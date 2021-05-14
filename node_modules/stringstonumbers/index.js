(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory)
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory()
  } else {
    root.strToNum = factory()
  }
})(this, function () {
	let chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!#$%()*+,-./\\:;=?@[]^_`{|}~\"'&<> "
	let exports = {
		encode: function (s) {
			let r = "";
			for (let l of s) {
				r += (chars.indexOf(l) + 1) < 10 ? `0${chars.indexOf(l) + 1}` : `${chars.indexOf(l) + 1}`;
			}
			return `${r}00`;
		},
		decode: function(n) {
			let r = "";
			let t = n.match(/[^][^]?/g);
      for (let c in t) {
        if (t[c] === "00") {
          r.__proto__.input = t.filter((p, i) => i <= c).join("");
          return r;
        }
        r += chars[t[c] - 1];
      }
      r.__proto__.input = n;
      return r;
		}
	}

	return exports;
});
