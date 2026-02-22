# n'Bazaar360 Frontend

Frontend React për platformën dixhitale kulturore të Pazarit të Ri, Tiranë.

## Instalimi

1. Hapni Command Prompt/PowerShell në dosjen e projektit
2. Instaloni varësitë:
```bash
npm install
```

3. Sigurohuni që backend-i është duke u ekzekutuar në `http://localhost:5000`

4. Startoni serverin e zhvillimit:
```bash
npm run dev
```

5. Hapni browserin në `http://localhost:3000`

## Struktura e Projektit

```
src/
├── components/       # Komponentët e përbashkëta
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   ├── Layout.jsx
│   ├── AdminLayout.jsx
│   ├── VendorLayout.jsx
│   └── ProtectedRoute.jsx
├── context/          # React Context
│   └── AuthContext.jsx
├── pages/            # Faqet e aplikacionit
│   ├── Home.jsx
│   ├── About.jsx
│   ├── Exploration.jsx
│   ├── LocationView.jsx
│   ├── Stories.jsx
│   ├── StoryDetail.jsx
│   ├── Events.jsx
│   ├── EventDetail.jsx
│   ├── Vendors.jsx
│   ├── VendorProfile.jsx
│   ├── Login.jsx
│   ├── vendor/       # Paneli i tregtarit
│   └── admin/        # Paneli i administratorit
├── services/         # Shërbimet API
│   └── api.js
└── assets/          # Imazhe dhe burime
```

## Faqet

### Faqe Publike
- **/** - Kryefaqja
- **/rreth-nesh** - Rreth Nesh
- **/eksplorimi-360** - Eksplorimi Virtual 360°
- **/eksplorimi-360/:id** - Pamje e Vendndodhjes
- **/histori-ar** - Histori AR
- **/histori-ar/:id** - Detaje Historie
- **/ngjarje** - Ngjarje
- **/ngjarje/:id** - Detaje Ngjarje
- **/tregtaret** - Tregtarët
- **/tregtaret/:id** - Profili i Tregtarit
- **/hyrje** - Hyrje
- **/regjistrim** - Regjistrim Tregtari

### Paneli i Tregtarit (/tregtar)
- **/** - Dashboard
- **/profili** - Ndrysho Profilin
- **/historite** - Historitë e Mia
- **/historite/e-re** - Krijo Histori
- **/historite/:id/ndrysho** - Ndrysho Histori

### Paneli i Administratorit (/admin)
- **/** - Dashboard
- **/miratime** - Miratime Tregtarësh
- **/tregtaret** - Menaxho Tregtarët
- **/permbajtja** - Menaxho Përmbajtjen
- **/analitika** - Analitika

## Kredencialet Demo

- **Admin:** admin@nbazaar360.al / Admin123!

## Teknologjitë

- React 18
- Vite
- React Router DOM
- Tailwind CSS
- Axios
- Lucide React (ikona)

## Komandat

```bash
# Zhvillim
npm run dev

# Ndërtim për prodhim
npm run build

# Preview i ndërtimit
npm run preview
```
