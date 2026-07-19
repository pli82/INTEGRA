# AEP SMAM Instruire

Platformă de instruire anti-mită pentru AEP: dashboard pentru angajat (`/dashboard`) și panou de administrare SMAM (`/admin`), construite cu Next.js (App Router), Tailwind CSS, Prisma și Postgres (Neon).

## Structură

- `app/dashboard` — pagina angajatului: progres general, cursurile mele, următoarea testare, activitate recentă.
- `app/admin` — panoul administrativ: statistici, filtre, tabel rezultate angajați, export, management conținut.
- `components/Sidebar.tsx` — navigare laterală, cu variantă `angajat` și `admin`.
- `components/ui.tsx` — componente reutilizabile (card statistică, bară de progres, badge status).
- `prisma/schema.prisma` — modelul de date (angajați, structuri, cursuri, lecții, înscrieri, teste, rezultate).
- `prisma/seed.ts` — date demonstrative, aliniate cu capturile de ecran (Andrei Popescu, Andrei Ionescu etc.).

Paginile citesc din baza de date prin Prisma; dacă baza de date nu este încă configurată sau este goală, se afișează automat datele demonstrative din capturi, ca aplicația să nu pice la prima rulare.

## 1. Baza de date — Neon

1. Creează cont pe [neon.tech](https://neon.tech) și un proiect nou (regiune apropiată, ex. `eu-central-1`).
2. Din **Dashboard > Connection Details**, copiază două conexiuni:
   - conexiunea **pooled** → `DATABASE_URL`
   - conexiunea **directă** (fără `-pooler`) → `DIRECT_URL`
3. Copiază `.env.example` în `.env` și completează cele două variabile.

## 2. Rulare locală

```bash
npm install
npx prisma migrate dev --name init   # creează tabelele în Neon
npm run db:seed                      # populează date demonstrative
npm run dev                          # http://localhost:3000
```

## 3. GitHub

```bash
git init
git add .
git commit -m "Initial commit: AEP SMAM Instruire"
git branch -M main
git remote add origin https://github.com/<user>/smam-instruire.git
git push -u origin main
```

## 4. Vercel

1. [vercel.com/new](https://vercel.com/new) → importă repo-ul din GitHub.
2. Framework Preset: **Next.js** (detectat automat).
3. Adaugă variabilele de mediu (**Settings > Environment Variables**):
   - `DATABASE_URL`
   - `DIRECT_URL`
4. Deploy. La fiecare build, `prisma generate` rulează automat (`postinstall` + `build` script).
5. După primul deploy, rulează migrațiile către baza de producție (o singură dată, local sau din Vercel CLI):
   ```bash
   npx prisma migrate deploy
   npm run db:seed
   ```

## 5. Publicare pe intranetul AEP (intranet.roaep.ro)

Aplicația rulează fizic pe un server din rețeaua internă AEP, fără expunere pe internetul public. Ai nevoie de:

- un server Linux în rețeaua internă (fizic sau VM), cu **Docker** și **Docker Compose** instalate;
- acces SSH la acel server;
- drepturi (sau pe cineva de la IT) pentru a adăuga o intrare în **DNS-ul intern**.

În arhivă găsești deja tot ce trebuie: `Dockerfile`, `docker-compose.yml`, `deploy/nginx.intranet.roaep.ro.conf`.

### 5.1 Baza de date

Pentru intranet, cel mai simplu e Postgres local (nu necesită acces la internet):
`docker-compose.yml` include deja un serviciu `db` cu Postgres. Doar schimbă parola din `POSTGRES_PASSWORD` și pune în `.env`:

```
DATABASE_URL="postgresql://smam:parola-ta@db:5432/smam_instruire"
DIRECT_URL="postgresql://smam:parola-ta@db:5432/smam_instruire"
```

(Dacă serverul are totuși acces de ieșire spre internet, poți folosi în continuare Neon, punând acolo conexiunile respective — funcționează la fel.)

### 5.2 Aduci proiectul pe server

Dacă serverul are acces la GitHub:
```bash
git clone https://github.com/<user>/smam-instruire.git
cd smam-instruire
```

Dacă serverul e complet izolat (fără acces la GitHub), copiază arhiva direct prin `scp`:
```bash
scp smam-instruire.zip utilizator@ip-server-intern:/home/utilizator/
ssh utilizator@ip-server-intern
unzip smam-instruire.zip && cd smam-instruire
```

### 5.3 Pornești aplicația

```bash
cp .env.example .env
nano .env          # completează DATABASE_URL / DIRECT_URL ca mai sus
docker compose up -d --build
docker compose exec app npx prisma migrate deploy
docker compose exec app npm run db:seed
```

Verifică rapid, direct pe server: `curl http://localhost:3000` ar trebui să răspundă cu HTML.

### 5.4 Configurezi DNS-ul intern

Cere administratorului rețelei să adauge o intrare în DNS-ul intern:
```
intranet.roaep.ro   A   <IP-ul serverului din rețeaua internă>
```
(sau, dacă acest server găzduiește deja alte servicii interne pe subdomenii, o intrare similară cu cele existente).

### 5.5 Nginx ca reverse proxy

```bash
sudo apt install nginx        # dacă nu e deja instalat
sudo cp deploy/nginx.intranet.roaep.ro.conf /etc/nginx/sites-available/intranet.roaep.ro
sudo ln -s /etc/nginx/sites-available/intranet.roaep.ro /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

Certificatul SSL pentru un domeniu intern **nu** se poate obține prin Let's Encrypt/certbot (acesta cere validare din internetul public). Fie ceri un certificat de la CA-ul intern AEP (dacă există), fie rulezi doar pe HTTP dacă politica de securitate internă o permite pentru servicii strict interne — detaliile sunt comentate direct în fișierul `deploy/nginx.intranet.roaep.ro.conf`.

### 5.6 Testezi

De pe orice calculator din rețeaua AEP: `http://intranet.roaep.ro` (sau `https://`, dacă ai activat certificatul).

### 5.7 Actualizări ulterioare

```bash
git pull                                   # sau re-copiezi arhiva actualizată
docker compose up -d --build
docker compose exec app npx prisma migrate deploy
```

## Următorii pași sugerați

- Autentificare reală (ex. NextAuth/Auth.js) pentru rolurile `ANGAJAT` / `ADMINISTRATOR`.
- Pagini pentru `/dashboard/cursuri`, `/dashboard/progres`, `/dashboard/testare` (deocamdată doar linkate din meniu).
- Generare PDF certificat la finalizarea unui curs.
- Export Excel real (ex. `exceljs`) pentru butoanele „Export Excel” / „Descarcă Excel”.
