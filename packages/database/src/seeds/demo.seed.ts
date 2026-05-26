import { sql } from "drizzle-orm";
import { db } from "../client.js";
import { eq } from "drizzle-orm";
import { owners, properties, units, guests, ownerTypes, ownerStatuses, propertyStatuses, provinces, propertyTypes, currencies, unitStatuses, unitTypes, countries, languages }  from "../schema/index.js";
import { ownerBankAccounts } from "../schema/core/owners/owners_bank_accounts.js";
import { ownerContacts } from "../schema/core/owners/owner_contacts.js";

export async function seedDemoData() {
  console.log("[seed] demo data...");

  const owner = await getOrCreateOwner();
  await seedOwnerBankAccount(owner.id);
  await seedOwnerContacts(owner.id);
  
  const property = await seedProperty(owner.id);
  await seedUnits(property.id);
  await seedGuest();

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


async function seedProperty(ownerId: number) {
  const [existingProperty] = await db
    .select()
    .from(properties)
    .where(eq(properties.slug, "hotel-demo-buenos-aires"))
    .limit(1);

  if (existingProperty) {
    return existingProperty;
  }

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

  const [property] = await db
    .insert(properties)
    .values({
      publicId: crypto.randomUUID(),
      ownerId,
      name: "Hotel Demo Buenos Aires",
      displayName: "Hotel Demo Buenos Aires",
      slug: "hotel-demo-buenos-aires",
      timezone: "America/Argentina/Buenos_Aires",
      currencyId: usdCurrency.id,
      provinceId: arbProvince.id, // Asumiendo que existe Buenos Aires
      typeId: hotelType.id, // Asumiendo que existe 'hotel'
      address: "Av. Corrientes 1234, CABA",
      statusId: activeStatus.id,
      maxGuests: 100,
      defaultCheckInMinutes: 900, // 15:00
      defaultCheckOutMinutes: 660, // 11:00
      allowOverbooking: false,
      isActive: true,
    })
    .returning();

  console.log(`[seed] property created: ${property.id} - ${property.name}`);
  return property;
}

async function seedUnits(propertyId: number) {
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

  await db.insert(units).values([
    {
      propertyId,
      unitTypeId: standardType.id,
      statusId: activeUnitStatus.id,
      code: "101",
      name: "Standard Room 101",
      maxGuests: 2,
      bedrooms: 1,
      bathrooms: 1,
      basePricePerNight: 15000,
    },
    {
      propertyId,
      unitTypeId: standardType.id,
      statusId: activeUnitStatus.id,
      code: "102",
      name: "Standard Room 102",
      maxGuests: 2,
      bedrooms: 1,
      bathrooms: 1,
      basePricePerNight: 15000,
    },
    {
      propertyId,
      unitTypeId: suiteType.id,
      statusId: activeUnitStatus.id,
      code: "201",
      name: "Suite 201",
      maxGuests: 4,
      bedrooms: 2,
      bathrooms: 2,
      basePricePerNight: 35000,
    },
  ]).onConflictDoNothing({
    target: [units.propertyId, units.code],
  });

  console.log(`[seed] units created for property ${propertyId}`);
}


async function seedGuest() {
  const [existingGuest] = await db
    .select()
    .from(guests)
    .where(eq(guests.email, "john.doe@example.com"))
    .limit(1);

  if (existingGuest) {
    console.log(`[seed] guest already exists: ${existingGuest.email}`);
    return existingGuest;
  }

  const [nlCountry] = await db
    .select()
    .from(countries)
    .where(sql`${countries.code} = 'NL'`)
    .limit(1);

  if (!nlCountry) {
    throw new Error("Missing country: Netherlands (NL)");
  }

  const [nlLanguage] = await db
    .select()
    .from(languages)
    .where(sql`${languages.codeIso} = 'nl'`)
    .limit(1);

  if (!nlLanguage) {
    throw new Error("Missing language: Dutch (nl)");
  }

  const [createdGuest] = await db
    .insert(guests)
    .values({
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "+1 555-123-4567",
      documentType: "PASSPORT",
      documentNumber: "X12345678",
      nationalityId: nlCountry.id,
      languageId: nlLanguage.id,
    })
    .returning();

  console.log("[seed] guest created");

  return createdGuest;
}