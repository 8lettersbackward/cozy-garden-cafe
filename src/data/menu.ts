import { MenuItem, Review } from '../types';

export const MENU_ITEMS: MenuItem[] = [
  // Coffees
  {
    id: 'lavender-latte',
    name: 'Lavender Fields Latte',
    description: 'Fresh espresso pulled over floral lavender-steeped syrup, layered with smooth, froth-capped oat milk.',
    category: 'coffee',
    price: 6.75,
    emoji: '🪻',
    isPopular: true
  },
  {
    id: 'blossom-cap',
    name: 'Garden Blossom Cappuccino',
    description: 'Double shot of organic beans topped with silky microfoam and a delicate sprinkle of dried edible rose-petals.',
    category: 'coffee',
    price: 5.50,
    emoji: '☕',
    isNew: true
  },
  {
    id: 'espresso-romano',
    name: 'Citrus Espresso Romano',
    description: 'Traditional heavy-bodied espresso poured over a disk of caramelized lemon peel for a bright, aromatic zesty finish.',
    category: 'coffee',
    price: 4.25,
    emoji: '🍋'
  },
  {
    id: 'matcha-cold-brew',
    name: 'Matcha Cloud Cold Brew',
    description: 'Steeped dark roast topped with sweet, velvety whipped, ceremonial-grade matcha cloud foam.',
    category: 'coffee',
    price: 6.90,
    emoji: '🍵',
    isPopular: true
  },
  {
    id: 'honeycomb-macchiato',
    name: 'Cozy Honeycomb Macchiato',
    description: 'Double espresso pulled slow over raw wild honey syrup, with foamed milk and natural beeswax honeycomb drizzle.',
    category: 'coffee',
    price: 6.25,
    emoji: '🍯'
  },
  {
    id: 'spanish-sunrise-mocha',
    name: 'Spanish Sunrise Mocha',
    description: 'Grated organic dark cocoa and premium espresso, touched with fresh orange blossom infusion and cardamom cream.',
    category: 'coffee',
    price: 6.50,
    emoji: '🍊',
    isNew: true
  },
  {
    id: 'elderberry-pour-over',
    name: 'Elderberry Wood Roast Pour-Over',
    description: 'Single-origin Ethiopian beans slowly hand-poured over sweet organic elderberry extract for a berry notes finish.',
    category: 'coffee',
    price: 5.25,
    emoji: '🫐'
  },

  // Teas
  {
    id: 'chamomile-elixir',
    name: 'Chamomile Lavender Elixir',
    description: 'A cozy chamomile and lavender sleep-tea infusion sweetened with raw garden honey and a lime slice.',
    category: 'tea',
    price: 4.80,
    emoji: '🫖'
  },
  {
    id: 'hibiscus-nectar',
    name: 'Crimson Rose Tea Nectar',
    description: 'Ice-shaken hibiscus and jasmine brew with natural orchard apple sweet reductions and organic petals.',
    category: 'tea',
    price: 5.20,
    emoji: '🌺'
  },
  {
    id: 'peach-jasmine-pearls',
    name: 'Peach Jasmine Tea Pearls',
    description: 'Hand-rolled green tea pearls scented with blooming night jasmine, mixed with fresh cold peach pulp.',
    category: 'tea',
    price: 5.40,
    emoji: '🍑',
    isPopular: true
  },

  // Pastries
  {
    id: 'vanilla-croissant',
    name: 'Vanilla Bean Custard Croissant',
    description: 'Over-laminated buttery croissant, baked to pristine golden brown and filled with Madagascar vanilla bean cream.',
    category: 'pastries',
    price: 6.20,
    emoji: '🥐',
    isPopular: true
  },
  {
    id: 'matcha-scone',
    name: 'Matcha Forest Glazed Scone',
    description: 'Warm house-baked crumbly buttermilk biscuit glazed with organic matcha icing and roasted sesame.',
    category: 'pastries',
    price: 4.50,
    emoji: '🍪',
    isNew: true
  },
  {
    id: 'chamomile-tart',
    name: 'Honey Citrus Chamomile Tart',
    description: 'Thin buttery crust with cool elderflower and chamomile cream, decorated with baby raw sweet honeycomb pieces.',
    category: 'pastries',
    price: 7.00,
    emoji: '🥧'
  },

  // Savory Food
  {
    id: 'pesto-ciabatta',
    name: 'Garden Pesto Ciabatta Sandwich',
    description: 'Slices of flame-grilled marinated lemon chicken, slow-roasted cherry tomatoes, house basil pesto, and fresh rocket greens in toasted crusty ciabatta.',
    category: 'food',
    price: 11.50,
    emoji: '🥪',
    isPopular: true
  },
  {
    id: 'avocado-seed-bagel',
    name: 'Sunny Avocado Seed Bagel',
    description: 'Freshly baked wholewheat sesame bagel topped with seasoned organic avocado smash, roasted sunflower seeds, poached egg, and baby watercress.',
    category: 'food',
    price: 9.80,
    emoji: '🥯',
    isNew: true
  },
  {
    id: 'harvest-quinoa-bowl',
    name: 'Meadow Harvest Quinoa Salad',
    description: 'Rich bowl loaded with fresh watercress, roasted butternut squash, red quinoa, organic goat cheese, toasted almonds, and olive rosemary vinaigrette.',
    category: 'food',
    price: 10.95,
    emoji: '🥗'
  },
  {
    id: 'truffle-crepe',
    name: 'Truffle Field Mushroom Crepe',
    description: 'Savory buckwheat folded crepe filled with wild sautéed chanterelles, rich truffle garlic white wine reduction, and fresh garden parsley.',
    category: 'food',
    price: 12.20,
    emoji: '🥞',
    isPopular: true
  },

  // Flowers to Plant and Play With
  {
    id: 'growing-lavender',
    name: 'Sweet English Lavender Kit',
    description: 'Complete planting package including high-germination lavender seeds, organic soil pod, and a miniature terracotta pot to grow in your Greenhouse!',
    category: 'flowers',
    price: 4.50,
    emoji: '🪻',
    isPopular: true
  },
  {
    id: 'growing-desertrose',
    name: 'Desert Rose Succulent Cutting',
    description: 'An advanced, ready-to-plant hardy exotic desert succulent cutting. Comes with miniature river pebbles and custom coarse potting soil.',
    category: 'flowers',
    price: 6.00,
    emoji: '🌹',
    isNew: true
  },
  {
    id: 'growing-chamomile',
    name: 'Wild Chamomile Seedling Pod',
    description: 'A pre-sprouted sweet chamomile flower. Includes a plant markers stake to name your plant. Yields fast chamomile blossoms in your Greenhouse.',
    category: 'flowers',
    price: 3.50,
    emoji: '🌱'
  },
  {
    id: 'bouquet-marigold',
    name: 'Ceremonial Golden Marigolds',
    description: 'A cheerful bundle of orange blooming marigolds in a biodegradable fiber cup, perfect to adorn your dine-in table or garden desk.',
    category: 'flowers',
    price: 5.75,
    emoji: '🌼'
  },

  // Garden Specials
  {
    id: 'pansy-syrup-waffle',
    name: 'Wild Pansy Honey Sourdough Waffles',
    description: 'Crisp, rich Belgian sourdough waffles brushed with orange-blossom honey and decorated with candy pansy petals.',
    category: 'garden-special',
    price: 8.50,
    emoji: '🧇',
    isNew: true
  },
  {
    id: 'garden-pot-pudding',
    name: 'Cozy Terracotta Matcha Pudding',
    description: 'Smooth, creamy white chocolate and matcha pudding served inside a sanitized mini terracotta pot with biscuit crumb sand.',
    category: 'garden-special',
    price: 7.50,
    emoji: '🪴',
    isPopular: true
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: '1',
    username: 'Robin',
    rating: 5,
    comment: 'The Lavender Fields Latte is sensational! Sitting out in the side garden surrounded by fresh blooms is my daily source of joy.',
    date: '2026-05-28',
    avatarColor: '#4CAF50'
  },
  {
    id: '2',
    username: 'Mochi',
    rating: 5,
    comment: 'Absolutely love the attention to detail! The Terracotta Matcha Pudding actually looks like a little flower pot. Highly recommend!',
    date: '2026-06-01',
    avatarColor: '#F5F5DC'
  },
  {
    id: '3',
    username: 'Coco',
    rating: 4,
    comment: 'Quiet and calming atmosphere. The Lemon Espresso Romano has just the right amount of acidity. It smells of fresh coffee and rain.',
    date: '2026-06-02',
    avatarColor: '#5D4037'
  }
];
