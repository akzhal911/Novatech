import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Ensure data directory exists
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_FILE = path.join(DATA_DIR, 'database.json');

// Secret for HMAC session tokens
const JWT_SECRET = process.env.SESSION_SECRET || 'novatech-super-secure-production-jwt-token-2026';

function signToken(payload: object): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

function verifyToken(token: string): any | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const expectedSignature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
    if (signature !== expectedSignature) return null;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (payload.exp && payload.exp < Date.now()) return null;
    return payload;
  } catch (err) {
    return null;
  }
}

// Initial seed data
const initialProducts = [
  {
    id: "nova-phone-ultra-x",
    name: "NovaPhone Ultra X Titanium",
    brand: "NOVATECH",
    category: "Smartphones",
    price: 1399,
    oldPrice: 1549,
    description: "Forged in Grade 5 aerospace titanium with an ultra-responsive 6.8-inch Dynamic AMOLED 165Hz edge-to-edge display. Powered by the NovaSilicon Quantum M3 chip with integrated neural coprocessor and quad-lens periscope optic array capable of 8K spatial video recording.",
    images: [
      "/src/assets/images/hero_flagship_device_1793628017947.jpg",
      "/src/assets/images/hero_flagship_device_1793628017947.jpg"
    ],
    specs: {
      "Processor": "NovaSilicon Quantum M3 (3nm Octa-core)",
      "Display": "6.8\" Dynamic AMOLED 165Hz HDR10+ (3200x1440)",
      "Main Camera": "200MP OIS Wide + 50MP Periscope 10x + 50MP Ultra-Wide",
      "Battery": "5500 mAh with 120W HyperCharge",
      "Chassis": "Aerospace Grade 5 Titanium & Ceramic Shield",
      "Operating System": "NovaOS 4.0 (Zero-bloatware)"
    },
    stock: 24,
    rating: 4.95,
    reviewsCount: 142,
    colors: ["Space Titanium", "Obsidian Black", "Arctic Silver", "Deep Cyan"],
    configurations: [
      { name: "256GB / 12GB RAM", priceDiff: 0 },
      { name: "512GB / 16GB RAM", priceDiff: 150 },
      { name: "1TB / 24GB RAM Special Edition", priceDiff: 320 }
    ],
    isPublished: true,
    featured: true,
    isNew: true,
    isSpecialOffer: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "nova-book-titan-pro",
    name: "NovaBook Titan Pro M4",
    brand: "NOVATECH",
    category: "Laptops",
    price: 2499,
    oldPrice: 2799,
    description: "The definitive mobile workstation engineered for creative professionals, developers, and computational scientists. Features a Liquid Retina XDR 16-inch display, active thermal vapor chamber, studio-grade DAC audio, and 24-hour battery endurance.",
    images: [
      "/src/assets/images/laptop_titan_pro_1793627891214.jpg"
    ],
    specs: {
      "Processor": "NovaTitan M4 Max 16-Core CPU / 40-Core GPU",
      "Display": "16.2\" Liquid Retina XDR Mini-LED 1600 nits 120Hz",
      "Memory": "32GB Unified Ultra-Speed 8533MHz LPDDR5X",
      "Storage": "1TB PCIe Gen5 NVMe (up to 14,000 MB/s)",
      "Battery": "99.8 Wh (Up to 24 Hours Runtime)",
      "Ports": "3x Thunderbolt 5, HDMI 2.1, SD Express, MagCharge"
    },
    stock: 15,
    rating: 4.98,
    reviewsCount: 89,
    colors: ["Space Gray", "Starlight Silver"],
    configurations: [
      { name: "32GB RAM / 1TB SSD", priceDiff: 0 },
      { name: "64GB RAM / 2TB SSD", priceDiff: 450 },
      { name: "128GB RAM / 4TB SSD Extreme", priceDiff: 950 }
    ],
    isPublished: true,
    featured: true,
    isNew: true,
    isSpecialOffer: false,
    createdAt: new Date().toISOString()
  },
  {
    id: "nova-wave-studio-anc",
    name: "NovaWave Studio Pro ANC",
    brand: "NovaAcoustics",
    category: "Headphones",
    price: 499,
    oldPrice: 599,
    description: "Audiophile reference headphones with 50mm custom beryllium drivers and lossless high-resolution wireless streaming. Features real-time adaptive hybrid active noise cancellation sampling ambient acoustics 50,000 times per second.",
    images: [
      "/src/assets/images/headphones_studio_anc_1793627892404.jpg"
    ],
    specs: {
      "Acoustic Driver": "50mm Pure Beryllium Dynamic Drivers",
      "Frequency Response": "5 Hz - 48,000 Hz Hi-Res Certified",
      "Noise Cancellation": "Dual Hybrid ANC with 8 Beamforming Mics",
      "Battery Life": "50 Hours (ANC On) / 70 Hours (ANC Off)",
      "Connectivity": "Bluetooth 5.4 LE Audio, LDAC, aptX Lossless, 3.5mm Gold Jack",
      "Materials": "Brushed Steel, Memory Foam, Lambskin Leather"
    },
    stock: 42,
    rating: 4.91,
    reviewsCount: 215,
    colors: ["Midnight Black", "Brushed Titanium", "Silver Frost"],
    configurations: [
      { name: "Standard Audiophile Kit", priceDiff: 0 },
      { name: "Studio Pro Bundle (+ Balanced 4.4mm Cable & Hard Case)", priceDiff: 70 }
    ],
    isPublished: true,
    featured: true,
    isNew: false,
    isSpecialOffer: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "nova-chronos-titanium",
    name: "NovaChronos Titanium Chronograph",
    brand: "NOVATECH",
    category: "Smart Watches",
    price: 799,
    oldPrice: 899,
    description: "Luxury Swiss-inspired industrial craftsmanship infused with cutting-edge medical telemetry. Solid milled Grade 5 titanium housing with diamond-like carbon sapphire glass and dual-frequency L1/L5 GPS.",
    images: [
      "/src/assets/images/smartwatch_chronos_titanium_1793627892590.jpg"
    ],
    specs: {
      "Display": "1.5\" Sapphire AMOLED Always-On (2000 nits peak)",
      "Sensors": "ECG, Photoplethysmography, Blood Oxygen, Skin Temp, Depth Gauge",
      "Water Resistance": "100m / 10 ATM Diving Certified (EN13319)",
      "Battery": "Up to 14 Days Ultra-Mode / 5 Days Full Telemetry",
      "Connectivity": "Cellular eSIM LTE, Dual GPS L1/L5, NFC Pay",
      "Case": "46mm Brushed Grade 5 Titanium with Link Bracelet"
    },
    stock: 28,
    rating: 4.94,
    reviewsCount: 167,
    colors: ["Brushed Titanium", "Matte Obsidian DLC"],
    configurations: [
      { name: "Titanium Link Bracelet", priceDiff: 0 },
      { name: "Dual Pack (Titanium Link + Fluoroelastomer Sport Band)", priceDiff: 60 }
    ],
    isPublished: true,
    featured: true,
    isNew: true,
    isSpecialOffer: false,
    createdAt: new Date().toISOString()
  },
  {
    id: "nova-vortex-gaming-rig",
    name: "NovaStation Vortex Cyber Rig",
    brand: "NovaGaming",
    category: "Gaming",
    price: 1099,
    oldPrice: 1249,
    description: "Next-gen flagship handheld gaming console with desktop-grade AMD Ryzen AI 9 architecture, 8.4-inch 144Hz OLED panel, Hall-effect magnetic joysticks, and vapor chamber cooling for sustained triple-A fidelity.",
    images: [
      "/src/assets/images/gaming_rig_vortex_1793628039167.jpg"
    ],
    specs: {
      "APU": "AMD Ryzen AI 9 HX 370 (12 Cores, 24 Threads)",
      "Graphics": "Radeon 890M RDNA 3.5 Architecture",
      "Display": "8.4\" OLED 2.5K 144Hz VRR 100% DCI-P3",
      "RAM": "32GB LPDDR5X-7500 dual-channel",
      "Controls": "Magnetic Hall-Effect Analog Joysticks & Triggers",
      "Battery": "80 Wh with 100W GaN Fast Charging"
    },
    stock: 19,
    rating: 4.88,
    reviewsCount: 94,
    colors: ["Cyber Stealth Black"],
    configurations: [
      { name: "1TB NVMe SSD", priceDiff: 0 },
      { name: "2TB NVMe SSD + Pro Dock", priceDiff: 180 }
    ],
    isPublished: true,
    featured: false,
    isNew: true,
    isSpecialOffer: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "nova-pad-liquid-pro",
    name: "NovaPad Liquid Retina 13 Pro",
    brand: "NOVATECH",
    category: "Tablets",
    price: 1199,
    oldPrice: 1299,
    description: "Only 5.1mm ultra-thin architectural slate featuring Tandem OLED display technology with extraordinary contrast and color fidelity. Includes wireless magnetic magnetic charging for the NovaPen 3.",
    images: [
      "/src/assets/images/tablet_liquid_pro_1793628039684.jpg"
    ],
    specs: {
      "Display": "13.0\" Tandem OLED Ultra Retina 120Hz ProMotion (1600 nits)",
      "Processor": "NovaSilicon Quantum M3 Tablet Edition",
      "Thickness": "5.1 mm Ultra-Slim Aerospace Aluminum",
      "Audio": "4-Speaker Spatial Acoustic Array with Studio Mics",
      "Stylus Support": "NovaPen 3 with Haptic Feedback (Magnetic Snap)",
      "Cameras": "12MP Center Stage Ultra-Wide + LiDAR Scanner"
    },
    stock: 22,
    rating: 4.93,
    reviewsCount: 112,
    colors: ["Titanium Silver", "Space Charcoal"],
    configurations: [
      { name: "256GB Wi-Fi 7", priceDiff: 0 },
      { name: "512GB Wi-Fi 7 + 5G Cellular", priceDiff: 220 },
      { name: "1TB Wi-Fi 7 + 5G + Nano-Texture Glass", priceDiff: 450 }
    ],
    isPublished: true,
    featured: false,
    isNew: false,
    isSpecialOffer: false,
    createdAt: new Date().toISOString()
  },
  {
    id: "nova-cinema-8k",
    name: "NovaCinema CineMaster 8K Full-Frame",
    brand: "NovaOptics",
    category: "Cameras",
    price: 3899,
    oldPrice: 4200,
    description: "Cinema-grade 8K RAW video capture camera with 16+ stops of dynamic range, internal electronically controlled ND filters (2 to 7 stops), dual native ISO, and professional SDI & XLR audio interfaces.",
    images: [
      "/src/assets/images/camera_cinema_8k_1793628041923.jpg"
    ],
    specs: {
      "Sensor": "Full-Frame 35mm BSI CMOS 45.7 Megapixels",
      "Video Formats": "8K DCI 60p RAW 12-bit Internal, 4K 120p ProRes",
      "Dynamic Range": "16+ Stops with Dual Native ISO 800 / 3200",
      "ND Filters": "Built-in Electronic Variable ND 0.6 to 2.1",
      "Media": "Dual CFexpress Type B Slots",
      "Mount": "Universal Interchangeable Cine Mount (PL / E / L)"
    },
    stock: 8,
    rating: 4.97,
    reviewsCount: 63,
    colors: ["Matte Tactical Black"],
    configurations: [
      { name: "Body Only", priceDiff: 0 },
      { name: "Production Kit (+ 35mm T1.5 Cine Prime Lens)", priceDiff: 990 }
    ],
    isPublished: true,
    featured: true,
    isNew: true,
    isSpecialOffer: false,
    createdAt: new Date().toISOString()
  },
  {
    id: "nova-hyper-dock-gan",
    name: "NovaHyper Thunderbolt 4 14-in-1 Dock & GaN",
    brand: "NOVATECH",
    category: "Accessories",
    price: 289,
    oldPrice: 349,
    description: "Sculpted from a single block of space-gray anodized aluminum. Delivers 140W GaN power delivery to charge laptops and peripherals while outputting up to dual 8K 60Hz displays via Thunderbolt 4.",
    images: [
      "/src/assets/images/accessories_gan_dock_1793628040358.jpg"
    ],
    specs: {
      "Ports": "3x Thunderbolt 4, 4x USB-A 10Gbps, 1x HDMI 2.1, 1x DP 2.1, 2.5G Ethernet, SD 4.0, Audio Combo",
      "Power Delivery": "140W GaN III Fast Charge for Host Laptop",
      "Display Support": "Up to 2x 8K @ 60Hz or 3x 4K @ 144Hz",
      "Chassis": "CNC Milled Aluminum Heat Dissipation Body",
      "Protection": "Active Over-voltage, Over-current & Thermal Throttling"
    },
    stock: 65,
    rating: 4.89,
    reviewsCount: 184,
    colors: ["Space Gray"],
    configurations: [
      { name: "Standard Dock + 140W GaN Brick", priceDiff: 0 },
      { name: "Pro Bundle (+ 2m Thunderbolt 4 Braided Cable)", priceDiff: 39 }
    ],
    isPublished: true,
    featured: false,
    isNew: false,
    isSpecialOffer: true,
    createdAt: new Date().toISOString()
  }
];

const initialReviews = [
  {
    id: "rev-1",
    productId: "nova-phone-ultra-x",
    userName: "Alexander Vance (Zurich)",
    rating: 5,
    date: "2026-10-14",
    comment: "The titanium finish and camera array are unmatched. The low-light optical clarity beats anything else on the market. Zero lag in NovaOS.",
    verified: true
  },
  {
    id: "rev-2",
    productId: "nova-phone-ultra-x",
    userName: "Elena Rostova (Dubai)",
    rating: 5,
    date: "2026-10-22",
    comment: "Astonishing craftsmanship. Battery easily lasts 2 full days under heavy multitasking. Shipping to UAE took only 48 hours.",
    verified: true
  },
  {
    id: "rev-3",
    productId: "nova-book-titan-pro",
    userName: "Marcus Thorne (San Francisco)",
    rating: 5,
    date: "2026-10-18",
    comment: "Compiles massive machine learning models and 8K timelines silently without thermal throttling. The keyboard feel is perfection.",
    verified: true
  },
  {
    id: "rev-4",
    productId: "nova-wave-studio-anc",
    userName: "Julian K. (London)",
    rating: 5,
    date: "2026-10-27",
    comment: "Studio reference tuning with pure beryllium drivers. The soundstage separation and instrument timbre are breathtaking.",
    verified: true
  }
];

const initialOrders = [
  {
    id: "ord-1001",
    orderNumber: "NV-892401",
    createdAt: "2026-11-01T14:22:00.000Z",
    customer: {
      fullName: "Dmitriy Romanov",
      email: "d.romanov@enterprise.eu",
      phone: "+49 170 555 8920",
      country: "Germany",
      city: "Berlin",
      address: "Friedrichstraße 142",
      postalCode: "10117"
    },
    items: [
      {
        productId: "nova-phone-ultra-x",
        name: "NovaPhone Ultra X Titanium",
        image: "/src/assets/images/hero_flagship_device_1793628017947.jpg",
        quantity: 1,
        pricePerUnit: 1549,
        selectedColor: "Space Titanium",
        selectedConfig: "512GB / 16GB RAM"
      }
    ],
    subtotal: 1549,
    shippingCost: 0,
    discount: 100,
    total: 1449,
    currency: "USD",
    status: "Processing",
    paymentMethod: "Credit Card (Demo Mode)",
    paymentStatus: "Verified"
  },
  {
    id: "ord-1002",
    orderNumber: "NV-892402",
    createdAt: "2026-11-02T02:15:00.000Z",
    customer: {
      fullName: "Arman Sadykov",
      email: "arman.sadykov@tech.kz",
      phone: "+7 777 450 1234",
      country: "Kazakhstan",
      city: "Almaty",
      address: "Dostyk Avenue 180, Apt 45",
      postalCode: "050051"
    },
    items: [
      {
        productId: "nova-book-titan-pro",
        name: "NovaBook Titan Pro M4",
        image: "/src/assets/images/laptop_titan_pro_1793627891214.jpg",
        quantity: 1,
        pricePerUnit: 2499,
        selectedColor: "Space Gray",
        selectedConfig: "32GB RAM / 1TB SSD"
      },
      {
        productId: "nova-wave-studio-anc",
        name: "NovaWave Studio Pro ANC",
        image: "/src/assets/images/headphones_studio_anc_1793627892404.jpg",
        quantity: 1,
        pricePerUnit: 499,
        selectedColor: "Midnight Black"
      }
    ],
    subtotal: 2998,
    shippingCost: 0,
    discount: 0,
    total: 2998,
    currency: "USD",
    status: "Pending",
    paymentMethod: "Apple Pay (Demo Mode)",
    paymentStatus: "Verified"
  }
];

const initialLogs = [
  {
    id: "log-1",
    type: "order",
    message: "New order NV-892402 received from Arman Sadykov ($2,998)",
    timestamp: "2026-11-02T02:15:00.000Z"
  },
  {
    id: "log-2",
    type: "order",
    message: "Order NV-892401 status updated to Processing",
    timestamp: "2026-11-01T15:30:00.000Z"
  },
  {
    id: "log-3",
    type: "product_added",
    message: "Flagship catalog synchronized with 8 premium categories",
    timestamp: "2026-11-01T10:00:00.000Z"
  }
];

function loadDatabase() {
  if (!fs.existsSync(DB_FILE)) {
    const initialData = {
      products: initialProducts,
      reviews: initialReviews,
      orders: initialOrders,
      customers: [],
      activityLogs: initialLogs
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading database, resetting to fallback', err);
    return {
      products: initialProducts,
      reviews: initialReviews,
      orders: initialOrders,
      customers: [],
      activityLogs: initialLogs
    };
  }
}

function saveDatabase(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save database', err);
  }
}

// Authentication Middleware
function authenticateAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Admin authentication required' });
  }
  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload || payload.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Valid administrative privileges required' });
  }
  (req as any).adminUser = payload;
  next();
}

function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    if (payload) {
      (req as any).user = payload;
    }
  }
  next();
}

// ================= API ROUTES =================

// 1. ADMIN AUTHENTICATION
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username/email and password are required' });
  }

  // Exact credentials required by the store owner:
  // Login: akzhal.a
  // Password: akzhal2010
  const normalizedUser = username.trim().toLowerCase();
  const isAdminUser =
    normalizedUser === 'akzhal.a' ||
    normalizedUser === 'akzhal.a@novatech.store' ||
    normalizedUser === 'aibekulyy9130@gmail.com';

  const isPasswordValid = password === 'akzhal2010';

  if (!isAdminUser || !isPasswordValid) {
    return res.status(401).json({ error: 'Invalid administrator credentials' });
  }

  const token = signToken({
    username: 'akzhal.a',
    role: 'admin',
    name: 'Store Administrator'
  });

  return res.json({
    success: true,
    token,
    user: {
      username: 'akzhal.a',
      role: 'admin',
      fullName: 'Store Owner (akzhal.a)'
    }
  });
});

app.get('/api/admin/verify', authenticateAdmin, (req: Request, res: Response) => {
  return res.json({
    valid: true,
    user: (req as any).adminUser
  });
});

// Admin Analytics & Stats
app.get('/api/admin/stats', authenticateAdmin, (req: Request, res: Response) => {
  const db = loadDatabase();
  const totalRevenue = db.orders
    .filter((o: any) => o.status !== 'Cancelled')
    .reduce((sum: number, o: any) => sum + (o.total || 0), 0);

  const totalOrders = db.orders.length;
  const totalProducts = db.products.length;
  const lowStockCount = db.products.filter((p: any) => p.stock < 10).length;

  // Calculate top selling products
  const productSalesMap = new Map<string, { count: number; rev: number }>();
  for (const order of db.orders) {
    if (order.status !== 'Cancelled') {
      for (const item of order.items || []) {
        const current = productSalesMap.get(item.productId) || { count: 0, rev: 0 };
        current.count += item.quantity;
        current.rev += item.pricePerUnit * item.quantity;
        productSalesMap.set(item.productId, current);
      }
    }
  }

  const topSellingProducts = Array.from(productSalesMap.entries())
    .map(([productId, stats]) => {
      const product = db.products.find((p: any) => p.id === productId);
      return {
        product: product || { id: productId, name: 'Product ' + productId, price: 0 },
        unitsSold: stats.count,
        revenue: stats.rev
      };
    })
    .sort((a, b) => b.unitsSold - a.unitsSold)
    .slice(0, 5);

  return res.json({
    totalRevenue,
    totalOrders,
    totalProducts,
    lowStockCount,
    recentOrders: db.orders.slice(-5).reverse(),
    topSellingProducts,
    activityLogs: (db.activityLogs || []).slice(-15).reverse()
  });
});

// 2. CUSTOMER AUTHENTICATION
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { email, password, fullName, phone, address, city, country } = req.body;
  if (!email || !password || !fullName) {
    return res.status(400).json({ error: 'Email, password, and full name are required' });
  }

  const db = loadDatabase();
  const existing = (db.customers || []).find((c: any) => c.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'An account with this email address already exists' });
  }

  // Hash password using sha256 + salt
  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = crypto.scryptSync(password, salt, 64).toString('hex') + ':' + salt;

  const newCustomer = {
    id: 'cust-' + Date.now(),
    email: email.trim().toLowerCase(),
    passwordHash,
    fullName: fullName.trim(),
    phone: phone || '',
    address: address || '',
    city: city || '',
    country: country || 'United States',
    role: 'customer',
    createdAt: new Date().toISOString()
  };

  db.customers = db.customers || [];
  db.customers.push(newCustomer);
  saveDatabase(db);

  const token = signToken({
    id: newCustomer.id,
    email: newCustomer.email,
    fullName: newCustomer.fullName,
    role: 'customer'
  });

  return res.status(201).json({
    success: true,
    token,
    user: {
      id: newCustomer.id,
      email: newCustomer.email,
      fullName: newCustomer.fullName,
      phone: newCustomer.phone,
      address: newCustomer.address,
      city: newCustomer.city,
      country: newCustomer.country,
      role: 'customer'
    }
  });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const db = loadDatabase();
  const customer = (db.customers || []).find((c: any) => c.email.toLowerCase() === email.toLowerCase().trim());
  if (!customer) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const [storedHash, salt] = customer.passwordHash.split(':');
  const verifyHash = crypto.scryptSync(password, salt, 64).toString('hex');
  if (storedHash !== verifyHash) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = signToken({
    id: customer.id,
    email: customer.email,
    fullName: customer.fullName,
    role: 'customer'
  });

  return res.json({
    success: true,
    token,
    user: {
      id: customer.id,
      email: customer.email,
      fullName: customer.fullName,
      phone: customer.phone,
      address: customer.address,
      city: customer.city,
      country: customer.country,
      role: 'customer'
    }
  });
});

app.get('/api/auth/profile', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token' });
  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: 'Invalid token' });

  const db = loadDatabase();
  const customer = (db.customers || []).find((c: any) => c.id === payload.id);
  if (!customer) {
    return res.json({
      id: payload.id,
      email: payload.email,
      fullName: payload.fullName || 'Customer',
      role: 'customer'
    });
  }

  return res.json({
    id: customer.id,
    email: customer.email,
    fullName: customer.fullName,
    phone: customer.phone,
    address: customer.address,
    city: customer.city,
    country: customer.country,
    role: 'customer'
  });
});

app.put('/api/auth/profile', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token' });
  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: 'Invalid token' });

  const { fullName, phone, address, city, country } = req.body;
  const db = loadDatabase();
  const customerIndex = (db.customers || []).findIndex((c: any) => c.id === payload.id);

  if (customerIndex !== -1) {
    db.customers[customerIndex].fullName = fullName || db.customers[customerIndex].fullName;
    db.customers[customerIndex].phone = phone !== undefined ? phone : db.customers[customerIndex].phone;
    db.customers[customerIndex].address = address !== undefined ? address : db.customers[customerIndex].address;
    db.customers[customerIndex].city = city !== undefined ? city : db.customers[customerIndex].city;
    db.customers[customerIndex].country = country !== undefined ? country : db.customers[customerIndex].country;
    saveDatabase(db);
    return res.json({ success: true, user: db.customers[customerIndex] });
  }

  return res.status(404).json({ error: 'Customer not found' });
});

// 3. PRODUCTS ENDPOINTS
app.get('/api/products', optionalAuth, (req: Request, res: Response) => {
  const db = loadDatabase();
  const isAdmin = (req as any).user && (req as any).user.role === 'admin';

  let products = [...db.products];

  // If not admin, only show published products
  if (!isAdmin) {
    products = products.filter((p: any) => p.isPublished !== false);
  }

  const { category, brand, search, minPrice, maxPrice, sort, featured } = req.query;

  if (category && category !== 'All') {
    products = products.filter((p: any) => p.category.toLowerCase() === String(category).toLowerCase());
  }

  if (brand && brand !== 'All') {
    products = products.filter((p: any) => p.brand.toLowerCase() === String(brand).toLowerCase());
  }

  if (featured === 'true') {
    products = products.filter((p: any) => p.featured === true);
  }

  if (search) {
    const q = String(search).toLowerCase();
    products = products.filter(
      (p: any) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }

  if (minPrice) {
    products = products.filter((p: any) => p.price >= Number(minPrice));
  }

  if (maxPrice) {
    products = products.filter((p: any) => p.price <= Number(maxPrice));
  }

  if (sort === 'price-asc') {
    products.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-desc') {
    products.sort((a, b) => b.price - a.price);
  } else if (sort === 'rating') {
    products.sort((a, b) => b.rating - a.rating);
  } else {
    // Default newest first
    products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return res.json({ products, total: products.length });
});

app.get('/api/products/:id', (req: Request, res: Response) => {
  const db = loadDatabase();
  const product = db.products.find((p: any) => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  return res.json(product);
});

// Admin: Create Product
app.post('/api/products', authenticateAdmin, (req: Request, res: Response) => {
  const {
    name,
    brand,
    category,
    price,
    oldPrice,
    description,
    images,
    specs,
    stock,
    colors,
    configurations,
    isPublished,
    featured,
    isNew,
    isSpecialOffer
  } = req.body;

  if (!name || !brand || !category || price === undefined) {
    return res.status(400).json({ error: 'Name, brand, category, and price are required fields' });
  }

  const db = loadDatabase();
  const id = 'prod-' + Date.now();

  const newProduct = {
    id,
    name: name.trim(),
    brand: brand.trim(),
    category,
    price: Number(price),
    oldPrice: oldPrice ? Number(oldPrice) : undefined,
    description: description || '',
    images: Array.isArray(images) && images.length > 0 ? images : ['/src/assets/images/hero_flagship_device_1793628017947.jpg'],
    specs: specs || {},
    stock: Number(stock ?? 10),
    rating: 5.0,
    reviewsCount: 0,
    colors: colors || ['Space Titanium', 'Obsidian Black'],
    configurations: configurations || [{ name: 'Standard Edition', priceDiff: 0 }],
    isPublished: isPublished !== false,
    featured: Boolean(featured),
    isNew: Boolean(isNew),
    isSpecialOffer: Boolean(isSpecialOffer),
    createdAt: new Date().toISOString()
  };

  db.products.unshift(newProduct);

  db.activityLogs = db.activityLogs || [];
  db.activityLogs.unshift({
    id: 'log-' + Date.now(),
    type: 'product_added',
    message: `Product added: "${newProduct.name}" ($${newProduct.price}) in category ${newProduct.category}`,
    timestamp: new Date().toISOString()
  });

  saveDatabase(db);
  return res.status(201).json(newProduct);
});

// Admin: Update Product
app.put('/api/products/:id', authenticateAdmin, (req: Request, res: Response) => {
  const db = loadDatabase();
  const index = db.products.findIndex((p: any) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const existing = db.products[index];
  const updated = {
    ...existing,
    ...req.body,
    id: existing.id, // prevent ID change
    price: req.body.price !== undefined ? Number(req.body.price) : existing.price,
    oldPrice: req.body.oldPrice !== undefined ? (req.body.oldPrice ? Number(req.body.oldPrice) : undefined) : existing.oldPrice,
    stock: req.body.stock !== undefined ? Number(req.body.stock) : existing.stock,
    updatedAt: new Date().toISOString()
  };

  db.products[index] = updated;

  db.activityLogs = db.activityLogs || [];
  db.activityLogs.unshift({
    id: 'log-' + Date.now(),
    type: 'product_updated',
    message: `Product updated: "${updated.name}" ($${updated.price})`,
    timestamp: new Date().toISOString()
  });

  saveDatabase(db);
  return res.json(updated);
});

// Admin: Delete Product
app.delete('/api/products/:id', authenticateAdmin, (req: Request, res: Response) => {
  const db = loadDatabase();
  const index = db.products.findIndex((p: any) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const deleted = db.products[index];
  db.products.splice(index, 1);

  db.activityLogs = db.activityLogs || [];
  db.activityLogs.unshift({
    id: 'log-' + Date.now(),
    type: 'product_deleted',
    message: `Product removed from catalog: "${deleted.name}"`,
    timestamp: new Date().toISOString()
  });

  saveDatabase(db);
  return res.json({ success: true, message: 'Product deleted successfully', id: deleted.id });
});

// Reviews Endpoints
app.get('/api/products/:id/reviews', (req: Request, res: Response) => {
  const db = loadDatabase();
  const reviews = (db.reviews || []).filter((r: any) => r.productId === req.params.id);
  return res.json(reviews);
});

app.post('/api/products/:id/reviews', (req: Request, res: Response) => {
  const { userName, rating, comment } = req.body;
  if (!userName || !rating || !comment) {
    return res.status(400).json({ error: 'User name, rating, and comment are required' });
  }

  const db = loadDatabase();
  const product = db.products.find((p: any) => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const newReview = {
    id: 'rev-' + Date.now(),
    productId: req.params.id,
    userName: userName.trim(),
    rating: Math.max(1, Math.min(5, Number(rating))),
    date: new Date().toISOString().split('T')[0],
    comment: comment.trim(),
    verified: true
  };

  db.reviews = db.reviews || [];
  db.reviews.unshift(newReview);

  // Recalculate product rating
  const productReviews = db.reviews.filter((r: any) => r.productId === req.params.id);
  const avgRating = productReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / productReviews.length;
  product.rating = Number(avgRating.toFixed(2));
  product.reviewsCount = productReviews.length;

  saveDatabase(db);
  return res.status(201).json({ review: newReview, productRating: product.rating, reviewsCount: product.reviewsCount });
});

// 4. ORDERS ENDPOINTS
// Customer or Guest creates order
app.post('/api/orders', (req: Request, res: Response) => {
  const { customer, items, subtotal, shippingCost, discount, total, currency, paymentMethod } = req.body;

  if (!customer || !customer.fullName || !customer.email || !customer.address || !items || !items.length) {
    return res.status(400).json({ error: 'Missing customer shipping information or empty order items' });
  }

  const db = loadDatabase();

  // Deduct inventory
  for (const item of items) {
    const product = db.products.find((p: any) => p.id === item.productId);
    if (product) {
      product.stock = Math.max(0, product.stock - (item.quantity || 1));
    }
  }

  const orderNumber = 'NV-' + Math.floor(100000 + Math.random() * 900000);
  const newOrder = {
    id: 'ord-' + Date.now(),
    orderNumber,
    createdAt: new Date().toISOString(),
    customer: {
      fullName: customer.fullName.trim(),
      email: customer.email.trim(),
      phone: customer.phone || '',
      country: customer.country || 'Global',
      city: customer.city || '',
      address: customer.address || '',
      postalCode: customer.postalCode || ''
    },
    items,
    subtotal: Number(subtotal || total),
    shippingCost: Number(shippingCost || 0),
    discount: Number(discount || 0),
    total: Number(total),
    currency: currency || 'USD',
    status: 'Pending',
    paymentMethod: paymentMethod || 'Card (Demo Mode)',
    paymentStatus: 'Demo Mode (Stripe Ready)'
  };

  db.orders.unshift(newOrder);

  db.activityLogs = db.activityLogs || [];
  db.activityLogs.unshift({
    id: 'log-' + Date.now(),
    type: 'order',
    message: `New order ${orderNumber} placed by ${customer.fullName} (${currency || 'USD'} ${total})`,
    timestamp: new Date().toISOString()
  });

  saveDatabase(db);
  return res.status(201).json(newOrder);
});

// Admin: Get all orders
app.get('/api/orders', authenticateAdmin, (req: Request, res: Response) => {
  const db = loadDatabase();
  return res.json({ orders: db.orders || [], total: db.orders.length });
});

// Customer: Get my orders
app.get('/api/orders/my', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const emailQuery = req.query.email as string;

  let customerEmail = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    if (payload && payload.email) {
      customerEmail = payload.email.toLowerCase();
    }
  } else if (emailQuery) {
    customerEmail = emailQuery.toLowerCase().trim();
  }

  if (!customerEmail) {
    return res.status(401).json({ error: 'Provide authentication or email to view orders' });
  }

  const db = loadDatabase();
  const myOrders = (db.orders || []).filter((o: any) => o.customer.email.toLowerCase() === customerEmail);
  return res.json({ orders: myOrders });
});

// Admin: Update order status
app.patch('/api/orders/:id/status', authenticateAdmin, (req: Request, res: Response) => {
  const { status } = req.body;
  const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }

  const db = loadDatabase();
  const order = (db.orders || []).find((o: any) => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const oldStatus = order.status;
  order.status = status;
  order.updatedAt = new Date().toISOString();

  db.activityLogs = db.activityLogs || [];
  db.activityLogs.unshift({
    id: 'log-' + Date.now(),
    type: 'status_change',
    message: `Order ${order.orderNumber} status changed from ${oldStatus} to ${status}`,
    timestamp: new Date().toISOString()
  });

  saveDatabase(db);
  return res.json({ success: true, order });
});

// Static assets route for uploads or generated images
app.use('/src/assets/images', express.static(path.join(__dirname, 'src/assets/images')));

// Start Vite middleware in development or serve dist in production
async function startServer() {
  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.join(__dirname, 'dist'))) {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    // In dev mode, use Vite middleware
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NOVATECH Flagship Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server error:', err);
  process.exit(1);
});
