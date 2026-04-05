
# WatchVault 🔒

> Tu gestor personal de videos de YouTube. Organizá, rastreá y conquistá tu cola de videos.

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![License](https://img.shields.io/badge/License-GPL--3.0-blue?style=for-the-badge)

## ¿Qué es WatchVault?

WatchVault es una aplicación web personal que se conecta a tu cuenta de YouTube y te da control real sobre tu lista de videos — algo que YouTube por defecto no te ofrece.

- 📋 Importa tus playlists de YouTube
- 🗂️ Organiza videos por categoría, canal y duración
- ✅ Marca videos como vistos manualmente
- 🔍 Busca y filtra tu cola rápidamente
- 📊 Estadísticas de horas acumuladas, categorías y progreso

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React + Vite |
| Backend | Cloud Functions (Node.js) |
| Base de datos | Firestore |
| Auth | Firebase Auth + Google OAuth |
| Hosting | Firebase Hosting |
| API externa | YouTube Data API v3 |

Todo dentro del plan gratuito de Firebase.

## Requisitos previos

- Node.js 18+
- Firebase CLI (`npm install -g firebase-tools`)
- Cuenta de Google con acceso a Firebase Console
- API Key de YouTube Data API v3 habilitada en Google Cloud Console

## Instalación

```bash
git clone https://github.com/tu-usuario/watchvault.git
cd watchvault
npm install
cd functions
npm install
cd ..
```

## Configuración

### 1. Firebase

Creá un proyecto en Firebase Console y habilitá:
- Authentication (proveedor Google)
- Firestore Database
- Hosting
- Cloud Functions

### 2. Variables de entorno

Creá un archivo `.env` en la raíz del proyecto:

```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
```

### 3. YouTube Data API

En Google Cloud Console:
1. Habilitá la YouTube Data API v3
2. Configurá las credenciales OAuth 2.0
3. Agregá el scope `https://www.googleapis.com/auth/youtube.readonly`

## Uso en desarrollo

```bash
npm run dev
```

## Deploy

```bash
npm run build
firebase deploy
```

## Licencia

Este proyecto está bajo la [GNU General Public License v3.0](./LICENSE).

Eso significa que podés usar, estudiar, modificar y distribuir el código libremente, siempre que cualquier trabajo derivado también se distribuya bajo la misma licencia GPL-3.0.

