export interface SalesRow {
    cPk: string;
    hPk: string;
    vPk: string;
    invoice: string;
    name: string;
    numberOfPeople: number;
    checkIn: string;
    checkOut: string;
    tripCost: number;
    tripPayment: number;
    clientBalance: number;
    hotelName: string;
    hotelCost: number;
    hotelPayment: number;
    hotelBalance: number;
    refNumber: string;
    paymentDate: string;
    park: number;
    transport: number;
    visa: number;
    water: number;
    sgr: number;
    flight: number;
    transfer: number;
    excursion: number;
    paidToSupplier: number;
    profit: number;
    profitLoss: string;
    isTripComplete: boolean;
  }