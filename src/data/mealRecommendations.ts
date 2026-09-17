import { MealPlanTemplate } from '../types';

export const MEAL_PLAN_TEMPLATES: MealPlanTemplate[] = [
  {
    id: 'glp1-reta-gut-friendly',
    title: 'GLP-1 & Retatrutide Lean Preservation Plan',
    tagline: 'High-protein, low-volume meals tailored for delayed gastric emptying and zero nausea.',
    totalCalories: 1750,
    protein: 155,
    carbs: 140,
    fat: 55,
    fiber: 30,
    targetType: 'glp1_optimized',
    badge: 'GLP-1 / Reta Friendly',
    scientificInsight:
      'Incretin therapies slow stomach transit. Eating large, greasy portions causes sulfur burps and nausea. This menu concentrates bioavailable protein and soluble fiber into modest portions that empty comfortably.',
    meals: [
      {
        mealType: 'Breakfast',
        recipe: {
          name: 'Vanilla Greek Yogurt & Berry Crunch Cup',
          portion: '1 bowl (320g)',
          calories: 360,
          protein: 36,
          carbs: 34,
          fat: 8,
          fiber: 7,
          description:
            '200g 0% fat Greek yogurt mixed with 15g whey isolate, 80g raspberries, 15g chia seeds, and 15g toasted crushed walnuts.',
          isGLP1Friendly: true,
        },
      },
      {
        mealType: 'Lunch',
        recipe: {
          name: 'Herb Grilled Chicken & Quinoa Tender Salad',
          portion: '1 bowl (350g)',
          calories: 460,
          protein: 44,
          carbs: 42,
          fat: 12,
          fiber: 8,
          description:
            '150g grilled chicken breast sliced over 100g cooked warm quinoa, diced seedless cucumber, baby spinach, and 1 tsp extra virgin olive oil with lemon juice.',
          isGLP1Friendly: true,
        },
      },
      {
        mealType: 'Dinner',
        recipe: {
          name: 'Pan-Seared Salmon Fillet with Steamed Zucchini & Sweet Mash',
          portion: '1 plate (380g)',
          calories: 520,
          protein: 45,
          carbs: 38,
          fat: 20,
          fiber: 7,
          description:
            '140g wild-caught salmon fillet seasoned with dill, served with 120g mashed sweet potato and steamed zucchini medallions (gentle on delayed gastric emptying).',
          isGLP1Friendly: true,
        },
      },
      {
        mealType: 'Snack',
        recipe: {
          name: 'Clear Whey / Whey Isolate Citrus Cooler + Almonds',
          portion: '1 drink + snack (280ml)',
          calories: 210,
          protein: 30,
          carbs: 6,
          fat: 8,
          fiber: 4,
          description:
            '1 scoop clear whey isolate shaken in cold electrolyte water, paired with 15 raw almonds. Perfect for days when solid food appetite is blunted.',
          isGLP1Friendly: true,
        },
      },
    ],
  },
  {
    id: 'high-protein-deficit',
    title: 'High-Satiety Fat Loss Blueprint',
    tagline: 'Maximum satiety index and thermic effect of food to preserve every gram of muscle.',
    totalCalories: 1950,
    protein: 175,
    carbs: 165,
    fat: 58,
    fiber: 36,
    targetType: 'high_protein',
    badge: 'Lean Deficit',
    scientificInsight:
      'Backed by Morton et al. (2018) & Leidy et al. (2015). High protein distribution prevents catabolism during hypocaloric states while high fiber blunt insulin spikes and cravings.',
    meals: [
      {
        mealType: 'Breakfast',
        recipe: {
          name: 'High-Protein Egg White & Smoked Turkey Omelet',
          portion: '1 plate (350g)',
          calories: 410,
          protein: 42,
          carbs: 32,
          fat: 12,
          fiber: 8,
          description:
            '1 whole egg + 180g liquid egg whites, 50g nitrate-free turkey breast, baby spinach, bell peppers, served with 1 slice toasted sourdough bread.',
          isGLP1Friendly: false,
        },
      },
      {
        mealType: 'Lunch',
        recipe: {
          name: 'Steak & Roasted Sweet Potato Power Bowl',
          portion: '1 bowl (420g)',
          calories: 540,
          protein: 48,
          carbs: 48,
          fat: 16,
          fiber: 9,
          description:
            '160g lean top sirloin steak grilled, 150g roasted sweet potato cubes, roasted broccoli florets, and light chimichurri drizzle.',
          isGLP1Friendly: false,
        },
      },
      {
        mealType: 'Dinner',
        recipe: {
          name: 'Lemon Herb Cod Fillet with Brown Jasmine Rice & Asparagus',
          portion: '1 plate (400g)',
          calories: 480,
          protein: 45,
          carbs: 44,
          fat: 12,
          fiber: 6,
          description:
            '180g baked Pacific cod fillet, 120g cooked brown jasmine rice, grilled asparagus spears tossed in 1 tsp olive oil and garlic.',
          isGLP1Friendly: true,
        },
      },
      {
        mealType: 'Snack',
        recipe: {
          name: 'Cottage Cheese & Cinnamon Apple Slices',
          portion: '1 bowl (260g)',
          calories: 260,
          protein: 28,
          carbs: 24,
          fat: 5,
          fiber: 5,
          description:
            '180g low-fat cottage cheese (slow-digesting casein protein) dusted with ceylon cinnamon and paired with 1 sliced Honeycrisp apple.',
          isGLP1Friendly: true,
        },
      },
    ],
  },
  {
    id: 'muscle-gain-surplus',
    title: 'Clean Hypertrophy & Fueling Plan',
    tagline: 'Nutrient-dense caloric surplus to fuel heavy training, glycogen storage, and new tissue synthesis.',
    totalCalories: 2550,
    protein: 185,
    carbs: 290,
    fat: 75,
    fiber: 38,
    targetType: 'muscle_gain',
    badge: 'Hypertrophy Surplus',
    scientificInsight:
      'Surplus caloric availability drives maximum muscle protein synthesis and performance recovery according to Helms et al. (2014). Carbs replenish muscular glycogen reserves.',
    meals: [
      {
        mealType: 'Breakfast',
        recipe: {
          name: 'Pro-Oats Power Porridge with Banana & Peanut Butter',
          portion: '1 bowl (450g)',
          calories: 620,
          protein: 45,
          carbs: 72,
          fat: 18,
          fiber: 10,
          description:
            '80g rolled oats cooked in almond milk, mixed with 35g whey protein, 1 sliced banana, and 20g natural peanut butter.',
          isGLP1Friendly: false,
        },
      },
      {
        mealType: 'Lunch',
        recipe: {
          name: 'Ground Turkey & Jasmine Rice Burrito Bowl',
          portion: '1 large bowl (520g)',
          calories: 690,
          protein: 52,
          carbs: 78,
          fat: 18,
          fiber: 11,
          description:
            '180g 93/7 lean ground turkey with Mexican spices, 180g cooked jasmine rice, 60g black beans, fresh pico de gallo, and 40g sliced avocado.',
          isGLP1Friendly: false,
        },
      },
      {
        mealType: 'Dinner',
        recipe: {
          name: 'Sirloin Beef Stir-Fry with Egg Noodles & Vegetables',
          portion: '1 plate (500g)',
          calories: 710,
          protein: 50,
          carbs: 82,
          fat: 20,
          fiber: 9,
          description:
            '170g sirloin strips flash-fried with ginger, garlic, snap peas, bell peppers, and 150g egg noodles in a reduced-sodium soy glaze.',
          isGLP1Friendly: false,
        },
      },
      {
        mealType: 'Snack',
        recipe: {
          name: 'Greek Yogurt Parfait with Honey & Pumpkin Seeds',
          portion: '1 bowl (300g)',
          calories: 330,
          protein: 32,
          carbs: 34,
          fat: 9,
          fiber: 4,
          description:
            '200g Greek yogurt topped with 1 tsp raw honey, 20g pumpkin seeds, and a handful of fresh blueberries.',
          isGLP1Friendly: true,
        },
      },
    ],
  },
];
