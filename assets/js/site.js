/* Fiberset sitesi: levha hesabı, teklif akışı ve küçük süsler. Bütün metin HTML'de; JS kapalıyken sayfa eksiksiz okunur. */
(function () {
  var WA = "https://wa.me/905469360762?text=";
  var hareketAz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.documentElement.classList.add("js");
  var al = function (id) { return document.getElementById(id); };

  // Başlık gölgesi
  var baslik = al("baslik");
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

  // Menüde etkin bölüm
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

  /* ---- Levha hesabı ve teklif akışı ----
     Metraj tek yerde okunur (üst hızlı hesap, ana hesap, teklif formu aynı kuralı kullanır):
     metre cinsinden, en fazla iki ondalık basamak; virgül ve nokta aynıdır. Değer tam santimetreye çevrilir,
     levha sayısı = santimetre / levha boyu, yukarı yuvarlanır (tam sayı hesabı, sessiz yuvarlama yok). */
  var UST_SINIR_CM = 100000 * 100;
  var UYARI_BICIM = "Metrajı metre cinsinden, en fazla iki ondalık basamakla girin. Örnek: 10,50";
  var UYARI_SIFIR = "Sıfırdan büyük bir metraj girin. Örnek: 10,50";
  var UYARI_BUYUK = "En fazla 100.000 metre girilebilir.";
  // Döner: { bos: true } | { hata: "…" } | { cm: tamSayı }
  function metrajOku(yazi) {
    var t = String(yazi == null ? "" : yazi).trim();
    if (!t) return { bos: true };
    var e = /^(\d{1,7})(?:[.,](\d{1,2}))?$/.exec(t);
    if (!e) return { hata: UYARI_BICIM };
    var cm = parseInt(e[1], 10) * 100 + parseInt(((e[2] || "") + "00").slice(0, 2), 10);
    if (cm <= 0) return { hata: UYARI_SIFIR };
    if (cm > UST_SINIR_CM) return { hata: UYARI_BUYUK };
    return { cm: cm };
  }
  function metreYaz(cm) {
    var tam = Math.floor(cm / 100), kalan = cm % 100;
    if (!kalan) return String(tam);
    var k = (kalan < 10 ? "0" : "") + kalan;
    return tam + "," + k.replace(/0$/, "");
  }
  function levhaSayisi(cm, boy) { return Math.ceil(cm / boy); }
  var BOYLAR = [100, 150, 200, 300];
  var OLCU_ADI = { "100": "Fiberset 100 (100 × 70 cm)", "150": "Fiberset 150 (150 × 70 cm)", "200": "Fiberset 200 (200 × 70 cm)", "300": "Fiberset 300 (300 × 70 cm)", "ozel": "Fiberset Özel (özel kesim, 70 cm yükseklik)" };

  var metre = al("metre"), hizliMetre = al("hizli-metre");
  var cevre = al("cevre"), olcu = al("olcu");
  var hesapUyari = al("hesap-uyari"), cevreUyari = al("cevre-uyari");
  var waBag = al("hesap-teklif");
  // Formdaki çevreyi en son kim yazdı: "" (boş), "hesap" (hesaplayıcı) ya da "form" (kullanıcı elle).
  var cevreKaynak = "";

  function uyariGoster(kutu, alan, metin) {
    kutu.textContent = metin || "";
    kutu.hidden = !metin;
    alan.setAttribute("aria-invalid", metin ? "true" : "false");
  }
  function secilenBoy() {
    var r = document.querySelector('input[name="boy"]:checked');
    return r ? r.value : "";
  }

  // Hesaplayıcının ekranını ve KENDİ WhatsApp bağlantısını günceller. Teklif formuna dokunmaz.
  function hesapEkrani() {
    var okunan = metrajOku(metre.value);
    BOYLAR.forEach(function (boy) {
      al("s" + boy).textContent = okunan.cm ? levhaSayisi(okunan.cm, boy) : "—";
    });
    uyariGoster(hesapUyari, metre, okunan.hata);
    var mesaj = "Merhaba, kümesim için Fiberset levha teklifi almak istiyorum.";
    if (okunan.cm) {
      var boy = secilenBoy();
      mesaj = "Merhaba, kapatılacak net çevre " + metreYaz(okunan.cm) + " metre.";
      if (boy) mesaj += " " + OLCU_ADI[boy] + " için " + levhaSayisi(okunan.cm, +boy) + " levha hesaplandı.";
      mesaj += " Fiberset levha için teklif almak istiyorum.";
    }
    waBag.href = WA + encodeURIComponent(mesaj);
    return okunan;
  }

  // Hesaplayıcıya YENİ METRAJ yazıldı: yalnız formun çevresi güncellenir (formda seçili ölçüye dokunulmaz).
  function metrajDegisti() {
    var okunan = hesapEkrani();
    if (okunan.cm) {
      cevre.value = metreYaz(okunan.cm); cevreKaynak = "hesap"; uyariGoster(cevreUyari, cevre, "");
    } else if (cevreKaynak === "hesap") {
      // Geçersiz ya da silinmiş hesap değeri formda teklif olarak kalmasın
      cevre.value = ""; cevreKaynak = "";
    }
  }
  // Hesaplayıcıda YALNIZ BOY seçildi: yalnız formun ölçüsü güncellenir (formda elle düzeltilen metraja dokunulmaz).
  function boyDegisti() {
    hesapEkrani();
    var boy = secilenBoy();
    if (boy) olcu.value = boy;
  }

  if (metre) {
    metre.addEventListener("input", metrajDegisti);
    Array.prototype.forEach.call(document.querySelectorAll('input[name="boy"]'), function (r) {
      r.addEventListener("change", boyDegisti);
    });
    al("hesap-form").addEventListener("submit", function (e) { e.preventDefault(); });
    cevre.addEventListener("input", function () { cevreKaynak = cevre.value.trim() ? "form" : ""; uyariGoster(cevreUyari, cevre, ""); });
  }

  // Başlıktaki hızlı hesap: aynı okuma kuralıyla ana hesaba taşınır
  var hizli = document.querySelector(".hizli-hesap");
  if (hizli) {
    hizli.addEventListener("submit", function (e) {
      e.preventDefault();
      metre.value = hizliMetre.value;
      metrajDegisti();
      al("hesapla").scrollIntoView({ behavior: hareketAz ? "auto" : "smooth" });
      metre.focus({ preventScroll: true });
    });
  }

  // Teklif formu: taslak GÖNDERİM ANINDAKİ form değerlerinden üretilir. Geçersiz metrajla taslak açılmaz.
  // Döner: { hata: "…" } | { metin: "…" }
  function taslak() {
    var deger = function (id) { return al(id).value.trim(); };
    var okunan = metrajOku(cevre.value);
    if (okunan.hata) return { hata: okunan.hata + " Genel teklif için alanı boş bırakabilirsiniz." };
    var satirlar = ["Merhaba, Fiberset levha için teklif almak istiyorum."];
    if (deger("ad")) satirlar.push("Ad: " + deger("ad"));
    if (deger("yer")) satirlar.push("Yer: " + deger("yer"));
    if (okunan.cm) satirlar.push("Kapatılacak net çevre: " + metreYaz(okunan.cm) + " m");
    if (olcu.value) {
      var satir = "Levha ölçüsü: " + OLCU_ADI[olcu.value];
      if (okunan.cm && olcu.value !== "ozel") satir += " (yaklaşık " + levhaSayisi(okunan.cm, +olcu.value) + " levha)";
      satirlar.push(satir);
    } else {
      satirlar.push("Levha ölçüsü: karar vermedim");
    }
    if (deger("not")) satirlar.push("Not: " + deger("not"));
    return { metin: satirlar.join("\n") };
  }
  var form = al("teklif-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var sonuc = taslak();
      if (sonuc.hata) {
        uyariGoster(cevreUyari, cevre, sonuc.hata);
        cevre.focus();
        return;
      }
      uyariGoster(cevreUyari, cevre, "");
      window.open(WA + encodeURIComponent(sonuc.metin), "_blank", "noopener");
    });
    // Telefonda form doldurulurken sabit alt çubuk alanları ve gönder düğmesini örtmesin
    form.addEventListener("focusin", function () { document.body.classList.add("form-odak"); });
    form.addEventListener("focusout", function () { document.body.classList.remove("form-odak"); });
    // Gönderim işleyicisi bağlandı: alanlar ancak şimdi açılır (JavaScript'siz doğal form gönderimi olmasın)
    al("teklif-alan").disabled = false;
  }

  // Geri sayım: tebliğin 12 aylık uyum süresinin son günü, 31 Ocak 2027 23:59:59 (Türkiye saati, UTC+3).
  // Kalan gün yukarı yuvarlanır (son gün "1 gün kaldı" görünür). Süre dolunca rozetler gizli kalır; metin JavaScript'siz de anlamlıdır.
  var SON_GUN = Date.UTC(2027, 0, 31, 20, 59, 59);
  var kalanGun = Math.ceil((SON_GUN - Date.now()) / 86400000);
  if (kalanGun > 0) {
    Array.prototype.forEach.call(document.querySelectorAll("[data-sayac]"), function (rozet) {
      rozet.querySelector("[data-gun]").textContent = kalanGun;
      rozet.hidden = false;
    });
  }

  // Kabul testleri için (mesaj göndermeden doğrulama): tarayıcı konsolundan okunur
  window.fibersetTest = { metrajOku: metrajOku, metreYaz: metreYaz, levhaSayisi: levhaSayisi, taslak: taslak };
})();
