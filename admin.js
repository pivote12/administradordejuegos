const LANG_STORAGE_KEY = "admin-lang";

const LANG_OPTIONS = [
  { code: "es", label: "Español" },
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "pt", label: "Português" },
  { code: "it", label: "Italiano" },
  { code: "ru", label: "Русский" },
  { code: "pl", label: "Polski" },
  { code: "nl", label: "Nederlands" },
  { code: "zh", label: "中文" },
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" },
];

const UI = {
  es: {
    pageTitle: "Administrador De Juegos",
    heroTitle: "Administrador De Juegos",
    heroSubtitle: "Elige un juego de la biblioteca y empieza a jugar.",
    library: "Biblioteca",
    searchLabel: "Buscar juego",
    searchPlaceholder: "Buscar por nombre…",
    play: "Jugar",
    comingSoon: "Próximamente",
    creator: "Creador",
    noDescription: "Sin descripción.",
    emptySearch: "No hay juegos que coincidan con la búsqueda.",
    emptyList: "No hay juegos registrados. Añade uno en games.json.",
    footer: "Los juegos viven en la carpeta Juegos/. Para añadir uno nuevo, copia su carpeta ahí y regístralo en games.json.",
    langLabel: "Idioma",
    gamesCount: (n) => `${n} juego${n === 1 ? "" : "s"}`,
    gamesCountFiltered: (v, t) => `${v} de ${t}`,
    packsBtn: "📦 Packs",
  },
  en: {
    pageTitle: "Game Manager",
    heroTitle: "Game Manager",
    heroSubtitle: "Pick a game from the library and start playing.",
    library: "Library",
    searchLabel: "Search game",
    searchPlaceholder: "Search by name…",
    play: "Play",
    comingSoon: "Coming soon",
    creator: "Creator",
    noDescription: "No description.",
    emptySearch: "No games match your search.",
    emptyList: "No games registered. Add one in games.json.",
    footer: "Games live in the Juegos/ folder. To add a new one, copy its folder there and register it in games.json.",
    langLabel: "Language",
    gamesCount: (n) => `${n} game${n === 1 ? "" : "s"}`,
    gamesCountFiltered: (v, t) => `${v} of ${t}`,
    packsBtn: "📦 Packs",
  },
  fr: {
    pageTitle: "Gestionnaire de jeux",
    heroTitle: "Gestionnaire de jeux",
    heroSubtitle: "Choisissez un jeu dans la bibliothèque et commencez à jouer.",
    library: "Bibliothèque",
    searchLabel: "Rechercher un jeu",
    searchPlaceholder: "Rechercher par nom…",
    play: "Jouer",
    comingSoon: "Bientôt",
    creator: "Créateur",
    noDescription: "Aucune description.",
    emptySearch: "Aucun jeu ne correspond à votre recherche.",
    emptyList: "Aucun jeu enregistré. Ajoutez-en un dans games.json.",
    footer: "Les jeux se trouvent dans le dossier Juegos/. Pour en ajouter un, copiez son dossier et enregistrez-le dans games.json.",
    langLabel: "Langue",
    gamesCount: (n) => `${n} jeu${n === 1 ? "" : "x"}`,
    gamesCountFiltered: (v, t) => `${v} sur ${t}`,
  },
  de: {
    pageTitle: "Spiele-Administrator",
    heroTitle: "Spiele-Administrator",
    heroSubtitle: "Wähle ein Spiel aus der Bibliothek und leg los.",
    library: "Bibliothek",
    searchLabel: "Spiel suchen",
    searchPlaceholder: "Nach Name suchen…",
    play: "Spielen",
    comingSoon: "Demnächst",
    creator: "Ersteller",
    noDescription: "Keine Beschreibung.",
    emptySearch: "Keine Spiele passen zur Suche.",
    emptyList: "Keine Spiele registriert. Füge eines in games.json hinzu.",
    footer: "Spiele liegen im Ordner Juegos/. Um ein neues hinzuzufügen, kopiere seinen Ordner dorthin und trage es in games.json ein.",
    langLabel: "Sprache",
    gamesCount: (n) => `${n} Spiel${n === 1 ? "" : "e"}`,
    gamesCountFiltered: (v, t) => `${v} von ${t}`,
  },
  pt: {
    pageTitle: "Administrador de Jogos",
    heroTitle: "Administrador de Jogos",
    heroSubtitle: "Escolha um jogo da biblioteca e comece a jogar.",
    library: "Biblioteca",
    searchLabel: "Buscar jogo",
    searchPlaceholder: "Buscar por nome…",
    play: "Jogar",
    comingSoon: "Em breve",
    creator: "Criador",
    noDescription: "Sem descrição.",
    emptySearch: "Nenhum jogo corresponde à busca.",
    emptyList: "Nenhum jogo registrado. Adicione um em games.json.",
    footer: "Os jogos ficam na pasta Juegos/. Para adicionar um novo, copie a pasta e registre em games.json.",
    langLabel: "Idioma",
    gamesCount: (n) => `${n} jogo${n === 1 ? "" : "s"}`,
    gamesCountFiltered: (v, t) => `${v} de ${t}`,
  },
  it: {
    pageTitle: "Gestore Giochi",
    heroTitle: "Gestore Giochi",
    heroSubtitle: "Scegli un gioco dalla libreria e inizia a giocare.",
    library: "Libreria",
    searchLabel: "Cerca gioco",
    searchPlaceholder: "Cerca per nome…",
    play: "Gioca",
    comingSoon: "Prossimamente",
    creator: "Creatore",
    noDescription: "Nessuna descrizione.",
    emptySearch: "Nessun gioco corrisponde alla ricerca.",
    emptyList: "Nessun gioco registrato. Aggiungine uno in games.json.",
    footer: "I giochi si trovano nella cartella Juegos/. Per aggiungerne uno, copia la cartella e registralo in games.json.",
    langLabel: "Lingua",
    gamesCount: (n) => `${n} gioco${n === 1 ? "" : "chi"}`,
    gamesCountFiltered: (v, t) => `${v} di ${t}`,
  },
  ru: {
    pageTitle: "Менеджер игр",
    heroTitle: "Менеджер игр",
    heroSubtitle: "Выберите игру из библиотеки и начните играть.",
    library: "Библиотека",
    searchLabel: "Поиск игры",
    searchPlaceholder: "Поиск по названию…",
    play: "Играть",
    comingSoon: "Скоро",
    creator: "Создатель",
    noDescription: "Нет описания.",
    emptySearch: "Нет игр по вашему запросу.",
    emptyList: "Игры не зарегистрированы. Добавьте в games.json.",
    footer: "Игры находятся в папке Juegos/. Чтобы добавить новую, скопируйте папку и зарегистрируйте в games.json.",
    langLabel: "Язык",
    gamesCount: (n) => `${n} игр${n === 1 ? "а" : ""}`,
    gamesCountFiltered: (v, t) => `${v} из ${t}`,
  },
  pl: {
    pageTitle: "Menedżer gier",
    heroTitle: "Menedżer gier",
    heroSubtitle: "Wybierz grę z biblioteki i zacznij grać.",
    library: "Biblioteka",
    searchLabel: "Szukaj gry",
    searchPlaceholder: "Szukaj po nazwie…",
    play: "Graj",
    comingSoon: "Wkrótce",
    creator: "Twórca",
    noDescription: "Brak opisu.",
    emptySearch: "Brak gier pasujących do wyszukiwania.",
    emptyList: "Brak zarejestrowanych gier. Dodaj w games.json.",
    footer: "Gry znajdują się w folderze Juegos/. Aby dodać nową, skopiuj folder i zarejestruj w games.json.",
    langLabel: "Język",
    gamesCount: (n) => `${n} gr${n === 1 ? "a" : "y"}`,
    gamesCountFiltered: (v, t) => `${v} z ${t}`,
  },
  nl: {
    pageTitle: "Spelbeheer",
    heroTitle: "Spelbeheer",
    heroSubtitle: "Kies een spel uit de bibliotheek en begin te spelen.",
    library: "Bibliotheek",
    searchLabel: "Spel zoeken",
    searchPlaceholder: "Zoeken op naam…",
    play: "Spelen",
    comingSoon: "Binnenkort",
    creator: "Maker",
    noDescription: "Geen beschrijving.",
    emptySearch: "Geen spellen gevonden voor je zoekopdracht.",
    emptyList: "Geen spellen geregistreerd. Voeg er een toe in games.json.",
    footer: "Spellen staan in de map Juegos/. Kopieer een map daarheen en registreer in games.json.",
    langLabel: "Taal",
    gamesCount: (n) => `${n} spel${n === 1 ? "" : "en"}`,
    gamesCountFiltered: (v, t) => `${v} van ${t}`,
  },
  zh: {
    pageTitle: "游戏管理器",
    heroTitle: "游戏管理器",
    heroSubtitle: "从游戏库中选择一个游戏并开始游玩。",
    library: "游戏库",
    searchLabel: "搜索游戏",
    searchPlaceholder: "按名称搜索…",
    play: "游玩",
    comingSoon: "即将推出",
    creator: "创作者",
    noDescription: "暂无描述。",
    emptySearch: "没有匹配的游戏。",
    emptyList: "没有注册的游戏。请在 games.json 中添加。",
    footer: "游戏位于 Juegos/ 文件夹。要添加新游戏，请复制文件夹并在 games.json 中注册。",
    langLabel: "语言",
    gamesCount: (n) => `${n} 个游戏`,
    gamesCountFiltered: (v, t) => `${v} / ${t}`,
  },
  ja: {
    pageTitle: "ゲーム管理",
    heroTitle: "ゲーム管理",
    heroSubtitle: "ライブラリからゲームを選んでプレイを始めましょう。",
    library: "ライブラリ",
    searchLabel: "ゲームを検索",
    searchPlaceholder: "名前で検索…",
    play: "プレイ",
    comingSoon: "近日公開",
    creator: "作成者",
    noDescription: "説明なし。",
    emptySearch: "検索に一致するゲームがありません。",
    emptyList: "登録されたゲームがありません。games.json に追加してください。",
    footer: "ゲームは Juegos/ フォルダにあります。新しいゲームを追加するにはフォルダをコピーし games.json に登録してください。",
    langLabel: "言語",
    gamesCount: (n) => `${n} 件のゲーム`,
    gamesCountFiltered: (v, t) => `${v} / ${t}`,
  },
  ko: {
    pageTitle: "게임 관리자",
    heroTitle: "게임 관리자",
    heroSubtitle: "라이브러리에서 게임을 선택하고 플레이를 시작하세요.",
    library: "라이브러리",
    searchLabel: "게임 검색",
    searchPlaceholder: "이름으로 검색…",
    play: "플레이",
    comingSoon: "출시 예정",
    creator: "제작자",
    noDescription: "설명 없음.",
    emptySearch: "검색과 일치하는 게임이 없습니다.",
    emptyList: "등록된 게임이 없습니다. games.json에 추가하세요.",
    footer: "게임은 Juegos/ 폴더에 있습니다. 새 게임을 추가하려면 폴더를 복사하고 games.json에 등록하세요.",
    langLabel: "언어",
    gamesCount: (n) => `게임 ${n}개`,
    gamesCountFiltered: (v, t) => `${v} / ${t}`,
  },
};

const GAME_I18N = {
  "algicosathlon-maker-english": {
    es: { name: "Algicosathlon Maker", description: "Creá juegos, diseñá pelotas y competí en el Algicosathlon." },
    en: { name: "Algicosathlon Maker In English", description: "Create games, design balls and compete in the Algicosathlon." },
    fr: { name: "Algicosathlon Maker", description: "Créez des jeux, concevez des balles et participez à l'Algicosathlon." },
    de: { name: "Algicosathlon Maker", description: "Erstelle Spiele, entwirf Bälle und tritt im Algicosathlon an." },
    pt: { name: "Algicosathlon Maker", description: "Crie jogos, desenhe bolas e compita no Algicosathlon." },
    it: { name: "Algicosathlon Maker", description: "Crea giochi, progetta palline e competi nell'Algicosathlon." },
    ru: { name: "Algicosathlon Maker", description: "Создавайте игры, шары и соревнуйтесь в Algicosathlon." },
    pl: { name: "Algicosathlon Maker", description: "Twórz gry, piłki i rywalizuj w Algicosathlon." },
    nl: { name: "Algicosathlon Maker", description: "Maak spellen, ballen en strijd in de Algicosathlon." },
    zh: { name: "Algicosathlon Maker", description: "创建游戏、设计球并在 Algicosathlon 中竞技。" },
    ja: { name: "Algicosathlon Maker", description: "ゲームとボールを作り、Algicosathlon で競おう。" },
    ko: { name: "Algicosathlon Maker", description: "게임과 공을 만들고 Algicosathlon에서 경쟁하세요." },
  },
  "decimal-explorer": {
    es: { name: "Explorador Decimal", description: "Descubrí qué números famosos comparten los mismos dígitos iniciales." },
    en: { name: "Decimal Explorer", description: "Discover which famous numbers share the same starting digits." },
    fr: { name: "Explorateur décimal", description: "Découvrez quels nombres célèbres partagent les mêmes premiers chiffres." },
    de: { name: "Dezimal-Explorer", description: "Entdecke, welche berühmten Zahlen dieselben Anfangsziffern teilen." },
    pt: { name: "Explorador Decimal", description: "Descubra quais números famosos compartilham os mesmos dígitos iniciais." },
    it: { name: "Esploratore decimale", description: "Scopri quali numeri famosi condividono le stesse cifre iniziali." },
    ru: { name: "Десятичный исследователь", description: "Узнайте, какие числа начинаются одинаково." },
    pl: { name: "Eksplorator dziesiętny", description: "Odkryj, które liczby mają te same cyfry początkowe." },
    nl: { name: "Decimale verkenner", description: "Ontdek welke getallen dezelfde begincijfers delen." },
    zh: { name: "小数探索器", description: "发现哪些著名数字以相同数字开头。" },
    ja: { name: "小数エクスプローラー", description: "同じ桁で始まる有名な数を見つけよう。" },
    ko: { name: "소수 탐험가", description: "같은 숫자로 시작하는 유명한 수를 찾아보세요." },
  },
  bruchimichis: {
    es: { name: "bruchimichis", description: "Creá gatitos, movelos y hacelos correr en carreras." },
    en: { name: "bruchimichis", description: "Create kittens, move them and make them race." },
    fr: { name: "bruchimichis", description: "Créez des chatons, déplacez-les et faites-les courir." },
    de: { name: "bruchimichis", description: "Erstelle Kätzchen, bewege sie und lass sie rennen." },
    pt: { name: "bruchimichis", description: "Crie gatinhos, mova-os e faça-os correr." },
    it: { name: "bruchimichis", description: "Crea gattini, muovili e falli correre." },
    ru: { name: "bruchimichis", description: "Создавайте котят, двигайте и устраивайте гонки." },
    pl: { name: "bruchimichis", description: "Twórz kociaki, przesuwaj i ścigaj." },
    nl: { name: "bruchimichis", description: "Maak kittens, verplaats ze en laat ze racen." },
    zh: { name: "bruchimichis", description: "创建小猫，移动它们并比赛。" },
    ja: { name: "bruchimichis", description: "子猫を作って動かし、レースさせよう。" },
    ko: { name: "bruchimichis", description: "고양이를 만들고 움직이고 경주하세요." },
  },
  neymarmichis: {
    es: { name: "Neymarmichis", description: "Creá gatos futbolistas con camiseta y stats, cuidalos y jugá Fuchibol contra la IA." },
    en: { name: "Neymarmichis", description: "Create footballer cats with jerseys and stats, care for them, and play Fuchibol vs the AI." },
    fr: { name: "Neymarmichis", description: "Crée des chats footballeurs avec maillot et stats, prends-en soin et joue au Fuchibol contre l'IA." },
    de: { name: "Neymarmichis", description: "Erstelle Fußball-Katzen mit Trikot und Stats, pflege sie und spiele Fuchibol gegen die KI." },
    pt: { name: "Neymarmichis", description: "Crie gatos futebolistas com camisa e stats, cuide deles e jogue Fuchibol contra a IA." },
    it: { name: "Neymarmichis", description: "Crea gatti calciatori con maglia e stats, curarli e gioca a Fuchibol contro l'IA." },
    ru: { name: "Neymarmichis", description: "Создавайте котов-футболистов с формой и статами, ухаживайте и играйте в Fuchibol против ИИ." },
    pl: { name: "Neymarmichis", description: "Twórz koty-piłkarzy z koszulką i statystykami, opiekuj się nimi i graj w Fuchibol przeciw AI." },
    nl: { name: "Neymarmichis", description: "Maak voetbalkatten met shirt en stats, verzorg ze en speel Fuchibol tegen de AI." },
    zh: { name: "Neymarmichis", description: "创建带球衣和属性的足球猫，照顾它们，并与 AI 踢 Fuchibol。" },
    ja: { name: "Neymarmichis", description: "ユニフォームと能力付きのサッカー猫を作り、世話をして AI と Fuchibol する。" },
    ko: { name: "Neymarmichis", description: "유니폼과 스탯이 있는 축구 고양이를 만들고 돌본 뒤 AI와 Fuchibol을 하세요." },
  },
  "creador-2d": {
    es: { name: "Creador 2D", description: "Crea tu propio mundo en 2D con un editor de bloques." },
    en: { name: "2D Creator", description: "Create your own 2D world with a block editor." },
    fr: { name: "Créateur 2D", description: "Créez votre propre monde 2D avec un éditeur de blocs." },
    de: { name: "2D-Ersteller", description: "Erstelle deine eigene 2D-Welt mit einem Block-Editor." },
    pt: { name: "Criador 2D", description: "Crie seu próprio mundo 2D com um editor de blocos." },
    it: { name: "Creatore 2D", description: "Crea il tuo mondo 2D con un editor a blocchi." },
    ru: { name: "2D Создатель", description: "Создайте свой 2D мир с редактором блоков." },
    pl: { name: "Kreator 2D", description: "Stwórz swój świat 2D z edytorem bloków." },
    nl: { name: "2D Maker", description: "Maak je eigen 2D-wereld met een blokeditor." },
    zh: { name: "2D 创造者", description: "用方块编辑器创建你的2D世界。" },
    ja: { name: "2Dクリエイター", description: "ブロックエディターで2D世界を作ろう。" },
    ko: { name: "2D 크리에이터", description: "블록 에디터로 2D 세계를 만드세요." },
  },
  "object-battle": {
    es: { name: "Object Battle", description: "Creá objetos con caras, dejalos caer del cielo y cambiá de personaje con Z." },
    en: { name: "Object Battle", description: "Create objects with faces, drop from the sky, and switch characters with Z." },
    fr: { name: "Object Battle", description: "Créez des objets avec des visages, laissez-les tomber et changez de personnage avec Z." },
    de: { name: "Object Battle", description: "Erstelle Objekte mit Gesichtern, lasse sie fallen und wechsle mit Z den Charakter." },
    pt: { name: "Object Battle", description: "Crie objetos com rostos, deixe-os cair e troque de personagem com Z." },
    it: { name: "Object Battle", description: "Crea oggetti con facce, falli cadere e cambia personaggio con Z." },
    ru: { name: "Object Battle", description: "Создавайте объекты с лицами, роняйте их и переключайтесь клавишей Z." },
    pl: { name: "Object Battle", description: "Twórz obiekty z twarzami, upuszczaj je i przełączaj klawiszem Z." },
    nl: { name: "Object Battle", description: "Maak objecten met gezichten, laat ze vallen en wissel met Z." },
    zh: { name: "Object Battle", description: "创建有脸的对象，从天上掉落，用Z切换。" },
    ja: { name: "Object Battle", description: "顔付きオブジェクトを作り、落としてZで切り替え。" },
    ko: { name: "Object Battle", description: "얼굴이 있는 객체를 만들고 떨어뜨리며 Z로 전환하세요." },
  },
  "bloc-de-notas": {
    es: { name: "Bloc De Notas", description: "Bloc de notas simple para anotar lo que quieras." },
    en: { name: "Notepad", description: "Simple notepad to write whatever you want." },
    fr: { name: "Bloc-notes", description: "Bloc-notes simple pour écrire ce que vous voulez." },
    de: { name: "Notizblock", description: "Einfacher Notizblock für alles, was du notieren willst." },
    pt: { name: "Bloco de Notas", description: "Bloco de notas simples para anotar o que quiser." },
    it: { name: "Blocco note", description: "Blocco note semplice per scrivere quello che vuoi." },
    ru: { name: "Блокнот", description: "Простой блокнот для любых записей." },
    pl: { name: "Notatnik", description: "Prosty notatnik na wszystko, co chcesz." },
    nl: { name: "Notitieblok", description: "Eenvoudig notitieblok voor alles wat je wilt." },
    zh: { name: "记事本", description: "简单的记事本，写你想写的。" },
    ja: { name: "メモ帳", description: "好きなことを書けるシンプルなメモ帳。" },
    ko: { name: "메모장", description: "원하는 대로 적는 간단한 메모장." },
  },
  "country-notes": {
    es: { name: "Country Notes", description: "Creá países y aparecen en el mapa como bloques 128×128." },
    en: { name: "Country Notes", description: "Create countries and they appear on the map as 128×128 blocks." },
    fr: { name: "Country Notes", description: "Créez des pays qui apparaissent sur la carte en blocs 128×128." },
    de: { name: "Country Notes", description: "Erstelle Länder, die als 128×128-Blöcke auf der Karte erscheinen." },
    pt: { name: "Country Notes", description: "Crie países que aparecem no mapa como blocos 128×128." },
    it: { name: "Country Notes", description: "Crea paesi che appaiono sulla mappa come blocchi 128×128." },
    ru: { name: "Country Notes", description: "Создавайте страны на карте как блоки 128×128." },
    pl: { name: "Country Notes", description: "Twórz kraje na mapie jako bloki 128×128." },
    nl: { name: "Country Notes", description: "Maak landen op de kaart als 128×128 blokken." },
    zh: { name: "Country Notes", description: "创建国家，在地图上显示为128×128方块。" },
    ja: { name: "Country Notes", description: "国を作り、128×128の地図に表示。" },
    ko: { name: "Country Notes", description: "국가를 만들어 128×128 지도에 표시하세요." },
  },
  "shape-bowl-race": {
    es: { name: "Shape Bowl Race", description: "Creá pelotitas, corre en el tazón con Salto y Vuelta, y guardá Ganancias." },
    en: { name: "Shape Bowl Race", description: "Create balls, race in the bowl with Jump and Turn, and track Earnings." },
    fr: { name: "Shape Bowl Race", description: "Créez des balles, courez dans le bol avec Saut et Tour, et enregistrez les gains." },
    de: { name: "Shape Bowl Race", description: "Erstelle Bälle, renne in der Schüssel mit Sprung und Drehung und sammle Gewinne." },
    pt: { name: "Shape Bowl Race", description: "Crie bolas, corra na tigela com Salto e Volta e guarde Ganhos." },
    it: { name: "Shape Bowl Race", description: "Crea palline, gareggia nella ciotola con Salto e Giro e traccia i guadagni." },
    ru: { name: "Shape Bowl Race", description: "Создавайте шары, гоняйте в миске и копите доходы." },
    pl: { name: "Shape Bowl Race", description: "Twórz piłki, ścigaj w misce i zbieraj zyski." },
    nl: { name: "Shape Bowl Race", description: "Maak ballen, race in de kom en bewaar winst." },
    zh: { name: "Shape Bowl Race", description: "创建球，在碗中比赛并记录收益。" },
    ja: { name: "Shape Bowl Race", description: "ボールを作り、ボウルレースで収益を貯めよう。" },
    ko: { name: "Shape Bowl Race", description: "공을 만들고 그릇 레이스에서 수익을 쌓으세요." },
  },
  "ruleta-especial": {
    es: { name: "Ruleta Especial", description: "Escribí opciones, girá la ruleta y guardá el historial de ganadores." },
    en: { name: "Special Roulette", description: "Write options, spin the wheel, and keep a winners history." },
    fr: { name: "Roulette Spéciale", description: "Écrivez des options, tournez la roulette et gardez l'historique." },
    de: { name: "Spezial-Roulette", description: "Optionen schreiben, Rad drehen und Gewinnerhistorie speichern." },
    pt: { name: "Roleta Especial", description: "Escreva opções, gire a roleta e guarde o histórico de vencedores." },
    it: { name: "Ruota Speciale", description: "Scrivi opzioni, gira la ruota e salva lo storico dei vincitori." },
    ru: { name: "Особая рулетка", description: "Пишите варианты, крутите колесо и храните историю победителей." },
    pl: { name: "Specjalna ruletka", description: "Wpisz opcje, zakręć kołem i zapisz historię zwycięzców." },
    nl: { name: "Speciale roulette", description: "Schrijf opties, draai het rad en bewaar de winnaarsgeschiedenis." },
    zh: { name: "特别轮盘", description: "填写选项、转动轮盘并保存获奖记录。" },
    ja: { name: "スペシャルルーレット", description: "選択肢を書いてルーレットを回し、勝者履歴を残そう。" },
    ko: { name: "스페셜 룰렛", description: "옵션을 적고 룰렛을 돌려 승자 기록을 남기세요." },
  },
  "cronometro-loco": {
    es: { name: "Cronómetro Loco", description: "Un cronómetro con chances locas en cada segundo." },
    en: { name: "Crazy Stopwatch", description: "A stopwatch with crazy chances every second." },
    fr: { name: "Chronomètre Fou", description: "Un chronomètre avec des chances folles chaque seconde." },
    de: { name: "Verrückte Stoppuhr", description: "Eine Stoppuhr mit verrückten Chancen jede Sekunde." },
    pt: { name: "Cronômetro Louco", description: "Um cronômetro com chances loucas a cada segundo." },
    it: { name: "Cronometro Pazzo", description: "Un cronometro con probabilità pazze ogni secondo." },
    ru: { name: "Безумный секундомер", description: "Секундомер со странными шансами каждую секунду." },
    pl: { name: "Szalony stoper", description: "Stoper z szalonymi szansami co sekundę." },
    nl: { name: "Gekke stopwatch", description: "Een stopwatch met gekke kansen elke seconde." },
    zh: { name: "疯狂秒表", description: "每秒都有疯狂概率的秒表。" },
    ja: { name: "クレイジー秒時計", description: "毎秒クレイジーな確率があるストップウォッチ。" },
    ko: { name: "미친 스톱워치", description: "매초 미친 확률이 있는 스톱워치." },
  },
  "marble-escape": {
    es: { name: "Marble Escape", description: "Creá marbles y guialos por una fábrica difícil con bloques, lava y una zona segura." },
    en: { name: "Marble Escape", description: "Create marbles and guide them through a hard factory with blocks, lava, and a safe zone." },
    fr: { name: "Marble Escape", description: "Créez des billes et guidez-les dans une usine difficile pleine de lave." },
    de: { name: "Marble Escape", description: "Erstelle Murmeln und führe sie durch eine schwierige Fabrik voller Lava." },
    pt: { name: "Marble Escape", description: "Crie bolinhas e guie-as por uma fábrica difícil cheia de lava." },
    it: { name: "Marble Escape", description: "Crea biglie e guidale in una fabbrica difficile piena di lava." },
    ru: { name: "Marble Escape", description: "Создавайте шарики и ведите их через сложную фабрику с лавой." },
    pl: { name: "Marble Escape", description: "Twórz kulki i prowadź je przez trudną fabrykę pełną lawy." },
    nl: { name: "Marble Escape", description: "Maak knikkers en leid ze door een moeilijke fabriek vol lava." },
    zh: { name: "Marble Escape", description: "创建弹珠，引导它们穿过充满熔岩的困难工厂。" },
    ja: { name: "Marble Escape", description: "ビー玉を作り、溶岩だらけの難しい工場を進もう。" },
    ko: { name: "Marble Escape", description: "구슬을 만들고 용암이 가득한 어려운 공장을 통과하세요." },
  },
  "tipo-knowledge": {
    es: { name: "Tipo Knowledge", description: "Creá Lugares De Tipo, armá equipos con logo y asigná un tipo a cada pelotita." },
    en: { name: "Tipo Knowledge", description: "Create Type Places, build teams with a logo, and give every marble a type." },
    fr: { name: "Tipo Knowledge", description: "Crée des Lieux de Type, des équipes avec logo, et donne un type à chaque bille." },
    de: { name: "Tipo Knowledge", description: "Erstelle Typ-Orte, Teams mit Logo, und gib jeder Murmel einen Typ." },
    pt: { name: "Tipo Knowledge", description: "Crie Lugares de Tipo, equipes com logo, e dê um tipo a cada bolinha." },
    it: { name: "Tipo Knowledge", description: "Crea Luoghi di Tipo, squadre con logo, e assegna un tipo a ogni biglia." },
    ru: { name: "Tipo Knowledge", description: "Создавайте места типов, команды с логотипом и дайте тип каждому шарику." },
    pl: { name: "Tipo Knowledge", description: "Twórz miejsca typów, drużyny z logo i nadaj typ każdej kulce." },
    nl: { name: "Tipo Knowledge", description: "Maak typeplekken, teams met logo, en geef elke knikker een type." },
    zh: { name: "Tipo Knowledge", description: "创建类型地点，带标志的队伍，并给每颗弹珠一个类型。" },
    ja: { name: "Tipo Knowledge", description: "タイプの場所を作り、ロゴ付きチームを用意して、ビー玉にタイプを付けよう。" },
    ko: { name: "Tipo Knowledge", description: "타입 장소를 만들고, 로고가 있는 팀을 만든 뒤, 구슬마다 타입을 주세요." },
  },
  pinball: {
    es: { name: "Pinball", description: "Elegí pelotitas de tus packs y jugá en una mesa con túnel, círculos de punto y círculos de dinero." },
    en: { name: "Pinball", description: "Pick marbles from your packs and play a table with a tunnel, point circles and money circles." },
    fr: { name: "Pinball", description: "Choisis des billes de tes packs et joue sur une table avec tunnel, cercles de points et cercles d'argent." },
    de: { name: "Pinball", description: "Wähle Murmeln aus deinen Packs und spiele einen Tisch mit Tunnel, Punktekreisen und Geldkreisen." },
    pt: { name: "Pinball", description: "Escolha bolinhas dos seus packs e jogue numa mesa com túnel, círculos de ponto e círculos de dinheiro." },
    it: { name: "Pinball", description: "Scegli le biglie dei tuoi pack e gioca su un tavolo con tunnel, cerchi punto e cerchi denaro." },
    ru: { name: "Pinball", description: "Выберите шарики из паков и играйте на столе с туннелем, кругами очков и кругами денег." },
    pl: { name: "Pinball", description: "Wybierz kulki z paczek i graj na stole z tunelem, kołami punktów i kołami pieniędzy." },
    nl: { name: "Pinball", description: "Kies knikkers uit je packs en speel op een tafel met tunnel, puntencirkels en geldcirkels." },
    zh: { name: "Pinball", description: "从包里选弹珠，在有隧道、得分圈和金钱圈的桌上玩。" },
    ja: { name: "Pinball", description: "パックからビー玉を選び、トンネルと得点サークルとお金サークルの台で遊ぼう。" },
    ko: { name: "Pinball", description: "팩에서 구슬을 골라, 터널과 점수 원과 돈 원이 있는 테이블에서 플레이하세요." },
  },
  "carrera-blitz": {
    es: { name: "Carrera Blitz", description: "Elegí una pelotita de tus packs y corré una pista neón: speedrun contra el reloj o carrera contra la IA y tu pack." },
    en: { name: "Blitz Race", description: "Pick a marble from your packs and run a neon track: time trial or a race against the AI and your pack." },
    fr: { name: "Course Blitz", description: "Choisis une bille de tes packs et cours sur une piste néon : contre la montre ou course contre l'IA et ton pack." },
    de: { name: "Blitz-Rennen", description: "Wähle eine Murmel aus deinen Packs und renn eine Neonstrecke: Zeitfahren oder Rennen gegen die KI und dein Pack." },
    pt: { name: "Corrida Blitz", description: "Escolha uma bolinha dos seus packs e corra uma pista neon: contra o relógio ou corrida contra a IA e o seu pack." },
    it: { name: "Gara Blitz", description: "Scegli una biglia dei tuoi pack e corri una pista neon: a tempo o gara contro l'IA e il tuo pack." },
    ru: { name: "Гонка Blitz", description: "Выберите шарик из паков и бегите по неоновой трассе: на время или гонка против ИИ и вашего пака." },
    pl: { name: "Wyścig Blitz", description: "Wybierz kulkę z paczek i biegnij neonowym torem: na czas albo wyścig z SI i twoją paczką." },
    nl: { name: "Blitz-race", description: "Kies een knikker uit je packs en ren een neonbaan: tijdrit of race tegen de AI en je pack." },
    zh: { name: "闪电赛跑", description: "从包里选一颗弹珠，在霓虹赛道上跑：计时赛，或和 AI 以及你的包一起比赛。" },
    ja: { name: "ブリッツレース", description: "パックからビー玉を選び、ネオンコースを走ろう。タイムアタック、またはAIとパックとのレース。" },
    ko: { name: "블리츠 레이스", description: "팩에서 구슬을 골라 네온 트랙을 달리세요. 타임어택, 또는 AI와 팩과의 레이스." },
  },
  "pinki-glamour": {
    es: { name: "Pinki's Glamour Rush: ¡El Desfile de Plataforma!", description: "Elegí una pelotita, cruzá 50 pasarelas al ritmo y juntá estilo. También hay carrera contra 3 rivales y una tienda de accesorios." },
    en: { name: "Pinki's Glamour Rush: The Platform Parade!", description: "Pick a marble, cross 50 runways on the beat and collect style. There is also a race against 3 rivals and an accessory shop." },
    fr: { name: "Pinki's Glamour Rush : Le Défilé Plateforme !", description: "Choisis une bille, traverse 50 podiums en rythme et collectionne du style. Il y a aussi une course contre 3 rivales et une boutique." },
    de: { name: "Pinki's Glamour Rush: Die Plattform-Parade!", description: "Wähle eine Murmel, überquere 50 Laufstege im Takt und sammle Stil. Dazu ein Rennen gegen 3 Rivalen und ein Accessoire-Shop." },
    pt: { name: "Pinki's Glamour Rush: O Desfile de Plataforma!", description: "Escolha uma bolinha, cruze 50 passarelas no ritmo e junte estilo. Também há corrida contra 3 rivais e uma loja de acessórios." },
    it: { name: "Pinki's Glamour Rush: La Sfilata Piattaforma!", description: "Scegli una biglia, attraversa 50 passerelle a ritmo e raccogli stile. C'è anche una gara contro 3 rivali e un negozio." },
    ru: { name: "Pinki's Glamour Rush: Подиум-платформа!", description: "Выберите шарик, пройдите 50 подиумов в ритм и соберите стиль. Есть гонка против 3 соперниц и магазин." },
    pl: { name: "Pinki's Glamour Rush: Parada Platform!", description: "Wybierz kulkę, przejdź 50 wybiegów w rytm i zbieraj styl. Jest też wyścig z 3 rywalkami i sklep." },
    nl: { name: "Pinki's Glamour Rush: De Platformparade!", description: "Kies een knikker, steek 50 catwalks op de beat over en verzamel stijl. Er is ook een race tegen 3 rivalen en een winkel." },
    zh: { name: "Pinki's Glamour Rush：平台时装秀！", description: "选一颗弹珠，踩着节拍走过 50 条秀场，收集风格分。也可以和 3 个对手比赛，还有配饰店。" },
    ja: { name: "Pinki's Glamour Rush：プラットフォーム・パレード！", description: "ビー玉を選んで、ビートに合わせて50のランウェイを渡り、スタイルを集めよう。3人とのレースとアクセサリー店もある。" },
    ko: { name: "Pinki's Glamour Rush: 플랫폼 퍼레이드!", description: "구슬을 고르고, 비트에 맞춰 50개 런웨이를 건너 스타일을 모으세요. 3명의 라이벌 레이스와 액세서리 가게도 있습니다." },
  },
  "yeller-jackpot": {
    es: { name: "Yeller's Lucky Jackpot: ¡El Desafío de la Suerte Dorada!", description: "Elegí una pelotita, tirá el dado de 12 caras y cruzá 20 tableros de suerte. En el Royale, 4 pelotitas compiten por 1.000 monedas o por el Jackpot." },
    en: { name: "Yeller's Lucky Jackpot: The Golden Luck Challenge!", description: "Pick a marble, roll a 12-sided die and cross 20 luck boards. In Royale, 4 marbles race to 1,000 coins or the Jackpot." },
    fr: { name: "Yeller's Lucky Jackpot : Le Défi de la Chance Dorée !", description: "Choisis une bille, lance un dé à 12 faces et traverse 20 plateaux. En Royale, 4 billes visent 1 000 pièces ou le Jackpot." },
    de: { name: "Yeller's Lucky Jackpot: Die goldene Glücks-Challenge!", description: "Wähle eine Murmel, würfle mit 12 Seiten und schaffe 20 Bretter. Im Royale kämpfen 4 Murmeln um 1.000 Münzen oder den Jackpot." },
    pt: { name: "Yeller's Lucky Jackpot: O Desafio da Sorte Dourada!", description: "Escolha uma bolinha, lance um dado de 12 faces e cruze 20 tabuleiros. No Royale, 4 bolinhas buscam 1.000 moedas ou o Jackpot." },
    it: { name: "Yeller's Lucky Jackpot: La Sfida della Fortuna Dorata!", description: "Scegli una biglia, tira un dado da 12 facce e supera 20 tabelloni. Nel Royale, 4 biglie puntano a 1.000 monete o al Jackpot." },
    ru: { name: "Yeller's Lucky Jackpot: Золотое испытание удачи!", description: "Выберите шарик, бросьте кубик на 12 граней и пройдите 20 полей. В Royale 4 шарика борются за 1000 монет или джекпот." },
    pl: { name: "Yeller's Lucky Jackpot: Złote wyzwanie szczęścia!", description: "Wybierz kulkę, rzuć kością o 12 ścianach i przejdź 20 plansz. W Royale 4 kulki gonią 1000 monet albo jackpot." },
    nl: { name: "Yeller's Lucky Jackpot: De gouden geluksuitdaging!", description: "Kies een knikker, gooi een dobbelsteen met 12 zijden en haal 20 borden. In Royale strijden 4 knikkers om 1.000 munten of de jackpot." },
    zh: { name: "Yeller's Lucky Jackpot：黄金幸运挑战！", description: "选一颗弹珠，掷 12 面骰，闯过 20 张运气棋盘。皇家模式里 4 颗弹珠争夺 1000 金币或头奖。" },
    ja: { name: "Yeller's Lucky Jackpot：黄金ラッキーチャレンジ！", description: "ビー玉を選び、12面ダイスを振って20の盤を進もう。ロイヤルでは4人が1000コインかジャックポットを狙う。" },
    ko: { name: "Yeller's Lucky Jackpot: 황금 행운 도전!", description: "구슬을 고르고 12면 주사위를 굴려 20개 보드를 건너세요. 로얄에서는 4개가 1000코인 또는 잭팟을 노립니다." },
  },
  "bifer-cyber": {
    es: { name: "Bifer & Bifer3000's Cyber-Matrix: ¡El Hackeo Cósmico!", description: "Elegí una pelotita como núcleo de datos, girá espejos y conectá el láser en 40 nodos. En la Matriz, 4 pelotitas compiten por hackear el servidor." },
    en: { name: "Bifer & Bifer3000's Cyber-Matrix: Cosmic Hack!", description: "Pick a marble as a data core, rotate mirrors and connect the laser across 40 nodes. In the Matrix, 4 marbles race to hack the server." },
    fr: { name: "Bifer & Bifer3000's Cyber-Matrix : Le Hack Cosmique !", description: "Choisis une bille comme noyau de données, tourne les miroirs et relie le laser sur 40 nœuds. Dans la Matrice, 4 billes piratent le serveur." },
    de: { name: "Bifer & Bifer3000's Cyber-Matrix: Der kosmische Hack!", description: "Wähle eine Murmel als Datenkern, drehe Spiegel und verbinde den Laser über 40 Knoten. In der Matrix hacken 4 Murmeln den Server." },
    pt: { name: "Bifer & Bifer3000's Cyber-Matrix: O Hack Cósmico!", description: "Escolha uma bolinha como núcleo de dados, gire espelhos e ligue o laser em 40 nós. Na Matriz, 4 bolinhas disputam o servidor." },
    it: { name: "Bifer & Bifer3000's Cyber-Matrix: L'Hack Cosmico!", description: "Scegli una biglia come nucleo dati, gira gli specchi e collega il laser su 40 nodi. Nella Matrice, 4 biglie hackerano il server." },
    ru: { name: "Bifer & Bifer3000's Cyber-Matrix: Космический взлом!", description: "Выберите шарик как ядро данных, крутите зеркала и соедините лазер на 40 узлах. В Матрице 4 шарика взламывают сервер." },
    pl: { name: "Bifer & Bifer3000's Cyber-Matrix: Kosmiczny hack!", description: "Wybierz kulkę jako rdzeń danych, obracaj lustra i połącz laser na 40 węzłach. W Matrycy 4 kulki hakują serwer." },
    nl: { name: "Bifer & Bifer3000's Cyber-Matrix: De kosmische hack!", description: "Kies een knikker als datakern, draai spiegels en verbind de laser over 40 knopen. In de Matrix hacken 4 knikkers de server." },
    zh: { name: "Bifer & Bifer3000's Cyber-Matrix：宇宙黑客！", description: "选一颗弹珠当数据核心，旋转镜子，用激光连上 40 个节点。矩阵模式里 4 颗弹珠抢着黑进服务器。" },
    ja: { name: "Bifer & Bifer3000's Cyber-Matrix：コズミック・ハック！", description: "ビー玉をデータコアにして、鏡を回し、40ノードへレーザーをつなごう。マトリックスでは4人がサーバーを奪う。" },
    ko: { name: "Bifer & Bifer3000's Cyber-Matrix: 우주 해킹!", description: "구슬을 데이터 코어로 고르고, 거울을 돌려 레이저로 40개 노드를 연결하세요. 매트릭스에서는 4개가 서버를 해킹합니다." },
  },
  "pinvilet-font": {
    es: { name: "PinVilet's Font-Chaos: ¡La Batalla de las Letras Gigantes!", description: "Elegí una pelotita y una fuente, y rebotá por 30 mapas de letras gigantes. En la sopa de letras, 4 pelotitas compiten por la palabra más larga." },
    en: { name: "PinVilet's Font-Chaos: Giant Letter Battle!", description: "Pick a marble and a font, then bounce across 30 maps of giant letters. In letter soup, 4 marbles race for the longest word." },
    fr: { name: "PinVilet's Font-Chaos : La Bataille des Lettres Géantes !", description: "Choisis une bille et une police, et rebondis sur 30 cartes de lettres géantes. Dans la soupe de lettres, 4 billes visent le mot le plus long." },
    de: { name: "PinVilet's Font-Chaos: Die Schlacht der Riesenbuchstaben!", description: "Wähle eine Murmel und eine Schrift und hüpfe über 30 Karten aus Riesenbuchstaben. In der Buchstabensuppe kämpfen 4 Murmeln um das längste Wort." },
    pt: { name: "PinVilet's Font-Chaos: A Batalha das Letras Gigantes!", description: "Escolha uma bolinha e uma fonte, e salte por 30 mapas de letras gigantes. Na sopa de letras, 4 bolinhas disputam a palavra mais longa." },
    it: { name: "PinVilet's Font-Chaos: La Battaglia delle Lettere Giganti!", description: "Scegli una biglia e un font, e rimbalza su 30 mappe di lettere giganti. Nella zuppa di lettere, 4 biglie cercano la parola più lunga." },
    ru: { name: "PinVilet's Font-Chaos: Битва гигантских букв!", description: "Выберите шарик и шрифт и прыгайте по 30 картам из огромных букв. В супе из букв 4 шарика спорят за самое длинное слово." },
    pl: { name: "PinVilet's Font-Chaos: Bitwa wielkich liter!", description: "Wybierz kulkę i font, i skacz po 30 mapach z wielkich liter. W zupie liter 4 kulki walczą o najdłuższe słowo." },
    nl: { name: "PinVilet's Font-Chaos: De slag van de reuzenletters!", description: "Kies een knikker en een lettertype en stuiter over 30 kaarten van reuzenletters. In de lettersoep strijden 4 knikkers om het langste woord." },
    zh: { name: "PinVilet's Font-Chaos：巨型字母大战！", description: "选一颗弹珠和一种字体，在 30 张巨型字母地图上弹跳。字母汤模式里 4 颗弹珠比谁的单词最长。" },
    ja: { name: "PinVilet's Font-Chaos：巨大文字バトル！", description: "ビー玉とフォントを選んで、巨大文字の30マップを跳ぼう。文字スープでは4人が一番長い単語を争う。" },
    ko: { name: "PinVilet's Font-Chaos: 거대 글자 배틀!", description: "구슬과 글꼴을 고르고, 거대한 글자 맵 30개를 뛰어다니세요. 글자 수프에서는 4개가 가장 긴 단어를 겨룹니다." },
  },
  "platafacido": {
    es: { name: "PlatafAcido", description: "Elegí un pack y sobreviví en una plataforma 3D sobre ácido. La última pelotita en pie gana." },
    en: { name: "PlatafAcido", description: "Pick a pack and survive on a 3D platform over acid. The last marble standing wins." },
    fr: { name: "PlatafAcido", description: "Choisis un pack et survis sur une plateforme 3D au-dessus de l'acide. La dernière bille gagne." },
    de: { name: "PlatafAcido", description: "Wähle ein Pack und überlebe auf einer 3D-Plattform über Säure. Die letzte Murmel gewinnt." },
    pt: { name: "PlatafAcido", description: "Escolha um pack e sobreviva numa plataforma 3D sobre ácido. A última bolinha ganha." },
    it: { name: "PlatafAcido", description: "Scegli un pack e sopravvivi su una piattaforma 3D sopra l'acido. L'ultima biglia vince." },
    ru: { name: "PlatafAcido", description: "Выберите пак и выживите на 3D-платформе над кислотой. Побеждает последний шарик." },
    pl: { name: "PlatafAcido", description: "Wybierz pakiet i przeżyj na platformie 3D nad kwasem. Wygrywa ostatnia kulka." },
    nl: { name: "PlatafAcido", description: "Kies een pack en overleef op een 3D-platform boven zuur. De laatste knikker wint." },
    zh: { name: "PlatafAcido", description: "选一个弹珠包，在酸液上的 3D 平台活到最后。最后一颗弹珠获胜。" },
    ja: { name: "PlatafAcido", description: "パックを選んで、酸の上の3D足場で生き残れ。最後のビー玉が勝ち。" },
    ko: { name: "PlatafAcido", description: "팩을 고르고 산 위의 3D 발판에서 끝까지 버티세요. 마지막 구슬이 이깁니다." },
  },
  "temperatura": {
    es: { name: "Temperatura", description: "Buscá la temperatura y el clima reales de tu zona, hora por hora hasta el día 22, hora 24." },
    en: { name: "Temperature", description: "See the real temperature and weather where you are, hour by hour through day 22, hour 24." },
    fr: { name: "Température", description: "Voyez la température et le climat réels de chez vous, heure par heure jusqu'au jour 22, heure 24." },
    de: { name: "Temperatur", description: "Sieh die echte Temperatur und das Wetter bei dir, Stunde für Stunde bis Tag 22, Stunde 24." },
    pt: { name: "Temperatura", description: "Veja a temperatura e o clima reais da sua zona, hora por hora até o dia 22, hora 24." },
    it: { name: "Temperatura", description: "Guarda la temperatura e il clima reali della tua zona, ora per ora fino al giorno 22, ora 24." },
    ru: { name: "Температура", description: "Смотрите настоящую температуру и погоду у себя, час за часом до 22-го дня, 24-го часа." },
    pl: { name: "Temperatura", description: "Zobacz prawdziwą temperaturę i pogodę w swojej okolicy, godzina po godzinie do 22. dnia, godziny 24." },
    nl: { name: "Temperatuur", description: "Bekijk de echte temperatuur en het weer bij jou, uur na uur tot dag 22, uur 24." },
    zh: { name: "温度", description: "查看你所在地的真实温度和天气，按小时显示，直到第 22 天第 24 小时。" },
    ja: { name: "気温", description: "いる場所の実際の気温と天気を、1時間ごとに22日目の24時まで見る。" },
    ko: { name: "기온", description: "지금 있는 곳의 실제 기온과 날씨를 시간마다 22일째 24시까지 봅니다." },
  },
  "grupos": {
    es: { name: "Grupos", description: "Elegí un pack, tocá un divisor y formá equipos respetando amistades, enemistades, grupos y familias." },
    en: { name: "Groups", description: "Pick a pack, tap a divisor, and form teams that respect friendships, rivalries, groups, and families." },
    fr: { name: "Groupes", description: "Choisis un pack, touche un diviseur et forme des équipes en respectant amitiés, rivalités, groupes et familles." },
    de: { name: "Gruppen", description: "Wähle ein Pack, tippe einen Teiler und bilde Teams unter Beachtung von Freundschaften, Feindschaften, Gruppen und Familien." },
    pt: { name: "Grupos", description: "Escolha um pack, toque num divisor e forme equipes respeitando amizades, inimizades, grupos e famílias." },
    it: { name: "Gruppi", description: "Scegli un pack, tocca un divisore e forma squadre rispettando amicizie, inimicizie, gruppi e famiglie." },
    ru: { name: "Группы", description: "Выберите пак, нажмите делитель и соберите команды с учётом дружбы, вражды, групп и семей." },
    pl: { name: "Grupy", description: "Wybierz paczkę, kliknij dzielnik i ułóż drużyny z szacunkiem dla przyjaźni, wrogości, grup i rodzin." },
    nl: { name: "Groepen", description: "Kies een pack, tik op een deler en maak teams met respect voor vriendschappen, vijandschappen, groepen en families." },
    zh: { name: "分组", description: "选一个弹珠包，点一个因数，按友谊、敌对、小组和家庭来组队。" },
    ja: { name: "グループ", description: "パックを選び、約数を押して、友情・敵・グループ・家族を尊重してチームを作る。" },
    ko: { name: "그룹", description: "팩을 고르고 약수를 눌러 우정, 적대, 그룹, 가족을 지키며 팀을 만듭니다." },
  },
  "colegio-creado": {
    es: { name: "Colegio Creado", description: "Armá tu colegio con packs o pelotitas, mandalas a aulas y dá clase corrigiendo trabajos con A o F." },
    en: { name: "Created School", description: "Build your school with packs or marbles, send them to classrooms, teach, and grade work with A or F." },
    fr: { name: "École Créée", description: "Crée ton école avec des packs ou des billes, envoie-les en classe, donne cours et note avec A ou F." },
    de: { name: "Erstellte Schule", description: "Baue deine Schule mit Packs oder Murmeln, schicke sie in Klassen, unterrichte und bewerte mit A oder F." },
    pt: { name: "Colégio Criado", description: "Monte seu colégio com packs ou bolinhas, mande-as para salas, dê aula e corrija com A ou F." },
    it: { name: "Scuola Creata", description: "Crea la tua scuola con pack o biglie, mandale in aula, fai lezione e valuta con A o F." },
    ru: { name: "Созданная школа", description: "Соберите школу из паков или шариков, отправьте в классы, ведите урок и ставьте A или F." },
    pl: { name: "Stworzona Szkoła", description: "Zbuduj szkołę z paczek lub kulek, wyślij je do sal, prowadź lekcje i oceniaj A lub F." },
    nl: { name: "Gemaakte School", description: "Bouw je school met packs of knikkers, stuur ze naar lokalen, geef les en beoordeel met A of F." },
    zh: { name: "自建学校", description: "用弹珠包或弹珠建学校，送进教室上课，并用 A 或 F 批改作业。" },
    ja: { name: "つくった学校", description: "パックやビー玉で学校をつくり、教室へ送り、授業して A か F で採点する。" },
    ko: { name: "만든 학교", description: "팩이나 구슬로 학교를 만들고 교실에 보낸 뒤 수업하며 A 또는 F로 채점하세요." },
  },
  "carrera-y-ruleta-rusa": {
    es: { name: "Carrera y Ruleta Rusa", description: "Elegí un pack y sobreviví en un pinball de dos destinos. Completá todos los packs, jugá el Final y ganá medallas." },
    en: { name: "Race and Russian Roulette", description: "Pick a pack and survive a two-lane pinball. Clear every pack, play the Final, and earn medals." },
    fr: { name: "Course et Roulette Russe", description: "Choisis un pack et survis à un pinball à deux destinations. Finis tous les packs, joue la Finale et gagne des médailles." },
    de: { name: "Rennen und Russisches Roulette", description: "Wähle ein Pack und überlebe ein Pinball mit zwei Zielen. Schaffe alle Packs, spiele das Finale und hole Medaillen." },
    pt: { name: "Corrida e Roleta Russa", description: "Escolha um pack e sobreviva num pinball de dois destinos. Complete todos os packs, jogue a Final e ganhe medalhas." },
    it: { name: "Corsa e Roulette Russa", description: "Scegli un pack e sopravvivi a un pinball a due destinazioni. Completa tutti i pack, gioca la Finale e vinci medaglie." },
    ru: { name: "Гонка и русская рулетка", description: "Выберите пак и выживите в пинболе с двумя зонами. Пройдите все паки, сыграйте Финал и получите медали." },
    pl: { name: "Wyścig i Rosyjska Ruletka", description: "Wybierz paczkę i przetrwaj pinball z dwoma polami. Ukończ wszystkie paczki, zagraj Finał i zbieraj medale." },
    nl: { name: "Race en Russische Roulette", description: "Kies een pack en overleef pinball met twee landingszones. Haal alle packs, speel de Finale en win medailles." },
    zh: { name: "竞速与俄罗斯轮盘", description: "选一个弹珠包，在双终点弹球中存活。通关全部包，打决赛并赢奖牌。" },
    ja: { name: "レースとロシアンルーレット", description: "パックを選び、二つの着地のピンボールで生き残れ。全パッククリアして決勝へ、メダルを稼げ。" },
    ko: { name: "레이스와 러시안 룰렛", description: "팩을 고르고 두 착지 핀볼에서 살아남으세요. 모든 팩을 클리어하고 결승에서 메달을 따세요." },
  },
  "universe-maker": {
    es: { name: "Universe Maker", description: "Creá universos con un pack, acelerá los eones, formá estrellas, planetas y vida." },
    en: { name: "Universe Maker", description: "Create universes with a pack, speed through eons, form stars, planets, and life." },
    fr: { name: "Universe Maker", description: "Crée des univers avec un pack, accélère les ères, forme étoiles, planètes et vie." },
    de: { name: "Universe Maker", description: "Erstelle Universen mit einem Pack, beschleunige Äonen, bilde Sterne, Planeten und Leben." },
    pt: { name: "Universe Maker", description: "Crie universos com um pack, acelere os éons, forme estrelas, planetas e vida." },
    it: { name: "Universe Maker", description: "Crea universi con un pack, accelera le ere, forma stelle, pianeti e vita." },
    ru: { name: "Universe Maker", description: "Создавайте вселенные с паком, ускоряйте эоны, формируйте звёзды, планеты и жизнь." },
    pl: { name: "Universe Maker", description: "Twórz uniwersa z paczką, przyspieszaj eony, twórz gwiazdy, planety i życie." },
    nl: { name: "Universe Maker", description: "Maak universums met een pack, versnel eonen, vorm sterren, planeten en leven." },
    zh: { name: "Universe Maker", description: "用弹珠包创造宇宙，加速亿万年，形成恒星、行星与生命。" },
    ja: { name: "Universe Maker", description: "パックで宇宙をつくり、長い年月を加速し、星・惑星・生命を形づくる。" },
    ko: { name: "Universe Maker", description: "팩으로 우주를 만들고 억겁을 가속해 별, 행성, 생명을 만드세요." },
  },
  "surprise-huevo": {
    es: { name: "Surprise Huevo", description: "Comprá huevos en la tienda, abrí zonas y coleccioná figuras sorpresa." },
    en: { name: "Surprise Huevo", description: "Buy eggs in the shop, open zones, and collect surprise figures." },
    fr: { name: "Surprise Huevo", description: "Achète des œufs, ouvre les zones et collectionne les figurines." },
    de: { name: "Surprise Huevo", description: "Kaufe Eier im Laden, öffne Zonen und sammle Figuren." },
    pt: { name: "Surprise Huevo", description: "Compre ovos na loja, abra zonas e colecione figuras surpresa." },
    it: { name: "Surprise Huevo", description: "Compra uova nel negozio, apri le zone e colleziona figurine." },
    ru: { name: "Surprise Huevo", description: "Покупай яйца в магазине, открывай зоны и собирай фигурки." },
    pl: { name: "Surprise Huevo", description: "Kupuj jajka w sklepie, otwieraj strefy i zbieraj figurki." },
    nl: { name: "Surprise Huevo", description: "Koop eieren in de winkel, open zones en verzamel figuren." },
    zh: { name: "Surprise Huevo", description: "在商店买蛋、打开区域并收集惊喜人偶。" },
    ja: { name: "Surprise Huevo", description: "ショップでたまごを買い、ゾーンを開いてフィギュアを集めよう。" },
    ko: { name: "Surprise Huevo", description: "상점에서 알을 사고 구역을 열어 피규어를 모으세요." },
  },
  "tiempo-anti-2038": {
    es: { name: "Tiempo Anti-2038", description: "Contador de segundos con fecha real, Unix y 210 luces binarias que no se rompe en 2038." },
    en: { name: "Tiempo Anti-2038", description: "A seconds counter with real date, Unix time, and 210 binary lights that survives 2038." },
    fr: { name: "Tiempo Anti-2038", description: "Compteur de secondes avec date réelle, Unix et 210 lumières binaires qui survit à 2038." },
    de: { name: "Tiempo Anti-2038", description: "Sekundenzähler mit echtem Datum, Unix und 210 Binärlichtern, der 2038 übersteht." },
    pt: { name: "Tiempo Anti-2038", description: "Contador de segundos com data real, Unix e 210 luzes binárias que não quebra em 2038." },
    it: { name: "Tiempo Anti-2038", description: "Contatore di secondi con data reale, Unix e 210 luci binarie che non si rompe nel 2038." },
    ru: { name: "Tiempo Anti-2038", description: "Счётчик секунд с реальной датой, Unix и 210 двоичными огнями, который не ломается в 2038." },
    pl: { name: "Tiempo Anti-2038", description: "Licznik sekund z datą, Unixem i 210 binarnymi światłami, który nie psuje się w 2038." },
    nl: { name: "Tiempo Anti-2038", description: "Secondenteller met echte datum, Unix en 210 binaire lampjes die 2038 overleeft." },
    zh: { name: "Tiempo Anti-2038", description: "带真实日期、Unix 时间和 210 个二进制灯的秒计数器，2038 也不会坏。" },
    ja: { name: "Tiempo Anti-2038", description: "実時刻・Unix・210個の二進ライト付き秒カウンター。2038年でも止まらない。" },
    ko: { name: "Tiempo Anti-2038", description: "실제 날짜, Unix, 210개 이진 불빛이 있는 초 카운터. 2038에도 멈추지 않습니다." },
  },
  "idiomas": {
    es: { name: "Idiomas", description: "Creá idiomas, guardalos y traducí entre el idioma original y el tuyo." },
    en: { name: "Idiomas", description: "Create languages, save them, and translate between the original and yours." },
    fr: { name: "Idiomas", description: "Crée des langues, enregistre-les et traduis entre l'original et la tienne." },
    de: { name: "Idiomas", description: "Erstelle Sprachen, speichere sie und übersetze zwischen Original und deiner Sprache." },
    pt: { name: "Idiomas", description: "Crie idiomas, salve-os e traduza entre o original e o seu." },
    it: { name: "Idiomas", description: "Crea lingue, salvale e traduci tra l'originale e la tua." },
    ru: { name: "Idiomas", description: "Создавай языки, сохраняй их и переводи между оригиналом и своим." },
    pl: { name: "Idiomas", description: "Twórz języki, zapisuj je i tłumacz między oryginałem a swoim." },
    nl: { name: "Idiomas", description: "Maak talen, bewaar ze en vertaal tussen het origineel en jouw taal." },
    zh: { name: "Idiomas", description: "创建语言、保存它们，并在原语言和你的语言之间翻译。" },
    ja: { name: "Idiomas", description: "言語を作って保存し、元の言語とあなたの言語のあいだで翻訳できる。" },
    ko: { name: "Idiomas", description: "언어를 만들고 저장한 뒤, 원어와 새 언어 사이에서 번역하세요." },
  },
  "shape-battle": {
    es: { name: "Shape Battle", description: "Batallas con círculos matemáticos o Obstacle Course con cuadrados RGB." },
    en: { name: "Shape Battle", description: "Battles with math circles or an RGB square obstacle course." },
    fr: { name: "Shape Battle", description: "Combats de cercles mathématiques ou parcours d'obstacles de carrés RGB." },
    de: { name: "Shape Battle", description: "Kämpfe mit Mathe-Kreisen oder RGB-Quadrat-Hindernisparcours." },
    pt: { name: "Shape Battle", description: "Batalhas com círculos matemáticos ou Obstacle Course de quadrados RGB." },
    it: { name: "Shape Battle", description: "Battaglie con cerchi matematici o percorso a ostacoli di quadrati RGB." },
    ru: { name: "Shape Battle", description: "Битвы с математическими кругами или полоса препятствий RGB-квадратов." },
    pl: { name: "Shape Battle", description: "Bitwy z matematycznymi kołami lub tor przeszkód kwadratów RGB." },
    nl: { name: "Shape Battle", description: "Gevechten met wiskundige cirkels of een RGB-vierkant obstakelparcours." },
    zh: { name: "Shape Battle", description: "用数学圆盘对战，或用 RGB 方块跑障碍赛。" },
    ja: { name: "Shape Battle", description: "数学サークルのバトルか、RGB正方形の障害物コース。" },
    ko: { name: "Shape Battle", description: "수학 원 배틀 또는 RGB 사각형 장애물 코스." },
  },
  "math-ball": {
    es: { name: "Math Ball", description: "Creá pelotitas con números únicos y corré la Conjetura de Collatz." },
    en: { name: "Math Ball", description: "Create balls with unique numbers and run the Collatz Conjecture." },
    fr: { name: "Math Ball", description: "Crée des balles avec des nombres uniques et lance la conjecture de Collatz." },
    de: { name: "Math Ball", description: "Erstelle Bälle mit einzigartigen Zahlen und starte die Collatz-Vermutung." },
    pt: { name: "Math Ball", description: "Crie bolinhas com números únicos e rode a Conjectura de Collatz." },
    it: { name: "Math Ball", description: "Crea palline con numeri unici e lancia la congettura di Collatz." },
    ru: { name: "Math Ball", description: "Создавай шарики с уникальными числами и запускай гипотезу Коллатца." },
    pl: { name: "Math Ball", description: "Twórz piłki z unikalnymi liczbami i uruchom hipotezę Collatza." },
    nl: { name: "Math Ball", description: "Maak balletjes met unieke getallen en speel het Collatz-vermoeden." },
    zh: { name: "Math Ball", description: "用唯一数字创建小球，并运行考拉兹猜想。" },
    ja: { name: "Math Ball", description: "一意の数字のボールを作り、コラッツ予想で遊ぶ。" },
    ko: { name: "Math Ball", description: "고유 숫자 공을 만들고 콜라츠 추측 레이스를 하세요." },
  },
};

const FALLBACK_GAMES = [
  {
    id: "algicosathlon-maker-english",
    name: "Algicosathlon Maker In English",
    description: "Create games, design balls and compete in the Algicosathlon.",
    folder: "Algicosathlon Maker In English",
    icon: "🏅",
    tags: ["creator", "multiplayer", "minigames"],
    creator: "José Rafael Rodriguez Morillo",
  },
  {
    id: "decimal-explorer",
    name: "Decimal Explorer",
    description: "Discover which famous numbers share the same starting digits.",
    folder: "Decimal Explorer",
    icon: "🔢",
    tags: ["minigame", "math"],
    creator: "José Rafael Rodriguez Morillo",
  },
  {
    id: "bruchimichis",
    name: "bruchimichis",
    description: "Creá gatitos, movelos y hacelos correr en carreras.",
    folder: "bruchimichis",
    icon: "🐱",
    tags: ["gatos", "carrera", "creator"],
    creator: "Lourdes Roulier",
  },
  {
    id: "neymarmichis",
    name: "Neymarmichis",
    description: "Creá gatos futbolistas con camiseta y stats, cuidalos y jugá Fuchibol contra la IA.",
    folder: "Neymarmichis",
    icon: "🐱",
    tags: ["gatos", "fútbol", "creator"],
    creator: "Lourdes Roulier",
  },
  {
    id: "creador-2d",
    name: "Creador 2D",
    description: "Crea tu propio mundo en 2D con un editor de bloques.",
    folder: "Creador 2D",
    icon: "🎨",
    tags: ["2D", "creator", "bloques"],
    creator: "José Rafael Rodriguez Morillo",
  },
  {
    id: "object-battle",
    name: "Object Battle",
    description: "Create objects with faces, drop from the sky, and switch characters with Z.",
    folder: "Object Battle",
    icon: "⚔️",
    tags: ["battle", "creator", "objects"],
    creator: "José Rafael Rodriguez Morillo",
  },
  {
    id: "bloc-de-notas",
    name: "Bloc De Notas",
    description: "Bloc de notas simple para anotar lo que quieras.",
    folder: "Bloc De Notas",
    icon: "📝",
    tags: ["notas", "utilidad"],
    creator: "José Rafael Rodriguez Morillo",
  },
  {
    id: "country-notes",
    name: "Country Notes",
    description: "Creá países y aparecen en el mapa como bloques 128×128.",
    folder: "Country Notes",
    icon: "🌐",
    tags: ["países", "notas", "creator"],
    creator: "José Rafael Rodriguez Morillo",
  },
  {
    id: "shape-bowl-race",
    name: "Shape Bowl Race",
    description: "Create balls, race in the bowl with Jump and Turn, and track Earnings.",
    folder: "Shape Bowl Race",
    icon: "🥣",
    tags: ["creator", "race", "balls"],
    creator: "José Rafael Rodriguez Morillo",
  },
  {
    id: "ruleta-especial",
    name: "Ruleta Especial",
    description: "Escribí opciones, girá la ruleta y guardá el historial de ganadores.",
    folder: "Ruleta Especial",
    icon: "🎡",
    tags: ["ruleta", "azar", "utilidad"],
    creator: "José Rafael Rodriguez Morillo",
  },
  {
    id: "cronometro-loco",
    name: "Cronómetro Loco",
    description: "Un cronómetro con chances locas en cada segundo.",
    folder: "Cronometro Loco",
    icon: "⏱️",
    tags: ["cronómetro", "azar", "minigame"],
    creator: "José Rafael Rodriguez Morillo",
  },
  {
    id: "marble-escape",
    name: "Marble Escape",
    description: "Creá marbles y guialos por una fábrica difícil con bloques, lava y una zona segura.",
    folder: "Marble Escape",
    icon: "🔵",
    tags: ["marbles", "física", "plataformas"],
    creator: "José Rafael Rodriguez Morillo",
  },
  {
    id: "tipo-knowledge",
    name: "Tipo Knowledge",
    description: "Creá Lugares De Tipo, armá equipos con logo y asigná un tipo a cada pelotita.",
    folder: "Tipo Knowledge",
    icon: "🧠",
    tags: ["tipos", "preguntas", "pelotitas"],
    creator: "José Rafael Rodriguez Morillo",
  },
  {
    id: "pinball",
    name: "Pinball",
    description: "Elegí pelotitas de tus packs y jugá en una mesa con túnel, círculos de punto y círculos de dinero.",
    folder: "Pinball",
    icon: "🎱",
    tags: ["pinball", "pelotitas", "packs"],
    creator: [
      "José Rafael Rodriguez Morillo",
      "Reddo",
      "Pinki",
      "Yeller",
      "Bifer",
      "Bifer3000",
      "PinVilet"
    ],
  },
  {
    id: "carrera-blitz",
    name: "Carrera Blitz",
    description: "Elegí una pelotita de tus packs y corré una pista neón: speedrun contra el reloj o carrera contra la IA y tu pack.",
    folder: "Carrera Blitz",
    icon: "🏁",
    tags: ["carrera", "pelotitas", "packs"],
    creator: "Reddo",
  },
  {
    id: "pinki-glamour",
    name: "Pinki's Glamour Rush: ¡El Desfile de Plataforma!",
    description: "Elegí una pelotita, cruzá 50 pasarelas al ritmo y juntá estilo. También hay carrera contra 3 rivales y una tienda de accesorios.",
    folder: "Pinki Glamour Rush",
    icon: "🎀",
    tags: ["pasarela", "pelotitas", "packs"],
    creator: "Pinki",
  },
  {
    id: "yeller-jackpot",
    name: "Yeller's Lucky Jackpot: ¡El Desafío de la Suerte Dorada!",
    description: "Elegí una pelotita, tirá el dado de 12 caras y cruzá 20 tableros de suerte. En el Royale, 4 pelotitas compiten por 1.000 monedas o por el Jackpot.",
    folder: "Yeller Lucky Jackpot",
    icon: "🪙",
    tags: ["suerte", "pelotitas", "packs"],
    creator: "Yeller",
  },
  {
    id: "bifer-cyber",
    name: "Bifer & Bifer3000's Cyber-Matrix: ¡El Hackeo Cósmico!",
    description: "Elegí una pelotita como núcleo de datos, girá espejos y conectá el láser en 40 nodos. En la Matriz, 4 pelotitas compiten por hackear el servidor.",
    folder: "Bifer Cyber Matrix",
    icon: "🧠",
    tags: ["hackeo", "pelotitas", "packs"],
    creator: [
      "Bifer",
      "Bifer3000",
    ],
  },
  {
    id: "pinvilet-font",
    name: "PinVilet's Font-Chaos: ¡La Batalla de las Letras Gigantes!",
    description: "Elegí una pelotita y una fuente, y rebotá por 30 mapas de letras gigantes. En la sopa de letras, 4 pelotitas compiten por la palabra más larga.",
    folder: "PinVilet Font Chaos",
    icon: "🟣",
    tags: ["letras", "pelotitas", "packs"],
    creator: "PinVilet",
  },
  {
    id: "platafacido",
    name: "PlatafAcido",
    description: "Elegí un pack y sobreviví en una plataforma 3D sobre ácido. La última pelotita en pie gana.",
    folder: "PlatafAcido",
    icon: "🧪",
    tags: ["ácido", "pelotitas", "packs"],
    creator: "José Rafael Rodriguez Morillo",
  },
  {
    id: "temperatura",
    name: "Temperatura",
    description: "Buscá la temperatura y el clima reales de tu zona, hora por hora hasta el día 22, hora 24.",
    folder: "Temperatura",
    icon: "🌡️",
    tags: ["clima", "temperatura", "utilidad"],
    creator: "José Rafael Rodriguez Morillo",
  },
  {
    id: "grupos",
    name: "Grupos",
    description: "Elegí un pack, tocá un divisor y formá equipos respetando amistades, enemistades, grupos y familias.",
    folder: "Grupos",
    icon: "🧩",
    tags: ["packs", "equipos", "pelotitas"],
    creator: "José Rafael Rodriguez Morillo",
  },
  {
    id: "colegio-creado",
    name: "Colegio Creado",
    description: "Armá tu colegio con packs o pelotitas, mandalas a aulas y dá clase corrigiendo trabajos con A o F.",
    folder: "Colegio Creado",
    icon: "🏫",
    tags: ["colegio", "pelotitas", "packs", "clases"],
    creator: "José Rafael Rodriguez Morillo",
  },
  {
    id: "carrera-y-ruleta-rusa",
    name: "Carrera y Ruleta Rusa",
    description: "Elegí un pack y sobreviví en un pinball de dos destinos. Completá todos los packs, jugá el Final y ganá medallas.",
    folder: "Carrera y Ruleta Rusa",
    icon: "🎰",
    tags: ["packs", "pinball", "eliminación"],
    creator: "José Rafael Rodriguez Morillo",
  },
  {
    id: "universe-maker",
    name: "Universe Maker",
    description: "Creá universos con un pack, acelerá los eones, formá estrellas, planetas y vida.",
    folder: "Universe Maker",
    icon: "🌌",
    tags: ["universo", "packs", "simulación"],
    creator: "José Rafael Rodriguez Morillo",
  },
  {
    id: "surprise-huevo",
    name: "Surprise Huevo",
    description: "Tocá el huevo, rompelo y descubrí una sorpresa al azar.",
    folder: "Surprise Huevo",
    icon: "🥚",
    tags: ["sorpresa", "huevo", "casual"],
    creator: "José Rafael Rodriguez Morillo",
  },
  {
    id: "tiempo-anti-2038",
    name: "Tiempo Anti-2038",
    description: "Contador de segundos con fecha real, Unix y 210 luces binarias que no se rompe en 2038.",
    folder: "Tiempo Anti-2038",
    icon: "⏳",
    tags: ["tiempo", "unix", "contador", "binario"],
    creator: "José Rafael Rodriguez Morillo",
  },
  {
    id: "idiomas",
    name: "Idiomas",
    description: "Creá idiomas, guardalos y traducí entre el idioma original y el tuyo.",
    folder: "Idiomas",
    icon: "🗣️",
    tags: ["idiomas", "traducir", "crear", "guardados"],
    creator: "José Rafael Rodriguez Morillo",
  },
  {
    id: "shape-battle",
    name: "Shape Battle",
    description: "Batallas con círculos matemáticos o Obstacle Course con cuadrados RGB.",
    folder: "Shape Battle",
    icon: "⬡",
    tags: ["batalla", "formas", "obstáculos"],
    creator: "José Rafael Rodriguez Morillo",
  },
  {
    id: "math-ball",
    name: "Math Ball",
    description: "Creá pelotitas con números únicos y corré la Conjetura de Collatz.",
    folder: "Math Ball",
    icon: "🔵",
    tags: ["matemática", "collatz", "números"],
    creator: "José Rafael Rodriguez Morillo",
  },
];

const gameGrid = document.getElementById("gameGrid");
const gameCount = document.getElementById("gameCount");
const searchInput = document.getElementById("searchInput");
const emptyState = document.getElementById("emptyState");
const langSelect = document.getElementById("langSelect");
const heroTitle = document.getElementById("heroTitle");
const heroSubtitle = document.getElementById("heroSubtitle");
const libraryTitle = document.getElementById("libraryTitle");
const langPickerLabel = document.getElementById("langPickerLabel");
const footerText = document.getElementById("footerText");
const searchLabel = document.getElementById("searchLabel");

let allGames = [];
let currentLang = "es";
let visibleGames = [];

function t() {
  return UI[currentLang] || UI.es;
}

function uiText(key) {
  const cur = UI[currentLang] || UI.es;
  return cur[key] || UI.es[key] || UI.en[key] || key;
}

function gamePath(folder) {
  const encoded = folder.split("/").map(encodeURIComponent).join("/");
  return `Juegos/${encoded}/index.html`;
}

function getGameText(game, field) {
  const pack = GAME_I18N[game.id];
  if (game.id === "bruchimichis" && field === "name") return "bruchimichis";
  if (pack?.[currentLang]?.[field]) return pack[currentLang][field];
  for (const fb of ["en", "es", "fr", "de", "pt", "it", "ru", "pl", "nl", "zh", "ja", "ko"]) {
    if (pack?.[fb]?.[field]) return pack[fb][field];
  }
  return game[field] || "";
}

function normalizeGame(game) {
  if (!game?.folder || !game?.name) return null;
  return {
    id: game.id || game.folder.toLowerCase().replace(/\s+/g, "-"),
    name: game.name,
    description: game.description || "",
    folder: game.folder,
    icon: game.icon || "🎮",
    tags: Array.isArray(game.tags) ? game.tags : [],
    creator: Array.isArray(game.creator)
      ? game.creator.filter(Boolean).join(" · ")
      : (game.creator || "José Rafael Rodriguez Morillo"),
    comingSoon: Boolean(game.comingSoon),
  };
}

function applyStaticTranslations() {
  const strings = t();
  document.documentElement.lang = currentLang;
  document.title = strings.pageTitle;
  heroTitle.textContent = strings.heroTitle;
  heroSubtitle.textContent = strings.heroSubtitle;
  libraryTitle.textContent = strings.library;
  langPickerLabel.textContent = strings.langLabel;
  searchLabel.textContent = strings.searchLabel;
  searchInput.placeholder = strings.searchPlaceholder;
  footerText.innerHTML = strings.footer
    .replace("Juegos/", "<code>Juegos/</code>")
    .replace("games.json", "<code>games.json</code>");
  const packsBtn = document.getElementById("packsBtn");
  if (packsBtn) packsBtn.textContent = uiText("packsBtn");
}

function updateGameCount() {
  const strings = t();
  const total = allGames.length;
  const visible = visibleGames.length;
  gameCount.textContent = visible === total
    ? strings.gamesCount(total)
    : strings.gamesCountFiltered(visible, total);
}

function renderGames(games) {
  visibleGames = games;
  gameGrid.innerHTML = "";
  const strings = t();

  games.forEach((game) => {
    const item = document.createElement("li");
    item.className = game.comingSoon ? "game-card game-card--locked" : "game-card";

    const name = getGameText(game, "name") || game.name;
    const description = getGameText(game, "description") || game.description || strings.noDescription;

    const tags = game.tags
      .map((tag) => `<span class="tag">${tag}</span>`)
      .join("");

    const playButton = game.comingSoon
      ? `<button type="button" class="btn primary" disabled>${strings.comingSoon}</button>`
      : `<a class="btn primary" href="${gamePath(game.folder)}">${strings.play}</a>`;

    item.innerHTML = `
      <div class="game-card-head">
        <div class="game-icon" aria-hidden="true">${game.icon}</div>
        <div>
          <h3>${name}</h3>
        </div>
      </div>
      <p class="game-creator">${strings.creator}: ${game.creator}</p>
      <p class="game-desc">${description}</p>
      ${tags ? `<div class="tag-row">${tags}</div>` : ""}
      ${playButton}
    `;

    gameGrid.appendChild(item);
  });

  updateGameCount();
  emptyState.hidden = games.length > 0;
  gameGrid.hidden = games.length === 0;
}

function filterGames(query) {
  const q = query.trim().toLowerCase();
  if (!q) {
    renderGames(allGames);
    return;
  }

  const filtered = allGames.filter((game) => {
    const names = [
      game.name,
      getGameText(game, "name"),
      GAME_I18N[game.id]?.en?.name,
      GAME_I18N[game.id]?.es?.name,
    ].filter(Boolean).map((n) => n.toLowerCase());
    return names.some((n) => n.includes(q));
  });

  renderGames(filtered);
}

function setLanguage(code) {
  if (!UI[code]) return;
  currentLang = code;
  localStorage.setItem(LANG_STORAGE_KEY, code);
  langSelect.value = code;
  applyStaticTranslations();
  filterGames(searchInput.value);
  if (!allGames.length) {
    emptyState.textContent = t().emptyList;
  } else if (visibleGames.length === 0) {
    emptyState.textContent = t().emptySearch;
  }
}

function initLanguagePicker() {
  langSelect.innerHTML = "";
  LANG_OPTIONS.forEach(({ code, label }) => {
    const opt = document.createElement("option");
    opt.value = code;
    opt.textContent = label;
    langSelect.appendChild(opt);
  });

  const saved = localStorage.getItem(LANG_STORAGE_KEY);
  const initial = UI[saved] ? saved : "es";
  currentLang = initial;
  langSelect.value = initial;

  langSelect.addEventListener("change", (event) => {
    setLanguage(event.target.value);
  });
}

async function loadGames() {
  try {
    if (location.protocol === "file:") {
      throw new Error("file-protocol");
    }
    const response = await fetch("games.json?v=menu22", { cache: "no-store" });
    if (!response.ok) throw new Error("No se pudo leer games.json");
    const data = await response.json();
    allGames = (data.games || [])
      .map(normalizeGame)
      .filter(Boolean);
  } catch {
    allGames = FALLBACK_GAMES.map(normalizeGame).filter(Boolean);
  }

  if (!allGames.length) {
    gameCount.textContent = t().gamesCount(0);
    emptyState.hidden = false;
    emptyState.textContent = t().emptyList;
    gameGrid.hidden = true;
    return;
  }

  renderGames(allGames);
}

searchInput.addEventListener("input", (event) => {
  filterGames(event.target.value);
});

initLanguagePicker();
applyStaticTranslations();
loadGames();
