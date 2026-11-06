/* Fiberset taslak sitesi: süs ve küçük yardımcılar. Bütün metin HTML'de; JS kapalıyken sayfa eksiksiz görünür. */
(function () {
  var WA = "https://wa.me/905469360762?text=";
  var hareketAz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.documentElement.classList.add("js");

  // Yönetmelik son tarihine kalan gün (31 Aralık 2026, Türkiye saati)
  var kalan = document.getElementById("kalan-gun");
  if (kalan) {
    var son = new Date("2026-12-31T23:59:59+03:00");
    var gun = Math.ceil((son - new Date()) / 86400000);
    if (gun > 0) {
      kalan.textContent = gun;
    } else {
      kalan.parentNode.textContent = "Süre doldu; güncel durumu sorun";
    }
  }

  // Başlık gölgesi
  var baslik = document.getElementById("baslik");
  var golge = function () { baslik.classList.toggle("golgeli", window.scrollY > 8); };
  window.addEventListener("scroll", golge, { passive: true });
  golge();

  // Kaydırınca belirme
  var ogeler = document.querySelectorAll(".goster");
  if ("IntersectionObserver" in window && !hareketAz) {
    var izle = new IntersectionObserver(function (girdiler) {
      girdiler.forEach(function (g) {
        if (g.isIntersecting) { g.target.classList.add("gorundu"); izle.unobserve(g.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    ogeler.forEach(function (o) { izle.observe(o); });
  } else {
    ogeler.forEach(function (o) { o.classList.add("gorundu"); });
  }

  // Kategori çubuğunda etkin bölüm
  var baglar = Array.prototype.slice.call(document.querySelectorAll(".kategori a"));
  if ("IntersectionObserver" in window) {
    var bolumIzle = new IntersectionObserver(function (girdiler) {
      girdiler.forEach(function (g) {
        if (!g.isIntersecting) return;
        baglar.forEach(function (b) { b.classList.toggle("etkin", b.getAttribute("href") === "#" + g.target.id); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    baglar.forEach(function (b) {
      var hedef = document.querySelector(b.getAttribute("href"));
      if (hedef) bolumIzle.observe(hedef);
    });
  }

  // Levha hesabı
  var metre = document.getElementById("metre");
  var teklifBag = document.getElementById("hesap-teklif");
  function hesapla() {
    var m = parseFloat(String(metre.value).replace(",", "."));
    var gecerli = m > 0 && m < 100000;
    [150, 200, 300].forEach(function (boy) {
      document.getElementById("s" + boy).textContent = gecerli ? Math.ceil((m * 100) / boy) : "—";
    });
    var mesaj = gecerli
      ? "Merhaba, kümesimin çevresi yaklaşık " + m + " metre. Fiberset levha için teklif almak istiyorum."
      : "Merhaba, kümesim için Fiberset levha teklifi almak istiyorum.";
    teklifBag.href = WA + encodeURIComponent(mesaj);
  }
  if (metre) {
    metre.addEventListener("input", hesapla);
    document.getElementById("hesap-form").addEventListener("submit", function (e) { e.preventDefault(); });
  }

  // Başlıktaki hızlı hesap: değeri hesap bölümüne taşı
  var hizli = document.querySelector(".hizli-hesap");
  if (hizli) {
    hizli.addEventListener("submit", function (e) {
      e.preventDefault();
      metre.value = document.getElementById("hizli-metre").value;
      hesapla();
      document.getElementById("hesapla").scrollIntoView({ behavior: hareketAz ? "auto" : "smooth" });
      metre.focus({ preventScroll: true });
    });
  }

  // Teklif formu: WhatsApp'ta hazır mesaj açar, bilgi saklanmaz
  var form = document.getElementById("teklif-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var al = function (id) { return document.getElementById(id).value.trim(); };
      var satirlar = ["Merhaba, Fiberset levha için teklif almak istiyorum."];
      if (al("ad")) satirlar.push("Ad: " + al("ad"));
      if (al("yer")) satirlar.push("Yer: " + al("yer"));
      if (al("cevre")) satirlar.push("Kümes çevresi: " + al("cevre") + " m");
      satirlar.push("Levha ölçüsü: " + al("olcu"));
      if (al("not")) satirlar.push("Not: " + al("not"));
      window.open(WA + encodeURIComponent(satirlar.join("\n")), "_blank", "noopener");
    });
  }
})();
