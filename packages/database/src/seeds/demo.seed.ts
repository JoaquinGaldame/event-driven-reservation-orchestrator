import { sql } from "drizzle-orm";
import { db } from "../client.js";
import { eq } from "drizzle-orm";
import { owners, properties, units, guests, ownerTypes, ownerStatuses, propertyStatuses, provinces, propertyTypes, currencies, unitStatuses, unitTypes, countries, languages, unitDailyRates }  from "../schema/index.js";
import { ownerBankAccounts } from "../schema/core/owners/owners_bank_accounts.js";
import { ownerContacts } from "../schema/core/owners/owner_contacts.js";

export async function seedDemoData() {
  console.log("[seed] demo data...");

  const owner = await getOrCreateOwner();
  await seedOwnerBankAccount(owner.id);
  await seedOwnerContacts(owner.id);

  const propertiesCreated = await seedProperties(owner.id);
  const allUnits = [];

  for (const property of propertiesCreated) {
    const unitsCreated = await seedUnits(property.id, property.slug);
    allUnits.push(...unitsCreated);
  }

  await seedDailyRates(allUnits);
  await seedGuests();

  console.log("[seed] demo complete");
}

async function getOrCreateOwner() {
  const [existingOwner] = await db
    .select()
    .from(owners)
    .where(eq(owners.taxId, "20-12345678-9"))
    .limit(1);

  if (existingOwner) {
    return existingOwner;
  }

  // Obtener IDs de las tablas auxiliares (asumiendo que ya existen)
  const [companyType] = await db
    .select()
    .from(ownerTypes)
    .where(sql`${ownerTypes.code} = 'company'`)
    .limit(1);

  if (!companyType) {
    throw new Error("Missing owner type: company");
  }
  
  const [activeStatus] = await db
    .select()
    .from(ownerStatuses)
    .where(sql`${ownerStatuses.code} = 'ACTIVE'`)
    .limit(1);

  if (!activeStatus) {
    throw new Error("Missing owner status: ACTIVE");
  }

  const [createdOwner] = await db
    .insert(owners)
    .values({
      publicId: crypto.randomUUID(),
      firstName: "Demo Hospitality",
      lastName: "Group",
      legalName: "Demo Hospitality Group S.A.",
      tradingName: "Demo Hospitality",
      taxId: "20-12345678-9",
      typeId: companyType.id, // fallback a 2 si no encuentra
      email: "finance@demohospitality.com",
      phone: "+54 11 1234-5678",
      billingEmail: "accounts@demohospitality.com",
      preferredLanguage: "en",
      documentType: "TAX_ID",
      documentNumber: "20-12345678-9",
      statusId: activeStatus.id,
      // Datos bancarios (ahora van en ownerBankAccounts, no acá)
    })
    .returning();

  console.log(`[seed] owner created: ${createdOwner.id} - ${createdOwner.legalName}`);
  return createdOwner;
}


async function seedOwnerBankAccount(ownerId: number) {
  const [existing] = await db
    .select()
    .from(ownerBankAccounts)
    .where(eq(ownerBankAccounts.accountNumber, "123456789"))
    .limit(1);

  if (existing) {
    return existing;
  }

  // Obtener ID de USD currency
  const [usdCurrency] = await db
    .select()
    .from(currencies)
    .where(sql`${currencies.code} = 'USD'`)
    .limit(1);

  if (!usdCurrency) {
    throw new Error("Missing USD currency");
  }

  await db.insert(ownerBankAccounts).values({
    ownerId: ownerId,
    accountName: "Main USD Account",
    bankName: "Bank of America",
    bankCountry: "US",
    accountNumber: "123456789",
    accountCurrencyId: usdCurrency.id,
    routingNumber: "021000021",
    swiftBic: "BOFAUS3N",
    iban: null, // USA no usa IBAN
    isDefault: true,
    isActive: true,
    beneficiaryName: "Demo Hospitality Group S.A.",
    beneficiaryTaxId: "20-12345678-9",
  });

  console.log(`[seed] bank account created for owner ${ownerId}`);
}

async function seedOwnerContact(
  ownerId: number,
  email: string,
  values: typeof ownerContacts.$inferInsert
) {
  const [existing] = await db
    .select()
    .from(ownerContacts)
    .where(eq(ownerContacts.email, email))
    .limit(1);

  if (existing) {
    console.log(`[seed] contact already exists: ${email}`);
    return existing;
  }

  const [created] = await db
    .insert(ownerContacts)
    .values(values)
    .returning();

  console.log(`[seed] contact created: ${email}`);

  return created;
}

async function seedOwnerContacts(ownerId: number) {
  await seedOwnerContact(
    ownerId,
    "carlos.gutierrez@demohospitality.com",
    {
      ownerId,
      contactType: "financial",
      firstName: "Carlos",
      lastName: "Gutiérrez",
      email: "carlos.gutierrez@demohospitality.com",
      phone: "+54 11 5555-1234",
      mobile: "+54 9 11 5555-5678",
      isPrimary: true,
    }
  );

  await seedOwnerContact(
    ownerId,
    "maria.fernandez@demohospitality.com",
    {
      ownerId,
      contactType: "operational",
      firstName: "María",
      lastName: "Fernández",
      email: "maria.fernandez@demohospitality.com",
      phone: "+54 11 5555-1235",
      mobile: "+54 9 11 5555-5679",
      isPrimary: false,
    }
  );

  await seedOwnerContact(
    ownerId,
    "legal@demohospitality.com",
    {
      ownerId,
      contactType: "legal",
      firstName: "Dr. Roberto",
      lastName: "Sánchez",
      email: "legal@demohospitality.com",
      phone: "+54 11 5555-1236",
      isPrimary: false,
    }
  );

  console.log(`[seed] contacts created for owner ${ownerId}`);
}


async function resolveDemoReferences() {
  const [usdCurrency] = await db
    .select()
    .from(currencies)
    .where(sql`${currencies.code} = 'USD'`)
    .limit(1);

  if (!usdCurrency) {
    throw new Error("Missing USD currency");
  }

  const [arbProvince] = await db
    .select()
    .from(provinces)
    .where(sql`${provinces.code} = 'AR-B'`)
    .limit(1);

  if (!arbProvince) {
    throw new Error("Missing province: AR-B");
  }

  const [activeStatus] = await db
    .select()
    .from(propertyStatuses)
    .where(sql`${propertyStatuses.code} = 'ACTIVE'`)
    .limit(1);

  if (!activeStatus) {
    throw new Error("Missing Active Status");
  }

  const [hotelType] = await db
    .select()
    .from(propertyTypes)
    .where(sql`${propertyTypes.code} = 'HOTEL'`)
    .limit(1);

  if (!hotelType) {
    throw new Error("Missing property type: HOTEL");
  }

  return {
    usdCurrency,
    arbProvince,
    activeStatus,
    hotelType,
  };
}

async function seedProperty(ownerId: number, values: {
  name: string;
  displayName: string;
  slug: string;
  address: string;
}) {
  const [existingProperty] = await db
    .select()
    .from(properties)
    .where(eq(properties.slug, values.slug))
    .limit(1);

  if (existingProperty) {
    console.log(`[seed] property already exists: ${existingProperty.id} - ${existingProperty.name}`);
    return existingProperty;
  }

  const {
    usdCurrency,
    arbProvince,
    activeStatus,
    hotelType,
  } = await resolveDemoReferences();

  const [property] = await db
    .insert(properties)
    .values({
      publicId: crypto.randomUUID(),
      ownerId,
      name: values.name,
      displayName: values.displayName,
      slug: values.slug,
      timezone: "America/Argentina/Buenos_Aires",
      currencyId: usdCurrency.id,
      provinceId: arbProvince.id,
      typeId: hotelType.id,
      address: values.address,
      statusId: activeStatus.id,
      maxGuests: 100,
      defaultCheckInMinutes: 900,
      defaultCheckOutMinutes: 660,
      allowOverbooking: false,
      isActive: true,
    })
    .returning();

  console.log(`[seed] property created: ${property.id} - ${property.name}`);
  return property;
}

async function seedProperties(ownerId: number) {
  const definitions = [
    {
      name: "Hotel Demo Buenos Aires",
      displayName: "Hotel Demo Buenos Aires",
      slug: "hotel-demo-buenos-aires",
      address: "Av. Corrientes 1234, CABA",
    },
    {
      name: "Hotel Demo Palermo",
      displayName: "Hotel Demo Palermo",
      slug: "hotel-demo-palermo",
      address: "Honduras 4580, Palermo, CABA",
    },
  ];

  const created = [];

  for (const definition of definitions) {
    created.push(await seedProperty(ownerId, definition));
  }

  return created;
}

async function seedUnits(propertyId: number, propertySlug: string) {
  const [activeUnitStatus] = await db
    .select()
    .from(unitStatuses)
    .where(sql`${unitStatuses.code} = 'ACTIVE'`)
    .limit(1);

  if (!activeUnitStatus) {
    throw new Error("Missing unit status: ACTIVE");
  }

  const [standardType] = await db
    .select()
    .from(unitTypes)
    .where(sql`${unitTypes.code} = 'ROOM'`)
    .limit(1);

  if (!standardType) {
    throw new Error("Missing unit type: ROOM");
  }

  const [suiteType] = await db
    .select()
    .from(unitTypes)
    .where(sql`${unitTypes.code} = 'SUITE'`)
    .limit(1);
  
  if (!suiteType) {
    throw new Error("Missing unit type: SUITE");
  }

  const standardPrice = propertySlug === "hotel-demo-palermo" ? 18000 : 15000;
  const suitePrice = propertySlug === "hotel-demo-palermo" ? 42000 : 35000;
  const definitions = [
    {
      code: "101",
      name: propertySlug === "hotel-demo-palermo" ? "Palermo Standard 101" : "Standard Room 101",
      unitTypeId: standardType.id,
      maxGuests: 2,
      bedrooms: 1,
      bathrooms: 1,
      basePricePerNight: standardPrice,
    },
    {
      code: "102",
      name: propertySlug === "hotel-demo-palermo" ? "Palermo Standard 102" : "Standard Room 102",
      unitTypeId: standardType.id,
      maxGuests: 2,
      bedrooms: 1,
      bathrooms: 1,
      basePricePerNight: standardPrice,
    },
    {
      code: "201",
      name: propertySlug === "hotel-demo-palermo" ? "Palermo Suite 201" : "Suite 201",
      unitTypeId: suiteType.id,
      maxGuests: 4,
      bedrooms: 2,
      bathrooms: 2,
      basePricePerNight: suitePrice,
    },
    {
      code: "301",
      name: propertySlug === "hotel-demo-palermo" ? "Palermo Family 301" : "Family Room 301",
      unitTypeId: suiteType.id,
      maxGuests: 5,
      bedrooms: 2,
      bathrooms: 2,
      basePricePerNight: suitePrice + 8000,
    },
  ];

  await db.insert(units).values(
    definitions.map((definition) => ({
      propertyId,
      unitTypeId: definition.unitTypeId,
      statusId: activeUnitStatus.id,
      code: definition.code,
      name: definition.name,
      maxGuests: definition.maxGuests,
      bedrooms: definition.bedrooms,
      bathrooms: definition.bathrooms,
      basePricePerNight: definition.basePricePerNight,
    })),
  ).onConflictDoNothing({
    target: [units.propertyId, units.code],
  });

  console.log(`[seed] units created for property ${propertyId}`);

  const insertedUnits = await db
    .select()
    .from(units)
    .where(eq(units.propertyId, propertyId));

  return insertedUnits;
}


async function seedGuest(definition: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  documentType: string;
  documentNumber: string;
  nationalityCode: string;
  languageCode: string;
}) {
  const [existingGuest] = await db
    .select()
    .from(guests)
    .where(eq(guests.email, definition.email))
    .limit(1);

  if (existingGuest) {
    console.log(`[seed] guest already exists: ${existingGuest.email}`);
    return existingGuest;
  }

  const [country] = await db
    .select()
    .from(countries)
    .where(sql`${countries.code} = ${definition.nationalityCode}`)
    .limit(1);

  if (!country) {
    throw new Error(`Missing country: ${definition.nationalityCode}`);
  }

  const [language] = await db
    .select()
    .from(languages)
    .where(sql`${languages.codeIso} = ${definition.languageCode}`)
    .limit(1);

  if (!language) {
    throw new Error(`Missing language: ${definition.languageCode}`);
  }

  const [createdGuest] = await db
    .insert(guests)
    .values({
      firstName: definition.firstName,
      lastName: definition.lastName,
      email: definition.email,
      phone: definition.phone,
      documentType: definition.documentType,
      documentNumber: definition.documentNumber,
      nationalityId: country.id,
      languageId: language.id,
    })
    .returning();

  console.log(`[seed] guest created: ${createdGuest.email}`);

  return createdGuest;
}

async function seedGuests() {
  const definitions = [
    {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "+1 555-123-4567",
      documentType: "PASSPORT",
      documentNumber: "X12345678",
      nationalityCode: "NL",
      languageCode: "nl",
    },
    {
      firstName: "Ana",
      lastName: "Martinez",
      email: "ana.martinez@example.com",
      phone: "+54 11 4444-0101",
      documentType: "DNI",
      documentNumber: "30111222",
      nationalityCode: "AR",
      languageCode: "es",
    },
    {
      firstName: "Michael",
      lastName: "Brown",
      email: "michael.brown@example.com",
      phone: "+1 212 555 7788",
      documentType: "PASSPORT",
      documentNumber: "US9988776",
      nationalityCode: "US",
      languageCode: "en",
    },
    {
      firstName: "Sofia",
      lastName: "Rossi",
      email: "sofia.rossi@example.com",
      phone: "+39 06 5555 1100",
      documentType: "PASSPORT",
      documentNumber: "IT4455667",
      nationalityCode: "IT",
      languageCode: "it",
    },
  ];

  for (const definition of definitions) {
    await seedGuest(definition);
  }
}

async function seedDailyRates(unitsToSeed: Array<typeof units.$inferSelect>) {
  const [usdCurrency] = await db
    .select()
    .from(currencies)
    .where(sql`${currencies.code} = 'USD'`)
    .limit(1);

  if (!usdCurrency) {
    throw new Error("Missing USD currency");
  }

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  for (const unit of unitsToSeed) {
    const rateRows = [];

    for (let offset = 0; offset < 45; offset++) {
      const rateDate = new Date(today);
      rateDate.setUTCDate(today.getUTCDate() + offset);

      const weekend = rateDate.getUTCDay() === 5 || rateDate.getUTCDay() === 6;
      const seasonalMultiplier = weekend ? 1.15 : 1;

      rateRows.push({
        unitId: unit.id,
        date: rateDate,
        currencyId: usdCurrency.id,
        pricePerNight: Math.round(unit.basePricePerNight * seasonalMultiplier),
        minStayNights: null,
        maxStayNights: null,
        isAvailable: true,
      });
    }

    await db.insert(unitDailyRates).values(rateRows).onConflictDoNothing({
      target: [unitDailyRates.unitId, unitDailyRates.date],
    });
  }

  console.log(`[seed] daily rates created for ${unitsToSeed.length} units`);
}
