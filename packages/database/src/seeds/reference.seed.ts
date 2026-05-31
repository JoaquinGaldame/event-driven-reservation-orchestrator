import { eq } from "drizzle-orm";
import { db } from "../client.js";
import {
  currencies,
  countries,
  provinces,
  languages,
  ownerTypes,
  ownerStatuses,
  commissionTypes,
  reservationStatuses,
  paymentStatuses,
  propertyTypes,
  propertyStatuses,
  unitStatuses,
  unitTypes,
  channels,
  channelTypes,
  channelStatuses,
  inventoryLockTypes,
  inventoryLockStatuses,
  movementTypes,
} from "../schema/index.js";

export async function seedReferenceData() {
  console.log("[seed] reference data...");

  await seedMetadata();
  await seedCurrencies();
  await seedPropertyMetaData();
  await seedUnitsMetaData();
  await seedOwnerTypes();
  await seedReservationStatuses();
  await seedPaymentStatuses();
  await seedMovementTypes();
  await seedChannelTypes();
  await seedInventoryLockStatuses();
  await seedLockTypes();

  console.log("[seed] reference complete");
}


async function seedMetadata() {
  /*
   * COUNTRIES
   */
  await db
    .insert(countries)
    .values([
      { code: "AR", name: "Argentina" },
      { code: "BR", name: "Brasil" },
      { code: "CL", name: "Chile" },
      { code: "UY", name: "Uruguay" },
      { code: "PY", name: "Paraguay" },
      { code: "BO", name: "Bolivia" },
      { code: "PE", name: "Perú" },
      { code: "US", name: "United States" },
      { code: "ES", name: "España" },
      { code: "FR", name: "Francia" },
      { code: "IT", name: "Italia" },
      { code: "DE", name: "Alemania" },
      { code: "GB", name: "Reino Unido" },
      { code: "CN", name: "China" },
      { code: "JP", name: "Japón" },
      { code: "RU", name: "Rusia" },
      { code: "IN", name: "India" },
      { code: "MX", name: "México" },
      { code: "CO", name: "Colombia" },
      { code: "VE", name: "Venezuela" },
      { code: "EC", name: "Ecuador" },
      { code: "GT", name: "Guatemala" },
      { code: "CR", name: "Costa Rica" },
      { code: "PA", name: "Panamá" },
      { code: "NL", name: "Países Bajos" },
      { code: "BE", name: "Bélgica" },
      { code: "CH", name: "Suiza" },
      { code: "DO", name: "República Dominicana" },
      { code: "HN", name: "Honduras" },
      { code: "NI", name: "Nicaragua" },
      { code: "SV", name: "El Salvador" },
      { code: "CU", name: "Cuba" },
    ])
    .onConflictDoNothing({
      target: countries.code
    });

  /*
   * ARGENTINA
   */
  const [argentina] = await db
    .select()
    .from(countries)
    .where(eq(countries.code, "AR"))
    .limit(1);

  if (!argentina) {
    throw new Error("Argentina country seed failed");
  }

  /*
   * PROVINCES
   */
  await db
    .insert(provinces)
    .values([
      { countryId: argentina.id, code: "AR-B", name: "Buenos Aires" },
      {
        countryId: argentina.id,
        code: "AR-C",
        name: "Ciudad Autónoma de Buenos Aires",
      },
      { countryId: argentina.id, code: "AR-K", name: "Catamarca" },
      { countryId: argentina.id, code: "AR-H", name: "Chaco" },
      { countryId: argentina.id, code: "AR-U", name: "Chubut" },
      { countryId: argentina.id, code: "AR-X", name: "Córdoba" },
      { countryId: argentina.id, code: "AR-W", name: "Corrientes" },
      { countryId: argentina.id, code: "AR-E", name: "Entre Ríos" },
      { countryId: argentina.id, code: "AR-P", name: "Formosa" },
      { countryId: argentina.id, code: "AR-Y", name: "Jujuy" },
      { countryId: argentina.id, code: "AR-L", name: "La Pampa" },
      { countryId: argentina.id, code: "AR-F", name: "La Rioja" },
      { countryId: argentina.id, code: "AR-M", name: "Mendoza" },
      { countryId: argentina.id, code: "AR-N", name: "Misiones" },
      { countryId: argentina.id, code: "AR-Q", name: "Neuquén" },
      { countryId: argentina.id, code: "AR-R", name: "Río Negro" },
      { countryId: argentina.id, code: "AR-A", name: "Salta" },
      { countryId: argentina.id, code: "AR-J", name: "San Juan" },
      { countryId: argentina.id, code: "AR-D", name: "San Luis" },
      { countryId: argentina.id, code: "AR-Z", name: "Santa Cruz" },
      { countryId: argentina.id, code: "AR-S", name: "Santa Fe" },
      { countryId: argentina.id, code: "AR-G", name: "Santiago del Estero" },
      { countryId: argentina.id, code: "AR-V", name: "Tierra del Fuego" },
      { countryId: argentina.id, code: "AR-T", name: "Tucumán" },
    ])
    .onConflictDoNothing({
      target: provinces.code
    });

  /*
   * LANGUAGES
   */
  await db
    .insert(languages)
    .values([
      { codeIso: "en", name: "English" },
      { codeIso: "es", name: "Spanish" },
      { codeIso: "pt", name: "Portuguese" },
      { codeIso: "fr", name: "French" },
      { codeIso: "de", name: "German" },
      { codeIso: "nl", name: "Dutch" },
      { codeIso: "zh", name: "Chinese" },
      { codeIso: "ja", name: "Japanese" },
      { codeIso: "ru", name: "Russian" },
      { codeIso: "ar", name: "Arabic" },
      { codeIso: "it", name: "Italian" },
      { codeIso: "ko", name: "Korean" },
      { codeIso: "hi", name: "Hindi" },
    ])
    .onConflictDoNothing({
      target: languages.codeIso
    });
}

async function seedCurrencies() {
  await db
    .insert(currencies)
    .values([
      {
        code: "USD",
        name: "US Dollar",
        symbol: "$",
      },
      {
        code: "ARS",
        name: "Argentine Peso",
        symbol: "$",
      },
      {
        code: "EUR",
        name: "Euro",
        symbol: "€",
      },
    ])
    .onConflictDoNothing();
}

async function seedPropertyMetaData() {
  /*
   * Property Types
   */
  await db
    .insert(propertyTypes)
    .values([
      { code: "HOUSE", name: "House" },
      { code: "APARTMENT", name: "Apartment" },
      { code: "HOTEL", name: "Hotel" },
      { code: "VILLA", name: "Villa" },
      { code: "CABIN", name: "Cabin" },
      { code: "CONDO", name: "Condominium" },
      { code: "TOWNHOUSE", name: "Townhouse" },
      { code: "BUNGALOW", name: "Bungalow" },
      { code: "LODGE", name: "Lodge" },
      { code: "RESORT", name: "Resort" },
      { code: "HOSTEL", name: "Hostel" },
      { code: "GUESTHOUSE", name: "Guesthouse" },
      { code: "BED_BREAKFAST", name: "Bed & Breakfast" },
      { code: "BOAT", name: "Boat" },
      { code: "TINY_HOUSE", name: "Tiny House" },
      { code: "CASTLE", name: "Castle" },
      { code: "FARM", name: "Farm Stay" },
      { code: "GLAMPING", name: "Glamping" },
      { code: "COTTAGE", name: "Cottage" },
      { code: "LOFT", name: "Loft" },
      { code: "DUPLEX", name: "Duplex" },
      { code: "PENTHOUSE", name: "Penthouse" },
      { code: "STUDIO", name: "Studio" },
      { code: "ROOM", name: "Private Room" },
      { code: "SHARED_ROOM", name: "Shared Room" },
  ]).onConflictDoNothing({
    target: propertyTypes.code,
  });

    /*
   * Property Types
   */
  await db
    .insert(propertyStatuses)
    .values([
      { code: "ACTIVE", name: "Active", description: ""},
      { code: "INACTIVE", name: "Inactive", description: ""},
      { code: "ONBOARDING", name: "ONBOARDING", description: ""},
      { code: "SUSPENDED", name: "Suspended", description: ""},
      { code: "ARCHIVED", name: "Archived", description: ""},
    ]).onConflictDoNothing({
    target: propertyStatuses.code,
  });
}

async function seedUnitsMetaData() {
  /*
   * Unit Types
   */
  await db
    .insert(unitTypes)
    .values([
      { code: "ROOM", name: "House" },
      { code: "APARTMENT", name: "Apartment" },
      { code: "HOUSE", name: "House" },
      { code: "CABIN", name: "Cabin" },
      { code: "CABIN", name: "Cabin" },
      { code: "BED", name: "Bed" },
      { code: "SUITE", name: "Suite" },
  ]).onConflictDoNothing({
    target: unitTypes.code,
  });

  /*
   * Unit Types
   */
  await db
    .insert(unitStatuses)
    .values([
      { code: "ACTIVE" },
      { code: "INACTIVE" },
      { code: "MAINTENANCE" },
      { code: "BLOCKED" },
      { code: "ARCHIVED" },
  ]).onConflictDoNothing({
    target: unitStatuses.code,
  });
}

async function seedOwnerTypes() {
    await db
    .insert(ownerStatuses)
    .values([
      { code: "ACTIVE" },
      { code: "INACTIVE" },
      { code: "SUSPENDED" },
      { code: "ARCHIVED"}
    ])
    .onConflictDoNothing();

  await db
    .insert(ownerTypes)
    .values([
      { code: "individual" },
      { code: "company" },
      { code: "ngo" },
      { code: "government"},
      { code: "trust" }
    ])
    .onConflictDoNothing();

  await db
    .insert(commissionTypes)
    .values([
      { code: "PERCENTAGE", name: "Percentage" },
      { code: "FIXED_PER_RESERVATION", name: "Fixed Per Reservation" },
      { code: "FIXED_PER_NIGHT", name: "Fixed Per Night" }
    ])
    .onConflictDoNothing();
}

async function seedReservationStatuses() {
  await db
    .insert(reservationStatuses)
    .values([
      { code: "PENDING", name: "Pending" },
      { code: "INVENTORY_LOCKED", name: "Inventory Locked" },
      { code: "PAYMENT_REQUIRED", name: "Payment Required" },
      { code: "CONFIRMED", name: "Confirmed" },
      { code: "REJECTED", name: "Rejected" },
      { code: "CANCELLED", name: "Cancelled" },
    ])
    .onConflictDoNothing();
}

async function seedPaymentStatuses() {
  await db
    .insert(paymentStatuses)
    .values([
      { code: "PENDING", name: "Pending", description: "Initial state when payment is created but not yet processed" },
      { code: "AUTHORIZED", name: "Authorized", description: "Funds are reserved but not yet charged to the customer's account" },
      { code: "CONFIRMED", name: "Confirmed", description: "Funds have been successfully transferred from customer to merchant" },
      { code: "FAILED", name: "Failed", description: "Payment could not be completed due to insufficient funds, declined, or technical error" },
      { code: "CANCELLED", name: "Cancelled", description: "Payment was voided before capture, no funds were transferred" },
      { code: "REFUNDED", name: "Refunded", description: "Full amount has been returned to customer's original payment method" },
      { code: "PARTIALLY_REFUNDED", name: "Partially Refunded", description: "Part of the captured amount has been returned to the customer" },
      { code: "EXPIRED", name: "Expired", description: "Pending payment was not completed within the allowed timeframe" },
    ])
    .onConflictDoNothing();
}

async function seedChannelTypes() {
  /**
   * Channel Types
   */
  await db
    .insert(channelTypes)
    .values([
      { code: "OTA", name: "Online Travel Agent" },
      { code: "DIRECT", name: "Direct" }, 
      { code: "ADMIN", name: "Admin" },
      { code: "API", name: "API" },
    ])
    .onConflictDoNothing();

  /**
   * Channel Statuses
   */
  await db
    .insert(channelStatuses)
    .values([
      { code: "ACTIVE", name: "Active" },
      { code: "INACTIVE", name: "Inactive" },
      { code: "SUSPENDED", name: "Suspended" },
      { code: "DEPRECATED", name: "Deprecated" },
    ])
    .onConflictDoNothing();

  /*
   * Active Channel Status - needed for channels seeding
   */
  const [statusActive] = await db
    .select()
    .from(channelStatuses)
    .where(eq(channelStatuses.code, "ACTIVE"))
    .limit(1);

  if (!statusActive) {
    throw new Error("Active channel status seed failed");
  }

  /*
   * OTA Channel Type - needed for channels seeding
   */
  const [typesOta] = await db
    .select()
    .from(channelTypes)
    .where(eq(channelTypes.code, "OTA"))
    .limit(1);

  if (!typesOta) {
    throw new Error("OTA channel type seed failed");
  }

  /*
   * ADMIN Channel Type - needed for channels seeding
   */
  const [typesAdmin] = await db
    .select()
    .from(channelTypes)
    .where(eq(channelTypes.code, "ADMIN"))
    .limit(1);

  if (!typesAdmin) {
    throw new Error("ADMIN channel type seed failed");
  }

  /*
   * DIRECT Channel Type - needed for channels seeding
   */
  const [typesDirect] = await db
    .select()
    .from(channelTypes)
    .where(eq(channelTypes.code, "DIRECT"))
    .limit(1);

  if (!typesDirect) {
    throw new Error("DIRECT channel type seed failed");
  }


  /**
   * Channels
   */
  await db
    .insert(channels)
    .values([
      { id: 1, code: "AIRBNB", name: "Airbnb", typeId: typesOta.id, statusId: statusActive.id, createdAt: new Date(), updatedAt: new Date() },
      { id: 2, code: "BOOKING", name: "Booking.com", typeId: typesOta.id, statusId: statusActive.id, createdAt: new Date(), updatedAt: new Date() },
      { id: 3, code: "VRBO", name: "Vrbo", typeId: typesOta.id, statusId: statusActive.id, createdAt: new Date(), updatedAt: new Date() },
      { id: 4, code: "ADMIN", name: "Administrator", typeId: typesAdmin.id, statusId: statusActive.id, createdAt: new Date(), updatedAt: new Date() },
      { id: 5, code: "DIRECT", name: "DirectChannel", typeId: typesDirect.id, statusId: statusActive.id, createdAt: new Date(), updatedAt: new Date() },
    ])
    .onConflictDoNothing();
}

async function seedMovementTypes() {
  await db
    .insert(movementTypes)
    .values([
      { code: "reservation"},
      { code: "maintenance"}, 
      { code: "owner_hold"},
      { code: "blocked"},
      { code: "reactivated"},
      { code: "cleaning"},
      { code: "inspection"},
    ])
    .onConflictDoNothing();
}

  async function seedInventoryLockStatuses() {
    await db
      .insert(inventoryLockStatuses)
      .values([
        { code: "ACTIVE", name: "Active" },
        { code: "RELEASED", name: "Released" },
        { code: "EXPIRED", name: "Expired" },
        { code: "CANCELLED", name: "Cancelled" },
      ])
      .onConflictDoNothing();
  }

async function seedLockTypes() {
  await db
    .insert(inventoryLockTypes)
    .values([
      { code: "TEMP_HOLD", name: "Temporary Hold" },
      { code: "RESERVATION", name: "Reservation Lock" },
      { code: "OWNER_BLOCK", name: "Owner Block" },
      { code: "MAINTENANCE_BLOCK", name: "Maintenance Block" },
    ])
    .onConflictDoNothing();
}