/* Product data: the single source of truth for the shop grid and every product page.
   Prices are demo content. Every product always carries a `sizes` array; products that
   only make sense at one size (a subscription, a made-to-order bouquet) simply have one
   entry in it, so the product page can render with or without a size selector from the
   exact same code path. Swapping this file for a real API/database later just means
   `get(slug)` resolves from a fetch instead of this array; nothing that reads it needs
   to change. */
(function () {
  "use strict";

  function round10(n) { return Math.round(n / 10) * 10; }

  // Three demo tiers derived from the one price the site already shows for a product.
  // Editing a product's `large` price recomputes both other tiers automatically.
  function tieredSizes(largePrice) {
    return [
      { id: "classic", label: "קלאסי", price: round10(largePrice * 0.7) },
      { id: "large", label: "גדול", price: largePrice },
      { id: "premium", label: "פרימיום", price: round10(largePrice * 1.4) },
    ];
  }

  function singleSize(label, price) {
    return [{ id: "single", label: label, price: price }];
  }

  var CAT_LABELS = {
    bouquets: "זרי פרחים",
    plants: "עציצים ואדניות",
    gifts: "מארזי מתנה",
    events: "חתונות ואירועים",
  };

  var AVAILABLE = { text: "זמין להזמנה היום", tone: "ok" };

  var PRODUCTS = [
    {
      slug: "signature-bouquet",
      sku: "VB-1001",
      occasions: ["יום הולדת", "בית חדש", "תודה"],
      name: "הזר של הבית",
      cat: "bouquets",
      desc: "הגרסה הגדולה והחגיגית של הסטודיו. עושה רושם בכניסה.",
      composition: "ורדים ורודים, שושן צחור, חרצית סגולה וירק אקליפטוס",
      images: ["assets/img/p11.webp"],
      sizes: tieredSizes(390),
      defaultSizeId: "large",
      availability: AVAILABLE,
    },
    {
      slug: "roses-and-lilac",
      sku: "VB-1002",
      occasions: ["יום נישואין", "התנצלות", "אהבה"],
      name: "זר ורדים ולילך",
      cat: "bouquets",
      desc: "ורדים ורודים, שושן צחור ולימוניום על ירק אקליפטוס.",
      composition: "ורדים ורודים, שושן צחור, לימוניום",
      images: ["assets/img/p01.webp"],
      sizes: tieredSizes(240),
      defaultSizeId: "large",
      availability: AVAILABLE,
    },
    {
      slug: "friday-market",
      sku: "VB-1003",
      occasions: ["מארח/ת", "סוף שבוע"],
      name: "השוק של שישי",
      cat: "bouquets",
      desc: "הרכב מתחלף לפי מבחר הבוקר בשוק. אין שניים זהים.",
      composition: "מבחר עונתי, משתנה מדי שבוע",
      images: ["assets/img/p02.webp"],
      sizes: tieredSizes(185),
      defaultSizeId: "large",
      availability: { text: "זמין להזמנה, ההרכב משתנה מדי שבוע", tone: "ok" },
    },
    {
      slug: "white-on-white",
      sku: "VB-1004",
      occasions: ["חתונה", "ברית"],
      name: "לבן על לבן",
      cat: "bouquets",
      desc: "שושנים, ציפורן לבנה ונשיקות כלה. עדין ומדויק.",
      composition: "שושנים לבנות, ציפורן לבנה, נשיקות כלה",
      images: ["assets/img/p03.webp"],
      sizes: tieredSizes(290),
      defaultSizeId: "large",
      availability: AVAILABLE,
    },
    {
      slug: "first-peonies",
      sku: "VB-1005",
      occasions: ["יום הולדת", "אמא"],
      name: "אדמוניות ראשונות",
      cat: "plants",
      desc: "אדמוניות בשיא העונה, נפתחות אצלכם בבית לאורך שבוע.",
      composition: "אדמוניות ורודות, ירק עונתי",
      images: ["assets/img/p04.webp"],
      sizes: tieredSizes(320),
      defaultSizeId: "large",
      availability: AVAILABLE,
    },
    {
      slug: "open-field",
      sku: "VB-1006",
      occasions: ["יום יומי", "מארח/ת"],
      name: "שדה פתוח",
      cat: "bouquets",
      desc: "מרקם פרוע של פרחי עונה וירק, כאילו נקטף הרגע.",
      composition: "פרחי בר עונתיים, ירק משתלב",
      images: ["assets/img/p05.webp"],
      sizes: tieredSizes(160),
      defaultSizeId: "large",
      availability: AVAILABLE,
    },
    {
      slug: "first-morning",
      sku: "VB-1007",
      occasions: ["בוקר טוב", "תודה"],
      name: "בוקר ראשון",
      cat: "bouquets",
      desc: "זר קטן ובהיר לפתיחת שבוע. יושב יפה על שולחן מטבח.",
      composition: "ורדים בהירים, לילות, ירק עדין",
      images: ["assets/img/p06.webp"],
      sizes: tieredSizes(210),
      defaultSizeId: "large",
      availability: AVAILABLE,
    },
    {
      slug: "carnation-and-anemone",
      sku: "VB-1008",
      occasions: ["יום הולדת", "עידוד"],
      name: "ציפורן וכלנית",
      cat: "bouquets",
      desc: "אדום עמוק עם נגיעות סגול. הזר הכי אמיץ בחנות.",
      composition: "ציפורן אדומה, כלנית סגולה, ירק כהה",
      images: ["assets/img/p07.webp"],
      sizes: tieredSizes(175),
      defaultSizeId: "large",
      availability: AVAILABLE,
    },
    {
      slug: "condolence-arrangement",
      sku: "VB-1009",
      occasions: ["ניחומים"],
      name: "מארז ניחומים",
      cat: "gifts",
      desc: "לבן וירק בלבד, בלי כיתוב. נשלח עם כרטיס דיסקרטי.",
      composition: "שושנים לבנות, ירק רך, ללא פרחים צבעוניים",
      images: ["assets/img/p08.webp"],
      sizes: tieredSizes(230),
      defaultSizeId: "large",
      availability: AVAILABLE,
    },
    {
      slug: "home-greenery",
      sku: "VB-1010",
      occasions: ["בית חדש", "משרד"],
      name: "ירק לבית",
      cat: "plants",
      desc: "צמח עלווה בכלי קרמיקה. מחזיק שנים, לא שבוע.",
      composition: "צמח עלווה יחיד, כלי קרמיקה",
      images: ["assets/img/p09.webp"],
      sizes: tieredSizes(165),
      defaultSizeId: "large",
      availability: AVAILABLE,
    },
    {
      slug: "seasonal-vase",
      sku: "VB-1011",
      occasions: ["מתנה", "תודה"],
      name: "אגרטל עונתי",
      cat: "gifts",
      desc: "אגרטל זכוכית עם מבחר השבוע. מגיע מסודר, בלי עבודה.",
      composition: "מבחר עונתי באגרטל זכוכית",
      images: ["assets/img/p10.webp"],
      sizes: tieredSizes(145),
      defaultSizeId: "large",
      availability: AVAILABLE,
    },
    {
      slug: "bridal-bouquet",
      sku: "VB-1012",
      occasions: ["חתונה"],
      name: "זר כלה",
      cat: "events",
      desc: "נבנה בפגישת התאמה אישית. המחיר הוא נקודת פתיחה.",
      composition: "לפי בחירה בפגישת התאמה אישית",
      images: ["assets/img/p12.webp"],
      sizes: singleSize("התאמה אישית", 450),
      defaultSizeId: "single",
      availability: { text: "לפי פגישת התאמה אישית, יש ליצור קשר", tone: "custom" },
    },
    {
      slug: "peony-plant",
      sku: "VB-1013",
      occasions: ["בית חדש", "אמא"],
      name: "עציץ אדמונית",
      cat: "plants",
      desc: "שתיל בוגר בעונת הפריחה. מגיע עם הוראות השקיה.",
      composition: "שתיל אדמונית בוגר, כלי חרס",
      images: ["assets/img/p13.webp"],
      sizes: tieredSizes(195),
      defaultSizeId: "large",
      availability: AVAILABLE,
    },
    {
      slug: "monthly-subscription",
      sku: "VB-1014",
      occasions: ["מנוי", "מתנה מתמשכת"],
      name: "מנוי חודשי",
      cat: "gifts",
      desc: "זר אחד בשבוע, ארבעה בחודש. מתחלף לפי מה שיש בשוק.",
      composition: "זר עונתי משתנה, אספקה שבועית",
      images: ["assets/img/p14.webp"],
      sizes: singleSize("מנוי חודשי", 690),
      defaultSizeId: "single",
      availability: { text: "מתחדש אוטומטית מדי חודש, ניתן לבטל בכל עת", tone: "custom" },
    },
  ];

  function get(slug) {
    for (var i = 0; i < PRODUCTS.length; i++) {
      if (PRODUCTS[i].slug === slug) return PRODUCTS[i];
    }
    return null;
  }

  window.VervainProducts = { all: PRODUCTS, get: get, catLabel: CAT_LABELS };
})();
