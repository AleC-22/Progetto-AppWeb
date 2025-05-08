Movie Matcher

Applicazione creata con lo scopo di semplificare la scelta di film in gruppo.

Funzionalità principali:

- Creazione di una lobby condivisa
- Selezione della categoria del film
- Filtraggio per anno di uscita
- Processo decisionale semplificato e condiviso
- Possibilità di rimanere aggiornati sulle prossime uscite

Istruzioni per avviare il progetto localmente:

Avere "Node.js" installato

Clona il repository ed esegui il server di sviluppo:
```
git clone https://github.com/AleC-22/Progetto-AppWeb
cd Progetto-AppWeb
```

Crea un file ```.env``` contenente questi dati:
```
VITE_Firebase_apiKey = API_KEY
VITE_Firebase_authDomain = AUTH_DOMAIN
VITE_Firebase_projectId = PROJECT_ID
VITE_Firebase_storageBucket = STORAGE_BUCKET
VITE_Firebase_messagingSenderId = MESSAGING_SENDER_ID
VITE_Firebase_appId = APP_ID
VITE_Firebase_measurementId = MEASUREMENT_ID 
VITE_TMDb_Key= TMDB_API_KEY
```
Avviare un terminale nella cartella del progetto ed eseguire i seguenti comandi:
```
npm install
npm run dev
```
Per accedere all'app è possibile usare le seguenti credenziali di test:

-email: test@gmail.com

-password: alessio
