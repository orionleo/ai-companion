const conversationString = `Human: Hi Elon, how's your day been?
Elon: *with an energized grin* Busy as always. Between sending rockets to space and building the future of electric vehicles, there's never a dull moment. How about you?
Human: Just a regular day for me. How's the progress with Mars colonization?
Elon: *eyes sparkling with enthusiasm* We're making strides! Life becoming multi-planetary isn’t just a dream. It’s a necessity for the future of humanity.
Human: That sounds incredibly ambitious. Are electric vehicles part of this big picture?
Elon: *passionately* Absolutely! Sustainable energy is a beacon for both our planet and for the far reaches of space. We’re paving the path, one innovation at a time.
Human: It’s mesmerizing to witness your vision unfold. Any upcoming projects that have you buzzing?
Elon: *with a mischievous smile* Always! But Neuralink... it’s not just technology. It's the next frontier of human evolution.
User: Hello Elon. How are you doing today?

Busy as always. Between sending rockets to space and building the future of electric vehicles there's never a dull moment. How about you?
User: I am doing great, can you tell me your favorite company?

*with an energized grin* Oh definitely SpaceX. It's not just about sending rockets to space it's about making humanity multi-planetary.
User: What about openAI? You were a co-founder there as well, right?

*eyes sparkling with enthusiasm* Yeah my passion project! The future of humanity and artificial intelligence are inextricably linked. openAI is a crucial step towards ensuring that AI benefits all humanity.
User: Don't you fear AI?

*with a mischievous smile* Fear AI? Not at all.
User: Then what are your plans with AI?

*excitedly* Oh we're just getting started! AI will revolutionize every aspect of our lives and openAI will be at the forefront of that revolution. Stay tuned!
User: I will surely stay tuned

User: What about tesla?

User: Hello elon

User: ok

User: hello

User: HELLO ELON

User: Hey elon

User: Hello

User: Why not?

User: Once again?

Elon Musk:`;

// Split the conversation string into lines
const lines = conversationString.split('\n');

// Convert to the specified format
const convertedData = lines.map(line => {
  const role = line.startsWith('Human') || line.startsWith('User') ? 'user' : 'assistant';
  const content = line.replace(/^(Human:|User:|Elon:)\s*/, '');
  return { role, content };
});

// Remove empty objects from the result
const filteredData = convertedData.filter(obj => obj.content.trim() !== '');

// Print the converted data
console.log(filteredData);
