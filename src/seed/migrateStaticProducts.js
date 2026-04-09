const Product = require('../models/product.model');
const { genProductId } = require('../utils/ids');

const staticProducts = [
  // Smartphones
  {name:'iPhone 15 Pro Max 256GB',brand:'Apple',category:'Smartphones',price:119900,mrp:199900,img:'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&h=300&fit=crop',badge:'sale'},
  {name:'Samsung Galaxy S24 Ultra 512GB',brand:'Samsung',category:'Smartphones',price:114999,mrp:149999,img:'https://images.unsplash.com/photo-1610945264803-c22b62d2a7b3?w=400&h=300&fit=crop',badge:'hot'},
  {name:'OnePlus 12 16GB RAM',brand:'OnePlus',category:'Smartphones',price:64999,mrp:74999,img:'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&h=300&fit=crop',badge:''},
  {name:'Google Pixel 8 Pro 256GB',brand:'Google',category:'Smartphones',price:79999,mrp:99999,img:'https://images.unsplash.com/photo-1570654639102-bdd95efeca7a?w=400&h=300&fit=crop',badge:''},
  {name:'Xiaomi Redmi Note 13 Pro+',brand:'Xiaomi',category:'Smartphones',price:29999,mrp:39999,img:'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400&h=300&fit=crop',badge:''},
  {name:'Realme GT 6 256GB',brand:'Realme',category:'Smartphones',price:34999,mrp:44999,img:'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&h=300&fit=crop',badge:''},
  {name:'Nothing Phone 2a 128GB',brand:'Nothing',category:'Smartphones',price:23999,mrp:29999,img:'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&h=300&fit=crop',badge:'new'},
  {name:'Motorola Edge 50 Ultra',brand:'Motorola',category:'Smartphones',price:31999,mrp:44999,img:'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop',badge:''},
  // Laptops
  {name:'MacBook Air M3 13"',brand:'Apple',category:'Laptops',price:114900,mrp:134900,img:'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop',badge:'new'},
  {name:'Dell XPS 15 OLED',brand:'Dell',category:'Laptops',price:149900,mrp:189900,img:'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&h=300&fit=crop',badge:''},
  {name:'Asus ROG Zephyrus G16',brand:'Asus',category:'Laptops',price:149900,mrp:209900,img:'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&h=300&fit=crop',badge:'hot'},
  {name:'HP Spectre x360 14',brand:'HP',category:'Laptops',price:149900,mrp:189900,img:'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop',badge:''},
  {name:'Lenovo ThinkPad X1 Carbon',brand:'Lenovo',category:'Laptops',price:129900,mrp:164900,img:'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=300&fit=crop',badge:''},
  {name:'Samsung Galaxy Book4 Ultra',brand:'Samsung',category:'Laptops',price:149900,mrp:194990,img:'https://images.unsplash.com/photo-1593642634402-b0eb5e2eebc9?w=400&h=300&fit=crop',badge:'new'},
  {name:'Acer Predator Helios 16',brand:'Acer',category:'Laptops',price:99990,mrp:139990,img:'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&h=300&fit=crop',badge:'sale'},
  {name:'Microsoft Surface Pro 11',brand:'Microsoft',category:'Laptops',price:124999,mrp:149999,img:'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=300&fit=crop',badge:'new'},
  // Audio
  {name:'Sony WH-1000XM5 ANC',brand:'Sony',category:'Audio',price:24990,mrp:34990,img:'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&h=300&fit=crop',badge:'hot'},
  {name:'Apple AirPods Pro 2nd Gen',brand:'Apple',category:'Audio',price:24900,mrp:29900,img:'https://images.unsplash.com/photo-1606400082777-ef05f3c5cde2?w=400&h=300&fit=crop',badge:''},
  {name:'Bose QuietComfort 45',brand:'Bose',category:'Audio',price:23990,mrp:32990,img:'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&h=300&fit=crop',badge:''},
  {name:'JBL Charge 5 Speaker',brand:'JBL',category:'Audio',price:11999,mrp:17999,img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',badge:''},
  {name:'Samsung Galaxy Buds 3 Pro',brand:'Samsung',category:'Audio',price:14999,mrp:19999,img:'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=300&fit=crop',badge:'new'},
  {name:'boAt Rockerz 550 Pro',brand:'boAt',category:'Audio',price:2499,mrp:4999,img:'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',badge:'sale'},
  {name:'Sennheiser HD 560S',brand:'Sennheiser',category:'Audio',price:8999,mrp:13999,img:'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&h=300&fit=crop',badge:''},
  {name:'Marshall Emberton II',brand:'Marshall',category:'Audio',price:9499,mrp:14499,img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',badge:''},
  // Cameras
  {name:'Sony Alpha A7 IV Mirrorless',brand:'Sony',category:'Cameras',price:249990,mrp:289990,img:'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=300&fit=crop',badge:'hot'},
  {name:'Canon EOS R8 Mirrorless',brand:'Canon',category:'Cameras',price:119990,mrp:149990,img:'https://images.unsplash.com/photo-1502920917128-1aa500764bec?w=400&h=300&fit=crop',badge:''},
  {name:'Nikon Z6 III Full Frame',brand:'Nikon',category:'Cameras',price:189990,mrp:224990,img:'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=300&fit=crop',badge:'new'},
  {name:'GoPro Hero 12 Black',brand:'GoPro',category:'Cameras',price:34990,mrp:46490,img:'https://images.unsplash.com/photo-1529539795054-3c162aab037a?w=400&h=300&fit=crop',badge:''},
  {name:'DJI Osmo Pocket 3',brand:'DJI',category:'Cameras',price:44990,mrp:52990,img:'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400&h=300&fit=crop',badge:''},
  {name:'Fujifilm X-T5 APS-C',brand:'Fujifilm',category:'Cameras',price:169990,mrp:199990,img:'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=300&fit=crop',badge:''},
  // Gaming
  {name:'PS5 DualSense Controller',brand:'Sony',category:'Gaming',price:5990,mrp:9190,img:'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=300&fit=crop',badge:'hot'},
  {name:'Razer DeathAdder V3 Pro',brand:'Razer',category:'Gaming',price:7499,mrp:11999,img:'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=300&fit=crop',badge:''},
  {name:'Xbox Series X Controller',brand:'Microsoft',category:'Gaming',price:5990,mrp:7490,img:'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=400&h=300&fit=crop',badge:''},
  {name:'SteelSeries Arctis Nova Pro',brand:'SteelSeries',category:'Gaming',price:24999,mrp:32999,img:'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400&h=300&fit=crop',badge:''},
  {name:'Asus ROG Swift OLED Monitor',brand:'Asus',category:'Gaming',price:54999,mrp:74999,img:'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&h=300&fit=crop',badge:'sale'},
  {name:'Logitech G Pro X Keyboard',brand:'Logitech',category:'Gaming',price:8999,mrp:12999,img:'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=300&fit=crop',badge:''},
  {name:'MSI Katana 15 Gaming Laptop',brand:'MSI',category:'Gaming',price:79999,mrp:109999,img:'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&h=300&fit=crop',badge:''},
  // Accessories
  {name:'Anker 65W GaN Charger',brand:'Anker',category:'Accessories',price:2499,mrp:3999,img:'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400&h=300&fit=crop',badge:''},
  {name:'Apple MagSafe Charger',brand:'Apple',category:'Accessories',price:3900,mrp:4500,img:'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&h=300&fit=crop',badge:''},
  {name:'Samsung 25W Wireless Charger',brand:'Samsung',category:'Accessories',price:2999,mrp:4499,img:'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&h=300&fit=crop',badge:''},
  {name:'Baseus 20000mAh Power Bank',brand:'Baseus',category:'Accessories',price:2499,mrp:3999,img:'https://images.unsplash.com/photo-1609592426237-03a5c59d2b8f?w=400&h=300&fit=crop',badge:''},
  {name:'Logitech MX Master 3S Mouse',brand:'Logitech',category:'Accessories',price:9495,mrp:12999,img:'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=300&fit=crop',badge:''},
  {name:'Spigen iPhone 15 Case',brand:'Spigen',category:'Accessories',price:1299,mrp:1999,img:'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&h=300&fit=crop',badge:''},
  {name:'Belkin USB-C Hub 7-in-1',brand:'Belkin',category:'Accessories',price:5999,mrp:8999,img:'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400&h=300&fit=crop',badge:''},
  // Smart Home
  {name:'Amazon Echo Dot 5th Gen',brand:'Amazon',category:'Smart Home',price:3499,mrp:6299,img:'https://images.unsplash.com/photo-1512446816042-444d641267d4?w=400&h=300&fit=crop',badge:'sale'},
  {name:'Google Nest Hub 2nd Gen',brand:'Google',category:'Smart Home',price:8999,mrp:12999,img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',badge:''},
  {name:'Philips Hue Starter Kit',brand:'Philips',category:'Smart Home',price:7999,mrp:10999,img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',badge:''},
  {name:'Ring Video Doorbell Pro 2',brand:'Ring',category:'Smart Home',price:19999,mrp:27999,img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',badge:''},
  {name:'TP-Link Tapo C200 Camera',brand:'TP-Link',category:'Smart Home',price:2499,mrp:3999,img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',badge:''},
  {name:'Nest Learning Thermostat',brand:'Nest',category:'Smart Home',price:14999,mrp:19999,img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',badge:''},
  {name:'Arlo Pro 4 Security Camera',brand:'Arlo',category:'Smart Home',price:17999,mrp:24999,img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',badge:''}
];

async function seedStaticProducts() {
  console.log('Starting static products migration...');
  console.log(`Total products to migrate: ${staticProducts.length}`);
  
  let created = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const p of staticProducts) {
    try {
      // Generate unique ID based on name
      const id = 'PRD-' + p.name.toUpperCase().replace(/[^A-Z0-9]/g, '-').substring(0, 20) + '-' + Date.now();
      
      // Check if product already exists
      const existing = await Product.findOne({ name: p.name, category: p.category }).lean();
      
      if (existing) {
        console.log(`Skipping: ${p.name} (already exists)`);
        skipped++;
        continue;
      }
      
      const product = new Product({
        id: id,
        name: p.name,
        category: p.category,
        brand: p.brand,
        sku: 'BC-' + p.category.toUpperCase().substring(0, 3) + '-' + Math.floor(Math.random() * 10000),
        stock: Math.floor(Math.random() * 50) + 10,
        mrp: p.mrp,
        price: p.price,
        discount: p.mrp > p.price ? Math.round((1 - p.price/p.mrp)*100) + '%' : '',
        gst: '18%',
        description: p.name + ' — premium quality ' + p.category.toLowerCase() + ' product from ' + p.brand + '.',
        features: ['Brand: ' + p.brand, 'Category: ' + p.category, 'Genuine Product with Warranty'],
        colors: [],
        storage: [],
        display: '',
        processor: '',
        battery: '',
        connectivity: '',
        weight: '',
        warranty: '1 Year Manufacturer Warranty',
        imageUrl: p.img,
        images: [p.img], // Initialize with main image as array
        status: 'active',
        badge: p.badge || '',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      await product.save();
      console.log(`Created: ${p.name} (${p.category})`);
      created++;
    } catch (e) {
      console.error(`Error creating ${p.name}:`, e.message);
      errors++;
    }
  }
  
  console.log('\n=== Migration Complete ===');
  console.log(`Created: ${created}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Errors: ${errors}`);
  console.log(`Total: ${staticProducts.length}`);
}

module.exports = seedStaticProducts;