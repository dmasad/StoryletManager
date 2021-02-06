# StoryManager Tutorial

*Very rough tutorial intended to introduce the StoryManager core functionality as I develop it*.

## Basic Example

As a simple example, let's make a tiny game about attending a party. The player can only engage in one activity: talking to other guests. There will be different guests at the party, and each may want to talk about a different topic. 

In the simplest possible implementation, there is just one storylet: `conversation`. We need to set up three things: the parameterized passage that represents the entry-point into the storylet; a list of characters the player might talk to; and the storylet generator that goes into `StoryManager` itself.

First let's set up the basic Twine structure:

```
:: Start

You stand at the edge of the grand ballroom in the Duchess's palace.

:: Conversation
<<set $talkingTo = $currentStorylet.character>>
You make polite conversation with $talkingTo.name. <br>
[[Keep circulating | Start]]
```
We know the `Conversation` passage is going to be an entrypoint into a storylet, so the first thing we need to do is get who the player is having this conversation with, stored in the `$currentStorylet` variable.

Every realized storylet comes with some data attached that will fill in its specifics (in Max Kreminski's terminology, the storylet is instantiated by binding some data to it). By default, StoryManager passes this data via the `$currentStorylet` variable. Note that this is a global variable, meaning that it holds the information relevant for the current storylet only.

Now we need to create some data we'll be able to bind to the storylet: so let's create the characters. To make it easier to write more complicated game-world logic in JavaScript later on, we'll do this in pure JavaScript in the `:: Story JavaScript [script]` passage:

```
:: Story JavaScript [script]

State.variables.characters = [
    {name: "Arabella Armstrong"},
    {name: "Blake Brookhaven"},
    {name: "Claudio Croix"}
]
```

Finally, we'll create the storylet generator. This is a generator function yielding potential storylets. In this case there should be three: one conversation per character. This also goes in the story-level JavaScript.

```javascript
StoryManager.storylets["Conversation"] = {
    name: "Conversation",
    tags: [],
    generate: function*() {
        for (let i in State.variables.characters) {
            let character = State.variables.characters[i];
            let storylet = {
                passage: "Conversation",
                description: "Talk to " + character.name,
                character: character,
                priority: 0
            }
            yield storylet;
        }
    }
};
```
This is the core functionality, so we'll go over it in detail. `StoryManager.storylets` is the object that holds the potential storylets. The key `"Conversation"` is mostly there for readability (and potentially to make it easier to remove defunct storylets, but this API might change in the future). The associated value is the storylet object, with the properties:
* `name`: Human-readable name for the storylet; kind of redundant with the key, and mostly there in case we need it at some point
* `tags`: List of tags. When looking for possible storylets, we'll be able to restrict only to ones matching a certain tag; for example
* `generate`: This is the most important property: this will be a [generator function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators) that `yield`s potential storylets bound to data. (Don't forget to define the function with an asterisk as `function*`) Note that the `generate` function doesn't take any argumments. It does however have access to the full current game state via the `State` variable, and especially `State.variables`. 
 
This function should produce one possible conversation storylet per character. Storylets are yet *another* JavaScript object. The following storylet properties are generally required:
* `passage`: The name of the Twine passage associated with this storylet. When a link is created to the storylet, this will be the target passage.
* `description`: A short description to show the player about the storylet; by default, this will be the text shown as a link. In this example, it'll tell the player what they can do ("Talk to") and who with. This can be whatever text you want; for example, if you don't want players to know who they're talking to, the description could be something like "Talk to a guest".
* `priority`: A number indicating how important this storylet is. By default, when some subset of possible storylets are being selected, stories with higher `priority` will be chosen first. (**TODO:** At the moment, this is assumed to be an integer, but it probably shouldn't be).

Finally, we get to the custom properties. In this case there's just one:

* `character`: This is the specific character that'll be bound to this storylet instance. 

Now that we have the storylet generator, all that's left to do is to query it in the appropriate Twine passage, and then do something with each possible storylet. We can get the array of available instantiated storylets with `window.SM.getStorylets()`. 

One typical thing to do with this list is create a link associated with each possible storylet for the player to choose from. We can do it like this:

```
:: Start
You stand at the edge of the grand ballroom in the Duchess's palace.<br>
<<set _possibleStorylets = window.SM.getStorylets()>>
<<for _story range _possibleStorylets>>
    <<capture _story>>
    [[_storylet.description|_storylet.passage][$currentStorylet=_storylet]]<br>
    <</capture>>
<</for>>
```

This creates one link per available storylet. Each link will have the storylet description as its text, link to the storylet's passage, and when selected will story the storylet's data in the `$currentStorylet` variable, so that the storylet passage itself can access it. This pattern is (expected to be) common enough that there's a widget for it: `<<ShowStoryletLinks>>`. (**TODO:** Make this a macro). We may also not want to show *all* the available storylets. When there are just three guests it isn't so bad, but if the party has five, or ten, or more NPCs, giving the player the entire list will get overwhelming fast. We can randomly choose a subset, to emulate how people randomly circulate during the party. Instead, maybe we want to choose only some number of storylets to display. We can do this by passing a number to `getStorylets`indicating the maximum number of storylets to get. Storylets are selected in order of priority, so that the list is filled with higher-priority storylets first.

#### Putting it all together

The full Twine file should now look like this:

```
:: StoryTitle
At the Duchess's Party

:: StoryData
{
        "ifid": "BE18C022-A213-466C-8DD1-DCCD5CB1DF48"
}

:: Story JavaScript [script]
Config.passages.nobr = true; // Deal with linebreaks.

State.variables.characters = [
    {name: "Arabella Armstrong"},
    {name: "Blake Brookhaven"},
    {name: "Claudio Croix"}
]

StoryManager.storylets["Conversation"] = {
    name: "Conversation",
    tags: [],
    generate: function() {
        let storylets = [];
        for (let i in State.variables.characters) {
            let character = State.variables.characters[i];
            let storylet = {
                passage: "Conversation",
                description: "Talk to " + character.name,
                priority: 0,
                character: character
                
            }
            storylets.push(storylet);
        }
        return storylets;
    }
};

:: Start
You stand at the edge of the grand ballroom in the Duchess's palace.<br>
<<set _possibleStories = window.SM.getStorylets(3)>>
<<ShowStoryletLinks _possibleStories>>


:: Conversation
<<set $talkingTo = $currentStorylet.character>>
You make polite conversation with $talkingTo.name. <br>
[[Keep circulating | Start]]
```

To compile this with Tweego, run:
```
> tweego storymanager.js storymanager-widgets.tw examples\tutorial.tw -o tutorial.html
```

## Adding interruptions

Is it even a real party if you aren't buttonholed by another guest at some point or another? In many games you'll want to allow some storylets to override the other options and require the player to engage with them now. We do this via a storylet that has the `interrupt: true` property.

(**Note:** At the moment, if there is more than one interrupting storylet only the first one is fired, regardless of priority or anything else. TODO: Incorporate some sort of interrupt ranking, queue etc.)

Let's have a 20% chance of another random guest coming up and talking to the player. We add this storylet to the StoryManager:

```javascript
StoryManager.storylets["Buttonholed"] = {
    name: "Buttonholed",
    tags: [],
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
}
```

You'll notice that this storylet leads to the same `Conversation` passage as the previous "Conversation" storylet. The only difference is that since this one has the `interrupt` property, the player will have no other option but to engage with them. 

However, maybe we want to give the player a choice here: engage the buttonholer in conversation, or avoid it -- at the risk of snubbing them. To do that, we could create a new passage:

```
:: Being approached
$currentStorylet.character.name is coming toward you to talk.<br>
You can [[talk to them | Conversation]], or risk snubbing them by [[trying to get away | Start]].
```

We have to be sure to change the `passage` in the `"Buttonholed"` storylet to this new passage as well. 

This also demonstrates how regular Twine links can be used alongside storylets. Since the `$currentStorylet` variable was set when entering the Buttonholed / Being approached storylet, its `character` property is still available to the `Conversation` passage, if the player chooses to go that route.

(In a more complete game, you'd want to add some code to impose a social consequence for snubbing someone.)

## Using tags

We probably want to add some content to the conversations the player can have. One way to do this is the traditional Twine way: have the `Conversation` passage link to several other passages, each relating to something the player might say, possibly determined in part by some property of the character they are talking to. Storylets offer another way to do it. Different conversation topics may themselves be storylets, which only become available when the player is already engaged in a conversation. 

#### Sidebar: Game Mechanics

Now is a good time to pause and think about game mechanics, and what this game is about. Let's have the protagonist be an imposter, who has somehow ended up in this high-society party they have no business being at. The player is going to need to figure out how to blend in -- which means picking up information from some conversations they can turn around and immediately use in others. Not only does this provide a (hopefully) interesting mechanic, it lets the player unlock plot or worldbuilding elements as they advance in the game.

We'll create three topics of conversation, each of which has three levels of knowledge. Each character at the party will have a favored topic, and some level of knowledge about it. The game will also track the player character's knowledge, which starts at 0. When an NPC knows more than the protagonist about a topic, the protagonist gains knowledge, but not reputation. When they can tell someone else something new, their reputation goes up.

#### Back to tags

To use storylets for conversation topics as well, we're now going to want two kinds of storylets that are accessible in different contexts: one for starting conversations with other characters; the other for conversation topics. One option is to add a state variable that's set when a conversation starts and cleared when it ends, and have the "Conversation" and "Buttonholed" storylet generators check them. But a simpler option is to give each type of storylet a **tag**, and then in the appropriate context only generate storylets with the tag appropriate for that context.

We'll create two tags: `"circulating"` for things that can happen while the protagonist is circulating in the party, and `"during conversation"` for things that can happen while- well you get it. First we'll update the two existing storylets:

```javascript
StoryManager.storylets["Conversation"] = {
    name: "Conversation",
    tags: ["circulating"],
    // ... etc
}

StoryManager.storylets["Buttonholed"] = {
    name: "Buttonholed",
    tags: ["circulating"],
    // ...etc
}
```

We also need to update our world model to account for this mechanic: we need to track the protagonist's knowledge, and update the characters to account for their favorite topics and level of knowledge. 

```javascript
State.variables.playerKnowledge = {poetry: 0, industry: 0, astronomy: 0};
State.variables.reputation = 0;
// For initial testing purposes, let's make each one an expert in a different topic

State.variables.characters = [
    {
        name: "Arabella Armstrong",
        poetry: 3, industry: 0, astronomy: 0
    },
    {
        name: "Blake Brookhaven",
        poetry: 0, industry: 3, astronomy: 0
    },
    {
        name: "Claudio Croix",
        poetry: 0, industry: 0, astronomy: 3
    }
]
```

Finally, we can create the new storylet that checks if either the protagonist or their conversation partner knows anything about a topic:

```javascript
StoryManager.storylets["Conversation topic"] = {
    name: "Conversation topic",
    tags: ["during conversation"],
    generate: function*() {
        for (let topic in State.variables.playerKnowledge) {
            if (State.variables.playerKnowledge[topic] > 0 |
                State.variables.talkingTo[topic] > 0)
                yield {
                    passage: "Conversation topic",
                    description: "Talk about " + topic,
                    priority: 0,
                    topic: topic
                };
        }
    }
};
```
(Notice that the `generate` function here assumes that there's already a character assigned to `$talkingTo`)

And we'll create the corresponding storylet passage, which will also implement the game logic:

```
:: Conversation topic
<<set $topic = $currentStorylet.topic>>
<<if $playerKnowledge[$topic] < $talkingTo[$topic] >>
<<set $playerKnowledge[$topic] = $playerKnowledge[$topic] + 1>>
(They tell you about $topic) (Knowledge of $topic goes up)
<<elseif $playerKnowledge[$topic] == $talkingTo[$topic]>>
(You discuss $topic) (reputation goes up slightly)
<<set $reputation = $reputation + 1>>
<<elseif $playerKnowledge[$topic] > $talkingTo[$topic]>>
(You tell them about $topic) (reputation goes up)
<<set $reputation = $reputation + 2>>
<</if>><br><br>

[[Keep circulating | Start]]
```

You can view the full code in [examples\tutorial.tw](https://github.com/dmasad/StoryletManager/blob/main/examples/tutorial.tw) or [play it online](https://dmasad.github.io/StoryletManager/examples/tutorial.html).

## Finishing touches

So far we've covered all of StoryManager's core features. But let's go ahead and add some final details to our game. StoryManager is most useful when your game contains more data or logic implemented in straight JavaScript. Three people isn't very many at a party -- but more starts getting tiring to create by hand. Let's implement some simple procedural generation to populate our party. While we're at it, let's add some actual text content to the dialog topics. Finally, just as the protagonist gains knowledge from conversation, let's make sure NPC knowledge goes up too -- to make sure the player can't grind up their reputation by sharing the same fact with the same person over and over.

Note: As you start writing more JavaScript for your game, it might be worth it to split it off into its own `.js` file, to take advantage of syntax checking that text editors like VSCode or Sublime Text provide. Tweego can merge multiple JavaScript files together into your final Twee file.

Below is some simple code to generate some NPCs to populate the party. It makes sure there's one at each knowledge level per topic, to give the player an opportunity to explore all the conversation topics in full.

```javascript
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
```
To populate the conversations, we can also create some text to go along with each knowledge level:

```javascript
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
```

Then we also tweak the `:: Conversation topic` passage, to print the topic text as needed, and to increment the NPCs' knowledge.

```
:: Conversation topic
<<set $topic = $currentStorylet.topic>>
<<if $playerKnowledge[$topic] < $talkingTo[$topic] >>
$talkingTo.name tells you about <<print $conversationTopics[$topic][$playerKnowledge[$topic]]>>.
<<set $playerKnowledge[$topic] = $playerKnowledge[$topic] + 1>>
<<set $reputation = $reputation - 0.5>>
<<elseif $playerKnowledge[$topic] == $talkingTo[$topic]>>
You and $talkingTo.name discuss <<print $conversationTopics[$topic][$playerKnowledge[$topic]]>>.
<<set $reputation = $reputation + 1>>
<<elseif $playerKnowledge[$topic] > $talkingTo[$topic]>>
You tell $talkingTo.name about <<print $conversationTopics[$topic][$talkingTo[$topic]]>>. 
<<set $characters[$talkingTo.id][$topic] = $talkingTo[$topic] + 1>>
They listen intently, and seem impressed.
<<set $reputation = $reputation + 2>>
<</if>><br><br>
```

Notice that we added some reputation effects: being ignorant makes your reputation go down a bit; knowing things makes it go up. In the full source, we also updated the decision to `Snub` someone by having it lower your reputation. 

Finally, we can add two new storylets: a failure condition for if your reputation goes too low, and a success condition when it gets high enough.

```javascript

StoryManager.storylets["Asked to leave"] = {
  name: "Asked to leave",
  tags: ["circulating"],
  generate: function*() {
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
          };
      }
  }
};
```

And that's it! You can compile the final game (such as it is) with

```
> tweego storymanager.js storymanager-widgets.tw examples\duchess_party.js examples\duchess_party.tw -o examples\duchess_party.html
```
You can view the full code in the [examples folder](https://github.com/dmasad/StoryletManager/tree/main/examples) or [try playing it](https://dmasad.github.io/StoryletManager/examples/duchess_party.html).