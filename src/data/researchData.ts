import { ResearchStudy } from '../types';

export const RESEARCH_STUDIES: ResearchStudy[] = [
  {
    id: 'morton-2018',
    title: 'Protein Supplementation & Lean Mass Retention During Resistance Training',
    authors: 'Morton RW, Murphy KT, McKellar SR, et al.',
    journal: 'British Journal of Sports Medicine',
    year: 2018,
    doiOrUrl: 'https://pubmed.ncbi.nlm.nih.gov/28698222/',
    category: 'protein',
    keyTakeaway:
      'Protein intakes beyond 1.62 g/kg/day (with 95% CI extending to ~2.2 g/kg/day) optimize muscle protein synthesis. When in an active caloric deficit, staying closer to 1.8–2.2 g/kg prevents catabolism of functional skeletal muscle.',
    clinicalContext:
      'Meta-analysis of 49 randomized controlled trials with 1,863 participants evaluating the dose-response relationship between dietary protein intake and lean muscle mass accretion.',
    actionableProtocol:
      'Distribute protein evenly across 3 to 4 meals (roughly 0.4–0.5 g/kg per meal) to trigger the muscle protein synthesis leucine threshold (~2.5–3g leucine per serving).',
  },
  {
    id: 'jastreboff-retatrutide-2023',
    title: 'Triple-Hormone-Receptor Agonist Retatrutide for Obesity (Phase 2 Trial)',
    authors: 'Jastreboff AM, Kaplan LM, Frías JP, et al.',
    journal: 'The New England Journal of Medicine (NEJM)',
    year: 2023,
    doiOrUrl: 'https://pubmed.ncbi.nlm.nih.gov/37366315/',
    category: 'glp1_reta',
    keyTakeaway:
      'Retatrutide engages GLP-1, GIP, and Glucagon receptors simultaneously, yielding up to 24.2% mean body weight reduction at 48 weeks. Glucagon receptor agonism directly boosts resting energy expenditure and hepatic lipid turnover.',
    clinicalContext:
      'Phase 2 multi-center double-blind randomized clinical trial. Glucagon activation uniquely prevents the severe metabolic down-regulation typical of deep caloric deficits, but makes skeletal muscle preservation through progressive resistance training imperative.',
    actionableProtocol:
      'For Retatrutide users: Maintain 1.8–2.2g protein per kg, prioritize progressive resistance training 3–4 days/week to prevent sarcopenia, and maintain structured electrolyte hydration to buffer rapid metabolic shifts.',
  },
  {
    id: 'wilding-step1-2021',
    title: 'Semaglutide 2.4 mg & Body Composition in Obesity (STEP 1 Trial)',
    authors: 'Wilding JPH, Batterham RL, Calanna S, et al.',
    journal: 'The New England Journal of Medicine (NEJM)',
    year: 2021,
    doiOrUrl: 'https://pubmed.ncbi.nlm.nih.gov/33567185/',
    category: 'glp1_reta',
    keyTakeaway:
      'Sub-studies utilizing DEXA body scans revealed that approximately 35–40% of total mass lost during rapid incretin-driven weight loss can originate from fat-free lean mass without deliberate resistance training and protein prioritization.',
    clinicalContext:
      'In a 68-week trial of once-weekly subcutaneous semaglutide, participants lost an average of 14.9% of body weight. Sarcopenic obesity risk must be combated through structured loading and amino acid availability.',
    actionableProtocol:
      'Never allow daily calorie intake to drop below calculated BMR guardrails. Consume whey or plant protein isolate shakes when whole-food appetite is suppressed by delayed gastric emptying.',
  },
  {
    id: 'schoenfeld-frequency-2016',
    title: 'Resistance Training Frequency & Muscle Hypertrophy Systematic Review',
    authors: 'Schoenfeld BJ, Ogborn D, Krieger JW',
    journal: 'Sports Medicine',
    year: 2016,
    doiOrUrl: 'https://pubmed.ncbi.nlm.nih.gov/27102172/',
    category: 'hypertrophy',
    keyTakeaway:
      'Training each major muscle group at least twice weekly elicits superior muscle hypertrophy and strength adaptations compared to once-weekly training routines when weekly volume is equated.',
    clinicalContext:
      'Comparing identical weekly volumes split across 1 vs 2–3 sessions showed improved muscle protein synthesis signaling windows across 48–72 hour periods.',
    actionableProtocol:
      'Adopt an Upper/Lower or 3-Day Full Body split where each muscle group receives 10–18 high-quality working sets per week spread across multiple sessions.',
  },
  {
    id: 'leidy-satiety-2015',
    title: 'The Role of Protein in Weight Management, Thermogenesis & Satiety Peptides',
    authors: 'Leidy HJ, Clifton PM, Astrup A, et al.',
    journal: 'The American Journal of Clinical Nutrition',
    year: 2015,
    doiOrUrl: 'https://pubmed.ncbi.nlm.nih.gov/25926512/',
    category: 'protein',
    keyTakeaway:
      'Dietary protein exhibits the highest thermic effect of food (20–30% of energy consumed is burned during digestion, versus 5–10% for carbs and 0–3% for fats) while maximizing satiety hormones PYY and GLP-1.',
    clinicalContext:
      'Consuming 25–30g of high-biological-value protein at breakfast significantly suppressed evening ghrelin spikes and spontaneous grazing.',
    actionableProtocol:
      'Anchor your first meal of the day with at least 30g of bioavailable protein (eggs, Greek yogurt, or whey) to stabilize appetite and blood glucose.',
  },
  {
    id: 'nauck-gastric-emptying-2021',
    title: 'Incretin Hormones, Gastric Motility & Gastrointestinal Tolerability',
    authors: 'Nauck MA, Quast DR, Wefers J, Meier JJ',
    journal: 'Molecular Metabolism',
    year: 2021,
    doiOrUrl: 'https://pubmed.ncbi.nlm.nih.gov/33181350/',
    category: 'glp1_reta',
    keyTakeaway:
      'GLP-1 receptor activation slows gastric emptying significantly in the initial post-dose period. High-fat or overly volumetric meals delay transit excessively, triggering gastrointestinal distress, sulfur burps, and nausea.',
    clinicalContext:
      'Mechanistic study detailing vagal and central appetite pathways. Tachyphylaxis to gastric slowing occurs over time, but mindful meal sizing and lower saturated fats eliminate the majority of adverse effects.',
    actionableProtocol:
      'Eat smaller, calorie-dense, low-grease portions. Cease eating at least 3 hours prior to sleep to avoid nocturnal acid reflux from delayed gastric emptying.',
  },
];
