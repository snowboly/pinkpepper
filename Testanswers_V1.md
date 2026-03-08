#GENERAL
- After asking the question, the chat window crashes but the conversation gets stored and answered. 
- Do not list the sources matching after the answer. we dont need that (eg. Sources FSA waste management, guidance83% match)
- Lets change the pinkpepper chatbot icon. Make it like a funny pink pepper face and generate aliases. eg: PinkPepper Specialist: Anne, PinkPepper Specialist: Ryan, etc. Create 5 agent specialists with slighty different personalities ans tones. Randomize them per chat window but keep the same agent throughout the same conversation.
- Add stop button to stop the chat.
- how many questions i still have on the free tier? - It answered doesnt have any limit. It must know it is a pinkpepper agent.
- The all chats panel sometimes shows loading when the bot is thinking
- The chatbox is not lined up with the send button
- several times it show AI service temporarily unavailable due to rate limits and max usage (free tier on groq right now) Now regarding this matter, we should use Llama 3.1 8B → simple questions and Llama 3.3 70B → complex HACCP reasoning. I will also limit Free users to 10 question a day. we should cache repeated questions on redis (generic questions only). Message trimming. Max tokens limit (adapt to each tier daily "questions") -> Advise on this matter before implementing.
Architeture:
User Question
     ↓
Intent Router (tiny model)
     ↓
Easy → Cheap model
Medium → Mid model
Hard → Strong model
- The human reviews are not highlighted anywhere in the copy and thats what differentiates us from the competition. Devise a plan to show the users we do human doc reviews by specialists.



