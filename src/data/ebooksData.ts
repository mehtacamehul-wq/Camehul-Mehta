import { EBook, ShortFilmProject } from '../types/ebook';
import heroLibImg from '../assets/images/hero_finance_library_1790532190875.jpg';
import sceneRatRaceImg from '../assets/images/scene_rich_poor_mindset_1790532205161.jpg';
import sceneZebraImg from '../assets/images/scene_zebra_learning_1790532216951.jpg';
import bookCoverImg from '../assets/images/book_cover_wealth_1790532229064.jpg';

export { heroLibImg, sceneRatRaceImg, sceneZebraImg, bookCoverImg };

export const FEATURED_EBOOKS: EBook[] = [
  {
    id: 'rich-dad-poor-dad',
    title: 'Rich Dad Poor Dad',
    author: 'Robert T. Kiyosaki',
    year: 1997,
    category: 'Cashflow & Assets',
    coverUrl: bookCoverImg,
    tagline: 'What the Rich Teach Their Kids About Money That the Poor and Middle Class Do Not!',
    description: 'An international publishing milestone that shattered traditional financial conventions. Kiyosaki contrasts the contrasting advice of two fathers: one highly educated yet financially constrained, the other an 8th-grade dropout who built a diversified empire. It redefines assets as anything that puts money into your pocket, and liabilities as anything that takes money out.',
    pages: 336,
    language: 'English (Translations in 51+ Languages)',
    rating: 4.8,
    source: 'Curated Global Archive',
    isDownloadable: true,
    downloadFormats: {
      epub: '/downloads/rich-dad-poor-dad.epub',
      pdf: '/downloads/rich-dad-poor-dad.pdf',
      txt: '/downloads/rich-dad-poor-dad.txt',
      jsonAnalysis: '/downloads/rich-dad-poor-dad.json',
    },
    chapters: [
      {
        id: 'rdpd-ch1',
        chapterNumber: 1,
        title: 'Lesson 1: The Rich Don\'t Work for Money',
        excerpt: 'The poor and the middle class work for money. The rich have money work for them. Most people are held hostage by fear and desire—the two emotions that keep them running in the endless rat race.',
        fullText: `So many people say, 'Oh, I am not interested in money.' Yet they will work at a job for eight hours a day. That is denying truth. If they weren't interested in money, then why are they working? That kind of thinking is probably more psychotic than a person who hoards money.

When I was nine years old, Mike's dad—my Rich Dad—sat us down and taught us the first foundational lesson: Life pushes all of us around. Some people give up and some people fight. A few learn the lesson and move on. They welcome life pushing them around. To these few people, it means they need and want to learn something. They learn, move on, and grow.

Most people quit, and a few like you fight. If you learn this lesson, you will grow into a wise, wealthy, and happy young man. If you don't, you will spend your life blaming a job, low pay, or your boss for your problems. You'll live life always hoping for that big break that solves all your money problems.

Or, if you're the kind of person who has no guts, you just give up every time life pushes you. If you're that kind of person, you'll live all your life playing it safe, doing the right things, saving yourself for some event that never happens. Then, you die a boring old person. You'll have lots of friends who really liked you because you were such a nice hardworking guy. You spent a life playing it safe, doing the right things. But the truth is, you let life push you into submission. Deep down you were terrified of taking risks. You really wanted to win, but the fear of losing was greater than the excitement of winning.`,
        keyTakeaways: [
          'Fear of losing money and greed for material security fuel the rat race.',
          'Instead of asking "How can I get a raise?", train your mind to ask "How can my capital generate income?"',
          'Financial intelligence transforms passive laborers into active capital owners.'
        ]
      },
      {
        id: 'rdpd-ch2',
        chapterNumber: 2,
        title: 'Lesson 2: Why Teach Financial Literacy? (Assets vs. Liabilities)',
        excerpt: 'Rule 1: You must know the difference between an asset and a liability, and buy assets. This is the only rule you need to master financial freedom.',
        fullText: `Most people fail to understand why they struggle financially because they don't know the difference between an asset and a liability. Rich people acquire assets. The poor and middle class acquire liabilities that they think are assets.

What is an asset? An asset puts money into your pocket.
What is a liability? A liability takes money out of your pocket.

If you want to be rich, simply spend your life buying assets. If you want to be poor or middle class, spend your life buying liabilities. Illiteracy, both in words and numbers, is the foundation of financial struggle. 

Consider a primary residence: many believe their house is their greatest asset. Yet every month, that home drains capital for property taxes, mortgage interest, insurance, repairs, and utilities. Unless it produces net positive rental cashflow, it functions as a liability on your personal cashflow balance sheet. Build your asset column first with real estate rentals, dividend equities, royalties, and businesses that run without your day-to-day presence.`,
        keyTakeaways: [
          'An asset produces cash inflow without active physical presence.',
          'A personal residence without cashflow functions as a cash drain on the balance sheet.',
          'Focus 100% of your surplus cashflow on expanding the asset column.'
        ]
      },
      {
        id: 'rdpd-ch3',
        chapterNumber: 3,
        title: 'Lesson 3: Mind Your Own Business & Tax Architecture',
        excerpt: 'Financial struggle is often directly the result of people working all their lives for someone else. Keep your daytime job, but start minding your own business.',
        fullText: `There is a big difference between your profession and your business. Often I ask people, 'What is your business?' And they will say, 'Oh, I'm a banker.' Then I ask them if they own the bank? And they usually say, 'No, I work there.' In that instance, they have confused their profession with their business. Their profession may be a banker, but they still need their own business.

Keep your day job, be a great hardworking employee, but start buying real assets, not liabilities or personal effects that have no real value once you get them home. A new car loses nearly 25 percent of the price you pay for it the moment you drive it off the lot. It is not a true asset even though your banker lets you list it under that category.

Minding your own business means building and keeping your asset column firm. Once a dollar goes into it, never let it come out. Think of it this way: once a dollar enters your asset column, it becomes your employee. The best thing about money is that it works 24 hours a day and can work for generations.`,
        keyTakeaways: [
          'Your profession pays current expenses; your business builds generational equity.',
          'Treat every dollar in your asset column as a tireless 24/7 worker.',
          'Corporations protect assets and allow pre-tax reinvestment before personal taxation.'
        ]
      }
    ],
    corePrinciples: [
      'The rich do not work for money; their money and assets work for them.',
      'An asset puts money in your pocket; a liability takes money out of your pocket.',
      'Financial literacy is understanding income statements and balance sheets, not memorizing stock tickers.',
      'Work to learn, not just to earn: acquire cross-disciplinary skills in sales, tax laws, and systems.',
      'Overcome fear, cynicism, laziness, bad habits, and arrogance to escape the rat race.'
    ],
    keyQuotes: [
      'The poor and the middle class work for money. The rich have money work for them.',
      'It’s not how much money you make. It’s how much money you keep.',
      'Intelligence solves problems and produces money. Money without financial intelligence is money soon gone.',
      'Failure inspires winners. Failure defeats losers.'
    ],
    financialFormulas: [
      {
        title: 'Net Cashflow Formula',
        formula: 'Net Monthly Cashflow = Passive Asset Inflows - (Operating Expenses + Debt Servicing)',
        explanation: 'When Net Monthly Cashflow exceeds your Total Living Expenses, you achieve financial freedom and officially exit the rat race.'
      },
      {
        title: 'Asset-to-Liability Ratio',
        formula: 'Wealth Velocity = (Asset Yield % × Reinvestment Rate) / Inflation Drag',
        explanation: 'Measures how rapidly your self-sustaining capital base outpaces inflationary erosion.'
      }
    ]
  },
  {
    id: 'zebra-learning-wealth',
    title: 'Zebra Companies & Sustainable Wealth',
    author: 'The Zebra Movement & Regenerative Economics',
    year: 2021,
    category: 'Zebra & Sustainable Startups',
    coverUrl: sceneZebraImg,
    tagline: 'Moving Beyond Unicorn Monocultures Toward Black & White, Resilient, Real-Profit Business Learning.',
    description: 'A revolutionary economic framework challenging Silicon Valley’s unsustainable "unicorn" obsession. Zebra companies are both black and white: they are profitable (sustainable cashflow) and purpose-driven (regenerative social impact). This ebook guides founders, investors, and professionals in building antifragile, community-rooted wealth without burn rates or extractive monopolies.',
    pages: 284,
    language: 'English, French, German, Japanese',
    rating: 4.9,
    source: 'Curated Global Archive',
    isDownloadable: true,
    downloadFormats: {
      epub: '/downloads/zebra-sustainable-wealth.epub',
      pdf: '/downloads/zebra-sustainable-wealth.pdf',
      txt: '/downloads/zebra-sustainable-wealth.txt',
      jsonAnalysis: '/downloads/zebra-sustainable-wealth.json',
    },
    chapters: [
      {
        id: 'zb-ch1',
        chapterNumber: 1,
        title: 'The Myth of the Unicorn vs. The Reality of the Zebra',
        excerpt: 'Unicorns pursue hyper-growth, disruption, and winner-take-all monopoly at any human cost. Zebras pursue shared prosperity, mutual aid, and durable profitability.',
        fullText: `Why zebras? Because unlike unicorns, zebras are real. Zebra companies balance two seemingly opposing forces: they are black and white. They are for-profit and for-purpose. For-profit means they maintain financial integrity and do not rely on endless tranches of speculative venture subsidies. For-purpose means they repair the social fabric and treat employees, customers, and ecosystems as stakeholders rather than extracted resources.

Zebras also run in dazzles—the term for a herd of zebras. When zebras group together, their stripes create an optical illusion that confuses predators. Zebra businesses prioritize mutual support, shared infrastructure, and cooperative ecosystem wealth rather than zero-sum predatory competition.`,
        keyTakeaways: [
          'Zebras create real profits from day one instead of relying on vanity valuations.',
          'Cooperative dazzles outperform isolated predatory monopolies during market downturns.',
          'Sustainable wealth means dividend stability and longevity over paper stock options.'
        ]
      },
      {
        id: 'zb-ch2',
        chapterNumber: 2,
        title: 'Sustainable Unit Economics & Customer-Funded Growth',
        excerpt: 'If your unit economics do not work with 100 customers, throwing 100 million venture dollars at the problem will only accelerate organizational bankruptcy.',
        fullText: `The true test of enterprise health is gross margin durability and customer retention. When founders are conditioned to seek external debt or equity capital as their primary milestone, they forget the purest form of non-dilutive capital: revenue from delighted customers.

Zebra economics teaches the Rule of Reinvestment: Every dollar of net operating profit should be distributed along a triple-vector:
1. Operational resilience reserve (3-6 months runway).
2. Stakeholder dividend / profit share.
3. R&D into product excellence and community benefit.`,
        keyTakeaways: [
          'Customer revenue is the least dilutive and most honest signal of market value.',
          'Maintain an operational resilience reserve before pursuing speculative expansion.',
          'Profit sharing aligns team longevity with long-term enterprise value.'
        ]
      }
    ],
    corePrinciples: [
      'Both black and white: real profitability matched with authentic human and environmental purpose.',
      'Mutualism over monopoly: businesses thrive in cooperative clusters (dazzles) rather than extractive isolation.',
      'Resilience over hyperscale: building companies engineered to survive 50 years rather than flip in 3 years.',
      'User stewardship: treating users and customers as partners in governance and value generation.'
    ],
    keyQuotes: [
      'Unlike unicorns, zebras are real animals that survive through community cooperation.',
      'Sustainable profit is not the enemy of social good; it is its greatest guarantor.',
      'Hypergrowth is cancer’s growth model. Nature grows through seasonal cycles of consolidation and renewal.'
    ],
    financialFormulas: [
      {
        title: 'Zebra Sustainability Index (ZSI)',
        formula: 'ZSI = (Retained Operating Earnings + Community Value Dividend) / Total Capital Incurred',
        explanation: 'Evaluates enterprise health by measuring self-sustaining profit without external burn subsidies.'
      }
    ]
  },
  {
    id: 'psychology-of-money',
    title: 'The Psychology of Money',
    author: 'Morgan Housel',
    year: 2020,
    category: 'Mindset & Psychology',
    coverUrl: sceneRatRaceImg,
    tagline: 'Timeless Lessons on Wealth, Greed, and Happiness.',
    description: 'Doing well with money isn’t necessarily about what you know. It’s about how you behave. And behavior is hard to teach, even to really smart people. Housel shares 19 short stories exploring the strange ways people think about money and teaches you how to make better sense of one of life’s most important topics.',
    pages: 256,
    language: 'English (Global editions worldwide)',
    rating: 4.9,
    source: 'Curated Global Archive',
    isDownloadable: true,
    downloadFormats: {
      epub: '/downloads/psychology-of-money.epub',
      pdf: '/downloads/psychology-of-money.pdf',
      txt: '/downloads/psychology-of-money.txt',
      jsonAnalysis: '/downloads/psychology-of-money.json',
    },
    chapters: [
      {
        id: 'pom-ch1',
        chapterNumber: 1,
        title: 'No One\'s Crazy: Personal Experiences with Risk',
        excerpt: 'Your personal experiences with money make up maybe 0.00000001% of what’s happened in the world, but maybe 80% of how you think the world works.',
        fullText: `People from different generations, raised by different parents who earned different incomes and held different values in different parts of the world, learn vastly different lessons.

Someone who grew up during the Great Depression thinks about risk and reward in ways that someone raised during the 1990s bull market cannot fathom. When stock markets collapse, their emotional responses reflect neural wiring forged during childhood scarcity. Recognize that no investor is crazy; everyone is operating on an internal map drawn by their own singular life trajectory.`,
        keyTakeaways: [
          'Financial decisions are driven by personal history more than mathematical rationality.',
          'Respect different risk appetites without condescension.',
          'Design an investment strategy that lets you sleep peacefully at night.'
        ]
      },
      {
        id: 'pom-ch2',
        chapterNumber: 2,
        title: 'Freedom: The Highest Dividend Money Pays',
        excerpt: 'The ability to do what you want, when you want, with who you want, for as long as you want, is the highest dividend money pays.',
        fullText: `More than your salary. More than the size of your house. More than the prestige of your job. Control over your time is the single greatest lifestyle variable that makes people happy.

Wealth is what you do not see. It is the cars not purchased, the watches not worn, the first-class upgrades declined. Wealth is financial options not yet spent to buy something later. Its value lies in offering you options, flexibility, and growth to one day purchase more options than you could right now.`,
        keyTakeaways: [
          'Wealth is hidden: it consists of assets retained, not luxury consumed.',
          'Time freedom surpasses material status in subjective human wellbeing.',
          'Frugality combined with endurance produces unstoppable compounding.'
        ]
      }
    ],
    corePrinciples: [
      'Compounding is counterintuitive: 99% of Warren Buffett’s wealth was accumulated after age 50.',
      'Staying wealthy requires paranoia, frugality, and acceptance of randomness.',
      'Wealth is the money you haven’t spent; rich is current income spent visibly.',
      'Room for error (margin of safety) is the only way to safely navigate a probabilistic world.'
    ],
    keyQuotes: [
      'Spending money to show people how much money you have is the fastest way to have less money.',
      'The highest form of wealth is the ability to wake up every morning and say, "I can do whatever I want today."',
      'Planning is good, but the most important part of every plan is planning on your plan not going according to plan.'
    ],
    financialFormulas: [
      {
        title: 'Compounding Equation with Endurance Variable',
        formula: 'Future Wealth = Capital × (1 + Rate)^Time_in_Game',
        explanation: 'Time in the game matters exponentially more than chasing an extra 2% annual return through reckless volatility.'
      }
    ]
  },
  {
    id: 'intelligent-investor',
    title: 'The Intelligent Investor',
    author: 'Benjamin Graham',
    year: 1949,
    category: 'Investing & Markets',
    coverUrl: heroLibImg,
    tagline: 'The Definitive Book on Value Investing and Margin of Safety.',
    description: 'The greatest investment advisor of the twentieth century, Benjamin Graham taught and inspired people worldwide. His philosophy of "value investing"—which shields investors from substantial error and teaches them to develop long-term strategies—has made The Intelligent Investor the stock market bible ever since its original publication in 1949.',
    pages: 640,
    language: 'English',
    rating: 4.8,
    source: 'Project Gutenberg',
    gutenbergId: 'open-library-graham',
    isDownloadable: true,
    downloadFormats: {
      epub: '/downloads/intelligent-investor.epub',
      pdf: '/downloads/intelligent-investor.pdf',
      txt: '/downloads/intelligent-investor.txt',
      jsonAnalysis: '/downloads/intelligent-investor.json',
    },
    chapters: [
      {
        id: 'ii-ch1',
        chapterNumber: 1,
        title: 'Investment versus Speculation',
        excerpt: 'An investment operation is one which, upon thorough analysis, promises safety of principal and an adequate return. Operations not meeting these requirements are speculative.',
        fullText: `To achieve satisfactory investment results is easier than most people realize; to achieve superior results is harder than it looks.

The defensive investor must place chief emphasis on the avoidance of serious mistakes or losses. His second aim should be freedom from effort, annoyance, and the need for making frequent decisions. In contrast, the enterprising investor devotes continuous study to selecting securities with intrinsic discount.`,
        keyTakeaways: [
          'Never confuse investment with speculative gambling.',
          'Safety of principal is the inviolable primary law of capital preservation.',
          'The defensive investor succeeds through automated dollar-cost averaging into index funds.'
        ]
      },
      {
        id: 'ii-ch8',
        chapterNumber: 8,
        title: 'The Investor and Market Fluctuations (Mr. Market)',
        excerpt: 'Imagine that in some private business you own a small share that cost you $1,000. One of your partners, named Mr. Market, is very obliging indeed.',
        fullText: `Every day he tells you what he thinks your share is worth and offers either to buy you out or to sell you an additional interest. Sometimes his ideas of value appear justified; other days Mr. Market lets his enthusiasm or his fears run away with him, and the value he proposes seems to you little short of foolish.

If you are a prudent investor, will you let Mr. Market’s daily communication determine your view of the value of a $1,000 interest in the enterprise? Only in case you agree with him, or in case you want to trade with him. You may be happy to sell out to him when he quotes you a ridiculously high price, and equally happy to buy from him when his price is low. The true investor welcomes market panics as bargain opportunities.`,
        keyTakeaways: [
          'Mr. Market is your servant, never your master or guide.',
          'Volatility is the price of admission for long-term equity returns.',
          'Exploit emotional mood swings rather than being governed by them.'
        ]
      }
    ],
    corePrinciples: [
      'Margin of Safety is the central secret of sound investment.',
      'Treat stocks as fractional ownership of real productive operating businesses.',
      'Mr. Market offers prices daily; you have zero obligation to transact unless favorable.',
      'Distinguish between defensive (index/low-cost) and enterprising (deep value) strategies.'
    ],
    keyQuotes: [
      'The individual investor should act consistently as an investor and not as a speculator.',
      'Price is what you pay; value is what you get.',
      'Those who do not remember the past are condemned to repeat it.'
    ],
    financialFormulas: [
      {
        title: 'Graham Intrinsic Value Formula',
        formula: 'Intrinsic Value = EPS × (8.5 + 2g) × (4.4 / AAA Bond Yield)',
        explanation: 'Estimates conservative fair value based on current earnings and sustainable growth rate.'
      }
    ]
  },
  {
    id: 'richest-man-in-babylon',
    title: 'The Richest Man in Babylon',
    author: 'George S. Clason',
    year: 1926,
    category: 'Debt & Wealth Systems',
    coverUrl: bookCoverImg,
    tagline: 'Seven Cures for a Lean Purse and the Five Laws of Gold.',
    description: 'Beloved by millions, this timeless classic holds the secret to all that you desire and all that you wish to accomplish. Through ancient Babylonian parables, Clason teaches the foundational mechanics of thrift, financial planning, debt freedom, and disciplined compounding.',
    pages: 194,
    language: 'English (Public Domain Global)',
    rating: 4.8,
    source: 'Project Gutenberg',
    gutenbergId: 'gutenberg-babylon',
    isDownloadable: true,
    downloadFormats: {
      epub: '/downloads/richest-man-in-babylon.epub',
      pdf: '/downloads/richest-man-in-babylon.pdf',
      txt: '/downloads/richest-man-in-babylon.txt',
      jsonAnalysis: '/downloads/richest-man-in-babylon.json',
    },
    chapters: [
      {
        id: 'rmb-ch1',
        chapterNumber: 1,
        title: 'The Seven Cures for a Lean Purse',
        excerpt: 'A part of all you earn is yours to keep. It should be not less than a tenth, no matter how little you earn.',
        fullText: `Cure 1: Start thy purse to fattening. For every ten coins thou puttest within thy purse, take out for use but nine. Thy purse will start at once to fatten.

Cure 2: Control thy expenditures. Confuse not necessary expenses with thy desires. Each of us, together with our good families, have more desires than our earnings can gratify.

Cure 3: Make thy gold multiply. Gold in a purse is gratifying to own, but it earneth nothing. The gold we may retain from our earnings is but the start. The earnings it will make shall build our fortunes. Put every coin to laboring that it may produce its kind even as the flocks of the field.`,
        keyTakeaways: [
          'Pay yourself first: save at least 10% of gross earnings before any bill is paid.',
          'Distinguish rigorously between necessary physical sustenance and lifestyle desires.',
          'Transform saved gold into golden children (compound interest) that toil continuously.'
        ]
      }
    ],
    corePrinciples: [
      'Pay yourself first: retain 10% of all gross income for lifelong asset accumulation.',
      'Control thy expenses: do not inflate lifestyle costs alongside rising income.',
      'Consult wise counsel: invest only with custodians who have demonstrated domain competence.',
      'Insure a future income: prepare for aged retirement and family protection.'
    ],
    keyQuotes: [
      'A part of all you earn is yours to keep.',
      'Better a little caution than a great regret.',
      'Opportunity is a haughty goddess who waste-eth no time with those who are unprepared.'
    ],
    financialFormulas: [
      {
        title: 'The 70-20-10 Babylonian Allocation Rule',
        formula: 'Income = 70% Living Sustenance + 20% Debt Liquidation + 10% Asset Gold Column',
        explanation: 'Guarantees disciplined debt repayment while simultaneously growing compounding capital reserves.'
      }
    ]
  },
  {
    id: 'think-and-grow-rich',
    title: 'Think and Grow Rich',
    author: 'Napoleon Hill',
    year: 1937,
    category: 'Mindset & Psychology',
    coverUrl: sceneRatRaceImg,
    tagline: 'The Mastermind Principle and the Thirteen Steps to Riches.',
    description: 'Synthesizing interviews with over 500 of America’s most affluent figures including Andrew Carnegie, Henry Ford, and Thomas Edison, Napoleon Hill outlines the mental architecture and organized planning necessary to transmute desire into financial abundance.',
    pages: 320,
    language: 'English (Public Domain Worldwide)',
    rating: 4.7,
    source: 'Project Gutenberg',
    gutenbergId: 'gutenberg-hill-rich',
    isDownloadable: true,
    downloadFormats: {
      epub: '/downloads/think-and-grow-rich.epub',
      pdf: '/downloads/think-and-grow-rich.pdf',
      txt: '/downloads/think-and-grow-rich.txt',
      jsonAnalysis: '/downloads/think-and-grow-rich.json',
    },
    chapters: [
      {
        id: 'tgr-ch1',
        chapterNumber: 1,
        title: 'Desire: The Turning Point of All Achievement',
        excerpt: 'The starting point of all achievement is DESIRE. Keep this constantly in mind. Weak desire brings weak results, just as a small fire makes a small amount of heat.',
        fullText: `There is one weakness in people for which there is no remedy. It is the universal weakness of LACK OF AMBITION!

Fix in your mind the exact amount of money you desire. It is not sufficient merely to say 'I want plenty of money.' Be definite as to the amount. Next, determine exactly what you intend to give in return for the money you desire. There is no such reality as 'something for nothing.'`,
        keyTakeaways: [
          'Vague intentions yield zero financial momentum; define exact mathematical targets.',
          'Wealth is an exchange: prepare specific high-value services to render.',
          'Form an active Mastermind alliance with complementary specialists.'
        ]
      }
    ],
    corePrinciples: [
      'Definiteness of Purpose: clear, quantifiable financial targets.',
      'The Mastermind Alliance: coordinating knowledge and effort in harmony with 2 or more individuals.',
      'Subconscious programming through emotionalized affirmations and visualization.',
      'Persistence: enduring the unavoidable valley of temporary setbacks.'
    ],
    keyQuotes: [
      'Whatever the mind can conceive and believe, it can achieve.',
      'A quitter never wins and a winner never quits.',
      'Every adversity carries with it the seed of an equivalent or greater benefit.'
    ],
    financialFormulas: [
      {
        title: 'The Mastermind Synergy Coefficient',
        formula: 'Synergistic Output = (Intelligence_A + Intelligence_B)^2',
        explanation: 'Hill posits that two coordinated minds create a third invisible mastermind force far exceeding individual sum.'
      }
    ]
  }
];

export const PREBUILT_SHORT_FILM_PROJECTS: ShortFilmProject[] = [
  {
    id: 'film-rich-poor-dad',
    bookId: 'rich-dad-poor-dad',
    bookTitle: 'Rich Dad Poor Dad',
    author: 'Robert Kiyosaki',
    title: 'The Great Divergence: Escaping The Rat Race',
    description: 'A dynamic 4-scene cinematic short film contrasting the two mindsets: trading time for wages in an endless rat race versus systematically building self-funding asset columns.',
    audioVoice: 'Kore',
    ttsSpeed: 1.0,
    bgMusic: 'cinematic_orchestral',
    bgMusicVolume: 0.25,
    ttsVolume: 0.95,
    aspectRatio: '16:9',
    scenes: [
      {
        id: 'rd-scene-1',
        sceneNumber: 1,
        title: 'Act I: The Trap of The Golden Treadmill',
        voiceover: 'Every morning at sunrise, millions wake up to run the rat race. They work forty hours a week, receive a paycheck, pay their taxes, and spend the remainder on liabilities disguised as assets. Fear of losing security keeps them trapped on the treadmill.',
        duration: 8,
        visualBackground: 'rat_race',
        chartType: 'rat_race_cycle',
        keynote: 'The Rat Race: Working for Money vs Money Working for You',
        secondaryBullet: 'Fear & Desire drive 90% of traditional financial choices',
        transition: 'crossfade'
      },
      {
        id: 'rd-scene-2',
        sceneNumber: 2,
        title: 'Act II: The Golden Rule of Accounting',
        voiceover: 'Rich Dad taught one simple truth that altered history: An asset puts money in your pocket. A liability takes money out. Your primary home, your luxury vehicle, your credit cards—they take money out. Rich people buy real assets first.',
        duration: 9,
        visualBackground: 'library',
        chartType: 'asset_vs_liability',
        keynote: 'Rule #1: Know What Puts Money In Your Pocket',
        secondaryBullet: 'Assets feed you while you sleep; liabilities feed on your labor',
        transition: 'zoom_in'
      },
      {
        id: 'rd-scene-3',
        sceneNumber: 3,
        title: 'Act III: The Cashflow Quadrant Shift',
        voiceover: 'To break free, you must cross the quadrant. Move from Employee and Self-Employed on the left, to Business Owner and Investor on the right. In the Investor quadrant, your capital works twenty-four hours a day, unaffected by exhaustion.',
        duration: 8,
        visualBackground: 'dark_terminal',
        chartType: 'cashflow_quadrant',
        keynote: 'The Great Migration: From Left Quadrant to Right Quadrant',
        secondaryBullet: 'Taxes on passive capital are systematically lower than earned wages',
        transition: 'slide_left'
      },
      {
        id: 'rd-scene-4',
        sceneNumber: 4,
        title: 'Act IV: Financial Autonomy Achieved',
        voiceover: 'When the passive cashflow from your asset column surpasses your monthly living expenses, you are no longer an employee of circumstance. You are free. Financial literacy is not about greed; it is the ultimate vehicle for human sovereignty.',
        duration: 8,
        visualBackground: 'sunlit_assets',
        chartType: 'compound_interest',
        keynote: 'Autonomy: When Asset Cashflow > Total Living Expenses',
        secondaryBullet: 'True wealth is measured in time, not merely bank balances',
        transition: 'crossfade'
      }
    ]
  },
  {
    id: 'film-zebra-learning',
    bookId: 'zebra-learning-wealth',
    bookTitle: 'Zebra Companies & Sustainable Wealth',
    author: 'The Zebra Movement',
    title: 'The Zebra Manifesto: Sustainable Capital & Real Profits',
    description: 'A 4-scene cinematic short film analyzing why sustainable Zebra businesses outperform extractive venture unicorns during market downturns.',
    audioVoice: 'Zephyr',
    ttsSpeed: 1.0,
    bgMusic: 'upbeat_lofi',
    bgMusicVolume: 0.22,
    ttsVolume: 0.95,
    aspectRatio: '16:9',
    scenes: [
      {
        id: 'zb-scene-1',
        sceneNumber: 1,
        title: 'Act I: The Unicorn Illusion',
        voiceover: 'For two decades, modern commerce was seduced by mythical unicorns. Companies valued at billions that lost millions every quarter, burning investor subsidies to achieve monopoly power at the expense of community resilience.',
        duration: 8,
        visualBackground: 'dark_terminal',
        chartType: 'zebra_vs_unicorn',
        keynote: 'The Mirage: Hypergrowth funded by endless cash burn',
        secondaryBullet: 'Unicorns extract value; Zebras regenerate ecosystems',
        transition: 'crossfade'
      },
      {
        id: 'zb-scene-2',
        sceneNumber: 2,
        title: 'Act II: Black & White Economics',
        voiceover: 'Enter the Zebra. Zebras are both black and white: they are for-profit and for-purpose. Profit ensures longevity; purpose ensures dignity. They don’t rely on venture bailouts because their unit economics work from day one.',
        duration: 8,
        visualBackground: 'zebra_growth',
        chartType: 'asset_vs_liability',
        keynote: 'Both Black & White: Real Profit + Societal Restoration',
        secondaryBullet: 'Customer revenue is non-dilutive, honest capital',
        transition: 'zoom_in'
      },
      {
        id: 'zb-scene-3',
        sceneNumber: 3,
        title: 'Act III: The Power of The Dazzle',
        voiceover: 'When zebras band together, their collective stripes confuse predators. In business, a cooperative cluster shares back-office infrastructure, distributes risk, and creates antifragile networks that withstand global supply shocks.',
        duration: 8,
        visualBackground: 'gold_minimal',
        chartType: 'velocity_of_money',
        keynote: 'Running in a Dazzle: Mutualism Over Extractive Monopoly',
        secondaryBullet: 'Ecosystem resilience outlasts solitary predatory giants',
        transition: 'slide_left'
      },
      {
        id: 'zb-scene-4',
        sceneNumber: 4,
        title: 'Act IV: The Fifty-Year Horizon',
        voiceover: 'Build something built to last fifty years, not something engineered to flip in five. Real wealth is regenerative. When community, workers, and founders share equity, sustainable compounding creates generational freedom.',
        duration: 9,
        visualBackground: 'emerald_vault',
        chartType: 'compound_interest',
        keynote: 'Generational Sovereignty: Reinvesting in Shared Equity',
        secondaryBullet: 'Durable cashflow creates enduring multi-decade sovereignty',
        transition: 'crossfade'
      }
    ]
  }
];
