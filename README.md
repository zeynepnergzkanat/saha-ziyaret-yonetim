# Saha Ziyaret Yönetim Sistemi

Çiftçileri ve onlara yapılan saha ziyaretlerini takip etmeye yarayan bir web uygulaması. Çiftçi kayıtları tutulur, ziyaretler planlanır ve tamamlanır, ana sayfada özet bilgiler ve önümüzdeki 7 günün ziyaretleri görünür.

## Kullanılan teknolojiler

- Backend: .NET 8 Web API, Entity Framework Core, PostgreSQL, FluentValidation, Swagger, JWT
- Frontend: Next.js (App Router), React, TypeScript, Redux Toolkit, Tailwind CSS, Axios
- Testler: xUnit (backend), Vitest ve React Testing Library (frontend)
- Çalıştırma: Docker Compose

## Docker ile çalıştırma (en kolay yol)

Docker Desktop kurulu olmalı. Proje klasöründe şu komutu çalıştırın:

```
docker compose up --build
```

İlk seferde imajlar indirilip derlendiği için birkaç dakika sürer. Hazır olunca:

- Uygulama: http://localhost:3000
- API dokümantasyonu (Swagger): http://localhost:8080/swagger

Giriş için örnek kullanıcı: `demo`, şifre: `Demo1234!`

Durdurmak için terminalde `Ctrl+C`, ardından `docker compose down` komutunu çalıştırın. Veriler Docker'ın kendi biriminde saklanır.

Bilinmesi gerekenler:

- Uygulama ilk açılışta tabloları kendisi oluşturur (migration) ve örnek verileri ekler: 12 çiftçi ve 7 ziyaret. Ziyaret tarihleri bugüne göre hesaplanır.
- Veritabanı şifresi varsayılan olarak `postgres`tir ve yalnızca yerel deneme içindir. Değiştirmek için `POSTGRES_PASSWORD` ortam değişkenini tanımlayabilirsiniz.
- Frontend'in API adresi derleme sırasında imaja yazılır (`docker-compose.yml` içindeki `NEXT_PUBLIC_API_URL`). Değiştirirseniz `docker compose up --build` ile yeniden derleyin.
- Docker'daki API `Development` ortamında ve HTTP üzerinden çalışır. Swagger bu yüzden açıktır.

## Docker olmadan çalıştırma

Gerekenler: .NET 8 SDK, Node.js (geliştirme v24 ile yapıldı) ve PostgreSQL (geliştirmede 18 ile denendi).

### Backend

1. PostgreSQL'de boş bir veritabanı oluşturun. Örneğin: `createdb -U postgres FarmManagementDb`
2. `FarmManagement.Api/appsettings.json` içindeki bağlantı dizesini kendi bilgilerinize göre düzenleyin:

```
   "DefaultConnection": "Host=localhost;Port=5432;Database=FarmManagementDb;Username=postgres;Password=YOUR_PASSWORD"
```

3. Geliştirme sertifikasına bir kereliğine güvenin: `dotnet dev-certs https --trust`
4. API'yi başlatın (proje klasöründe):

```
   dotnet run --project FarmManagement.Api --launch-profile https
```

API açılırken migration'lar uygulanır ve örnek veriler eklenir. Migration dosyaları `FarmManagement.Api/Migrations` klasöründedir. API `https://localhost:7105` adresinde çalışır, Swagger `https://localhost:7105/swagger` adresindedir.

### Frontend

```
cd farm-management-web
copy .env.example .env.local
npm install
npm run dev
```

(macOS ve Linux'ta `copy` yerine `cp` kullanın.) Uygulama http://localhost:3000 adresinde açılır. API adresi `.env.local` içindeki `NEXT_PUBLIC_API_URL` değerinden okunur. API, yalnızca http://localhost:3000 adresinden gelen isteklere izin verecek şekilde ayarlıdır (CORS).

## Giriş ve yetkilendirme

Örnek kullanıcı `demo`, şifresi `Demo1234!`. Giriş yapınca bir JWT token verilir ve 120 dakika geçerlidir. Süresi dolunca uygulama oturumu kapatıp giriş sayfasına yönlendirir.

Çiftçi ve ziyaret ekleme, güncelleme ve silme işlemleri giriş gerektirir. Listeleme ve görüntüleme açıktır.

Swagger'da yetkilendirme için `POST /api/auth/login` ile token alın, **Authorize** butonuna `Bearer ` yazıp (sonunda bir boşluk) token'ı yapıştırın. Token'ı tırnak işaretleri olmadan girin.

## API

**Kimlik doğrulama**

- `POST /api/auth/login`: kullanıcı adı ve şifreyle giriş yapar, token döner.
- `POST /api/auth/register`: yeni kullanıcı oluşturur.

**Çiftçiler**

- `GET /api/farmers`: çiftçileri listeler. `page`, `pageSize` ve `search` parametrelerini alır. Arama; ad, bölge ve telefon alanlarında yapılır.
- `GET /api/farmers/{id}`: tek bir çiftçiyi getirir.
- `POST /api/farmers`: yeni çiftçi ekler (giriş gerekir).
- `PUT /api/farmers/{id}`: çiftçiyi günceller (giriş gerekir).
- `DELETE /api/farmers/{id}`: çiftçiyi siler (giriş gerekir).

**Saha ziyaretleri**

- `GET /api/farm-visits`: ziyaretleri listeler. `page`, `pageSize`, `status`, `farmerId`, `startDate` ve `endDate` ile filtrelenebilir.
- `GET /api/farm-visits/{id}`: tek bir ziyareti getirir.
- `POST /api/farm-visits`: yeni ziyaret ekler (giriş gerekir).
- `PUT /api/farm-visits/{id}`: ziyareti günceller (giriş gerekir).
- `DELETE /api/farm-visits/{id}`: ziyareti siler (giriş gerekir).

**Özet**

- `GET /api/dashboard/summary`: toplam çiftçi ve ziyaret sayısını, planlanan ve tamamlanan ziyaretleri ve önümüzdeki 7 gündeki ziyaretleri döner.


## İş kuralları

- Kimlik numarası 11 haneli rakamlardan oluşmalı ve benzersiz olmalı. Aynı numarayla ikinci kayıt 409 döner.
- Telefon numarası `05XXXXXXXXX` biçiminde olmalı.
- Ziyareti olan bir çiftçi silinemez.
- Geçmiş bir tarih için "Planlandı" durumunda ziyaret oluşturulamaz (ekleme ve güncelleme).
- "Tamamlandı" durumundaki ziyaretin notu boş bırakılamaz.
- Sonraki ziyaret tarihi, ziyaret tarihinden önce olamaz.
- "Tamamlandı" durumundaki ziyaret tekrar "Planlandı" durumuna alınamaz. Bu kontrol veritabanındaki mevcut kayıt üzerinden yapılır.
- Aynı çiftçi için aynı gün ve aynı türde ikinci ziyaret oluşturulamaz (ekleme ve güncelleme).

Kurallar backend'de uygulanır. Frontend formları aynı kuralları kullanıcıya erkenden gösterir.

## Testler

```
dotnet test                              # backend (proje klasöründe)
cd farm-management-web && npm test       # frontend
```

Backend'de 20 test var: controller iş kuralları, sayfalama ve arama, sayfalama parametresi doğrulaması, validator'lar ve iki API integration testi. Testler bellek içi veritabanı kullanır, PostgreSQL gerekmez.

Frontend'de 11 test var: form doğrulamaları, hata mesajları ve etiket yardımcıları.

## Proje yapısı

- `FarmManagement.Api`: backend. Controller'lar, modeller, DTO'lar, doğrulayıcılar, veritabanı bağlamı ve migration'lar burada.
- `FarmManagement.Tests`: backend testleri.
- `farm-management-web`: frontend. Sayfalar, bileşenler, Redux dosyaları ve frontend testleri burada.
- `docker-compose.yml`: veritabanı, API ve frontend'i birlikte çalıştırır.

## Tasarım kararları

- Backend tek projede, klasörlerle düzenlendi (Controllers, Models, DTOs, Validators, Data, Services). Controller'lar doğrudan `DbContext` kullanıyor.
- Yalnızca gelen veriye bakan kurallar validator'larda, veritabanına bakmayı gerektiren kurallar controller'larda uygulanıyor.
- Ziyaret tarihleri PostgreSQL'de `date` tipinde saklanır. Oluşturma ve güncelleme zamanları UTC'dir.
- Frontend'de durum yönetimi Redux Toolkit ile yapılıyor (giriş, özet, çiftçiler ve ziyaretler). Axios istemcisi token'ı isteklere otomatik ekler ve 401 cevabında oturumu temizler.
- Ortak arayüz bileşenleri (`Button`, `Input`, `FormField`, `Modal`, `DataTable`, `Pagination`) `farm-management-web/src/components/ui` klasöründedir.
- `docker-compose.yml` üç servis tanımlar: `db` (PostgreSQL 17), `api` (.NET 8) ve `web` (Next.js). API, veritabanı hazır olana kadar bekler.

## Bilinen eksikler ve geliştirme önerileri

- MediatR/CQRS kullanılmadı. Zaman kısıtı nedeniyle controller'lar doğrudan `DbContext` ile çalışıyor. Proje büyürse komut ve sorgu ayrımı ile bir servis katmanı eklenebilir.
- Bonus özelliklerden JWT kimlik doğrulaması ve Docker Compose yapıldı. Rol kontrolü yok: kullanıcıda `Admin` rolü tutuluyor ama hiçbir endpoint rolü kontrol etmiyor. CI/CD ve çoklu dil desteği eklenmedi.
- Gizli bilgiler: JWT anahtarı `appsettings.json` içinde, örnek kullanıcının şifresi kodda ve Docker'daki veritabanı şifresi varsayılan olarak `postgres`. Gerçek bir ortamda bunlar ortam değişkenlerinden ya da bir gizli anahtar deposundan okunmalı.
- Docker yapılandırması geliştirme amaçlıdır: API `Development` ortamında ve HTTP üzerinden çalışıyor.
- Migration ve örnek veri eklemesi her ortamda çalışıyor, `demo` kullanıcısı da bu yüzden her ortamda oluşuyor. Gerçek bir sistemde bu yalnızca geliştirme ortamında yapılmalı.
- `/api/auth/register` herkese açık ve her kullanıcıyı `Admin` rolüyle oluşturuyor.
- Listeleme endpoint'leri giriş istemiyor. Yalnızca ekleme, güncelleme ve silme token gerektiriyor.
- Token tarayıcıda `localStorage`'da saklanıyor. Daha güvenli bir yöntem için `HttpOnly` çerez ve yenileme token'ı kullanılabilir.
- "Geçmiş tarihli planlı ziyaret yok" kuralı iki yerde kontrol ediliyor: eklemede validator'da, güncellemede controller'da. Tek bir yerde toplanabilir.
- Ziyaret formundaki çiftçi listesi tek istekte en fazla 1000 kayıt çekiyor. Çok sayıda çiftçi olursa arama destekli bir seçim kutusu gerekir.
- Kimlik numarası için yalnızca 11 haneli rakam kontrolü var, gerçek TC kimlik algoritması doğrulanmıyor.
- Frontend testleri form doğrulamasını ve yardımcı fonksiyonları kapsıyor. Ağ çağrılarını ve uçtan uca (E2E) akışları test eden testler yok. Backend integration testleri bellek içi veritabanı kullanıyor, gerçek PostgreSQL'e karşı test yok.
- Arayüz Tailwind'in duyarlı sınıflarıyla yapıldı ama küçük ekranlarda ayrıca denenmedi.
- Tarihler UTC gün olarak ele alınıyor. Farklı saat dilimlerindeki kullanıcılar için ayrıca düşünülmeli.

