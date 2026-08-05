import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const j = (arr: string[]) => JSON.stringify(arr);

type SeedProduct = {
  img: string;
  title: string;
  description: string;
  basePrice: number;
  suggestedPrice: number;
  stock: number;
  sku: string;
  aiScore: number;
  tags: string[];
};

const andinaProducts: SeedProduct[] = [
  {
    img: "audifonos",
    title: "Audífonos Inalámbricos Pro ANC — Cancelación de Ruido Activa",
    description:
      "Sumérgete en tu música con cancelación de ruido activa de última generación. Batería de 40 horas, estuche de carga rápida USB-C y micrófono dual para llamadas cristalinas.\n\nDiseño over-ear con almohadillas de espuma viscoelástica para sesiones largas sin fatiga. Compatibles con iOS y Android, conexión multipunto a 2 dispositivos.\n\n🚚 Envío a toda Colombia. 💳 Paga contra entrega. ⭐ Garantía de 12 meses.",
    basePrice: 289900,
    suggestedPrice: 329900,
    stock: 42,
    sku: "AUD-PRO-001",
    aiScore: 94,
    tags: ["audifonos", "audifonos bluetooth", "cancelacion de ruido", "audifonos inalambricos", "audio premium"],
  },
  {
    img: "reloj",
    title: "Reloj Minimalista Acero Inoxidable — Correa de Cuero Genuino",
    description:
      "Elegancia atemporal en tu muñeca. Caja de acero inoxidable de 40mm, cristal de zafiro resistente a rayones y movimiento de cuarzo japonés de alta precisión.\n\nCorrea de cuero genuino curtido artesanalmente. Resistente al agua 5ATM.\n\n🚚 Envío gratis por compras superiores a $200.000. ⭐ Garantía de 24 meses.",
    basePrice: 349900,
    suggestedPrice: 419900,
    stock: 18,
    sku: "REL-MIN-002",
    aiScore: 91,
    tags: ["reloj", "reloj hombre", "reloj minimalista", "reloj cuero", "relojes colombia"],
  },
  {
    img: "tenis",
    title: "Tenis Urbanos Runner Flex — Ultralivianos y Transpirables",
    description:
      "Diseñados para la ciudad: suela de espuma reactiva que devuelve energía en cada paso, upper de malla transpirable y plantilla ergonómica removible.\n\nDisponibles en tallas 36 a 44. Peso: solo 240g por zapato.\n\n🚚 Envío en 24-48h en ciudades principales. 💳 Todos los medios de pago.",
    basePrice: 219900,
    suggestedPrice: 259900,
    stock: 67,
    sku: "TEN-FLX-003",
    aiScore: 88,
    tags: ["tenis", "tenis hombre", "tenis mujer", "zapatos deportivos", "tenis urbanos"],
  },
  {
    img: "gafas",
    title: "Gafas de Sol Polarizadas UV400 — Marco Ultraliviano",
    description:
      "Protección total UV400 con lentes polarizados que eliminan reflejos. Marco de TR90 flexible y ultraliviano, prácticamente indestructible.\n\nIncluye estuche rígido, paño de microfibra y cordón deportivo.",
    basePrice: 89900,
    suggestedPrice: 109900,
    stock: 120,
    sku: "GAF-POL-004",
    aiScore: 76,
    tags: ["gafas de sol", "gafas polarizadas", "gafas uv400", "gafas hombre", "gafas mujer"],
  },
  {
    img: "morral",
    title: "Morral Antirrobo Impermeable — Puerto USB y Portátil 15.6\"",
    description:
      "El compañero perfecto para la ciudad: cierre oculto antirrobo, tela impermeable de alta densidad y puerto USB externo para cargar tu celular en movimiento.\n\nCompartimento acolchado para portátil de hasta 15.6\", bolsillos internos organizadores y espalda ventilada ergonómica.\n\n🚚 Envío a toda Colombia con Servientrega.",
    basePrice: 159900,
    suggestedPrice: 189900,
    stock: 54,
    sku: "MOR-ANT-005",
    aiScore: 92,
    tags: ["morral", "morral antirrobo", "morral portatil", "mochila", "morral impermeable"],
  },
  {
    img: "silla",
    title: "Silla Ergonómica de Oficina — Soporte Lumbar Ajustable",
    description:
      "Trabaja sin dolor de espalda: soporte lumbar ajustable, malla transpirable, reposabrazos 3D y reclinación hasta 135°.\n\nBase de aluminio reforzado que soporta hasta 150kg. Certificación BIFMA.",
    basePrice: 749900,
    suggestedPrice: 849900,
    stock: 12,
    sku: "SIL-ERG-006",
    aiScore: 83,
    tags: ["silla ergonomica", "silla oficina", "silla escritorio", "home office", "silla gamer"],
  },
  {
    img: "teclado",
    title: "Teclado Mecánico RGB 65% — Switches Red Hot-Swap",
    description:
      "Compacto y potente: formato 65% con switches red intercambiables sin soldadura (hot-swap), retroiluminación RGB por tecla y keycaps PBT double-shot.\n\nConexión tri-modo: Bluetooth 5.0, dongle 2.4GHz y USB-C.",
    basePrice: 259900,
    suggestedPrice: 299900,
    stock: 31,
    sku: "TEC-MEC-007",
    aiScore: 85,
    tags: ["teclado mecanico", "teclado rgb", "teclado gamer", "teclado bluetooth", "hot swap"],
  },
  {
    img: "camara",
    title: "Cámara Instantánea Retro — Impresión en 8 Segundos",
    description: "Captura e imprime tus recuerdos al instante con estilo retro.",
    basePrice: 429900,
    suggestedPrice: null as unknown as number,
    stock: 4,
    sku: "CAM-RET-008",
    aiScore: 38,
    tags: ["camara", "camara instantanea"],
  },
];

const kaffaProducts: SeedProduct[] = [
  {
    img: "mug",
    title: "Mug Artesanal de Cerámica — Esmaltado a Mano 350ml",
    description:
      "Cada mug es una pieza única esmaltada a mano por artesanos de Ráquira. Cerámica de alta temperatura apta para microondas y lavavajillas.\n\nCapacidad de 350ml, ideal para tu café de origen favorito.\n\n☕ Hecho en Colombia con amor.",
    basePrice: 49900,
    suggestedPrice: 59900,
    stock: 85,
    sku: "KAF-MUG-001",
    aiScore: 89,
    tags: ["mug", "mug ceramica", "mug artesanal", "taza cafe", "hecho en colombia"],
  },
  {
    img: "planta",
    title: "Kit Planta de Interior + Matera Autorregante",
    description:
      "Lleva vida a tu espacio: incluye planta de interior de fácil cuidado, matera autorregante de diseño minimalista y sustrato premium.\n\nIdeal para principiantes: la matera regula el agua por hasta 2 semanas.",
    basePrice: 79900,
    suggestedPrice: 94900,
    stock: 40,
    sku: "KAF-PLA-002",
    aiScore: 81,
    tags: ["plantas", "planta interior", "matera", "decoracion hogar", "kit planta"],
  },
  {
    img: "parlante",
    title: "Parlante Bluetooth Portátil 360° — Resistente al Agua IPX7",
    description:
      "Sonido envolvente 360° con graves profundos en un cuerpo compacto resistente al agua IPX7. Batería de 20 horas y función powerbank.\n\nEmpareja dos unidades para sonido estéreo real.",
    basePrice: 189900,
    suggestedPrice: 219900,
    stock: 28,
    sku: "KAF-PAR-003",
    aiScore: 87,
    tags: ["parlante bluetooth", "parlante portatil", "parlante acuatico", "altavoz", "audio"],
  },
  {
    img: "lampara",
    title: "Lámpara de Escritorio LED — Luz Cálida Regulable Táctil",
    description: "Lámpara LED táctil con tres tonos de luz y brazo flexible.",
    basePrice: 119900,
    suggestedPrice: null as unknown as number,
    stock: 6,
    sku: "KAF-LAM-004",
    aiScore: 52,
    tags: ["lampara", "lampara escritorio", "lampara led"],
  },
];

async function main() {
  // Limpieza para que el seed sea re-ejecutable
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.externalSync.deleteMany();
  await prisma.review.deleteMany();
  await prisma.product.deleteMany();
  await prisma.integration.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.liveStream.deleteMany();
  await prisma.tenantUser.deleteMany();
  await prisma.tenant.deleteMany();
  await prisma.user.deleteMany();

  const demoUser = await prisma.user.create({
    data: {
      name: "Juan Mendoza",
      email: "demo@mao.co",
      password: "demo1234",
      role: "ADMIN",
    },
  });

  const affiliate = await prisma.user.create({
    data: {
      name: "Laura Influencer",
      email: "laura@afiliados.co",
      password: "demo1234",
      role: "AFFILIATE",
      affiliateCode: "LAURA10",
    },
  });

  const andina = await prisma.tenant.create({
    data: {
      name: "Andina Home & Tech",
      slug: "andina",
      description: "Tecnología y estilo de vida para el hogar moderno.",
      plan: "PRO",
      aiCredits: 740,
      users: { create: { userId: demoUser.id } },
    },
  });

  const kaffa = await prisma.tenant.create({
    data: {
      name: "Kaffa Studio",
      slug: "kaffa",
      description: "Diseño y artesanía colombiana contemporánea.",
      plan: "BASIC",
      aiCredits: 92,
      users: { create: { userId: demoUser.id } },
    },
  });

  const createProducts = async (tenantId: string, list: SeedProduct[]) => {
    const created = [];
    for (const p of list) {
      created.push(
        await prisma.product.create({
          data: {
            tenantId,
            title: p.title,
            description: p.description,
            basePrice: p.basePrice,
            suggestedPrice: p.suggestedPrice ?? null,
            stock: p.stock,
            images: j([`/products/${p.img}.jpg`]),
            sku: p.sku,
            aiScore: p.aiScore,
            aiTags: j(p.tags),
          },
        })
      );
    }
    return created;
  };

  const andinaItems = await createProducts(andina.id, andinaProducts);
  const kaffaItems = await createProducts(kaffa.id, kaffaProducts);
  const all = [...andinaItems, ...kaffaItems];

  // Integraciones de canales (Andina: omnicanal completa)
  await prisma.integration.createMany({
    data: [
      { tenantId: andina.id, platform: "MERCADOLIBRE", isActive: true, sellerId: "ML-748291", accessToken: "demo" },
      { tenantId: andina.id, platform: "FALABELLA", isActive: true, sellerId: "FLB-2291", accessToken: "demo" },
      { tenantId: andina.id, platform: "WHATSAPP", isActive: true, sellerId: "573001234567", accessToken: "demo" },
      { tenantId: andina.id, platform: "META", isActive: false },
      { tenantId: kaffa.id, platform: "WHATSAPP", isActive: true, sellerId: "573009876543", accessToken: "demo" },
    ],
  });

  // Sincronizaciones externas (productos de Andina publicados en canales)
  const now = Date.now();
  const syncData = [];
  for (const [i, p] of andinaItems.entries()) {
    if (i < 6) {
      syncData.push({
        productId: p.id,
        platform: "MERCADOLIBRE",
        externalId: `MCO${900000 + i * 137}`,
        externalTitle: p.title.slice(0, 60),
        status: "SYNCED",
        lastSync: new Date(now - (i + 2) * 3600e3),
      });
    }
    if (i < 4) {
      syncData.push({
        productId: p.id,
        platform: "FALABELLA",
        externalId: `FLB-SKU-${4400 + i}`,
        externalTitle: p.title.slice(0, 80),
        status: i === 3 ? "FAILED" : "SYNCED",
        lastSync: new Date(now - (i + 5) * 3600e3),
      });
    }
  }
  syncData.push({
    productId: andinaItems[6].id,
    platform: "MERCADOLIBRE",
    externalId: null,
    externalTitle: null,
    status: "PENDING",
    lastSync: null,
  });
  await prisma.externalSync.createMany({ data: syncData });

  // Reseñas con análisis de sentimiento
  const reviews = [
    { p: 0, rating: 5, comment: "La cancelación de ruido es impresionante, los uso todos los días para trabajar.", sentiment: "POSITIVE" },
    { p: 0, rating: 4, comment: "Muy buen sonido, aunque el estuche llegó con un rayón pequeño.", sentiment: "NEUTRAL" },
    { p: 0, rating: 5, comment: "El mejor regalo que he dado, mi esposo feliz.", sentiment: "POSITIVE" },
    { p: 1, rating: 5, comment: "Elegante y la correa huele a cuero de verdad. Excelente compra.", sentiment: "POSITIVE" },
    { p: 2, rating: 3, comment: "Cómodos pero el envío tardó más de lo prometido.", sentiment: "NEGATIVE" },
    { p: 2, rating: 5, comment: "Livianísimos, perfectos para caminar por Bogotá.", sentiment: "POSITIVE" },
    { p: 4, rating: 5, comment: "El puerto USB me salvó la vida en el aeropuerto. Recomendadísimo.", sentiment: "POSITIVE" },
    { p: 4, rating: 4, comment: "Buen morral, el empaque llegó impecable.", sentiment: "POSITIVE" },
    { p: 5, rating: 2, comment: "La silla es buena pero llegó una semana tarde y mal embalada.", sentiment: "NEGATIVE" },
  ];
  for (const r of reviews) {
    await prisma.review.create({
      data: {
        productId: andinaItems[r.p].id,
        rating: r.rating,
        comment: r.comment,
        sentiment: r.sentiment,
        source: "MARKETPLACE",
      },
    });
  }

  // Órdenes multicanal de los últimos 30 días
  const customers = [
    ["Camila Rojas", "camila.rojas@gmail.com", "3015550101"],
    ["Andrés Peña", "andres.pena@hotmail.com", "3125550102"],
    ["Valentina Gil", "vale.gil@gmail.com", "3005550103"],
    ["Santiago Muñoz", "santi.m@gmail.com", "3175550104"],
    ["María Fernanda López", "mafe.lopez@gmail.com", "3205550105"],
    ["Julián Castro", "julian.castro@gmail.com", "3135550106"],
    ["Daniela Torres", "dani.torres@gmail.com", "3045550107"],
    ["Carlos Herrera", "carlos.h@gmail.com", "3155550108"],
  ];
  const sources = ["MARKETPLACE", "MERCADOLIBRE", "WHATSAPP", "MARKETPLACE", "MERCADOLIBRE", "FALABELLA", "WHATSAPP", "MARKETPLACE"];
  const statuses = ["DELIVERED", "DELIVERED", "SHIPPED", "PROCESSING", "DELIVERED", "SHIPPED", "PAID", "PENDING"];

  for (let i = 0; i < 14; i++) {
    const c = customers[i % customers.length];
    const product = all[(i * 3) % all.length];
    const product2 = all[(i * 5 + 2) % all.length];
    const qty = (i % 2) + 1;
    const twoItems = i % 3 === 0;
    const total = product.basePrice * qty + (twoItems ? product2.basePrice : 0);
    const isDrop = i % 4 === 0;
    await prisma.order.create({
      data: {
        tenantId: product.tenantId,
        customerName: c[0],
        customerEmail: c[1],
        customerPhone: c[2],
        total,
        status: statuses[i % statuses.length],
        source: sources[i % sources.length],
        isDropshipping: isDrop,
        shippingProvider: isDrop ? (i % 2 ? "Coordinadora" : "Servientrega") : null,
        trackingNumber: isDrop ? `CO${52000000 + i * 991}` : null,
        affiliateId: i % 5 === 0 ? affiliate.id : null,
        createdAt: new Date(now - i * 2.1 * 24 * 3600e3),
        items: {
          create: [
            { productId: product.id, quantity: qty, price: product.basePrice },
            ...(twoItems ? [{ productId: product2.id, quantity: 1, price: product2.basePrice }] : []),
          ],
        },
      },
    });
  }

  // Ventas concentradas recientes para activar la predicción de inventario:
  // cámara (stock 4, ~18 vendidas/30d → crítico) y lámpara (stock 6 → alerta)
  const camara = andinaItems[7];
  const lampara = kaffaItems[3];
  const bulkSales: Array<[typeof camara, number, number]> = [
    [camara, 6, 3],
    [camara, 6, 9],
    [camara, 6, 16],
    [lampara, 5, 4],
    [lampara, 5, 11],
  ];
  for (const [product, qty, daysAgo] of bulkSales) {
    const c = customers[(qty + daysAgo) % customers.length];
    await prisma.order.create({
      data: {
        tenantId: product.tenantId,
        customerName: c[0],
        customerEmail: c[1],
        customerPhone: c[2],
        total: product.basePrice * qty,
        status: "DELIVERED",
        source: "MERCADOLIBRE",
        createdAt: new Date(now - daysAgo * 24 * 3600e3),
        items: {
          create: [{ productId: product.id, quantity: qty, price: product.basePrice }],
        },
      },
    });
  }

  // Campaña sugerida por IA y Live Stream programado
  await prisma.campaign.create({
    data: {
      tenantId: andina.id,
      name: "Amor y Amistad 2026",
      type: "DISCOUNT",
      aiGenerated: true,
      status: "DRAFT",
      startDate: new Date("2026-09-14"),
      endDate: new Date("2026-09-21"),
    },
  });

  await prisma.liveStream.create({
    data: {
      tenantId: andina.id,
      title: "Lanzamiento colección tech — Live especial",
      status: "SCHEDULED",
      scheduledFor: new Date(now + 3 * 24 * 3600e3),
    },
  });

  console.log("Seed completado:");
  console.log(`  Usuario demo: demo@mao.co / demo1234`);
  console.log(`  Tenants: ${andina.slug} (${andinaItems.length} productos), ${kaffa.slug} (${kaffaItems.length} productos)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
