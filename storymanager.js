
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

StoryManager.getStorylets = 
	function(n=null, tag=null, selection="ordered", respect_interrupt=true) {
	/* 
		Get n storylets, prioritizing the highest-priority ones first.

		n: if not null, return at most n storylets
		tag: Only get storylets matching this tag
		respect_interrupt: if true, any interrupt storylet overrides n and priority

	*/
	let allStorylets;
	allStorylets = this.getAllStorylets(tag);
	

	// Check for interruptions
	if (respect_interrupt) {
		let interruptions = [];
		for (let storylet of allStorylets) 
			if (storylet.interrupt) interruptions.push(storylet);
		if (interruptions.length > 0) {
			interruptions.sort((a, b) => b.priority - a.priority);
			return [interruptions[0]];
		}
	}

	// Return n or the max
	if (n != null) {
		n = Math.min(n, allStorylets.length);
		if (n == 0) return [];
	}
	else n = allStorylets.length;

	let selectedStorylets;
	if (selection == "ordered") 
		selectedStorylets = this.sortByPriority(allStorylets, n);
	else if (selection == "weighted")
		selectedStorylets = this.weightedRandom(allStorylets, n);

	return selectedStorylets;
}

// Get storylets strictly by priority
StoryManager.sortByPriority = function(allStorylets, n) {
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

// Get storylets via weighted random choice
StoryManager.weightedRandom = function(allStorylets, n) {
	let selectedStorylets = [];
	let sum, counter, index, rand;
	while (selectedStorylets.length < n) {
		sum = allStorylets.reduce((a, x) => a + x.priority, 0);
		counter = 0;
		rand = Math.random() * sum;
		for (let i=0; i<allStorylets.length; i++) {
			if (counter + allStorylets[i].priority > rand)  {
				selectedStorylets.push(allStorylets.splice(i, 1)[0]);
				break;
			}
			counter += allStorylets[i].priority;
		}
	}
	return selectedStorylets;
}



// Set up macros
// ---------------------------------------------------------------
Macro.add("getStoryletLinks", {
	handler: function() {
		let n, tag, selection;
		[n=null, tag=null, selection="ordered"] = this.args;
		State.temporary.nextStorylets = StoryManager.getStorylets(n, tag, selection);
		$(this.output).wiki(`\
		<<for _storylet range _nextStorylets>> \
			<<capture _storylet>> \
				[[_storylet.description|_storylet.passage][$currentStorylet=_storylet]]<br>
			<</capture>> \
		<</for>> \
		`)
	}
});

Macro.add("linkToNextStorylet", {
	handler: function() {
		let text, tag, selection;
		[text, tag=null, selection="weighted"] = this.args;
		State.temporary.nextStorylet = StoryManager.getStorylets(1, tag, selection)[0];
		$(this.output).wiki(`<<capture _nextStorylet>>[[${text}|_nextStorylet.passage][$currentStorylet=_nextStorylet]]<</capture>>`);
	}
});

window.SM = StoryManager;