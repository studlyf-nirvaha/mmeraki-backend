import { supabaseAdmin } from '../utils/supabase';
import { generateSlug } from '../utils/slugGenerator';
import { CreateExperienceData } from '../types/Experience';

const mockExperiences: CreateExperienceData[] = [
  {
    title: "Romantic Candlelight Dinner",
    category: "experience",
    subcategory: "dinner-movie",
    short_desc: "Intimate candlelight dinner setup for two",
    description: "Create the perfect romantic atmosphere with our premium candlelight dinner setup. Includes elegant table setting, premium candles, rose petals, and ambient lighting. Perfect for anniversaries, proposals, or special date nights.",
    base_price: 2999,
    images: [
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&h=600&fit=crop"
    ],
    thumbnail_url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop",
    template_type: "special",
    is_featured: true
  },
  {
    title: "Birthday Surprise Setup",
    category: "experience",
    subcategory: "surprise-dinner",
    short_desc: "Complete birthday surprise decoration package",
    description: "Transform any space into a birthday wonderland with our comprehensive surprise setup. Includes balloons, banners, confetti, photo booth props, and personalized decorations. Guaranteed to create unforgettable memories.",
    base_price: 2499,
    images: [
      "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&h=600&fit=crop"
    ],
    thumbnail_url: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&h=300&fit=crop",
    template_type: "standard",
    is_featured: true
  },
  {
    title: "Corporate Team Building Event",
    category: "experience",
    short_desc: "Professional team building activities and setup",
    description: "Boost team morale and collaboration with our corporate team building packages. Includes ice-breaker activities, problem-solving challenges, team games, and professional facilitation. Perfect for companies looking to strengthen team bonds.",
    base_price: 4999,
    images: [
      "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop"
    ],
    thumbnail_url: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=400&h=300&fit=crop",
    template_type: "standard",
    is_featured: false
  },
  {
    title: "Kids Theme Party - Superhero",
    category: "experience",
    subcategory: "theme-parties",
    short_desc: "Superhero themed party for kids",
    description: "Let your little superheroes save the day with our action-packed superhero party setup. Includes themed decorations, costumes, activities, games, and superhero treats. Perfect for birthdays and special celebrations.",
    base_price: 1999,
    images: [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop"
    ],
    thumbnail_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
    template_type: "standard",
    is_featured: true
  },
  {
    title: "Anniversary Room Decoration",
    category: "occasion",
    subcategory: "hotel-decorations",
    short_desc: "Elegant room decoration for anniversaries",
    description: "Transform your bedroom into a romantic sanctuary with our anniversary room decoration service. Includes rose petals, fairy lights, scented candles, and elegant drapes. Create the perfect intimate setting for your special day.",
    base_price: 1799,
    images: [
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop"
    ],
    thumbnail_url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop",
    template_type: "special",
    is_featured: false
  },
  {
    title: "Festival Decoration Package",
    category: "occasion",
    subcategory: "diwali",
    short_desc: "Complete Diwali decoration and celebration setup",
    description: "Celebrate the festival of lights in style with our comprehensive Diwali decoration package. Includes traditional rangoli, diyas, lights, garlands, and festive treats. Bring the joy and warmth of Diwali to your home.",
    base_price: 3299,
    images: [
      "https://images.unsplash.com/photo-1603383928978-2bb87a85c0d4?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop"
    ],
    thumbnail_url: "https://images.unsplash.com/photo-1603383928978-2bb87a85c0d4?w=400&h=300&fit=crop",
    template_type: "standard",
    is_featured: true
  },
  {
    title: "Graduation Celebration",
    category: "occasion",
    subcategory: "graduation",
    short_desc: "Memorable graduation party setup",
    description: "Celebrate academic achievements with our graduation party package. Includes graduation-themed decorations, photo booth, congratulatory banners, and celebratory treats. Perfect for marking this important milestone.",
    base_price: 2199,
    images: [
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&h=600&fit=crop"
    ],
    thumbnail_url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=300&fit=crop",
    template_type: "standard",
    is_featured: false
  },
  {
    title: "Baby Shower Celebration",
    category: "occasion",
    subcategory: "baby-shower",
    short_desc: "Adorable baby shower decoration and setup",
    description: "Welcome the little one with our charming baby shower package. Includes pastel decorations, baby-themed props, games, and sweet treats. Create precious memories for the expecting parents and guests.",
    base_price: 2599,
    images: [
      "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop"
    ],
    thumbnail_url: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop",
    template_type: "standard",
    is_featured: true
  },
  {
    title: "Valentine's Day Special",
    category: "occasion",
    subcategory: "valentines",
    short_desc: "Romantic Valentine's Day celebration setup",
    description: "Express your love with our Valentine's Day special package. Includes heart-shaped decorations, romantic lighting, chocolate treats, and personalized elements. Make this Valentine's Day truly special for your loved one.",
    base_price: 2799,
    images: [
      "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop"
    ],
    thumbnail_url: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop",
    template_type: "special",
    is_featured: true
  },
  {
    title: "New Year Eve Party",
    category: "occasion",
    subcategory: "new-year",
    short_desc: "Spectacular New Year's Eve party setup",
    description: "Ring in the new year with style and excitement. Our New Year's Eve package includes party decorations, countdown props, photo booth, and celebratory elements. Start the new year with unforgettable memories.",
    base_price: 3999,
    images: [
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&h=600&fit=crop"
    ],
    thumbnail_url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=300&fit=crop",
    template_type: "special",
    is_featured: false
  },
  {
    title: "Engagement Party Setup",
    category: "occasion",
    subcategory: "pre-wedding",
    short_desc: "Elegant engagement party decoration",
    description: "Celebrate your engagement with our sophisticated party setup. Includes elegant decorations, photo opportunities, celebratory elements, and personalized touches. Perfect for announcing your special news to family and friends.",
    base_price: 3499,
    images: [
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop"
    ],
    thumbnail_url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop",
    template_type: "special",
    is_featured: true
  },
  {
    title: "Halloween Party Package",
    category: "occasion",
    subcategory: "halloween",
    short_desc: "Spooky Halloween party decoration and setup",
    description: "Get ready for a frightfully fun Halloween celebration. Our package includes spooky decorations, costume accessories, themed treats, and party games. Perfect for kids and adults who love a good scare.",
    base_price: 2299,
    images: [
      "https://images.unsplash.com/photo-1506905925346-14b1e0d35b36?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop"
    ],
    thumbnail_url: "https://images.unsplash.com/photo-1506905925346-14b1e0d35b36?w=400&h=300&fit=crop",
    template_type: "standard",
    is_featured: false
  },
  {
    title: "Retirement Celebration",
    category: "experience",
    short_desc: "Honor years of service with a retirement celebration",
    description: "Celebrate a lifetime of achievements with our retirement party package. Includes congratulatory decorations, memory displays, and celebratory elements. Perfect for honoring someone's dedicated service and new chapter ahead.",
    base_price: 2899,
    images: [
      "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop"
    ],
    thumbnail_url: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=400&h=300&fit=crop",
    template_type: "standard",
    is_featured: false
  },
  {
    title: "Wedding Anniversary - Golden",
    category: "experience",
    subcategory: "50th-anniversary",
    short_desc: "Luxurious golden anniversary celebration",
    description: "Celebrate 50 years of love with our golden anniversary package. Includes gold-themed decorations, elegant table settings, and special touches to honor this remarkable milestone. A truly special celebration for a special couple.",
    base_price: 5999,
    images: [
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop"
    ],
    thumbnail_url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop",
    template_type: "special",
    is_featured: true
  },
  {
    title: "House Warming Party",
    category: "experience",
    subcategory: "festive",
    short_desc: "Warm welcome to your new home",
    description: "Celebrate your new home with our house warming party package. Includes welcoming decorations, house-themed elements, and celebratory treats. Make your new house feel like home with family and friends.",
    base_price: 1999,
    images: [
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop"
    ],
    thumbnail_url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop",
    template_type: "standard",
    is_featured: false
  }
  ,
  // Additional records to ensure at least 2 items per top-level dropdown category/section
  {
    title: "Rosegold Birthday Decorations",
    category: "experience",
    subcategory: "rosegold",
    short_desc: "Elegant rosegold themed birthday decor",
    description: "Premium rosegold balloon garlands, shimmer backdrops, and table accents for a luxury birthday vibe.",
    base_price: 2599,
    images: [
      "https://images.unsplash.com/photo-1561484930-998b6a7b22e1?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&h=600&fit=crop"
    ],
    thumbnail_url: "https://images.unsplash.com/photo-1561484930-998b6a7b22e1?w=400&h=300&fit=crop",
    template_type: "standard",
    is_featured: true
  },
  {
    title: "Balloon Box Surprise - Birthday",
    category: "experience",
    subcategory: "balloon-box-surprise",
    short_desc: "Surprise reveal balloon box with custom message",
    description: "A dramatic reveal with helium balloons, confetti and a personalized message for the special one.",
    base_price: 1499,
    images: [
      "https://images.unsplash.com/photo-1514672013381-c6d0df1c8b18?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&h=600&fit=crop"
    ],
    thumbnail_url: "https://images.unsplash.com/photo-1514672013381-c6d0df1c8b18?w=400&h=300&fit=crop",
    template_type: "standard",
    is_featured: false
  },
  {
    title: "Rooftop Candlelight Dinner",
    category: "experience",
    subcategory: "rooftop",
    short_desc: "Romantic rooftop dining under the stars",
    description: "Private terrace setup with fairy lights, curated menu and personalized decor for two.",
    base_price: 3499,
    images: [
      "https://images.unsplash.com/photo-1481833761820-0509d3217039?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop"
    ],
    thumbnail_url: "https://images.unsplash.com/photo-1481833761820-0509d3217039?w=400&h=300&fit=crop",
    template_type: "special",
    is_featured: true
  },
  {
    title: "Private Dinner & Movie",
    category: "experience",
    subcategory: "dinner-movie",
    short_desc: "Dinner plus private screening experience",
    description: "Dine and watch your favorite movie in a cozy private setup complete with projector and decor.",
    base_price: 3799,
    images: [
      "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1518674660708-0a6168ea5d3e?w=800&h=600&fit=crop"
    ],
    thumbnail_url: "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?w=400&h=300&fit=crop",
    template_type: "special",
    is_featured: false
  },
  {
    title: "Umbrella Decorations - Home",
    category: "experience",
    subcategory: "umbrella",
    short_desc: "Vibrant umbrella decor for home functions",
    description: "Colorful parasols, marigold strings and backdrops for a photogenic festive vibe at home.",
    base_price: 1899,
    images: [
      "https://images.unsplash.com/photo-1520975922215-c4c4a615f3ae?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=600&fit=crop"
    ],
    thumbnail_url: "https://images.unsplash.com/photo-1520975922215-c4c4a615f3ae?w=400&h=300&fit=crop",
    template_type: "standard",
    is_featured: false
  },
  {
    title: "Flower Decorations - Premium",
    category: "experience",
    subcategory: "flower",
    short_desc: "Premium floral decor with fresh blooms",
    description: "Hand-crafted floral arrangements, arches and centerpieces using seasonal premium flowers.",
    base_price: 2999,
    images: [
      "https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1504196606672-9c33e39a2a8b?w=800&h=600&fit=crop"
    ],
    thumbnail_url: "https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=400&h=300&fit=crop",
    template_type: "standard",
    is_featured: true
  },
  {
    title: "Diwali Celebration Decor",
    category: "experience",
    subcategory: "diwali",
    short_desc: "Traditional Diwali decor with diyas and rangoli",
    description: "Illuminate your home with diyas, rangoli, fairy lights and marigold garlands for Diwali.",
    base_price: 2799,
    images: [
      "https://images.unsplash.com/photo-1603383928978-2bb87a85c0d4?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1578518509566-9e42b174a23a?w=800&h=600&fit=crop"
    ],
    thumbnail_url: "https://images.unsplash.com/photo-1603383928978-2bb87a85c0d4?w=400&h=300&fit=crop",
    template_type: "standard",
    is_featured: true
  },
  {
    title: "Christmas Home Decor",
    category: "experience",
    subcategory: "christmas",
    short_desc: "Warm Christmas setup with tree and lights",
    description: "Christmas tree, ornaments, wreaths and cozy lights to bring holiday cheer at home.",
    base_price: 2499,
    images: [
      "https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=600&fit=crop"
    ],
    thumbnail_url: "https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=400&h=300&fit=crop",
    template_type: "standard",
    is_featured: false
  },
  {
    title: "Corporate Gala Night",
    category: "experience",
    short_desc: "Elegant gala evening for corporate clients",
    description: "Stage, lighting, premium seating and decor for a sophisticated corporate gala event.",
    base_price: 6999,
    images: [
      "https://images.unsplash.com/photo-1521335629791-ce4aec67dd47?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&h=600&fit=crop"
    ],
    thumbnail_url: "https://images.unsplash.com/photo-1521335629791-ce4aec67dd47?w=400&h=300&fit=crop",
    template_type: "special",
    is_featured: false
  },
  {
    title: "Photo Frames Gift",
    category: "experience",
    subcategory: "photo-frames",
    short_desc: "Personalized photo frames",
    description: "Customizable photo frames perfect for gifting on birthdays, anniversaries and special days.",
    base_price: 799,
    images: [
      "https://images.unsplash.com/photo-1533005329709-c0d3f4fb7550?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&h=600&fit=crop"
    ],
    thumbnail_url: "https://images.unsplash.com/photo-1533005329709-c0d3f4fb7550?w=400&h=300&fit=crop",
    template_type: "standard",
    is_featured: false
  },
  {
    title: "Bubble Balloon Bucket Gift",
    category: "experience",
    subcategory: "balloon-buckets",
    short_desc: "Trendy bubble balloon bucket gift",
    description: "Clear bubble balloon with personalized text, chocolates and floral accents in a chic bucket.",
    base_price: 1199,
    images: [
      "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1514672013381-c6d0df1c8b18?w=800&h=600&fit=crop"
    ],
    thumbnail_url: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&h=300&fit=crop",
    template_type: "standard",
    is_featured: true
  },
  {
    title: "Wedding Night Decorations",
    category: "experience",
    subcategory: "wedding-night-decorations",
    short_desc: "Romantic first night floral setup",
    description: "Bed canopy with fresh flowers, candles, and ambient lighting for a dreamy first night setup.",
    base_price: 2899,
    images: [
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop"
    ],
    thumbnail_url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=300&fit=crop",
    template_type: "special",
    is_featured: true
  }
];

async function seedExperiences() {
  try {
    console.log('🌱 Starting to seed experiences...');

    // Check if experiences already exist
    const { data: existingExperiences, error: checkError } = await supabaseAdmin
      .from('experiences')
      .select('id')
      .limit(1);

    if (checkError) {
      throw new Error(`Failed to check existing experiences: ${checkError.message}`);
    }

    if (existingExperiences && existingExperiences.length > 0) {
      console.log('⚠️  Experiences already exist in the database. Skipping seed.');
      return;
    }

    // Prepare experiences with slugs
    const experiencesWithSlugs = mockExperiences.map(exp => ({
      ...exp,
      slug: generateSlug(exp.title),
      created_at: new Date().toISOString()
    }));

    // Insert experiences
    const { data, error } = await supabaseAdmin
      .from('experiences')
      .insert(experiencesWithSlugs)
      .select();

    if (error) {
      throw new Error(`Failed to insert experiences: ${error.message}`);
    }

    console.log(`✅ Successfully seeded ${data?.length || 0} experiences!`);
    console.log('📋 Seeded experiences:');
    data?.forEach((exp, index) => {
      console.log(`   ${index + 1}. ${exp.title} (${exp.slug}) - ₹${exp.base_price}`);
    });

  } catch (error) {
    console.error('❌ Error seeding experiences:', error);
    process.exit(1);
  }
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedExperiences()
    .then(() => {
      console.log('🎉 Seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

export { seedExperiences };
