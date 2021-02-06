
// Game stats
State.variables.reputation = 0;
State.variables.playerKnowledge = {poetry: 0, industry: 0, astronomy: 0};

// Generate characters

// Choose one of an array
var randomChoice = function(vals) {
	return vals[Math.floor(Math.random() * vals.length)];
};

// Names to draw from
let firstNames = ["Arabella", "Bianca", "Carlos", "Dorian", "Ellery", "Fra.",
                  "Gregory", "Harlowe", "Irina", "Xavier", "Yskander", "Zenia"];
let lastNames = ["Archer", "Brookhaven", "Croix", "Delamer", "Evermoore", 
                 "Fitzparn", "Sutch", "Tremont", "Ulianov", "Van Otten"];

State.variables.characters = [];
// Generate one character with knowledge 1-3 per topic
let id = 0;
for (let topic in State.variables.playerKnowledge) {
  for (let i=1; i<=3; i++) {
    let firstName = randomChoice(firstNames);
    let lastName = randomChoice(lastNames);
    let char = {id: id, name: firstName + " " + lastName,
                poetry: 0, industry: 0, astronomy: 0};
    char[topic] = i;
    State.variables.characters.push(char);
    id++;
  }
}

// Conversation topics
State.variables.conversationTopics = {
  "poetry": [ "the new book of praise verse by Miss Causewell",
              "the recitations at Madame Bautan's salon",
              "Miss Causewell's previous volume, which was banned by the Censor"],
  "industry": ["the engine factory that recently opened by the Long Bridge",
               "the new railway line being proposed to Draundle",
               "the explosion at the shipyards"],
  "astronomy": ["the new red star in the night sky", 
                "the latest theories about the star from Imperial University",
                "how Professor Hix, the court astronomer, has not been seen in some time"]
}

// Set up the storylets
// ==========================================================================
StoryManager.storylets["Conversation"] = {
    name: "Conversation",
    tags: ["circulating"],
    generate: function*() {
        for (let i in State.variables.characters) {
            let character = State.variables.characters[i];
            let storylet = {
                passage: "Conversation",
                description: "Talk to " + character.name,
                priority: 1,
                character: character
                
            }
            yield storylet;
        }
    }
};

StoryManager.storylets["Buttonholed"] = {
    name: "Buttonholed",
    tags: ["circulating"],
    generate: function*() {
        if (Math.random() < 0.2) {
            let char = randomChoice(State.variables.characters);
            yield {
                passage: "Being approached",
                description: "You see " + char.name + " approaching you.",
                interrupt: true,
                character: char
            };
        }
    }
};

StoryManager.storylets["Conversation topic"] = {
    name: "Conversation topic",
    tags: ["during conversation"],
    generate: function() {
        let storylets = [];
        for (let topic in State.variables.playerKnowledge) {
            if (State.variables.playerKnowledge[topic] > 0 |
                State.variables.talkingTo[topic] > 0)
                storylets.push({
                    passage: "Conversation topic",
                    description: "Talk about " + topic,
                    priority: 1,
                    topic: topic
                })
        }
        return storylets;
    }
};

StoryManager.storylets["Asked to leave"] = {
  name: "Asked to leave",
  tags: ["circulating"],
  generate: function*
  () {
      if (State.variables.reputation < -1 && Math.random() < 0.5) {
          yield {
              passage: "Asked to leave",
              description: "You see a footman approaching you.",
              interrupt: true
          };
      }
  }
};

StoryManager.storylets["Seeing the duchess"] = {
  name: "Seeing the duchess",
  tags: ["circulating"],
  generate: function*() {
      if (State.variables.reputation > 6 && Math.random() < 0.5) {
          yield {
              passage: "Invited to see the Duchess",
              description: "You see a footman approaching you.",
              interrupt: true
          }
      }
  }
};