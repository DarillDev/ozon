# CLAUDE.md

Этот файл предоставляет инструкции для Claude Code при работе с данным репозиторием.

---

## MCP серверы

В этом проекте настроены два MCP сервера (файл [.mcp.json](/.mcp.json)). Они запускаются автоматически при старте сессии.

### nx (Nx MCP)

Команда запуска: `pnpm nx mcp` → делегирует в `pnpm dlx nx-mcp@latest`

**Для чего использовать:**
- Получение информации о проектах воркспейса (`nx_workspace`, `nx_project_details`)
- Запуск задач Nx: build, test, lint, serve
- Получение графа зависимостей между проектами
- Вопросы о конфигурации Nx и плагинах
- Поиск затронутых проектов (`nx affected`)

**Когда обязательно использовать:** перед любыми операциями с проектами Nx — это быстрее и точнее, чем читать `project.json` вручную.

### angular (Angular MCP)

Команда запуска: `pnpm dlx angular-mcp`

**Для чего использовать:**
- Поиск по официальной документации Angular (компоненты, директивы, сервисы, декораторы)
- Документация Angular Material компонентов
- Актуальные сигнатуры API для Angular 21: `@Input()`, `@Output()`, сигналы, `inject()`, standalone API
- Вопросы о роутинге, формах, HTTP клиенте, жизненном цикле компонентов

**Когда использовать:** при написании или проверке Angular кода — особенно для новых API (signals, `input()`, `output()`, `viewChild()` из Angular 17+) которые могут отличаться от устаревших паттернов в обучающих данных.

---

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# Общие правила работы с Nx

- Для навигации по воркспейсу сначала вызывай скилл `nx-workspace` — он содержит паттерны для запросов проектов, целей и зависимостей
- При запуске задач (build, lint, test, e2e и т.д.) всегда используй `nx` (`nx run`, `nx run-many`, `nx affected`) вместо прямого вызова инструментов
- Префиксируй nx-команды менеджером пакетов воркспейса (например, `pnpm nx build`, `npm exec nx test`) — это позволяет избежать использования глобально установленного CLI
- У тебя есть доступ к Nx MCP серверу и его инструментам — используй их
- Для лучших практик Nx плагина смотри `node_modules/@nx/<plugin>/PLUGIN.md`. Не все плагины имеют этот файл — продолжай без него, если недоступен
- НИКОГДА не угадывай флаги CLI — всегда проверяй nx_docs или `--help` при неуверенности

## Скаффолдинг и генераторы

- Для задач скаффолдинга (создание приложений, библиотек, структуры проекта) ВСЕГДА сначала вызывай скилл `nx-generate` перед изучением кода или вызовом MCP инструментов

## Когда использовать nx_docs

- ИСПОЛЬЗОВАТЬ для: расширенных опций конфигурации, незнакомых флагов, руководств по миграции, конфигурации плагинов, крайних случаев
- НЕ ИСПОЛЬЗОВАТЬ для: базового синтаксиса генераторов (`nx g @nx/react:app`), стандартных команд, того, что уже известно
- Скилл `nx-generate` самостоятельно обнаруживает генераторы — не вызывай nx_docs только для поиска синтаксиса генераторов

<!-- nx configuration end-->

---

## Стек технологий

- **Frontend**: Angular 21, standalone-компоненты (без NgModules), `ChangeDetectionStrategy.OnPush` по умолчанию, SCSS, Jest
- **Backend**: NestJS 11, сборка через Webpack, порт 3000, глобальный префикс `/api`
- **Монорепо**: Nx 22, менеджер пакетов — **pnpm**
- **Общее**: TypeScript 5.9, decimal.js для работы с точными числами (цены активов)

---

## Команды

```bash
# Запуск обоих приложений одновременно
pnpm start

# Запуск по отдельности (frontend запускается с SSL)
pnpm start:frontend   # → https://localhost:4200, /api/** проксируется на http://localhost:3000
pnpm start:backend    # → http://localhost:3000/api

# Сборка
pnpm nx build frontend
pnpm nx build backend

# Тесты
pnpm nx test frontend                    # все тесты приложения
pnpm nx test feature-users               # тесты одного проекта
pnpm nx test feature-users --testFile=src/lib/pages/user-list-page/user-list-page.component.spec.ts

# Линтинг
pnpm nx lint <имя-проекта>
pnpm nx run-many --target=lint --all

# Только затронутые проекты (для CI)
pnpm nx affected --target=test
pnpm nx affected --target=lint

# Граф зависимостей
pnpm nx graph
```

---

## Структура монорепо

```
apps/
  frontend/          Angular-приложение (scope:frontend, type:app)
  backend/           NestJS-приложение  (scope:backend,  type:app)
libs/
  frontend/          Библиотеки для Angular
    features/        Lazy-loaded feature-библиотеки (страницы, маршруты)
    data-access-api/ HTTP-сервисы и Web Workers для всех API-доменов
    ui-kit/          Переиспользуемые presentational-компоненты
    util-utils/      Чистые утилиты, пайпы, хелперы
  backend/           Библиотеки для NestJS
    util-utils/      Чистые backend-утилиты
  shared/            Независимые от фреймворка типы
    model-types/     Интерфейсы и enum'ы, используемые и на frontend, и на backend
tools/
  workspace-tools/   Кастомный Nx-плагин с генератором `generate-lib`
  generators/        Устаревший standalone-генератор (заменён workspace-tools)
```

---

## Теги проектов и правила границ модулей

Каждый проект имеет два тега: `scope:*` и `type:*`. ESLint (`@nx/enforce-module-boundaries`) строго контролирует зависимости.

### Правила по scope

| Тег              | Может зависеть от                |
| ---------------- | -------------------------------- |
| `scope:frontend` | `scope:frontend`, `scope:shared` |
| `scope:backend`  | `scope:backend`, `scope:shared`  |
| `scope:shared`   | только `scope:shared`            |

### Правила по type

| Тег                | Может зависеть от                                        |
| ------------------ | -------------------------------------------------------- |
| `type:app`         | `type:ui`, `type:data-access`, `type:util`, `type:lib`   |
| `type:feature`     | _(не определено явно — загружается только через router)_ |
| `type:ui`          | `type:ui`, `type:util`, `type:lib`                       |
| `type:data-access` | `type:data-access`, `type:util`, `type:lib`              |
| `type:util`        | `type:util`, `type:lib`                                  |

**Критически важно**: `type:feature` никогда не импортируется статически. Все feature-библиотеки подключаются исключительно через lazy-loading в `loadChildren()`.

---

## Структура файлов frontend — ТРЕБОВАНИЯ

### Angular-приложение (`apps/frontend/`)

```
apps/frontend/
  src/
    app/
      app.component.ts        — корневой компонент, только <router-outlet>
      app.component.html
      app.component.scss
      app.component.spec.ts
      app.config.ts           — провайдеры приложения: provideRouter, provideHttpClient
      app.routes.ts           — единственный маршрут: lazy loadChildren → feature-shell
    index.html
    main.ts                   — bootstrapApplication(AppComponent, appConfig)
    styles.scss               — глобальные стили
    test-setup.ts
  proxy.conf.json             — /api/** → http://localhost:3000
  project.json
  tsconfig.json / tsconfig.app.json / tsconfig.spec.json
```

**Правила для `apps/frontend`**:

- `app.routes.ts` содержит только один маршрут — lazy-импорт `feature-shell`. Никакой бизнес-логики
- `app.config.ts` содержит только глобальные провайдеры (`provideRouter`, `provideHttpClient`). Без domain-специфичных провайдеров
- Прямых импортов feature-библиотек в `app.routes.ts` через `component:` — нет, только `loadChildren`

### Feature-библиотека (`libs/frontend/features/feature-{name}/`)

Каждая feature — отдельная Nx-библиотека. Теги: `scope:frontend, type:feature`.

```
libs/frontend/features/feature-{name}/
  src/
    index.ts                          — публичное API: экспортирует только константу маршрутов
    lib/
      feature-{name}.routes.ts        — массив Routes, экспортируется как {NAME}_ROUTES
      pages/
        {page-name}-page/
          {page-name}-page.component.ts
          {page-name}-page.component.html
          {page-name}-page.component.scss
          {page-name}-page.component.spec.ts
      components/                     — (опционально) умные компоненты страницы, не переиспользуемые
        {component-name}/
          {component-name}.component.ts
          ...
  test-setup.ts
  project.json
  tsconfig.json / tsconfig.lib.json / tsconfig.spec.json
  jest.config.cts
  eslint.config.mjs
```

**Правила для feature-библиотек**:

- `src/index.ts` экспортирует **только** константу маршрутов (`USERS_ROUTES`, `SHELL_ROUTES` и т.д.)
- Компоненты, сервисы, стейт — **не экспортируются** через `index.ts`, они внутренние
- Страницы размещаются в `pages/{page-name}-page/`. Имя папки всегда с суффиксом `-page`
- Страница-компонент — smart component: получает данные, использует сервисы, делегирует отображение presentational-компонентам из `ui-kit`
- Все компоненты — standalone, `ChangeDetectionStrategy.OnPush`, SCSS

**Текущая структура маршрутов**:

```
AppComponent (apps/frontend)
└── '' → loadChildren → feature-shell (SHELL_ROUTES)
    ├── ''       → FeatureShellComponent  (layout с <router-outlet>)
    └── 'users'  → loadChildren → feature-users (USERS_ROUTES)
                   └── ''  → UserListPageComponent
```

`feature-shell` — это shell-компонент: он задаёт layout (навигация, хедер, футер в будущем) и содержит `<router-outlet>` для всех дочерних feature.

### Data-access-библиотека (`libs/frontend/data-access-api/`)

Теги: `scope:frontend, type:data-access`. Все API-сервисы и Web Workers собраны в одной библиотеке, организованной по доменам.

```
libs/frontend/data-access-api/
  src/
    lib/
      controllers/
        {domain}/                       — один контроллер на API-домен
          index.ts                      — публичное API домена
          interfaces/
            {entity}.interface.ts       — интерфейсы DTO/моделей домена
          mappers/
            {entity}-{from}.mapper.ts   — статические классы для преобразования данных
          services/
            {domain}/
              {domain}.service.ts       — Angular Injectable-сервис, providedIn: 'root'
          workers/                      — (опционально) Web Workers для тяжёлых/стриминговых операций
            {domain}/
              {domain}-worker.ts        — WebWorker-файл (/// <reference lib="webworker" />)
    test-setup.ts
  project.json
  tsconfig.json / tsconfig.lib.json / tsconfig.spec.json
```

**Текущие домены**:

- `controllers/users/` — HTTP GET `/api/users`, возвращает `Observable<string[]>`
- `controllers/assets/` — стриминг цен активов через Web Worker:
  - `asset-worker.ts` — Web Worker, каждую секунду постит `["BTC/USD 42.5"]`
  - `AssetsApiService` — создаёт Worker лениво при первой подписке, оборачивает в `Observable`, использует `share({ resetOnRefCountZero: () => timer(60_000) })` — Worker живёт ещё 60 секунд после последнего подписчика, затем завершается
  - `AssetStringMapper.toDecimal("BTC/USD 42.5")` → `{ name: "BTC/USD", value: Decimal("42.5") }`
  - `IAsset` использует `Decimal` из `decimal.js` для точных вычислений

**Правила для data-access**:

- Каждый API-домен — отдельная папка `controllers/{domain}/`
- `index.ts` домена экспортирует только сервисы и типы, необходимые внешним потребителям
- Сервисы — `providedIn: 'root'`, используют `inject()` вместо constructor injection
- Маппинг данных — в статических классах `{Entity}{Format}Mapper` с методом `fromDto` / `toDto` и т.д.

### UI-библиотека (`libs/frontend/ui-kit/`)

Теги: `scope:frontend, type:ui`. Presentational-компоненты без бизнес-логики.

```
libs/frontend/ui-kit/
  src/
    index.ts                            — экспорт всех публичных компонентов
    lib/
      {component-name}/
        {component-name}.component.ts
        {component-name}.component.html
        {component-name}.component.scss
        {component-name}.component.spec.ts
  test-setup.ts
```

**Правила для ui-kit**:

- Компоненты получают данные только через `@Input()`, события — через `@Output()`
- Никаких инжектов сервисов из `data-access` или `feature` библиотек
- Все компоненты standalone, `ChangeDetectionStrategy.OnPush`
- `src/index.ts` экспортирует все публичные компоненты

### Util-библиотека (`libs/frontend/util-utils/`)

Теги: `scope:frontend, type:util`. Чистые функции, пайпы, константы без зависимостей от Angular DI.

```
libs/frontend/util-utils/
  src/
    index.ts
    lib/
      {util-name}.ts / {pipe-name}.pipe.ts
```

### Shared model-types (`libs/shared/model-types/`)

Теги: `scope:shared, type:lib`. Только TypeScript-интерфейсы, enum'ы и типы. Никаких Angular/NestJS зависимостей.

```
libs/shared/model-types/
  src/
    index.ts
    lib/
      {entity}.interface.ts / {entity}.enum.ts
```

---

## Создание новой библиотеки

Всегда используй кастомный генератор — он создаёт библиотеку, устанавливает теги и регистрирует path alias в `tsconfig.base.json` автоматически:

```bash
pnpm nx g workspace-tools:generate-lib
# Интерактивные подсказки: name, type, scope, directory (опционально)
```

Типы библиотек и их назначение:

| Тип           | Назначение                        | Где создавать                                     |
| ------------- | --------------------------------- | ------------------------------------------------- |
| `feature`     | Страницы, маршруты, lazy-loaded   | `libs/frontend/features/` (directory: `features`) |
| `data-access` | HTTP-сервисы, Web Workers, стейт  | `libs/frontend/` или `libs/backend/`              |
| `ui`          | Presentational Angular-компоненты | `libs/frontend/`                                  |
| `util`        | Чистые функции, пайпы             | `libs/frontend/` или `libs/backend/`              |
| `model`       | Интерфейсы, enum'ы                | `libs/shared/`                                    |

Path alias после генерации: `@ozon/{scope}/{directory}/{type}-{name}` или `@ozon/{scope}/{type}-{name}`.

---

## TypeScript path aliases

Все aliases определены в `tsconfig.base.json`. Добавляются автоматически генератором.

```
@ozon/frontend/features/feature-shell
@ozon/frontend/features/feature-users
@ozon/frontend/data-access-api/controllers/users
@ozon/frontend/data-access-api/controllers/assets
@ozon/frontend/ui-kit
@ozon/frontend/util-utils
@ozon/backend/util-utils
@ozon/shared/model-types
workspace-tools
```

**Важно**: `tsconfig.spec.json` в каждой библиотеке использует `moduleResolution: node10`, который требует наличия `baseUrl` для работы path aliases. `baseUrl: "."` задан в `tsconfig.base.json`.

---

## Backend

NestJS 11, компилируется через Webpack (`NxAppWebpackPlugin`). Порт 3000, глобальный префикс `/api`. Frontend dev-сервер проксирует `/api/**` на backend (`proxy.conf.json`).

Текущие эндпоинты:

- `GET /api` → `{ message: 'Hello API' }`
- `GET /api/users` → `['User 1', 'User 2', ...]` (захардкожено, БД отсутствует)

---

## Angular-настройки по умолчанию (nx.json)

Все Angular-генераторы (`@nx/angular:component`, `@nx/angular:library`) предварительно настроены:

- Стили: `scss`
- Change detection: `OnPush`
- Standalone: `true`
- Skip NgModule: `true`

Не переопределяй эти настройки без явной необходимости.
