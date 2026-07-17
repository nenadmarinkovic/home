(function () {
  try {
    var t = localStorage.getItem("theme");
    var d =
      t === "dark" ||
      ((t === "system" || !t) &&
        matchMedia("(prefers-color-scheme: dark)").matches);
    var c = d ? "#000" : "#f7f3f3";
    var m = document.createElement("meta");
    m.name = "theme-color";
    m.content = c;
    document.head.appendChild(m);
  } catch (e) {}
})();
