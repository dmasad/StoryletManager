// Set up narrative model
// -----------------------------------------------------------------------

// Set up NPCs
// ------------------------------------------

var firstNames = {
	"m": ["William", "George", "Jose", "Kwame", "Vin", "Alexander", "Martin", "Daniel",
		  "Nicholas", "Sorin", "Vlad", "Matthew", "Octavius"],
    "f": ["Alice", "Bella", "Charlotte", "Doreen", "Francesca", "Willhelmina", "Xenia", 
    	  "Juliette", "Rosemary", "Margot"]
};

var lastNames = ["Abar", "Bridgewater", "Clarence", "Delmar", "Ellseworth", "Fox",
				"Williams", "Rose"];

var pronouns = {
	"m": {he: "he", his: "his", him: "him"},
	"f": {he: "she", his: "hers", him: "her"}
}

var nChars = 10;
State.variables.characters = [];
for (let id=0; id<nChars; id++) {
	let gender = randomChoice(["m", "f"]);
	let newPerson = {
		id: id,
		firstname: randomChoice(firstNames[gender]),
		lastname: randomChoice(lastNames),
		poetry: randomChoice([0, 0, 1, 1, 2]),
		gossip: randomChoice([0, 0, 1, 1, 2]),
		friendship: 0,
		romance: 0
	};
	for (let key in pronouns[gender]) newPerson[key] = pronouns[gender][key];
	State.variables.characters.push(newPerson);
}


// Set up storylets themselves
// ------------------------------------------
StoryManager.storylets["Dance"] = {
	name: "Dance",
	tags: ["interaction"],
	generate: function() {
		let storylets = [];
		if (State.variables.location != "Ballroom") return storylets;
		for (let id in State.variables.characters) {
			let char = State.variables.characters[id];
			if (char.romance >= 0) {
				let storylet = {
					passage: "DancingRoot",
					description: "Dance with " + char.firstname + " " + char.lastname,
					priority: 0,
					payload: {character: char}
				}
				storylets.push(storylet);
			}
		}
		return storylets;
	}
};


StoryManager.storylets["Conversation"] = {
	name: "Conversation",
	tags: ["interaction"],
	generate: function() {
		let storylets = [];
		if (State.variables.location != "Library") return storylets;
		for (let id in State.variables.characters) {
			let char = State.variables.characters[id];
			if (char.friendship >= 0) {
				let storylet = {
					passage: "ConversationRoot",
					description: "Talk with " + char.firstname + " " + char.lastname,
					priority: 0,
					payload: {character: char}
				}
				storylets.push(storylet);
			}
		}
		return storylets;
	}
};
