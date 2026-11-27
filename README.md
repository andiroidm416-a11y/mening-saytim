# 🛒 ZukkoMarket - Zamonaviy Mini Market & Sun'iy Intellekt Platformasi

O'ta professional darajada yaratilgan, to'liq funksional, xatosiz ishlaydigan va **Sun'iy Intellekt (AI)** integratsiyasiga ega bo'lgan zamonaviy mini market veb-platformasi.

---

## 🌟 Asosiy Xususiyatlar va Imkoniyatlar

### 1. 🤖 Sun'iy Intellekt (AI) Shopping Maslahatchisi
* **Retseptlar orqali savat yig'ish**: Foydalanuvchi xohlagan taomini (masalan: *"Kechki ovqatga lag'mon yoki palov pishirishga nima kerak?"*) yozishi bilan AI barcha kerakli sara masalliqlarni, pishirish retseptini, vaqtini va narxini ko'rsatadi.
* **1-Bosqichda Savatga Qo'shish**: AI tavsiya qilgan barcha ingredientlarni bitta tugma orqali birdaniga savatchaga joylash imkoniyati!
* **Aqlli Byudjet Yig'uvchi**: Foydalanuvchi kiritgan summa (masalan: *"100 000 so'm"* yoki *"50 000 so'mlik nonushta"*) bo'yicha tejamkor va sifatli mahsulotlar to'plamini tuzadi.
* **Fitnes & Parhez Maslahatchisi**: Sog'lom ovqatlanish, oqsilga boy va kam kaloriyali mahsulotlarni tavsiya qiladi.
* **Savatchani Tahlil Qilish**: Foydalanuvchi savatidagi mahsulotlarni tahlil qilib, unutilgan qo'shimchalarni (choy, shakar, non) eslatadi.

---

### 2. 🛍️ Boy Mahsulotlar Katalogi va Saralash
* **9 ta asosiy toifa**: Meva va sabzavotlar, Sut va tuxum, Go'sht va parranda, Non va qandolat, Baqqollik va donlar, Ichimliklar, Shirinliklar, Uy-ro'zg'or.
* **Tezkor qidiruv**: Nomi va teglari bo'yicha lahzada qidirish.
* **Filtrlash va saralash**: Narxi bo'yicha (arzon/qimmat), reyting, xaridorgirlik, chegirmalar va faqat omborda bor mahsulotlar.
* **Maxsus yorliqlar (Badges)**: Aksiya (-25%), Tabiiy (Organic), Top, Yangi.
* **Ozuqaviy qiymatlar (Nutrition facts)**: Kaloriya, oqsil, yog', uglevodlar hisobi.

---

### 3. 🛒 Qulay Savatcha (Cart Drawer)
* Bepul yetkazib berishgacha qolgan summani ko'rsatuvchi interaktiv progress bar.
* Mahsulot sonini `+` va `-` orqali to'g'ridan-to'g'ri o'zgartirish yoki o'chirish.
* **Promokod tizimi**: Masalan, `SUPER2026` (-15%), `YANGI10` (-10%), `ZUKKO20` (-20%).
* Real vaqt rejimida hisob-kitob (Oraliq summa, chegirma, yetkazish to'lovi, yakuniy summa).

---

### 4. 💳 To'liq Buyurtma Rasmiylashtirish (Checkout)
* Mijoz ismi, telefon raqami, manzili va yetkazish vaqti (Tezkor 30 daqiqa, Bugun kechqurun, Ertaga).
* O'zbekistonning eng ommabop to'lov tizimlari: **Click**, **Payme**, **Uzum Bank**, **Naqd pul**, **Bank kartasi**.
* Buyurtma berilganda bayramona **konfetti (confetti)** animatsiyasi.
* Buyurtma raqami va bosqichli holat kuzatuvchisi (Qabul qilindi -> Yig'ilmoqda -> Kuryerda).

---

### 5. 💎 Qo'shimcha Qulayliklar
* **LocalStorage xotira**: Sahifa yangilansa yoki brauzer yopilsa ham savat, sevimlilar, buyurtmalar tarixi va kiritilgan yangi mahsulotlar saqlanib qoladi.
* **Tungi va Kunduzgi rejim (Dark / Light mode)**: Ko'zga qulay zamonaviy dizayn.
* **Ko'p tilli interfeys**: O'zbekcha, Ruscha, Inglizcha (1 ta bosishda almashtirish).
* **Sevimlilar ro'yxati (Wishlist)**: Mahsulotlarni yurakcha orqali saqlash.
* **Do'kon Boshqaruv Paneli (Admin)**: Umumiy tushum, buyurtmalar soni statistikasi va yangi mahsulot qo'shish formasi.
* **Jonli bildirishnomalar (Toasts)**: Har bir amal uchun chiroyli xabarlar.

---

## 🚀 Ishga tushirish (Run Guide)

Loyihani kompyuteringizda ishga tushirish juda oddiy:

```bash
# 1. Bog'liqliklarni o'rnatish (agar o'rnatilmagan bo'lsa)
npm install

# 2. Dasturchi rejimida ishga tushirish (Development mode)
npm run dev
```

Brauzerda `http://localhost:5173` manzilini oching.

Tayyor build olish:
```bash
npm run build
```
Production uchun optimallashtirilgan fayllar `dist/` jildiga joylashadi.
