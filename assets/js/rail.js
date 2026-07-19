document.addEventListener("DOMContentLoaded", function () {
  var content = document.querySelector(".post-content");
  var railTrack = document.querySelector(".rail-track");
  if (!content || !railTrack) return;

  var headings = Array.prototype.slice.call(content.querySelectorAll("h2"));
  if (!headings.length) {
    var rail = document.querySelector(".rail");
    if (rail) rail.style.display = "none";
    return;
  }

  headings.forEach(function (h, i) {
    var idx = String(i + 1).padStart(2, "0");
    if (!h.id) {
      h.id = h.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    }
    var marker = document.createElement("span");
    marker.className = "h2-idx";
    marker.textContent = idx;
    h.prepend(marker);

    var btn = document.createElement("button");
    btn.className = "rail-node";
    btn.dataset.idx = idx;
    btn.textContent = h.textContent.replace(idx, "").trim();
    btn.addEventListener("click", function () {
      h.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    railTrack.appendChild(btn);
  });

  var nodes = Array.prototype.slice.call(railTrack.querySelectorAll(".rail-node"));

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        var i = headings.indexOf(entry.target);
        if (i === -1) return;
        if (entry.isIntersecting) {
          nodes.forEach(function (n) { n.classList.remove("active"); });
          nodes[i].classList.add("active");
        }
      });
    },
    { rootMargin: "-10% 0px -70% 0px", threshold: 0 }
  );

  headings.forEach(function (h) { observer.observe(h); });
});
