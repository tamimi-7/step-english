/* مكتبة القصص — المستوى A1 */
window.STORIES = window.STORIES || []; var STORIES = window.STORIES;

/* 1 ── The Tortoise and the Hare ─────────────────────────────── */
STORIES.push({
  id: "tortoise-hare", lvl: "A1", d: 1, kind: "fable",
  title: "The Tortoise and the Hare", ar: "السلحفاة والأرنب",
  author: "Aesop", origin: "حكاية من حكايات إيسوب اليونانية",
  intro: "أرنب سريع يسخر من سلحفاة بطيئة، فتتحداه في سباق أمام كل الحيوانات.",
  paras: [
    { en: "A hare lives in a big field. He runs very fast. He is proud of his legs. A tortoise lives in the same field. She walks very slowly. Every day the hare laughs at her. \"You are so slow!\" he says.",
      ar: "يعيش أرنب برّي في حقل كبير. يركض بسرعة كبيرة، وهو فخور بساقيه. وتعيش سلحفاة في الحقل نفسه، تمشي ببطء شديد. وكل يوم يضحك الأرنب عليها ويقول: «أنتِ بطيئة جدًا!»." },
    { en: "One day the tortoise is tired of this. \"Let's have a race,\" she says. The hare laughs and laughs. \"A race? With you? Okay! This is easy for me.\" All the animals come to watch. The old fox is the judge.",
      ar: "وفي يوم من الأيام تعبت السلحفاة من هذا، فقالت: «هيا نتسابق». ضحك الأرنب كثيرًا وقال: «سباق؟ معكِ أنتِ؟ حسنًا! هذا سهل عليّ». وجاءت كل الحيوانات لتشاهد، وكان الثعلب العجوز هو الحكم." },
    { en: "\"Ready? Go!\" says the fox. The hare runs like the wind. Soon he is far away. He looks back. The tortoise is very small behind him. \"She is so slow,\" he thinks. \"I have a lot of time.\"",
      ar: "قال الثعلب: «استعدوا؟ انطلقوا!». ركض الأرنب كالريح، وسرعان ما صار بعيدًا. نظر خلفه، فرأى السلحفاة صغيرة جدًا وراءه. فكّر في نفسه: «إنها بطيئة جدًا، وعندي وقت كثير»." },
    { en: "The hare sees a big tree. \"I can sleep here for a little,\" he says. He lies down under the tree. The sun is warm. The hare closes his eyes. Soon he is asleep.",
      ar: "رأى الأرنب شجرة كبيرة فقال: «أستطيع أن أنام هنا قليلًا». استلقى تحت الشجرة، وكانت الشمس دافئة. أغمض الأرنب عينيه، وسرعان ما نام." },
    { en: "The tortoise does not stop. She walks and walks. Step by step, she passes the sleeping hare. She does not look at him. She looks only at the road. The finish line is near now.",
      ar: "لم تتوقف السلحفاة، بل مشت ومشت. خطوة خطوة، تجاوزت الأرنب النائم. لم تنظر إليه، بل نظرت إلى الطريق فقط. وصار خط النهاية قريبًا الآن." },
    { en: "The hare wakes up. \"Oh no! Where is the tortoise?\" He runs as fast as he can. But it is too late. The tortoise crosses the line first. All the animals cheer. \"Slow and steady wins the race,\" says the fox.",
      ar: "استيقظ الأرنب وصاح: «يا إلهي! أين السلحفاة؟». ركض بأقصى سرعته، لكن الوقت كان قد فات. عبرت السلحفاة الخط أولًا، وهتفت كل الحيوانات. وقال الثعلب: «البطيء الثابت يفوز بالسباق»." }
  ],
  glossary: [
    { w: "hare", ar: "أرنب برّي", pos: "noun" },
    { w: "field", ar: "حقل", pos: "noun" },
    { w: "proud", ar: "فخور", pos: "adjective" },
    { w: "tortoise", ar: "سلحفاة", pos: "noun" },
    { w: "race", ar: "سباق", pos: "noun" },
    { w: "judge", ar: "حَكَم", pos: "noun" },
    { w: "asleep", ar: "نائم", pos: "adjective" },
    { w: "pass", ar: "يتجاوز / يمرّ بجانب", pos: "verb" },
    { w: "cheer", ar: "يهتف فرحًا", pos: "verb" },
    { w: "steady", ar: "ثابت / مستمر", pos: "adjective" }
  ],
  qs: [
    { q: "Why is the hare proud?", o: ["He is very big", "He runs very fast", "He is very old", "He has many friends"], a: 1, ex: "القصة تقول إن الأرنب يركض بسرعة كبيرة وهو فخور بساقيه." },
    { q: "What happens first in the race?", o: ["The hare sleeps under a tree", "The tortoise crosses the line", "The hare runs far ahead", "The fox says stop"], a: 2, ex: "بعد بداية السباق ركض الأرنب كالريح وصار بعيدًا، ثم نام بعد ذلك." },
    { q: "\"Soon he is asleep.\" What does asleep mean?", o: ["running", "sleeping", "eating", "singing"], a: 1, ex: "asleep تعني نائمًا: الأرنب أغمض عينيه ونام تحت الشجرة." },
    { q: "Who is the judge of the race?", o: ["The fox", "The tortoise", "A bird", "The hare"], a: 0, ex: "القصة تقول: The old fox is the judge." },
    { q: "What is the main idea of the story?", o: ["Fast animals always win", "Sleeping is good for you", "Slow and steady work wins", "Never race with a hare"], a: 2, ex: "فازت السلحفاة لأنها استمرت في المشي بثبات ولم تتوقف." }
  ],
  moral: "الصبر والثبات على العمل يغلبان السرعة مع الغرور والكسل."
});

/* 2 ── The Lion and the Mouse ────────────────────────────────── */
STORIES.push({
  id: "lion-mouse", lvl: "A1", d: 2, kind: "fable",
  title: "The Lion and the Mouse", ar: "الأسد والفأر",
  author: "Aesop", origin: "حكاية من حكايات إيسوب اليونانية",
  intro: "فأر صغير يوقظ أسدًا غاضبًا، ويعده بأن يساعده يومًا ما. هل يصدقه الأسد؟",
  paras: [
    { en: "A big lion sleeps under a tree. A little mouse runs near him. She runs over his nose! The lion wakes up. He is angry. He catches the mouse with his big paw.",
      ar: "ينام أسد كبير تحت شجرة. ويركض فأر صغير بالقرب منه، بل يركض فوق أنفه! يستيقظ الأسد غاضبًا، ويمسك الفأر بكفه الكبيرة." },
    { en: "\"Please, Mister Lion,\" says the mouse. \"Do not eat me. I am very small. Let me go. One day I can help you.\" The lion laughs. \"You? Help me? You are too small!\" But he opens his paw. The mouse runs away.",
      ar: "يقول الفأر: «أرجوك يا سيد أسد، لا تأكلني. أنا صغير جدًا. دعني أذهب، وفي يوم ما أستطيع أن أساعدك». يضحك الأسد: «أنت؟ تساعدني؟ أنت صغير جدًا!». لكنه يفتح كفه، ويهرب الفأر." },
    { en: "Some days later, the lion walks in the forest. He does not see the net. Some hunters put it there. The net falls on the lion. He cannot move. He pulls and pulls. The net is too strong.",
      ar: "بعد أيام، يمشي الأسد في الغابة. لا يرى الشبكة التي وضعها بعض الصيادين هناك. تسقط الشبكة على الأسد، فلا يستطيع الحركة. يشدّ ويشدّ، لكن الشبكة قوية جدًا." },
    { en: "The lion is afraid. He roars very loudly. \"Help! Help me!\" Far away, the little mouse hears him. \"That is my friend the lion,\" she says. She runs to him very fast.",
      ar: "يخاف الأسد ويزأر بصوت عالٍ: «النجدة! ساعدوني!». ومن بعيد، يسمعه الفأر الصغير ويقول: «هذا صديقي الأسد». ويركض إليه بسرعة كبيرة." },
    { en: "The mouse looks at the net. \"Do not worry,\" she says. \"I have small teeth. But they are sharp.\" She bites the net. She bites one rope, then two ropes. Soon there is a big hole. The lion is free!",
      ar: "ينظر الفأر إلى الشبكة ويقول: «لا تقلق. أسناني صغيرة، لكنها حادّة». يقضم الشبكة، حبلًا واحدًا ثم حبلين. وسرعان ما يصير فيها ثقب كبير، ويتحرر الأسد!" },
    { en: "The lion looks at the mouse. \"You are small,\" he says. \"But you are a great friend. Thank you.\" Now the lion and the mouse are friends. Small friends can do big things.",
      ar: "ينظر الأسد إلى الفأر ويقول: «أنت صغير، لكنك صديق عظيم. شكرًا لك». والآن صار الأسد والفأر صديقين. فالأصدقاء الصغار يستطيعون فعل أشياء كبيرة." }
  ],
  glossary: [
    { w: "mouse", ar: "فأر", pos: "noun" },
    { w: "paw", ar: "كفّ الحيوان", pos: "noun" },
    { w: "forest", ar: "غابة", pos: "noun" },
    { w: "net", ar: "شبكة", pos: "noun" },
    { w: "hunters", ar: "صيادون", pos: "noun" },
    { w: "roar", ar: "يزأر", pos: "verb" },
    { w: "sharp", ar: "حادّ", pos: "adjective" },
    { w: "bite", ar: "يعضّ / يقضم", pos: "verb" },
    { w: "rope", ar: "حبل", pos: "noun" },
    { w: "free", ar: "حرّ / طليق", pos: "adjective" }
  ],
  qs: [
    { q: "Where does the lion sleep?", o: ["In a cave", "Under a tree", "Near a river", "In a net"], a: 1, ex: "الجملة الأولى: A big lion sleeps under a tree." },
    { q: "What does the mouse say to the lion?", o: ["Eat me now", "You are too small", "One day I can help you", "I am your teacher"], a: 2, ex: "قال الفأر: One day I can help you، أي أستطيع أن أساعدك يومًا ما." },
    { q: "What happens after the net falls on the lion?", o: ["The mouse runs over his nose", "The lion roars for help", "The lion opens his paw", "The lion laughs at the mouse"], a: 1, ex: "بعد سقوط الشبكة خاف الأسد وزأر طالبًا المساعدة." },
    { q: "The mouse says her teeth are sharp. What does sharp mean?", o: ["very soft", "very big", "can cut things", "very old"], a: 2, ex: "sharp تعني حادًا، أي يستطيع أن يقطع الأشياء مثل الحبال." },
    { q: "What is the main idea of the story?", o: ["Lions are always angry", "Small friends can do big things", "Never sleep under a tree", "Mice are afraid of lions"], a: 1, ex: "الجملة الأخيرة تلخص الفكرة: الأصدقاء الصغار يفعلون أشياء كبيرة." }
  ],
  moral: "لا تحتقر أحدًا لصغره، فقد يكون هو من ينقذك يومًا ما."
});

/* 3 ── The Boy Who Cried Wolf ────────────────────────────────── */
STORIES.push({
  id: "boy-wolf", lvl: "A1", d: 3, kind: "fable",
  title: "The Boy Who Cried Wolf", ar: "الولد الذي صاح: ذئب",
  author: "Aesop", origin: "حكاية من حكايات إيسوب اليونانية",
  intro: "ولد يرعى الخراف يشعر بالملل، فيقرر أن يلعب لعبة خطيرة مع أهل قريته.",
  paras: [
    { en: "A boy lived in a small village. His job was easy. Every day he took the sheep up the hill. He sat and watched them. But the boy was bored. \"Nothing happens here,\" he said.",
      ar: "عاش ولد في قرية صغيرة، وكان عمله سهلًا. كل يوم يأخذ الخراف إلى أعلى التل، ويجلس يراقبها. لكن الولد كان يشعر بالملل، فقال: «لا يحدث شيء هنا»." },
    { en: "One day he had an idea. He ran down the hill. \"Wolf! Wolf!\" he shouted. \"A wolf is here! It wants my sheep!\" The village people were afraid. They took sticks and ran up the hill.",
      ar: "وفي يوم من الأيام خطرت له فكرة. ركض إلى أسفل التل وصاح: «ذئب! ذئب! هناك ذئب هنا! يريد خرافي!». خاف أهل القرية، فأخذوا العصي وركضوا إلى أعلى التل." },
    { en: "But there was no wolf. The sheep ate grass quietly. The boy laughed and laughed. \"I tricked you!\" he said. The people were angry. \"This is not funny,\" they said. They went back home.",
      ar: "لكن لم يكن هناك ذئب. كانت الخراف تأكل العشب بهدوء. ضحك الولد كثيرًا وقال: «خدعتكم!». غضب الناس وقالوا: «هذا ليس مضحكًا». ثم عادوا إلى بيوتهم." },
    { en: "The next day, the boy did the same thing. \"Wolf! Wolf!\" The people ran up the hill again. Again there was no wolf. The boy laughed. Now the people were very angry. \"We do not believe you,\" they said.",
      ar: "وفي اليوم التالي فعل الولد الشيء نفسه: «ذئب! ذئب!». ركض الناس إلى أعلى التل مرة أخرى، ومرة أخرى لم يكن هناك ذئب. ضحك الولد. والآن غضب الناس كثيرًا وقالوا: «نحن لا نصدقك»." },
    { en: "On the third day, a real wolf came. It was big and grey. It ran at the sheep. The boy was very afraid. He ran down the hill. \"Wolf! Wolf! Please help me!\" he shouted.",
      ar: "وفي اليوم الثالث جاء ذئب حقيقي، كبير ورمادي. هجم على الخراف. خاف الولد كثيرًا، وركض إلى أسفل التل وهو يصيح: «ذئب! ذئب! أرجوكم ساعدوني!»." },
    { en: "But nobody came. \"It is another trick,\" the people said. The wolf took the sheep. The boy sat on the hill and cried. He learned a hard lesson that day. Nobody believes a liar, even when he tells the truth.",
      ar: "لكن لم يأتِ أحد. قال الناس: «إنها خدعة أخرى». أخذ الذئب الخراف، وجلس الولد على التل يبكي. تعلم درسًا قاسيًا في ذلك اليوم: لا أحد يصدق الكذاب، حتى عندما يقول الحقيقة." }
  ],
  glossary: [
    { w: "village", ar: "قرية", pos: "noun" },
    { w: "sheep", ar: "خروف / خراف", pos: "noun" },
    { w: "hill", ar: "تلّ", pos: "noun" },
    { w: "bored", ar: "يشعر بالملل", pos: "adjective" },
    { w: "shout", ar: "يصيح", pos: "verb" },
    { w: "sticks", ar: "عصي", pos: "noun" },
    { w: "trick", ar: "يخدع", pos: "verb" },
    { w: "believe", ar: "يصدّق", pos: "verb" },
    { w: "liar", ar: "كذّاب", pos: "noun" },
    { w: "truth", ar: "الحقيقة", pos: "noun" }
  ],
  qs: [
    { q: "What was the boy's job?", o: ["To sell bread", "To watch the sheep", "To hunt wolves", "To build houses"], a: 1, ex: "كان الولد يأخذ الخراف إلى التل ويراقبها كل يوم." },
    { q: "Why did the boy shout Wolf the first time?", o: ["He saw a real wolf", "He was bored and wanted fun", "He wanted new sheep", "He lost his stick"], a: 1, ex: "كان الولد يشعر بالملل، فخطرت له فكرة الخدعة." },
    { q: "What happened on the third day?", o: ["The boy laughed at the people", "The people came with sticks", "A real wolf came", "The boy went home"], a: 2, ex: "في اليوم الثالث جاء ذئب حقيقي كبير ورمادي." },
    { q: "\"I tricked you!\" What does tricked mean?", o: ["helped you", "made you believe a lie", "gave you money", "found you"], a: 1, ex: "tricked تعني خدع: جعل الناس يصدقون كذبة." },
    { q: "What is the lesson of the story?", o: ["Wolves are dangerous", "Sheep need a big hill", "People do not believe a liar", "Shouting is a good game"], a: 2, ex: "الجملة الأخيرة: لا أحد يصدق الكذاب حتى عندما يقول الحقيقة." }
  ],
  moral: "من يكذب مرارًا يفقد ثقة الناس، فلا يصدقونه حتى عندما يصدق."
});

/* 4 ── The Ant and the Grasshopper ───────────────────────────── */
STORIES.push({
  id: "ant-grasshopper", lvl: "A1", d: 4, kind: "fable",
  title: "The Ant and the Grasshopper", ar: "النملة والجندب",
  author: "Aesop", origin: "حكاية من حكايات إيسوب اليونانية",
  intro: "نملة تعمل بجد في الصيف، وجندب يغني ويضحك عليها. من منهما سيكون على حق عندما يأتي الشتاء؟",
  paras: [
    { en: "It was summer. The sun was hot. The days were long. A small ant worked all day. She carried corn to her house. She carried it grain by grain. It was hard work, but she did not stop.",
      ar: "كان الصيف، والشمس حارة، والأيام طويلة. عملت نملة صغيرة طوال اليوم. كانت تحمل الذرة إلى بيتها، حبة حبة. كان عملًا شاقًا، لكنها لم تتوقف." },
    { en: "A grasshopper sat in the grass. He sang all day. He played music and jumped. He saw the ant. \"Why do you work so hard?\" he asked. \"Come and sing with me! The summer is long.\"",
      ar: "وجلس جندب في العشب يغني طوال اليوم، يعزف الموسيقى ويقفز. رأى النملة فسألها: «لماذا تعملين بجد هكذا؟ تعالي وغنّي معي! الصيف طويل»." },
    { en: "The ant did not stop. \"Winter comes after summer,\" she said. \"In winter there is no food. I need food for the cold days. You need food too.\" The grasshopper laughed. \"Winter is far away!\" he said. Then he sang again.",
      ar: "لم تتوقف النملة وقالت: «الشتاء يأتي بعد الصيف. وفي الشتاء لا يوجد طعام. أحتاج طعامًا للأيام الباردة، وأنت تحتاجه أيضًا». ضحك الجندب وقال: «الشتاء بعيد!». ثم عاد يغني." },
    { en: "The summer ended. The leaves fell from the trees. Then the winter came. Snow covered the ground. There was no grass and no corn. The wind was very cold.",
      ar: "انتهى الصيف، وسقطت أوراق الشجر. ثم جاء الشتاء، وغطى الثلج الأرض. لم يعد هناك عشب ولا ذرة، وكانت الريح باردة جدًا." },
    { en: "The grasshopper was hungry and cold. He did not have a house. He did not have food. He went to the ant's house. \"Please give me some food,\" he said. \"I am so hungry.\"",
      ar: "كان الجندب جائعًا وباردًا. لم يكن له بيت، ولم يكن عنده طعام. ذهب إلى بيت النملة وقال: «أرجوكِ أعطيني بعض الطعام. أنا جائع جدًا»." },
    { en: "The ant looked at him. \"What did you do all summer?\" she asked. \"I sang,\" said the grasshopper. \"Then you can dance now,\" said the ant. But she was kind. She gave him some corn. \"Next summer, work first,\" she said. The grasshopper never forgot that winter.",
      ar: "نظرت إليه النملة وسألته: «ماذا فعلت طوال الصيف؟». قال الجندب: «كنت أغني». قالت النملة: «إذن يمكنك أن ترقص الآن». لكنها كانت طيبة، فأعطته بعض الذرة وقالت: «في الصيف القادم، اعمل أولًا». ولم ينسَ الجندب ذلك الشتاء أبدًا." }
  ],
  glossary: [
    { w: "summer", ar: "الصيف", pos: "noun" },
    { w: "ant", ar: "نملة", pos: "noun" },
    { w: "carry (carried)", ar: "يحمل", pos: "verb" },
    { w: "corn", ar: "ذرة", pos: "noun" },
    { w: "grasshopper", ar: "جندب", pos: "noun" },
    { w: "winter", ar: "الشتاء", pos: "noun" },
    { w: "leaves", ar: "أوراق الشجر", pos: "noun" },
    { w: "snow", ar: "ثلج", pos: "noun" },
    { w: "hungry", ar: "جائع", pos: "adjective" },
    { w: "kind", ar: "طيّب", pos: "adjective" }
  ],
  qs: [
    { q: "What did the ant do all summer?", o: ["She sang songs", "She carried corn to her house", "She slept in the grass", "She played music"], a: 1, ex: "الفقرة الأولى: كانت النملة تحمل الذرة إلى بيتها طوال اليوم." },
    { q: "What did the grasshopper say to the ant?", o: ["Winter is far away", "Please work with me", "I have a big house", "The snow is cold"], a: 0, ex: "ضحك الجندب وقال: Winter is far away!" },
    { q: "What happened after the leaves fell?", o: ["The ant sang", "The grasshopper worked", "The winter came", "The summer started"], a: 2, ex: "الفقرة الرابعة: سقطت الأوراق ثم جاء الشتاء وغطى الثلج الأرض." },
    { q: "\"Snow covered the ground.\" What is the ground?", o: ["the sky", "the land under your feet", "a kind of food", "a small house"], a: 1, ex: "ground تعني الأرض التي تحت قدميك، وقد غطاها الثلج." },
    { q: "What is the lesson of the story?", o: ["Singing is bad", "Prepare today for tomorrow", "Winter is better than summer", "Ants are stronger than grasshoppers"], a: 1, ex: "النملة استعدت للشتاء في الصيف، أما الجندب فلم يستعد فجاع." }
  ],
  moral: "من يجتهد ويستعد اليوم لا يخاف من الغد."
});

/* 5 ── The Crow and the Pitcher ──────────────────────────────── */
STORIES.push({
  id: "crow-pitcher", lvl: "A1", d: 5, kind: "fable",
  title: "The Crow and the Pitcher", ar: "الغراب والإبريق",
  author: "Aesop", origin: "حكاية من حكايات إيسوب اليونانية",
  intro: "غراب عطشان يجد ماء في قاع إبريق، لكن منقاره لا يصل إليه. كيف سيشرب؟",
  paras: [
    { en: "It was a very hot day. A black crow flew over the fields. He was thirsty. He looked for water everywhere. But the rivers were dry. The small lakes were dry too. The crow was tired and sad.",
      ar: "كان يومًا حارًا جدًا. طار غراب أسود فوق الحقول، وكان عطشان. بحث عن الماء في كل مكان، لكن الأنهار كانت جافة، والبحيرات الصغيرة جافة أيضًا. كان الغراب متعبًا وحزينًا." },
    { en: "Then he saw something near a farm. It was a tall pitcher. The crow flew down. He looked inside. There was water at the bottom! But the pitcher had a long, thin neck. His beak could not reach the water.",
      ar: "ثم رأى شيئًا بالقرب من مزرعة. كان إبريقًا طويلًا. نزل الغراب ونظر داخله، فوجد ماء في القاع! لكن الإبريق كان له عنق طويل ورفيع، ولم يستطع منقاره أن يصل إلى الماء." },
    { en: "The crow tried again and again. He pushed the pitcher. It was too heavy. He tried to break it. It was too strong. \"I need that water,\" he said. \"But how?\" He sat down and thought.",
      ar: "حاول الغراب مرة بعد مرة. دفع الإبريق، فكان ثقيلًا جدًا. حاول أن يكسره، فكان قويًا جدًا. قال: «أحتاج إلى ذلك الماء، لكن كيف؟». ثم جلس يفكر." },
    { en: "Then the crow saw some small stones on the ground. He had an idea. He picked up one stone with his beak. He dropped it into the pitcher. Plop! The water moved up a little.",
      ar: "ثم رأى الغراب بعض الحجارة الصغيرة على الأرض، فخطرت له فكرة. التقط حجرًا بمنقاره، وأسقطه في الإبريق. طق! فارتفع الماء قليلًا." },
    { en: "The crow picked up another stone. Plop! Then another one. Plop! He worked for a long time. Stone after stone went into the pitcher. And the water came up, higher and higher.",
      ar: "التقط الغراب حجرًا آخر. طق! ثم حجرًا آخر. طق! عمل وقتًا طويلًا. حجر بعد حجر يدخل الإبريق، والماء يرتفع أعلى وأعلى." },
    { en: "Finally, the water was near the top. The crow put his beak in the pitcher. He drank and drank. The water was cool and sweet. \"Small steps can solve big problems,\" he said happily. Then he flew away, strong again.",
      ar: "وأخيرًا صار الماء قريبًا من الفوهة. وضع الغراب منقاره في الإبريق، وشرب وشرب. كان الماء باردًا وحلوًا. قال بسعادة: «الخطوات الصغيرة تحل المشكلات الكبيرة». ثم طار بعيدًا وقد عادت إليه قوته." }
  ],
  glossary: [
    { w: "crow", ar: "غراب", pos: "noun" },
    { w: "thirsty", ar: "عطشان", pos: "adjective" },
    { w: "dry", ar: "جاف", pos: "adjective" },
    { w: "pitcher", ar: "إبريق", pos: "noun" },
    { w: "neck", ar: "عنق / رقبة", pos: "noun" },
    { w: "beak", ar: "منقار", pos: "noun" },
    { w: "reach", ar: "يصل إلى", pos: "verb" },
    { w: "heavy", ar: "ثقيل", pos: "adjective" },
    { w: "stones", ar: "حجارة", pos: "noun" },
    { w: "drop", ar: "يُسقط", pos: "verb" }
  ],
  qs: [
    { q: "Why was the crow sad at the start?", o: ["He lost his nest", "He could not find water", "He was very cold", "He could not fly"], a: 1, ex: "الأنهار والبحيرات كانت جافة، فلم يجد الغراب ماء." },
    { q: "Why could the crow not drink at first?", o: ["The water was hot", "The pitcher was empty", "The pitcher's neck was long and thin", "The farmer was there"], a: 2, ex: "كان للإبريق عنق طويل ورفيع، فلم يصل منقاره إلى الماء." },
    { q: "What did the crow do before he used the stones?", o: ["He drank the water", "He pushed the pitcher", "He flew away", "He called his friends"], a: 1, ex: "دفع الغراب الإبريق وحاول كسره قبل أن يفكر في الحجارة." },
    { q: "\"It was too heavy.\" What does heavy mean?", o: ["very light", "hard to lift", "very small", "full of water"], a: 1, ex: "heavy تعني ثقيلًا، أي صعب الرفع أو الدفع." },
    { q: "What is the main idea of the story?", o: ["Crows cannot drink water", "Stones are good food", "Think, and small steps solve big problems", "Always look for a river"], a: 2, ex: "الغراب فكر ثم حل المشكلة حجرًا بعد حجر، خطوة صغيرة بعد أخرى." }
  ],
  moral: "التفكير والصبر والخطوات الصغيرة تحل أصعب المشكلات."
});

/* 6 ── The Little Red Hen ────────────────────────────────────── */
STORIES.push({
  id: "little-red-hen", lvl: "A1", d: 6, kind: "fairy",
  title: "The Little Red Hen", ar: "الدجاجة الحمراء الصغيرة",
  author: "Folk tale", origin: "حكاية شعبية قديمة من التراث الإنجليزي",
  intro: "دجاجة صغيرة تجد حبوب قمح وتطلب المساعدة من أصدقائها الكسالى، فماذا يحدث عندما ينضج الخبز؟",
  paras: [
    { en: "A little red hen lived on a farm. She had three friends. They were a cat, a dog, and a duck. The hen worked hard. Her friends did not like work. They liked to sleep in the sun.",
      ar: "عاشت دجاجة حمراء صغيرة في مزرعة. كان لها ثلاثة أصدقاء: قطة وكلب وبطة. كانت الدجاجة تعمل بجد، أما أصدقاؤها فلم يحبوا العمل، بل أحبوا النوم في الشمس." },
    { en: "One day the hen found some wheat seeds. \"Who wants to help me plant these seeds?\" she asked. \"Not I,\" said the cat. \"Not I,\" said the dog. \"Not I,\" said the duck. \"Then I plant them myself,\" said the hen. And she did.",
      ar: "وفي يوم من الأيام وجدت الدجاجة بعض حبوب القمح. سألت: «من يريد أن يساعدني في زراعة هذه الحبوب؟». قالت القطة: «ليس أنا». قال الكلب: «ليس أنا». قالت البطة: «ليس أنا». قالت الدجاجة: «إذن أزرعها بنفسي». وهذا ما فعلته." },
    { en: "The wheat grew tall and yellow. \"Who wants to help me cut the wheat?\" asked the hen. \"Not I,\" said the cat. \"Not I,\" said the dog. \"Not I,\" said the duck. So the hen cut the wheat alone. Then she took it to the mill for flour.",
      ar: "نما القمح طويلًا وأصفر. سألت الدجاجة: «من يريد أن يساعدني في حصاد القمح؟». قالت القطة: «ليس أنا». قال الكلب: «ليس أنا». قالت البطة: «ليس أنا». فحصدت الدجاجة القمح وحدها، ثم أخذته إلى الطاحونة ليصير دقيقًا." },
    { en: "Now the hen had flour. \"Who wants to help me make bread?\" she asked. \"Not I,\" said the cat. \"Not I,\" said the dog. \"Not I,\" said the duck. So the hen made the bread alone. Soon the kitchen smelled wonderful.",
      ar: "والآن صار عند الدجاجة دقيق. سألت: «من يريد أن يساعدني في صنع الخبز؟». قالت القطة: «ليس أنا». قال الكلب: «ليس أنا». قالت البطة: «ليس أنا». فصنعت الدجاجة الخبز وحدها، وسرعان ما فاحت في المطبخ رائحة رائعة." },
    { en: "The bread was hot and brown. The three friends came to the kitchen. \"Who wants to help me eat this bread?\" asked the hen. \"I do!\" said the cat. \"I do!\" said the dog. \"I do!\" said the duck.",
      ar: "كان الخبز ساخنًا وبنيًا. جاء الأصدقاء الثلاثة إلى المطبخ. سألت الدجاجة: «من يريد أن يساعدني في أكل هذا الخبز؟». قالت القطة: «أنا!». قال الكلب: «أنا!». قالت البطة: «أنا!»." },
    { en: "\"No,\" said the little red hen. \"You did not plant the wheat. You did not cut it. You did not make the bread. So I eat it myself.\" And she ate it with her chicks. The next day, her friends helped her with everything.",
      ar: "قالت الدجاجة الحمراء الصغيرة: «لا. أنتم لم تزرعوا القمح، ولم تحصدوه، ولم تصنعوا الخبز. إذن آكله بنفسي». وأكلته مع صغارها. وفي اليوم التالي، ساعدها أصدقاؤها في كل شيء." }
  ],
  glossary: [
    { w: "hen", ar: "دجاجة", pos: "noun" },
    { w: "farm", ar: "مزرعة", pos: "noun" },
    { w: "wheat", ar: "قمح", pos: "noun" },
    { w: "seeds", ar: "بذور / حبوب", pos: "noun" },
    { w: "plant", ar: "يزرع", pos: "verb" },
    { w: "grow (grew)", ar: "ينمو", pos: "verb" },
    { w: "mill", ar: "طاحونة", pos: "noun" },
    { w: "flour", ar: "دقيق / طحين", pos: "noun" },
    { w: "kitchen", ar: "مطبخ", pos: "noun" },
    { w: "chicks", ar: "كتاكيت / صغار الدجاج", pos: "noun" }
  ],
  qs: [
    { q: "Who were the hen's friends?", o: ["A cow, a horse, and a pig", "A cat, a dog, and a duck", "A fox, a wolf, and a bear", "Three little chicks"], a: 1, ex: "الفقرة الأولى: كان أصدقاؤها قطة وكلبًا وبطة." },
    { q: "What did the hen do first?", o: ["She made the bread", "She cut the wheat", "She planted the seeds", "She went to the mill"], a: 2, ex: "أول عمل كان زراعة الحبوب، ثم الحصاد، ثم الطاحونة، ثم الخبز." },
    { q: "What did the friends say every time the hen asked for help with the work?", o: ["Not I", "I do", "Yes, please", "Maybe later"], a: 0, ex: "في كل مرة كان الجواب: Not I، أي ليس أنا." },
    { q: "The hen took the wheat to the mill for flour. What is flour?", o: ["a kind of flower", "a soft powder for making bread", "a hot drink", "a small animal"], a: 1, ex: "flour هو الدقيق، وهو مسحوق ناعم يُصنع منه الخبز." },
    { q: "What is the lesson of the story?", o: ["Bread is good with friends", "Cats and dogs are lazy", "If you do not work, you do not share the reward", "Hens are good cooks"], a: 2, ex: "الدجاجة عملت وحدها، فأكلت الخبز وحدها مع صغارها." }
  ],
  moral: "من لا يشارك في العمل لا يستحق أن يشارك في ثمرته."
});

/* 7 ── The Three Little Pigs ─────────────────────────────────── */
STORIES.push({
  id: "three-pigs", lvl: "A1", d: 7, kind: "fairy",
  title: "The Three Little Pigs", ar: "الخنازير الثلاثة الصغيرة",
  author: "Folk tale", origin: "حكاية شعبية إنجليزية قديمة",
  intro: "ثلاثة إخوة يبنون ثلاثة بيوت مختلفة، وذئب جائع يريد أن يدخل. أي بيت سيصمد؟",
  paras: [
    { en: "Once there were three little pigs. They were brothers. One day their mother said, \"You are big now. Go and build your own houses. But be careful. A wolf lives in the forest.\" The three pigs said goodbye and left.",
      ar: "كان هناك ثلاثة خنازير صغيرة، وكانوا إخوة. وفي يوم قالت لهم أمهم: «لقد كبرتم الآن. اذهبوا وابنوا بيوتكم. لكن احذروا، فهناك ذئب يعيش في الغابة». ودّع الخنازير الثلاثة أمهم ورحلوا." },
    { en: "The first pig was lazy. He built a house of straw. It took one hour. The second pig built a house of sticks. It took one day. The third pig worked hard. He built a house of bricks. It took many weeks. His brothers laughed at him.",
      ar: "كان الخنزير الأول كسولًا، فبنى بيتًا من القش في ساعة واحدة. وبنى الخنزير الثاني بيتًا من العصي في يوم واحد. أما الخنزير الثالث فعمل بجد، وبنى بيتًا من الطوب في أسابيع كثيرة. وضحك عليه أخواه." },
    { en: "Soon the wolf came to the straw house. \"Little pig, let me in!\" he said. \"No, no!\" said the pig. \"Then I blow your house down!\" The wolf blew and blew. The straw house fell down. The pig ran to his brother's house.",
      ar: "وسرعان ما جاء الذئب إلى بيت القش وقال: «أيها الخنزير الصغير، دعني أدخل!». قال الخنزير: «لا، لا!». قال الذئب: «إذن أنفخ بيتك فيسقط!». نفخ الذئب ونفخ، فسقط بيت القش. وركض الخنزير إلى بيت أخيه." },
    { en: "The wolf came to the house of sticks. \"Little pigs, let me in!\" \"No, no!\" said the two pigs. The wolf blew and blew. The house of sticks fell down too. The two pigs ran to the brick house.",
      ar: "جاء الذئب إلى بيت العصي: «أيها الخنزيران الصغيران، دعاني أدخل!». قال الخنزيران: «لا، لا!». نفخ الذئب ونفخ، فسقط بيت العصي أيضًا. وركض الخنزيران إلى بيت الطوب." },
    { en: "The wolf came to the brick house. He blew and blew. But the house did not move. The wolf was very angry. \"I know,\" he said. \"I can go down the chimney!\" He climbed up on the roof.",
      ar: "جاء الذئب إلى بيت الطوب. نفخ ونفخ، لكن البيت لم يتحرك. غضب الذئب كثيرًا وقال: «عرفت! أستطيع أن أنزل من المدخنة!». وتسلق إلى السطح." },
    { en: "But the third pig was clever. He put a big pot of water on the fire. The wolf came down the chimney. Splash! He fell into the hot water. \"Ouch!\" He jumped out and ran away. He never came back. The three pigs lived happily in the brick house.",
      ar: "لكن الخنزير الثالث كان ذكيًا. وضع قدرًا كبيرًا من الماء على النار. نزل الذئب من المدخنة. طَشّ! سقط في الماء الساخن. «آخ!». قفز وهرب بعيدًا، ولم يعد أبدًا. وعاش الخنازير الثلاثة بسعادة في بيت الطوب." }
  ],
  glossary: [
    { w: "build", ar: "يبني", pos: "verb" },
    { w: "careful", ar: "حذر", pos: "adjective" },
    { w: "lazy", ar: "كسول", pos: "adjective" },
    { w: "straw", ar: "قشّ", pos: "noun" },
    { w: "bricks", ar: "طوب", pos: "noun" },
    { w: "blow (blew)", ar: "ينفخ", pos: "verb" },
    { w: "chimney", ar: "مدخنة", pos: "noun" },
    { w: "roof", ar: "سطح البيت", pos: "noun" },
    { w: "clever", ar: "ذكي", pos: "adjective" },
    { w: "pot", ar: "قِدر", pos: "noun" }
  ],
  qs: [
    { q: "What did the mother pig tell her sons?", o: ["Stay at home", "Build your own houses", "Go to the wolf", "Sleep all day"], a: 1, ex: "قالت الأم: Go and build your own houses." },
    { q: "Which house took many weeks to build?", o: ["The straw house", "The stick house", "The brick house", "The mother's house"], a: 2, ex: "الخنزير الثالث بنى بيته من الطوب في أسابيع كثيرة." },
    { q: "What happened after the straw house fell down?", o: ["The wolf went home", "The first pig ran to his brother's house", "The wolf climbed the roof", "The pigs built a new house"], a: 1, ex: "بعد سقوط بيت القش ركض الخنزير الأول إلى بيت أخيه." },
    { q: "\"The third pig was clever.\" What does clever mean?", o: ["lazy", "smart", "small", "afraid"], a: 1, ex: "clever تعني ذكيًا: الخنزير الثالث خطط ووضع القدر على النار." },
    { q: "What is the main idea of the story?", o: ["Wolves like hot water", "Hard work and good planning keep you safe", "Straw is better than bricks", "Brothers always fight"], a: 1, ex: "البيت القوي الذي بُني بجد هو الذي حمى الإخوة الثلاثة." }
  ],
  moral: "العمل الجاد والتخطيط الجيد يحميانك عندما تأتي المشكلات."
});

/* 8 ── Goldilocks and the Three Bears ────────────────────────── */
STORIES.push({
  id: "goldilocks", lvl: "A1", d: 8, kind: "fairy",
  title: "Goldilocks and the Three Bears", ar: "غولديلوكس والدببة الثلاثة",
  author: "Folk tale", origin: "حكاية شعبية إنجليزية من القرن التاسع عشر",
  intro: "بنت ذات شعر ذهبي تدخل بيتًا فارغًا في الغابة، وتجرب كل ما فيه. لكن لمن هذا البيت؟",
  paras: [
    { en: "Three bears lived in a house in the forest. Father Bear was big. Baby Bear was small. Mother Bear was in the middle. One morning, Mother Bear made porridge. It was too hot. \"Let's walk in the forest,\" said Father Bear. \"The porridge cools while we walk.\"",
      ar: "عاشت ثلاثة دببة في بيت في الغابة. كان الدب الأب كبيرًا، والدب الصغير صغيرًا، والدبة الأم بينهما في الحجم. وفي صباح يوم، صنعت الدبة الأم عصيدة، لكنها كانت ساخنة جدًا. قال الدب الأب: «هيا نمشي في الغابة. العصيدة تبرد ونحن نمشي»." },
    { en: "A little girl walked in the forest. Her name was Goldilocks. She had long golden hair. She saw the house. She knocked on the door. Nobody answered. The door was open, so she went inside.",
      ar: "مشت بنت صغيرة في الغابة. كان اسمها غولديلوكس، وكان شعرها طويلًا ذهبيًا. رأت البيت وطرقت الباب، فلم يجب أحد. كان الباب مفتوحًا، فدخلت." },
    { en: "Goldilocks saw three bowls of porridge. She tasted the big bowl. \"Too hot!\" She tasted the middle bowl. \"Too cold!\" She tasted the small bowl. \"Just right!\" And she ate it all.",
      ar: "رأت غولديلوكس ثلاثة أوعية من العصيدة. تذوقت الوعاء الكبير: «ساخن جدًا!». تذوقت الوعاء الأوسط: «بارد جدًا!». تذوقت الوعاء الصغير: «مناسب تمامًا!». وأكلته كله." },
    { en: "Then she saw three chairs. The big chair was too hard. The middle chair was too soft. The small chair was just right. But Goldilocks was too heavy. Crack! The small chair broke. \"Oh no,\" she said.",
      ar: "ثم رأت ثلاثة كراسي. كان الكرسي الكبير قاسيًا جدًا، والكرسي الأوسط طريًا جدًا، والكرسي الصغير مناسبًا تمامًا. لكن غولديلوكس كانت ثقيلة جدًا. طَقّ! انكسر الكرسي الصغير. قالت: «يا إلهي»." },
    { en: "Goldilocks was tired. She went upstairs. There were three beds. The big bed was too hard. The middle bed was too soft. The small bed was just right. She lay down and fell asleep.",
      ar: "كانت غولديلوكس متعبة، فصعدت إلى الطابق العلوي. كانت هناك ثلاثة أسرّة. السرير الكبير قاسٍ جدًا، والسرير الأوسط طري جدًا، والسرير الصغير مناسب تمامًا. استلقت عليه ونامت." },
    { en: "The bears came home. \"Somebody ate my porridge!\" said Father Bear. \"Somebody sat in my chair!\" said Mother Bear. \"Somebody broke my chair!\" cried Baby Bear. They went upstairs. \"Somebody is in my bed!\" said Baby Bear.",
      ar: "عادت الدببة إلى البيت. قال الدب الأب: «أحدهم أكل عصيدتي!». قالت الدبة الأم: «أحدهم جلس على كرسيي!». صاح الدب الصغير باكيًا: «أحدهم كسر كرسيي!». صعدوا إلى الطابق العلوي. قال الدب الصغير: «أحدهم في سريري!»." },
    { en: "Goldilocks woke up. She saw three bears. She screamed and jumped out of the window. She ran home as fast as she could. She never went into a strange house again.",
      ar: "استيقظت غولديلوكس فرأت ثلاثة دببة. صرخت وقفزت من النافذة، وركضت إلى بيتها بأقصى سرعتها. ولم تدخل بيتًا غريبًا مرة أخرى أبدًا." }
  ],
  glossary: [
    { w: "bears", ar: "دببة", pos: "noun" },
    { w: "porridge", ar: "عصيدة (طعام من الشوفان)", pos: "noun" },
    { w: "golden", ar: "ذهبي", pos: "adjective" },
    { w: "knock", ar: "يطرق الباب", pos: "verb" },
    { w: "bowl", ar: "وعاء / صحن عميق", pos: "noun" },
    { w: "taste", ar: "يتذوق", pos: "verb" },
    { w: "soft", ar: "طري / ناعم", pos: "adjective" },
    { w: "break (broke)", ar: "يكسر", pos: "verb" },
    { w: "upstairs", ar: "في الطابق العلوي", pos: "adverb" },
    { w: "scream", ar: "يصرخ", pos: "verb" }
  ],
  qs: [
    { q: "Why did the bears go for a walk?", o: ["They wanted to find Goldilocks", "The porridge was too hot", "It was a sunny day", "Baby Bear was sad"], a: 1, ex: "كانت العصيدة ساخنة جدًا، فخرجوا حتى تبرد." },
    { q: "How did Goldilocks get into the house?", o: ["She broke a window", "She had a key", "The door was open", "Baby Bear let her in"], a: 2, ex: "الباب كان مفتوحًا، فدخلت غولديلوكس." },
    { q: "What did Goldilocks do after she ate the porridge?", o: ["She went to sleep", "She sat on the chairs", "She ran home", "She knocked on the door"], a: 1, ex: "بعد أكل العصيدة رأت الكراسي الثلاثة وجلست عليها." },
    { q: "\"The middle chair was too soft.\" What is the opposite of soft?", o: ["hard", "hot", "small", "long"], a: 0, ex: "soft تعني طريًا، وعكسها hard أي قاسٍ." },
    { q: "What is the lesson of the story?", o: ["Bears are dangerous", "Do not go into other people's houses without asking", "Porridge is a good breakfast", "Always sleep in a small bed"], a: 1, ex: "دخلت غولديلوكس بيتًا ليس لها وأكلت وكسرت ونامت دون إذن." }
  ],
  moral: "لا تدخل بيت غيرك ولا تستخدم أشياءه دون إذن."
});

/* 9 ── The Ugly Duckling ─────────────────────────────────────── */
STORIES.push({
  id: "ugly-duckling", lvl: "A1", d: 9, kind: "fairy",
  title: "The Ugly Duckling", ar: "البطة القبيحة",
  author: "Hans Christian Andersen", origin: "حكاية للكاتب الدنماركي هانس كريستيان أندرسن (١٨٤٣)",
  intro: "طائر رمادي يولد بين فراخ البط الصفراء، فيسخر منه الجميع. لكن هل هو حقًا بطة؟",
  paras: [
    { en: "On a farm, a mother duck sat on her eggs. One by one, the eggs opened. Out came five yellow ducklings. But the last egg was big. It opened late. Out came a big, grey bird. He was not pretty like the others.",
      ar: "في مزرعة، جلست بطة أم على بيضها. وواحدة بعد واحدة، تفتحت البيضات، فخرجت منها خمسة فراخ صفراء. لكن البيضة الأخيرة كانت كبيرة، وتفتحت متأخرة. خرج منها طائر كبير رمادي، لم يكن جميلًا مثل الآخرين." },
    { en: "The other ducklings laughed at him. \"You are ugly!\" they said. The hens and the cat laughed too. Nobody wanted to play with him. Only his mother was kind. But even she was sad. \"He is different,\" she said.",
      ar: "ضحك عليه الفراخ الآخرون وقالوا: «أنت قبيح!». وضحكت الدجاجات والقطة أيضًا. لم يرد أحد أن يلعب معه. وحدها أمه كانت طيبة، لكن حتى هي كانت حزينة وقالت: «إنه مختلف»." },
    { en: "The ugly duckling was very unhappy. One night he left the farm. He walked to a big lake. He lived there alone. The days were long and cold. Then the winter came. The lake turned to ice. The duckling was cold and hungry.",
      ar: "كان الفرخ القبيح تعيسًا جدًا. وفي ليلة من الليالي ترك المزرعة، ومشى إلى بحيرة كبيرة، وعاش هناك وحيدًا. كانت الأيام طويلة وباردة. ثم جاء الشتاء، وتحولت البحيرة إلى جليد. وكان الفرخ باردًا وجائعًا." },
    { en: "A kind farmer found him in the snow. He took the bird home. The farmer's children gave him food. Slowly, the winter ended. The sun came back. The ice on the lake melted. The bird felt strong again.",
      ar: "وجده مزارع طيب في الثلج، فأخذ الطائر إلى بيته. أعطاه أطفال المزارع طعامًا. وببطء انتهى الشتاء، وعادت الشمس، وذاب الجليد على البحيرة. وشعر الطائر بالقوة من جديد." },
    { en: "In spring, he went back to the lake. He saw three beautiful white birds. They were swans. \"They are so beautiful,\" he thought. \"They do not want an ugly bird like me.\" But he swam to them anyway.",
      ar: "في الربيع عاد إلى البحيرة، فرأى ثلاثة طيور بيضاء جميلة. كانت بجعات. فكّر في نفسه: «إنها جميلة جدًا. لن تريد طائرًا قبيحًا مثلي». لكنه سبح نحوها على أي حال." },
    { en: "The swans did not laugh. They came to him happily. He looked down at the water. He saw a beautiful white swan. It was him! He was not a duck. He was always a swan. Now he was the most beautiful bird on the lake.",
      ar: "لم تضحك البجعات، بل جاءت إليه بسعادة. نظر إلى الماء تحته، فرأى بجعة بيضاء جميلة. كانت هو! لم يكن بطة، بل كان بجعة دائمًا. والآن صار أجمل طائر في البحيرة." }
  ],
  glossary: [
    { w: "eggs", ar: "بيض", pos: "noun" },
    { w: "ducklings", ar: "فراخ البط", pos: "noun" },
    { w: "grey", ar: "رمادي", pos: "adjective" },
    { w: "ugly", ar: "قبيح", pos: "adjective" },
    { w: "different", ar: "مختلف", pos: "adjective" },
    { w: "lake", ar: "بحيرة", pos: "noun" },
    { w: "ice", ar: "جليد", pos: "noun" },
    { w: "melt", ar: "يذوب", pos: "verb" },
    { w: "spring", ar: "الربيع", pos: "noun" },
    { w: "swans", ar: "بجع", pos: "noun" }
  ],
  qs: [
    { q: "How was the last bird different?", o: ["He was small and yellow", "He was big and grey", "He could not walk", "He had no mother"], a: 1, ex: "خرج من البيضة الأخيرة طائر كبير رمادي، لا صغير أصفر." },
    { q: "What happened after the duckling left the farm?", o: ["He met the swans", "He went to a big lake", "The farmer found him", "The eggs opened"], a: 1, ex: "بعد أن ترك المزرعة مشى إلى بحيرة كبيرة وعاش هناك وحيدًا." },
    { q: "Who helped the bird in the winter?", o: ["His mother", "The hens", "A kind farmer", "The swans"], a: 2, ex: "وجده مزارع طيب في الثلج وأخذه إلى بيته." },
    { q: "\"The ice on the lake melted.\" What does melted mean?", o: ["became water", "became hard", "became bigger", "became white"], a: 0, ex: "melted تعني ذاب: الجليد صار ماء عندما عادت الشمس." },
    { q: "What is the main idea of the story?", o: ["Ducks are better than swans", "Winter is long and cold", "Do not judge by looks, everyone has a place", "Never leave your farm"], a: 2, ex: "الطائر الذي سخر منه الجميع كان بجعة جميلة." }
  ],
  moral: "لا تحكم على أحد من شكله، فكل واحد له مكانه وجماله الخاص."
});

/* 10 ── The Goose That Laid the Golden Eggs ──────────────────── */
STORIES.push({
  id: "golden-goose", lvl: "A1", d: 10, kind: "fable",
  title: "The Goose That Laid the Golden Eggs", ar: "الإوزة التي تبيض ذهبًا",
  author: "Aesop", origin: "حكاية من حكايات إيسوب اليونانية",
  intro: "مزارع فقير يجد في عش إوزته بيضة من ذهب، ثم أخرى وأخرى. فهل يكتفي بما عنده؟",
  paras: [
    { en: "A poor farmer lived with his wife. They had a small house, a garden, and one goose. Every day they worked in the garden. They did not have much money. But they were happy together.",
      ar: "عاش مزارع فقير مع زوجته. كان عندهما بيت صغير وحديقة وإوزة واحدة. كل يوم يعملان في الحديقة. لم يكن عندهما مال كثير، لكنهما كانا سعيدين معًا." },
    { en: "One morning, the farmer went to the goose. He looked in her nest. There was an egg. But it was not a normal egg. It was yellow and heavy. It was made of gold! The farmer ran to his wife. \"Look! A golden egg!\"",
      ar: "وفي صباح يوم، ذهب المزارع إلى الإوزة ونظر في عشها، فوجد بيضة. لكنها لم تكن بيضة عادية، بل كانت صفراء وثقيلة. كانت من الذهب! ركض المزارع إلى زوجته: «انظري! بيضة ذهبية!»." },
    { en: "They sold the egg in the town. They got a lot of money. The next day, there was another golden egg. And the next day, another one. Every day the goose laid one golden egg. Soon the farmer and his wife were rich.",
      ar: "باعا البيضة في المدينة، وحصلا على مال كثير. وفي اليوم التالي كانت هناك بيضة ذهبية أخرى، وفي اليوم الذي بعده بيضة أخرى. كل يوم تبيض الإوزة بيضة ذهبية واحدة. وسرعان ما صار المزارع وزوجته أغنياء." },
    { en: "They bought a big house. They bought new clothes. But the farmer was not happy. \"One egg a day is too slow,\" he said. \"I want all the gold now.\" His wife agreed. \"The gold is inside the goose. Let's open her and take it all!\"",
      ar: "اشتريا بيتًا كبيرًا، واشتريا ملابس جديدة. لكن المزارع لم يكن سعيدًا. قال: «بيضة واحدة في اليوم بطيء جدًا. أريد كل الذهب الآن». وافقته زوجته: «الذهب داخل الإوزة. هيا نفتحها ونأخذه كله!»." },
    { en: "So they killed the goose. They looked inside. But there was no gold. Inside, the goose was like every other goose. There were no eggs at all. The farmer and his wife looked at each other. They said nothing.",
      ar: "فذبحا الإوزة ونظرا داخلها. لكن لم يكن هناك ذهب. كانت الإوزة من الداخل مثل أي إوزة أخرى، ولا بيض فيها أبدًا. نظر المزارع وزوجته أحدهما إلى الآخر، ولم يقولا شيئًا." },
    { en: "Now there were no more golden eggs. Not one egg a day. Not one egg a year. Soon the money was gone. The big house was cold. The farmer was poor again. \"We had enough,\" he said sadly. \"But we wanted more. And now we have nothing.\"",
      ar: "والآن لم يعد هناك بيض ذهبي. لا بيضة في اليوم، ولا بيضة في السنة. وسرعان ما نفد المال، وصار البيت الكبير باردًا. عاد المزارع فقيرًا من جديد. قال بحزن: «كان عندنا ما يكفي، لكننا أردنا المزيد. والآن ليس عندنا شيء»." }
  ],
  glossary: [
    { w: "poor", ar: "فقير", pos: "adjective" },
    { w: "farmer", ar: "مزارع", pos: "noun" },
    { w: "goose", ar: "إوزة", pos: "noun" },
    { w: "nest", ar: "عشّ", pos: "noun" },
    { w: "gold", ar: "ذهب", pos: "noun" },
    { w: "sell (sold)", ar: "يبيع", pos: "verb" },
    { w: "rich", ar: "غني", pos: "adjective" },
    { w: "buy (bought)", ar: "يشتري", pos: "verb" },
    { w: "agree", ar: "يوافق", pos: "verb" },
    { w: "enough", ar: "كافٍ / ما يكفي", pos: "adjective" }
  ],
  qs: [
    { q: "What did the farmer find in the nest?", o: ["A small bird", "A golden egg", "A bag of money", "A white feather"], a: 1, ex: "الفقرة الثانية: وجد في العش بيضة من الذهب." },
    { q: "How often did the goose lay a golden egg?", o: ["Once a year", "Once a week", "Once a day", "Twice a day"], a: 2, ex: "القصة تقول: Every day the goose laid one golden egg." },
    { q: "What did the farmer and his wife do first with the money?", o: ["They killed the goose", "They bought a big house", "They gave it away", "They built a garden"], a: 1, ex: "أول ما فعلاه بالمال هو شراء بيت كبير وملابس جديدة." },
    { q: "\"Soon the farmer and his wife were rich.\" What does rich mean?", o: ["very sad", "very old", "having a lot of money", "having a lot of geese"], a: 2, ex: "rich تعني غنيًا، أي عنده مال كثير." },
    { q: "What is the lesson of the story?", o: ["Geese are good pets", "Be happy with enough, do not be greedy", "Sell your eggs in the town", "Big houses are cold"], a: 1, ex: "الطمع جعلهما يقتلان الإوزة فخسرا كل شيء." }
  ],
  moral: "الطمع يضيّع ما في اليد، فاقنع بما يكفيك."
});
