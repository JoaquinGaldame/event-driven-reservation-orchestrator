export type ProcessPaymentCommand = {
    reservationId: number;
    guestId: number;
    currencyCode: string;
    amount: number;
    correlationId: string;
    causationId: string;
};