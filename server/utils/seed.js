const mongoose = require('mongoose');
const dns = require('dns');
const dotenv = require('dotenv');
dotenv.config();

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (dnsErr) {
  console.warn('[DNS Config Warning]: Could not override default DNS servers', dnsErr.message);
}


const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Payment = require('../models/Payment');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/vehicle_booking';

// 12 Vehicles strictly matched to their photo visuals
const photoMatchedVehicles = [
  {
    vehicleNumber: 'MH02CB1234',
    brand: 'Volvo',
    model: 'S60 T8 Recharge',
    type: 'Car',
    category: 'Luxury',
    description: 'Sleek white luxury Swedish sedan with T8 plug-in hybrid powertrain, ambient studio lighting, and Bowers & Wilkins sound.',
    pricePerDay: 4500,
    fuelType: 'Hybrid',
    transmission: 'Automatic',
    seatingCapacity: 5,
    imageUrl: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=1200&q=80',
    status: 'AVAILABLE'
  },
  {
    vehicleNumber: 'KA01MJ5678',
    brand: 'Kia',
    model: 'Seltos GTX+ 4WD',
    type: 'SUV',
    category: 'SUV',
    description: 'White all-terrain crossover SUV featuring panoramic sunroof, ventilated leather seats, and smart 4WD drive modes.',
    pricePerDay: 2800,
    fuelType: 'Diesel',
    transmission: 'Automatic',
    seatingCapacity: 5,
    imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
    status: 'AVAILABLE'
  },
  {
    vehicleNumber: 'DL03CC9012',
    brand: 'Volkswagen',
    model: 'Polo GTI Turbo',
    type: 'Car',
    category: 'Hatchback',
    description: 'Sporty metallic blue hot hatchback with TSI turbo engine, dual exhaust, and sport tuned suspension.',
    pricePerDay: 1800,
    fuelType: 'Petrol',
    transmission: 'Manual',
    seatingCapacity: 5,
    imageUrl: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80',
    status: 'AVAILABLE'
  },
  {
    vehicleNumber: 'TN07AX3456',
    brand: 'Mazda',
    model: 'MX-5 Miata Roadster',
    type: 'Car',
    category: 'Luxury',
    description: 'Vibrant red 2-seater convertible roadster offering lightweight sports handling and open-top driving.',
    pricePerDay: 5500,
    fuelType: 'Petrol',
    transmission: 'Manual',
    seatingCapacity: 2,
    imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
    status: 'AVAILABLE'
  },
  {
    vehicleNumber: 'DL01BY7890',
    brand: 'BMW',
    model: 'M5 Competition',
    type: 'Car',
    category: 'Luxury',
    description: 'High-performance white BMW M sedan powered by a 4.4L M TwinPower Turbo V8 delivering 617 HP.',
    pricePerDay: 9500,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    seatingCapacity: 5,
    imageUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80',
    status: 'AVAILABLE'
  },
  {
    vehicleNumber: 'HR26DQ1234',
    brand: 'Jeep',
    model: 'Grand Cherokee Summit',
    type: 'SUV',
    category: 'SUV',
    description: 'Full-size white luxury 4x4 SUV built for snowy mountain roads and desert highway cruising.',
    pricePerDay: 4200,
    fuelType: 'Diesel',
    transmission: 'Automatic',
    seatingCapacity: 5,
    imageUrl: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=80',
    status: 'AVAILABLE'
  },
  {
    vehicleNumber: 'MH12EV5678',
    brand: 'Land Rover',
    model: 'Range Rover Sport SVR',
    type: 'SUV',
    category: 'SUV',
    description: 'Aggressive blacked-out Range Rover Sport SVR with supercharged V8, active exhaust, and luxury air suspension.',
    pricePerDay: 8800,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    seatingCapacity: 5,
    imageUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80',
    status: 'AVAILABLE'
  },
  {
    vehicleNumber: 'MH01LU9012',
    brand: 'Mercedes-Benz',
    model: 'Mercedes-AMG GT R',
    type: 'Car',
    category: 'Luxury',
    description: 'Exotic matte grey AMG GT R coupe featuring carbon fiber aerodynamics, ceramic brakes, and 577 HP V8 biturbo.',
    pricePerDay: 15000,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    seatingCapacity: 2,
    imageUrl: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80',
    status: 'AVAILABLE'
  },
  {
    vehicleNumber: 'KA05EV0001',
    brand: 'Tesla',
    model: 'Model 3 Performance',
    type: 'Car',
    category: 'Electric',
    description: 'White Tesla Model 3 all-electric sedan featuring dual-motor AWD, glass canopy roof, and autopilot computer.',
    pricePerDay: 6500,
    fuelType: 'Electric',
    transmission: 'Automatic',
    seatingCapacity: 5,
    imageUrl: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1200&q=80',
    status: 'AVAILABLE'
  },
  {
    vehicleNumber: 'DL08AD6000',
    brand: 'Hyundai',
    model: 'Tucson Signature 4WD',
    type: 'SUV',
    category: 'SUV',
    description: 'White premium Hyundai Tucson SUV with parametric hidden lights, HTRAC 4WD system, and Level-2 ADAS safety.',
    pricePerDay: 3200,
    fuelType: 'Diesel',
    transmission: 'Automatic',
    seatingCapacity: 5,
    imageUrl: 'https://images.unsplash.com/photo-1610768764270-790fefe1a116?auto=format&fit=crop&w=1200&q=80',
    status: 'AVAILABLE'
  },
  {
    vehicleNumber: 'KA03FD5678',
    brand: 'Porsche',
    model: 'Panamera Turbo S',
    type: 'Car',
    category: 'Luxury',
    description: 'Sleek black Porsche Panamera luxury sports saloon with retractable rear wing and twin-turbo V8 engine.',
    pricePerDay: 11000,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    seatingCapacity: 4,
    imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
    status: 'AVAILABLE'
  },
  {
    vehicleNumber: 'TN09BK1234',
    brand: 'Harley-Davidson',
    model: 'LiveWire Electric Superbike',
    type: 'Bike',
    category: 'Bike',
    description: 'Striking orange and black Harley-Davidson LiveWire electric motorcycle delivering instant acceleration and SHOWA suspension.',
    pricePerDay: 2200,
    fuelType: 'Electric',
    transmission: 'Automatic',
    seatingCapacity: 2,
    imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80',
    status: 'AVAILABLE'
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('[Seed]: Connected to MongoDB...');

    // Clear existing data
    await User.deleteMany({});
    await Vehicle.deleteMany({});
    await Booking.deleteMany({});
    await Review.deleteMany({});
    await Payment.deleteMany({});
    console.log('[Seed]: Cleared existing collections');

    // Create Admin User
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@vehicle.com',
      phone: '9876543210',
      password: 'admin123',
      address: 'Admin Headquarters, Tech Park',
      role: 'ADMIN',
      status: 'ACTIVE'
    });

    // Create Customer User
    const customerUser = await User.create({
      name: 'John Doe',
      email: 'customer@vehicle.com',
      phone: '9123456789',
      password: 'customer123',
      address: '123 Innovation Street, Cyber City',
      role: 'CUSTOMER',
      status: 'ACTIVE'
    });

    // Create Driver 1
    const driver1 = await User.create({
      name: 'Rajesh Kumar',
      email: 'driver1@vehicle.com',
      phone: '9988776655',
      password: 'driver123',
      address: 'Sector 14, Metro Station',
      role: 'DRIVER',
      driverStatus: 'AVAILABLE',
      rating: 4.9,
      status: 'ACTIVE'
    });

    // Create Driver 2
    const driver2 = await User.create({
      name: 'Suresh Sharma',
      email: 'driver2@vehicle.com',
      phone: '9876123456',
      password: 'driver234',
      address: 'Central Bus Stand Road',
      role: 'DRIVER',
      driverStatus: 'AVAILABLE',
      rating: 4.8,
      status: 'ACTIVE'
    });

    console.log('[Seed]: Created Admin, Customer, and Driver accounts');

    // Seed Vehicles
    const vehicles = await Vehicle.insertMany(photoMatchedVehicles);
    console.log(`[Seed]: Inserted ${vehicles.length} photo-matched vehicles`);

    // Create Sample Booking (With Driver)
    const kiaSeltos = vehicles[1];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 2);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 3);

    const sampleBooking = await Booking.create({
      bookingReference: 'BK-MATCH-001',
      userId: customerUser._id,
      vehicleId: kiaSeltos._id,
      bookingType: 'WITH_DRIVER',
      driverId: null, // Unassigned: broadcast to ALL drivers
      driverFee: 1500,
      startDate,
      endDate,
      pickupLocation: 'Airport Terminal 2',
      dropLocation: 'Grand Hyatt Hotel',
      totalAmount: 9900,
      status: 'CONFIRMED'
    });

    // Create a 2nd Broadcast Sample Booking
    const sampleBooking2 = await Booking.create({
      bookingReference: 'BK-MATCH-002',
      userId: customerUser._id,
      vehicleId: vehicles[0]._id, // Volvo S60
      bookingType: 'WITH_DRIVER',
      driverId: null, // Unassigned: broadcast to ALL drivers
      driverFee: 2000,
      startDate: new Date(Date.now() + 86400000 * 5),
      endDate: new Date(Date.now() + 86400000 * 8),
      pickupLocation: 'Tech Park Tower B',
      dropLocation: 'International Convention Center',
      totalAmount: 15500,
      status: 'CONFIRMED'
    });

    await Payment.create({
      bookingId: sampleBooking._id,
      amount: 9900,
      paymentMethod: 'CREDIT_CARD',
      paymentStatus: 'SUCCESS',
      transactionReference: 'TXN-MATCH-001',
      paidAt: new Date()
    });

    // Create Sample Review
    await Review.create({
      userId: customerUser._id,
      vehicleId: kiaSeltos._id,
      bookingId: sampleBooking._id,
      rating: 5,
      comment: 'Superb vehicle! The Kia Seltos GTX+ was clean and driver Rajesh Kumar was extremely polite.'
    });

    console.log('[Seed]: Created sample booking with driver, payment, and review');
    console.log('\n====== SEED DATA SUMMARY ======');
    console.log('ADMIN LOGIN    : admin@vehicle.com / admin123');
    console.log('CUSTOMER LOGIN : customer@vehicle.com / customer123');
    console.log('DRIVER 1 LOGIN : driver1@vehicle.com / driver123 (Rajesh Kumar)');
    console.log('DRIVER 2 LOGIN : driver2@vehicle.com / driver234 (Suresh Sharma)');
    console.log('===============================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedDB();
