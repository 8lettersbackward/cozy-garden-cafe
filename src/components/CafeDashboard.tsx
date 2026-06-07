import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Coffee, Leaf, ShoppingBag, User, LogOut, Star, Plus, Minus, X, 
  Sparkles, Send, MapPin, Clock, Gift, CheckCircle2, ArrowRight, Table
} from 'lucide-react';
import { MenuItem, CartItem, Order, Review, User as UserType, SizeOption, SweetnessOption, MilkOption } from '../types';
import { MENU_ITEMS, INITIAL_REVIEWS } from '../data/menu';

interface CafeDashboardProps {
  currentUser: UserType;
  onLogout: () => void;
  onUpdateUser: (newUser: UserType) => void;
}

export default function CafeDashboard({ currentUser, onLogout, onUpdateUser }: CafeDashboardProps) {
  const [activeTab, setActiveTab] = useState<'menu' | 'orders' | 'greenhouse' | 'about'>('menu');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Customizer modal state
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [customSize, setCustomSize] = useState<SizeOption>('Medium');
  const [customSweet, setCustomSweet] = useState<SweetnessOption>('100%');
  const [customMilk, setCustomMilk] = useState<MilkOption>('Oat Milk');
  const [customQty, setCustomQty] = useState(1);
  const [customNotes, setCustomNotes] = useState('');

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [dineInMethod, setDineInMethod] = useState<'Pickup' | 'Table Dine-in'>('Pickup');
  const [tableNumber, setTableNumber] = useState('12');

  // Customer Orders locally loaded
  const [orders, setOrders] = useState<Order[]>([]);
  
  // Active tracking timer simulation
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  // Greenhouse flower state
  const [greenhouse, setGreenhouse] = useState<{
    flowerType: string | null;
    flowerName: string;
    emoji: string;
    stage: number; // 0, 1, 2, 3 (3 is fully bloomed)
    pointsNurtured: number;
    isCustom: boolean;
    happiness: number;
    interactionLog: string[];
    seedInventory?: Array<{ id: string; name: string; emoji: string; type: string; isCustom: boolean }>;
  }>({
    flowerType: null,
    flowerName: '',
    emoji: '🌱',
    stage: 0,
    pointsNurtured: 0,
    isCustom: false,
    happiness: 100,
    interactionLog: [],
    seedInventory: []
  });

  // Request custom flour / seeds values state (Loyalty Points based)
  const [reqFlowerType, setReqFlowerType] = useState('Sunflower');
  const [reqFlowerName, setReqFlowerName] = useState('');
  const [reqFlowerEmoji, setReqFlowerEmoji] = useState('🌻');

  // Nursery Cash Order Form state
  const [cashFlowerName, setCashFlowerName] = useState('');
  const [cashFlowerType, setCashFlowerType] = useState('Lavender');
  const [cashSoilType, setCashSoilType] = useState('Organic Peat Moss Substrate');
  const [cashPotGlaze, setCashPotGlaze] = useState('Traditional Clay Terracotta');

  // CRUD states for Seed Library / Nursery Shelf
  const [editingSeedId, setEditingSeedId] = useState<string | null>(null);
  const [editingSeedName, setEditingSeedName] = useState('');
  const [editingSeedType, setEditingSeedType] = useState('Lavender');
  const [editingSeedEmoji, setEditingSeedEmoji] = useState('🪻');

  // CRUD state for renaming active growing plant
  const [isEditingActivePlant, setIsEditingActivePlant] = useState(false);
  const [activePlantNameInput, setActivePlantNameInput] = useState('');

  // Reviews list (merged with custom ones)
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [reviewMessage, setReviewMessage] = useState('');

  // Toast notifications for user experience
  const [toast, setToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Initialize and Sync orders from localStorage
  useEffect(() => {
    const savedOrders = localStorage.getItem(`orders_${currentUser.id}`);
    if (savedOrders) {
      const parsed = JSON.parse(savedOrders);
      setOrders(parsed);
      const active = parsed.find((o: Order) => o.status !== 'completed');
      if (active) {
        setActiveOrder(active);
      }
    }

    const savedGreenhouse = localStorage.getItem(`greenhouse_${currentUser.id}`);
    if (savedGreenhouse) {
      const parsed = JSON.parse(savedGreenhouse);
      setGreenhouse({
        ...parsed,
        seedInventory: parsed.seedInventory || []
      });
    }
  }, [currentUser.id]);

  // Handle active order status progression
  useEffect(() => {
    if (!activeOrder) return;
    
    const interval = setInterval(() => {
      setOrders(prev => {
        const updated = prev.map(o => {
          if (o.id === activeOrder.id) {
            let nextStatus = o.status;
            switch(o.status) {
              case 'placed': nextStatus = 'grinding'; break;
              case 'grinding': nextStatus = 'brewing'; break;
              case 'brewing': nextStatus = 'topping'; break;
              case 'topping': nextStatus = 'ready'; break;
            }
            return {
              ...o,
              status: nextStatus,
              estimatedPrepTime: Math.max(0, o.estimatedPrepTime - 12)
            };
          }
          return o;
        });

        localStorage.setItem(`orders_${currentUser.id}`, JSON.stringify(updated));
        
        // Update current tracking reference
        const ref = updated.find(o => o.id === activeOrder.id);
        if (ref) setActiveOrder(ref);

        return updated;
      });
    }, 12000); // Progress every 12 seconds

    return () => clearInterval(interval);
  }, [activeOrder, currentUser.id]);

  // Complete Order & earn coupon reward
  const handleClaimOrder = (orderId: string) => {
    setOrders(prev => {
      const updated = prev.map(o => {
        if (o.id === orderId) {
          return { ...o, status: 'completed' as const };
        }
        return o;
      });
      localStorage.setItem(`orders_${currentUser.id}`, JSON.stringify(updated));
      return updated;
    });
    
    // Reward with Loyalty points
    const orderRef = orders.find(o => o.id === orderId);
    if (orderRef) {
      const updatedUser = {
        ...currentUser,
        loyaltyPoints: currentUser.loyaltyPoints + orderRef.pointsEarned
      };
      onUpdateUser(updatedUser);
      
      // Check for plant items in the claimed order
      const plantItems = orderRef.items.filter(it => 
        it.menuItem.category === 'flowers' || 
        it.menuItem.id.startsWith('custom-plant-') ||
        it.menuItem.id.startsWith('growing-')
      );

      if (plantItems.length > 0) {
        setGreenhouse(prev => {
          const newSeeds = [...(prev.seedInventory || [])];
          plantItems.forEach(it => {
            const isCustomBespoke = it.menuItem.id.startsWith('custom-plant-');
            let mappedType = 'Flower';
            let finalName = it.menuItem.name;
            let finalEmoji = it.menuItem.emoji;

            if (isCustomBespoke) {
              const matchName = it.menuItem.name.match(/"([^"]+)"/);
              finalName = matchName ? matchName[1] : it.menuItem.name;
              
              const notes = it.additionalNotes || '';
              const matchSpecies = notes.match(/Species: ([^|]+)/);
              mappedType = matchSpecies ? matchSpecies[1].trim() : 'Custom Hybrid';
            } else {
              const notes = it.additionalNotes || '';
              const matchNickname = notes.match(/Nickname:\s*"([^"]+)"/);
              if (matchNickname) {
                finalName = matchNickname[1];
              }
              
              mappedType = it.menuItem.id === 'growing-lavender' || it.menuItem.id === 'growing-lavender-kit' ? 'Lavender' :
                           it.menuItem.id === 'growing-desertrose' || it.menuItem.id === 'growing-desertrose-cutting' ? 'Desert Rose' :
                           it.menuItem.id === 'growing-chamomile' || it.menuItem.id === 'growing-chamomile-pod' ? 'Sweet Chamomile' : 
                           it.menuItem.name.replace('Seedling Pod', '').replace('Kit', '').replace('Starter', '').replace('Sweet English ', '').replace('Wild ', '').replace('English ', '').trim();
            }

            for (let q = 0; q < it.quantity; q++) {
              newSeeds.push({
                id: Math.random().toString(36).substr(2, 9),
                name: finalName,
                emoji: finalEmoji,
                type: mappedType,
                isCustom: isCustomBespoke
              });
            }
          });
          const updatedGreenhouse = { ...prev, seedInventory: newSeeds };
          localStorage.setItem(`greenhouse_${currentUser.id}`, JSON.stringify(updatedGreenhouse));
          return updatedGreenhouse;
        });
        triggerToast(`🌱 Transplanted ${plantItems.length} starter kits into your Nursery Inventory shelf!`);
      } else {
        triggerToast(`☕ Claimed! Earned ${orderRef.pointsEarned} Garden Points!`);
      }
    }

    setActiveOrder(null);
  };

  // Open item customizer
  const handleOpenCustomizer = (item: MenuItem) => {
    setSelectedItem(item);
    setCustomSize('Medium');
    setCustomSweet('100%');
    setCustomMilk(item.category === 'coffee' || item.category === 'tea' ? 'Oat Milk' : 'None');
    setCustomQty(1);
    setCustomNotes('');
  };

  const handleAddToCart = () => {
    if (!selectedItem) return;
    
    let finalItem = { ...selectedItem };
    let attachedNotes = customNotes;

    if (selectedItem.category === 'flowers') {
      let addon = 0;
      if (customSize === 'Large') addon += 1.50;
      if (customSize === 'Small') addon -= 0.50;
      if (customSweet === '25%') addon += 1.00;
      if (customSweet === '50%') addon += 1.50;
      if (customSweet === '100%') addon += 2.00;
      if (customMilk === 'Oat Milk') addon += 0.75;
      if (customMilk === 'Cow Milk') addon += 1.50;
      if (customMilk === 'Almond Milk') addon += 1.00;
      finalItem.price = parseFloat((finalItem.price + addon).toFixed(2));
      
      const customNick = customNotes.trim() ? `Nickname: "${customNotes.trim()}"` : '';
      const substrateName = customSweet === '0%' ? 'Organic Peat' : customSweet === '25%' ? 'Volcanic Ash Mix' : customSweet === '50%' ? 'Coco Coir' : 'Premium Bark';
      const glazeName = customMilk === 'None' ? 'Matte Clay' : customMilk === 'Oat Milk' ? 'Starry Ceramic' : customMilk === 'Cow Milk' ? 'Copper Trim' : 'Greenhouse Moss';
      attachedNotes = [
        customNick,
        `Soil: ${substrateName}`,
        `Glaze: ${glazeName}`
      ].filter(Boolean).join(' | ');
    } else {
      if (customSize === 'Large') {
        finalItem.price = parseFloat((finalItem.price + 1.50).toFixed(2));
      }
    }

    const newCartItem: CartItem = {
      id: Math.random().toString(36).substr(2, 9),
      menuItem: finalItem,
      quantity: customQty,
      size: customSize,
      sweetness: customSweet,
      milk: customMilk,
      additionalNotes: attachedNotes
    };

    setCart(prev => [...prev, newCartItem]);
    setSelectedItem(null);
    triggerToast(`✨ Added ${newCartItem.quantity}x ${finalItem.name} to order!`);
  };

  const handleRemoveCartItem = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // Checkout handling
  const cartSubtotal = cart.reduce((acc, item) => acc + (item.menuItem.price * item.quantity), 0);
  const cartTax = cartSubtotal * 0.12; // 12% beautiful local taxes
  const cartTotal = cartSubtotal + cartTax;

  const handleCheckout = () => {
    // Generate order and earn loyalty points
    const pointsToEarn = Math.round(cartSubtotal * 15); // 15 points per dollar
    const updatedUser = {
      ...currentUser,
      loyaltyPoints: currentUser.loyaltyPoints + pointsToEarn
    };

    onUpdateUser(updatedUser);

    const newOrder: Order = {
      id: `GCA-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit' }),
      items: [...cart],
      total: parseFloat(cartTotal.toFixed(2)),
      status: 'placed',
      deliveryMethod: dineInMethod,
      tableNumber: dineInMethod === 'Table Dine-in' ? tableNumber : undefined,
      estimatedPrepTime: 60, // 60 seconds progress representation
      pointsEarned: pointsToEarn
    };

    setOrders(prev => {
      const updated = [newOrder, ...prev];
      localStorage.setItem(`orders_${currentUser.id}`, JSON.stringify(updated));
      return updated;
    });

    setActiveOrder(newOrder);
    setCart([]);
    setIsCartOpen(false);
    setCheckoutSuccess(true);
    setTimeout(() => {
      setCheckoutSuccess(false);
      setActiveTab('orders');
    }, 2800);
  };

  // Flower Greenhouse Simulation (Loyalty & Custom requests)
  const handlePlantFlower = (
    type: string, 
    customName = '', 
    customEmoji = '🌱', 
    cost = 0, 
    isCustom = false
  ) => {
    if (currentUser.loyaltyPoints < cost) {
      triggerToast("❌ Not enough Garden Points to request or purchase seed!");
      return;
    }

    const updatedUser = {
      ...currentUser,
      loyaltyPoints: currentUser.loyaltyPoints - cost
    };
    onUpdateUser(updatedUser);

    const emojiMap: Record<string, string> = {
      'Lavender': '🪻',
      'Desert Rose': '🌹',
      'Sweet Chamomile': '🌼',
      'Sunflower': '🌻',
      'Tulip': '🌷',
      'Orchid': '🌸',
      'Cactus': '🌵',
      'Forget-Me-Not': '🪻',
      'Marigold': '🌼'
    };

    const finalEmoji = customEmoji !== '🌱' ? customEmoji : (emojiMap[type] || '🌱');

    const updatedGreenhouse = {
      flowerType: type,
      flowerName: customName || `My ${type}`,
      emoji: finalEmoji,
      stage: 0,
      pointsNurtured: 0,
      isCustom: isCustom,
      happiness: 100,
      interactionLog: [`🌱 Planted custom "${customName || type}" seedling in terracotta pot!`],
      seedInventory: greenhouse.seedInventory || []
    };
    setGreenhouse(updatedGreenhouse);
    localStorage.setItem(`greenhouse_${currentUser.id}`, JSON.stringify(updatedGreenhouse));
    triggerToast(`🌱 Planted custom ${customName || type} seedling!`);
  };

  // Plant a seedling from raw nursery inventory shelf
  const handlePlantFromInventory = (seedId: string) => {
    const seed = (greenhouse.seedInventory || []).find(s => s.id === seedId);
    if (!seed) return;

    const updatedGreenhouse = {
      ...greenhouse,
      flowerType: seed.type,
      flowerName: seed.name,
      emoji: seed.emoji,
      stage: 0,
      pointsNurtured: 0,
      isCustom: seed.isCustom,
      happiness: 100,
      interactionLog: [`🌱 Planted custom seedling "${seed.name}" (${seed.type}) from inventory shelf!`],
      seedInventory: (greenhouse.seedInventory || []).filter(s => s.id !== seedId)
    };

    setGreenhouse(updatedGreenhouse);
    localStorage.setItem(`greenhouse_${currentUser.id}`, JSON.stringify(updatedGreenhouse));
    triggerToast(`🌿 Planted "${seed.name}" into active pot!`);
  };

  // Delete individual seedling from Nursery Inventory
  const handleDeleteSeedling = (seedId: string) => {
    setGreenhouse(prev => {
      const updatedShelf = (prev.seedInventory || []).filter(s => s.id !== seedId);
      const updated = { ...prev, seedInventory: updatedShelf };
      localStorage.setItem(`greenhouse_${currentUser.id}`, JSON.stringify(updated));
      return updated;
    });
    triggerToast("🗑️ Seedling discarded from your shelf.");
  };

  // Toggle Edit Seed mode
  const handleStartEditSeed = (seedId: string, currentName: string, currentType: string, currentEmoji: string) => {
    setEditingSeedId(seedId);
    setEditingSeedName(currentName);
    setEditingSeedType(currentType);
    setEditingSeedEmoji(currentEmoji);
  };

  // Save changes to edited Seedling
  const handleSaveSeedlingEdit = (seedId: string) => {
    if (!editingSeedName.trim()) {
      triggerToast("⚠️ Seedling nickname cannot be empty!");
      return;
    }
    setGreenhouse(prev => {
      const updatedShelf = (prev.seedInventory || []).map(s => {
        if (s.id === seedId) {
          const emojiMap: Record<string, string> = {
            'Lavender': '🪻',
            'Desert Rose': '🌹',
            'Sweet Chamomile': '🌼',
            'Golden Sunflower': '🌻',
            'Wild Orchid': '🌸',
            'Friendly Cactus': '🌵'
          };
          const resolvedEmoji = emojiMap[editingSeedType] || editingSeedEmoji || '🌱';
          return {
            ...s,
            name: editingSeedName.trim(),
            type: editingSeedType,
            emoji: resolvedEmoji
          };
        }
        return s;
      });
      const updated = { ...prev, seedInventory: updatedShelf };
      localStorage.setItem(`greenhouse_${currentUser.id}`, JSON.stringify(updated));
      return updated;
    });
    setEditingSeedId(null);
    triggerToast("👍 Seedling details updated successfully!");
  };

  // Rename the current active growing plant
  const handleRenameActivePlant = () => {
    if (!activePlantNameInput.trim()) {
      triggerToast("⚠️ Active plant nickname cannot be empty!");
      return;
    }
    setGreenhouse(prev => {
      const updated = {
        ...prev,
        flowerName: activePlantNameInput.trim()
      };
      localStorage.setItem(`greenhouse_${currentUser.id}`, JSON.stringify(updated));
      return updated;
    });
    setIsEditingActivePlant(false);
    triggerToast("🏷️ Active plant renamed successfully!");
  };

  // Delete individual order from cozy log history
  const handleDeleteOrderHistory = (orderId: string) => {
    setOrders(prev => {
      const updated = prev.filter(o => o.id !== orderId);
      localStorage.setItem(`orders_${currentUser.id}`, JSON.stringify(updated));
      return updated;
    });
    triggerToast("🗑️ Deleted history log entry!");
  };

  // Clear all completed cozy log history
  const handleClearAllHistory = () => {
    setOrders(prev => {
      const updated = prev.filter(o => o.status !== 'completed');
      localStorage.setItem(`orders_${currentUser.id}`, JSON.stringify(updated));
      return updated;
    });
    triggerToast("✨ Completed order history cleared!");
  };

  // Add customized nursery seedling to Cart
  const handleAddToCartNurseryOrder = (
    flowerSpecies: string,
    customNickname: string,
    emoji: string,
    soilType: string,
    potGlaze: string,
    totalPrice: number
  ) => {
    const plantMenuItem: MenuItem = {
      id: `custom-plant-${Math.random().toString(36).substr(2, 9)}`,
      name: `Bespoke "${customNickname}" Seedling Cup`,
      description: `Premium raw seeds of ${flowerSpecies} in nutritional ${soilType} housed in a glossy ${potGlaze} clay pot.`,
      category: 'flowers',
      price: totalPrice,
      emoji: emoji,
      isNew: true
    };

    const cartDetail: CartItem = {
      id: Math.random().toString(36).substr(2, 9),
      menuItem: plantMenuItem,
      quantity: 1,
      size: 'Medium',
      sweetness: '100%',
      milk: 'None',
      additionalNotes: `Species: ${flowerSpecies} | Soil: ${soilType} | Glaze: ${potGlaze}`
    };

    setCart(prev => [...prev, cartDetail]);
    triggerToast(`✨ Added bespoke "${customNickname}" seedling container to order cart!`);
    setIsCartOpen(true); // Open the cart view so they can see and checkout
  };

  const handleInteractFlower = (action: 'water' | 'sing' | 'honey' | 'talk') => {
    if (!greenhouse.flowerType) return;

    let updatedPoints = currentUser.loyaltyPoints;
    let updatedBalance = currentUser.balance;
    let earnedVoucherAmount = 0;
    let nextStage = greenhouse.stage;
    let newHappiness = greenhouse.happiness;
    let logMessage = '';

    if (action === 'water') {
      if (currentUser.loyaltyPoints < 40) {
        triggerToast("❌ You need at least 40 Garden Points to water and garden!");
        return;
      }
      updatedPoints -= 40;
      nextStage = greenhouse.stage < 3 ? greenhouse.stage + 1 : 3;
      newHappiness = Math.min(100, greenhouse.happiness + 20);
      logMessage = `💧 Watered with fresh mountain spring spray. (Stage: ${nextStage}/3)`;
    } else if (action === 'sing') {
      newHappiness = Math.min(100, greenhouse.happiness + 15);
      logMessage = `🎶 Sang a comforting botanical acoustic indie song. Your plant feels loved!`;
    } else if (action === 'talk') {
      newHappiness = Math.min(100, greenhouse.happiness + 10);
      logMessage = `💬 Whispered happy coffee thoughts. It rustles with absolute delight!`;
    } else if (action === 'honey') {
      if (currentUser.loyaltyPoints < 10) {
        triggerToast("❌ You need at least 10 Garden Points for premium honey mist!");
        return;
      }
      updatedPoints -= 10;
      newHappiness = Math.min(100, greenhouse.happiness + 25);
      logMessage = `🍯 Sprayed bees honey mist. The green leaves shimmer with gold sparkles!`;
    }

    const isBlooming = nextStage === 3 && greenhouse.stage !== 3;
    if (isBlooming) {
      let earnedPointsBonus = 0;
      if (greenhouse.isCustom) {
        earnedPointsBonus = 150;
      } else {
        earnedPointsBonus = greenhouse.flowerType === 'Desert Rose' ? 300 : greenhouse.flowerType === 'Lavender' ? 200 : 150;
      }
      updatedPoints += earnedPointsBonus;
      logMessage += ` 🎉 FULL BLOOM! Earned a wonderful reward of +${earnedPointsBonus} Garden Points!`;
    }

    const updatedUser = {
      ...currentUser,
      loyaltyPoints: updatedPoints
    };
    onUpdateUser(updatedUser);

    const updatedGreenhouse = {
      ...greenhouse,
      stage: nextStage,
      pointsNurtured: greenhouse.pointsNurtured + (action === 'water' ? 40 : action === 'honey' ? 10 : 0),
      happiness: newHappiness,
      interactionLog: [logMessage, ...greenhouse.interactionLog].slice(0, 5) // keep last 5 logs
    };

    setGreenhouse(updatedGreenhouse);
    localStorage.setItem(`greenhouse_${currentUser.id}`, JSON.stringify(updatedGreenhouse));

    if (isBlooming) {
      const earnedPointsBonus = greenhouse.isCustom ? 150 : greenhouse.flowerType === 'Desert Rose' ? 300 : greenhouse.flowerType === 'Lavender' ? 200 : 150;
      triggerToast(`🌸 Complete Bloom! +${earnedPointsBonus} Garden Points awarded!`);
    } else {
      triggerToast(logMessage.split('.')[0]);
    }
  };

  const handleClearFlower = () => {
    const updated = { 
      flowerType: null, 
      flowerName: '', 
      emoji: '🌱', 
      stage: 0, 
      pointsNurtured: 0, 
      isCustom: false, 
      happiness: 100, 
      interactionLog: [],
      seedInventory: greenhouse.seedInventory || []
    };
    setGreenhouse(updated);
    localStorage.setItem(`greenhouse_${currentUser.id}`, JSON.stringify(updated));
  };

  // Review submission
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewComment.trim()) return;

    const reviewObj: Review = {
      id: Math.random().toString(),
      username: currentUser.username,
      rating: newReviewRating,
      comment: newReviewComment,
      date: new Date().toISOString().split('T')[0],
      avatarColor: currentUser.avatarColor
    };

    setReviews(prev => [reviewObj, ...prev]);
    setNewReviewComment('');
    setReviewMessage("✨ Thank you for your warm review!");
    setTimeout(() => setReviewMessage(''), 3000);
  };

  // Filter menu items
  const filteredMenuItems = MENU_ITEMS.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col h-full bg-[#FAF5EE] text-brown-dark font-sans text-sm relative">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#8B4513] text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 border-2 border-[#5D4037]"
          >
            <Sparkles size={16} className="text-[#FFCC80]" />
            <span className="font-bold tracking-tight text-xs">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header bar */}
      <header className="bg-white border-b-4 border-brown-main/10 px-6 py-4 flex items-center justify-between shadow-xs shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-brown-main text-white p-2 rounded-xl flex items-center justify-center">
            <Coffee size={24} />
          </div>
          <div>
            <h1 className="font-pixel text-xs tracking-wider text-brown-dark">GARDEN CAFE</h1>
            <p className="text-[10px] text-brown-main tracking-widest uppercase font-semibold mt-0.5">Online Ordering</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Garden Points display instead of Balance */}
          <div className="hidden sm:flex flex-col items-end bg-[#F4EBE1]/40 border border-brown-main/10 px-3 py-1.5 rounded-xl">
            <span className="text-[10px] font-bold text-brown-main uppercase tracking-wider">🌱 Garden Points</span>
            <span className="font-bold text-[#8B4513] text-sm font-pixel leading-tight mt-0.5">{currentUser.loyaltyPoints} pts</span>
          </div>

          {/* User info capsule */}
          <div className="flex items-center gap-2 bg-[#F3ECE4]/80 p-1.5 rounded-full border border-[#EBDEB7]">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-inner" style={{ backgroundColor: currentUser.avatarColor }}>
              <User size={16} className="text-white" />
            </div>
            <span className="font-bold text-xs pr-3 hidden md:inline">{currentUser.username}</span>
          </div>

          <button 
            onClick={onLogout}
            title="Log Out"
            className="p-2 bg-[#FAF5EE] rounded-full text-red-600 border border-red-100 hover:bg-red-50 hover:text-red-700 transition"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Navigation Sidebar */}
        <aside className="w-20 md:w-60 bg-white border-r-4 border-brown-main/5 flex flex-col justify-between py-6 shrink-0">
          <nav className="flex flex-col gap-2 px-3">
            <button 
              onClick={() => setActiveTab('menu')}
              className={`flex flex-col md:flex-row items-center gap-3 py-3 px-4 rounded-xl transition duration-200 ${
                activeTab === 'menu' 
                  ? 'bg-[#8B4513] text-white shadow-md' 
                  : 'text-brown-main hover:bg-brown-main/5'
              }`}
            >
              <Coffee size={20} />
              <span className="font-pixel text-[9px] md:text-xs md:font-semibold hidden md:inline">Our Menu</span>
            </button>

            <button 
              onClick={() => setActiveTab('orders')}
              className={`flex flex-col md:flex-row items-center gap-3 py-3 px-4 rounded-xl transition duration-200 relative ${
                activeTab === 'orders' 
                  ? 'bg-[#8B4513] text-white shadow-md' 
                  : 'text-brown-main hover:bg-brown-main/5'
              }`}
            >
              <ShoppingBag size={20} />
              <span className="font-pixel text-[9px] md:text-xs md:font-semibold hidden md:inline">Live Orders</span>
              {activeOrder && (
                <span className="absolute top-2 right-4 w-3.5 h-3.5 bg-orange-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold text-white animate-pulse">!</span>
              )}
            </button>

            <button 
              onClick={() => setActiveTab('about')}
              className={`flex flex-col md:flex-row items-center gap-3 py-3 px-4 rounded-xl transition duration-200 ${
                activeTab === 'about' 
                  ? 'bg-[#8B4513] text-white shadow-md' 
                  : 'text-brown-main hover:bg-brown-main/5'
              }`}
            >
              <Star size={20} />
              <span className="font-pixel text-[9px] md:text-xs md:font-semibold hidden md:inline">Reviews</span>
            </button>
          </nav>

          {/* User Points box */}
          <div className="mx-4 p-4 rounded-2xl bg-[#FAF5EE] border border-[#EBDEB7] text-center hidden md:block">
            <Gift className="mx-auto mb-2 text-[#8B4513]" size={24} />
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Garden Points</span>
            <span className="text-xl font-bold font-pixel text-[#8B4513]">{currentUser.loyaltyPoints}</span>
            <div className="w-full bg-[#E5D7C2] rounded-full h-1.5 mt-2 overflow-hidden">
              <div 
                className="bg-plant-green h-full" 
                style={{ width: `${Math.min(100, (currentUser.loyaltyPoints / 500) * 100)}%` }} 
              />
            </div>
            <p className="text-[9px] text-gray-400 mt-1 font-medium">Nurture seeds at 500pts target</p>
          </div>
        </aside>

        {/* Content Panel */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <AnimatePresence mode="wait">
            
            {/* TAB 1: CAFE MENU PANEL */}
            {activeTab === 'menu' && (
              <motion.div
                key="menu-panel"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="flex flex-col gap-6"
              >
                {/* Promo Welcome Banner */}
                <div className="rounded-3xl bg-[#8B4513] text-white p-6 md:p-8 relative overflow-hidden shadow-lg border-2 border-brown-dark flex items-center justify-between">
                  <div className="z-10 max-w-lg">
                    <div className="flex items-center gap-2 mb-2 bg-[#FFCC80]/20 text-[#FFCC80] text-[10px] font-bold font-pixel tracking-widest px-3 py-1 rounded-full w-fit">
                      <Sparkles size={12} /> SWEET SUNSHINE REDEEMABLE
                    </div>
                    <h2 className="font-pixel text-base md:text-lg mb-2 text-white">Nurture flower seeds in the Greenhouse!</h2>
                    <p className="font-sans text-xs opacity-90 leading-relaxed mb-4">
                      Every step or purchase earns you points! Grow lavender and rose seedlings in our digital pots to convert loyalty points into genuine account cash credit.
                    </p>
                  </div>
                  <div className="absolute right-[-10px] bottom-[-20px] opacity-15 rotate-12 transition group-hover:scale-105">
                     <Coffee size={240} className="text-white" />
                  </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl shadow-xs border border-brown-main/5">
                  <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    {['all', 'coffee', 'tea', 'pastries', 'food', 'flowers', 'garden-special'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                          activeCategory === cat 
                            ? 'bg-[#8B4513] text-white shadow-xs' 
                            : 'bg-[#FAF5EE] text-brown-main hover:bg-brown-main/5'
                        }`}
                      >
                        {cat === 'all' && '🌿 All'}
                        {cat === 'coffee' && '☕ Brewed Coffee'}
                        {cat === 'tea' && '🫖 Infusions & Tea'}
                        {cat === 'pastries' && '🥐 Bakery Goods'}
                        {cat === 'food' && '🥯 Savory Food'}
                        {cat === 'flowers' && '🪻 Flowers & Seeds'}
                        {cat === 'garden-special' && '🌸 Garden Specials'}
                      </button>
                    ))}
                  </div>

                  <div className="relative w-full sm:w-64 shrink-0">
                    <input 
                      type="text" 
                      placeholder="Search blossoms..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-4 pr-10 py-2.5 bg-[#FAF5EE] rounded-xl text-xs border border-brown-main/15 focus:outline-none focus:border-brown-main"
                    />
                  </div>
                </div>

                {/* Menu items card list */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredMenuItems.map((item) => (
                    <motion.div
                      key={item.id}
                      whileHover={{ y: -6 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                      className="bg-white rounded-2xl overflow-hidden border border-[#EBDEB7] shadow-sm hover:shadow-md flex flex-col justify-between"
                    >
                      <div className="p-5 flex flex-col gap-3 relative">
                        {/* Tags */}
                        <div className="absolute top-4 right-4 flex gap-1.5 flex-wrap">
                          {item.isNew && (
                            <span className="bg-[#4CAF50] text-white text-[8px] font-pixel px-2 py-1 rounded-sm shadow-xs uppercase">NEW</span>
                          )}
                          {item.isPopular && (
                            <span className="bg-[#FFCC80] text-[#5D4037] text-[8px] font-pixel px-2 py-1 rounded-sm shadow-xs uppercase">BEST</span>
                          )}
                        </div>

                        <div className="flex gap-4 items-center">
                          <div className="w-14 h-14 bg-[#FAF5EE] rounded-2xl flex items-center justify-center border border-[#EBDEB7] text-3xl select-none">
                            {item.emoji}
                          </div>
                          <div>
                            <h3 className="font-bold text-[#5D4037] text-base leading-snug">{item.name}</h3>
                            <p className="font-pixel text-[10px] text-brown-main mt-1">${item.price.toFixed(2)}</p>
                          </div>
                        </div>
                        <p className="text-gray-500 text-xs leading-relaxed mt-2 line-clamp-3">
                          {item.description}
                        </p>
                      </div>

                      <div className="bg-[#FAF5EE] border-t border-[#EBDEB7] px-5 py-3.5 flex items-center justify-between">
                        <span className="text-[10px] text-gray-400 capitalize bg-white px-2 py-1 rounded-lg border border-gray-100">{item.category.replace('-', ' ')}</span>
                        <button 
                          onClick={() => handleOpenCustomizer(item)}
                          className="px-4 py-2 font-pixel text-[9px] bg-[#8B4513] border-b-4 border-brown-dark text-white rounded-lg active:translate-y-[2px] active:border-b-2 hover:bg-brown-main flex items-center gap-1 leading-none shadow-sm"
                        >
                          <Plus size={12} /> Custom Order
                        </button>
                      </div>
                    </motion.div>
                  ))}
                  
                  {filteredMenuItems.length === 0 && (
                    <div className="col-span-full py-16 text-center">
                      <p className="font-pixel text-[10px] text-gray-400">NO DELICACIES FOUND</p>
                      <p className="text-xs text-gray-500 mt-1">Try clarifying your terms or resetting filters!</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB 2: LIVE ORDERS PANEL */}
            {activeTab === 'orders' && (
              <motion.div
                key="orders-panel"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              >
                {/* Active Tracking Display */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                  <h2 className="font-pixel text-sm text-brown-dark border-b border-gray-200 pb-3">CURRENT LIVE BREWS</h2>
                  
                  {orders.filter(o => o.status !== 'completed').map((order) => (
                    <div key={order.id} className="bg-white rounded-3xl border-2 border-brown-main p-6 shadow-md flex flex-col gap-6">
                      
                      {/* Live Animation Order Header */}
                      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#FAF5EE] pb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-pixel text-xs text-brown-main font-bold">{order.id}</span>
                            <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-orange-50 text-orange-600 block leading-none">{order.deliveryMethod}</span>
                          </div>
                          <span className="text-xs text-gray-400 mt-1 block font-medium">Placed: {order.date}</span>
                        </div>

                        <div className="text-right">
                          <span className="text-xs text-gray-400 block font-bold">Total Bill</span>
                          <span className="font-pixel text-xs text-brown-dark">${order.total}</span>
                        </div>
                      </div>

                      {/* Barista Status Tracker Visualizer (Cozy pixel themed animations) */}
                      {(() => {
                        const isPlantOrder = order.items.some(it => 
                          it.menuItem.category === 'flowers' || 
                          it.menuItem.id.startsWith('custom-plant-') ||
                          it.menuItem.id.startsWith('growing-')
                        );
                        return (
                          <div className="bg-[#FAF5EE] p-5 rounded-2xl border border-[#EBDEB7] flex flex-col gap-4">
                            <div className="font-pixel text-[10px] text-brown-main text-center flex items-center justify-center gap-2">
                              <Sparkles size={14} className="text-orange-500 animate-spin" />
                              <span>
                                {order.status === 'placed' && (isPlantOrder ? 'Reviewing your florist seed request ticket...' : 'Preparing your order...')}
                                {order.status === 'grinding' && (isPlantOrder ? 'Preparing custom peat moss & volcanic soil mix...' : 'Grinding hand-selected organic beans...')}
                                {order.status === 'brewing' && (isPlantOrder ? 'Sowing custom seedling seeds in nursery cups...' : 'Brewing espresso shots with perfect pressure...')}
                                {order.status === 'topping' && (isPlantOrder ? 'Incubating seedbed in the warm greenhouse sun...' : 'Pouring milk cloud foam artwork...')}
                                {order.status === 'ready' && (isPlantOrder ? 'Your plant seedling is potted! Unpack to transfer to shelf!' : 'Your order is ready for cozy pickup!')}
                              </span>
                            </div>

                            {/* Interactive Steps Visual Map */}
                            <div className="grid grid-cols-5 gap-1.5 relative mt-2">
                              <div className="absolute top-1/2 left-0 right-0 h-1 bg-[#E5D7C2] -translate-y-1/2 z-0" />
                              
                              {/* Step 1: Placed */}
                              <div className="flex flex-col items-center z-10">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold leading-none border-2 ${
                                  order.status !== 'placed' ? 'bg-brown-main text-white' : 'bg-orange-500 text-white animate-bounce'
                                }`}>
                                  1
                                </div>
                                <span className="text-[9px] font-bold text-gray-500 mt-1 uppercase text-center scale-90">
                                  {isPlantOrder ? 'Ticket' : 'Placed'}
                                </span>
                              </div>

                              {/* Step 2: Grinding */}
                              <div className="flex flex-col items-center z-10">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold leading-none border-2 ${
                                  ['placed'].includes(order.status)
                                    ? 'bg-[#E5D7C2] text-gray-400' 
                                    : order.status === 'grinding' 
                                      ? 'bg-orange-500 text-white animate-pulse' 
                                      : 'bg-brown-main text-white'
                                }`}>
                                  2
                                </div>
                                <span className="text-[9px] font-bold text-gray-500 mt-1 uppercase text-center scale-90">
                                  {isPlantOrder ? 'Soil Bed' : 'Grind'}
                                </span>
                              </div>

                              {/* Step 3: Brewing */}
                              <div className="flex flex-col items-center z-10">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold leading-none border-2 ${
                                  ['placed', 'grinding'].includes(order.status)
                                    ? 'bg-[#E5D7C2] text-gray-400' 
                                    : order.status === 'brewing' 
                                      ? 'bg-orange-500 text-white animate-pulse' 
                                      : 'bg-brown-main text-white'
                                }`}>
                                  3
                                </div>
                                <span className="text-[9px] font-bold text-gray-500 mt-1 uppercase text-center scale-90">
                                  {isPlantOrder ? 'Sowing' : 'Brew'}
                                </span>
                              </div>

                              {/* Step 4: Toppings */}
                              <div className="flex flex-col items-center z-10">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold leading-none border-2 ${
                                  ['placed', 'grinding', 'brewing'].includes(order.status)
                                    ? 'bg-[#E5D7C2] text-gray-400' 
                                    : order.status === 'topping' 
                                      ? 'bg-orange-500 text-white animate-pulse' 
                                      : 'bg-brown-main text-white'
                                }`}>
                                  4
                                </div>
                                <span className="text-[9px] font-bold text-gray-500 mt-1 uppercase text-center scale-90">
                                  {isPlantOrder ? 'Sunshine' : 'Topping'}
                                </span>
                              </div>

                              {/* Step 5: Ready */}
                              <div className="flex flex-col items-center z-10">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold leading-none border-2 ${
                                  order.status === 'ready' ? 'bg-green-600 text-white animate-bounce' : 'bg-[#E5D7C2] text-gray-400'
                                }`}>
                                  ✓
                                </div>
                                <span className="text-[9px] font-bold text-green-600 mt-1 uppercase text-center scale-90">
                                  {isPlantOrder ? 'Seeded!' : 'Ready'}
                                </span>
                              </div>
                            </div>

                            {/* Interactive animation graphics */}
                            <div className="h-28 bg-[#FAF5EE] rounded-xl flex items-center justify-center relative border-t-2 border-stone-200 overflow-hidden">
                              {order.status === 'placed' && (
                                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity }} className="text-center">
                                  <span className="text-4xl block mb-2 font-semibold">📋</span>
                                  <span className="text-xs font-bold text-brown-main">
                                    {isPlantOrder ? 'Receipt sent to Botanist table!' : 'Receipt printed for Barista!'}
                                  </span>
                                </motion.div>
                              )}
                              {order.status === 'grinding' && (
                                <div className="text-center relative">
                                  <motion.div 
                                    animate={{ y: [-4, 4, -4], rotate: [0, 8, -8, 0] }} 
                                    transition={{ repeat: Infinity, duration: 1.2 }} 
                                    className="text-4xl block mb-1"
                                  >
                                    {isPlantOrder ? '🪨' : '🫘'}
                                  </motion.div>
                                  <span className="text-xs font-bold text-brown-main">
                                    {isPlantOrder ? 'Sifting peat moss and volcanic mineral nutrients' : 'Crushing bean grains...'}
                                  </span>
                                  <div className="absolute inset-0 flex select-none justify-between pointer-events-none opacity-40">
                                    <span className="text-[10px] animate-bounce delay-100">🌿</span>
                                    <span className="text-[10px] animate-bounce delay-300">🍃</span>
                                  </div>
                                </div>
                              )}
                              {order.status === 'brewing' && (
                                <div className="text-center relative">
                                  <div className="text-4xl mb-1 relative flex items-center justify-center">
                                    {isPlantOrder ? '🪴' : '☕'}
                                    <motion.span 
                                      animate={{ y: [0, 10, 0], opacity: [0, 1, 0] }}
                                      transition={{ repeat: Infinity, duration: 0.8 }}
                                      className="absolute bottom-0 text-[10px] text-green-600"
                                    >
                                      💧
                                    </motion.span>
                                  </div>
                                  <span className="text-xs font-bold text-brown-main">
                                    {isPlantOrder ? 'Sowing custom seeds and pre-moisturizing' : 'Pulling perfect double extraction cream...'}
                                  </span>
                                </div>
                              )}
                              {order.status === 'topping' && (
                                <div className="text-center">
                                  <motion.div 
                                    animate={{ rotate: [0, -15, 0], x: [-5, 5, -5] }} 
                                    transition={{ repeat: Infinity, duration: 2 }} 
                                    className="text-4xl block mb-1"
                                  >
                                    {isPlantOrder ? '☀️' : '🫗'}
                                  </motion.div>
                                  <span className="text-xs font-bold text-[#8B4513]">
                                    {isPlantOrder ? 'Sprouting under warm UV nursery sunshine' : 'Whirling silk oat foam artwork'}
                                  </span>
                                </div>
                              )}
                              {order.status === 'ready' && (
                                <div className="text-center py-2 flex flex-col items-center">
                                  <motion.span 
                                    animate={{ scale: [1, 1.15, 1] }} 
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                    className="text-4xl block mb-2"
                                  >
                                    {isPlantOrder ? '📦' : '🧁'}
                                  </motion.span>
                                  <span className="text-xs font-black text-green-600 block uppercase tracking-wide">
                                    {isPlantOrder ? 'SEEDLING POTTED' : 'PICKUP READY'}
                                  </span>
                                  <button
                                    onClick={() => handleClaimOrder(order.id)}
                                    className="mt-3 px-5 py-2 font-pixel text-[10px] bg-green-600 hover:bg-green-700 text-white border-b-4 border-green-800 rounded-lg shrink-0 flex items-center gap-1 leading-none shadow-xs"
                                  >
                                    {isPlantOrder ? '✓ UNBOX SEED POT' : 'CLAIM & SIP'}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Items details */}
                      <div>
                        <h4 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">Item Specifications</h4>
                        <div className="flex flex-col gap-2">
                          {order.items.map((it) => (
                            <div key={it.id} className="flex justify-between items-center bg-gray-50 p-2.5 rounded-lg text-xs">
                              <div>
                                <span className="font-bold text-brown-dark">{it.quantity}x {it.menuItem.name}</span>
                                <div className="text-[9px] text-[#8B4513] gap-1 flex flex-wrap mt-0.5">
                                  <span>📏 {it.size}</span>
                                  <span>• 🍬 {it.sweetness} Sweet</span>
                                  {it.milk !== 'None' && <span>• 🥛 {it.milk}</span>}
                                  {it.additionalNotes && <span>• 📝 "{it.additionalNotes}"</span>}
                                </div>
                              </div>
                              <span className="font-bold font-pixel text-[10px] text-brown-main">${(it.menuItem.price * it.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}

                  {orders.filter(o => o.status !== 'completed').length === 0 && (
                    <div className="bg-white rounded-3xl p-10 border border-[#EBDEB7] text-center">
                      <Coffee size={40} className="mx-auto text-gray-300 mb-3" />
                      <p className="font-pixel text-[9px] text-gray-400">NO ACTIVE BREWS CURRENTLY</p>
                      <p className="text-xs text-gray-500 mt-2">Browse our beautiful catalog of coffee and pastries to start your first order!</p>
                      <button 
                        onClick={() => setActiveTab('menu')}
                        className="mt-4 px-6 py-2.5 font-pixel text-[9px] bg-[#8B4513] border-b-4 border-brown-dark text-white rounded-xl active:translate-y-1 block mx-auto py-3 px-6"
                      >
                        VIEW MENU
                      </button>
                    </div>
                  )}
                </div>

                {/* History list on the side */}
                <div className="flex flex-col gap-6">
                  <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                    <h2 className="font-pixel text-sm text-brown-dark">COZY LOGS (PAST ORDERS)</h2>
                    {orders.filter(o => o.status === 'completed').length > 0 && (
                      <button 
                        onClick={handleClearAllHistory}
                        className="text-[10px] font-pixel text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-md border border-red-250 transition-all active:scale-95 ease-out"
                        title="Clear completed logs"
                      >
                        🗑️ Clear All
                      </button>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-1">
                    {orders.filter(o => o.status === 'completed').map((order) => (
                      <div key={order.id} className="bg-white p-4 rounded-2xl border border-[#EBDEB7] shadow-xs flex flex-col gap-3 relative group">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-bold text-xs text-gray-400">{order.id}</span>
                            <span className="text-[9px] font-bold block text-gray-500 mt-0.5">{order.date}</span>
                          </div>
                          
                          <div className="flex items-center gap-1.5">
                            <span className="bg-gray-100 text-gray-500 font-bold text-[9px] px-2 py-0.5 rounded-full">Completed</span>
                            <button
                              onClick={() => handleDeleteOrderHistory(order.id)}
                              className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
                              title="Delete this order from history"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        </div>

                        <div className="border-t border-dashed border-gray-100 pt-2 flex flex-col gap-1.5">
                          {order.items.map((it) => (
                            <div key={it.id} className="flex justify-between text-xs text-gray-600">
                              <span className="font-medium">{it.quantity}x {it.menuItem.name}</span>
                              <span className="font-mono">${(it.menuItem.price * it.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>

                        <div className="border-t border-gray-100 pt-2.5 flex justify-between items-center">
                          <span className="text-[10px] text-[#4CAF50] font-bold">+ {order.pointsEarned} Garden Points</span>
                          <span className="font-bold text-brown-dark font-pixel text-[10px]">${order.total}</span>
                        </div>
                      </div>
                    ))}

                    {orders.filter(o => o.status === 'completed').length === 0 && (
                      <div className="text-center py-8 text-gray-400 text-xs">
                        No previous orders in history!
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 3: GREENHOUSE LOYALTY & REQUEST GAME */}
            {activeTab === 'greenhouse' && (
              <motion.div
                key="greenhouse-panel"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="flex flex-col gap-6"
              >
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#EBDEB7] shadow-xs">
                  <div className="max-w-2xl mb-6">
                    <h2 className="font-pixel text-sm text-brown-dark mb-2">🌿 BOTANICAL GREENHOUSE GARDEN</h2>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Convert earned loyalty points back to real Cafe cash! Order seed starter cups from our menu, choose premium seeds below, or request custom flower species from our florists to play, sing, whisper, and grow your custom plant buddies.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    
                    {/* Flower Selection Board if Empty */}
                    {!greenhouse.flowerType ? (
                      <div className="lg:col-span-3 flex flex-col gap-8">
                        
                        {/* 1. Florist Custom Request station */}
                        <div className="bg-[#FAF5EE] p-6 rounded-3xl border-2 border-[#D2B48C]/50 shadow-xs">
                          <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="text-orange-500 animate-pulse" size={18} />
                            <h3 className="font-pixel text-[11px] text-brown-dark uppercase">Florist Custom Request Desk</h3>
                          </div>
                          
                          <p className="text-xs text-stone-500 mb-5 leading-relaxed">
                            Have a specific dream blossom in mind? Submit a custom seed ticket to our greenhouse florist! Customize its nickname, choose your preferred species, and start caring for it for just <span className="font-bold text-brown-dark font-mono bg-white px-2 py-0.5 rounded border border-gray-100">50 Points</span>.
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-white p-5 rounded-2xl border border-[#EBDEB7]">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-bold text-gray-400 uppercase">Flower Nickname</label>
                              <input 
                                type="text"
                                placeholder="e.g. Sunny Boy, Bella, Spike..."
                                value={reqFlowerName}
                                onChange={(e) => setReqFlowerName(e.target.value)}
                                className="w-full p-2.5 bg-[#FAF5EE] text-xs border border-brown-main/15 rounded-xl focus:outline-none focus:border-brown-main"
                              />
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-bold text-gray-400 uppercase">Flower Species</label>
                              <select
                                value={reqFlowerType}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setReqFlowerType(val);
                                  // Auto-adjust emoji map
                                  const emMap: Record<string, string> = {
                                    'Sunflower': '🌻',
                                    'Aster Tulip': '🌷',
                                    'Wild Orchid': '🌸',
                                    'Friendly Cactus': '🌵',
                                    'Lucky Clover': '🍀',
                                    'Crimson Rose': '🌺',
                                    'Gold Buttercup': '🌼'
                                  };
                                  setReqFlowerEmoji(emMap[val] || '🌱');
                                }}
                                className="w-full p-2.5 bg-[#FAF5EE] text-xs border border-brown-main/15 rounded-xl focus:outline-none focus:border-brown-main font-semibold"
                              >
                                <option value="Sunflower">Sunflower 🌻</option>
                                <option value="Aster Tulip">Aster Tulip 🌷</option>
                                <option value="Wild Orchid">Wild Orchid 🌸</option>
                                <option value="Friendly Cactus">Friendly Cactus 🌵</option>
                                <option value="Lucky Clover">Lucky Clover 🍀</option>
                                <option value="Crimson Rose">Crimson Rose 🌺</option>
                                <option value="Gold Buttercup">Gold Buttercup 🌼</option>
                              </select>
                            </div>

                            <button
                              onClick={() => {
                                if (!reqFlowerName.trim()) {
                                  triggerToast("❌ Enter a beautiful nickname for your custom flower!");
                                  return;
                                }
                                handlePlantFlower(reqFlowerType, reqFlowerName, reqFlowerEmoji, 50, true);
                              }}
                              className="w-full text-center py-2.5 font-pixel text-[9px] bg-[#8B4513] border-b-4 border-brown-dark text-white rounded-xl active:translate-y-0.5 hover:bg-brown-main uppercase"
                            >
                              Request & Plant Seed (50pts)
                            </button>
                          </div>
                        </div>

                        {/* 2. Premium Loyalty Seed options */}
                        <div className="flex flex-col gap-4">
                          <h3 className="font-pixel text-[11px] text-brown-dark uppercase border-b border-gray-100 pb-2">Premium Loyalty Pots</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
                            {/* Seed 1: Chamomile */}
                            <div className="bg-[#FAF5EE] p-5 rounded-2xl border border-[#EBDEB7] flex flex-col items-center gap-3 text-center">
                              <span className="text-4xl block select-none">🌼</span>
                              <h4 className="font-bold text-xs text-brown-dark">Sweet Chamomile</h4>
                              <p className="text-[10px] text-gray-500 leading-relaxed">Fast-growing herbal daisy buds. Earns a delightful bloom reward of +150 Garden Points!</p>
                              <span className="text-[10px] font-pixel text-brown-main mt-1 bg-white px-2.5 py-1 rounded-lg border border-[#EBDEB7]">80 Points</span>
                              <button
                                onClick={() => handlePlantFlower('Sweet Chamomile', 'Mimi the Chamomile', '🌼', 80, false)}
                                className="w-full pixel-button py-2 uppercase mt-2 font-pixel text-[8px]"
                              >
                                Plant Seed
                              </button>
                            </div>

                            {/* Seed 2: Lavender */}
                            <div className="bg-[#FAF5EE] p-5 rounded-2xl border border-[#EBDEB7] flex flex-col items-center gap-3 text-center">
                              <span className="text-4xl block select-none">🪻</span>
                              <h4 className="font-bold text-xs text-brown-dark">English Lavender</h4>
                              <p className="text-[10px] text-gray-500 leading-relaxed">Fragrant soothing violet stalks. Earns a serene bloom reward of +200 Garden Points!</p>
                              <span className="text-[10px] font-pixel text-brown-main mt-1 bg-white px-2.5 py-1 rounded-lg border border-[#EBDEB7]">100 Points</span>
                              <button
                                onClick={() => handlePlantFlower('Lavender', 'Lavvy the Lavender', '🪻', 100, false)}
                                className="w-full pixel-button py-2 uppercase mt-2 font-pixel text-[8px]"
                              >
                                Plant Seed
                              </button>
                            </div>

                            {/* Seed 3: Desert Rose */}
                            <div className="bg-[#FAF5EE] p-5 rounded-2xl border border-[#EBDEB7] flex flex-col items-center gap-3 text-center">
                              <span className="text-4xl block select-none">🌹</span>
                              <h4 className="font-bold text-xs text-brown-dark">Desert Rose</h4>
                              <p className="text-[10px] text-gray-500 leading-relaxed">Sturdy slow-blooming rare desert cactus-flower. Earns an epic reward of +300 Garden Points!</p>
                              <span className="text-[10px] font-pixel text-brown-main mt-1 bg-white px-2.5 py-1 rounded-lg border border-[#EBDEB7]">150 Points</span>
                              <button
                                onClick={() => handlePlantFlower('Desert Rose', 'Sunny Desert Rose', '🌹', 150, false)}
                                className="w-full pixel-button py-2 uppercase mt-2 font-pixel text-[8px]"
                              >
                                Plant Seed
                              </button>
                            </div>
                          </div>
                        </div>

                      </div>
                    ) : (
                      
                      // Active Garden Pot (Interactive botanical play simulator)
                      <>
                        <div className="lg:col-span-2 bg-[#FAF5EE] p-6 rounded-3xl border border-[#EBDEB7] flex flex-col items-center relative">
                          <div className="text-center mb-1">
                            <span className="font-pixel text-[11px] text-brown-dark block">Active Terracotta Planter</span>
                            <h3 className="font-bold text-base text-brown-main mt-1">"{greenhouse.flowerName}"</h3>
                          </div>
                          
                          {/* Pixel Pot Graphic container */}
                          <div className="w-56 h-56 bg-white rounded-3xl border border-[#EBDEB7] shadow-inner mt-4 mb-5 flex flex-col items-center justify-end p-6 select-none relative overflow-hidden">
                            <div className="absolute top-4 left-4 bg-[#FAF5EE] border border-[#EBDEB7] text-[9px] font-bold text-gray-500 uppercase px-2.5 py-1 rounded-lg">
                              Stage: {greenhouse.stage === 0 && 'Seedling 🌱'}
                              {greenhouse.stage === 1 && 'Sprout 🌿'}
                              {greenhouse.stage === 2 && 'Stem Buds 🪴'}
                              {greenhouse.stage === 3 && 'Bloomed! 🌸'}
                            </div>

                            <div className="absolute top-4 right-4 bg-red-50 border border-red-100 text-[9px] font-bold text-red-500 uppercase px-2 py-1 rounded-lg flex items-center gap-1">
                              ❤️ {greenhouse.happiness}% Joy
                            </div>

                            {/* Actual flower visual models */}
                            <div className="h-28 flex items-end justify-center mb-0.5">
                              {/* Stage 0: Seed dirt */}
                              {greenhouse.stage === 0 && (
                                <motion.div animate={{ scale: [0.93, 1.07, 0.93] }} transition={{ repeat: Infinity, duration: 2 }} className="text-2xl">🌱</motion.div>
                              )}
                              
                              {/* Stage 1: Sprout */}
                              {greenhouse.stage === 1 && (
                                <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="flex flex-col items-center">
                                  <span className="text-4xl block">🌿</span>
                                </motion.div>
                              )}

                              {/* Stage 2: Stem Buds */}
                              {greenhouse.stage === 2 && (
                                <motion.div animate={{ rotate: [-2.5, 2.5, -2.5] }} transition={{ repeat: Infinity, duration: 1.8 }} className="flex flex-col items-center">
                                  <span className="text-5xl block">🪴</span>
                                </motion.div>
                              )}

                              {/* Stage 3: Full bloom */}
                              {greenhouse.stage === 3 && (
                                <motion.div 
                                  animate={{ 
                                    scale: [1, 1.08, 1],
                                    rotate: [-1.5, 1.5, -1.5]
                                  }} 
                                  transition={{ repeat: Infinity, duration: 2 }} 
                                  className="flex flex-col items-center"
                                >
                                  <span className="text-6xl block select-none">{greenhouse.emoji}</span>
                                </motion.div>
                              )}
                            </div>

                            {/* Clay Terracotta Pot bottom */}
                            <div className="w-24 h-12 bg-orange-600 rounded-b-xl border-t-4 border-orange-700 relative flex items-center justify-center font-bold font-pixel text-orange-200 text-[9px]">
                              TERRA
                              <div className="absolute top-0 inset-x-0 h-1 bg-orange-500 shadow-sm" />
                            </div>
                          </div>

                          {/* Happiness indicator bar */}
                          <div className="w-full max-w-sm flex flex-col gap-1 mb-6">
                            <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase">
                              <span>Happiness Level</span>
                              <span>{greenhouse.happiness}% (Shiny Bloom Booster)</span>
                            </div>
                            <div className="w-full bg-[#E5D7C2] rounded-full h-2.5 overflow-hidden border border-brown-main/5">
                              <div 
                                className="bg-red-400 h-full transition-all duration-500 ease-out" 
                                style={{ width: `${greenhouse.happiness}%` }}
                              />
                            </div>
                          </div>

                          {/* Botanical Parlor Interaction Dashboard */}
                          <div className="flex flex-col gap-3 w-full max-w-md">
                            <div className="grid grid-cols-2 gap-2">
                              {greenhouse.stage < 3 ? (
                                <button
                                  onClick={() => handleInteractFlower('water')}
                                  className="pixel-button py-2.5 text-[10px] flex items-center justify-center gap-1.5"
                                >
                                  💧 Water Pot (-40pts)
                                </button>
                              ) : (
                                <button
                                  onClick={handleClearFlower}
                                  className="pixel-button py-2.5 text-[10px] flex items-center justify-center gap-1.5 bg-[#4CAF50] border-[#2E7D32]"
                                >
                                  ✨ Harvest Reward Credit
                                </button>
                              )}

                              <button
                                onClick={() => handleInteractFlower('honey')}
                                className="px-4 py-2.5 bg-orange-50 border-2 border-orange-200 text-orange-700 hover:bg-orange-100 rounded-xl transition font-bold text-[10px] flex items-center justify-center gap-1.5"
                              >
                                🍯 Honey Mist (-10pts)
                              </button>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => handleInteractFlower('sing')}
                                className="px-4 py-2.5 bg-sky-50 border-2 border-sky-200 text-sky-700 hover:bg-sky-100 rounded-xl transition font-bold text-[10px] flex items-center justify-center gap-1.5"
                              >
                                🎶 Sing Folk Song (Free)
                              </button>

                              <button
                                onClick={() => handleInteractFlower('talk')}
                                className="px-4 py-2.5 bg-pink-50 border-2 border-pink-100 text-pink-700 hover:bg-pink-100 rounded-xl transition font-bold text-[10px] flex items-center justify-center gap-1.5"
                              >
                                💬 Whisper Praise (Free)
                              </button>
                            </div>

                            <button
                              onClick={handleClearFlower}
                              className="py-1.5 text-gray-400 hover:text-red-500 text-[10px] font-bold text-center mt-2 border border-transparent hover:border-red-100 rounded-xl transition"
                            >
                              ✕ Discard and clear pot
                            </button>
                          </div>
                        </div>

                        {/* Status detail list card */}
                        <div className="bg-[#FAF5EE] p-6 rounded-3xl border border-[#EBDEB7] flex flex-col gap-4">
                          <h4 className="font-pixel text-[10px] text-brown-main">INSPECTION STATS</h4>
                          
                          <div className="flex flex-col gap-3 text-xs text-gray-600">
                            <div className="flex justify-between items-center border-b border-gray-200/50 pb-2">
                              <span>Assigned Name</span>
                              {isEditingActivePlant ? (
                                <div className="flex gap-1 items-center">
                                  <input
                                    type="text"
                                    value={activePlantNameInput}
                                    onChange={(e) => setActivePlantNameInput(e.target.value)}
                                    className="px-2 py-1 text-xs bg-white border border-brown-main/20 rounded-md focus:outline-none text-brown-dark font-bold max-w-[120px]"
                                    placeholder="New Nickname"
                                  />
                                  <button
                                    onClick={handleRenameActivePlant}
                                    className="px-1.5 py-1 bg-green-600 text-white rounded-md text-[9px] hover:bg-green-700 font-pixel leading-none shrink-0"
                                  >
                                    ✓
                                  </button>
                                  <button
                                    onClick={() => setIsEditingActivePlant(false)}
                                    className="px-1.5 py-1 bg-gray-200 text-gray-700 rounded-md text-[9px] hover:bg-gray-300 font-pixel leading-none shrink-0"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ) : (
                                <span className="font-bold text-brown-dark flex items-center gap-1.5">
                                  <span>"{greenhouse.flowerName}"</span>
                                  <button
                                    onClick={() => {
                                      setIsEditingActivePlant(true);
                                      setActivePlantNameInput(greenhouse.flowerName);
                                    }}
                                    className="text-[10px] text-brown-main/60 hover:text-brown-main hover:bg-brown-main/5 p-1 rounded-md transition-all"
                                    title="Rename active plant"
                                  >
                                    ✏️
                                  </button>
                                </span>
                              )}
                            </div>
                            <div className="flex justify-between border-b border-gray-200/50 pb-2">
                              <span>Botanical Kind</span>
                              <span className="font-bold text-brown-dark flex items-center gap-1">
                                <span>{greenhouse.emoji}</span>
                                <span>{greenhouse.flowerType}</span>
                              </span>
                            </div>
                            <div className="flex justify-between border-b border-gray-200/50 pb-2">
                              <span>Points Invested</span>
                              <span className="font-mono">{greenhouse.pointsNurtured} Pts</span>
                            </div>
                            <div className="flex justify-between pb-1">
                              <span>Reward Payout</span>
                              <span className="font-bold text-green-600 font-pixel text-[10px]">
                                {greenhouse.isCustom 
                                  ? '+$4.00 Credits' 
                                  : greenhouse.flowerType === 'Desert Rose' 
                                    ? '+$8.50 Credits' 
                                    : greenhouse.flowerType === 'Lavender' 
                                      ? '+$5.00 Credits' 
                                      : '+$3.50 Credits'
                                }
                              </span>
                            </div>
                          </div>

                          {/* Flower caregiver timeline journal log */}
                          <div className="flex flex-col gap-2 mt-2">
                            <h5 className="text-[9px] font-extrabold text-stone-400 uppercase tracking-widest border-t border-gray-200 pt-3">Caregiver Diary Journal</h5>
                            <div className="bg-white p-3.5 rounded-xl border border-stone-200 max-h-[160px] overflow-y-auto flex flex-col gap-1.5 font-mono text-[9px] text-stone-500 leading-normal">
                              {greenhouse.interactionLog && greenhouse.interactionLog.length > 0 ? (
                                greenhouse.interactionLog.map((log, idx) => (
                                  <div key={idx} className="border-b border-dashed border-gray-100 pb-1 last:border-b-0 last:pb-0">
                                    {log}
                                  </div>
                                ))
                              ) : (
                                <div className="text-stone-400 italic">No logs typed. Interact with your bud to write diary records!</div>
                              )}
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                  </div>
                </div>

                {/* Secondary Card 2: Nursery Inventory Shelf */}
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#EBDEB7] shadow-xs flex flex-col gap-4">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-3 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">📦</span>
                      <div>
                        <h3 className="font-pixel text-[10px] text-brown-dark uppercase">My Nursery Inventory Shelf</h3>
                        <p className="text-[10px] text-gray-400 mt-0.5">Claimed potting orders arrive here! Ready to be planted into pots.</p>
                      </div>
                    </div>
                    <span className="bg-brown-main/5 text-brown-main text-[9px] font-pixel px-2.5 py-1 rounded-full border border-brown-main/10">
                      {(greenhouse.seedInventory || []).length} Seedbeds Available
                    </span>
                  </div>

                  {(greenhouse.seedInventory || []).length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {(greenhouse.seedInventory || []).map((seed) => {
                        const isEditing = editingSeedId === seed.id;
                        return (
                          <div key={seed.id} className="bg-[#FAF5EE] p-4 rounded-2xl border border-[#EBDEB7] shadow-xs flex flex-col gap-3 justify-between">
                            {isEditing ? (
                              <div className="flex flex-col gap-2.5">
                                <div className="text-[10px] font-bold text-brown-main uppercase tracking-wider font-pixel">✏️ Edit Seedling</div>
                                {/* Seed name input */}
                                <div className="flex flex-col gap-1">
                                  <label className="text-[9px] font-bold text-gray-400 uppercase">Nickname</label>
                                  <input
                                    type="text"
                                    value={editingSeedName}
                                    onChange={(e) => setEditingSeedName(e.target.value)}
                                    className="px-2.5 py-1.5 bg-white text-xs border border-brown-main/15 rounded-lg focus:outline-none focus:border-brown-main font-bold text-brown-dark"
                                    placeholder="Give it a name..."
                                  />
                                </div>
                                {/* Seed Species selector */}
                                <div className="flex flex-col gap-1">
                                  <label className="text-[9px] font-bold text-gray-400 uppercase">Cultivar Species</label>
                                  <select
                                    value={editingSeedType}
                                    onChange={(e) => setEditingSeedType(e.target.value)}
                                    className="px-2 py-1.5 bg-white text-[11px] border border-brown-main/15 rounded-lg focus:outline-none focus:border-brown-main text-brown-dark font-semibold"
                                  >
                                    <option value="Lavender">Crimson Lavender (🪻)</option>
                                    <option value="Desert Rose">Desert Sun Rose (🌹)</option>
                                    <option value="Sweet Chamomile">Wild Chamomile (🌼)</option>
                                    <option value="Golden Sunflower">Golden Sunflower (🌻)</option>
                                    <option value="Wild Orchid">Wild Orchid (🌸)</option>
                                    <option value="Friendly Cactus">Friendly Cactus (🌵)</option>
                                  </select>
                                </div>
                                
                                {/* Save/Cancel buttons */}
                                <div className="flex gap-2 mt-1">
                                  <button
                                    onClick={() => handleSaveSeedlingEdit(seed.id)}
                                    className="flex-1 py-1.5 bg-green-600 hover:bg-green-700 text-white font-pixel text-[8px] rounded-lg border-b-2 border-green-800 transition active:translate-y-0.5 leading-none"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingSeedId(null)}
                                    className="flex-1 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-pixel text-[8px] rounded-lg border-b-2 border-gray-400 transition active:translate-y-0.5 leading-none"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-center gap-2.5">
                                    <span className="text-3xl filter drop-shadow-xs select-none">{seed.emoji}</span>
                                    <div>
                                      <span className="font-bold text-xs text-brown-dark block leading-tight">"{seed.name}"</span>
                                      <span className="text-[9px] text-[#8B4513] font-semibold mt-0.5 block">{seed.type} Seedling</span>
                                    </div>
                                  </div>

                                  {/* Discard button */}
                                  <button
                                    onClick={() => handleDeleteSeedling(seed.id)}
                                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 rounded-sm transition-colors bg-white/50 border border-gray-100"
                                    title="Discard seedling"
                                  >
                                    <X size={12} />
                                  </button>
                                </div>

                                <div className="flex gap-2.5 pt-2 border-t border-dashed border-brown-main/10 mt-1">
                                  <button
                                    onClick={() => handleStartEditSeed(seed.id, seed.name, seed.type, seed.emoji)}
                                    className="px-2.5 py-1.5 bg-white border border-[#EBDEB7] hover:bg-brown-main/5 text-brown-main text-[9px] rounded-lg flex items-center justify-center gap-1 transition-all active:scale-95 shrink-0"
                                    title="Rename or customize"
                                  >
                                    ✏️ Edit
                                  </button>
                                  
                                  <button
                                    onClick={() => {
                                      if (greenhouse.flowerType) {
                                        triggerToast("⚠️ Your terracotta pot is busy growing a flower! Clear or harvest it first.");
                                        return;
                                      }
                                      handlePlantFromInventory(seed.id);
                                    }}
                                    className={`flex-1 py-1.5 font-pixel text-[8px] rounded-lg border-b-2 transition-all active:translate-y-0.5 uppercase shrink-0 ${
                                      greenhouse.flowerType 
                                        ? 'bg-[#EBDEB7]/20 border-gray-300 text-stone-400 cursor-not-allowed border-b-0' 
                                        : 'bg-[#4CAF50] border-[#2E7D32] hover:bg-[#45a049] text-white active:border-b-0'
                                    }`}
                                  >
                                    {greenhouse.flowerType ? 'Pot Occupied' : 'Plant Seedling'}
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-6 bg-[#FAF5EE]/40 border border-dashed border-[#EBDEB7] rounded-2xl text-center">
                      <p className="text-xs text-gray-400 italic">No seedling pots on your nursery shelves! Order a custom plant cup from the ordering desk below to start.</p>
                    </div>
                  )}
                </div>

                {/* Secondary Card 3: Botanical Flower Nursery Order Desk */}
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#EBDEB7] shadow-xs flex flex-col gap-4">
                  <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                    <span className="text-xl">🛍️</span>
                    <div>
                      <h3 className="font-pixel text-[10px] text-brown-dark uppercase">BOTANICAL FLOWER NURSERY ORDER DESK</h3>
                      <p className="text-[10px] text-gray-400 mt-0.5">Customize and add custom seedlings directly to your Order Cart! They will progress through the tracker once placed.</p>
                    </div>
                  </div>

                  <div className="bg-[#FAF5EE] p-5 rounded-2xl border border-[#EBDEB7] flex flex-col gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* Name Input */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Seedling Name (Nickname)</label>
                        <input 
                          type="text"
                          placeholder="e.g. Lavender Joy, Lucky Rosy..."
                          value={cashFlowerName}
                          onChange={(e) => setCashFlowerName(e.target.value)}
                          className="w-full p-2.5 bg-white text-xs border border-brown-main/15 rounded-xl focus:outline-none focus:border-brown-main"
                        />
                      </div>

                      {/* Species Select */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-[#8B4513] uppercase font-pixel">Flower Species</label>
                        <select
                          value={cashFlowerType}
                          onChange={(e) => setCashFlowerType(e.target.value)}
                          className="w-full p-2.5 bg-white text-xs border border-brown-main/15 rounded-xl focus:outline-none focus:border-brown-main font-semibold"
                        >
                          <option value="Lavender">Crimson Lavender (🪻)</option>
                          <option value="Desert Rose">Desert Sun Rose (🌹)</option>
                          <option value="Sweet Chamomile">Wild Chamomile (🌼)</option>
                          <option value="Golden Sunflower">Golden Sunflower (🌻)</option>
                          <option value="Wild Orchid">Wild Orchid (🌸)</option>
                          <option value="Friendly Cactus">Friendly Succulent Cactus (🌵)</option>
                        </select>
                      </div>

                      {/* Soil Mix Select */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Growth Substrate (Soil)</label>
                        <select
                          value={cashSoilType}
                          onChange={(e) => setCashSoilType(e.target.value)}
                          className="w-full p-2.5 bg-white text-xs border border-brown-main/15 rounded-xl focus:outline-none focus:border-brown-main"
                        >
                          <option value="Organic Peat Moss Substrate">Organic Peat (Base Price)</option>
                          <option value="Rich Volcanic Ash Mix">Volcanic Ash Bed [+$1.00]</option>
                          <option value="Honey Infused Coco Coir">Honey Coco Coir [+$1.50]</option>
                        </select>
                      </div>

                      {/* Terracotta Glaze select */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Planter Pot Glaze</label>
                        <select
                          value={cashPotGlaze}
                          onChange={(e) => setCashPotGlaze(e.target.value)}
                          className="w-full p-2.5 bg-white text-xs border border-brown-main/15 rounded-xl focus:outline-none focus:border-brown-main"
                        >
                          <option value="Traditional Clay Terracotta">Traditional Matte (Free)</option>
                          <option value="Starry Night Ceramic Glaze">Starry Night Ceramic [+$0.75]</option>
                          <option value="Luxury Copper Foil Trim">Luxe Copper Finish [+$1.50]</option>
                        </select>
                      </div>
                    </div>

                    {/* Price Calculation and Submit Button */}
                    {(() => {
                      let basePrice = 3.50;
                      if (cashFlowerType === 'Desert Rose') basePrice = 5.00;
                      if (cashFlowerType === 'Lavender') basePrice = 4.00;
                      if (cashFlowerType === 'Wild Orchid') basePrice = 4.50;

                      const soilAdd = cashSoilType === 'Rich Volcanic Ash Mix' ? 1.00 : cashSoilType === 'Honey Infused Coco Coir' ? 1.50 : 0;
                      const glazeAdd = cashPotGlaze === 'Starry Night Ceramic Glaze' ? 0.75 : cashPotGlaze === 'Luxury Copper Foil Trim' ? 1.50 : 0;
                      const totalCost = parseFloat((basePrice + soilAdd + glazeAdd).toFixed(2));

                      const cashFlowerEmojis: Record<string, string> = {
                        'Lavender': '🪻',
                        'Desert Rose': '🌹',
                        'Sweet Chamomile': '🌼',
                        'Golden Sunflower': '🌻',
                        'Wild Orchid': '🌸',
                        'Friendly Cactus': '🌵'
                      };
                      const finalEmoji = cashFlowerEmojis[cashFlowerType] || '🌱';

                      return (
                        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-dashed border-brown-main/10 pt-4 mt-2">
                          <div className="flex flex-col font-mono">
                            <span className="text-[10px] text-gray-400 font-bold uppercase">Estimated Bill summary</span>
                            <span className="text-sm font-bold text-[#8B4513] flex items-center gap-1.5 font-sans">
                              <span>{finalEmoji}</span>
                              <span className="font-pixel text-[11px]">${totalCost.toFixed(2)}</span>
                              <span className="text-[9px] text-[#4CAF50] font-pixel">(+{Math.round(totalCost * 15)} pts)</span>
                            </span>
                          </div>

                          <button
                            onClick={() => {
                              const nickname = cashFlowerName.trim() || `Little ${cashFlowerType}`;
                              handleAddToCartNurseryOrder(
                                cashFlowerType,
                                nickname,
                                finalEmoji,
                                cashSoilType,
                                cashPotGlaze,
                                totalCost
                              );
                              setCashFlowerName('');
                            }}
                            className="px-5 py-3 font-pixel text-[9px] bg-[#8B4513] border-b-4 border-brown-dark text-white rounded-xl active:translate-y-0.5 uppercase hover:bg-brown-main whitespace-nowrap"
                          >
                            🛒 Add to Order Cart (${totalCost.toFixed(2)})
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                </div>

              </motion.div>
            )}

            {/* TAB 4: ABOUT & REVIEWS PANEL */}
            {activeTab === 'about' && (
              <motion.div
                key="about-panel"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              >
                
                {/* Store review box */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                  <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#EBDEB7] shadow-xs flex flex-col gap-6">
                    <div>
                      <h2 className="font-pixel text-sm text-brown-dark mb-1">VISITORS NOTES & COMMENTS</h2>
                      <p className="text-xs text-gray-400 mt-1">Read about cozy baristas, relaxing rainy rainfalls, and garden views.</p>
                    </div>

                    {/* Review submit form */}
                    <form onSubmit={handleSubmitReview} className="bg-[#FAF5EE] p-5 rounded-2xl border border-[#EBDEB7] flex flex-col gap-4">
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <span className="font-bold text-xs text-brown-dark">Leave Your Experience Statement:</span>
                        
                        {/* Rating stars */}
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setNewReviewRating(star)}
                              className="text-orange-400 transition hover:scale-110"
                            >
                              <Star size={18} fill={star <= newReviewRating ? '#FF9800' : 'none'} stroke={star <= newReviewRating ? '#FF9800' : '#FFB74D'} />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="relative">
                        <textarea
                          placeholder="Tell us what you loved about our Lavender Field Lattes or cozy lounge corners..."
                          value={newReviewComment}
                          onChange={(e) => setNewReviewComment(e.target.value)}
                          className="w-full h-24 p-3 bg-white rounded-xl text-xs border border-brown-main/15 focus:outline-none focus:border-brown-main resize-none"
                          maxLength={300}
                        />
                        <span className="absolute bottom-2 right-3 text-[10px] text-gray-400 font-mono">{300 - newReviewComment.length} chars</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-[#4CAF50] font-black">{reviewMessage}</span>
                        <button
                          type="submit"
                          className="px-5 py-2.5 font-pixel text-[9px] bg-[#8B4513] border-b-4 border-brown-dark text-white rounded-lg active:translate-y-0.5 active:border-b-2 hover:bg-brown-main"
                        >
                          Submit Note
                        </button>
                      </div>
                    </form>

                    {/* Loaded Review Comments */}
                    <div className="flex flex-col gap-4">
                      {reviews.map((rev) => (
                        <div key={rev.id} className="p-4 rounded-2xl border border-gray-100 flex gap-4">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 uppercase shadow-xs self-start" style={{ backgroundColor: rev.avatarColor }}>
                            {rev.username.charAt(0)}
                          </div>
                          <div className="flex-1 flex flex-col gap-1.5">
                            <div className="flex justify-between items-center gap-2">
                              <div>
                                <span className="font-bold text-sm text-brown-dark">{rev.username}</span>
                                <span className="text-[10px] text-gray-400 ml-2 font-medium">{rev.date}</span>
                              </div>
                              <div className="flex">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star key={i} size={10} fill={i < rev.rating ? '#FF9800' : 'none'} stroke={i < rev.rating ? '#FF9800' : '#E0E0E0'} />
                                ))}
                              </div>
                            </div>
                            <p className="text-gray-500 text-xs leading-relaxed">
                              {rev.comment}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Cafe meta information */}
                <div className="flex flex-col gap-6">
                  <h2 className="font-pixel text-sm text-brown-dark border-b border-gray-200 pb-3">ESTABLISHMENT</h2>

                  <div className="bg-white p-6 rounded-3xl border border-[#EBDEB7] shadow-xs flex flex-col gap-5">
                    <div className="flex items-center gap-3">
                      <MapPin className="text-[#8B4513]" size={18} />
                      <div>
                        <span className="font-bold text-xs text-brown-dark block">Greenwood Sanctuary</span>
                        <span className="text-[10px] text-gray-400 block mt-0.5">Stall Lot 12, Blossom Lane Grid</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 border-t border-gray-100 pt-3">
                      <Clock className="text-[#8B4513]" size={18} />
                      <div>
                        <span className="font-bold text-xs text-brown-dark block">Daily Cafe Operating Hours</span>
                        <span className="text-[10px] text-gray-400 block mt-0.5">7:00 AM – 6:00 PM Autumn P.S.T</span>
                      </div>
                    </div>

                    <div className="text-center p-4 bg-[#FAF5EE] rounded-2xl text-xs text-gray-500 leading-relaxed font-sans mt-2 border border-brown-main/5">
                      "A relaxing haven where our plants grow tall, the coffee stream pulled has rich golden hazelnut oils, and our travelers can write dreams inside the rain-scented ledger."
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>

      {/* FLOATING CART SUMMARY SIDECAR */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black z-40"
            />

            {/* Slide menu */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-[#FAF5EE] border-l-4 border-brown-main/15 z-50 shadow-2xl flex flex-col justify-between"
            >
              <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
                <div className="flex items-center justify-between border-b border-[#EBDEB7] pb-4">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="text-brown-main" size={20} />
                    <h3 className="font-pixel text-[11px] text-brown-dark">MY COZY SHOPPING ORDER</h3>
                  </div>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="p-1 rounded-full hover:bg-gray-200 transition text-gray-500"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Cart list */}
                <div className="flex flex-col gap-4">
                  {cart.map((item) => (
                    <div key={item.id} className="bg-white p-4 rounded-2xl border border-[#EBDEB7] flex justify-between gap-3 relative">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 bg-[#FAF5EE] rounded-xl border border-[#EBDEB7] flex items-center justify-center text-xl self-start select-none">
                          {item.menuItem.emoji}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-brown-dark leading-tight">{item.menuItem.name}</h4>
                          <span className="text-[10px] text-brown-main font-semibold mt-0.5 block">${item.menuItem.price.toFixed(2)} each</span>
                          
                          <div className="text-[9px] text-[#8B4513] font-bold flex flex-wrap gap-1.5 mt-2.5 bg-[#FAF5EE] p-1.5 rounded-lg border border-brown-main/5 w-fit">
                            <span>📐 {item.size}</span>
                            <span>🍬 {item.sweetness}</span>
                            {item.milk !== 'None' && <span>🥛 {item.milk}</span>}
                            {item.additionalNotes && <span className="block italic">📝 "{item.additionalNotes}"</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col justify-between items-end shrink-0 pl-1">
                        <button 
                          onClick={() => handleRemoveCartItem(item.id)}
                          className="p-1 rounded-full hover:bg-red-50 text-red-500 transition scale-90 self-end -mt-1 -mr-1"
                        >
                          <X size={14} />
                        </button>
                        
                        <span className="font-pixel text-[10px] text-brown-dark font-bold">${(item.menuItem.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}

                  {cart.length === 0 && (
                    <div className="text-center py-20 text-gray-400">
                      <ShoppingBag size={32} className="mx-auto mb-2 text-gray-300" />
                      <p className="text-xs">Your shopping cup is empty!</p>
                    </div>
                  )}
                </div>

                {/* Service pickup properties */}
                {cart.length > 0 && (
                  <div className="bg-white p-4 rounded-2xl border border-[#EBDEB7] flex flex-col gap-4 mt-2">
                    <span className="font-bold text-xs text-brown-dark block">Select Dining Method:</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setDineInMethod('Pickup')}
                        className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                          dineInMethod === 'Pickup'
                            ? 'bg-[#8B4513] text-white shadow-xs'
                            : 'bg-gray-50 text-gray-500 border border-gray-100 hover:bg-gray-100'
                        }`}
                      >
                        🛍️ Counter Pickup
                      </button>
                      <button
                        onClick={() => setDineInMethod('Table Dine-in')}
                        className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                          dineInMethod === 'Table Dine-in'
                            ? 'bg-[#8B4513] text-white shadow-xs'
                            : 'bg-gray-50 text-gray-500 border border-gray-100 hover:bg-gray-100'
                        }`}
                      >
                        <Table size={14} /> Dine-In Table
                      </button>
                    </div>

                    {dineInMethod === 'Table Dine-in' && (
                      <div className="flex items-center justify-between text-xs border-t border-dashed border-gray-100 pt-3">
                        <span>Enter Desk/Table Number:</span>
                        <input
                          type="number"
                          min="1"
                          max="30"
                          value={tableNumber}
                          onChange={(e) => setTableNumber(e.target.value)}
                          className="w-14 px-2 py-1 text-center bg-[#FAF5EE] border border-[#EBDEB7] rounded-lg font-bold"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bill Details */}
              {cart.length > 0 && (
                <div className="p-6 bg-white border-t-4 border-[#EBDEB7] flex flex-col gap-4">
                  <div className="flex flex-col gap-2 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>Items Subtotal</span>
                      <span className="font-mono">${cartSubtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                      <span>Service HST Tax (12%)</span>
                      <span className="font-mono">${cartTax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between pt-1 font-bold text-[#5D4037]">
                      <span className="text-sm">Total Checkout Price</span>
                      <span className="font-pixel text-[10px] text-brown-dark">${cartTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="w-full pixel-button py-3 text-xs tracking-wider font-bold mb-1"
                  >
                    CONFIRM CHECKOUT
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ITEM CUSTOMIZER DIALOG OVERLAY */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-7 pixel-border rounded-3xl max-w-lg w-full flex flex-col gap-6 shadow-2xl overflow-y-auto max-h-[92vh]"
            >
              {/* Header */}
              <div className="flex justify-between items-start gap-4">
                <div className="flex gap-3.5 items-center">
                  <div className="w-12 h-12 bg-[#FAF5EE] rounded-2xl flex items-center justify-center border border-[#EBDEB7] text-2xl select-none">
                    {selectedItem.emoji}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#5D4037] text-lg leading-tight">{selectedItem.name}</h3>
                    <p className="text-xs text-[#8B4513] font-bold mt-0.5">
                      {(() => {
                        let base = selectedItem.price;
                        if (selectedItem.category === 'flowers') {
                          if (customSize === 'Large') base += 1.50;
                          if (customSize === 'Small') base -= 0.50;
                          if (customSweet === '25%') base += 1.00;
                          if (customSweet === '50%') base += 1.50;
                          if (customSweet === '100%') base += 2.00;
                          if (customMilk === 'Oat Milk') base += 0.75;
                          if (customMilk === 'Cow Milk') base += 1.50;
                          if (customMilk === 'Almond Milk') base += 1.00;
                        } else {
                          if (customSize === 'Large') base += 1.50;
                        }
                        return `$${base.toFixed(2)}`;
                      })()} based config
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="p-1 rounded-full hover:bg-gray-100 text-gray-400"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Multi-step configurations */}
              <div className="flex flex-col gap-5 border-t border-b border-[#FAF5EE] py-4">
                
                {/* 1. Size Select */}
                <div className="flex flex-col gap-2.5">
                  <span className="font-bold text-xs text-brown-dark flex items-center justify-between">
                    <span>{selectedItem.category === 'flowers' ? '1. SELECT POT/PLANTER SIZE' : '1. SELECT CUP SIZE'}</span>
                    <span className="text-[10px] text-gray-400 font-medium">
                      {selectedItem.category === 'flowers' 
                        ? (customSize === 'Small' ? 'Mini Seedbed (-$0.50)' : customSize === 'Medium' ? 'Standard Pot (+$0.00)' : 'Luxe Terracotta Pot (+$1.50)')
                        : (customSize === 'Small' ? '8oz Standard' : customSize === 'Medium' ? '12oz Medium (+$0.00)' : '16oz Big Tall (+$1.50)')}
                    </span>
                  </span>
                  
                  <div className="grid grid-cols-3 gap-2.5">
                    {(['Small', 'Medium', 'Large'] as SizeOption[]).map((size) => (
                      <button
                        key={size}
                        onClick={() => setCustomSize(size)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1.5 ${
                          customSize === size 
                            ? 'bg-[#8B4513] text-white shadow-xs' 
                            : 'bg-[#FAF5EE] text-[#5D4037] hover:bg-brown-main/5'
                        }`}
                      >
                        {/* Interactive scaling size mug or pot */}
                        <div className="flex items-end justify-center h-8 select-none">
                          {selectedItem.category === 'flowers' ? (
                            <span className={`block uppercase font-bold leading-none ${size === 'Small' ? 'text-[14px]' : size === 'Medium' ? 'text-[22px]' : 'text-[30px]'}`}>🪴</span>
                          ) : (
                            <span className={`block uppercase font-bold leading-none ${size === 'Small' ? 'text-[14px]' : size === 'Medium' ? 'text-[22px]' : 'text-[30px]'}`}>☕</span>
                          )}
                        </div>
                        <span className="scale-90 font-bold">
                          {selectedItem.category === 'flowers'
                            ? (size === 'Small' ? 'Mini Bed' : size === 'Medium' ? 'Standard' : 'Luxe Clay')
                            : size}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Sweetness modifier / Soil substrate */}
                <div className="flex flex-col gap-2.5">
                  <span className="font-bold text-xs text-brown-dark">
                    {selectedItem.category === 'flowers' ? '2. NUTRITIONAL GROWTH SUBSTRATE (SOIL)' : '2. SWEETNESS SEED STRAW'}
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(['0%', '25%', '50%', '100%'] as SweetnessOption[]).map((sweet) => (
                      <button
                        key={sweet}
                        onClick={() => setCustomSweet(sweet)}
                        className={`py-2 rounded-xl text-xs font-bold transition ${
                          customSweet === sweet 
                            ? 'bg-[#8B4513] text-white shadow-xs' 
                            : 'bg-[#FAF5EE] text-[#5D4037] hover:bg-brown-main/5'
                        }`}
                      >
                        {selectedItem.category === 'flowers' ? (
                          <>
                            {sweet === '0%' && '🪨 Peat Moss'}
                            {sweet === '25%' && '🌋 Volcanic (+$1)'}
                            {sweet === '50%' && '🥥 Coco (+$1.5)'}
                            {sweet === '100%' && '🪵 Bark (+$2)'}
                          </>
                        ) : (
                          <>
                            {sweet === '0%' && '🧊 Unsweetened'}
                            {sweet === '25%' && '🍬 25% Low'}
                            {sweet === '50%' && '🍬 50% Half'}
                            {sweet === '100%' && '🍯 100% Full'}
                          </>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Milk alternative if drink, or Clay Glaze if flowers */}
                {(selectedItem.category === 'coffee' || selectedItem.category === 'tea' || selectedItem.category === 'flowers') && (
                  <div className="flex flex-col gap-2.5">
                    <span className="font-bold text-xs text-brown-dark">
                      {selectedItem.category === 'flowers' ? '3. PLANTER GLAZE & OUTER FINISH' : '3. MILK OR STRAW TYPE'}
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {(['None', 'Oat Milk', 'Cow Milk', 'Almond Milk'] as MilkOption[]).map((milkName) => (
                        <button
                          key={milkName}
                          onClick={() => setCustomMilk(milkName)}
                          className={`py-2 rounded-xl text-xs font-bold transition ${
                            customMilk === milkName 
                              ? 'bg-[#8B4513] text-white shadow-xs' 
                              : 'bg-[#FAF5EE] text-gray-600 hover:bg-brown-main/5'
                          }`}
                        >
                          {selectedItem.category === 'flowers' ? (
                            <>
                              {milkName === 'None' && '🏺 Matte Clay'}
                              {milkName === 'Oat Milk' && '✨ Starry (+$0.75)'}
                              {milkName === 'Cow Milk' && '👑 Gold Trim (+$1.5)'}
                              {milkName === 'Almond Milk' && '🌿 Moss (+$1)'}
                            </>
                          ) : (
                            milkName
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Additional bar notes or Botanical Nickname */}
                <div className="flex flex-col gap-2">
                  <span className="font-bold text-xs text-brown-dark">
                    {selectedItem.category === 'flowers' ? '4. CUSTOM BOTANICAL NICKNAME' : '4. SPECIAL REQUEST NOTES'}
                  </span>
                  <input
                    type="text"
                    placeholder={selectedItem.category === 'flowers' ? "Give it a beautiful name (e.g. Lavender Joy, Little Rosy)..." : "Extra hot, decaf, ice split, or warm instructions..."}
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    className="w-full px-4 py-2 bg-[#FAF5EE] rounded-xl text-xs border border-brown-main/15 focus:outline-none focus:border-brown-main"
                  />
                </div>
              </div>

              {/* Add Trigger Footer */}
              <div className="flex justify-between items-center mt-1">
                <div className="flex items-center gap-3 bg-[#FAF5EE] px-4 py-2 rounded-2xl border border-[#EBDEB7]">
                  <button 
                    onClick={() => setCustomQty(prev => Math.max(1, prev - 1))}
                    className="p-1 rounded-full hover:bg-gray-200 text-[#8B4513] font-bold"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="font-bold font-pixel text-xs text-brown-dark w-4 text-center">{customQty}</span>
                  <button 
                    onClick={() => setCustomQty(prev => prev + 1)}
                    className="p-1 rounded-full hover:bg-gray-200 text-[#8B4513]"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="px-6 py-3 font-pixel text-[10px] bg-[#8B4513] border-b-4 border-brown-dark text-white rounded-xl active:translate-y-0.5 active:border-b-2 hover:bg-brown-main flex items-center gap-2"
                >
                  <ShoppingBag size={14} /> ADD TO ORDER
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CHECKOUT PLACING ORDER LOADING DISPLAY POPUP */}
      <AnimatePresence>
        {checkoutSuccess && (
          <div className="fixed inset-0 z-50 bg-black/70 flex flex-col items-center justify-center p-4 backdrop-blur-xs text-white">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-center"
            >
              <div className="text-7xl mb-4 select-none">🫖✨</div>
              <h3 className="font-pixel text-sm tracking-widest text-[#FFCC80] mb-2">GOLDEN SEED PLACED</h3>
              <p className="text-xs text-gray-300 max-w-sm mx-auto leading-relaxed">
                Gardener register points applied! Wait a tiny bit while our beautiful counter brews your lavender drinks inside.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MAIN FOOTER */}
      <footer className="bg-white border-t-2 border-brown-main/5 px-6 py-3 shrink-0 flex justify-between items-center text-[11px] text-gray-400 font-medium">
        <div className="flex items-center gap-1.5">
          <Leaf size={12} className="text-[#4CAF50]" />
          <span>Established Greenwood Cafe 2026</span>
        </div>
        
        {/* Floating Shopping cart bubble trigger */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white rounded-full font-pixel text-[9px] px-4.5 py-2 flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all text-gray-900 border-2 border-orange-700"
        >
          <ShoppingBag size={14} /> ORDER ({cart.length})
        </button>
      </footer>

    </div>
  );
}
