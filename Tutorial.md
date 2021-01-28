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
<<set $talkingTo = $payload.character>>
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
                payload: {character: character},
                priority: 0
            }
            storylets.push(storylet);
        }
        return storylets;
    }
};

```
