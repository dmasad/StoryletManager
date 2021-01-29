# StoryManager Tutorial

*Very rough tutorial intended to introduce the StoryManager core functionality as I develop it*.

One thing that dynamic storylets are good for is when you want a to write one basic structure for an interaction that will play out differently when bound to different variables. 

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
We know the `Conversation` passage is going to be an entrypoint into a storylet, so the first thing we need to do is get who the player is having this conversation with, stored in the `$payload` variable.

Every realized storylet comes with some data attached that will fill in its specifics (in Max Kreminski's terminology, the storylet is instantiated by binding some data to it). By default, StoryManager passes this data via the $payload variable. Note that this is a global variable, meaning that it holds the payload relevant for the current storylet only.

Now we need to create some data we'll be able to bind to the storylet: so let's create the characters. To make it easier to write more complicated game-world logic in JavaScript later on, we'll do this in pure JavaScript in the `:: Story JavaScript [script]` passage:

```
:: Story JavaScript [script]

State.variables.characters = [
    {name: "Arabella Armstrong"},
    {name: "Blake Brookhaven"},
    {name: "Claudio Croix"}
]
```

Finally, we'll create the storylet generator. This is a function returning the list of potential storylets. In this case there should be three: one conversation per character. This also goes in the story-level JavaScript.

```javascript
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
                character: character,
                priority: 0
            }
            storylets.push(storylet);
        }
        return storylets;
    }
};
```
This is the core functionality, so we'll go over it in detail. `StoryManager.storylets` is the object that holds the potential storylets. The key `"Conversation"` is mostly there for readability (and potentially to make it easier to remove defunct storylets, but this API might change in the future). The associated value is the storylet object, with the properties:
* `name`: Human-readable name for the storylet; kind of redundant with the key, and mostly there in case we need it at some point
* `tags`: List of tags. When looking for possible storylets, we'll be able to restrict only to ones matching a certain tag; for example
* `generate`: This is the most important property: this will be a function that returns a list of potential storylets bound to data. Note that the `generate` function doesn't take any argumments. It does however have access to the full current game state via the `State` variable, and especially `State.variables`. 
 
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
> tweego storymanager.js storymanager-widgets.tw examples\at_the_party.tw -o at_the_party.html
```

### Adding interruptions

Is it even a real party if you aren't buttonholed by another guest at some point or another? In many games you'll want to allow some storylets to override the other options and require the player to engage with them now. We do this via a storylet that has the `interrupt==true` property.

(**Note:** At the moment, if there is more than one interrupting storylet only the first one is fired, regardless of priority or anything else. TODO: Incorporate some sort of interrupt ranking, queue etc.)

Let's have a 20% chance of another random guest coming up and talking to the player. We add this storylet to the StoryManager:

```javascript
StoryManager.storylets["Buttonholed"] = {
    name: "Buttonholed",
    tags: [],
    generate: function() {
        if (Math.random() < 0.2) {
            let char = randomChoice(State.variables.characters);
            return [{
                passage: "Being approached",
                description: "You see " + char.name + " approaching you.",
                interrupt: true,
                character: char
            }]
        }
    }
}
```

You'll notice that this storylet leads to the same `Conversation` passage as the previous "Conversation" storylet. The only difference is that since this one has the `interrupt` property, the player will have no other option but to engage with them. 

However, maybe we want to give the player a choice here: engage the buttonholer in conversation, or avoid it -- at the risk of snubbing them. To do that, we could create a new passage:

```
:: Being approached
$currentStorylet.character.name is coming toward you to talk. You can [[talk to them | Conversation]], or risk snubbing them by [[trying to get away | Start]].
```

We have to be sure to change the `passage` in the `"Buttonholed"` storylet to this new passage as well. 