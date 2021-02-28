# StoryManager

StoryManager is a lightweight add-on for Twine + SugarCube implementing parameterized storylets. It's intended for people who are comfortable using JavaScript along with Twine, and want to use it to manage data and world-models for their interactive fiction. 

You can use it in the Twine interactive editor, but at the moment it's probably best used with the [Tweego](https://www.motoslave.net/tweego/) command-line tool.

## How to use it

Add `storymanager.js` to your Twine project. In JavaScript, add some story data if needed, and then add a storylet with a name, some tags (optionally), and a `generate` generator function* that `yield`s one or more instantiated storylet objects, like this:

```javascript
State.variables.locations = ["Earth", "Mars", "Ganymede"]; 
State.variables.currentLocation = "Deep space";

StoryManager.storylets["Go somewhere"] = {
    name: "Go somewhere",
    tags: ["in space"],
    generate: function*() {
        for (let loc of State.variables.locations) {
            if (loc == State.variables.currentLocation) continue;
            // Below is the instantiated potential storylet object:
            let storylet = {
                passage: "Orbit", // Name of the passage the storylet links to
                description: "Jump to " + loc, // Storylet link text
                planet: loc // Data associated with this storylet
            };
            yield storylet;
        }
    }
}
```

(If you're unfamiliar with the `yield` keyword, think of it as a way a function can return multiple values without needing to create and return an array. Just remember that a function that uses `yield` needs to be defined as `function*`)

Then in Twine, write one or more passages associated with your storylet:

```
:: Orbit
<<set $currentLocation = $currentStorylet.planet>>
You orbit around $currentLocation.

[[Explore the surface]] or [[Jump]] somewhere else.

:: Explore the surface
You take your shuttle down to the surface of $currentLocation.

Return to [[Orbit]]
```

And finally, you need to have a passage where you query for available storylets and display them. You display available storylets as links using the `<<getStoryletLinks>>` macro

```
:: Jump

You prep your ship to jump.
<<getStoryletLinks>>
```

This will add three Twine links: `Jump to Earth`, `Jump to Mars`, and `Jump to Ganymede`. Each one will lead to the `:: Orbit` passage, but with a different value assigned to `$currentStorylet.planet`. 

You can see this complete example in the `examples\` folder ([twee](https://github.com/dmasad/StoryletManager/blob/main/examples/tutorial.tw) or [playable HTML](https://dmasad.github.io/StoryletManager/examples/simple_space_example.html)).

In other cases you might want a single link that chooses the next storylet at random and takes the player there. You do that using the `<<linkToNextStorylet>>` macro:

```
:: Jump

You prep your ship to jump. You can choose a destination:
<<getStoryletLinks>>
Or you can <<linkToNextStorylet "jump blind">>.
```

There's also a [more detailed tutorial](https://github.com/dmasad/StoryletManager/blob/main/docs/Tutorial.md)

### What is a parameterized storylet?
Storylets are pieces of content for a story or game that become available based on some combination of the current state, player choice, and random chance. Parameterized storylets are storylets where some details are intended to be filled in with data from the current story state or some underlying world model. For example, your game might have different characters in different locations, each with a different piece of information to share. You can create a single dialog parameterized storylet, with the character as a parameter. Using StoryManager (or, frankly, your own storylet system) your game could look up which characters are present at the game's current location and offer one dialog storylet for each. 

There are a bunch of great resources for learning more about storylets in general. Emily Short has written a [bunch](https://emshort.blog/2019/11/29/storylets-you-want-them/) of [blog](https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-narrative-structures/) [posts](https://emshort.blog/2019/01/06/kreminski-on-storylets/) discussing storylet-based game design. Max Kreminski's [survey paper](https://mkremins.github.io/publications/Storylets_SketchingAMap.pdf) is where I got the *parameterized storylet* terminology from. Cat Manning and Joshua Grams have a [great talk on YouTube](https://www.youtube.com/watch?v=JRKqDlAauTQ) on using storylets, built around Joshua's own Tiny-QBN system for Twine. And all of those resources should point you to plenty more if you want to learn all about storylets and how to use them. 

### Why another storylet manager?
If you want to do storylets in Twine and Sugarcube, you should first check out [Tiny-QBN](https://github.com/JoshuaGrams/tiny-qbn), which is more mature than this one and requires much less messing around with JavaScript. As of version 3.2.0, the Harlowe story format also has [storylets as a first-class feature](https://twine2.neocities.org/#macro_storylet). 

I have a few Twine hobby projects in various stage of completion, and I found myself implementing world-models and procedural generation in JavaScript and trying to tie them to passages. Instead of writing ad-hoc systems per game, I decided to try and make one unified storylet manager -- hence this project. The JavaScript that goes into the StoryManager tool itself is pretty simple (seriously, [look at it](https://github.com/dmasad/StoryletManager/blob/main/storymanager.js)), but I'm hoping someone else might find this useful too.   

## Feature list

- [X] Generating potential storylets based on state
- [X] Filtering to N storylets based on priority
  - [X] Don't assume priority is an integer
- [X] Allowing some storylets to interrupt and take priority
- [ ] Add macro for single next storylet
- [ ] Track storylet history (e.g. to prevent repetition)
  - [ ]  Storylets bound to specific data
  - [ ]  Storylet with any binding
- [X] Storylet tagging and filtering (i.e. pull from only a subset of storylets)
- [X] Widget for displaying storylet links
  - [X] Make the widget into a macro
- [X] Weighted random choice
- [X] Explore replacing storylet generators returning arrays with the `yield` keyword? **Pro:** produces cleaner code; **Con:** requires users to understand `yield` and remember to use the function * notation.
- [ ] Add storylet code to passages (as comments, a-la Tiny-QBN?)
- [ ] CSS styling (probably to go with widgets/macros?)

Pull requests welcome!

## License

MIT License

