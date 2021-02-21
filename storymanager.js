
// Set up the general narrative manager
// -----------------------------------------------------------------------
var StoryManager = {};
StoryManager.storylets = {};

StoryManager.getAllStorylets = function(tag=null) {
	let allStorylets = [];
	let storylet, storylets, boundStorylet;
	for (let key in this.storylets) {
		storylet = this.storylets[key];
		if (tag === null || ("tags" in storylet && storylet.tags.includes(tag))) {
			for (let boundStorylet of storylet.generate()) {
				//boundStorylet = storylets[i];
				if (!("priority" in boundStorylet)) boundStorylet.priority = 1;
				allStorylets.push(boundStorylet); 
			}
		}
	}
	return allStorylets;
}

StoryManager.getStorylets = function(n=null, tag=null, respect_interrupt=true) {
	/* 
		Get n storylets, prioritizing the highest-priority ones first.

		n: if not null, return at most n storylets
		tag: Only get storylets matching this tag
		respect_interrupt: if true, any interrupt storylet overrides n and priority

	*/
	let allStorylets;
	allStorylets = this.getAllStorylets(tag);
	

	// Check for interruptions
	// TODO: Handle more than one interruption
	if (respect_interrupt) {
		for (let i in allStorylets)
			if (allStorylets[i].interrupt) return [allStorylets[i]];
	}

	// Get n stories in priority order
	if (n != null) {
		n = Math.min(n, allStorylets.length);
		if (n == 0) return [];
	}
	else n = allStorylets.length;
	let selectedStorylets = [];

	// Select by strict priority; randomize among matching priority.
	let priorities = Array.from(new Set(allStorylets.map(x => x.priority)));
	priorities.sort((a, b) => b - a);

	let currentPriority = 0;
	while (selectedStorylets.length < n) {
		let priorityStorylets = allStorylets.filter(s => s.priority==priorities[currentPriority]);
		priorityStorylets.sort((a, b) => (Math.random() - Math.random()));
		let nAdd = Math.min(n - selectedStorylets.length, priorityStorylets.length);
		for (let i=0; i<nAdd; i++) selectedStorylets.push(priorityStorylets.pop());
		currentPriority++;
	}
	return selectedStorylets;
}

// Set up macros

Macro.add("getStoryletLinks", {
	handler: function() {
		let n, tag;
		[n=null, tag=null] = this.args;
		State.temporary.nextStorylets = StoryManager.getStorylets(n, tag);
		$(this.output).wiki(`
		<<for _storylet range _nextStorylets>> \
			<<capture _storylet>> \
				[[_storylet.description|_storylet.passage][$currentStorylet=_storylet]]<br>
			<</capture>> \
		<</for>> \
		`);
	}
})


window.SM = StoryManager;