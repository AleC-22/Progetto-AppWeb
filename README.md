# 🎬 Movie Matcher

Applicazione web per **scegliere il film giusto insieme ai tuoi amici**. Crea una lobby, scegli genere e anno, vota i film con 👍/👎 e lascia che il match decida per voi.

Interfaccia bilingue **Italiano / English**, installabile come PWA.

## Funzionalità

- Registrazione e login con email/password o Google (Firebase Auth)
- Creazione di una Watch Party con nome, genere e anno di uscita
- Filtro lingua alla creazione: edizione italiana, solo film italiani o tutte le lingue
- Fino a 4 membri per party, con controllo della capienza lato server
- Voto dei film con like/dislike e barra di avanzamento condivisa
- Aggiornamenti in tempo reale tramite Firestore (`onSnapshot`)
- Calcolo del film più votato, gestione dei pareggi e salvataggio del risultato
- Sezione "Prossime uscite" con paginazione (TMDb)
- Profilo con genere preferito, lingua ed eliminazione account
- PWA con icone, manifest e cache offline
- UI responsive per desktop e mobile

## Stack

- **React 19** + **Vite 6**
- **Firebase 11**: Authentication + Cloud Firestore
- **TMDb API** per film e prossime uscite, tramite proxy server-side
- **Bootstrap 5** + CSS personalizzato
- **Vitest** per i test di matching e proxy
- **vite-plugin-pwa** per la PWA
- **Vercel Functions** (opzionale) per il proxy TMDb in produzione

## Avvio rapido

Requisiti: **Node.js 20+** e un progetto Firebase (gratuito).

```bash
git clone https://github.com/AleC-22/Progetto-AppWeb.git
cd Progetto-AppWeb
npm install
```

Copia il template e compila le variabili:

```bash
cp .env.example .env
```

```env
VITE_Firebase_apiKey=...
VITE_Firebase_authDomain=...
VITE_Firebase_projectId=...
VITE_Firebase_storageBucket=...
VITE_Firebase_messagingSenderId=...
VITE_Firebase_appId=...
VITE_Firebase_measurementId=...
TMDB_API_KEY=...
```

`TMDB_API_KEY` non ha il prefisso `VITE_`: resta disponibile solo al server (proxy di sviluppo e funzione Vercel) e non finisce nel bundle del browser.

Poi avvia:

```bash
npm run dev
```

L'app sarà su `http://localhost:5173`.

> ⚠️ Il file `.env` è ignorato da Git. Non inserire mai chiavi reali in `.env.example` o in altri file tracciati.

## Configurazione Firebase

1. Crea un progetto su [console.firebase.google.com](https://console.firebase.google.com/).
2. Aggiungi una Web App e copia i valori di configurazione in `.env`.
3. In **Authentication → Sign-in method** abilita:
   - Email/Password
   - Google
4. Crea un database **Cloud Firestore**.
5. Pubblica le regole di sicurezza incluse nel repository:

```bash
npx --yes firebase-tools login
npx --yes firebase-tools use --add
npx --yes firebase-tools deploy --only firestore:rules
```

6. In **Authentication → Settings → Authorized domains** aggiungi il dominio da cui servi l'app (es. `localhost` è già presente; per il deploy aggiungi il dominio di produzione).

Le regole in [`firestore.rules`](./firestore.rules) consentono:
- a ogni utente di leggere/scrivere solo il proprio documento `users/{uid}`;
- ai membri autenticati di leggere i party;
- al creatore di creare/chiudere/eliminare il party;
- a ogni membro di scrivere solo le proprie preferenze;
- l'ingresso nel party solo incrementando il contatore e senza superare `maxMembers`.

## TMDb

La chiave si ottiene gratuitamente da [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api) e va inserita in `TMDB_API_KEY` dentro `.env`.

Il browser non chiama mai TMDb direttamente e non riceve mai la chiave:

```text
Browser → /api/tmdb/movie/upcoming?page=1&language=it-IT
              ↓
Proxy (Vite in locale, Vercel in produzione)
              ↓
TMDb API con TMDB_API_KEY
```

- In sviluppo il proxy è un middleware di Vite (`server/tmdbProxyPlugin.js`), quindi `npm run dev` funziona senza configurazioni extra.
- In produzione la stessa logica è esposta da `api/tmdb/[...path].js` come Vercel Function.
- Il proxy accetta solo gli endpoint usati dall'app (`discover/movie`, `movie/upcoming`) e filtra i parametri, così non diventa un proxy aperto.
- Le risposte vengono messe in cache per 5 minuti (`s-maxage=300`).

Senza chiave TMDb l'app resta avviabile, ma la creazione dei party e la sezione "Prossime uscite" mostrano un messaggio di configurazione mancante.

### Filtro lingua e sottotitoli

Alla creazione del party si può scegliere:

| Opzione | Comportamento |
| --- | --- |
| **Edizione italiana** (predefinita) | Richiede un'uscita italiana del film (`with_release_type`, `release_date`, `region=IT`) |
| **Solo film italiani** | Filtra per lingua originale italiana (`with_original_language=it`) |
| **Tutte le lingue** | Nessun filtro lingua |

TMDb **non espone le tracce audio o sottotitoli** disponibili per un film. Per questo “Edizione italiana” usa l'uscita italiana come indicazione: di solito implica doppiaggio o sottotitoli italiani, ma non è una garanzia. L'interfaccia lo specifica accanto al selettore.

La scelta viene ricordata nel browser tramite `localStorage` (`movie-matcher.language-filter`).

### Deploy su Vercel

1. Importa il repository su Vercel.
2. Framework preset: **Vite**; build command `npm run build`; output directory `dist`.
3. In **Settings → Environment Variables** aggiungi `TMDB_API_KEY` (senza prefisso `VITE_`).
4. Le variabili `VITE_Firebase_*` restano necessarie per il client e vanno aggiunte allo stesso modo.
5. Dopo il deploy aggiungi il dominio Vercel tra i domini autorizzati di Firebase Authentication.

Non serve un `vercel.json` finché l'app resta su una singola pagina senza routing client-side. Se in futuro aggiungi route come `/party/:id`, servirà un rewrite SPA verso `/index.html`.

> Il piano Vercel Hobby è destinato a progetti personali/non commerciali. Per un uso commerciale serve Vercel Pro, oltre all'accordo TMDb descritto sotto.

### Attribuzione e uso commerciale

L'app include nel footer e nella pagina Profilo il logo TMDb e la notice richiesta:

> This product uses the TMDB API but is not endorsed or certified by TMDB.

La chiave API gratuita di TMDb è pensata per **uso non commerciale**. Se in futuro vuoi monetizzare l'app (abbonamenti, pubblicità, vendita, servizi a pagamento), devi concordare una **licenza commerciale** con TMDb:

- Termini API: [themoviedb.org/documentation/api/terms-of-use](https://www.themoviedb.org/documentation/api/terms-of-use)
- FAQ ufficiale: [developer.themoviedb.org/docs/faq](https://developer.themoviedb.org/docs/faq)
- Contatto commerciale: [sales@themoviedb.org](mailto:sales@themoviedb.org?subject=Commercial%20API%20Use)

> ⚠️ Le variabili `VITE_*` vengono incluse nel bundle JavaScript e sono visibili nel browser. La chiave TMDb usa quindi `TMDB_API_KEY`, gestita dal proxy server-side: non reintrodurre `VITE_TMDb_Key`.

Questa sezione è informativa e non sostituisce una consulenza legale: prima di pubblicare un prodotto commerciale verifica i termini aggiornati e l'accordo con TMDb.

## Sviluppo locale senza chiavi (Firebase Emulator Suite)

Per lavorare completamente offline si possono usare gli emulatori Firebase e i film demo.

Requisiti: **Java 11+** (necessario per l'emulatore Firestore).

```bash
# Terminale 1
npm run emulators

# Terminale 2
npm run dev:emulators
```

- Auth emulator: `http://127.0.0.1:9099`
- Firestore emulator: `http://127.0.0.1:8080`
- Emulator UI: `http://127.0.0.1:4000`
- App: `http://localhost:5173`

Il profilo `.env.emulator` usa un progetto demo e `VITE_DEMO_MOVIES=true`, quindi non servono né Firebase né TMDb reali. Crea un account dalla schermata di registrazione: resterà solo nell'emulatore locale.

## Script

| Comando | Descrizione |
| --- | --- |
| `npm run dev` | Avvia Vite in sviluppo |
| `npm run build` | Build di produzione in `dist/` |
| `npm run preview` | Anteprima della build |
| `npm run lint` | ESLint |
| `npm test` | Test Vitest |
| `npm run test:watch` | Test in watch mode |
| `npm run emulators` | Avvia Auth + Firestore emulator |
| `npm run dev:emulators` | Avvia Vite con il profilo emulator |

## Struttura del progetto

```
api/
└── tmdb/[...path].js       # Vercel Function: proxy TMDb in produzione
server/
├── tmdbProxy.js            # Logica condivisa: whitelist, auth, cache
├── tmdbProxy.test.js       # Test del proxy
└── tmdbProxyPlugin.js      # Middleware proxy per Vite dev/preview
src/
├── App.jsx                 # Auth gate + login/registrazione
├── MenuHandler.jsx         # Navigazione Home / News / Profilo
├── WatchParty.jsx          # Lista party e flusso di creazione
├── PartyList.jsx           # Lista realtime + join/delete
├── Home.jsx / Year.jsx     # Scelta categoria e anno
├── ConfirmParty.jsx        # Creazione party su Firestore
├── Decider.jsx             # Voto film, progresso, risultato
├── Profile.jsx             # Impostazioni account
├── Credits.jsx             # Attribuzione TMDb
├── News.jsx                # Prossime uscite TMDb
├── Firebase.js             # Init Firebase + emulatori
├── partyHandler.js         # Transazioni e subscription Firestore
├── matching.js             # Algoritmo di matching (testato)
├── TMDb.js                 # Client del proxy TMDb + fallback demo
├── genres.js               # Generi condivisi
├── i18n/                   # Dizionari IT/EN e provider
└── index.css               # Tema e responsive
```

## Modello dati Firestore

```text
watchParty/{partyId}
  partyName, ownerId, ownerEmail, films
  maxMembers, memberCount, memberIds
  status: "open" | "closed"
  result: { winner, votes, tied, ... } | null
  createdAt, closedAt

watchParty/{partyId}/members/{uid}
  uid, email, displayName
  isFinished, preferredFilms
  joinedAt, finishedAt
```

Le operazioni critiche usano **transazioni**:
- ingresso nel party: controlla capienza e duplicati;
- invio preferenze: aggiorna solo il documento del membro;
- chiusura: verifica che tutti abbiano votato e salva il risultato.

## Test

```bash
npm test
```

I test coprono:
- vittoria con più voti;
- pareggio;
- nessun voto;
- film sconosciuti;
- duplicati dello stesso film;
- compatibilità con party creati prima dell'introduzione degli ID TMDb;
- URL delle locandine TMDb;
- costruzione dei filtri lingua e edizione italiana;
- whitelist, autenticazione e gestione errori del proxy TMDb.

## Roadmap

- [ ] Link/codice d'invito condivisibile
- [ ] Uscita volontaria da un party
- [ ] Storico dei party e statistiche personali
- [ ] Notifiche push per chiusura party
- [ ] Deploy automatico (Firebase Hosting / Vercel)
- [ ] Test end-to-end del flusso multiutente

## Sicurezza

- Non committare `.env`, service account o chiavi API.
- La chiave TMDb vive solo lato server (`TMDB_API_KEY`), mai nel bundle client.
- Le regole Firestore sono versionate in `firestore.rules`.
- L'account di test presente nelle vecchie versioni del README è stato rimosso: createne uno nuovo o eliminalo dalla console Firebase se non serve più.
