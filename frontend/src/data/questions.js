export const SECTIONS = [
  {
    id: 'values',
    title: 'Personal Values & Beliefs',
    icon: '💎',
    description: 'Understanding what you hold most dear',
    questions: [
      {
        id: 'commitment_view', type: 'choice',
        text: 'Which best describes your view on commitment?',
        options: [
          { value: 'all_in',      label: '🔒 All In',      desc: 'I give 100% once I commit' },
          { value: 'gradual',     label: '🌱 Gradual',      desc: 'I ease in as trust builds' },
          { value: 'conditional', label: '⚖️ Conditional',  desc: 'Depends on what I receive back' },
          { value: 'adaptive',    label: '🌊 Adaptive',     desc: 'I adjust to what the relationship needs' },
        ],
      },
      { id: 'honesty_importance', type: 'scale', text: 'How important is honesty to you in a relationship?', low: 'Not essential', high: 'Non-negotiable' },
      { id: 'mutual_respect',     type: 'scale', text: 'Mutual respect is the foundation of any relationship.', low: 'Disagree', high: 'Strongly agree' },
      { id: 'cultural_traditions',type: 'scale', text: 'Cultural and social traditions should play a significant role in relationships.', low: 'Not important', high: 'Very important' },
      { id: 'commitment_meaning', type: 'text',  text: 'Describe what a committed relationship means to you.', placeholder: 'What does commitment look like in your ideal relationship?' },
    ],
  },
  {
    id: 'eq',
    title: 'Emotional Intelligence',
    icon: '🧠',
    description: 'How you understand and manage emotions',
    questions: [
      { id: 'self_awareness', type: 'scale', text: 'I am able to recognize my own emotions as I experience them.', low: 'Rarely', high: 'Almost always' },
      { id: 'empathy',        type: 'scale', text: "I can empathize with others' feelings even when they differ from my own.", low: 'Rarely', high: 'Almost always' },
      {
        id: 'stress_response', type: 'choice',
        text: 'When I feel stressed, I usually:',
        options: [
          { value: 'withdraw',      label: '🌑 Withdraw',     desc: 'Process alone in quiet' },
          { value: 'talk',          label: '💬 Talk it out',   desc: 'Share with someone I trust' },
          { value: 'distract',      label: '🎮 Distract',      desc: 'Shift focus to activities' },
          { value: 'problem_solve', label: '🔧 Problem-solve', desc: 'Address the root cause directly' },
        ],
      },
      {
        id: 'partner_upset', type: 'choice',
        text: "If my partner is upset but doesn't want to talk, I:",
        options: [
          { value: 'give_space',    label: '🚪 Give space',     desc: 'Respect their need and check in later' },
          { value: 'gently_ask',   label: '🤍 Gently ask',     desc: "Softly check what's wrong" },
          { value: 'cheer_up',     label: '🎉 Cheer them up',  desc: 'Try to lighten the mood' },
          { value: 'wait_patient', label: '⏳ Wait patiently', desc: "Stay present until they're ready" },
        ],
      },
      { id: 'conflict_story', type: 'text', text: 'Describe a situation where you successfully managed a conflict with someone close to you.', placeholder: 'How did you approach it, and what was the outcome?' },
    ],
  },
  {
    id: 'behavioral',
    title: 'Behavioral Reactions',
    icon: '⚡',
    description: 'How you respond to real-life situations',
    questions: [
      {
        id: 'forgotten_date', type: 'choice',
        text: 'If your partner forgets an important date (anniversary, birthday), you:',
        options: [
          { value: 'talk',       label: '💬 Discuss it',   desc: 'Tell them how it made me feel' },
          { value: 'let_go',     label: '🕊️ Let it go',    desc: 'People forget — not a big deal' },
          { value: 'go_quiet',   label: '😶 Go quiet',     desc: 'Withdraw until I process it' },
          { value: 'practical',  label: '📅 Solve it',     desc: 'Set reminders together going forward' },
        ],
      },
      {
        id: 'job_offer', type: 'choice',
        text: 'Your partner receives a dream job offer in another city. You:',
        options: [
          { value: 'support',        label: '✈️ Support fully',    desc: "Their career matters — we'll figure it out" },
          { value: 'decide_together', label: '🤝 Decide together', desc: 'This affects both of us equally' },
          { value: 'try_distance',   label: '📞 Try long-distance', desc: 'Open to it if the relationship is strong' },
          { value: 'hard_talk',      label: '⚠️ Serious talk',     desc: 'That would be very difficult for me' },
        ],
      },
      { id: 'handles_criticism', type: 'scale', text: 'I handle criticism well and use it to grow.', low: 'Rarely', high: 'Almost always' },
      { id: 'impulsive',         type: 'scale', text: "I tend to react impulsively when things don't go my way.", low: 'Never', high: 'Very often' },
      { id: 'disagreement_style', type: 'text', text: 'How do you typically respond when you and a partner have a disagreement?', placeholder: 'Walk us through your usual approach...' },
    ],
  },
  {
    id: 'lifestyle',
    title: 'Lifestyle & Goals',
    icon: '🎯',
    description: 'Your ambitions and how you live day-to-day',
    questions: [
      { id: 'work_life_balance', type: 'scale', text: 'Maintaining a healthy work-life balance is important to me.', low: 'Not a priority', high: 'Essential' },
      { id: 'personal_growth',   type: 'scale', text: 'I prioritize personal growth and self-improvement.', low: 'Rarely', high: 'Constantly' },
      {
        id: 'finances', type: 'choice',
        text: 'Which best describes your approach to finances?',
        options: [
          { value: 'saver',    label: '🏦 Saver',    desc: 'Save first, spend carefully' },
          { value: 'balanced', label: '⚖️ Balanced', desc: 'Save and enjoy in moderation' },
          { value: 'spender',  label: '🛍️ Enjoyer',  desc: 'Life is short — I enjoy it' },
          { value: 'investor', label: '📈 Investor', desc: 'Money is a tool for future freedom' },
        ],
      },
      {
        id: 'travel_freq', type: 'choice',
        text: 'How often do you typically travel?',
        options: [
          { value: 'monthly',    label: '🌍 Monthly',          desc: 'Always somewhere new' },
          { value: 'few_a_year', label: '🗺️ Few times a year', desc: 'Regular but not constant' },
          { value: 'once_a_year', label: '📅 Once a year',     desc: 'The annual trip' },
          { value: 'rarely',     label: '🏡 Rarely',           desc: 'Home is where the heart is' },
        ],
      },
      { id: 'life_goals', type: 'text', text: 'What are your top goals for the next five years?', placeholder: 'Career, family, travel, personal development — anything that matters to you.' },
    ],
  },
  {
    id: 'communication',
    title: 'Communication Style',
    icon: '💬',
    description: 'How you express yourself and handle dialogue',
    questions: [
      {
        id: 'discussion_style', type: 'choice',
        text: 'In discussions, I prefer to:',
        options: [
          { value: 'listen_first',   label: '👂 Listen first',    desc: 'Hear everything before responding' },
          { value: 'express_freely', label: '🗣️ Express freely',  desc: 'Share thoughts as they come' },
          { value: 'think_then',     label: '🤔 Think, then talk', desc: 'Reflect before speaking' },
          { value: 'collaborative',  label: '🤝 Collaborate',     desc: "Build on each other's ideas together" },
        ],
      },
      {
        id: 'conflict_resolution', type: 'choice',
        text: 'When resolving conflicts, I usually:',
        options: [
          { value: 'direct',     label: '🎯 Direct',         desc: 'Address it head-on immediately' },
          { value: 'cool_down',  label: '❄️ Cool down first', desc: 'Take time, then revisit' },
          { value: 'compromise', label: '🤝 Compromise',     desc: 'Find middle ground quickly' },
          { value: 'avoid',      label: '🌀 Avoid',          desc: 'Hope it resolves itself' },
        ],
      },
      {
        id: 'love_language', type: 'choice',
        text: 'Which best describes how you feel most loved?',
        options: [
          { value: 'words', label: '🗣️ Words of affirmation', desc: 'Compliments and verbal appreciation' },
          { value: 'time',  label: '⏰ Quality time',          desc: 'Undivided attention and presence' },
          { value: 'touch', label: '🤗 Physical touch',        desc: 'Hugs, hand-holding, closeness' },
          { value: 'acts',  label: '🛠️ Acts of service',       desc: 'Actions that make your life easier' },
          { value: 'gifts', label: '🎁 Thoughtful gifts',      desc: 'Symbols of being remembered' },
        ],
      },
      { id: 'express_feelings',      type: 'scale', text: 'I find it easy to express my feelings to others.', low: 'Very difficult', high: 'Very easy' },
      { id: 'constructive_feedback', type: 'scale', text: 'I appreciate receiving constructive feedback from a partner.', low: 'Hard to hear', high: 'I welcome it' },
      {
        id: 'communication_freq', type: 'choice',
        text: 'How often do you prefer to communicate with a partner during the day?',
        options: [
          { value: 'constant',   label: '💬 Constantly',   desc: 'In touch throughout the day' },
          { value: 'regular',    label: '📱 Regularly',    desc: 'A few times a day' },
          { value: 'occasional', label: '📩 Occasionally', desc: "When there's something to say" },
          { value: 'minimal',    label: '🔕 Minimal',      desc: 'I need lots of independent space' },
        ],
      },
      { id: 'finance_disagreement', type: 'text', text: 'How would you handle a disagreement over finances with a partner?', placeholder: 'Walk through your approach...' },
    ],
  },
  {
    id: 'partnership',
    title: 'Partnership Philosophy',
    icon: '🤝',
    description: 'What you believe makes a great partnership',
    questions: [
      { id: 'shared_chores',   type: 'scale', text: 'Household responsibilities should be shared equally.', low: 'Disagree', high: 'Strongly agree' },
      { id: 'joint_decisions', type: 'scale', text: 'Making joint decisions is crucial in a relationship.', low: 'Disagree', high: 'Strongly agree' },
      {
        id: 'decision_making', type: 'choice',
        text: 'Decision-making in a relationship should be:',
        options: [
          { value: 'equal',       label: '⚖️ Always equal',  desc: '50/50 on everything' },
          { value: 'by_strength', label: '🎯 By expertise',  desc: 'Whoever knows more decides' },
          { value: 'one_leads',   label: '👑 One leads',     desc: 'One partner takes the main role' },
          { value: 'case_by_case',label: '🔄 Case by case', desc: 'Depends on the situation' },
        ],
      },
      {
        id: 'partner_role', type: 'choice',
        text: 'How do you view the role of a partner in your personal success?',
        options: [
          { value: 'essential',   label: '🌟 Essential',   desc: 'My partner is central to my success' },
          { value: 'supportive',  label: '💪 Supportive',  desc: 'They cheer me on but I drive it' },
          { value: 'independent', label: '🦅 Independent', desc: 'I keep success separate from relationships' },
          { value: 'mutual',      label: '🔗 Mutual',      desc: 'We grow together or not at all' },
        ],
      },
      { id: 'ideal_partnership', type: 'text', text: 'What does an ideal partnership look like to you?', placeholder: 'Describe the dynamic, values, and feel of your ideal relationship...' },
    ],
  },
  {
    id: 'daily',
    title: 'Daily Life & Personality Quirks',
    icon: '☀️',
    description: 'The everyday details that reveal who you really are',
    questions: [
      {
        id: 'city_vs_nature', type: 'choice',
        text: 'City walks or time in nature?',
        options: [
          { value: 'city',   label: '🏙️ City person', desc: 'Streets, coffee shops, energy' },
          { value: 'nature', label: '🌲 Nature lover', desc: 'Trails, fresh air, quiet' },
          { value: 'both',   label: '🌆 Both equally', desc: 'Depends on my mood' },
        ],
      },
      {
        id: 'rain_walk', type: 'choice',
        text: 'How do you feel about walking in the rain?',
        options: [
          { value: 'love_it', label: '🌧️ Love it',           desc: 'Rain is peaceful and cozy' },
          { value: 'fine',    label: '🌂 Fine with umbrella', desc: 'No big deal' },
          { value: 'avoid',   label: '☀️ Avoid it',           desc: 'Give me sunshine please' },
        ],
      },
      {
        id: 'pda', type: 'choice',
        text: 'Public displays of affection — where do you stand?',
        options: [
          { value: 'love_pda', label: '❤️ Love it',      desc: 'The more the better' },
          { value: 'moderate', label: '🤗 Moderate',     desc: 'Holding hands and hugs, sure' },
          { value: 'private',  label: '🔒 Keep private', desc: 'I prefer affection in private' },
        ],
      },
      {
        id: 'pets', type: 'choice',
        text: 'Pets — where do you stand?',
        options: [
          { value: 'have_and_love', label: '🐾 Have them & love it', desc: 'Pets are family' },
          { value: 'want_one',      label: '🐶 Want one',             desc: 'Planning to get one' },
          { value: 'fine_others',   label: "😊 Love others'",         desc: "Love them, won't own one" },
          { value: 'no_pets',       label: '🚫 Not for me',           desc: 'Pets not in my plan' },
        ],
      },
      {
        id: 'clothes', type: 'choice',
        text: 'How do you prefer to buy clothes?',
        options: [
          { value: 'new',        label: '🛍️ Always new',   desc: 'Fresh from the store' },
          { value: 'secondhand', label: '♻️ Second-hand',  desc: 'Thrift is sustainable and fun' },
          { value: 'both',       label: '🔄 Mix of both',  desc: 'Whatever works' },
        ],
      },
      {
        id: 'long_term_vs_now', type: 'choice',
        text: 'Do you set long-term goals or live in the moment?',
        options: [
          { value: 'planner',  label: '🎯 Long-term planner',  desc: 'I map out my future carefully' },
          { value: 'balanced', label: '⚖️ Both',               desc: 'Plan ahead but stay present' },
          { value: 'present',  label: '🌊 Live in the moment', desc: 'The future takes care of itself' },
        ],
      },
      { id: 'cleanliness_home',  type: 'scale', text: 'Maintaining a clean and organized living space is important to me.', low: 'Not really', high: 'Absolutely' },
      { id: 'enjoy_cooking',     type: 'scale', text: 'I enjoy cooking and preparing meals.', low: 'Not at all', high: 'I love it' },
      { id: 'daily_routine',     type: 'scale', text: 'I prefer to follow a daily routine.', low: "I'm spontaneous", high: 'Routine is essential' },
      { id: 'personal_grooming', type: 'scale', text: 'I take pride in my personal appearance and grooming.', low: 'Minimal effort', high: 'Very important to me' },
      { id: 'like_about_self',   type: 'text',  text: 'What do you like most about yourself?', placeholder: 'Be honest and kind to yourself...' },
      { id: 'weekend_style',     type: 'text',  text: "What's your favorite way to spend a weekend?", placeholder: 'Paint us a picture...' },
      { id: 'how_you_unwind',    type: 'text',  text: 'How do you unwind after a long day?', placeholder: 'What recharges you?' },
      { id: 'pet_peeves',        type: 'text',  text: 'What are your biggest pet peeves?', placeholder: 'The small things that drive you crazy...' },
    ],
  },
  // Travel section — shown when user selects "travel" as looking_for
  {
    id: 'travel',
    title: 'Travel & Adventure',
    icon: '✈️',
    description: 'Find out if you explore the world the same way',
    travelOnly: true,
    questions: [
      {
        id: 'travel_style', type: 'choice',
        text: 'Which best describes your travel style?',
        options: [
          { value: 'backpacker', label: '🎒 Backpacker',     desc: 'Budget, hostels, local food, raw experiences' },
          { value: 'mid_range',  label: '🏨 Mid-range',      desc: 'Comfortable but not splurging' },
          { value: 'luxury',     label: '🌟 Luxury',         desc: 'I want the full experience, comfort included' },
          { value: 'whatever',   label: '🤷 Depends on trip', desc: 'I adapt to the destination' },
        ],
      },
      {
        id: 'travel_planning', type: 'choice',
        text: 'How do you plan a trip?',
        options: [
          { value: 'full_itinerary', label: '📋 Full itinerary', desc: 'Every day planned before I leave' },
          { value: 'loose_plan',     label: '🗺️ Loose framework', desc: 'Key things booked, rest is flexible' },
          { value: 'spontaneous',    label: '🎲 Spontaneous',    desc: 'Book a flight and figure it out' },
          { value: 'research_heavy', label: '🔍 Research heavy',  desc: 'Deep research, then flexible execution' },
        ],
      },
      {
        id: 'travel_pace', type: 'choice',
        text: 'What is your preferred travel pace?',
        options: [
          { value: 'slow_deep',     label: '🐢 Slow and deep',  desc: 'Stay long, go deep, feel local' },
          { value: 'balanced_pace', label: '🚶 Balanced',        desc: 'Mix of exploring and relaxing' },
          { value: 'fast_packed',   label: '🏃 Fast and packed', desc: 'See as much as possible' },
        ],
      },
      {
        id: 'travel_type', type: 'choice',
        text: 'What kind of trips excite you most?',
        options: [
          { value: 'cities',   label: '🏙️ Cities',        desc: 'Museums, food scenes, architecture' },
          { value: 'nature',   label: '🏔️ Nature',        desc: 'Hiking, national parks, wildlife' },
          { value: 'beaches',  label: '🏖️ Beaches',       desc: 'Sun, sea, and relaxation' },
          { value: 'cultural', label: '🏛️ Culture',       desc: 'History, people, authentic experiences' },
          { value: 'mix',      label: '🌍 All of it',      desc: 'The more variety the better' },
        ],
      },
      {
        id: 'travel_budget_split', type: 'choice',
        text: 'When traveling with someone, how should expenses be handled?',
        options: [
          { value: 'split_equal',  label: '⚖️ Split equally',    desc: 'Down the middle always' },
          { value: 'by_income',    label: '💰 By income',         desc: 'Higher earner covers more' },
          { value: 'take_turns',   label: '🔄 Take turns',        desc: 'Alternate who pays' },
          { value: 'pool_together',label: '🤝 Pool together',     desc: 'Joint travel fund' },
        ],
      },
      { id: 'travel_solo_group', type: 'scale', text: 'I prefer solo or small-group travel over large group tours.', low: 'I love big groups', high: 'Always solo or intimate' },
      { id: 'travel_comfort',    type: 'scale', text: 'I am comfortable with discomfort, delays, and unplanned situations while traveling.', low: 'Stress me out', high: 'Part of the adventure' },
      { id: 'dream_destination', type: 'text',  text: 'What is your dream destination and why?', placeholder: 'Tell us where and what draws you there...' },
      { id: 'worst_travel',      type: 'text',  text: 'Describe a travel challenge you faced and how you handled it.', placeholder: 'A flight delay, a lost bag, a wrong turn...' },
    ],
  },
];

export const ALL_QUESTIONS = SECTIONS.flatMap(s => s.questions.map(q => ({ ...q, sectionId: s.id })));

// Returns sections relevant to the user's selected looking_for categories
export function getSectionsFor(lookingFor = []) {
  return SECTIONS.filter(s => {
    if (s.travelOnly) return lookingFor.includes('travel');
    return true;
  });
}
