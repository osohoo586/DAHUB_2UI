# DAHUB — Дотоод аудитын газрын дотоод портал

Голомт банкны Дотоод аудитын газрын (ДАГ) ажилтнуудад зориулсан дотоод портал. Card-д суурилсан, light/dark горимтой, өнгө тохируулагчтай, RBAC бүхий Vue 3 програм. Бүх өгөгдөл mock (seed) бөгөөд service давхаргыг солиход жинхэнэ API-д холбогдоно.

- **Нүүр**: нэг дэлгэцэнд багтана (scroll-гүй) — зургийн slider, аудиторын ёс зүйн зарчмын slider, DAG News-ийн сүүлийн 5 нийтлэл
- **DAG News**: хайлт, ангиллын таб, нийтлэл унших хуудас, холбогдох нийтлэл, нийтлэл нэмэх
- **Dashboard**: KPI (sparkline, өмнөх үетэй харьцуулалт), 4 график, хугацаа хэтэрсэн олдвор, Excel экспорт
- **Хэрэгсэл**: аудитын хэрэгслийн card сан — хайлт, ангиллын шүүлтүүр, хэрэгсэл нэмэх/засах/устгах, чирж (эсвэл сумаар) дараалал өөрчлөх
  - **Санамсаргүй түүвэр** (`/tools/sampling`): Excel upload, SRSWR / SRSWOR / Proportional / Non-proportional, KaTeX томьёо, seed-тэй давтагдах түүвэр, Excel экспорт
  - MUS, шинж чанарын түүвэр, Бенфорд, давхардал, Gap, материаллаг байдал: UI бэлэн, «Хөгжүүлэлт хийгдэж байна» хуудас руу орно
- **Эрсдэлийн үнэлгээ**: 5×5 heat map шүүлтүүр, үнэлгээний явц, эрсдэлийн бүртгэл, нэмэх/засах/устгах
- **Гишүүд ба эрх** (avatar цэснээс): «Бүтэц» — байгууллагын мод, «Гишүүд» — card/хүснэгт харагдац, нэмэх/засах, «Эрхийн тохиргоо» — role × модуль × үйлдлийн матриц
- **Профайл**: эрхийн хураангуй, горим, өнгө, demo өгөгдөл сэргээх
- **Навигацийн хэлбэр**: Өнгө тохируулах → «Навигаци» — Дээд bar (анхдагч), Sidebar (хураана/дэлгэнэ), Доод bar, Dropdown (модулийн тайлбартай цэс, overlay, сумаар удирдана). Сонголт хөтөчид хадгалагдана

---

## 1. Ажиллуулах

### Docker (санал болгох)

```bash
docker compose up --build
```

→ http://localhost:8090

8090 порт өөр програмд эзлэгдсэн бол host портыг сольж болно: `DAHUB_PORT=8090 docker compose up --build` → http://localhost:8090

Build хийх үед npm registry болон `cdn.sheetjs.com`-д (SheetJS-ийн албан ёсны түгээлт) хандах сүлжээ шаардлагатай. Дараа нь image offline ажиллана: фонт, лого, KaTeX бүгд image дотор байгаа.

### Local хөгжүүлэлт

Node.js ≥ 20.19 (22 LTS эсвэл түүнээс хойшхи):

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # dist/
npm run preview    # build-ийг шалгах, http://localhost:4173
npm test           # vitest — түүврийн томьёо, WCAG contrast, хэрэгслийн сан
```

## 2. Demo хэрэглэгчид

Бүх хэрэглэгчийн нууц үг: **`dahub2026`**. Нэвтрэх хуудасны доод талд байгаа role chip дээр дарж шууд нэвтэрч болно.

| Нэвтрэх нэр | Хүн                                                                                | Role                        | Анхны эрх                                                                  |
| --------------------- | ------------------------------------------------------------------------------------- | --------------------------- | ---------------------------------------------------------------------------------- |
| `director`          | Д. Оюунчимэг, Газрын захирал                                   | Удирдлага          | Бүгдийг харна, засахгүй                                        |
| `bizhead`           | Н. Энхжаргал, Бизнесийн аудитын хэлтсийн дарга | Хэлтсийн дарга | Нийтлэл, эрсдэл, гишүүд засна; эрсдэл устгана |
| `auditor`           | О. Золбоо, Ахлах МТ аудитор                                      | Аудитор              | Хэрэгсэл, эрсдэл засна                                          |
| `admin`             | Б. Ундрах, Дата аналист / системийн админ             | Админ                  | Бүх эрх, эрхийн матрицыг засна                            |

Эрхийн матриц (**Гишүүд ба эрх → Эрхийн тохиргоо**) өөрчлөгдмөгц navbar-ын цэс, товчнууд шууд шинэчлэгдэнэ. Admin өөрийн «Гишүүд ба эрх»-ийг хаах боломжгүй (өөрийгөө түгжихээс хамгаална). Хэрэгсэл нэмэх, засах, устгах, дараалал өөрчлөхөд «Хэрэгсэл → Засах» эрх шаардлагатай.

## 3. Хавтасны бүтэц

```
├─ Dockerfile · docker-compose.yml · nginx.conf
├─ logo/                   эх лого (өөрчлөхгүй)
├─ public/brand/           оновчилсон лого, dark хувилбар, favicon (npm run brand)
├─ public/hero/            нүүр хуудасны slider-ийн зургууд
├─ scripts/brand-assets.mjs
├─ tests/                  sampling.spec.js, color.spec.js, tools.spec.js
└─ src/
   ├─ assets/styles/       tokens.css (design token) · base.css · layout.css (12 багана) · animations.css
   ├─ assets/icons.js      нэг стильтэй line icon (24px, 1.5 stroke)
   ├─ components/
   │  ├─ ui/               Button, Card, Tabs, Select, Modal, Drawer, DataTable, Stepper, Dropzone …
   │  ├─ layout/           AppShell, 4 навигаци (Navbar, Sidebar, Footbar, Dropnav), SearchOverlay (⌘K), RouteProgress, BrandLogo
   │  ├─ theme/            ThemeCustomizer, NavLayoutPicker, ColorPicker (HS талбай, RGB, HEX, зохицол), ContrastBadge
   │  ├─ charts/           Chart.js wrapper-ууд, Sparkline, ProgressRing, RiskHeatmap
   │  ├─ cards/            KPI, News, Member, Risk, Tool, OrgTree, PhotoSlider, EthicsSlider, FormulaCard …
   │  └─ illustrations/    хоосон төлөв ба нийтлэлийн cover (SVG, генератор)
   ├─ composables/         useTheme, useNavLinks, useReveal (v-reveal), useCountUp, useAuth, useChartTheme …
   ├─ stores/              auth, theme, layout, permissions, members, tools, ui (Pinia)
   ├─ services/            client.js (mock | http), mockDb.js, auth, news, dashboard, risk, members, tools …
   ├─ mock/                *.json seed өгөгдөл
   ├─ utils/               color.js, sampling.js, prng.js, excel.js, format.js
   ├─ views/               хуудас бүр (route-оор код хуваагдана)
   └─ router/
```

## 4. Mock-ийг жинхэнэ API-гаар солих

View болон store зөвхөн `src/services/*`-ийн функцуудыг дуудна. Service функц бүр `USE_MOCK` үед mock-оос уншиж, эс бөгөөс `http` клиентээр API дуудна. Функц бүрийн дээр endpoint-ийг тайлбарласан (`/** GET /api/news?category=&q= */`).

1. `.env.example`-ийг `.env.local` болгож хуулна:
   ```
   VITE_API_MODE=http
   VITE_API_BASE=https://dahub-api.golomtbank.local/api
   ```
2. API-гийн хариу service-ийн mock-той ижил хэлбэртэй бол өөр юм өөрчлөх шаардлагагүй. Ялгаатай бол тухайн service функцийн `http` салбарт хөрвүүлэлт нэмнэ.
3. Нэвтрэлт: `services/auth.js → login()` нь `{ token, account, member }` буцаана. Token нь `Authorization: Bearer …` header-ээр дамжина (`client.js → setAuthToken`).
4. Docker-т API-г дамжуулах бол `nginx.conf`-д `location /api/ { proxy_pass http://api:8000/; }` нэмнэ.

Mock горимд хийсэн өөрчлөлт (гишүүн, эрсдэл, нийтлэл, эрх, нэмсэн хэрэгсэл ба тэдгээрийн дараалал) хөтчийн `localStorage`-д хадгалагдана. **Профайл → Demo өгөгдөл → Сэргээх**-ээр анхны төлөвт буцаана.

## 5. Дизайны систем

- **Өнгө**: логоноос pixel-ээр авсан brand blue `#005AA9`, yellow `#FFF100`. Шар өнгийг зөвхөн accent-д (идэвхтэй шугам, индикатор, «дөл») хэрэглэнэ. Token-ууд `src/assets/styles/tokens.css` файлд light/dark хоёр горимоор бий.
- **Фонт**: гарчигт Source Serif 4, бичвэрт IBM Plex Sans (кирилл, cyrillic-ext буюу Ө, Ү дэмжинэ), self-host хийгдсэн. Тоонд `tabular-nums`.
- **График**: categorical ба эрсдэлийн түвшний palette-ийг CVD (өнгөний харалган) шалгуураар хоёр горимд баталгаажуулсан. Утгуудыг tokens.css доторх тайлбараас харна уу.
- **Contrast**: текстийн бүх token WCAG AA хангана (`npm test` шалгана). Өнгө тохируулагч хэрэглэгчийн сонгосон өнгөний contrast-ыг тооцож, AA хангахгүй бол анхааруулна. Дэд текстийн өнгийг автоматаар засна.
- **Анимаци**: 160–600ms, ease-out, доороос дээш хөдөлнө. `prefers-reduced-motion` үед бүгд унтарна.

### Лого

`logo/`-ийн эх файлыг `npm run brand` нь `public/brand/` руу хувиргана. Харьцааг хадгалж resize хийнэ. Мөн dark горимд зориулж wordmark ба slogan-ыг цагаан болгосон хувилбар үүсгэнэ, G тэмдэг өөрчлөгдөхгүй. Favicon-ыг G тэмдгээс гаргана. Лого солигдвол энэ командыг дахин ажиллуулна.

### Навигаци

Холбоос, icon нь `src/composables/useNavLinks.js`-д нэг л газар тодорхойлогдож, 4 хэлбэр бүгд үүнийг ашиглана. Сонгосон хэлбэр `<html data-nav="top|side|bottom|dropdown">` болж, `tokens.css` доторх `--nav-top`, `--nav-left`, `--nav-bottom` token-ууд тухайн хэлбэрийн эзлэх зайг тодорхойлно. Хуудас бүр (`.page`) эдгээрээр зайгаа тохируулдаг тул агуулга навигацид халхлагдахгүй. Шилжилт 300ms (`--dur-nav`).

### Нүүр хуудасны зураг

`public/hero/`-д байрлах зургууд `src/mock/hero.json`-ээр slider-т орно (бичиггүй, зөвхөн зураг). Жинхэнэ гэрэл зургаар солихдоо файлыг `public/hero/`-д хийж, `hero.json`-ийн `src`, `alt`-ыг шинэчилнэ. Slider нь `object-fit: cover` тул 16:9 орчим харьцаатай зураг тохиромжтой.

### Ажилтны зураг

`members.json`-ийн `photo` талбарт зам заана (жишээ нь `"/avatars/m01.jpg"`, файлыг `public/avatars/`-д байрлуулна). Эсвэл «Гишүүн засах» форм дээрээс зураг оруулна. Зураггүй бол нэрийн эхний үсгээр монограм харагдана.

## 6. Тест

```bash
npm test
```

- `tests/sampling.spec.js`: түүврийн хэмжээ (FPC-тэй, FPC-гүй), пропорц (Cochran), давхаргат хуваарилалт (proportional, Neyman, largest-remainder), margin, seed-ийн давтагдах чанар
- `tests/color.spec.js`: WCAG contrast, өнгө хөрвүүлэлт, анхдагч token-уудын AA нийцэл, тохируулсан palette-ийн дэд текстийн AA
- `tests/tools.spec.js`: хэрэгслийн дараалал хадгалах, нэмэх/засах/устгах
# DAHUB_2UI
