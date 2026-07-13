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
    creator: game.creator || "José Rafael Rodriguez Morillo",
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
    const response = await fetch("games.json", { cache: "no-store" });
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
