// constants.js

import * as Agents from './Agents.js';

// Centralized definition of all agents available in the simulation
export const AGENT_CONSTRUCTORS = [
    { key: 'random', name: 'Random', create: (num) => new Agents.RandomAgent(num) },
    { key: 'greedy', name: 'Greedy', create: (num) => new Agents.GreedyAgent(num) },
    { key: 'epsilonGreedy', name: 'Epsilon-Greedy', create: (num) => new Agents.EpsilonGreedyAgent(num, 0.1) },
    { key: 'decayingEpsilonGreedy', name: 'Decaying ε-Greedy', create: (num) => new Agents.DecayingEpsilonGreedyAgent(num) },
    { key: 'ucb1', name: 'UCB1', create: (num) => new Agents.UCB1Agent(num) },
    { key: 'thompson', name: 'Thompson Sampling', create: (num) => new Agents.ThompsonSamplingAgent(num) },
    // You can easily add new agents here without touching the simulator
    // { key: 'softmax', name: 'Softmax', create: (num) => new Agents.SoftmaxAgent(num, 0.5) },
];

// Hex codes are often more flexible than rgba for manipulation
export const CHART_COLORS = {
    Random: '#ff6384',
    Greedy: '#36a2eb',
    'Epsilon-Greedy': '#ffce56',
    'Decaying ε-Greedy': '#ff9f40',
    UCB1: '#4bc0c0',
    'Thompson Sampling': '#9966ff',
    Softmax: '#c9cbcf',
    Manual: '#e2e2e2'
};

// All display text for agent descriptions
export const AGENT_DESCRIPTIONS = {
    random: '<h3>ایده اصلی: انتخاب کاملاً تصادفی</h3><p>این عامل هیچ استراتژی خاصی ندارد و در هر مرحله، یک ماشین را به صورت کاملاً شانسی انتخاب می‌کند. این روش به عنوان یک معیار پایه (Baseline) برای سنجش عملکرد سایر استراتژی‌ها استفاده می‌شود.</p>',
    greedy: '<h3>ایده اصلی: بهره‌برداری محض (Pure Exploitation)</h3><p>این عامل پس از یک دور امتحان کردن همه‌ی ماشین‌ها، فقط و فقط به ماشینی که تا آن لحظه بهترین بازدهی را داشته «می‌چسبد». این استراتژی در محیط‌های ثابت سریع است اما قادر به وفق پیدا کردن با تغییرات نیست و ممکن است در یک انتخاب بد اولیه گیر کند.</p>',
    epsilonGreedy: '<h3>ایده اصلی: تعادل ساده بین کشف و بهره‌برداری</h3><p>در اکثر مواقع (با احتمال ۱ منهای اپسیلون ε) بهترین ماشین فعلی را انتخاب می‌کند (بهره‌برداری)، اما گاهی اوقات (با احتمال اپسیلون) یک ماشین تصادفی را برای «کشف» (Exploration) انتخاب می‌کند. این کار به آن اجازه می‌دهد تا از گیر افتادن در یک انتخاب بد اولیه جلوگیری کند.</p>',
    decayingEpsilonGreedy: '<h3>ایده اصلی: کشف هوشمند در طول زمان</h3><p>یک نسخه هوشمندتر از اپسیلون-حریص. این عامل در ابتدا زیاد کشف می‌کند (اپسیلون نزدیک به ۱) و به مرور زمان که اطلاعات بیشتری کسب می‌کند و به تخمین‌های خود مطمئن‌تر می‌شود، کمتر کشف کرده و بیشتر بهره‌برداری می‌کند (اپسیلون به تدریج به سمت صفر کاهش می‌یابد).</p>',
    ucb1: '<h3>ایده اصلی: خوش‌بینی در برابر عدم قطعیت</h3><p>این الگوریتم به صورت هوشمندانه کشف می‌کند. معیاری به نام «کران بالای اطمینان» (Upper Confidence Bound) را برای هر ماشین محاسبه می‌کند که ترکیبی از بازدهی میانگین و یک «امتیاز عدم قطعیت» است. این امتیاز برای ماشین‌هایی که کمتر امتحان شده‌اند بالاتر است و عامل را به سمت کشف گزینه‌های ناشناخته ولی امیدوارکننده سوق می‌دهد.</p>',
    thompson: '<h3>ایده اصلی: نمونه‌برداری بر اساس باور (Belief)</h3><p>یک روش بیزی (Bayesian) و بسیار قدرتمند. به جای یک تخمین واحد، یک توزیع احتمال کامل از نرخ برد احتمالی هر ماشین را نگهداری می‌کند. در هر مرحله، از این توزیع‌ها نمونه‌گیری کرده و بهترین نمونه را انتخاب می‌کند. این روش به طور طبیعی بین کشف و بهره‌برداری تعادل برقرار می‌کند و عملکرد فوق‌العاده‌ای دارد.</p>'
};