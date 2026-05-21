import { PrismaClient, Role, ProductStatus, CardRarity } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const locales = ["en", "vi", "ja"] as const;

async function main(): Promise<void> {
  await prisma.wishlist.deleteMany();
  await prisma.session.deleteMany();
  await prisma.productPokemon.deleteMany();
  await prisma.cardDetail.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productTranslation.deleteMany();
  await prisma.product.deleteMany();
  await prisma.categoryTranslation.deleteMany();
  await prisma.category.deleteMany();
  await prisma.cardSetTranslation.deleteMany();
  await prisma.cardSet.deleteMany();
  await prisma.pokemon.deleteMany();
  await prisma.bannerTranslation.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.newsTranslation.deleteMany();
  await prisma.news.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("admin123", 10);
  const userHash = await bcrypt.hash("user123", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@pokemart.local",
      name: "Admin",
      passwordHash,
      role: Role.ADMIN,
      locale: "en",
    },
  });

  const demoUser = await prisma.user.create({
    data: {
      email: "user@pokemart.local",
      name: "Ash Trainer",
      passwordHash: userHash,
      role: Role.USER,
      locale: "vi",
    },
  });

  const categories = [
    { slug: "booster-packs", names: { en: "Booster Packs", vi: "Gói mở rộng", ja: "ブースターパック" } },
    { slug: "battle-decks", names: { en: "Battle Decks", vi: "Bộ bài chiến đấu", ja: "バトルデッキ" } },
    { slug: "single-cards", names: { en: "Single Cards", vi: "Thẻ lẻ", ja: "シングルカード" } },
    { slug: "accessories", names: { en: "Accessories", vi: "Phụ kiện", ja: "アクセサリー" } },
    { slug: "collections", names: { en: "Collections", vi: "Bộ sưu tập", ja: "コレクション" } },
  ];

  const categoryRecords = [];
  for (let i = 0; i < categories.length; i++) {
    const c = categories[i];
    const cat = await prisma.category.create({
      data: {
        slug: c.slug,
        sortOrder: i,
        iconUrl: `https://placehold.co/64x64/3B4CCA/white/png?text=${encodeURIComponent(c.slug.slice(0, 2).toUpperCase())}`,
        translations: {
          create: locales.map((locale) => ({
            locale,
            name: c.names[locale],
          })),
        },
      },
    });
    categoryRecords.push(cat);
  }

  const sets = [
    { slug: "scarlet-violet-base", names: { en: "Scarlet & Violet", vi: "Đỏ Tía & Tím Than", ja: "スカーレット＆バイオレット" }, release: "2023-03-31" },
    { slug: "paldea-evolved", names: { en: "Paldea Evolved", vi: "Paldea Tiến Hóa", ja: "トリプレットビート" }, release: "2023-06-09" },
    { slug: "obsidian-flames", names: { en: "Obsidian Flames", vi: "Ngọn Lửa Hắc Diện", ja: "黒炎の支配者" }, release: "2023-08-11" },
    { slug: "paradox-rift", names: { en: "Paradox Rift", vi: "Vết Nứt Paradox", ja: "古代の咆哮 / 未来の一閃" }, release: "2023-11-03" },
    { slug: "temporal-forces", names: { en: "Temporal Forces", vi: "Lực Thời Gian", ja: "ワイルドフォース" }, release: "2024-03-22" },
  ];

  const setRecords = [];
  for (const s of sets) {
    const cs = await prisma.cardSet.create({
      data: {
        slug: s.slug,
        releaseDate: new Date(s.release),
        logoUrl: `https://placehold.co/120x48/FFCC00/1A1A2E/png?text=${encodeURIComponent(s.slug)}`,
        translations: {
          create: locales.map((locale) => ({
            locale,
            name: s.names[locale],
          })),
        },
      },
    });
    setRecords.push(cs);
  }

  const mons = [
    { slug: "pikachu", dexNo: 25, names: { en: "Pikachu", vi: "Pikachu", ja: "ピカチュウ" } },
    { slug: "charizard", dexNo: 6, names: { en: "Charizard", vi: "Charizard", ja: "リザードン" } },
    { slug: "mewtwo", dexNo: 150, names: { en: "Mewtwo", vi: "Mewtwo", ja: "ミュウツー" } },
    { slug: "lucario", dexNo: 448, names: { en: "Lucario", vi: "Lucario", ja: "ルカリオ" } },
    { slug: "greninja", dexNo: 658, names: { en: "Greninja", vi: "Greninja", ja: "ゲッコウガ" } },
    { slug: "garchomp", dexNo: 445, names: { en: "Garchomp", vi: "Garchomp", ja: "ガブリアス" } },
    { slug: "rayquaza", dexNo: 384, names: { en: "Rayquaza", vi: "Rayquaza", ja: "レックウザ" } },
    { slug: "umbreon", dexNo: 197, names: { en: "Umbreon", vi: "Umbreon", ja: "ブラッキー" } },
    { slug: "espeon", dexNo: 196, names: { en: "Espeon", vi: "Espeon", ja: "エーフィ" } },
    { slug: "snorlax", dexNo: 143, names: { en: "Snorlax", vi: "Snorlax", ja: "カビゴン" } },
    { slug: "eevee", dexNo: 133, names: { en: "Eevee", vi: "Eevee", ja: "イーブイ" } },
    { slug: "sprigatito", dexNo: 906, names: { en: "Sprigatito", vi: "Sprigatito", ja: "ニャオハ" } },
    { slug: "fuecoco", dexNo: 909, names: { en: "Fuecoco", vi: "Fuecoco", ja: "ホゲータ" } },
    { slug: "quaxly", dexNo: 912, names: { en: "Quaxly", vi: "Quaxly", ja: "クワッス" } },
    { slug: "miraidon", dexNo: 1008, names: { en: "Miraidon", vi: "Miraidon", ja: "ミライドン" } },
  ];

  const pokemonRecords = [];
  for (const m of mons) {
    const p = await prisma.pokemon.create({
      data: {
        slug: m.slug,
        dexNo: m.dexNo,
        nameEn: m.names.en,
        nameVi: m.names.vi,
        nameJa: m.names.ja,
        spriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${m.dexNo}.png`,
      },
    });
    pokemonRecords.push(p);
  }

  const rarityCycle: CardRarity[] = [
    CardRarity.COMMON,
    CardRarity.UNCOMMON,
    CardRarity.RARE,
    CardRarity.RARE_HOLO,
    CardRarity.RARE_ULTRA,
    CardRarity.RARE_SECRET,
    CardRarity.SPECIAL,
  ];

  const cardTypes = ["Fire", "Water", "Grass", "Lightning", "Psychic", "Fighting", "Darkness", "Metal"];

  for (let i = 0; i < 52; i++) {
    const slug = `product-${String(i + 1).padStart(3, "0")}`;
    const sku = `PKM-SV-${1000 + i}`;
    const category = categoryRecords[i % categoryRecords.length];
    const set = setRecords[i % setRecords.length];
    const monA = pokemonRecords[i % pokemonRecords.length];
    const monB = pokemonRecords[(i + 3) % pokemonRecords.length];
    const price = 4.99 + (i % 10) * 2.5;
    const sale = i % 7 === 0 ? price * 0.85 : null;
    const stock = i % 11 === 0 ? 0 : i % 5 === 0 ? 3 : 24;
    const status =
      stock === 0
        ? ProductStatus.OUT_OF_STOCK
        : i % 13 === 0
          ? ProductStatus.PRE_ORDER
          : ProductStatus.ACTIVE;

    const names = {
      en: `${monA.nameEn} ${i % 2 === 0 ? "ex" : "Holo"} #${i + 1}`,
      vi: `${monA.nameVi ?? monA.nameEn} ${i % 2 === 0 ? "ex" : "Holo"} #${i + 1}`,
      ja: `${monA.nameJa} ${i % 2 === 0 ? "ex" : "ホロ"} #${i + 1}`,
    };

    const product = await prisma.product.create({
      data: {
        slug,
        sku,
        price,
        salePrice: sale,
        stock,
        status,
        releaseDate: new Date(2023 + (i % 2), (i % 12) + 1, ((i % 27) + 1) % 28 || 1),
        isFeatured: i % 9 === 0,
        isNewArrival: i < 12,
        salesCount: 500 - i * 7 + (i % 50),
        viewCount: 2000 - i * 11,
        categoryId: category.id,
        cardSetId: set.id,
        translations: {
          create: locales.map((locale) => ({
            locale,
            name: names[locale],
            description:
              locale === "en"
                ? `Official Pokémon TCG product featuring ${monA.nameEn}. Great for collectors and players.`
                : locale === "vi"
                  ? `Sản phẩm TCG chính hãng với ${monA.nameVi ?? monA.nameEn}.`
                  : `ポケモンカードゲームの公式商品（${monA.nameJa}）。`,
          })),
        },
        images: {
          create: [
            {
              url: `https://placehold.co/600x840/3B4CCA/FFCC00/png?text=${encodeURIComponent(slug)}`,
              altText: names.en,
              isPrimary: true,
              sortOrder: 0,
            },
            {
              url: `https://placehold.co/600x840/CC0000/FFFFFF/png?text=Back`,
              altText: `${names.en} back`,
              isPrimary: false,
              sortOrder: 1,
            },
          ],
        },
        cardDetails: {
          create: {
            hp: 60 + (i % 280),
            cardNumber: String((i % 200) + 1),
            rarity: rarityCycle[i % rarityCycle.length],
            cardType: cardTypes[i % cardTypes.length],
            illustrator: "Ken Sugimori",
            setNumber: `${set.slug.toUpperCase().slice(0, 3)}-${String((i % 99) + 1).padStart(3, "0")}`,
          },
        },
        pokemonTags: {
          create: [{ pokemonId: monA.id }, { pokemonId: monB.id }],
        },
      },
    });

    if (i < 6) {
      await prisma.wishlist.create({
        data: { userId: demoUser.id, productId: product.id },
      });
    }
  }

  for (let b = 0; b < 5; b++) {
    await prisma.banner.create({
      data: {
        imageUrl: `https://placehold.co/1280x480/3B4CCA/FFCC00/png?text=Banner+${b + 1}`,
        linkUrl: `/en/products`,
        sortOrder: b,
        isActive: true,
        startsAt: new Date(Date.now() - 86400000 * 7),
        endsAt: new Date(Date.now() + 86400000 * 30),
        translations: {
          create: locales.map((locale) => ({
            locale,
            title:
              locale === "en"
                ? `Season Sale ${b + 1}`
                : locale === "vi"
                  ? `Ưu đãi mùa ${b + 1}`
                  : `シーズンセール ${b + 1}`,
            altText: `Banner ${b + 1}`,
          })),
        },
      },
    });
  }

  for (let n = 0; n < 10; n++) {
    const slug = `news-${n + 1}`;
    await prisma.news.create({
      data: {
        slug,
        isPublished: true,
        publishedAt: new Date(Date.now() - 86400000 * (n + 1)),
        translations: {
          create: locales.map((locale) => ({
            locale,
            title:
              locale === "en"
                ? `Store update #${n + 1}: New arrivals`
                : locale === "vi"
                  ? `Cập nhật cửa hàng #${n + 1}`
                  : `お知らせ #${n + 1}`,
            content:
              locale === "en"
                ? `<p>We just restocked popular Scarlet & Violet products. Visit the <strong>products</strong> page.</p>`
                : locale === "vi"
                  ? `<p>Chúng tôi vừa nhập thêm hàng Scarlet & Violet. Xem trang sản phẩm.</p>`
                  : `<p>人気のスカーレット＆バイオレット商品を再入荷しました。</p>`,
          })),
        },
      },
    });
  }

  console.log("Seed OK. Admin:", admin.email, "password: admin123");
  console.log("Demo user:", demoUser.email, "password: user123");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
