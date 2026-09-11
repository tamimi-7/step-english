// قطع قراءة تدريبية مكتوبة على نفس مواضيع القطع الجديدة التي ذكرها المختبرون
// (القطع من كتابتنا وليست نص الاختبار الحرفي — الهدف التدريب على نفس الفكرة ونوع الأسئلة)
const PASSAGES = [
{
id:"p1",
title:"Pediatricians and Psychiatrists",
ar:"أطباء الأطفال والأطباء النفسيون",
note:"ذكر أحد المختبرين قطعة عن أطباء الأطفال وأطباء آخرين، وعليها سؤالان: الشيء المشترك في طبيعة عملهم، وأماكن عملهم.",
text:`Pediatricians and psychiatrists are two kinds of doctors who often work together, although their jobs are different. A pediatrician is a doctor who cares for babies, children, and teenagers. Pediatricians check a child's growth, give vaccinations, and treat common illnesses such as colds, ear infections, and asthma. A psychiatrist, on the other hand, is a medical doctor who specializes in mental health. Psychiatrists diagnose and treat conditions such as depression, anxiety, and eating disorders, and they can prescribe medicine.

Despite these differences, the two professions share several things. Both pediatricians and psychiatrists must finish medical school and then complete several more years of training called a residency. Both must be good listeners, because much of their work depends on asking questions and understanding what patients say. In addition, both kinds of doctors often take part in research to improve treatments. Many pediatricians and psychiatrists work in hospitals, while others work in private clinics, community health centers, schools, or universities. Some child psychiatrists work directly in pediatric hospitals, where they help children who have both physical and emotional problems.`,
qs:[
{q:"According to the passage, what do pediatricians and psychiatrists have in common?",opts:["Both prescribe the same medicines.","Both finish medical school and complete years of training.","Both treat only children.","Both work only in schools."],a:1,ex:"الفقرة الثانية: Both ... must finish medical school and then complete several more years of training."},
{q:"Where do most pediatricians and psychiatrists work?",opts:["In factories","In hospitals and clinics","At home","In laboratories only"],a:1,ex:"Many ... work in hospitals, while others work in private clinics, community health centers..."},
{q:"The word \"diagnose\" in the passage is closest in meaning to:",opts:["identify","ignore","prevent","sell"],a:0,ex:"diagnose = يشخّص = يحدد المرض → identify."},
{q:"What is the main idea of the passage?",opts:["Children get sick more often than adults.","Psychiatrists earn more than pediatricians.","The differences and similarities between two kinds of doctors.","How to become a doctor in five years."],a:2,ex:"القطعة تعرض الاختلافات (الفقرة الأولى) ثم أوجه التشابه (الفقرة الثانية)."}
]},
{
id:"p2",
title:"Learning from Mistakes",
ar:"التعلم من الأخطاء",
note:"ذكر أحد المختبرين قطعة عن: لماذا يخطئ بعض الناس أكثر من غيرهم؟ وما فائدة أن تتعلم من أخطائك وأخطاء الآخرين؟ وقال إن الإجابات كلها منطقية ولا بد من قراءة القطعة.",
text:`Everyone makes mistakes, but some people seem to make more mistakes than others. Researchers have found several reasons for this. First, people who are tired or stressed make more errors because their attention is weaker. Second, some people work too quickly and do not check their work. Third, and most importantly, some people never stop to think about why a mistake happened, so they repeat the same mistake again and again.

Mistakes are not always bad. In fact, they are one of the best ways to learn. When you make a mistake and think carefully about it, your brain builds a stronger memory of the correct way to do something. This is why teachers often say that a wrong answer, once corrected, is remembered better than a right answer that was simply guessed. Learning from other people's mistakes is also useful, because it allows you to avoid a problem without having to experience it yourself. A wise person, as the saying goes, learns from the mistakes of others, while a fool learns only from his own.`,
qs:[
{q:"According to the passage, why do some people make more mistakes than others?",opts:["Because they are less intelligent.","Because they are tired, work too fast, or do not think about their mistakes.","Because they have bad teachers.","Because they make mistakes on purpose."],a:1,ex:"الفقرة الأولى تذكر ثلاثة أسباب: التعب والضغط، السرعة بدون مراجعة، وعدم التفكير في سبب الخطأ."},
{q:"What is the benefit of learning from your own mistakes?",opts:["It makes you work faster.","It helps your brain remember the correct way.","It makes you feel bad.","It stops you from trying again."],a:1,ex:"your brain builds a stronger memory of the correct way to do something."},
{q:"What is the advantage of learning from other people's mistakes?",opts:["You can avoid problems without experiencing them yourself.","You can laugh at other people.","You will never make any mistakes.","You will forget your own mistakes."],a:0,ex:"it allows you to avoid a problem without having to experience it yourself."},
{q:"The word \"errors\" in the passage is closest in meaning to:",opts:["mistakes","successes","plans","ideas"],a:0,ex:"errors = mistakes = أخطاء."}
]},
{
id:"p3",
title:"Obesity and Anorexia",
ar:"السمنة وفقدان الشهية",
note:"ذكر أحد المختبرين قطعة عن Obesity و Anorexia وعليها ثلاثة أسئلة: المشترك بينهما (الجينات والضغوط النفسية)، كلاهما يؤدي إلى أمراض القلب، وأنه كان يُعتقد أنه يصيب الأغنياء.",
text:`Obesity and anorexia nervosa look like opposite problems. A person with obesity has too much body fat, while a person with anorexia eats so little that his or her body weight becomes dangerously low. However, doctors have discovered that the two conditions have a lot in common. Both are influenced by genetics, which means that they can run in families. Both are also connected to psychological pressure: stress, low self-esteem, and social pressure to look a certain way can push people toward either condition. In addition, both obesity and anorexia can damage the heart. Obesity raises blood pressure and cholesterol, while anorexia weakens the heart muscle, and both can lead to heart disease.

In the past, anorexia was thought to be a disease of wealthy young women in Western countries, and obesity was seen as a problem of rich societies where food is plentiful. Today, however, both conditions are found in every country and in every social class. Doctors now agree that the best treatment for both problems combines medical care with psychological support.`,
qs:[
{q:"What do obesity and anorexia have in common?",opts:["Both are caused by eating too much.","Both are influenced by genetics and psychological pressure.","Both affect only women.","Both are easy to treat."],a:1,ex:"Both are influenced by genetics ... Both are also connected to psychological pressure."},
{q:"According to the passage, what can both conditions lead to?",opts:["Better health","Heart disease","Higher intelligence","A longer life"],a:1,ex:"both can lead to heart disease."},
{q:"In the past, which group was believed to suffer from anorexia?",opts:["Poor children","Old men","Wealthy young women","Professional athletes"],a:2,ex:"anorexia was thought to be a disease of wealthy young women in Western countries."},
{q:"The word \"plentiful\" in the passage is closest in meaning to:",opts:["abundant","rare","expensive","unhealthy"],a:0,ex:"plentiful = وفير / كثير → abundant."}
]},
{
id:"p4",
title:"Violence in the Media",
ar:"العنف في الإعلام",
note:"ذكرت إحدى المختبرات قطعة جديدة تتكلم عن العنف.",
text:`Many parents worry about the amount of violence their children see on television, in films, and in video games. Some studies suggest that children who watch a lot of violent programs may become more aggressive, less sensitive to the pain of others, and more afraid of the world around them. Other researchers disagree. They argue that millions of people enjoy violent films and games without ever hurting anyone, and that family life, friends, and personality are far more important than what appears on a screen.

Both sides agree on one point: very young children cannot always tell the difference between what is real and what is not. For this reason, experts recommend that parents watch programs together with their children, talk about what they see, and limit screen time. In this way, children can learn to think critically about violence instead of simply copying it.`,
qs:[
{q:"What is the main idea of the passage?",opts:["Violent films should be banned.","There is disagreement about the effect of media violence on children.","Children love video games.","Parents should not watch television."],a:1,ex:"القطعة تعرض رأيين مختلفين (Some studies suggest ... Other researchers disagree)."},
{q:"Which of the following do both sides agree on?",opts:["Violence on TV is always harmful.","Very young children may not know what is real and what is not.","Video games improve intelligence.","Parents should ban all screens."],a:1,ex:"Both sides agree on one point: very young children cannot always tell the difference between what is real and what is not."},
{q:"The word \"aggressive\" in the passage is closest in meaning to:",opts:["violent","calm","clever","tired"],a:0,ex:"aggressive = عدواني → violent."},
{q:"What do experts recommend?",opts:["Watching programs with children and discussing them.","Buying more video games.","Letting children watch alone.","Removing all televisions from the house."],a:0,ex:"experts recommend that parents watch programs together with their children, talk about what they see, and limit screen time."}
]},
{
id:"p5",
title:"The Value of Failure",
ar:"قيمة الفشل",
note:"ذكرت إحدى المختبرات قطعة جديدة تتكلم عن الفشل.",
text:`Most people are afraid of failure. We are taught from an early age that success is good and failure is bad, so we try to avoid any situation in which we might fail. Yet many of the most successful people in history failed many times before they succeeded. Thomas Edison tested thousands of materials before he found one that worked in his light bulb. When asked about it, he said that he had not failed; he had simply found thousands of ways that did not work.

Failure is valuable for three reasons. First, it shows us what does not work, which brings us closer to what does. Second, it teaches us to be patient and to keep trying, a quality that psychologists call resilience. Third, people who have failed and recovered are usually more confident, because they know that a mistake is not the end of the world. The real danger is not failing but giving up. A person who never fails is probably a person who never tries anything new.`,
qs:[
{q:"Why are most people afraid of failure, according to the passage?",opts:["Because they are lazy.","Because they were taught that failure is bad.","Because failure is physically dangerous.","Because success is easy."],a:1,ex:"We are taught from an early age that success is good and failure is bad."},
{q:"What did Edison say about his experiments?",opts:["He had failed thousands of times.","He had found many ways that did not work.","He had given up.","He never made mistakes."],a:1,ex:"he had simply found thousands of ways that did not work."},
{q:"The word \"resilience\" in the passage refers to:",opts:["The ability to keep trying after failure","The fear of failure","A kind of success","A type of material"],a:0,ex:"it teaches us to be patient and to keep trying, a quality that psychologists call resilience."},
{q:"What does the writer think is the real danger?",opts:["Failing","Trying new things","Giving up","Being confident"],a:2,ex:"The real danger is not failing but giving up."}
]},
{
id:"p6",
title:"The Telephone",
ar:"الهاتف (مثال صيغة سؤال المفردات)",
note:"مثال على صيغة سؤال المفردات في قسم القراءة كما ورد في ملف المترادفات.",
text:`Alexander Graham Bell invented the telephone in 1876. Before that time, people who wanted to send a message over a long distance had to write a letter or use the telegraph, which could only send short coded messages. Bell's invention allowed people to hear each other's voices for the first time, and it quickly changed the way people communicated. Within a few decades, telephones were installed in homes and offices across the world, and today the mobile phone has become an essential part of daily life.`,
qs:[
{q:"The word \"invented\" in the passage is closest in meaning to:",opts:["occupied","made","excluded","survived"],a:1,ex:"invented = اخترع = صنع لأول مرة → made."},
{q:"The word \"essential\" in the passage is closest in meaning to:",opts:["necessary","expensive","unusual","optional"],a:0,ex:"essential = ضروري → necessary."},
{q:"According to the passage, how did people send long-distance messages before the telephone?",opts:["By radio","By letter or telegraph","By mobile phone","By email"],a:1,ex:"had to write a letter or use the telegraph."}
]}
];
