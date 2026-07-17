(function (global) {
  "use strict";

  const LANG_STORAGE_KEY = "admin-lang";
  const SUPPORTED_LANGS = ["es", "en", "fr", "de", "pt", "it", "ru", "pl", "nl", "zh", "ja", "ko"];
  const FALLBACK_CHAIN = ["en", "es"];

  function L(es, en, fr, de, pt, it) {
    const entry = { es, en, fr, de, pt, it };
    SUPPORTED_LANGS.forEach((code) => {
      if (!entry[code]) entry[code] = entry.en ?? entry.es;
    });
    return entry;
  }

  const COMMON = {
    backToAdmin: L(
      "Volver al administrador",
      "Back to admin",
      "Retour à l'administrateur",
      "Zurück zum Administrator",
      "Voltar ao administrador",
      "Torna all'amministratore"
    ),
    admin: L(
      "Administrador",
      "Admin",
      "Administrateur",
      "Administrator",
      "Administrador",
      "Amministratore"
    ),
    play: L("Jugar", "Play", "Jouer", "Spielen", "Jogar", "Gioca"),
    save: L("Guardar", "Save", "Enregistrer", "Speichern", "Salvar", "Salva"),
    start: L("Empezar", "Start", "Commencer", "Starten", "Iniciar", "Inizia"),
    create: L("Crear", "Create", "Créer", "Erstellen", "Criar", "Crea"),
    name: L("Nombre", "Name", "Nom", "Name", "Nome", "Nome"),
    cancel: L("Cancelar", "Cancel", "Annuler", "Abbrechen", "Cancelar", "Annulla"),
    games: L("Partidas", "Games", "Parties", "Spiele", "Jogos", "Partite"),
    createGame: L("Crear partida", "Create game", "Créer une partie", "Spiel erstellen", "Criar jogo", "Crea partita"),
    gameName: L("Nombre de la partida", "Game name", "Nom de la partie", "Spielname", "Nome do jogo", "Nome partita"),
    noGamesYet: L(
      "Aún no hay partidas.",
      "No games yet.",
      "Aucune partie pour l'instant.",
      "Noch keine Spiele.",
      "Ainda não há jogos.",
      "Nessuna partita ancora."
    ),
    saved: L("Guardado.", "Saved.", "Enregistré.", "Gespeichert.", "Salvo.", "Salvato."),
    loading: L("Cargando…", "Loading…", "Chargement…", "Laden…", "Carregando…", "Caricamento…"),
    editor: L("Editor", "Editor", "Éditeur", "Editor", "Editor", "Editor"),
    close: L("Cerrar", "Close", "Fermer", "Schließen", "Fechar", "Chiudi"),
    color: L("Color", "Color", "Couleur", "Farbe", "Cor", "Colore"),
    world: L("Mundo", "World", "Monde", "Welt", "Mundo", "Mondo"),
  };

  const GAMES = {
    "bloc-de-notas": {
      title: L("Bloc De Notas", "Notepad", "Bloc-notes", "Notizblock", "Bloco de Notas", "Blocco note"),
      subtitle: L(
        "Anotá lo que quieras. Simple y rápido.",
        "Write whatever you want. Simple and fast.",
        "Écrivez ce que vous voulez. Simple et rapide.",
        "Schreibe, was du willst. Einfach und schnell.",
        "Anote o que quiser. Simples e rápido.",
        "Scrivi quello che vuoi. Semplice e veloce."
      ),
      placeholder: L(
        "Escribí tus anotaciones aquí…",
        "Write your notes here…",
        "Écrivez vos notes ici…",
        "Schreibe deine Notizen hier…",
        "Escreva suas anotações aqui…",
        "Scrivi le tue note qui…"
      ),
    },
    "decimal-explorer": {
      title: L("Explorador Decimal", "Decimal Explorer", "Explorateur décimal", "Dezimal-Explorer", "Explorador Decimal", "Esploratore decimale"),
      subtitle: L(
        "Descubrí qué números famosos comparten los mismos dígitos iniciales.",
        "Discover which famous numbers share the same starting digits.",
        "Découvrez quels nombres célèbres partagent les mêmes premiers chiffres.",
        "Entdecke, welche berühmten Zahlen dieselben Anfangsziffern teilen.",
        "Descubra quais números famosos compartilham os mesmos dígitos iniciais.",
        "Scopri quali numeri famosi condividono le stesse cifre iniziali."
      ),
      digitHint: L(
        "Ingresá un dígito entero y uno decimal (por ejemplo 3 y 1 → 3.1).",
        "Enter one whole digit and one decimal digit (for example 3 and 1 → 3.1).",
        "Entrez un chiffre entier et un décimal (par ex. 3 et 1 → 3.1).",
        "Gib eine Ganzzahl und eine Dezimalziffer ein (z. B. 3 und 1 → 3.1).",
        "Digite um dígito inteiro e um decimal (ex.: 3 e 1 → 3.1).",
        "Inserisci una cifra intera e una decimale (es. 3 e 1 → 3.1)."
      ),
      wholeDigit: L("Dígito entero", "Whole digit", "Chiffre entier", "Ganzziffer", "Dígito inteiro", "Cifra intera"),
      decimalDigit: L("Dígito decimal", "Decimal digit", "Chiffre décimal", "Dezimalziffer", "Dígito decimal", "Cifra decimale"),
      explore: L("Explorar", "Explore", "Explorer", "Erkunden", "Explorar", "Esplora"),
      noResults: L(
        "Ningún número empieza con ese prefijo.",
        "No numbers start with that prefix.",
        "Aucun nombre ne commence par ce préfixe.",
        "Keine Zahl beginnt mit diesem Präfix.",
        "Nenhum número começa com esse prefixo.",
        "Nessun numero inizia con quel prefisso."
      ),
      numbersStarting: L(
        "Números que empiezan con {prefix}:",
        "Numbers starting with {prefix}:",
        "Nombres commençant par {prefix} :",
        "Zahlen, die mit {prefix} beginnen:",
        "Números que começam com {prefix}:",
        "Numeri che iniziano con {prefix}:"
      ),
      digitAlert: L(
        "Ingresá exactamente un dígito (0–9) en cada campo.",
        "Enter exactly one digit (0–9) for each field.",
        "Entrez exactement un chiffre (0–9) dans chaque champ.",
        "Gib in jedem Feld genau eine Ziffer (0–9) ein.",
        "Digite exatamente um dígito (0–9) em cada campo.",
        "Inserisci esattamente una cifra (0–9) in ogni campo."
      ),
      thanks: L(
        "¡Gracias José por crear este número!",
        "Thanks José for creating this number!",
        "Merci José d'avoir créé ce nombre !",
        "Danke José, dass du diese Zahl erstellt hast!",
        "Obrigado José por criar este número!",
        "Grazie José per aver creato questo numero!"
      ),
      labelPhi: L("phi", "phi", "phi", "phi", "phi", "phi"),
      labelSqrt2: L("Raíz cuadrada de 2", "Square Root Of 2", "Racine carrée de 2", "Quadratwurzel von 2", "Raiz quadrada de 2", "Radice quadrata di 2"),
      labelEuler: L("Euler-Mascheroni", "Euler-Mascheroni", "Euler-Mascheroni", "Euler-Mascheroni", "Euler-Mascheroni", "Euler-Mascheroni"),
      songPlaying: L("Canción:", "Song playing:", "Musique :", "Lied:", "Música:", "Brano:"),
      pauseSong: L("Pausar", "Pause song", "Pause", "Pause", "Pausar", "Pausa"),
      prevSong: L("Canción anterior", "Previous song", "Chanson précédente", "Vorheriges Lied", "Música anterior", "Brano precedente"),
      nextSong: L("Siguiente canción", "Next song", "Chanson suivante", "Nächstes Lied", "Próxima música", "Brano successivo"),
    },
    bruchimichis: {
      title: L("bruchimichis", "bruchimichis", "bruchimichis", "bruchimichis", "bruchimichis", "bruchimichis"),
      subtitle: L(
        "Creá gatitos, movelos y hacelos correr.",
        "Create kittens, move them and make them race.",
        "Créez des chatons, déplacez-les et faites-les courir.",
        "Erstelle Kätzchen, bewege sie und lass sie rennen.",
        "Crie gatinhos, mova-os e faça-os correr.",
        "Crea gattini, muovili e falli correre."
      ),
      createCat: L("Crear Gato", "Create Cat", "Créer un chat", "Katze erstellen", "Criar Gato", "Crea Gatto"),
      race: L("Carrera", "Race", "Course", "Rennen", "Corrida", "Gara"),
      catName: L("Nombre del gatito", "Kitten name", "Nom du chaton", "Kätzchenname", "Nome do gatinho", "Nome del gattino"),
      breed: L("Raza", "Breed", "Race", "Rasse", "Raça", "Razza"),
      breedPh: L("Ej: Persa, Siames, Mestizo…", "E.g. Persian, Siamese, Mixed…", "Ex. Persan, Siamois, Croisé…", "Z. B. Perser, Siamese, Mischling…", "Ex.: Persa, Siamês, Mestiço…", "Es. Persiano, Siamese, Meticcio…"),
      dropCat: L("¡Caer del cielo!", "Drop from the sky!", "Tomber du ciel !", "Vom Himmel fallen!", "Cair do céu!", "Cadere dal cielo!"),
      playHint: L(
        "Arrastrá los gatitos. Tocá uno para elegirlo.",
        "Drag the kittens. Tap one to select it.",
        "Faites glisser les chatons. Touchez-en un pour le sélectionner.",
        "Ziehe die Kätzchen. Tippe eines an, um es auszuwählen.",
        "Arraste os gatinhos. Toque em um para selecioná-lo.",
        "Trascina i gattini. Tocca uno per selezionarlo."
      ),
      raceStatus: L(
        "¡Clic en tu gatito para que corra más rápido!",
        "Click your kitten to run faster!",
        "Cliquez sur votre chaton pour courir plus vite !",
        "Klicke auf dein Kätzchen, um schneller zu rennen!",
        "Clique no seu gatinho para correr mais rápido!",
        "Clicca sul tuo gattino per correre più veloce!"
      ),
      raceHint: L(
        "Elegí tu gatito y hacé clic para acelerarlo.",
        "Pick your kitten and click to speed it up.",
        "Choisissez votre chaton et cliquez pour accélérer.",
        "Wähle dein Kätzchen und klicke zum Beschleunigen.",
        "Escolha seu gatinho e clique para acelerar.",
        "Scegli il tuo gattino e clicca per accelerare."
      ),
      colorBlack: L("Negro", "Black", "Noir", "Schwarz", "Preto", "Nero"),
      colorWhite: L("Blanco", "White", "Blanc", "Weiß", "Branco", "Bianco"),
      colorBrown: L("Café", "Brown", "Marron", "Braun", "Marrom", "Marrone"),
      colorGray: L("Gris", "Gray", "Gris", "Grau", "Cinza", "Grigio"),
      colorBlackWhite: L("Negro y blanco", "Black and white", "Noir et blanc", "Schwarz und weiß", "Preto e branco", "Nero e bianco"),
      colorWhiteBrown: L("Blanco y café", "White and brown", "Blanc et marron", "Weiß und braun", "Branco e marrom", "Bianco e marrone"),
      alertName: L("Ponle un nombre al gatito.", "Give the kitten a name.", "Donnez un nom au chaton.", "Gib dem Kätzchen einen Namen.", "Dê um nome ao gatinho.", "Dai un nome al gattino."),
      alertNeedCat: L("Creá al menos un gatito para la carrera.", "Create at least one kitten for the race.", "Créez au moins un chaton pour la course.", "Erstelle mindestens ein Kätzchen für das Rennen.", "Crie pelo menos um gatinho para a corrida.", "Crea almeno un gattino per la gara."),
      alertPickCat: L("Elegí tu gatito antes de la carrera.", "Pick your kitten before the race.", "Choisissez votre chaton avant la course.", "Wähle dein Kätzchen vor dem Rennen.", "Escolha seu gatinho antes da corrida.", "Scegli il tuo gattino prima della gara."),
      defaultCat: L("Gatito", "Kitten", "Chaton", "Kätzchen", "Gatinho", "Gattino"),
      raceWin: L("¡{name} ganó! Ahora es más grande y gordito 🐱", "{name} won! Now bigger and chubbier 🐱", "{name} a gagné ! Plus gros et plus rond 🐱", "{name} hat gewonnen! Jetzt größer und molliger 🐱", "{name} ganhou! Agora maior e mais gordinho 🐱", "{name} ha vinto! Ora più grande e paffuto 🐱"),
      raceBoost: L("¡{name} aceleró!", "{name} sped up!", "{name} a accéléré !", "{name} ist schneller!", "{name} acelerou!", "{name} ha accelerato!"),
      selected: L("Seleccionado: {name} · {wins} victoria(s)", "Selected: {name} · {wins} win(s)", "Sélectionné : {name} · {wins} victoire(s)", "Ausgewählt: {name} · {wins} Sieg(e)", "Selecionado: {name} · {wins} vitória(s)", "Selezionato: {name} · {wins} vittoria/e"),
      playHintTap: L("Tocá un gatito para elegirlo y arrastralo.", "Tap a kitten to select and drag it.", "Touchez un chaton pour le sélectionner.", "Tippe ein Kätzchen an, um es zu ziehen.", "Toque em um gatinho para selecionar.", "Tocca un gattino per selezionarlo."),
      playHintCreate: L("Creá un gatito con Crear Gato.", "Create a kitten with Create Cat.", "Créez un chaton avec Créer un chat.", "Erstelle ein Kätzchen mit Katze erstellen.", "Crie um gatinho com Criar Gato.", "Crea un gattino con Crea Gatto."),
      raceClickScreen: L("¡Clic en la pantalla para que tu gatito corra más rápido!", "Click the screen to make your kitten run faster!", "Cliquez pour courir plus vite !", "Klicke, damit dein Kätzchen schneller rennt!", "Clique na tela para correr mais rápido!", "Clicca per correre più veloce!"),
      yourCat: L("Tu gatito: {name}", "Your kitten: {name}", "Votre chaton : {name}", "Dein Kätzchen: {name}", "Seu gatinho: {name}", "Il tuo gattino: {name}"),
      raceBoostKeep: L("¡{name} aceleró! Seguí haciendo clic.", "{name} sped up! Keep clicking.", "{name} a accéléré ! Continuez à cliquer.", "{name} ist schneller! Weiter klicken.", "{name} acelerou! Continue clicando.", "{name} ha accelerato! Continua a cliccare."),
      raceAfterWin: L("Volvé a Jugar para verlo crecido, o corré otra carrera.", "Go back to Play to see it grown, or race again.", "Retournez à Jouer pour le voir grandi.", "Zurück zu Spielen, um es größer zu sehen.", "Volte a Jogar para vê-lo maior.", "Torna a Gioca per vederlo crescere."),
      alertPickBeforeRace: L("Elegí tu gatito en Jugar antes de la carrera.", "Pick your kitten in Play before the race.", "Choisissez votre chaton dans Jouer avant la course.", "Wähle dein Kätzchen in Spielen vor dem Rennen.", "Escolha seu gatinho em Jogar antes da corrida.", "Scegli il gattino in Gioca prima della gara."),
    },
    "country-notes": {
      title: L("Country Notes", "Country Notes", "Country Notes", "Country Notes", "Country Notes", "Country Notes"),
      subtitle: L(
        "Creá países y aparecen en el mapa como bloques 128×128.",
        "Create countries and they appear on the map as 128×128 blocks.",
        "Créez des pays qui apparaissent sur la carte en blocs 128×128.",
        "Erstelle Länder, die als 128×128-Blöcke auf der Karte erscheinen.",
        "Crie países que aparecem no mapa como blocos 128×128.",
        "Crea paesi che appaiono sulla mappa come blocchi 128×128."
      ),
      createCountry: L("Crear País", "Create Country", "Créer un pays", "Land erstellen", "Criar País", "Crea Paese"),
      continent: L("Continente", "Continent", "Continent", "Kontinent", "Continente", "Continente"),
      pickContinent: L("— Elegí un continente —", "— Pick a continent —", "— Choisissez un continent —", "— Kontinent wählen —", "— Escolha um continente —", "— Scegli un continente —"),
      mainLang: L("Idioma principal", "Main language", "Langue principale", "Hauptsprache", "Idioma principal", "Lingua principale"),
      secLang: L("Idioma secundario", "Secondary language", "Langue secondaire", "Zweitsprache", "Idioma secundário", "Lingua secondaria"),
      capital: L("Capital (nombre)", "Capital (name)", "Capitale (nom)", "Hauptstadt (Name)", "Capital (nome)", "Capitale (nome)"),
      citiesCount: L("Ciudades (cantidad)", "Cities (count)", "Villes (nombre)", "Städte (Anzahl)", "Cidades (quantidade)", "Città (numero)"),
      government: L("Gobierno", "Government", "Gouvernement", "Regierung", "Governo", "Governo"),
      firstName: L("Nombre", "First name", "Prénom", "Vorname", "Nome", "Nome"),
      lastName: L("Apellido", "Last name", "Nom", "Nachname", "Sobrenome", "Cognome"),
      militaryCount: L("Militares (cantidad)", "Military (count)", "Militaires (nombre)", "Militär (Anzahl)", "Militares (quantidade)", "Militari (numero)"),
      flagPng: L("Bandera (PNG)", "Flag (PNG)", "Drapeau (PNG)", "Flagge (PNG)", "Bandeira (PNG)", "Bandiera (PNG)"),
      flagLoaded: L("Bandera cargada.", "Flag loaded.", "Drapeau chargé.", "Flagge geladen.", "Bandeira carregada.", "Bandiera caricata."),
      saveCountry: L("Guardar país", "Save country", "Enregistrer le pays", "Land speichern", "Salvar país", "Salva paese"),
      mapHint: L(
        "Mapa 8192×8192. Doble clic en un país para ver sus datos.",
        "8192×8192 map. Double-click a country to view its info.",
        "Carte 8192×8192. Double-cliquez sur un pays pour voir ses infos.",
        "8192×8192 Karte. Doppelklick auf ein Land für Infos.",
        "Mapa 8192×8192. Duplo clique em um país para ver os dados.",
        "Mappa 8192×8192. Doppio clic su un paese per i dati."
      ),
      worldHint: L(
        "Cada país ocupa 128×128. Doble clic en un bloque para ver todo sobre el país.",
        "Each country is 128×128. Double-click a block to view the country.",
        "Chaque pays fait 128×128. Double-cliquez pour voir le pays.",
        "Jedes Land ist 128×128. Doppelklick zeigt das Land.",
        "Cada país ocupa 128×128. Duplo clique para ver o país.",
        "Ogni paese è 128×128. Doppio clic per vedere il paese."
      ),
      country: L("País", "Country", "Pays", "Land", "País", "Paese"),
      city: L("Ciudad", "City", "Ville", "Stadt", "Cidade", "Città"),
      military: L("Militar", "Soldier", "Militaire", "Soldat", "Militar", "Militare"),
      alertName: L("Escribí el nombre del país.", "Enter the country name.", "Entrez le nom du pays.", "Gib den Ländernamen ein.", "Digite o nome do país.", "Inserisci il nome del paese."),
      alertCity: L("Poné nombre a cada ciudad.", "Name every city.", "Nommez chaque ville.", "Benenne jede Stadt.", "Nomeie cada cidade.", "Nomina ogni città."),
      alertMil: L("Poné nombre a cada militar.", "Name every soldier.", "Nommez chaque militaire.", "Benenne jeden Soldaten.", "Nomeie cada militar.", "Nomina ogni militare."),
      alertFlag: L("Subí un PNG de bandera.", "Upload a PNG flag.", "Téléversez un drapeau PNG.", "Lade eine PNG-Flagge hoch.", "Envie uma bandeira PNG.", "Carica una bandiera PNG."),
      alertContinent: L("Elegí el continente del país.", "Pick the country's continent.", "Choisissez le continent.", "Wähle den Kontinent.", "Escolha o continente.", "Scegli il continente."),
      alertNoSpace: L("No hay espacio en el mapa para otro país 128×128.", "No room on the map for another 128×128 country.", "Pas de place pour un autre pays 128×128.", "Kein Platz für ein weiteres 128×128-Land.", "Sem espaço para outro país 128×128.", "Nessuno spazio per un altro paese 128×128."),
      alertFlagPng: L("La bandera tiene que ser un archivo PNG.", "The flag must be a PNG file.", "Le drapeau doit être un PNG.", "Die Flagge muss eine PNG-Datei sein.", "A bandeira deve ser PNG.", "La bandiera deve essere PNG."),
      alertFlagLoad: L("No se pudo cargar la bandera. Probá con otro PNG.", "Could not load the flag. Try another PNG.", "Impossible de charger le drapeau.", "Flagge konnte nicht geladen werden.", "Não foi possível carregar a bandeira.", "Impossibile caricare la bandiera."),
      alertSaveError: L("Error al guardar los datos.", "Error saving data.", "Erreur lors de l'enregistrement.", "Fehler beim Speichern.", "Erro ao salvar.", "Errore nel salvataggio."),
      viewContinent: L("Continente", "Continent", "Continent", "Kontinent", "Continente", "Continente"),
      viewCapital: L("Capital", "Capital", "Capitale", "Hauptstadt", "Capital", "Capitale"),
      viewTerritory: L("Territorio", "Territory", "Territoire", "Territorium", "Território", "Territorio"),
      viewFlag: L("Bandera", "Flag", "Drapeau", "Flagge", "Bandeira", "Bandiera"),
      viewCities: L("Ciudades", "Cities", "Villes", "Städte", "Cidades", "Città"),
      viewMilitary: L("Militares", "Military", "Militaires", "Militär", "Militares", "Militari"),
    },
    "creador-2d": {
      title: L("Creador 2D", "2D Creator", "Créateur 2D", "2D-Ersteller", "Criador 2D", "Creatore 2D"),
      subtitle: L(
        "Crea tu propio mundo en 2D con un editor de bloques.",
        "Create your own 2D world with a block editor.",
        "Créez votre monde 2D avec un éditeur de blocs.",
        "Erstelle deine 2D-Welt mit einem Block-Editor.",
        "Crie seu mundo 2D com um editor de blocos.",
        "Crea il tuo mondo 2D con un editor a blocchi."
      ),
      hudHint: L(
        "WASD mover · Z cambiar personaje · Editor para bloques y funciones",
        "WASD move · Z switch character · Editor for blocks and functions",
        "WASD déplacer · Z changer personnage · Éditeur pour blocs et fonctions",
        "WASD bewegen · Z Charakter wechseln · Editor für Blöcke und Funktionen",
        "WASD mover · Z trocar personagem · Editor para blocos e funções",
        "WASD muovi · Z cambia personaggio · Editor per blocchi e funzioni"
      ),
      microTitle: L("Mundo Microscópico", "Microscopic World", "Monde microscopique", "Mikroskopische Welt", "Mundo Microscópico", "Mondo microscopico"),
      microStatus: L(
        "Recoge todos los elementos de la tabla periódica y luego mezcla (Espacio).",
        "Collect all periodic table elements then mix (Space).",
        "Collectez tous les éléments du tableau périodique puis mélangez (Espace).",
        "Sammle alle Elemente und mische dann (Leertaste).",
        "Colete todos os elementos e depois misture (Espaço).",
        "Raccogli tutti gli elementi e poi mescola (Spazio)."
      ),
      microWarn: L(
        "¡Esquiva los microbios! Si pierdes, pierdes un bloque creado.",
        "Dodge the microbes! If you lose, you lose a created block.",
        "Esquivez les microbes ! Si vous perdez, vous perdez un bloc.",
        "Weiche den Mikroben aus! Bei Niederlage verlierst du einen Block.",
        "Desvie dos micróbios! Se perder, perde um bloco criado.",
        "Schiva i microbi! Se perdi, perdi un blocco creato."
      ),
      createBlock: L("Crear bloque", "Create block", "Créer un bloc", "Block erstellen", "Criar bloco", "Crea blocco"),
      blockName: L("Mi bloque", "My block", "Mon bloc", "Mein Block", "Meu bloco", "Il mio blocco"),
      function: L("Función", "Function", "Fonction", "Funktion", "Função", "Funzione"),
      funcNone: L("Nada", "Nothing", "Rien", "Nichts", "Nada", "Niente"),
      funcChar: L("Crea un personaje", "Create a character", "Créer un personnage", "Charakter erstellen", "Criar personagem", "Crea personaggio"),
      funcTeleport: L("Te teletransporta a un lugar aleatorio", "Random teleport", "Téléportation aléatoire", "Zufällige Teleportation", "Teletransporte aleatório", "Teletrasporto casuale"),
      funcSmaller: L("Te hace más pequeño", "Makes you smaller", "Vous rend plus petit", "Macht dich kleiner", "Te deixa menor", "Ti rende più piccolo"),
      funcPink: L("Te hace rosa", "Makes you pink", "Vous rend rose", "Macht dich rosa", "Te deixa rosa", "Ti rende rosa"),
      toolsBlocks: L("Herramientas y bloques", "Tools and blocks", "Outils et blocs", "Werkzeuge und Blöcke", "Ferramentas e blocos", "Strumenti e blocchi"),
      toolsHint: L(
        "Selecciona un bloque y haz clic en el mapa. La goma borra bloques.",
        "Select a block and click the map. Eraser removes blocks.",
        "Sélectionnez un bloc et cliquez sur la carte. La gomme efface.",
        "Wähle einen Block und klicke auf die Karte. Radierer löscht Blöcke.",
        "Selecione um bloco e clique no mapa. A borracha apaga blocos.",
        "Seleziona un blocco e clicca sulla mappa. La gomma cancella."
      ),
      eraser: L("Goma", "Eraser", "Gomme", "Radierer", "Borracha", "Gomma"),
      eraserHint: L("Borra bloques (no el spawn)", "Erases blocks (not spawn)", "Efface les blocs (pas le spawn)", "Löscht Blöcke (nicht Spawn)", "Apaga blocos (não o spawn)", "Cancella blocchi (non lo spawn)"),
      spawnBlock: L("Bloque del spawn", "Spawn block", "Bloc de spawn", "Spawn-Block", "Bloco do spawn", "Blocco spawn"),
      loadError: L("No se pudo iniciar el juego.", "Could not start the game.", "Impossible de démarrer.", "Spiel konnte nicht starten.", "Não foi possível iniciar.", "Impossibile avviare il gioco."),
      loading: L("Cargando…", "Loading…", "Chargement…", "Laden…", "Carregando…", "Caricamento…"),
      loadGameError: L("El juego no se cargó. Recarga la página.", "The game did not load. Reload the page.", "Le jeu ne s'est pas chargé.", "Spiel nicht geladen.", "O jogo não carregou.", "Il gioco non si è caricato."),
      startError: L("No se pudo iniciar Creador 2D.\n\n", "Could not start 2D Creator.\n\n", "Impossible de démarrer.\n\n", "2D-Ersteller konnte nicht starten.\n\n", "Não foi possível iniciar.\n\n", "Impossibile avviare.\n\n"),
      alertNoCreate: L("Ya no puedes crear nuevos bloques.", "You cannot create new blocks anymore.", "Vous ne pouvez plus créer de blocs.", "Du kannst keine neuen Blöcke mehr erstellen.", "Não pode mais criar blocos.", "Non puoi più creare blocchi."),
      alertBlockName: L("Escribe un nombre para el bloque.", "Enter a block name.", "Entrez un nom de bloc.", "Gib einen Blocknamen ein.", "Digite um nome para o bloco.", "Inserisci un nome per il blocco."),
      alertCharOnce: L("La función «Crea un personaje» solo se puede colocar una vez.", "«Create character» can only be placed once.", "«Créer personnage» une seule fois.", "«Charakter erstellen» nur einmal.", "«Criar personagem» só uma vez.", "«Crea personaggio» solo una volta."),
      alertCharOnly: L("Solo puedes colocar un bloque con «Crea un personaje».", "You can only place one «Create character» block.", "Un seul bloc «Créer personnage».", "Nur ein «Charakter erstellen»-Block.", "Só um bloco «Criar personagem».", "Solo un blocco «Crea personaggio»."),
      alertLostBlock: L("Perdiste el bloque «{name}».", "You lost the block «{name}».", "Bloc «{name}» perdu.", "Block «{name}» verloren.", "Perdeu o bloco «{name}».", "Hai perso il blocco «{name}»."),
      alertNoBlocksLeft: L("No te quedan bloques creados.", "You have no created blocks left.", "Plus de blocs créés.", "Keine erstellten Blöcke mehr.", "Sem blocos criados.", "Nessun blocco creato rimasto."),
    },
    "object-battle": {
      title: L("Object Battle", "Object Battle", "Object Battle", "Object Battle", "Object Battle", "Object Battle"),
      subtitle: L(
        "Creá objetos con caras, dejalos caer del cielo y cambiá con Z.",
        "Create objects with faces, drop from the sky, and switch with Z.",
        "Créez des objets avec des visages, laissez-les tomber et changez avec Z.",
        "Erstelle Objekte mit Gesichtern, lasse sie fallen und wechsle mit Z.",
        "Crie objetos com rostos, deixe-os cair e troque com Z.",
        "Crea oggetti con facce, falli cadere e cambia con Z."
      ),
      createObject: L("Crear objeto", "Create object", "Créer un objet", "Objekt erstellen", "Criar objeto", "Crea oggetto"),
      addObject: L("+ Crear objeto", "+ Create object", "+ Créer un objet", "+ Objekt erstellen", "+ Criar objeto", "+ Crea oggetto"),
      battleBfdi: L("Battle For BFDI", "Battle For BFDI", "Battle For BFDI", "Battle For BFDI", "Battle For BFDI", "Battle For BFDI"),
      bfdis: L("BFDIs", "BFDIs", "BFDIs", "BFDIs", "BFDIs", "BFDIs"),
      history: L("Partidas", "Games", "Parties", "Spiele", "Jogos", "Partite"),
      worldHint: L(
        "WASD mover · Espacio saltar · Z cambiar objeto · Los nuevos caen del cielo",
        "WASD move · Space jump · Z switch object · New objects fall from the sky",
        "WASD · Espace sauter · Z changer objet · Les nouveaux tombent du ciel",
        "WASD · Leertaste springen · Z wechseln · Neue Objekte fallen vom Himmel",
        "WASD mover · Espaço pular · Z trocar objeto · Novos caem do céu",
        "WASD · Spazio salta · Z cambia oggetto · I nuovi cadono dal cielo"
      ),
      objectName: L("Nombre del objeto", "Object name", "Nom de l'objet", "Objektname", "Nome do objeto", "Nome oggetto"),
      shape: L("Forma", "Shape", "Forme", "Form", "Forma", "Forma"),
      mouth: L("Boca", "Mouth", "Bouche", "Mund", "Boca", "Bocca"),
      unnamed: L("Sin nombre", "Unnamed", "Sans nom", "Unbenannt", "Sem nome", "Senza nome"),
      objectsMeta: L("{n} objetos · P1", "{n} objects · P1", "{n} objets · P1", "{n} Objekte · P1", "{n} objetos · P1", "{n} oggetti · P1"),
      alertOpenGame: L("Creá o abrí una partida primero.", "Create or open a game first.", "Créez ou ouvrez une partie.", "Erstelle oder öffne zuerst ein Spiel.", "Crie ou abra um jogo primeiro.", "Crea o apri una partita."),
      alertEnterName: L("Escribí un nombre.", "Enter a name.", "Entrez un nom.", "Gib einen Namen ein.", "Digite um nome.", "Inserisci un nome."),
      alertNeed2: L("Creá al menos 2 objetos para Battle For BFDI.", "Create at least 2 objects for Battle For BFDI.", "Créez au moins 2 objets pour Battle For BFDI.", "Erstelle mindestens 2 Objekte für Battle For BFDI.", "Crie pelo menos 2 objetos.", "Crea almeno 2 oggetti per Battle For BFDI."),
      battleEnded: L("Batalla terminada.", "Battle ended.", "Bataille terminée.", "Kampf beendet.", "Batalha encerrada.", "Battaglia terminata."),
      bfdiWin: L("¡{name} gana un BFDI!", "{name} wins a BFDI!", "{name} gagne un BFDI !", "{name} gewinnt ein BFDI!", "{name} ganha um BFDI!", "{name} vince un BFDI!"),
      partidaObjects: L("{n} objetos", "{n} objects", "{n} objets", "{n} Objekte", "{n} objetos", "{n} oggetti"),
      historyWon: L("{winner} ganó", "{winner} won", "{winner} a gagné", "{winner} hat gewonnen", "{winner} ganhou", "{winner} ha vinto"),
      contestantsRemain: L("{n} participantes restantes", "{n} contestants remain", "{n} participants restants", "{n} Teilnehmer übrig", "{n} participantes restantes", "{n} concorrenti rimasti"),
      final3: L("Final 3 — ¡votá al ganador del BFDI!", "Final 3 — vote for the BFDI winner!", "Final 3 — votez pour le gagnant !", "Final 3 — stimme für den Gewinner!", "Final 3 — vote no vencedor!", "Final 3 — vota il vincitore!"),
      finalVote: L("Voto final", "Final Vote", "Vote final", "Finale Abstimmung", "Voto final", "Voto finale"),
      finalVoteDesc: L("Ingresá votos. El que tenga más gana el BFDI.", "Enter votes. Highest votes wins the BFDI.", "Entrez les votes. Le plus de votes gagne.", "Stimmen eingeben. Meiste Stimmen gewinnt.", "Digite votos. Quem tiver mais vence.", "Inserisci voti. Chi ha di più vince."),
    },
    "algicosathlon-maker-english": {
      title: L("Algicosathlon Maker", "Algicosathlon Maker In English", "Algicosathlon Maker", "Algicosathlon Maker", "Algicosathlon Maker", "Algicosathlon Maker"),
      subtitle: L(
        "Creá juegos, diseñá pelotas y competí en el Algicosathlon.",
        "Create games, design balls and compete in the Algicosathlon.",
        "Créez des jeux, concevez des balles et participez à l'Algicosathlon.",
        "Erstelle Spiele, entwirf Bälle und tritt im Algicosathlon an.",
        "Crie jogos, desenhe bolas e compita no Algicosathlon.",
        "Crea giochi, progetta palline e competi nell'Algicosathlon."
      ),
      saveBalls: L("Guardar pelotas", "Save balls", "Enregistrer les balles", "Bälle speichern", "Salvar bolas", "Salva palline"),
      chooseFolder: L("Elegir carpeta", "Choose folder", "Choisir un dossier", "Ordner wählen", "Escolher pasta", "Scegli cartella"),
      noFolder: L("Ninguna carpeta seleccionada", "No folder selected", "Aucun dossier sélectionné", "Kein Ordner ausgewählt", "Nenhuma pasta selecionada", "Nessuna cartella selezionata"),
      saveBall: L("Guardar pelota", "Save ball", "Enregistrer la balle", "Ball speichern", "Salvar bola", "Salva pallina"),
      loadBall: L("Cargar pelota", "Load ball", "Charger la balle", "Ball laden", "Carregar bola", "Carica pallina"),
      downloadJson: L("Descargar .json", "Download .json", "Télécharger .json", ".json herunterladen", "Baixar .json", "Scarica .json"),
      uploadJson: L("Subir .json", "Upload .json", "Importer .json", ".json hochladen", "Enviar .json", "Carica .json"),
      folderFallback: L(
        "Si tu navegador no puede elegir carpeta, usá estas opciones:",
        "If your browser cannot pick a folder, use these options:",
        "Si votre navigateur ne peut pas choisir un dossier :",
        "Wenn dein Browser keinen Ordner wählen kann:",
        "Se o navegador não escolher pasta, use:",
        "Se il browser non può scegliere cartella:"
      ),
      algicosathlon: L("Algicosathlon", "Algicosathlon", "Algicosathlon", "Algicosathlon", "Algicosathlon", "Algicosathlon"),
      viewerVoting: L("Votación de espectadores", "Algicosathlon Viewer Voting", "Vote des spectateurs", "Zuschauer-Abstimmung", "Votação de espectadores", "Voto spettatori"),
      fightAll: L("Combatir a todos", "Fight All", "Combattre tous", "Alle bekämpfen", "Lutar com todos", "Combatti tutti"),
      wins: L("Victorias", "Wins", "Victoires", "Siege", "Vitórias", "Vittorie"),
      createBall: L("Crear pelota", "Create ball", "Créer une balle", "Ball erstellen", "Criar bola", "Crea pallina"),
      dragBalls: L("Arrastrá y soltá las pelotas.", "Drag and drop the balls.", "Glissez-déposez les balles.", "Ziehe die Bälle.", "Arraste as bolas.", "Trascina le palline."),
      ballsMeta: L("{n} pelotas", "{n} balls", "{n} balles", "{n} Bälle", "{n} bolas", "{n} palline"),
      saveBallsHint: L(
        "Guardá la pelota del editor en un archivo .json (1 pelota por archivo). Al cargar, llena el creador.",
        "Save the ball from the editor to a .json file (1 ball per file). Loading fills the creator.",
        "Enregistrez la balle en .json (1 par fichier).",
        "Speichere den Ball als .json (1 pro Datei).",
        "Salve a bola em .json (1 por arquivo).",
        "Salva la pallina in .json (1 per file)."
      ),
      alertOpenGame: L("Creá o abrí una partida primero.", "Create or open a game first.", "Créez ou ouvrez une partie.", "Erstelle oder öffne zuerst ein Spiel.", "Crie ou abra um jogo.", "Crea o apri una partita."),
      alertBallName: L("Escribí un nombre para la pelota.", "Enter a name for the ball.", "Entrez un nom pour la balle.", "Gib einen Namen für den Ball ein.", "Digite um nome para a bola.", "Inserisci un nome per la pallina."),
      alertViewerName: L("Escribí un nombre de espectador primero.", "Enter a viewer name first.", "Entrez un nom de spectateur.", "Gib zuerst einen Zuschauernamen ein.", "Digite um nome de espectador.", "Inserisci un nome spettatore."),
      alertViewerVote: L("Registrá al menos un voto de espectador primero.", "Record at least one viewer vote first.", "Enregistrez au moins un vote.", "Erfasse mindestens eine Stimme.", "Registre pelo menos um voto.", "Registra almeno un voto."),
      alertMinBalls: L("Necesitás al menos {n} pelotas para el Algicosathlon.", "You need at least {n} balls for the Algicosathlon.", "Il faut au moins {n} balles.", "Mindestens {n} Bälle nötig.", "Precisa de pelo menos {n} bolas.", "Servono almeno {n} palline."),
      alertMinBallsHave: L("Necesitás al menos {n} pelotas.\nTenés {have}.", "You need at least {n} balls.\nYou have {have}.", "Il faut {n} balles.\nVous en avez {have}.", "Mindestens {n} Bälle.\nDu hast {have}.", "Precisa de {n} bolas.\nVocê tem {have}.", "Servono {n} palline.\nNe hai {have}."),
      alertMinBallsViewer: L("Necesitás al menos {n} pelotas para la votación.\nTenés {have}.", "You need at least {n} balls for Viewer Voting.\nYou have {have}.", "Il faut {n} balles pour le vote.\nVous en avez {have}.", "Mindestens {n} Bälle für Zuschauer-Abstimmung.\nDu hast {have}.", "Precisa de {n} bolas para votação.\nVocê tem {have}.", "Servono {n} palline per il voto.\nNe hai {have}."),
      alertMinBallsTotal: L("Necesitás al menos {n} pelotas en total.\nTenés {have}.", "You need at least {n} balls in total across all games.\nYou have {have}.", "Il faut {n} balles au total.\nVous en avez {have}.", "Mindestens {n} Bälle insgesamt.\nDu hast {have}.", "Precisa de {n} bolas no total.\nVocê tem {have}.", "Servono {n} palline in totale.\nNe hai {have}."),
      alertOpenGameShort: L("Abrí una partida primero.", "Open a game first.", "Ouvrez une partie.", "Öffne zuerst ein Spiel.", "Abra um jogo primeiro.", "Apri una partita."),
      alertMin2Fight: L("Necesitás al menos 2 partidas para Combatir a todos.", "You need at least 2 games for Fight All.", "Il faut 2 parties pour Combattre tous.", "Mindestens 2 Spiele für Alle bekämpfen.", "Precisa de 2 jogos.", "Servono 2 partite."),
      scoreboard: L("Marcador", "Scoreboard", "Tableau", "Punktestand", "Placar", "Punteggio"),
      elimination: L("¡Eliminación!", "Elimination!", "Élimination !", "Eliminierung!", "Eliminação!", "Eliminazione!"),
      nextChallenge: L("Siguiente desafío", "Next challenge", "Défi suivant", "Nächste Herausforderung", "Próximo desafio", "Prossima sfida"),
      restart: L("Reiniciar", "Restart", "Recommencer", "Neustart", "Reiniciar", "Ricomincia"),
      ballNamePh: L("Ej: Sol, Rayo, 42…", "e.g. Sun, Bolt, 42...", "Ex. Soleil, Éclair, 42…", "z. B. Sonne, Blitz, 42…", "Ex.: Sol, Raio, 42…", "Es. Sole, Fulmine, 42…"),
      color1: L("Color 1", "Color 1", "Couleur 1", "Farbe 1", "Cor 1", "Colore 1"),
      color2: L("Color 2", "Color 2", "Couleur 2", "Farbe 2", "Cor 2", "Colore 2"),
      rainbow: L("Arcoíris", "Rainbow", "Arc-en-ciel", "Regenbogen", "Arco-íris", "Arcobaleno"),
      monochrome: L("Monocromo", "Monochrome", "Monochrome", "Monochrom", "Monocromático", "Monocromatico"),
      customBorder: L("Borde personalizado", "Custom border", "Bordure personnalisée", "Eigener Rand", "Borda personalizada", "Bordo personalizzato"),
      borderColor: L("Color del borde", "Border color", "Couleur de bordure", "Randfarbe", "Cor da borda", "Colore bordo"),
      textInCenter: L("Texto (nombre al centro)", "Text (name in the center)", "Texte (nom au centre)", "Text (Name in der Mitte)", "Texto (nome no centro)", "Testo (nome al centro)"),
      textColor: L("Color del texto", "Text color", "Couleur du texte", "Textfarbe", "Cor do texto", "Colore testo"),
      addToWorld: L("Agregar al mundo", "Add to world", "Ajouter au monde", "Zur Welt hinzufügen", "Adicionar ao mundo", "Aggiungi al mondo"),
      unnamed: L("Sin nombre", "Unnamed", "Sans nom", "Unbenannt", "Sem nome", "Senza nome"),
      createBallBtn: L("+ Crear pelota", "+ Create ball", "+ Créer une balle", "+ Ball erstellen", "+ Criar bola", "+ Crea pallina"),
      winStorage: L("Almacén de victorias", "Win Storage", "Stockage des victoires", "Sieg-Speicher", "Armazém de vitórias", "Archivio vittorie"),
      winStorageHint: L(
        "Las victorias se guardan al ganar el Algicosathlon. Se reinician si creás una pelota nueva.",
        "Wins are saved when you win the Algicosathlon. They reset if you create a new ball.",
        "Les victoires sont enregistrées en gagnant l'Algicosathlon.",
        "Siege werden beim Gewinn gespeichert. Sie setzen sich zurück bei neuer Kugel.",
        "Vitórias são salvas ao ganhar o Algicosathlon.",
        "Le vittorie si salvano vincendo l'Algicosathlon."
      ),
      noBallsInGame: L("No hay pelotas en esta partida.", "No balls in this game.", "Aucune balle dans cette partie.", "Keine Bälle in diesem Spiel.", "Sem bolas neste jogo.", "Nessuna pallina in questa partita."),
      noBallsWithWins: L("Aún no hay pelotas con victorias.", "No balls with wins yet.", "Pas encore de victoires.", "Noch keine Siege.", "Sem vitórias ainda.", "Nessuna vittoria ancora."),
      deleteGame: L("Eliminar partida", "Delete game", "Supprimer la partie", "Spiel löschen", "Excluir jogo", "Elimina partita"),
      deleteGameConfirm: L('¿Eliminar "{name}"?', 'Delete "{name}"?', 'Supprimer « {name} » ?', '«{name}» löschen?', 'Excluir "{name}"?', 'Eliminare "{name}"?'),
      winBadge: L("{n} victoria(s)", "{n} win(s)", "{n} victoire(s)", "{n} Sieg(e)", "{n} vitória(s)", "{n} vittoria/e"),
      saveError: L("Error al guardar.", "Error saving.", "Erreur d'enregistrement.", "Fehler beim Speichern.", "Erro ao salvar.", "Errore nel salvataggio."),
    },
    "shape-bowl-race": {
      title: L("Shape Bowl Race", "Shape Bowl Race", "Shape Bowl Race", "Shape Bowl Race", "Shape Bowl Race", "Shape Bowl Race"),
      subtitle: L(
        "Creá juegos, diseñá pelotitas y corré en el tazón.",
        "Create games, design balls and race them in the bowl.",
        "Créez des jeux, des balles et courez dans le bol.",
        "Erstelle Spiele, Bälle und renne in der Schüssel.",
        "Crie jogos, bolas e corra na tigela.",
        "Crea giochi, palline e gareggia nella ciotola."
      ),
      bowlRace: L("Bowl Race", "Bowl Race", "Bowl Race", "Bowl Race", "Bowl Race", "Bowl Race"),
      earnings: L("Ganancias", "Earnings", "Gains", "Gewinne", "Ganhos", "Guadagni"),
      earningsStorage: L("Ganancias", "Earnings", "Gains", "Gewinne", "Ganhos", "Guadagni"),
      earningsHint: L(
        "Las ganancias se guardan cuando una pelotita gana el Bowl Race. Se reinician si creás una pelota nueva.",
        "Earnings are saved when a ball wins Bowl Race. They reset if you create a new ball.",
        "Les gains sont enregistrés quand une balle gagne le Bowl Race.",
        "Gewinne werden gespeichert, wenn ein Ball gewinnt.",
        "Ganhos são salvos quando uma bola vence o Bowl Race.",
        "I guadagni si salvano quando una pallina vince."
      ),
      earningsSaved: L("Ganancia guardada.", "Earning saved.", "Gain enregistré.", "Gewinn gespeichert.", "Ganho salvo.", "Guadagno salvato."),
      earningsBadge: L("{n} ganancia(s)", "{n} earning(s)", "{n} gain(s)", "{n} Gewinn(e)", "{n} ganho(s)", "{n} guadagno/i"),
      jump: L("Salto", "Jump", "Saut", "Sprung", "Salto", "Salto"),
      turn: L("Vuelta", "Turn", "Tour", "Drehung", "Volta", "Giro"),
      dragBalls: L("Arrastrá y soltá las pelotas.", "Drag and drop the balls.", "Glissez-déposez les balles.", "Ziehe die Bälle.", "Arraste as bolas.", "Trascina le palline."),
      createBall: L("Crear pelota", "Create ball", "Créer une balle", "Ball erstellen", "Criar bola", "Crea pallina"),
      createBallBtn: L("+ Crear pelota", "+ Create ball", "+ Créer une balle", "+ Ball erstellen", "+ Criar bola", "+ Crea pallina"),
      ballsMeta: L("{n} pelotas", "{n} balls", "{n} balles", "{n} Bälle", "{n} bolas", "{n} palline"),
      ballNamePh: L("Ej: Sol, Rayo, 42…", "e.g. Sun, Bolt, 42...", "Ex. Soleil, Éclair, 42…", "z. B. Sonne, Blitz, 42…", "Ex.: Sol, Raio, 42…", "Es. Sole, Fulmine, 42…"),
      color1: L("Color 1", "Color 1", "Couleur 1", "Farbe 1", "Cor 1", "Colore 1"),
      color2: L("Color 2", "Color 2", "Couleur 2", "Farbe 2", "Cor 2", "Colore 2"),
      rainbow: L("Arcoíris", "Rainbow", "Arc-en-ciel", "Regenbogen", "Arco-íris", "Arcobaleno"),
      monochrome: L("Monocromo", "Monochrome", "Monochrome", "Monochrom", "Monocromático", "Monocromatico"),
      customBorder: L("Borde personalizado", "Custom border", "Bordure personnalisée", "Eigener Rand", "Borda personalizada", "Bordo personalizzato"),
      borderColor: L("Color del borde", "Border color", "Couleur de bordure", "Randfarbe", "Cor da borda", "Colore bordo"),
      textInCenter: L("Texto (nombre al centro)", "Text (name in the center)", "Texte (nom au centre)", "Text (Name in der Mitte)", "Texto (nome no centro)", "Testo (nome al centro)"),
      textColor: L("Color del texto", "Text color", "Couleur du texte", "Textfarbe", "Cor do texto", "Colore testo"),
      addToWorld: L("Agregar al mundo", "Add to world", "Ajouter au monde", "Zur Welt hinzufügen", "Adicionar ao mundo", "Aggiungi al mondo"),
      unnamed: L("Sin nombre", "Unnamed", "Sans nom", "Unbenannt", "Sem nome", "Senza nome"),
      alertOpenGame: L("Creá o abrí una partida primero.", "Create or open a game first.", "Créez ou ouvrez une partie.", "Erstelle oder öffne zuerst ein Spiel.", "Crie ou abra um jogo.", "Crea o apri una partita."),
      alertBallName: L("Escribí un nombre para la pelota.", "Enter a name for the ball.", "Entrez un nom pour la balle.", "Gib einen Namen für den Ball ein.", "Digite um nome para a bola.", "Inserisci un nome per la pallina."),
      alertOpenGameShort: L("Abrí una partida primero.", "Open a game first.", "Ouvrez une partie.", "Öffne zuerst ein Spiel.", "Abra um jogo primeiro.", "Apri una partita."),
      alertMinBalls: L("Necesitás al menos {n} pelotas.\nTenés {have}.", "You need at least {n} balls.\nYou have {have}.", "Il faut {n} balles.\nVous en avez {have}.", "Mindestens {n} Bälle.\nDu hast {have}.", "Precisa de {n} bolas.\nVocê tem {have}.", "Servono {n} palline.\nNe hai {have}."),
      deleteGame: L("Eliminar partida", "Delete game", "Supprimer la partie", "Spiel löschen", "Excluir jogo", "Elimina partita"),
      deleteGameConfirm: L('¿Eliminar "{name}"?', 'Delete "{name}"?', 'Supprimer « {name} » ?', '«{name}» löschen?', 'Excluir "{name}"?', 'Eliminare "{name}"?'),
      noBallsInGame: L("No hay pelotas en esta partida.", "No balls in this game.", "Aucune balle.", "Keine Bälle.", "Sem bolas.", "Nessuna pallina."),
      bowlReady: L("Arrastrá el tazón. Solo pierde quien salga por arriba. ¡La última gana!", "Drag the bowl. Balls only lose if they exit from the top. Last one wins!", "Faites glisser le bol. On ne perd qu'en sortant par le haut.", "Ziehe die Schüssel. Verlieren nur oben.", "Arraste a tigela. Só perde quem sair por cima.", "Trascina la ciotola. Si perde solo uscendo in alto."),
      bowlDragHint: L(
        "Hacé clic en el tazón y arrastralo mientras mantenés el clic.",
        "Click the bowl and drag it while holding the click.",
        "Cliquez sur le bol et faites-le glisser.",
        "Klicke auf die Schüssel und ziehe sie.",
        "Clique na tigela e arraste.",
        "Clicca sulla ciotola e trascina."
      ),
      bowlRemaining: L("{n} pelotitas en el tazón", "{n} balls in the bowl", "{n} balles dans le bol", "{n} Bälle in der Schüssel", "{n} bolas na tigela", "{n} palline nella ciotola"),
      bowlWinner: L("¡{name} ganó una ganancia!", "{name} earned a win!", "{name} a gagné !", "{name} hat gewonnen!", "{name} ganhou!", "{name} ha vinto!"),
      bowlNoWinner: L("Todas salieron del tazón. Volvé al mundo e intentá de nuevo.", "Everyone fell out. Go back and try again.", "Toutes sont tombées.", "Alle rausgefallen.", "Todos caíram.", "Tutti fuori."),
      saveError: L("Error al guardar.", "Error saving.", "Erreur.", "Fehler.", "Erro.", "Errore."),
    },
    "ruleta-especial": {
      title: L("Ruleta Especial", "Special Roulette", "Roulette Spéciale", "Spezial-Roulette", "Roleta Especial", "Ruota Speciale"),
      subtitle: L(
        "Escribí opciones, girá la ruleta y mirá el historial de ganadores.",
        "Write options, spin the wheel, and check the winners history.",
        "Écrivez des options, tournez et voyez l'historique.",
        "Optionen schreiben, drehen und Historie sehen.",
        "Escreva opções, gire e veja o histórico.",
        "Scrivi opzioni, gira e guarda lo storico."
      ),
      spin: L("Jugar", "Play", "Jouer", "Spielen", "Jogar", "Gioca"),
      options: L("Opciones", "Options", "Options", "Optionen", "Opções", "Opzioni"),
      optionsHint: L(
        "Escribí una opción y dale Enter para agregarla.",
        "Type an option and press Enter to add it.",
        "Tapez une option et appuyez sur Entrée.",
        "Option tippen und Enter drücken.",
        "Digite uma opção e pressione Enter.",
        "Scrivi un'opzione e premi Invio."
      ),
      optionPh: L("Nueva opción…", "New option…", "Nouvelle option…", "Neue Option…", "Nova opção…", "Nuova opzione…"),
      noOptions: L("Todavía no hay opciones.", "No options yet.", "Pas encore d'options.", "Noch keine Optionen.", "Ainda sem opções.", "Nessuna opzione ancora."),
      history: L("Historial de ganadores", "Winners history", "Historique des gagnants", "Gewinnerhistorie", "Histórico de vencedores", "Storico vincitori"),
      clear: L("Limpiar", "Clear", "Effacer", "Leeren", "Limpar", "Pulisci"),
      noHistory: L("Aún no hay ganadores.", "No winners yet.", "Pas encore de gagnants.", "Noch keine Gewinner.", "Ainda sem vencedores.", "Nessun vincitore ancora."),
      remove: L("Quitar", "Remove", "Retirer", "Entfernen", "Remover", "Rimuovi"),
      optionCount: L("{n} opciones", "{n} options", "{n} options", "{n} Optionen", "{n} opções", "{n} opzioni"),
      spinning: L("Girando…", "Spinning…", "Ça tourne…", "Dreht…", "Girando…", "Gira…"),
      winner: L("¡Ganó: {name}!", "Winner: {name}!", "Gagnant : {name} !", "Gewinner: {name}!", "Venceu: {name}!", "Ha vinto: {name}!"),
      alertNeedOptions: L("Agregá al menos 1 opción.", "Add at least 1 option.", "Ajoutez au moins 1 option.", "Mindestens 1 Option.", "Adicione pelo menos 1 opção.", "Aggiungi almeno 1 opzione."),
      alertMaxOptions: L("Máximo 40 opciones.", "Maximum 40 options.", "Maximum 40 options.", "Maximal 40 Optionen.", "Máximo 40 opções.", "Massimo 40 opzioni."),
    },
    "cronometro-loco": {
      title: L("Cronómetro Loco", "Crazy Stopwatch", "Chronomètre Fou", "Verrückte Stoppuhr", "Cronômetro Louco", "Cronometro Pazzo"),
      subtitle: L(
        "Un cronómetro con chances locas en cada segundo.",
        "A stopwatch with crazy chances every second.",
        "Un chronomètre avec des chances folles chaque seconde.",
        "Eine Stoppuhr mit verrückten Chancen jede Sekunde.",
        "Um cronômetro com chances loucas a cada segundo.",
        "Un cronometro con probabilità pazze ogni secondo."
      ),
      settings: L("Configuraciones", "Settings", "Réglages", "Einstellungen", "Configurações", "Impostazioni"),
      reset: L("Reiniciar", "Reset", "Réinitialiser", "Zurücksetzen", "Reiniciar", "Reset"),
      startTimer: L("Empezar", "Start", "Démarrer", "Start", "Começar", "Avvia"),
      pauseTimer: L("Pausar", "Pause", "Pause", "Pause", "Pausar", "Pausa"),
      waiting: L("Dale a Empezar.", "Press Start.", "Appuyez sur Démarrer.", "Drücke Start.", "Toque em Começar.", "Premi Avvia."),
      running: L("Corriendo…", "Running…", "En cours…", "Läuft…", "Rodando…", "In corso…"),
      paused: L("Pausado.", "Paused.", "En pause.", "Pausiert.", "Pausado.", "In pausa."),
      tickPace: L(
        "1 segundo del cronómetro tarda {n} s",
        "1 stopwatch second takes {n} s",
        "1 seconde du chronomètre dure {n} s",
        "1 Stoppuhr-Sekunde dauert {n} s",
        "1 segundo do cronômetro demora {n} s",
        "1 secondo del cronometro dura {n} s"
      ),
      chanceHint: L(
        "Si activás otra chance, se resta del 100% de \"baja 1 segundo\".",
        "If you enable another chance, it is subtracted from the 100% \"minus 1 second\".",
        "Si vous activez une chance, elle se soustrait du 100 % « -1 seconde ».",
        "Aktivierte Chancen werden vom 100%-\"-1 Sekunde\" abgezogen.",
        "Se ativar outra chance, ela e subtraida dos 100% de \"-1 segundo\".",
        "Se attivi un'altra probabilita, si sottrae dal 100% di \"-1 secondo\"."
      ),
      defaultChance: L("{n}% chance baja 1 segundo", "{n}% chance minus 1 second", "{n} % chance -1 seconde", "{n} % Chance -1 Sekunde", "{n}% chance -1 segundo", "{n}% probabilita -1 secondo"),
      chanceOverflow: L("La suma de chances no puede superar 100%.", "Chances cannot add up to more than 100%.", "La somme ne peut pas dépasser 100 %.", "Summe darf 100 % nicht überschreiten.", "A soma não pode passar de 100%.", "La somma non può superare il 100%."),
      activeChances: L("Chances activas", "Active chances", "Chances actives", "Aktive Chancen", "Chances ativas", "Probabilità attive"),
      fxMinus1: L("Baja 1 segundo", "Minus 1 second", "-1 seconde", "-1 Sekunde", "-1 segundo", "-1 secondo"),
      fxPlus1: L("Un segundo más", "Plus 1 second", "+1 seconde", "+1 Sekunde", "+1 segundo", "+1 secondo"),
      fxDouble: L("Se duplica el tiempo", "Time doubles", "Le temps double", "Zeit verdoppelt", "O tempo dobra", "Il tempo raddoppia"),
      fxSwap: L("Minutos y segundos intercambian posición", "Minutes and seconds swap", "Minutes et secondes s'échangent", "Minuten und Sekunden tauschen", "Minutos e segundos trocam", "Minuti e secondi si scambiano"),
      fxMinus10: L("10 segundos menos", "Minus 10 seconds", "-10 secondes", "-10 Sekunden", "-10 segundos", "-10 secondi"),
      fxHalf: L("Se reduce a la mitad", "Time halves", "Le temps est divisé par 2", "Zeit halbiert", "O tempo pela metade", "Il tempo dimezza"),
      fxFreeze: L("El tiempo se congela por 3 segundos", "Time freezes for 3 seconds", "Le temps gèle 3 secondes", "Zeit friert 3 Sekunden", "O tempo congela por 3 segundos", "Il tempo si congela per 3 secondi"),
      fxWaitHalf: L("Espera entre ticks a la mitad", "Tick wait halved", "Attente entre ticks /2", "Tick-Wartezeit halb", "Espera entre ticks pela metade", "Attesa tra tick a metà"),
      fxWaitDouble: L("Espera entre ticks duplicada", "Tick wait doubled", "Attente entre ticks x2", "Tick-Wartezeit doppelt", "Espera entre ticks duplicada", "Attesa tra tick raddoppiata"),
      fxWaitNormal: L("Espera entre ticks normal", "Tick wait normal", "Attente normale", "Normale Tick-Wartezeit", "Espera entre ticks normal", "Attesa tra tick normale"),
      fxPlus60: L("1 minuto más al tiempo", "Plus 1 minute", "+1 minute", "+1 Minute", "+1 minuto", "+1 minuto"),
      evtMinus1: L("-1 segundo", "-1 second", "-1 seconde", "-1 Sekunde", "-1 segundo", "-1 secondo"),
      evtPlus1: L("+1 segundo", "+1 second", "+1 seconde", "+1 Sekunde", "+1 segundo", "+1 secondo"),
      evtDouble: L("¡Tiempo duplicado!", "Time doubled!", "Temps double !", "Zeit verdoppelt!", "Tempo dobrado!", "Tempo raddoppiato!"),
      evtSwap: L("¡Minutos y segundos intercambiados!", "Minutes and seconds swapped!", "Minutes/secondes echanges !", "Minuten/Sekunden getauscht!", "Minutos e segundos trocados!", "Minuti e secondi scambiati!"),
      evtMinus10: L("-10 segundos", "-10 seconds", "-10 secondes", "-10 Sekunden", "-10 segundos", "-10 secondi"),
      evtHalf: L("¡Tiempo a la mitad!", "Time halved!", "Temps /2 !", "Zeit halbiert!", "Tempo pela metade!", "Tempo dimezzato!"),
      evtFreeze: L("Congelado 3 segundos…", "Frozen for 3 seconds…", "Gele 3 secondes…", "3 Sekunden eingefroren…", "Congelado 3 segundos…", "Congelato 3 secondi…"),
      evtWaitHalf: L("Espera x0.5", "Wait x0.5", "Attente x0.5", "Wartezeit x0.5", "Espera x0.5", "Attesa x0.5"),
      evtWaitDouble: L("Espera x2", "Wait x2", "Attente x2", "Wartezeit x2", "Espera x2", "Attesa x2"),
      evtWaitNormal: L("Espera normal", "Normal wait", "Attente normale", "Normale Wartezeit", "Espera normal", "Attesa normale"),
      evtPlus60: L("+1 minuto", "+1 minute", "+1 minute", "+1 Minute", "+1 minuto", "+1 minuto"),
    },
  };

  let currentGameId = null;
  const changeListeners = [];

  const LOCALE_PATCH = {
    common: {
      ru: {
        backToAdmin: "Вернуться к администратору", admin: "Админ", play: "Играть", save: "Сохранить",
        start: "Начать", create: "Создать", name: "Имя", cancel: "Отмена", games: "Игры",
        createGame: "Создать игру", gameName: "Название игры", noGamesYet: "Пока нет игр.",
        saved: "Сохранено.", loading: "Загрузка…", editor: "Редактор", close: "Закрыть",
        color: "Цвет", world: "Мир",
      },
      pl: {
        backToAdmin: "Wróć do administratora", admin: "Admin", play: "Graj", save: "Zapisz",
        start: "Start", create: "Utwórz", name: "Nazwa", cancel: "Anuluj", games: "Gry",
        createGame: "Utwórz grę", gameName: "Nazwa gry", noGamesYet: "Brak gier.",
        saved: "Zapisano.", loading: "Ładowanie…", editor: "Edytor", close: "Zamknij",
        color: "Kolor", world: "Świat",
      },
      nl: {
        backToAdmin: "Terug naar beheer", admin: "Beheer", play: "Spelen", save: "Opslaan",
        start: "Start", create: "Maken", name: "Naam", cancel: "Annuleren", games: "Spellen",
        createGame: "Spel maken", gameName: "Spelnaam", noGamesYet: "Nog geen spellen.",
        saved: "Opgeslagen.", loading: "Laden…", editor: "Editor", close: "Sluiten",
        color: "Kleur", world: "Wereld",
      },
      zh: {
        backToAdmin: "返回管理器", admin: "管理", play: "游玩", save: "保存",
        start: "开始", create: "创建", name: "名称", cancel: "取消", games: "游戏",
        createGame: "创建游戏", gameName: "游戏名称", noGamesYet: "还没有游戏。",
        saved: "已保存。", loading: "加载中…", editor: "编辑器", close: "关闭",
        color: "颜色", world: "世界",
      },
      ja: {
        backToAdmin: "管理者に戻る", admin: "管理", play: "プレイ", save: "保存",
        start: "スタート", create: "作成", name: "名前", cancel: "キャンセル", games: "ゲーム",
        createGame: "ゲーム作成", gameName: "ゲーム名", noGamesYet: "ゲームがありません。",
        saved: "保存しました。", loading: "読み込み中…", editor: "エディター", close: "閉じる",
        color: "色", world: "世界",
      },
      ko: {
        backToAdmin: "관리자로 돌아가기", admin: "관리", play: "플레이", save: "저장",
        start: "시작", create: "만들기", name: "이름", cancel: "취소", games: "게임",
        createGame: "게임 만들기", gameName: "게임 이름", noGamesYet: "게임이 없습니다.",
        saved: "저장됨.", loading: "로딩 중…", editor: "에디터", close: "닫기",
        color: "색상", world: "세계",
      },
    },
    games: {
      "bloc-de-notas": {
        ru: { title: "Блокнот", subtitle: "Пишите что угодно. Просто и быстро.", placeholder: "Запишите заметки здесь…" },
        pl: { title: "Notatnik", subtitle: "Pisz co chcesz. Prosto i szybko.", placeholder: "Zapisz notatki tutaj…" },
        nl: { title: "Notitieblok", subtitle: "Schrijf wat je wilt. Simpel en snel.", placeholder: "Schrijf je notities hier…" },
        zh: { title: "记事本", subtitle: "写你想写的。简单快速。", placeholder: "在这里写笔记…" },
        ja: { title: "メモ帳", subtitle: "好きなことを書いて。シンプルで速い。", placeholder: "ここにメモを書く…" },
        ko: { title: "메모장", subtitle: "원하는 대로 적으세요. 간단하고 빠릅니다.", placeholder: "여기에 메모를 작성하세요…" },
      },
      "decimal-explorer": {
        ru: { title: "Десятичный исследователь", subtitle: "Узнайте, какие числа начинаются одинаково.", play: "Играть", explore: "Исследовать", noResults: "Нет чисел с таким префиксом." },
        pl: { title: "Eksplorator dziesiętny", subtitle: "Odkryj, które liczby mają te same cyfry.", play: "Graj", explore: "Eksploruj", noResults: "Brak liczb z tym prefiksem." },
        nl: { title: "Decimale verkenner", subtitle: "Ontdek welke getallen hetzelfde begin hebben.", play: "Spelen", explore: "Verkennen", noResults: "Geen getallen met dat prefix." },
        zh: { title: "小数探索器", subtitle: "发现哪些著名数字以相同数字开头。", play: "游玩", explore: "探索", noResults: "没有以此开头的数字。" },
        ja: { title: "小数エクスプローラー", subtitle: "同じ桁で始まる有名な数を見つけよう。", play: "プレイ", explore: "探索", noResults: "その前缀の数字はありません。" },
        ko: { title: "소수 탐험가", subtitle: "같은 숫자로 시작하는 유명한 수를 찾아보세요.", play: "플레이", explore: "탐색", noResults: "해당 접두사의 숫자가 없습니다." },
      },
      bruchimichis: {
        ru: { subtitle: "Создавайте котят, двигайте и устраивайте гонки.", createCat: "Создать кота", race: "Гонка", play: "Играть" },
        pl: { subtitle: "Twórz kociaki, przesuwaj i ścigaj.", createCat: "Stwórz kota", race: "Wyścig", play: "Graj" },
        nl: { subtitle: "Maak kittens, verplaats en laat ze racen.", createCat: "Kat maken", race: "Race", play: "Spelen" },
        zh: { subtitle: "创建小猫，移动它们并比赛。", createCat: "创建猫", race: "比赛", play: "游玩" },
        ja: { subtitle: "子猫を作って動かし、レースさせよう。", createCat: "猫を作る", race: "レース", play: "プレイ" },
        ko: { subtitle: "고양이를 만들고 움직이고 경주하세요.", createCat: "고양이 만들기", race: "경주", play: "플레이" },
      },
      "country-notes": {
        ru: { subtitle: "Создавайте страны на карте 128×128.", createCountry: "Создать страну", world: "Мир", saveCountry: "Сохранить страну" },
        pl: { subtitle: "Twórz kraje na mapie 128×128.", createCountry: "Utwórz kraj", world: "Świat", saveCountry: "Zapisz kraj" },
        nl: { subtitle: "Maak landen op een 128×128 kaart.", createCountry: "Land maken", world: "Wereld", saveCountry: "Land opslaan" },
        zh: { subtitle: "创建国家，在地图上显示为128×128方块。", createCountry: "创建国家", world: "世界", saveCountry: "保存国家" },
        ja: { subtitle: "国を作り、128×128の地図に表示。", createCountry: "国を作成", world: "世界", saveCountry: "国を保存" },
        ko: { subtitle: "국가를 만들어 128×128 지도에 표시하세요.", createCountry: "국가 만들기", world: "세계", saveCountry: "국가 저장" },
      },
      "creador-2d": {
        ru: { title: "2D Создатель", subtitle: "Создайте свой 2D мир с редактором блоков.", play: "Играть", editor: "Редактор", createBlock: "Создать блок" },
        pl: { title: "Kreator 2D", subtitle: "Stwórz swój świat 2D z edytorem bloków.", play: "Graj", editor: "Edytor", createBlock: "Utwórz blok" },
        nl: { title: "2D Maker", subtitle: "Maak je eigen 2D-wereld met een blokeditor.", play: "Spelen", editor: "Editor", createBlock: "Blok maken" },
        zh: { title: "2D 创造者", subtitle: "用方块编辑器创建你的2D世界。", play: "游玩", editor: "编辑器", createBlock: "创建方块" },
        ja: { title: "2Dクリエイター", subtitle: "ブロックエディターで2D世界を作ろう。", play: "プレイ", editor: "エディター", createBlock: "ブロック作成" },
        ko: { title: "2D 크리에이터", subtitle: "블록 에디터로 2D 세계를 만드세요.", play: "플레이", editor: "에디터", createBlock: "블록 만들기" },
      },
      "object-battle": {
        ru: { subtitle: "Создавайте объекты с лицами и переключайтесь клавишей Z.", createObject: "Создать объект", start: "Начать", games: "Игры" },
        pl: { subtitle: "Twórz obiekty z twarzami i przełączaj klawiszem Z.", createObject: "Utwórz obiekt", start: "Start", games: "Gry" },
        nl: { subtitle: "Maak objecten met gezichten en wissel met Z.", createObject: "Object maken", start: "Start", games: "Spellen" },
        zh: { subtitle: "创建有脸的对象，用Z切换。", createObject: "创建对象", start: "开始", games: "游戏" },
        ja: { subtitle: "顔付きオブジェクトを作り、Zで切り替え。", createObject: "オブジェクト作成", start: "スタート", games: "ゲーム" },
        ko: { subtitle: "얼굴이 있는 객체를 만들고 Z로 전환하세요.", createObject: "객체 만들기", start: "시작", games: "게임" },
      },
      "algicosathlon-maker-english": {
        ru: { title: "Algicosathlon Maker", subtitle: "Создавайте игры, шары и соревнуйтесь.", start: "Начать", saveBalls: "Сохранить шары", createBall: "Создать шар", wins: "Победы", dragBalls: "Перетаскивайте шары.", createBallBtn: "+ Создать шар", winStorage: "Победы", unnamed: "Без имени" },
        pl: { title: "Algicosathlon Maker", subtitle: "Twórz gry, piłki i rywalizuj.", start: "Start", saveBalls: "Zapisz piłki", createBall: "Utwórz piłkę", wins: "Zwycięstwa", dragBalls: "Przeciągaj piłki.", createBallBtn: "+ Utwórz piłkę", winStorage: "Zwycięstwa", unnamed: "Bez nazwy" },
        nl: { title: "Algicosathlon Maker", subtitle: "Maak spellen, ballen en strijd mee.", start: "Start", saveBalls: "Ballen opslaan", createBall: "Bal maken", wins: "Overwinningen", dragBalls: "Sleep de ballen.", createBallBtn: "+ Bal maken", winStorage: "Overwinningen", unnamed: "Naamloos" },
        zh: { title: "Algicosathlon Maker", subtitle: "创建游戏、设计球并竞技。", start: "开始", saveBalls: "保存球", createBall: "创建球", wins: "胜利", dragBalls: "拖放球。", createBallBtn: "+ 创建球", winStorage: "胜利", unnamed: "未命名" },
        ja: { title: "Algicosathlon Maker", subtitle: "ゲームとボールを作り、競おう。", start: "スタート", saveBalls: "ボール保存", createBall: "ボール作成", wins: "勝利", dragBalls: "ボールをドラッグ。", createBallBtn: "+ ボール作成", winStorage: "勝利", unnamed: "無名" },
        ko: { title: "Algicosathlon Maker", subtitle: "게임과 공을 만들고 경쟁하세요.", start: "시작", saveBalls: "공 저장", createBall: "공 만들기", wins: "승리", dragBalls: "공을 드래그하세요.", createBallBtn: "+ 공 만들기", winStorage: "승리", unnamed: "이름 없음" },
      },
      "shape-bowl-race": {
        ru: { subtitle: "Создавайте шары и гоняйте их в миске.", earnings: "Доходы", jump: "Прыжок", turn: "Поворот", createBall: "Создать шар", createBallBtn: "+ Создать шар", bowlRace: "Bowl Race" },
        pl: { subtitle: "Twórz piłki i ścigaj je w misce.", earnings: "Zyski", jump: "Skok", turn: "Obrót", createBall: "Utwórz piłkę", createBallBtn: "+ Utwórz piłkę", bowlRace: "Bowl Race" },
        nl: { subtitle: "Maak ballen en race in de kom.", earnings: "Winst", jump: "Sprong", turn: "Draai", createBall: "Bal maken", createBallBtn: "+ Bal maken", bowlRace: "Bowl Race" },
        zh: { subtitle: "设计球并在碗中比赛。", earnings: "收益", jump: "跳跃", turn: "旋转", createBall: "创建球", createBallBtn: "+ 创建球", bowlRace: "Bowl Race" },
        ja: { subtitle: "ボールを作りボウルでレース。", earnings: "収益", jump: "ジャンプ", turn: "回転", createBall: "ボール作成", createBallBtn: "+ ボール作成", bowlRace: "Bowl Race" },
        ko: { subtitle: "공을 만들고 그릇에서 경주하세요.", earnings: "수익", jump: "점프", turn: "회전", createBall: "공 만들기", createBallBtn: "+ 공 만들기", bowlRace: "Bowl Race" },
      },
    },
  };

  function patchLocales() {
    ["ru", "pl", "nl", "zh", "ja", "ko"].forEach((lang) => {
      Object.entries(LOCALE_PATCH.common[lang] || {}).forEach(([key, value]) => {
        if (COMMON[key]) COMMON[key][lang] = value;
      });
      Object.entries(LOCALE_PATCH.games).forEach(([gameId, langs]) => {
        Object.entries(langs[lang] || {}).forEach(([key, value]) => {
          if (GAMES[gameId]?.[key]) GAMES[gameId][key][lang] = value;
        });
      });
    });
  }
  patchLocales();

  function getLang() {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    return SUPPORTED_LANGS.includes(saved) ? saved : "es";
  }

  function pick(entry, lang) {
    if (!entry) return null;
    if (typeof entry === "string") return entry;
    if (entry[lang]) return entry[lang];
    for (const fb of FALLBACK_CHAIN) {
      if (entry[fb]) return entry[fb];
    }
    return entry.en || entry.es || null;
  }

  function format(str, vars) {
    if (!vars || str == null) return str;
    return String(str).replace(/\{(\w+)\}/g, (_, k) => (vars[k] != null ? vars[k] : `{${k}}`));
  }

  function t(key, vars) {
    const lang = getLang();
    const gamePack = currentGameId ? GAMES[currentGameId] : null;
    const value = pick(gamePack?.[key], lang) || pick(COMMON[key], lang);
    if (value == null) return key;
    return format(value, vars);
  }

  function applyDom(root) {
    const scope = root || document;
    scope.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const lang = getLang();
      const gamePack = currentGameId ? GAMES[currentGameId] : null;
      const value = pick(gamePack?.[key], lang) || pick(COMMON[key], lang);
      // Si falta la traducción, NO pisar el texto del HTML (evita mostrar "title"/"subtitle").
      if (value != null) el.textContent = value;
    });
    scope.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      const lang = getLang();
      const gamePack = currentGameId ? GAMES[currentGameId] : null;
      const value = pick(gamePack?.[key], lang) || pick(COMMON[key], lang);
      if (value != null) el.placeholder = value;
    });
    scope.querySelectorAll("[data-i18n-title]").forEach((el) => {
      const key = el.getAttribute("data-i18n-title");
      const lang = getLang();
      const gamePack = currentGameId ? GAMES[currentGameId] : null;
      const value = pick(gamePack?.[key], lang) || pick(COMMON[key], lang);
      if (value != null) el.title = value;
    });
    scope.querySelectorAll("[data-i18n-html]").forEach((el) => {
      const key = el.getAttribute("data-i18n-html");
      const lang = getLang();
      const gamePack = currentGameId ? GAMES[currentGameId] : null;
      const value = pick(gamePack?.[key], lang) || pick(COMMON[key], lang);
      if (value != null) el.innerHTML = value;
    });
    if (scope === document && currentGameId && GAMES[currentGameId]?.title) {
      document.title = t("title");
    }
    document.documentElement.lang = getLang();
  }

  function init(gameId) {
    currentGameId = gameId;
    if (!GAMES[gameId]) {
      console.warn("[GameI18n] No hay traducciones para:", gameId, "| juegos:", Object.keys(GAMES));
    }
    applyDom(document);
    return { t, getLang, applyDom, refresh: () => applyDom(document) };
  }

  function onChange(fn) {
    changeListeners.push(fn);
  }

  window.addEventListener("storage", (event) => {
    if (event.key !== LANG_STORAGE_KEY) return;
    applyDom(document);
    changeListeners.forEach((fn) => fn(getLang()));
  });

  global.GameI18n = { init, t, getLang, applyDom, onChange, LANG_STORAGE_KEY };
})(window);
