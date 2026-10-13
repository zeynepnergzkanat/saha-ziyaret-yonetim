# Saha Ziyaret Yönetim Sistemi

Çiftçi kayıtlarını ve saha ziyaretlerini yöneten tam yığın (full-stack) bir uygulama.

- **Backend:** .NET 8 Web API, Entity Framework Core, SQL Server, FluentValidation, Swagger, JWT
- **Frontend:** Next.js (App Router), React, TypeScript, Redux Toolkit, Tailwind CSS, Axios
- **Testler:** xUnit (backend), Vitest + React Testing Library (frontend)

## Gereksinimler

- .NET 8 SDK
- Node.js (geliştirme v24 ile yapıldı) ve npm
- SQL Server (LocalDB, Express ya da tam sürüm)

## Kurulum ve çalıştırma

### 1. Backend

1. `FarmManagement.Api/appsettings.json` dosyasındaki bağlantı dizesinde `Server=` değerini kendi SQL Server adresinizle değiştirin (örneğin `localhost` ya da `.\SQLEXPRESS`):

```
   "DefaultConnection": "Server=SUNUCU_ADINIZ;Database=FarmManagementDb;Trusted_Connection=True;TrustServerCertificate=True;"
```

2. Geliştirme sertifikasına güvenin (bir kere):

```
   dotnet dev-certs https --trust
```

3. API'yi `https` profiliyle başlatın (solution klasöründe):

```
   dotnet run --project FarmManagement.Api --launch-profile https
```

Uygulama açılırken (gerçek bir SQL Server'a bağlıysa) **migration'lar otomatik uygulanır** ve örnek veriler (seed) eklenir. Ayrıca komut çalıştırmanız gerekmez. Migration dosyaları `FarmManagement.Api/Migrations` klasöründedir.

API adresi: `https://localhost:7105` — Swagger: `https://localhost:7105/swagger`

### 2. Frontend

```
cd farm-management-web
copy .env.example .env.local
npm install
npm run dev
```

(macOS/Linux'ta `copy` yerine `cp` kullanın.) Uygulama `http://localhost:3000` adresinde açılır. API adresi `.env.local` içindeki `NEXT_PUBLIC_API_URL` değerinden okunur. API, CORS ayarı nedeniyle yalnızca `http://localhost:3000` adresinden gelen isteklere izin verir.

### 3. Giriş bilgileri (örnek veri)

| Kullanıcı adı | Şifre |
|---|---|
| `demo` | `Demo1234!` |

Örnek veriler 12 çiftçi ve 7 ziyaret içerir (ziyaret tarihleri bugüne göre hesaplanır). Token süresi 120 dakikadır. Süresi dolunca uygulama oturumu temizleyip giriş sayfasına yönlendirir.

### Swagger'da yetkilendirme

`POST /api/auth/login` ile token alın. **Authorize** butonuna `Bearer ` yazıp (sonunda boşluk) token'ı yapıştırın. Token'ı tırnak işaretleri olmadan girin.

## Testler

```
dotnet test                              # backend (solution klasöründe)
cd farm-management-web && npm test       # frontend
```

- Backend: 12 test (10 unit, 2 integration): controller iş kuralları, sayfalama ve arama, validator'lar, API integration testleri. Testler bellek içi veritabanı kullanır, SQL Server gerekmez.
- Frontend: 11 test: form validasyonları, hata mesajları, etiketler.

## API özeti

| Yöntem | Adres | Açıklama | Yetki |
|---|---|---|---|
| POST | `/api/auth/register`, `/api/auth/login` | Kayıt ve giriş | Açık |
| GET | `/api/farmers` | Liste (`page`, `pageSize`, `search`) | Açık |
| GET | `/api/farmers/{id}` | Detay | Açık |
| POST, PUT, DELETE | `/api/farmers`, `/api/farmers/{id}` | Ekle, güncelle, sil | Token gerekli |
| GET | `/api/farm-visits` | Liste (`page`, `pageSize`, `status`, `farmerId`, `startDate`, `endDate`) | Açık |
| GET | `/api/farm-visits/{id}` | Detay | Açık |
| POST, PUT, DELETE | `/api/farm-visits`, `/api/farm-visits/{id}` | Ekle, güncelle, sil | Token gerekli |
| GET | `/api/dashboard/summary` | Özet sayılar ve önümüzdeki 7 gün | Açık |

## İş kuralları

- Kimlik numarası 11 haneli rakam olmalı ve benzersiz olmalı (tekrarında 409).
- Telefon numarası `05XXXXXXXXX` biçiminde olmalı.
- Bağlı ziyaret kaydı bulunan çiftçi silinemez.
- Geçmiş bir tarih için `Planned` durumunda ziyaret oluşturulamaz (ekleme ve güncelleme).
- `Completed` durumundaki ziyaretin notu boş bırakılamaz.
- Sonraki ziyaret tarihi, ziyaret tarihinden önce olamaz.
- `Completed` durumundaki ziyaret tekrar `Planned` durumuna alınamaz (mevcut kayıt veritabanından kontrol edilir).
- Aynı çiftçi için aynı gün ve aynı türde ikinci ziyaret oluşturulamaz (ekleme ve güncelleme).

Kurallar backend'de uygulanır, frontend formları aynı kuralları kullanıcıya erken gösterir.

## Mimari notlar

- Backend: Controller → DbContext yapısı; istekler DTO'larla alınıp döndürülür, doğrulama FluentValidation sınıflarında yapılır. Yalnızca gelen veriye bakan kurallar validator'da, veritabanına bakmayı gerektirenler controller'dadır.
- Frontend: Redux Toolkit ile durum yönetimi (`auth`, `dashboard`, `farmers`, `visits`), Axios istemcisi token'ı otomatik ekler ve 401 cevabında oturumu temizler.
- Ortak arayüz bileşenleri: `Button`, `Input`, `FormField`, `Modal`, `DataTable`, `Pagination` (`farm-management-web/src/components/ui`).
- Korumalı sayfalar `AuthGuard` bileşeniyle sarılır.

## Bilinen eksikler ve geliştirme önerileri

- **MediatR/CQRS kullanılmadı.** Zaman kısıtı nedeniyle controller'lar doğrudan `DbContext` kullanıyor. Proje büyürse komut/sorgu ayrımı ve servis katmanı eklenebilir.
- **Bonus özelliklerden yalnızca JWT kimlik doğrulaması yapıldı, rol kontrolü yok.** Kullanıcıda `Admin` rolü tutuluyor ama hiçbir endpoint rolü kontrol etmiyor. Docker, CI/CD ve çoklu dil desteği eklenmedi.
- **Gizli bilgiler:** JWT anahtarı `appsettings.json` içinde ve örnek kullanıcı şifresi kodda duruyor. Gerçek bir ortamda bunlar ortam değişkenlerinden ya da gizli anahtar deposundan okunmalı.
- **Otomatik migration ve seed her ortamda çalışıyor.** Örnek `demo` kullanıcısı da bu yüzden her ortamda oluşur. Gerçek bir ortamda bu işlem yalnızca geliştirme ortamında çalışmalı.
- **`/api/auth/register` herkese açık** ve her kullanıcıyı `Admin` rolüyle oluşturuyor.
- **GET endpoint'leri korumasız.** Yalnızca ekleme, güncelleme ve silme token gerektiriyor.
- **Token tarayıcıda `localStorage`'da** saklanıyor. Daha güvenli bir yöntem için `HttpOnly` çerez ve yenileme (refresh) token'ı kullanılabilir.
- **Geçmiş tarihli planlı ziyaret kuralı iki yerde kontrol ediliyor:** eklemede validator'da, güncellemede controller'da. Tek yerde toplanabilir.
- **Ziyaret formundaki çiftçi listesi** tek istekte en fazla 1000 kayıt çekiyor. Çok sayıda çiftçi için arama destekli seçim kutusu gerekir.
- **Kimlik numarası** için yalnızca 11 haneli rakam kontrolü var, gerçek TC kimlik algoritması doğrulanmıyor.
- **Frontend testleri** form doğrulamasını ve yardımcı fonksiyonları kapsıyor. Ağ çağrılarını ve uçtan uca (E2E) akışları test eden testler yok.
- **Responsive tasarım** Tailwind'in duyarlı sınıflarıyla yapıldı ama küçük ekranlarda ayrıca test edilmedi.
- **Tarihler** UTC gün olarak ele alınıyor. Farklı saat dilimlerindeki kullanıcılar için ayrıca düşünülmeli.

